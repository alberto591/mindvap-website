export interface LegalCriteria {
    productName: string;
    jurisdiction: string;
    intendedUse: 'smoking' | 'tea' | 'incense' | 'cosmetic' | 'supplement' | 'other';
    apiKey?: string; // OpenAI API Key (optional)
}

export interface LegalAnalysisResult {
    status: 'Allowed' | 'Restricted' | 'Prohibited' | 'Gray Area';
    summary: string;
    complianceStrategy: string;
    labelingRequirements: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    sources: string[];
}

/**
 * Generates a targeted legal search query based on criteria.
 */
export const generateLegalSearchQuery = (criteria: LegalCriteria): string => {
    const base = `"${criteria.productName}" legal status ${criteria.jurisdiction}`;
    const specialized = [
        `"${criteria.productName}" novel food catalogue ${criteria.jurisdiction}`,
        `"${criteria.productName}" ${criteria.intendedUse} regulations`,
        `"${criteria.productName}" controlled substances list ${criteria.jurisdiction}`,
    ];

    return `${base} OR ${specialized[0]}`;
};

/**
 * Mock function to simulate "AI Legal Analysis".
 */
export const analyzeRegulationsWithAI = async (criteria: LegalCriteria): Promise<LegalAnalysisResult> => {
    // varied delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (!criteria.apiKey) {
        throw new Error("API Key is required for detailed AI analysis.");
    }

    // Mock logic based on input to make the demo feel responsive
    const isTea = criteria.intendedUse === 'tea';
    const isIncense = criteria.intendedUse === 'incense';

    if (criteria.productName.toLowerCase().includes('cbd')) {
        return {
            status: 'Restricted',
            summary: `In ${criteria.jurisdiction}, CBD is often subject to strict Novel Food or cosmetic regulations. Sale as food/tea is heavily regulated.`,
            complianceStrategy: isIncense
                ? "Sell as a collector's item or aromatic product. Do not make health claims."
                : "Ensure < 0.2% THC. Register as Novel Food if sold for consumption.",
            labelingRequirements: [
                "Contains < 0.2% THC",
                "Not for human consumption (if sold as incense)",
                "Keep out of reach of children",
                "18+ only"
            ],
            riskLevel: 'Medium',
            sources: ["EU Novel Food Catalogue", "Local Narcotic Acts"]
        };
    }

    if (isIncense) {
        return {
            status: 'Gray Area',
            summary: `Selling ${criteria.productName} as incense is a common workaround to bypass food regulations (EFSA/FDA).`,
            complianceStrategy: "Label strictly as 'Aromatic Potpourri' or 'Incense'. Explicitly state 'Not for human consumption'. Avoid any dosing instructions.",
            labelingRequirements: [
                "For aromatic use only",
                "Not a food supplement",
                "Do not ingest"
            ],
            riskLevel: 'Low',
            sources: ["General Product Safety Regulations"]
        };
    }

    return {
        status: 'Allowed',
        summary: `${criteria.productName} appears to be generally permitted in ${criteria.jurisdiction}, but specific purity standards apply.`,
        complianceStrategy: "Standard retail sale allowed. Ensure GMP compliance if sold for consumption.",
        labelingRequirements: [
            "List of ingredients",
            "Net weight",
            "Distributor address"
        ],
        riskLevel: 'Low',
        sources: ["Consumer Protection Laws"]
    };
};
