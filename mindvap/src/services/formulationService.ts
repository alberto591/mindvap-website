export interface FormulationCriteria {
    goal: 'calm' | 'relaxation' | 'mood_support' | 'energy' | 'focus' | 'mind_clarity' | 'sleep';
    format: 'tea' | 'smoking_blend' | 'incense' | 'tincture';
    constraints: string[];
    apiKey?: string;
}

export interface Ingredient {
    name: string;
    percentage: number;
    reason: string;
}

export interface FormulationResult {
    name: string;
    description: string;
    ingredients: Ingredient[];
    flavorProfile: string;
    synergyNotes: string;
    instructions: string;
}

export const generateFormulation = async (criteria: FormulationCriteria): Promise<FormulationResult> => {
    // varied delay to simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (!criteria.apiKey) {
        throw new Error("API Key is required for custom AI formulation.");
    }

    // Mock Logic to demonstrate the agent's capability
    // In production, this would use the apiKey to call OpenAI with a specialized system prompt.

    if (criteria.goal === 'focus' || criteria.goal === 'mind_clarity' || criteria.goal === 'energy') {
        return {
            name: "Cognitive Clarity Blend",
            description: "A bright, stimulating blend designed to clear brain fog and enhance concentration without the jitters of caffeine.",
            ingredients: [
                { name: "Gotu Kola", percentage: 40, reason: "Traditional cerebral tonic, improves circulation to the brain." },
                { name: "Ginkgo Biloba", percentage: 30, reason: "Enhances cognitive function and memory." },
                { name: "Peppermint", percentage: 20, reason: "Invigorating scent that wakes up the senses." },
                { name: "Lemon Balm", percentage: 10, reason: "Reduces anxiety to allow focused attention." }
            ],
            flavorProfile: "Fresh, minty with slight earthy undertones.",
            synergyNotes: "Peppermint provides immediate alertness while Gotu Kola and Ginkgo work over time to support sustained focus. Lemon balm smooths out any nervous energy.",
            instructions: criteria.format === 'tea'
                ? "Steep 1 tbsp per cup for 7-10 minutes. Cover while steeping to retain peppermint oils."
                : "Blend dried herbs thoroughly. Use in small amounts."
        };
    }

    if (criteria.goal === 'sleep' || criteria.goal === 'relaxation' || criteria.goal === 'calm') {
        return {
            name: "Deep Rest Night Blend",
            description: "A heavy, grounding blend specifically formulated to lower cortisol levels and induce deep, restorative sleep.",
            ingredients: [
                { name: "Valerian Root", percentage: 30, reason: "Strong sedative action for deep sleep." },
                { name: "Passionflower", percentage: 30, reason: "Stops 'looping thoughts' and quiets the mind." },
                { name: "Chamomile", percentage: 20, reason: "Gentle relaxant and digestive aid." },
                { name: "Lavender", percentage: 20, reason: "Aromatic relaxant that works via scent and ingestion." }
            ],
            flavorProfile: "Earthy, slightly musky (from Valerian) balanced by floral sweetness.",
            synergyNotes: "Valerian provides the 'knockout' power, while Passionflower handles mental chatter. Chamomile and Lavender ensure the physical body relaxes.",
            instructions: criteria.format === 'tea'
                ? "Decoct (simmer) Valerian root for 15 mins first, then pour over other herbs and steep for 10 mins."
                : "Best used as a tea or tincture. Smoking Valerian is harsh and not recommended."
        };
    }

    // Default / Mood Support
    return {
        name: "Sunshine Mood Lift",
        description: "A cheerful, uplifting blend to combat low spirits and bring a sense of warmth to the solar plexus.",
        ingredients: [
            { name: "St. John's Wort", percentage: 40, reason: "Classic mood brightener (Avoid if on SSRIs)." },
            { name: "Lemon Verbena", percentage: 30, reason: "Uplifting citrus aromatic." },
            { name: "Damiana", percentage: 20, reason: "Mild euphoric and nervine tonic." },
            { name: "Rose Petals", percentage: 10, reason: "Heart-opening and visually beautiful." }
        ],
        flavorProfile: "Citrusy, floral, and grassy.",
        synergyNotes: "St. John's Wort provides the baseline mood support, while Damiana adds a spark of creativity. Lemon Verbena and Rose act on the olfactory system to trigger happiness.",
        instructions: "Steep 5-7 minutes. Add honey to enhance the floral notes."
    };
};
