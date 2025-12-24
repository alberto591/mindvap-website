# Phase 2 Hexagonal Architecture - Detailed Task Breakdown

## Progress Overview

- ✅ Phase 1 Complete (OrderService, EmailServices)
- 🔄 Phase 2 In Progress
- ⏳ 5 Major Services Remaining

---

## Foundation (Already Complete)

- [x] Define `ISecurityService` port
- [x] Define `IUserRepository` port
- [x] Define `IChatRepository` port
- [x] Define `IAuthRepository` port
- [x] Implement `InMemorySecurityService`
- [x] Add security service to DI container

---

## Chunk 1: Security Service Migration (2-3 hours)

### 1.1 Update SecurityService Consumers (45 min)
- [ ] Find all `SecurityService.` static calls in codebase
- [ ] Update `login-page.tsx` to use `security` from container
- [ ] Update `registration-page.tsx` to use `security` from container
- [ ] Update any other auth pages using SecurityService
- [ ] Remove old static SecurityService export functions

### 1.2 Test Security Service (30 min)
- [ ] Create `security-service.test.ts` with mock ISecurityService
- [ ] Test rate limiting scenarios
- [ ] Test CSRF token generation/validation
- [ ] Test security event logging

### 1.3 Verify & Build (15 min)
- [ ] Run `npm run build`
- [ ] Verify zero compilation errors
- [ ] Manually test login rate limiting
- [ ] Manually test registration rate limiting

**✅ Checkpoint:** Security service fully migrated to DI

---

## Chunk 2: User/Account Service Migration (3-4 hours)

### 2.1 Implement SupabaseUserRepository (90 min)
- [ ] Create `src/infrastructure/database/supabase-user-repository.ts`
- [ ] Implement `getUserById()`
- [ ] Implement `getUserByEmail()`
- [ ] Implement `getAddresses()`
- [ ] Implement `createAddress()`
- [ ] Implement `updateAddress()`
- [ ] Implement `deleteAddress()`
- [ ] Implement `setDefaultAddress()`
- [ ] Implement `getWishlist()`
- [ ] Implement `addToWishlist()`
- [ ] Implement `removeFromWishlist()`
- [ ] Implement `isInWishlist()`

### 2.2 Refactor AccountService (60 min)
- [ ] Convert AccountService to instance-based class
- [ ] Add constructor accepting `IUserRepository`
- [ ] Update all methods to use `this.userRepository`
- [ ] Remove all direct Supabase imports
- [ ] Add structured logging with Winston

### 2.3 Update DI Container (5 min)
- [ ] Create `SupabaseUserRepository` instance
- [ ] Create `AccountService` instance with userRepository
- [ ] Export `accountService`

### 2.4 Update AccountService Consumers (45 min)
- [ ] Find all `AccountService.` static calls
- [ ] Update `profile-management-page.tsx`
- [ ] Update `address-management-page.tsx`
- [ ] Update `account-dashboard-page.tsx`
- [ ] Update `wishlist-page.tsx`
- [ ] Update any other pages using AccountService

### 2.5 Test & Verify (30 min)
- [ ] Create mock user repository
- [ ] Write tests for AccountService
- [ ] Run `npm run build`
- [ ] Test address CRUD operations
- [ ] Test wishlist operations

**✅ Checkpoint:** AccountService fully migrated to DI

---

## Chunk 3: Chat Service Migration (1.5-2 hours)

### 3.1 Implement SupabaseChatRepository (45 min)
- [ ] Create `src/infrastructure/database/supabase-chat-repository.ts`
- [ ] Implement `createSession()`
- [ ] Implement `getSession()`
- [ ] Implement `updateSession()`
- [ ] Implement `closeSession()`
- [ ] Implement `saveMessage()`
- [ ] Implement `getMessages()`
- [ ] Implement `getChatStats()`

