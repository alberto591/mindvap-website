export interface SourcingCriteria {
    herbName: string;
    region: string;
    certifications: string[];
    minQuantity: string;
    notes?: string;
    apiKey?: string; // OpenAI API Key (optional)
}

export interface ProviderResult {
    name: string;
    location: string;
    website: string;
    relevanceScore: number;
    notes: string;
    tags: string[];
}

/**
 * Generates a sophisticated Google Search query based on sourcing criteria.
 */
export const generateSearchQuery = (criteria: SourcingCriteria): string => {
    const parts = [
        `"${criteria.herbName}"`,
        `bulk wholesale supplier`,
        criteria.region ? `site:${criteria.region} OR location:${criteria.region}` : '',
        criteria.certifications.length > 0 ? `(${criteria.certifications.join(' OR ')})` : '',
        '-amazon -ebay -etsy', // Exclude retail marketplaces
    ];

    return parts.filter(Boolean).join(' ');
};

/**
 * Mock function to simulate "AI Analysis" if we don't have a real backend scraper yet.
 * In a real scenario, this would call OpenAI with search results to filter them.
 */
export const analyzeProvidersWithAI = async (criteria: SourcingCriteria): Promise<ProviderResult[]> => {
    // varied delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (!criteria.apiKey) {
        throw new Error("API Key is required for AI analysis.");
    }

    // TODO: Implement actual OpenAI fetch here using the key
    // For now, return mock data detailed enough to visualize the UI

    return [
        {
            name: "EuroHerb Bio",
            location: "Valencia, Spain",
            website: "https://example-euroherb.com",
            relevanceScore: 95,
            notes: "Specializes in verified organic herbs. GMP certified. Minimum order 5kg.",
            tags: ["Organic", "GMP", "Direct Farm"],
        },
        {
            name: "Iberia Spices & Extracts",
            location: "Madrid, Spain",
            website: "https://example-iberiaspices.com",
            relevanceScore: 88,
            notes: "Large distributor. ISO 9001. Good for high volume, but check batch consistency.",
            tags: ["ISO 9001", "Distributor"],
        },
        {
            name: "Mediterranean Aromatics",
            location: "Seville, Spain",
            website: "https://example-medaromatics.com",
            relevanceScore: 82,
            notes: "Artisanal cooperative. Premium quality but higher prices. Limited stock seasonally.",
            tags: ["Cooperative", "Premium"],
        }
    ];
};
