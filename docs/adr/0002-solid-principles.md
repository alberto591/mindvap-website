# ADR-0002: SOLID Principles Enforcement

**Status**: Accepted

**Date**: 2024-12-24

## Context

Object-oriented codebases often degrade into unmaintainable "big balls of mud" with:
- God classes handling multiple unrelated concerns
- Fragile inheritance hierarchies
- Fat interfaces forcing implementations of unused methods
- High-level modules tightly coupled to low-level details

Without enforced design principles, code becomes difficult to test, extend, and maintain.

## Decision

We will **strictly enforce all five SOLID principles** throughout the codebase:

### S - Single Responsibility Principle

**Each module has ONE reason to change.**

✅ **Do**: Create focused classes/modules
```typescript
class UserProfileService { }      // Manages user profile data
class UserNotificationService { } // Handles notifications
```

❌ **Don't**: Create catch-all "manager" or "helper" classes
```typescript
class UserManager { // BAD: Too many responsibilities
  saveProfile() { }
  sendEmail() { }
  validatePassword() { }
  generateReport() { }
}
```

### O - Open/Closed Principle

**Behavior should be extendable via interfaces/registries, NOT flags or if/else chains.**

✅ **Do**: Use strategy pattern or registries
```typescript
interface IBotResponseStrategy {
  respond(input: string): Promise<string>;
}

class CrisisResponseStrategy implements IBotResponseStrategy { }
class GeneralResponseStrategy implements IBotResponseStrategy { }
```

❌ **Don't**: Use flags or hardcoded lists
```typescript
if (type === 'crisis') { /* ... */ }
else if (type === 'general') { /* ... */ }
```

### L - Liskov Substitution Principle

**Substitutes must honor contracts. No `NotImplemented` in subclasses.**

✅ **Do**: Implement all interface methods properly
```typescript
class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User> { /* real implementation */ }
}
```

❌ **Don't**: Violate interface contracts
```typescript
class MockUserRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    throw new Error('Not implemented'); // BAD
  }
}
```

### I - Interface Segregation Principle

**Clients should not depend on methods they don't use.**

✅ **Do**: Create focused, role-based interfaces
```typescript
interface IAddressRepository { }
interface IWishlistRepository { }
interface IPaymentMethodRepository { }
```

❌ **Don't**: Create bloated interfaces
```typescript
interface IUserRepository {
  // Too many unrelated methods
  getAddresses() { }
  getWishlist() { }
  getPaymentMethods() { }
  getActivityLog() { }
  // ...20 more methods
}
```

### D - Dependency Inversion Principle

**High-level modules depend on abstractions, NOT concrete implementations.**

✅ **Do**: Depend on interfaces, inject at composition root
```typescript
class AccountService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService
  ) { }
}
```

❌ **Don't**: Import infrastructure directly
```typescript
import { SupabaseUserRepository } from '../infrastructure/db'; // BAD
class AccountService {
  private userRepo = new SupabaseUserRepository(); // BAD
}
```

## Consequences

### Positive

✅ **Maintainability**: Each class has a clear, focused purpose  
✅ **Testability**: Easy to mock dependencies via interfaces  
✅ **Extensibility**: Add new behavior without modifying existing code  
✅ **Flexibility**: Swap implementations without changing clients  
✅ **Readability**: Smaller, focused classes are easier to understand

### Negative

⚠️ **More files**: Interfaces separate from implementations  
⚠️ **Verbosity**: More code upfront for proper abstraction  
⚠️ **Over-engineering risk**: Could be overkill for trivial features

### Enforcement Checklist

Use this checklist during code reviews:

- [ ] **S**: Does this class/module have more than one reason to change?
- [ ] **O**: Are behaviors extended via interfaces/registries, not flags?
- [ ] **L**: Do all substitutes honor their contracts?
- [ ] **I**: Are interfaces focused on specific client needs?
- [ ] **D**: Do high-level modules depend only on abstractions?

## Related ADRs

- [ADR-0001: Hexagonal Architecture](./0001-hexagonal-architecture.md)
- [ADR-0003: Dependency Injection](./0003-dependency-injection.md)

## References

- [SOLID Principles (Uncle Bob Martin)](https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html)
- Global Coding Standards: SOLID Enforcement Checklist
