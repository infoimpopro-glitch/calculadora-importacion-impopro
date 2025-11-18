export interface FormData {
    description: string;
    country: string;
    value?: number;
    freight?: number;
    insurance?: number;
    isUsed: boolean;
}

export interface HSSuggestion {
    codigo: string;
    descripcion: string;
    nivel_confianza: string;
}

export interface SpecialTaxRule {
    subCategory: string;
    category: 'Bebidas alcohólicas' | 'Licores destilados' | 'Artículos de lujo' | 'Tabaco' | 'Vehículos' | 'Bebidas no alcohólicas' | 'Pirotecnia';
    rate: number;
    rateLabel: string;
    hsPrefixes: string[];
    warning?: string;
}

export interface CertificationRule {
    organism: string;
    category: string;
    document: string;
    hsChapters: string[];
    description: string;
}

export interface AdditionalDocument {
    organismo: string;
    documento: string;
    razon: string;
}

export interface CustomsAgentRecommendation {
    es_obligatorio: 'sí' | 'no' | 'recomendable';
    mensaje: string;
}

export interface Alert {
    tipo: string;
    mensaje: string;
}

export interface Catalog {
    nombre: string;
    url: string;
    precio: number;
}

export interface CalculationResult {
    hs_sugerido: HSSuggestion[];
    tlc: string;
    arancel_aplicado: string;
    seguro_usado: string;
    cif_usd: number;
    derecho_aduanero_usd: number;
    iva_usd: number;
    tasa_impuestos_especiales: number | string;
    impuestos_especiales_usd: number;
    total_impuestos_usd: number;
    total_final_usd: number;
    tipo_cambio_clp: number;
    total_final_clp: number;
    documentos_adicionales: AdditionalDocument[];
    recomendacion_agente: CustomsAgentRecommendation;
    alertas: Alert[];
    catalogo_recomendado?: Catalog;
}