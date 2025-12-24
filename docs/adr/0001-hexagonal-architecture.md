# ADR-0001: Hexagonal Architecture Pattern

**Status**: Accepted

**Date**: 2024-12-24

## Context

Large applications struggle with tight coupling between business logic and infrastructure concerns (databases, APIs, UI). This leads to:
- Difficulty testing business logic in isolation
- Hard-to-replace infrastructure components
- Business rules polluted with I/O and framework code
- Unclear boundaries between layers

Traditional layered architectures often allow infrastructure concerns to leak into the domain layer, making the codebase rigid and difficult to evolve.

## Decision

We will adopt **Hexagonal Architecture** (Ports and Adapters) with strict rules:

### Layer Structure

```
domain/          # Pure business logic, entities, ports
application/     # Use cases, orchestration
infrastructure/  # Adapters: DB, LLM, cache, events, external APIs
presentation/    # API, UI, DTOs
config/          # DI container, settings
```

### Dependency Rules

1. **Inward-only dependencies**: Each layer can only depend on layers closer to the center
   - `domain` ← `application` ← `infrastructure` ← `presentation`
   - Domain has NO dependencies on outer layers
   
2. **Domain purity**: The domain layer contains ONLY:
   - Business entities and value objects
   - Domain services (pure business logic)
   - Port interfaces (contracts)
   - Domain events
   - **NO I/O, NO frameworks, NO infrastructure**

3. **Side effects at edges**: All I/O operations happen in the infrastructure layer:
   - Database access
   - External API calls
   - File system operations
   - Logging, messaging, etc.

### Ports and Adapters

- **Ports** (interfaces) defined in domain layer
- **Adapters** (implementations) in infrastructure layer
- Example: `IUserRepository` (port) implemented by `SupabaseUserRepository` (adapter)

## Consequences

### Positive

✅ **Testability**: Domain logic can be tested without databases or external dependencies  
✅ **Flexibility**: Easy to swap infrastructure (e.g., Postgres → MongoDB)  
✅ **Clarity**: Clear boundaries between business logic and technical concerns  
✅ **Independent evolution**: Domain and infrastructure can evolve separately  
✅ **Technology agnostic**: Domain logic doesn't depend on specific frameworks

### Negative

⚠️ **More files**: Requires interfaces and implementations separately  
⚠️ **Learning curve**: Team needs to understand architectural boundaries  
⚠️ **Discipline required**: Easy to accidentally violate dependency rules

### Mitigation

- Use linting/static analysis to detect violations (e.g., `grep` for infrastructure imports in domain)
- Code review checklist for architectural compliance
- Clear documentation and examples of proper patterns

## Related ADRs

- [ADR-0002: SOLID Principles](./0002-solid-principles.md)
- [ADR-0003: Dependency Injection](./0003-dependency-injection.md)

## References

- [Hexagonal Architecture (Alistair Cockburn)](https://alistair.cockburn.us/hexagonal-architecture/)
- Global Coding Standards: Architecture & Safety section
