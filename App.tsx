import React, { useState, useCallback, useEffect } from 'react';
import type { FormData, CalculationResult } from './types';
import { initialFormData } from './constants';
import { classifyProduct, generateDescriptionFromImage } from './services/geminiService';
import { calculateTaxes } from './services/taxCalculator';
import { getDolarObservado } from './services/exchangeRateService';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { CalculatorIcon } from './components/icons/CalculatorIcon';
import { recommendCatalog } from './services/catalogService';

const App: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [theoreticalInsurance, setTheoreticalInsurance] = useState<number | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageDescriptionLoading, setImageDescriptionLoading] = useState<boolean>(false);
    const [imageDescriptionError, setImageDescriptionError] = useState<string | null>(null);

    useEffect(() => {
        const { value, freight, insurance } = formData;
        // Fix: Removed `insurance === ''` as `insurance` is of type `number | undefined` and this comparison is invalid.
        if (insurance === undefined || insurance === null) {
            const fob = value ?? 0;
            const flete = freight ?? 0;
            if (fob > 0 || flete > 0) {
                setTheoreticalInsurance((fob + flete) * 0.02);
            } else {
                setTheoreticalInsurance(null);
            }
        } else {
            setTheoreticalInsurance(null);
        }
    }, [formData.value, formData.freight, formData.insurance]);

    const handleFormChange = (name: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = useCallback(async (file: File | null) => {
        setImageFile(file);
        if (result) setResult(null);
        if (error) setError(null);
        setImageDescriptionError(null);

        if (!file) {
            return;
        }
        
        try {
            setImageDescriptionLoading(true);
            const description = await generateDescriptionFromImage(file);
            setFormData(prev => ({ ...prev, description }));
        } catch (err) {
            console.error(err);
            setImageDescriptionError(err instanceof Error ? err.message : 'No se pudo generar la descripción desde la imagen.');
        } finally {
            setImageDescriptionLoading(false);
        }
    }, [result, error]);

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const suggestions = await classifyProduct(formData.description, imageFile ?? undefined);
            const exchangeRate = await getDolarObservado();
            
            const calculation = calculateTaxes(formData, exchangeRate, suggestions);
            const recommendedCatalog = recommendCatalog(formData.description, suggestions);

            setResult({
                ...calculation,
                hs_sugerido: suggestions,
                catalogo_recomendado: recommendedCatalog,
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado al procesar la solicitud.');
        } finally {
            setLoading(false);
        }
    }, [formData, imageFile]);

    return (
        <div className="min-h-screen">
            <header className="py-6">
                <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                     <div style={{background: 'var(--principal)'}} className="text-white p-3 rounded-xl shadow-lg">
                        <CalculatorIcon className="w-8 h-8" style={{stroke: '#FFFFFF'}} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{color: 'var(--texto)'}}>Calculadora de Impuestos de Importación</h1>
                        <p style={{color: 'var(--texto-secundario)'}}>Estimador para importaciones en Chile</p>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-2">
                        <InputForm
                            formData={formData}
                            onFormChange={handleFormChange}
                            handleSubmit={handleSubmit}
                            loading={loading}
                            theoreticalInsurance={theoreticalInsurance}
                            onImageUpload={handleImageUpload}
                            imageDescriptionLoading={imageDescriptionLoading}
                            imageDescriptionError={imageDescriptionError}
                        />
                    </div>
                    <div className="lg:col-span-3">
                       <ResultsDisplay result={result} loading={loading} error={error} />
                    </div>
                </div>
            </main>
             <footer className="text-center py-8 mt-8 text-sm" style={{color: 'var(--texto-secundario)'}}>
                <p>Esta herramienta es solo para fines informativos. Los cálculos son estimaciones.</p>
                <p>&copy; {new Date().getFullYear()} Creado por un experto en comercio exterior.</p>
            </footer>
        </div>
    );
};

export default App;