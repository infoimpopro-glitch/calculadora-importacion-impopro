import { catalogos, catalogKeywords } from '../constants';
import type { Catalog, HSSuggestion } from '../types';

export function recommendCatalog(
    productDescription: string,
    hsSuggestions: HSSuggestion[]
): Catalog | null {
    const combinedText = (productDescription + ' ' + (hsSuggestions[0]?.descripcion || '')).toLowerCase();

    for (const [category, keywords] of Object.entries(catalogKeywords)) {
        for (const keyword of keywords) {
            if (combinedText.includes(keyword)) {
                return catalogos[category as keyof typeof catalogos];
            }
        }
    }

    return null;
}
