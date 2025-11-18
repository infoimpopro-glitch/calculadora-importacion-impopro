interface MindicadorResponse {
    serie: {
        fecha: string;
        valor: number;
    }[];
}

/**
 * Fetches the official daily exchange rate (Dólar Observado) from Chile's Central Bank
 * via a public API.
 * @returns {Promise<number>} The exchange rate value.
 */
export async function getDolarObservado(): Promise<number> {
    try {
        // Using a reliable public API that mirrors the Central Bank's data.
        const response = await fetch('https://mindicador.cl/api/dolar');
        if (!response.ok) {
            throw new Error(`Error al obtener datos del tipo de cambio: ${response.statusText}`);
        }
        
        const data: MindicadorResponse = await response.json();
        
        if (data && data.serie && data.serie.length > 0 && data.serie[0].valor) {
            return data.serie[0].valor;
        }
        
        throw new Error("Formato de respuesta inesperado del servicio de tipo de cambio.");

    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        // Provide a user-friendly error message
        throw new Error("No se pudo obtener el tipo de cambio del Banco Central de Chile. Inténtalo de nuevo.");
    }
}
