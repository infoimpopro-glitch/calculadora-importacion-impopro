import React from 'react';
import type { CalculationResult, HSSuggestion, AdditionalDocument, Alert, Catalog } from '../types';
import { InfoIcon } from './icons/InfoIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface ResultsDisplayProps {
    result: CalculationResult | null;
    loading: boolean;
    error: string | null;
}

const formatCurrencyUSD = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

const formatCurrencyCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(Math.round(value));
};

const HSSuggestionCard: React.FC<{ suggestion: HSSuggestion }> = ({ suggestion }) => {
    const confidence = suggestion.nivel_confianza || 'Bajo';

    let confidenceStyle = {
        background: '#f8d7da',
        color: '#721c24'
    };
    if (confidence === 'Alto') {
        confidenceStyle = { background: '#d4edda', color: '#155724' };
    } else if (confidence === 'Medio') {
        confidenceStyle = { background: '#fff3cd', color: '#856404' };
    }

    return (
        <div className="card !p-4">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <p className="font-mono text-lg font-bold" style={{color: 'var(--texto)'}}>{suggestion.codigo}</p>
                    <p className="text-sm mt-1" style={{color: 'var(--texto-secundario)'}}>{suggestion.descripcion}</p>
                </div>
                <span 
                    className={`flex-shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full`}
                    style={confidenceStyle}
                >
                    {confidence}
                </span>
            </div>
        </div>
    );
};

const DocumentCard: React.FC<{ doc: AdditionalDocument }> = ({ doc }) => (
    <div className="card !p-4">
        <p className="font-semibold text-blue-700">{doc.organismo}</p>
        <p className="text-sm mt-1 font-medium">Documento: <span className="font-normal">{doc.documento}</span></p>
        <p className="text-sm mt-1" style={{color: 'var(--texto-secundario)'}}>Razón: <span className="font-normal">{doc.razon}</span></p>
    </div>
);

const AlertCard: React.FC<{ alert: Alert }> = ({ alert }) => {
    const alertStyles: { [key: string]: { border: string; bg: string; text: string; icon: string } } = {
        'Mercancía Regulada': { bg: '#e7f3ff', border: '#90bdfa', text: '#004085', icon: '#004085' },
        'Riesgo Aduanero': { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '#721c24' },
        'Aviso General': { bg: '#f8f9fa', border: '#d6d8db', text: '#383d41', icon: '#383d41' },
        'Impuesto Especial': { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '#856404' },
        'TLC Aplicado': { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '#155724' },
        'Producto Usado': { bg: '#fff3cd', border: '#ffeeba', text: '#856404', icon: '#856404' },
        'Cálculo de Seguro': { bg: '#e2e3fe', border: '#c8caff', text: '#483d8b', icon: '#483d8b' },
    };
    const defaultStyle = alertStyles['Aviso General'];
    const currentStyle = alertStyles[alert.tipo] || defaultStyle;

    return (
        <div style={{ backgroundColor: currentStyle.bg, borderLeft: `4px solid ${currentStyle.border}` }} className="p-4 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                     <InfoIcon className="h-5 w-5" style={{ color: currentStyle.icon }} />
                </div>
                <div className="ml-3" style={{ color: currentStyle.text }}>
                    <h3 className="text-sm font-semibold">{alert.tipo}</h3>
                    <p className="mt-1 text-sm">{alert.mensaje}</p>
                </div>
            </div>
        </div>
    );
};

