import type { FormData, CalculationResult, HSSuggestion, AdditionalDocument, CustomsAgentRecommendation, Alert } from '../types';
import { tlcCountries, specialTaxRules, certificationRules } from '../constants';

// Function to find the specific tax rule based on the most confident HS code.
const findSpecialTaxRule = (suggestions: HSSuggestion[]) => {
    if (!suggestions || suggestions.length === 0) {
        return null;
    }
    // Use the most confident suggestion
    const topSuggestion = suggestions[0];
    const hsCode = topSuggestion.codigo;

    for (const rule of specialTaxRules) {
        for (const prefix of rule.hsPrefixes) {
            if (hsCode.startsWith(prefix)) {
                return rule;
            }
        }
    }
    return null;
};

// Function to get required additional documents based on the HS code chapter.
const getAdditionalDocuments = (suggestions: HSSuggestion[]): AdditionalDocument[] => {
    const requiredDocuments: AdditionalDocument[] = [];
    if (!suggestions || suggestions.length === 0) {
        return requiredDocuments;
    }
    const hsCode = suggestions[0].codigo;
    const hsChapter = hsCode.substring(0, 2);

    for (const rule of certificationRules) {
        if (rule.hsChapters.includes(hsChapter)) {
            requiredDocuments.push({
                organismo: rule.organism,
                documento: rule.document,
                razon: rule.description
            });
            // We DON'T break here, allowing for multiple certifications on the same chapter (e.g., SEC and SUBTEL for HS chapter 85).
        }
    }
    return requiredDocuments;
};

// Helper function to format percentage display
const formatPercentage = (rate: number) => {
    const percentage = rate * 100;
    // Remove trailing .0
    if (percentage % 1 === 0) {
        return `${percentage}%`;
    }
    return `${percentage.toFixed(1)}%`;
}

