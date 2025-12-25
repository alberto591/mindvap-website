import { SafetyService } from './safety-service';
import { SecurityMetricService } from './security-metric-service';
import { log } from '../../infrastructure/lib/logger';
import { FormulaIngredient } from '../../domain/entities/index';

export interface FormulationCriteria {
    goal: 'calm' | 'relaxation' | 'mood_support' | 'energy' | 'focus' | 'mind_clarity' | 'sleep';
    format: 'tea' | 'smoking_blend' | 'incense' | 'tincture';
    constraints: string[];
    apiKey?: string;
}

export interface Ingredient extends FormulaIngredient {
    reason: string;
}

export interface FormulationResult {
    name: string;
    description: string;
    ingredients: Ingredient[];
    flavorProfile: string;
    synergyNotes: string;
    instructions: string;
    safetyStatus?: {
        safe: boolean;
        warnings: string[];
    };
}

const SYSTEM_PROMPT = `
You are the MindVap Master Herbalist, an expert in creating personalized herbal blends.
Your goal is to formulate a blend based on the user's goal, format (tea, smoking_blend, etc.), and health constraints.

GUIDELINES:
1. Use only high-quality, research-backed herbs.
2. Ensure synergy between ingredients.
3. Respect the user's constraints (allergies, medications, conditions).
4. Provide a clear reason for each ingredient based on herbal research.
5. Return ONLY a valid JSON object matching the requested structure.

RESEARCH DATA REFERENCE:
- Ashwagandha: Stress/Anxiety, GABAergic modulation. 300-600mg equivalency.
- Chamomile: Anxiety, Apigenin/GABA. Inhalation/Oral.
- Lavender: Anxiolytic, Linalool.
- Peppermint: Memory/Alertness, Menthol.
- Holy Basil (Tulsi): Stress resilience, Cortisol modulation.
- Ginger: Attention/Cognition, Gingerols.
- Turmeric (Curcumin): Mood/Depression, Anti-inflammatory.
- Rosemary: Focus/Attention, 1,8-cineole.
- Passionflower: Anxiety/Sleep, GABAergic.
- Lemon Balm: Anxiety/Sleep, combinations with Valerian.
- Valerian Root: Sedation, Sleep aid.
- St. John's Wort: Mild-to-moderate depression. (CAUTION: High interactions).

OUTPUT FORMAT:
{
  "name": "Blend Name",
  "description": "Short description",
  "ingredients": [
    { "name": "Herb Name", "percentage": 40, "reason": "Why it's included" }
  ],
  "flavorProfile": "Taste experience",
  "synergyNotes": "How ingredients work together",
  "instructions": "Usage guide"
}
`;

export const generateFormulation = async (criteria: FormulationCriteria): Promise<FormulationResult> => {
    const { apiKey, goal, format, constraints } = criteria;

    // ADR-0004: Fast fail if no key
    if (!apiKey) {
        throw new Error('OpenAI API Key is required for formulation generation');
    }

    // Track request security metric
    SecurityMetricService.trackEvent({
        type: 'ai_formulation',
        identifier: 'formulation_agent',
        action: 'generate_formulation',
        metadata: { goal, format, constraintCount: constraints.length }
    });

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${criteria.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o', // Or gpt-3.5-turbo for cost efficiency
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    {
                        role: 'user',
                        content: `Create a ${criteria.format} for the goal: ${criteria.goal}. User constraints: ${criteria.constraints.join(', ')}.`
                    }
                ],
                response_format: { type: "json_object" },
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const result: FormulationResult = JSON.parse(data.choices[0].message.content);

        // --- Post-Generation Safety Check ---
        const safety = SafetyService.checkSafety(
            result.ingredients.map(i => ({ name: i.name, percentage: i.percentage })),
            criteria.constraints
        );

        result.safetyStatus = {
            safe: safety.safe,
            warnings: safety.warnings
        };

        if (!safety.safe) {
            log.warn('AI generated an unsafe formulation', { criteria, result, safety });
            // We could either return it with warnings or throw error. 
            // For now, we return it so the UI can show the "Blocked" status.
        }

        return result;

    } catch (error: any) {
        log.error('Failed to generate formulation', { error, criteria });
        throw error;
    }
};

