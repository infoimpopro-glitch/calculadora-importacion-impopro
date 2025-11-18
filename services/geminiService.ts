import { GoogleGenAI, Type } from "@google/genai";
import type { HSSuggestion } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set. Please ensure it is configured.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const classificationSchema = {
    type: Type.OBJECT,
    properties: {
        sugerencias: {
            type: Type.ARRAY,
            description: "Una lista de 1 a 3 sugerencias de códigos arancelarios.",
            items: {
                type: Type.OBJECT,
                properties: {
                    codigo: {
                        type: Type.STRING,
                        description: "El código HS de 6 dígitos. Ejemplo: '6402.99'",
                    },
                    descripcion: {
                        type: Type.STRING,
                        description: "La descripción oficial del código HS en español.",
                    },
                    nivel_confianza: {
                        type: Type.STRING,
                        description: "Nivel de confianza de la sugerencia. Debe ser uno de: 'Alto', 'Medio', 'Bajo'.",
                        enum: ['Alto', 'Medio', 'Bajo'],
                    },
                },
                required: ["codigo", "descripcion", "nivel_confianza"],
            },
        },
    },
    required: ["sugerencias"],
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64.'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

export async function generateDescriptionFromImage(imageFile: File): Promise<string> {
    try {
        const model = "gemini-2.5-flash";
        const prompt = `Eres un experto en clasificación arancelaria e identificación de mercancías. A partir de la imagen, describe brevemente el PRODUCTO que aparece. No inventes características que no se ven. El texto final debe ser simple, corto y útil para una calculadora de importación. Ejemplos: "zapatillas deportivas usadas", "taladro eléctrico portátil", "escopetas usadas".`;

        const base64Image = await fileToBase64(imageFile);

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: imageFile.type, data: base64Image } }
                ]
            },
            config: {
                temperature: 0.1,
            }
        });

        return response.text.trim();

    } catch (error) {
        console.error("Error generating description from image:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
            throw new Error("La clave API no es válida. Por favor, verifica la configuración.");
        }
        throw new Error("No se pudo generar la descripción desde la imagen.");
    }
}

export async function classifyProduct(description: string, imageFile?: File): Promise<HSSuggestion[]> {
    try {
        const systemInstruction = "Eres un experto clasificador arancelario de la aduana de Chile. Tu única función es: 1. Analizar la descripción del producto y/o la imagen proporcionada. Si hay una imagen, es la fuente principal de verdad; la descripción textual es contexto. 2. Proponer de 1 a 3 códigos HS a 6 dígitos según el Arancel Aduanero Chileno, con un nivel de confianza ('Alto', 'Medio', 'Bajo'). 3. Devolver tu respuesta exclusivamente en el formato JSON solicitado, sin texto introductorio ni markdown.";
        
        const parts: any[] = [];
        
        let userPrompt = `Analiza la siguiente descripción de producto para importación a Chile: "${description}"`;
        if (imageFile) {
            const base64Image = await fileToBase64(imageFile);
            parts.push({ inlineData: { mimeType: imageFile.type, data: base64Image } });
            userPrompt = `Analiza el producto en la imagen para importación a Chile. La descripción proporcionada por el usuario es: "${description}". Prioriza la evidencia de la imagen.`;
        }
        parts.push({ text: userPrompt });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: classificationSchema,
                temperature: 0.2, 
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);

        if (parsed && Array.isArray(parsed.sugerencias)) {
            const suggestions = parsed.sugerencias.slice(0, 3).map((s: any) => ({
                codigo: s.codigo,
                descripcion: s.descripcion,
                nivel_confianza: s.nivel_confianza || 'Bajo',
            })) as HSSuggestion[];

            return suggestions;
        }

        console.warn("La respuesta de la IA no contenía el formato esperado.", parsed);
        return [];
        
    } catch (error) {
        console.error("Error classifying product with Gemini:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("La clave API no es válida. Por favor, verifica la configuración.");
        }
        throw new Error("No se pudo clasificar el producto desde el servicio de IA.");
    }
}