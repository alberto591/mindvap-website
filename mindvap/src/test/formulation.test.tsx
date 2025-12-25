import { generateFormulation } from '../application/services/formulation-service';

describe('Formulation Service', () => {
    const mockCriteria = {
        goal: 'focus' as const,
        format: 'tea' as const,
        constraints: [],
        apiKey: 'test-key'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (global as any).fetch = jest.fn((url, options) => {
            const body = JSON.parse(options.body);
            const goal = body.messages[1].content.includes('focus') ? 'focus' :
                body.messages[1].content.includes('sleep') ? 'sleep' : 'focus';
            const format = body.messages[1].content.includes('smoking_blend') ? 'smoking_blend' : 'tea';

            const mockResponse = {
                focus: {
                    name: "Cognitive Focus Blend",
                    ingredients: [
                        { name: "Gotu Kola", percentage: 30, reason: "Focus" },
                        { name: "Ashwagandha", percentage: 30, reason: "Stress" },
                        { name: "Peppermint", percentage: 20, reason: "Flavor" },
                        { name: "Rosemary", percentage: 20, reason: "Clarity" }
                    ],
                    instructions: format === 'tea' ? "Steep in hot water for 5-7 minutes." : "Blend dried herbs and roll."
                },
                sleep: {
                    name: "Deep Rest Blend",
                    ingredients: [
                        { name: "Valerian Root", percentage: 40, reason: "Sleep" },
                        { name: "Chamomile", percentage: 30, reason: "Relax" },
                        { name: "Lavender", percentage: 20, reason: "Aroma" },
                        { name: "Lemon Balm", percentage: 10, reason: "Calm" }
                    ],
                    instructions: format === 'tea' ? "Steep in hot water for 10 minutes." : "Blend dried herbs."
                }
            };

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    choices: [{
                        message: {
                            content: JSON.stringify(mockResponse[goal as keyof typeof mockResponse])
                        }
                    }]
                })
            });
        });
    });

    it('should generate focus formulation', async () => {
        const result = await generateFormulation(mockCriteria);
        expect(result.name).toContain('Focus');
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
