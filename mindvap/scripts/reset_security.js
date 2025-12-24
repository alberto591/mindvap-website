// Direct Security Reset Script
// This script resets the security service by importing and calling the reset methods

console.log('🔧 Resetting Security Service...');

// Import the security service
import { SecurityService } from './src/services/securityService.js';

// Reset the security service completely
SecurityService.resetForTesting();

// Also clear specific user locks
SecurityService.clearRateLimitsForUser('testuser@mindvap.com');
SecurityService.clearRateLimitsForUser('test@example.com');
SecurityService.clearRateLimitsForUser('dummy@example.com');

// Clear browser storage
localStorage.clear();
sessionStorage.clear();

console.log('✅ Security service reset complete!');
console.log('   - Rate limiting data cleared');
console.log('   - User-specific locks cleared');
console.log('   - Browser storage cleared');
console.log('   - Security events cleared');
console.log('');
console.log('🔄 Please refresh your browser and try logging in again.');
console.log('   Email: testuser@mindvap.com');
console.log('   Password: password123');