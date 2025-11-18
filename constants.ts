import type { FormData, SpecialTaxRule, CertificationRule } from './types';

export const initialFormData: FormData = {
    description: '',
    country: 'China',
    value: 1000,
    freight: 200,
    insurance: undefined,
    isUsed: false,
};

// A more comprehensive list for the dropdown
export const countries = [
    'Alemania', 'Argentina', 'Australia', 'Bolivia', 'Brasil', 'Canadá', 'China', 'Colombia', 
    'Corea del Sur', 'Costa Rica', 'Ecuador', 'España', 'Estados Unidos', 'Francia', 'Hong Kong',
    'India', 'Indonesia', 'Italia', 'Japón', 'Malasia', 'México', 'Panamá', 'Paraguay',
    'Perú', 'Reino Unido', 'Rusia', 'Singapur', 'Suiza', 'Tailandia', 'Turquía', 'Unión Europea', 
    'Uruguay', 'Vietnam', 'Otro'
];

// Simplified list of countries/regions with Free Trade Agreements with Chile
// Source: https://www.subrei.gob.cl/acuerdos-comerciales/
// This set is used for the logic check.
export const tlcCountries = new Set([
    'Argentina', 'Australia', 'Bolivia', 'Brasil', 'Canadá', 'China', 'Colombia',
    'Corea del Sur', 'Costa Rica', 'Ecuador', 'Estados Unidos', 'Hong Kong',
    'Indonesia', 'Japón', 'Malasia', 'México', 'Panamá', 'Paraguay', 'Perú',
    'Reino Unido', 'Singapur', 'Tailandia', 'Turquía', 'Unión Europea', 'Uruguay', 'Vietnam'
]);

// Source of truth for special taxes based on HS code prefixes, aligned with user's provided formulas.
// Rules are ordered from most specific HS code to most general to ensure correct matching.
export const specialTaxRules: SpecialTaxRule[] = [
    // Most specific prefixes first (e.g., 6 digits)
    { subCategory: 'Jet ski', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['8903.92'] },
    { subCategory: 'Motores recreativos', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['8407.21'] },
    { subCategory: 'Tabaco elaborado', category: 'Tabaco', rate: 0.597, rateLabel: '59.7%', hsPrefixes: ['2402.20'] },
    { subCategory: 'Tabaco puro', category: 'Tabaco', rate: 0.526, rateLabel: '52.6%', hsPrefixes: ['2402.10'] },

    // General prefixes (e.g., 4 digits)
    { subCategory: 'Pirotecnia', category: 'Pirotecnia', rate: 0.50, rateLabel: '50%', hsPrefixes: ['3604'] },
    { subCategory: 'Bebidas no alcohólicas', category: 'Bebidas no alcohólicas', rate: 0.10, rateLabel: '10%', hsPrefixes: ['2202'], warning: 'La tasa puede ser 18% si el producto tiene alto contenido de azúcar (Ley 20.606).' },
    { subCategory: 'Cervezas y Vinos', category: 'Bebidas alcohólicas', rate: 0.205, rateLabel: '20.5%', hsPrefixes: ['2203', '2204', '2205', '2206'] },
    { subCategory: 'Licores destilados', category: 'Licores destilados', rate: 0.315, rateLabel: '31.5%', hsPrefixes: ['2208'] },
    { subCategory: 'Tabaco', category: 'Tabaco', rate: 0, rateLabel: 'Variable', hsPrefixes: ['2401', '2402', '2403'], warning: 'El tabaco tiene impuestos especiales complejos y variables (hasta 59.7%) que dependen del tipo exacto.' },
    { subCategory: 'Joyas', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['7113', '7114'] },
    { subCategory: 'Piedras preciosas', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['7102', '7103', '7104'] },
    { subCategory: 'Perlas', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['7101'] },
    { subCategory: 'Relojes de lujo', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['9101', '9102'] },
    { subCategory: 'Yates', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['8903'] },
    { subCategory: 'Aeronaves deportivas', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['8802'] },
    { subCategory: 'Armas deportivas', category: 'Artículos de lujo', rate: 0.15, rateLabel: '15%', hsPrefixes: ['9303', '9304'] },
    { subCategory: 'Vehículos nuevos', category: 'Vehículos', rate: 0, rateLabel: 'Fórmula', hsPrefixes: ['8703'], warning: "Los vehículos nuevos pueden estar afectos a un 'impuesto verde' no incluido en esta estimación." },
];

