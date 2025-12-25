
import { log } from '../../infrastructure/lib/logger';

export interface HerbSafetyProfile {
    name: string;
    contraindications: string[];
    interactions: string[];
    warnings: string[];
    maxSafePercentage?: number;
}

export interface SafetyCheckResult {
    safe: boolean;
    warnings: string[];
    blockedIngredients: string[];
}

export class SafetyService {
    private static readonly HERB_SAFETY_DATA: Record<string, HerbSafetyProfile> = {
        'Ashwagandha': {
            name: 'Ashwagandha',
            contraindications: ['pregnancy', 'thyroid_disease'],
            interactions: ['thyroid_medication', 'immunosuppressants'],
            warnings: ['May modulate thyroid hormones. Avoid during pregnancy.'],
        },
        'St. John\'s Wort': {
            name: 'St. John\'s Wort',
            contraindications: ['bipolar_depression', 'pregnancy'],
            interactions: ['SSRIs', 'anticoagulants', 'oral_contraceptives', 'CYP3A4_substrates'],
            warnings: ['High interaction risk (CYPs). Avoid with antidepressants or bipolar disorder.'],
            maxSafePercentage: 40
        },
        'Chamomile': {
            name: 'Chamomile',
            contraindications: ['compositae_allergy'],
            interactions: ['anticoagulants', 'CNS_depressants'],
            warnings: ['Potential allergy cross-reactivity. Monitor with blood thinners.'],
        },
        'Valerian Root': {
            name: 'Valerian Root',
            contraindications: ['liver_disease'],
            interactions: ['CNS_depressants', 'benzodiazepines', 'alcohol'],
            warnings: ['Sedation risk. Do not combine with other strong sedatives.'],
            maxSafePercentage: 30
        },
        'Ginger': {
            name: 'Ginger',
            contraindications: ['gallstones'],
            interactions: ['anticoagulants'],
            warnings: ['May increase bleeding risk at high doses.'],
        },
        'Turmeric': {
            name: 'Turmeric',
            contraindications: ['bile_duct_obstruction'],
            interactions: ['anticoagulants'],
            warnings: ['Curcumin may interact with blood thinners.'],
        },
        'Lavender': {
            name: 'Lavender',
            contraindications: [],
            interactions: ['CNS_depressants'],
            warnings: ['Mild sedation risk.'],
        },
        'Lemon Balm': {
            name: 'Lemon Balm',
            contraindications: ['hypothyroidism'],
            interactions: ['CNS_depressants'],
            warnings: ['May interfere with thyroid function.'],
        },
        'Passionflower': {
            name: 'Passionflower',
            contraindications: ['pregnancy'],
            interactions: ['CNS_depressants', 'MAOIs'],
            warnings: ['Sedative effects. Avoid during pregnancy.'],
        },
        'Peppermint': {
            name: 'Peppermint',
            contraindications: ['GERD', 'hiatal_hernia'],
            interactions: [],
            warnings: ['May exacerbate acid reflux.'],
        },
        'Rosemary': {
            name: 'Rosemary',
            contraindications: ['pregnancy_high_dose'],
            interactions: [],
            warnings: ['Avoid large culinary/supplemental amounts during pregnancy.'],
        },
        'Holy Basil': {
            name: 'Holy Basil',
            contraindications: ['hypoglycemia'],
            interactions: ['blood_thinner_medication'],
            warnings: ['May lower blood sugar. Monitor blood pressure.'],
        }
    };

    /**
     * Checks a list of ingredients and user constraints for safety.
     * @param ingredients List of herb names and their percentages
     * @param userConstraints List of user conditions (e.g., 'pregnancy', 'SSRIs')
     */
    static checkSafety(
        ingredients: { name: string; percentage: number }[],
        userConstraints: string[] = []
    ): SafetyCheckResult {
        const result: SafetyCheckResult = {
            safe: true,
            warnings: [],
            blockedIngredients: []
        };

        for (const ing of ingredients) {
            const profile = this.HERB_SAFETY_DATA[ing.name];
            if (!profile) continue;

            // 1. Check User Contraindications
            const userConflicts = profile.contraindications.filter(c => userConstraints.includes(c));
            const interactionConflicts = profile.interactions.filter(i => userConstraints.includes(i));

            if (userConflicts.length > 0 || interactionConflicts.length > 0) {
                result.safe = false;
                result.blockedIngredients.push(ing.name);
                result.warnings.push(
                    `CRITICAL: ${ing.name} is contraindicated due to: ${[...userConflicts, ...interactionConflicts].join(', ')}.`
                );
            }

            // 2. Check Max Percentages
            if (profile.maxSafePercentage && ing.percentage > profile.maxSafePercentage) {
                result.warnings.push(
                    `WARNING: ${ing.name} concentration (${ing.percentage}%) exceeds recommended max safe level (${profile.maxSafePercentage}%).`
                );
                // We don't necessarily block if it's just a warning, but could if strict
            }

            // 3. General Warnings
            if (profile.warnings.length > 0 && !result.blockedIngredients.includes(ing.name)) {
                result.warnings.push(...profile.warnings.map(w => `${ing.name}: ${w}`));
            }
        }

        if (!result.safe) {
            log.warn('Safety check failed for formulation', { ingredients, userConstraints, result });
        }

        return result;
    }

    /**
     * Get the safety profile for a specific herb
     */
    static getProfile(herbName: string): HerbSafetyProfile | null {
        return this.HERB_SAFETY_DATA[herbName] || null;
    }

    /**
     * List all herbs with safety data
     */
    static getSupportedHerbs(): string[] {
        return Object.keys(this.HERB_SAFETY_DATA);
    }
}
