import { generateSearchQuery, analyzeProvidersWithAI } from '../services/sourcing-service';

describe('Sourcing Service', () => {
    const mockCriteria = {
        herbName: 'Lavender',
        region: 'Provence',
        certifications: ['organic'],
        minQuantity: '5kg',
        apiKey: 'test-key'
    };

    it('should generate correct search query', () => {
        const query = generateSearchQuery(mockCriteria);
        expect(query).toContain('"Lavender"');
        expect(query).toContain('bulk wholesale supplier');
        expect(query).toContain('site:Provence OR location:Provence');
        expect(query).toContain('(organic)');
        expect(query).toContain('-amazon -ebay -etsy');
    });

    it('should analyze providers with AI (mock)', async () => {
        const results = await analyzeProvidersWithAI(mockCriteria);
        expect(results).toHaveLength(3);
        expect(results[0].name).toBeDefined();
        expect(results[0].relevanceScore).toBeGreaterThan(0);
    });

    it('should throw error if API key is missing', async () => {
        await expect(analyzeProvidersWithAI({ ...mockCriteria, apiKey: undefined }))
            .rejects.toThrow('API Key is required');
    });
});