// Source of truth for required certifications/permits, with more specific document names and reasons.
export const certificationRules: CertificationRule[] = [
    { organism: 'SAG', category: 'Productos Agropecuarios', document: 'Certificación Sanitaria', hsChapters: ['01', '07', '08', '12', '31'], description: 'Producto de origen animal/vegetal requiere control sanitario' },
    { organism: 'SAG', category: 'Madera y Embalajes', document: 'Certificación NIMF-15', hsChapters: ['44'], description: 'Embalajes de madera deben cumplir norma internacional fitosanitaria' },
    { organism: 'ISP', category: 'Productos de Salud', document: 'Registro Sanitario/Notificación', hsChapters: ['30', '33'], description: 'Medicamentos y cosméticos requieren autorización del Instituto de Salud Pública' },
    { organism: 'ISP', category: 'Dispositivos Médicos', document: 'Certificación de Dispositivos Médicos', hsChapters: ['90'], description: 'Equipamiento médico requiere certificación del ISP' },
    { organism: 'SEREMI de Salud', category: 'Alimentos', document: 'Autorización Sanitaria', hsChapters: ['16', '17', '18', '19', '20', '21'], description: 'Alimentos procesados y suplementos requieren control de la SEREMI' },
    { organism: 'SERNAPESCA', category: 'Productos del Mar', document: 'Autorización de Importación', hsChapters: ['03', '05'], description: 'Pescados, mariscos y otros productos marinos requieren visación de SERNAPESCA' },
    { organism: 'SUBTEL', category: 'Equipos de Telecomunicaciones', document: 'Certificación SUBTEL', hsChapters: ['85', '90'], description: 'Equipos con tecnología inalámbrica (WiFi, BT) requieren homologación' },
    { organism: 'SEC', category: 'Productos Eléctricos', document: 'Certificación SEC (Sello)', hsChapters: ['85'], description: 'Equipos eléctricos deben contar con certificación de seguridad' },
    { organism: 'DGMN', category: 'Armas y Explosivos', document: 'Permiso DGMN', hsChapters: ['93'], description: 'Armas, municiones y explosivos son controlados por la DGMN' },
    { organism: 'ANAM', category: 'Químicos Controlados', document: 'Permiso de Sustancias Químicas', hsChapters: ['28', '29'], description: 'Sustancias químicas controladas requieren autorización previa' },
];

export const catalogos = {
  hogar: {
    nombre: "Catálogo de Proveedores del Hogar",
    url: "https://impopro.com/catalogos/hogar",
    precio: 9900
  },
  mascotas: {
    nombre: "Catálogo de Proveedores de Mascotas",
    url: "https://impopro.com/catalogos/mascotas",
    precio: 9900
  },
  tecnologia: {
    nombre: "Catálogo de Proveedores de Tecnología",
    url: "https://impopro.com/catalogos/tecnologia",
    precio: 14900
  },
  fitness: {
    nombre: "Catálogo de Proveedores Fitness",
    url: "https://impopro.com/catalogos/fitness",
    precio: 9900
  }
};

export const catalogKeywords = {
  hogar: ['hogar', 'mueble', 'decoración', 'cocina', 'lámpara', 'silla', 'mesa', 'cama', 'sofá', 'vajilla', 'textil'],
  mascotas: ['mascota', 'perro', 'gato', 'animal', 'juguete para', 'alimento para', 'collar', 'acuario', 'veterinario'],
  tecnologia: ['tecnología', 'electrónico', 'computador', 'teléfono', 'celular', 'cámara', 'audífono', 'drone', 'smartwatch', 'teclado', 'pantalla', 'cargador'],
  fitness: ['fitness', 'deporte', 'gimnasio', 'entrenamiento', 'mancuerna', 'bicicleta', 'ropa deportiva', 'yoga', 'suplemento']
};