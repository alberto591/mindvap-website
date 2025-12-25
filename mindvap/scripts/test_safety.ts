
import { SafetyService } from '../src/application/services/safety-service.js';

function runSafetyTests() {
    console.log('--- herb safety verification ---');

    // Test 1: Safe Blend
    const safeBlend = [
        { name: 'Lavender', percentage: 50 },
        { name: 'Chamomile', percentage: 50 }
    ];
    console.log('Test 1 (Safe Blend):', SafetyService.checkSafety(safeBlend));

    // Test 2: Contraindicated (Pregnancy + Ashwagandha)
    const ashwaBlend = [{ name: 'Ashwagandha', percentage: 100 }];
    console.log('Test 2 (Ashwagandha + Pregnancy):', SafetyService.checkSafety(ashwaBlend, ['pregnancy']));

    // Test 3: Multiple Conflicts (St. John\'s Wort + SSRIs)
    const sjwBlend = [{ name: 'St. John\'s Wort', percentage: 50 }];
    console.log('Test 3 (SJW + SSRIs):', SafetyService.checkSafety(sjwBlend, ['SSRIs']));

    // Test 4: Max Percentage Warning
    const valerianHeavy = [{ name: 'Valerian Root', percentage: 60 }];
    console.log('Test 4 (Valerian > 30%):', SafetyService.checkSafety(valerianHeavy));

    console.log('--- verification complete ---');
}

runSafetyTests();