### 3.2 Refactor ChatService (30 min)
- [ ] Convert ChatService to instance-based class
- [ ] Add constructor accepting `IChatRepository`
- [ ] Update all methods to use `this.chatRepository`
- [ ] Remove direct Supabase imports
- [ ] Keep `generateBotResponse()` as pure function

### 3.3 Update DI Container (5 min)
- [ ] Create `SupabaseChatRepository` instance
- [ ] Create `ChatService` instance with chatRepository
- [ ] Export `chatService`

### 3.4 Update ChatService Consumers (20 min)
- [ ] Find all `ChatService.` static calls
- [ ] Update chat widget/component
- [ ] Update any admin chat pages

### 3.5 Test & Verify (20 min)
- [ ] Create mock chat repository
- [ ] Write tests for ChatService
- [ ] Run `npm run build`
- [ ] Test chat session creation
- [ ] Test message sending/receiving

**✅ Checkpoint:** ChatService fully migrated to DI

---

## Chunk 4: Registration Service Migration (2-3 hours)

### 4.1 Implement SupabaseAuthRepository (60 min)
- [ ] Create `src/infrastructure/database/supabase-auth-repository.ts`
- [ ] Implement `checkEmailExists()`
- [ ] Implement `createUserAccount()`
- [ ] Implement `createPasswordResetToken()`
- [ ] Implement `validatePasswordResetToken()`
- [ ] Implement `updatePassword()`
- [ ] Implement `createEmailVerificationToken()`
- [ ] Implement `validateEmailVerificationToken()`
- [ ] Implement `markEmailAsVerified()`

### 4.2 Refactor RegistrationService (45 min)
- [ ] Convert RegistrationService to instance-based class
- [ ] Add constructor accepting `IAuthRepository` and `EmailNotificationService`
- [ ] Update `registerUser()` to use repositories
- [ ] Update `sendWelcomeEmail()` to use injected email service
- [ ] Remove direct Supabase imports
- [ ] Keep validation methods as private instance methods

### 4.3 Update DI Container (5 min)
- [ ] Create `SupabaseAuthRepository` instance
- [ ] Create `RegistrationService` with dependencies
- [ ] Export `registrationService`

### 4.4 Update RegistrationService Consumers (30 min)
- [ ] Find all `RegistrationService.` static calls
- [ ] Update `registration-page.tsx`
- [ ] Update any admin user management pages

### 4.5 Test & Verify (30 min)
- [ ] Create mock auth repository
- [ ] Write tests for RegistrationService
- [ ] Run `npm run build`
- [ ] Test user registration flow
- [ ] Verify welcome email sending

**✅ Checkpoint:** RegistrationService fully migrated to DI

---

## Chunk 5: Password Reset Service Migration (1.5-2 hours)

### 5.1 Refactor PasswordResetService (45 min)
- [ ] Convert PasswordResetService to instance-based class
- [ ] Add constructor accepting `IAuthRepository` and `EmailNotificationService`
- [ ] Update all methods to use injected dependencies
- [ ] Remove direct Supabase imports
- [ ] Add structured logging

### 5.2 Update DI Container (5 min)
- [ ] Create `PasswordResetService` with dependencies
- [ ] Export `passwordResetService`

### 5.3 Update PasswordResetService Consumers (20 min)
- [ ] Find all `PasswordResetService.` static calls
- [ ] Update `login-page.tsx` (password reset flow)
- [ ] Update any password reset pages

### 5.4 Test & Verify (30 min)
- [ ] Write tests for PasswordResetService
- [ ] Run `npm run build`
- [ ] Test password reset request
- [ ] Test password reset confirmation

**✅ Checkpoint:** PasswordResetService fully migrated to DI

---

## Chunk 6: Domain Service Migration (30 min)

### 6.1 Move CalculationService to Domain (30 min)
- [ ] Move `calculation-service.ts` to `src/domain/services/`
- [ ] Update all imports referencing CalculationService
- [ ] Keep as static methods (pure functions, no dependencies)
- [ ] Run `npm run build` to verify

