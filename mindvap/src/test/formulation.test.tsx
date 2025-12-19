import { generateFormulation } from '../services/formulationService';

describe('Formulation Service', () => {
    const mockCriteria = {
        goal: 'focus' as const,
        format: 'tea' as const,
        constraints: [],
        apiKey: 'test-key'
    };

    it('should generate focus formulation', async () => {
        const result = await generateFormulation(mockCriteria);
        expect(result.name).toContain('Cognitive');
        expect(result.ingredients).toHaveLength(4);
        expect(result.ingredients[0].name).toBe('Gotu Kola');
        expect(result.instructions).toContain('Steep');
    });

    it('should generate sleep formulation', async () => {
        const result = await generateFormulation({ ...mockCriteria, goal: 'sleep' });
        expect(result.name).toContain('Deep Rest');
        expect(result.ingredients.some(i => i.name === 'Valerian Root')).toBe(true);
    });

    it('should adjust instructions based on format', async () => {
        const teaResult = await generateFormulation({ ...mockCriteria, format: 'tea' });
        expect(teaResult.instructions).toContain('Steep');

        const smokeResult = await generateFormulation({ ...mockCriteria, format: 'smoking_blend' });
        expect(smokeResult.instructions).toContain('Blend dried herbs');
    });

    it('should throw error if API key is missing', async () => {
        await expect(generateFormulation({ ...mockCriteria, apiKey: undefined }))
            .rejects.toThrow('API Key is required');
    });
});