export const calculateTaxes = (
    data: FormData, 
    exchangeRate: number,
    suggestions: HSSuggestion[],
): Omit<CalculationResult, 'hs_sugerido' | 'catalogo_recomendado'> => {
    const value = data.value ?? 0;
    const freight = data.freight ?? 0;
    const insurance = data.insurance;
    const { country, isUsed } = data;

    const alertas: Alert[] = [{
        tipo: 'Aviso General',
        mensaje: "Este es un cálculo estimado y no reemplaza una liquidación aduanera formal."
    }];
    
    const documentos_adicionales = getAdditionalDocuments(suggestions);

    if (documentos_adicionales.length > 0) {
        documentos_adicionales.forEach(doc => {
            alertas.push({
                tipo: 'Mercancía Regulada',
                mensaje: `Este producto podría requerir ${doc.documento} del organismo ${doc.organismo}.`
            });
        });
        alertas.push({
            tipo: 'Riesgo Aduanero',
            mensaje: "La falta de certificaciones requeridas puede resultar en multas o el rechazo de la mercancía."
        });
    }

    let calculatedInsurance: number;
    let seguro_usado: string;

    if (insurance !== undefined && insurance !== null) { // A value of 0 is a valid declared insurance
        calculatedInsurance = insurance;
        seguro_usado = 'declarado';
    } else {
        calculatedInsurance = (value + freight) * 0.02;
        seguro_usado = 'teórico 2%';
        alertas.push({ tipo: 'Cálculo de Seguro', mensaje: "Seguro teórico (2% de FOB+Flete) aplicado por no ser proporcionado."});
    }
    const cif = value + freight + calculatedInsurance;

    let tlc_string: string;
    let arancelRate = 0.06;

    if (tlcCountries.has(country)) {
        arancelRate = 0;
        tlc_string = `Sí, existe TLC (${country}-Chile). Arancel 0% con origen válido.`;
        alertas.push({ tipo: 'TLC Aplicado', mensaje: `Se aplicó arancel 0% por TLC. Requiere certificado de origen válido.` });
    } else {
        tlc_string = 'Sin TLC aplicable';
    }
    
    // --- START OF REVISED CALCULATION LOGIC ---
    // Follows the user's provided formula for accuracy.

    // 1. Derecho Ad Valorem (Arancel)
    const derecho_aduanero_base = cif * arancelRate;

    // 2. Recargo por Usado
    let recargo_usado = 0;
    if (isUsed) {
        recargo_usado = derecho_aduanero_base * 0.5;
        const usedSurchargeRate = arancelRate * 0.5;
        alertas.push({ tipo: 'Producto Usado', mensaje: `Se aplicó una sobretasa del 50% al arancel (${formatPercentage(usedSurchargeRate)} del CIF) por ser producto usado.`});
    }
    const derecho_aduanero_total = derecho_aduanero_base + recargo_usado;
    const arancel_aplicado_display = formatPercentage(arancelRate + (isUsed ? arancelRate * 0.5 : 0));
    
    // 3. Base para Impuestos Especiales
    const baseImpuestoEspecifico = cif + derecho_aduanero_total;

    // 4. Cálculo de Impuestos Especiales
    let specialTaxRate = 0;
    let tasa_impuestos_especiales: number | string = 0;
    const matchedRule = findSpecialTaxRule(suggestions);
    if (matchedRule) {
        specialTaxRate = matchedRule.rate;
        tasa_impuestos_especiales = matchedRule.rate > 0 ? matchedRule.rate * 100 : matchedRule.rateLabel;
        if (matchedRule.warning) {
            alertas.push({ tipo: 'Impuesto Especial', mensaje: matchedRule.warning });
        }
    }
    const impuestos_especiales_usd = baseImpuestoEspecifico * specialTaxRate;

    // 5. Base del IVA (Corrected: includes special taxes)
    const baseIVA = cif + derecho_aduanero_total + impuestos_especiales_usd;
    
    if (impuestos_especiales_usd > 0) {
        alertas.push({
            tipo: 'Impuesto Especial',
            mensaje: 'Importante: Según la normativa, el IVA se calcula sobre la base que incluye los impuestos especiales.'
        });
    }

    // 6. Cálculo del IVA
    const iva = baseIVA * 0.19;
    
    // 7. Total de Impuestos
    const total_impuestos_usd = derecho_aduanero_total + impuestos_especiales_usd + iva;
    const total_final_usd = cif + total_impuestos_usd;
    const total_final_clp = total_final_usd * exchangeRate;
    
    // --- END OF REVISED CALCULATION LOGIC ---

    let recomendacion_agente: CustomsAgentRecommendation;
    if (value > 1000) {
        recomendacion_agente = {
            es_obligatorio: 'sí',
            mensaje: 'Según normativa de Aduanas Chile, para importaciones con valor FOB superior a US$ 1.000 es obligatorio contratar un Agente de Aduanas.'
        };
    } else if (documentos_adicionales.length > 0) {
        recomendacion_agente = {
            es_obligatorio: 'recomendable',
            mensaje: 'Aunque el valor es bajo, al ser una mercancía regulada se recomienda contratar un Agente de Aduanas para facilitar el proceso de certificación.'
        };
    } else {
        recomendacion_agente = {
            es_obligatorio: 'no',
            mensaje: 'No es obligatorio. Puede realizar el trámite mediante un "Despacho Simplificado" con empresas de envío rápido (couriers).'
        };
    }
    
    return {
        tlc: tlc_string,
        arancel_aplicado: arancel_aplicado_display,
        seguro_usado,
        cif_usd: cif,
        derecho_aduanero_usd: derecho_aduanero_total,
        iva_usd: iva,
        tasa_impuestos_especiales,
        impuestos_especiales_usd,
        total_impuestos_usd,
        total_final_usd,
        tipo_cambio_clp: exchangeRate,
        total_final_clp,
        alertas,
        documentos_adicionales,
        recomendacion_agente,
    };
};