const RecommendedCatalogCard: React.FC<{ catalog: Catalog }> = ({ catalog }) => {
    const formattedPrice = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
    }).format(catalog.precio);

    return (
        <div className="card" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '1px solid #9baacf' }}>
            <div className="flex items-start gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                    <SparklesIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-grow">
                    <h3 className="!border-none !p-0 !m-0 font-bold text-lg" style={{color: '#2c3e50'}}>¡Impulsa tu Negocio!</h3>
                    <p className="mt-1 text-sm" style={{color: 'var(--texto-secundario)'}}>
                        Encontramos un catálogo de proveedores que podría interesarte para este tipo de producto.
                    </p>
                    <div className="mt-4 p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
                        <p className="font-semibold">{catalog.nombre}</p>
                        <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                             <p className="font-bold text-lg" style={{color: 'var(--texto)'}}>{formattedPrice}</p>
                             <a href={catalog.url} target="_blank" rel="noopener noreferrer" className="btn-principal !w-auto px-4 !py-2 !text-sm !font-semibold">
                                Ver Catálogo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, loading, error }) => {
    if (loading) {
        return (
            <div className="animate-fade-in flex justify-center items-center h-full min-h-[400px]">
                <div className="text-center">
                    <svg className="animate-spin mx-auto h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold text-slate-700">Analizando y calculando...</p>
                    <p className="text-slate-500">Esto puede tardar unos segundos.</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return <div className="animate-fade-in p-4 rounded-lg" style={{backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24'}} role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
        </div>;
    }

    if (!result) {
        return <div className="animate-fade-in bg-slate-50/50 p-8 rounded-xl border-2 border-dashed border-slate-300 text-center h-full flex flex-col justify-center items-center min-h-[400px]">
            <InfoIcon className="w-12 h-12 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">Esperando cálculo</h3>
            <p className="text-slate-500 mt-1 max-w-sm">Completa el formulario y presiona "Calcular Impuestos" para ver la estimación.</p>
        </div>;
    }
    
    const formattedSpecialTaxRate = typeof result.tasa_impuestos_especiales === 'number'
        ? `${result.tasa_impuestos_especiales}%`
        : result.tasa_impuestos_especiales;

    return (
        <div className="space-y-6 animate-fade-in">
            {result.catalogo_recomendado && <RecommendedCatalogCard catalog={result.catalogo_recomendado} />}
            
            <div>
                <h3>Sugerencias de Código Arancelario (HS)</h3>
                <div className="space-y-3 mt-2">
                    {result.hs_sugerido?.length > 0 ? (
                       result.hs_sugerido.map((s, i) => <HSSuggestionCard key={i} suggestion={s} />)
                    ) : (
                        <p style={{color: 'var(--texto-secundario)'}}>No se encontraron sugerencias.</p>
                    )}
                </div>
            </div>
            
            <div className="card">
                <h3>Resumen de la Estimación</h3>
                <div className="space-y-3 mt-4 text-sm">
                    <div className="flex justify-between items-start gap-2"><span style={{color: 'var(--texto-secundario)'}}>Tratado de Libre Comercio (TLC):</span> <span className="font-semibold text-right">{result.tlc}</span></div>
                    <div className="flex justify-between items-center"><span style={{color: 'var(--texto-secundario)'}}>Seguro Aplicado:</span> <span className="font-medium">{result.seguro_usado}</span></div>
                    <hr className="!my-4" />
                    <div className="flex justify-between items-center"><span style={{color: 'var(--texto-secundario)'}}>Valor CIF (USD):</span> <span className="font-medium">{formatCurrencyUSD(result.cif_usd)}</span></div>
                    <div className="flex justify-between items-center"><span style={{color: 'var(--texto-secundario)'}}>Derecho Aduanero ({result.arancel_aplicado}) (USD):</span> <span className="font-medium">{formatCurrencyUSD(result.derecho_aduanero_usd)}</span></div>
                    <div className="flex justify-between items-center"><span style={{color: 'var(--texto-secundario)'}}>IVA (19%) (USD):</span> <span className="font-medium">{formatCurrencyUSD(result.iva_usd)}</span></div>
                    <div className="flex justify-between items-center">
                        <span style={{color: 'var(--texto-secundario)'}}>Impuestos Especiales ({formattedSpecialTaxRate}) (USD):</span>
                         <span className="font-medium">{formatCurrencyUSD(result.impuestos_especiales_usd)}</span>
                    </div>
                    <hr className="!my-4" />
                     <div className="flex justify-between items-center text-base"><span className="font-semibold" style={{color: 'var(--texto)'}}>Total Impuestos (USD):</span> <span className="font-bold text-lg" style={{color: 'var(--texto)'}}>{formatCurrencyUSD(result.total_impuestos_usd)}</span></div>
                </div>

                <div className="mt-6 p-4 rounded-lg" style={{background: 'var(--bg)'}}>
                    <div className="py-2 flex justify-between items-center text-lg font-bold">
                        <span>Costo Total (USD):</span>
                        <span>{formatCurrencyUSD(result.total_final_usd)}</span>
                    </div>
                     <div className="pt-3">
                        <div className="flex justify-between items-center text-sm">
                            <span style={{color: 'var(--texto-secundario)'}}>Tipo de Cambio (Dólar Observado):</span>
                            <span className="font-medium">${new Intl.NumberFormat('es-CL').format(result.tipo_cambio_clp)}</span>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-xl font-bold">
                            <span>Costo Total (CLP):</span>
                            <span style={{color: '#273c75'}}>{formatCurrencyCLP(result.total_final_clp)}</span>
                        </div>
                    </div>
                </div>
            </div>

             <div>
                <h3>Recomendación sobre Agente de Aduanas</h3>
                <div className="mt-2">
                    <AlertCard alert={{ tipo: result.recomendacion_agente.es_obligatorio === 'sí' ? 'Riesgo Aduanero' : result.recomendacion_agente.es_obligatorio === 'recomendable' ? 'Mercancía Regulada' : 'TLC Aplicado', mensaje: result.recomendacion_agente.mensaje }} />
                </div>
            </div>
            
            {result.documentos_adicionales.length > 0 && (
                 <div>
                    <h3>Documentos Adicionales Requeridos</h3>
                     <div className="space-y-3 mt-2">
                        {result.documentos_adicionales.map((doc, i) => <DocumentCard key={i} doc={doc} />)}
                    </div>
                </div>
            )}

            {result.alertas.length > 0 && (
                 <div>
                    <h3>Alertas y Avisos</h3>
                     <div className="space-y-3 mt-2">
                         {result.alertas.map((alert, i) => <AlertCard key={i} alert={alert} />)}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultsDisplay;