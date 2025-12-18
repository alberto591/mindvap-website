// Security Lock Clear Script
// This script clears rate limiting and account locks for testing

console.log('🔓 Clearing Security Locks...');
console.log('=============================\n');

// Clear localStorage data that might be causing the lock
console.log('🧹 Clearing browser storage...');
localStorage.clear();
sessionStorage.clear();

console.log('✅ Browser storage cleared\n');

console.log('📋 What was cleared:');
console.log('   - Rate limiting data');
console.log('   - Security events');
console.log('   - Session data');
console.log('   - Failed login attempts');
console.log('   - Account locks\n');

console.log('🔄 Please refresh your browser and try logging in again.');
console.log('   Use email: testuser@mindvap.com');
console.log('   Use password: password123\n');

console.log('💡 If you still see the lock:');
console.log('   1. Close all browser tabs');
console.log('   2. Clear browser cache completely');
console.log('   3. Open a new incognito/private window');
console.log('   4. Try logging in again\n');

console.log('🚀 Happy testing!');