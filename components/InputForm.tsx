import React, { useState, useRef } from 'react';
import type { FormData } from '../types';
import { countries } from '../constants';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ImageIcon } from './icons/ImageIcon';

interface InputFormProps {
    formData: FormData;
    onFormChange: (name: keyof FormData, value: any) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    loading: boolean;
    theoreticalInsurance: number | null;
    onImageUpload: (file: File | null) => void;
    imageDescriptionLoading: boolean;
    imageDescriptionError: string | null;
}

const InputForm: React.FC<InputFormProps> = ({
    formData,
    onFormChange,
    handleSubmit,
    loading,
    theoreticalInsurance,
    onImageUpload,
    imageDescriptionLoading,
    imageDescriptionError,
}) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecciona un archivo de imagen.');
                return;
            }
            if (file.size > 4 * 1024 * 1024) { // 4MB limit
                alert('El archivo es demasiado grande. El límite es de 4MB.');
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            onImageUpload(file);
        } else {
            setImagePreview(null);
            onImageUpload(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as { name: keyof FormData, value: string, type: string };
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            onFormChange(name, checked);
        } else if (type === 'number') {
            onFormChange(name, value === '' ? undefined : parseFloat(value));
        } else {
            onFormChange(name, value);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
                 <h2>Detalles del Producto</h2>
                 <p style={{color: 'var(--texto-secundario)', fontSize: '14px', marginTop: '-10px'}}>Ingresa la información para estimar los impuestos.</p>
            </div>

            <div>
                <label>Identificar producto por imagen (Opcional)</label>
                <div className="mt-2 flex justify-center p-6 border-2 border-dashed rounded-lg" style={{borderColor: '#dcdcdc'}}>
                    <div className="space-y-1 text-center">
                        {imagePreview ? (
                             <div className="relative">
                                <img src={imagePreview} alt="Vista previa" className="mx-auto h-24 w-auto rounded-md" />
                                {imageDescriptionLoading && (
                                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-md backdrop-blur-sm">
                                        <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                             </div>
                        ) : (
                            <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                        )}
                        <div className="flex text-sm text-slate-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-medium"
                                style={{color: 'var(--principal)'}}
                            >
                                <span>Sube un archivo</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" ref={fileInputRef} />
                            </label>
                            <p className="pl-1">o arrástralo aquí</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 4MB</p>
                    </div>
                </div>
                 {imageDescriptionError && (
                    <p className="mt-2 text-sm text-red-600">
                        Error: {imageDescriptionError}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="description">Descripción del Producto</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Sube una imagen o escribe una descripción, ej: Zapatillas deportivas para hombre"
                    required
                />
            </div>

            <div>
                <label htmlFor="country">País de Origen</label>
                <div className="relative">
                    <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="appearance-none"
                    >
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDownIcon className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none mt-1" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="value">Valor FOB (USD)</label>
                    <input
                        id="value"
                        name="value"
                        type="number"
                        value={formData.value ?? ''}
                        onChange={handleChange}
                        placeholder="1000"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
                <div>
                    <label htmlFor="freight">Flete (USD)</label>
                    <input
                        id="freight"
                        name="freight"
                        type="number"
                        value={formData.freight ?? ''}
                        onChange={handleChange}
                        placeholder="200"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>
            </div>
             <div>
                <label htmlFor="insurance">Seguro (USD) <span className="text-slate-500 font-normal">(opcional)</span></label>
                <input
                    id="insurance"
                    name="insurance"
                    type="number"
                    value={formData.insurance ?? ''}
                    onChange={handleChange}
                    placeholder={theoreticalInsurance !== null ? `Teórico: ${theoreticalInsurance.toFixed(2)}` : "0.00"}
                    min="0"
                    step="0.01"
                />
                {theoreticalInsurance !== null && (
                    <p className="text-xs text-slate-600 mt-1.5 px-1">
                        Se aplicará el seguro teórico (2% de FOB + Flete) por no ingresar un valor.
                    </p>
                )}
            </div>
             <div className="flex items-center pt-2">
                <input
                    id="isUsed"
                    name="isUsed"
                    type="checkbox"
                    checked={formData.isUsed}
                    onChange={handleChange}
                    className="h-4 w-4 rounded focus:ring-indigo-500"
                    style={{width: 'auto', marginTop: 0}}
                />
                <label htmlFor="isUsed" className="ml-2 block text-sm font-medium" style={{color: 'var(--texto)'}}>
                    ¿El producto es usado?
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="btn-principal"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculando...
                    </>
                ) : (
                    'Calcular Impuestos'
                )}
            </button>
        </form>
    );
};

export default InputForm;