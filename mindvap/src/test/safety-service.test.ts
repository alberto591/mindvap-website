
import { SafetyService } from '../application/services/safety-service';

describe('SafetyService', () => {
    test('should identify a safe blend', () => {
        const ingredients = [
            { name: 'Lavender', percentage: 50 },
            { name: 'Chamomile', percentage: 50 }
        ];
        const result = SafetyService.checkSafety(ingredients);
        expect(result.safe).toBe(true);
        expect(result.warnings.length).toBeGreaterThan(0); // Should have general info warnings
    });

    test('should block Ashwagandha during pregnancy', () => {
        const ingredients = [{ name: 'Ashwagandha', percentage: 100 }];
        const result = SafetyService.checkSafety(ingredients, ['pregnancy']);
        expect(result.safe).toBe(false);
        expect(result.blockedIngredients).toContain('Ashwagandha');
        expect(result.warnings[0]).toContain('contraindicated');
    });

    test('should block St. John\'s Wort when taking SSRIs', () => {
        const ingredients = [{ name: 'St. John\'s Wort', percentage: 50 }];
        const result = SafetyService.checkSafety(ingredients, ['SSRIs']);
        expect(result.safe).toBe(false);
        expect(result.blockedIngredients).toContain('St. John\'s Wort');
    });

    test('should warn about Valerian Root high concentration', () => {
        const ingredients = [{ name: 'Valerian Root', percentage: 60 }];
        const result = SafetyService.checkSafety(ingredients);
        expect(result.warnings.some(w => w.includes('recommended max safe level'))).toBe(true);
    });

    test('should handle unknown herbs gracefully', () => {
        const ingredients = [{ name: 'Unknown Herb', percentage: 100 }];
        const result = SafetyService.checkSafety(ingredients);
        expect(result.safe).toBe(true);
        expect(result.warnings.length).toBe(0);
    });
});
