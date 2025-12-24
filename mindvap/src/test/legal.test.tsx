import { generateLegalSearchQuery, analyzeRegulationsWithAI } from '../services/legal-service';

describe('Legal Service', () => {
    const mockCriteria = {
        productName: 'Blue Lotus',
        jurisdiction: 'UK',
        intendedUse: 'tea' as const,
        apiKey: 'test-key'
    };

    it('should generate correct legal search query', () => {
        const query = generateLegalSearchQuery(mockCriteria);
        expect(query).toContain('"Blue Lotus" legal status UK');
        expect(query).toContain('novel food catalogue UK');
    });

    it('should analyze regulations with AI (mock)', async () => {
        const result = await analyzeRegulationsWithAI(mockCriteria);
        expect(result.status).toBeDefined();
        expect(result.complianceStrategy).toBeDefined();
        expect(result.riskLevel).toBeDefined();
    });

    it('should detect restricted items (CBD)', async () => {
        const cbdCriteria = { ...mockCriteria, productName: 'CBD Oil' };
        const result = await analyzeRegulationsWithAI(cbdCriteria);
        expect(result.status).toBe('Restricted');
        expect(result.summary).toContain('Novel Food');
    });

    it('should detect gray area items (Incense)', async () => {
        const incenseCriteria = { ...mockCriteria, intendedUse: 'incense' as const };
        const result = await analyzeRegulationsWithAI(incenseCriteria);
        expect(result.status).toBe('Gray Area');
        expect(result.complianceStrategy).toContain('Aromatic Potpourri');
    });
});
