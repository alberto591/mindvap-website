# ADR-0003: Dependency Injection at Composition Root

**Status**: Accepted

**Date**: 2024-12-24

## Context

Tightly coupled code with `new` operators scattered throughout makes it:
- Impossible to test components in isolation
- Difficult to swap implementations
- Hard to manage object lifecycles
- Unclear what dependencies a component needs

Global singletons and service locators hide dependencies and create tight coupling that's difficult to break.

## Decision

We will use **constructor-based dependency injection** with all dependencies resolved at the **composition root**.

### Core Principles

1. **Constructor injection only**: Dependencies injected via constructor parameters
2. **Composition root**: Single place where object graph is composed (typically `main.ts` or `container.ts`)
3. **No `new` in business logic**: Application code should never call `new` on infrastructure
4. **Explicit dependencies**: All dependencies declared in constructor signature
5. **No global singletons** (except the DI container itself)

### Implementation Pattern

#### 1. Define Interfaces (Ports)

```typescript
// domain/ports/i-user-repository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

#### 2. Implement Adapters

```typescript
// infrastructure/db/supabase-user-repository.ts
export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly client: SupabaseClient) { }
  
  async findById(id: string): Promise<User | null> {
    // Implementation
  }
}
```

#### 3. Use Constructor Injection

```typescript
// application/services/account-service.ts
export class AccountService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger
  ) { }
  
  async updateProfile(userId: string, data: ProfileData): Promise<void> {
    const user = await this.userRepo.findById(userId);
    // Use injected dependencies
  }
}
```

#### 4. Compose at Root

```typescript
// config/container.ts
export class Container {
  private static userRepository: IUserRepository;
  private static accountService: AccountService;
  
  static initialize() {
    const supabaseClient = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
    const logger = new ConsoleLogger();
    const emailService = new SendGridEmailService(env.SENDGRID_API_KEY);
    
    this.userRepository = new SupabaseUserRepository(supabaseClient);
    this.accountService = new AccountService(
      this.userRepository,
      emailService,
      logger
    );
  }
  
  static getAccountService(): AccountService {
    return this.accountService;
  }
}
```

```typescript
// main.ts
Container.initialize();
const accountService = Container.getAccountService();
```

### TypeScript/JavaScript Specifics

Since we don't have a mature DI framework like Spring or Guice, we use a **manual DI container**:

```typescript
// config/container.ts - Composition Root
export class Container {
  // Singleton instances
  private static instances = new Map<string, any>();
  
  static register<T>(key: string, factory: () => T): void {
    this.instances.set(key, factory());
  }
  
  static get<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`No instance registered for key: ${key}`);
    }
    return instance as T;
  }
}
```

## Consequences

### Positive

✅ **Testability**: Easy to inject mocks/stubs for testing  
✅ **Flexibility**: Change implementations without modifying clients  
✅ **Transparency**: All dependencies visible in constructor  
✅ **Lifecycle control**: Centralized object lifecycle management  
✅ **Type safety**: TypeScript enforces dependency contracts

### Negative

⚠️ **Boilerplate**: More setup code in composition root  
⚠️ **Manual effort**: No auto-wiring like Spring/Guice  
⚠️ **Container complexity**: Large apps need sophisticated container

### Rules

**NEVER**:
- ❌ Call `new` on infrastructure classes in business logic
- ❌ Use global singletons (except DI container)
- ❌ Use service locator pattern
- ❌ Hide dependencies (get them from somewhere other than constructor)

**ALWAYS**:
- ✅ Declare all dependencies in constructor
- ✅ Depend on interfaces, not concrete classes
- ✅ Compose object graph at application startup
- ✅ Use DI container as the ONLY global singleton

## Related ADRs

- [ADR-0001: Hexagonal Architecture](./0001-hexagonal-architecture.md)
- [ADR-0002: SOLID Principles](./0002-solid-principles.md)
- [ADR-0006: Twelve-Factor Configuration](./0006-twelve-factor-config.md)

## References

- [Dependency Injection in TypeScript](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [Composition Root Pattern](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)
- Global Coding Standards: Non-Negotiables (Architecture & Safety)