**✅ Checkpoint:** Domain services properly organized

---

## Chunk 7: Configuration Extraction (1 hour)

### 7.1 Create Global Settings (45 min)
- [ ] Create `src/config/settings.ts`
- [ ] Extract rate limit configurations
- [ ] Extract email settings (sender, templates path)
- [ ] Extract order settings (shipping threshold, tax rate)
- [ ] Extract API endpoints
- [ ] Extract company info (support email, phone)

### 7.2 Update Services to Use Settings (15 min)
- [ ] Update InMemorySecurityService to use config
- [ ] Update EmailTemplateService to use config
- [ ] Update CalculationService to use config
- [ ] Remove hardcoded constants

**✅ Checkpoint:** Configuration centralized

---

## Chunk 8: Final Cleanup & Documentation (1.5 hours)

### 8.1 Remove Old Static Services (30 min)
- [ ] Delete or archive old static SecurityService
- [ ] Remove static utility exports
- [ ] Clean up unused imports

### 8.2 Update Tests (30 min)
- [ ] Ensure all services have DI-based tests
- [ ] Update existing tests to use mocks
- [ ] Run full test suite: `npm test`

### 8.3 Documentation (30 min)
- [ ] Update walkthrough.md with Phase 2 changes
- [ ] Document new ports and adapters
- [ ] Update container.ts with comments
- [ ] Add JSDoc to all repository methods

### 8.4 Final Verification
- [ ] Run `npm run build` - verify success
- [ ] Run `npm test` - verify all tests pass
- [ ] Manual testing of critical flows:
  - [ ] User registration
  - [ ] Login with rate limiting
  - [ ] Address management
  - [ ] Chat functionality
  - [ ] Password reset
  - [ ] Order placement
- [ ] Check for console errors in dev mode
- [ ] Verify no architectural violations remain

**✅ Checkpoint:** Phase 2 Complete!

---

## Estimated Timeline

| Chunk | Task | Time Estimate | Cumulative |
|-------|------|---------------|------------|
| 1 | Security Service | 2-3 hours | 2-3 hours |
| 2 | Account Service | 3-4 hours | 5-7 hours |
| 3 | Chat Service | 1.5-2 hours | 6.5-9 hours |
| 4 | Registration Service | 2-3 hours | 8.5-12 hours |
| 5 | Password Reset Service | 1.5-2 hours | 10-14 hours |
| 6 | Domain Service Migration | 30 min | 10.5-14.5 hours |
| 7 | Configuration Extraction | 1 hour | 11.5-15.5 hours |
| 8 | Final Cleanup | 1.5 hours | 13-17 hours |

**Total Estimated Time:** 13-17 hours (spread across multiple sessions)

---

## Working Strategy

### Recommended Approach
1. **One chunk per session** - Complete one full chunk before moving to next
2. **Always build & test** - End each chunk with verification
3. **Commit after each chunk** - Safe rollback points
4. **Take breaks** - Don't rush, maintain code quality

### Session Planning
- **Session 1:** Chunk 1 (Security) - 2-3 hours
- **Session 2:** Chunk 2 (Account) - 3-4 hours
- **Session 3:** Chunk 3 (Chat) - 1.5-2 hours
- **Session 4:** Chunks 4-5 (Auth services) - 3-5 hours
- **Session 5:** Chunks 6-8 (Cleanup) - 3 hours

---

## Current Status

**Completed:**
- ✅ Foundation (4 ports defined, 1 adapter implemented)

**Next Action:**
→ Start **Chunk 1: Security Service Migration**

---

## Notes

- Each checkbox represents a discrete, completable task
- Time estimates include coding, testing, and debugging
- Build verification required after each chunk
- If a chunk takes longer than estimated, split it further
- Keep implementation_plan.md as reference for technical details
