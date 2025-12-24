# ADR-0007: File and Directory Layout Standards

**Status**: Accepted

**Date**: 2024-12-24

## Context

Inconsistent file organization leads to:
- Difficulty finding files
- Unclear architectural boundaries
- Naming conflicts and confusion
- Harder onboarding for new developers

Without enforced conventions, projects become disorganized over time.

## Decision

We will enforce **strict file and directory layout standards** based on hexagonal architecture and established conventions.

### Root Directory Structure

```
mindvap/
├── src/                  # Source code
│   ├── domain/          # Business logic (no dependencies)
│   ├── application/     # Use cases, orchestration
│   ├── infrastructure/  # External adapters
│   ├── presentation/    # API, UI, DTOs
│   ├── config/          # DI container, settings
│   └── test/            # Unit/integration tests
├── docs/                # Documentation
│   ├── adr/            # Architectural decisions
│   ├── guides/         # How-to guides
│   ├── reports/        # Status reports
│   └── reference/      # API docs, specs
├── scripts/            # Operational scripts
├── public/             # Static assets
├── .env.example        # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Source Code Layout (Hexagonal)

```
src/
├── domain/                      # Core business logic
│   ├── entities/               # Business entities
│   ├── value-objects/          # Immutable value types
│   ├── services/               # Domain services
│   ├── ports/                  # Interface contracts
│   │   ├── i-user-repository.ts
│   │   ├── i-payment-service.ts
│   │   └── i-email-service.ts
│   └── events/                 # Domain events
│
├── application/                 # Use cases & orchestration
│   ├── use-cases/              # Application logic
│   ├── services/               # Application services
│   └── dtos/                   # Data transfer objects
│
├── infrastructure/              # External adapters
│   ├── db/                     # Database adapters
│   │   ├── supabase-user-repository.ts
│   │   └── migrations/
│   ├── llm/                    # LLM adapters
│   ├── cache/                  # Caching adapters
│   ├── email/                  # Email adapters
│   ├── events/                 # Event bus adapters
│   └── security/               # Security adapters
│
├── presentation/                # User interfaces
│   ├── api/                    # REST/GraphQL endpoints
│   ├── components/             # UI components (React)
│   ├── pages/                  # Page components
│   ├── contexts/               # React contexts
│   └── hooks/                  # React hooks
│
├── config/                      # Configuration
│   ├── container.ts            # DI container (composition root)
│   └── settings.ts             # Environment config
│
└── test/                        # Tests
    ├── unit/                   # Unit tests
    ├── integration/            # Integration tests
    └── e2e/                    # End-to-end tests
```

### File Naming Conventions

#### General Rules

- **Lowercase with hyphens or snake_case**: `user-service.ts`, `email_template.ts`
- **One module per responsibility**: Avoid "God files"
- **Descriptive names**: `supabase-user-repository.ts` not `repo.ts`

#### TypeScript/React Files

```
✅ GOOD
components/
  ├── layout/
  │   ├── Header.tsx           # PascalCase for components
  │   └── Footer.tsx
  ├── auth/
  │   ├── login-form.tsx       # kebab-case acceptable
  │   └── registration-form.tsx
  
✅ GOOD  
services/
  ├── account-service.ts       # kebab-case for services
  ├── email-service.ts
  
✅ GOOD
domain/ports/
  ├── i-user-repository.ts     # i- prefix for interfaces
  ├── i-payment-service.ts
```

#### Script Naming

```
scripts/
  ├── migrate_database.ts      # {action}_{target}.ts
  ├── seed_dev_data.ts
  ├── backup_production.ts
  ├── validate_config.ts
  └── cleanup_logs.ts
```

**Actions**: `migrate`, `seed`, `backup`, `validate`, `cleanup`, `sync`, `import`, `export`

#### Test Naming

```
test/
  ├── unit/
  │   ├── account-service.test.ts     # {module}.test.ts
  │   ├── user-entity.test.ts
  │
  ├── integration/
  │   ├── supabase-repository.test.ts
  │
  └── e2e/
      ├── user-registration.test.ts
```

### Documentation Layout

```
docs/
├── adr/                          # Architectural Decision Records
│   ├── README.md                # ADR index
│   ├── 0001-hexagonal.md       # {number}-{slug}.md
│   └── 0002-solid.md
│
├── guides/                       # How-to guides
│   ├── deployment.md
│   └── testing.md
│
├── reports/                      # Status reports
│   └── {YYYY-MM-DD}_{slug}.md   # Date-prefixed
│
└── reference/                    # API reference
    ├── api-endpoints.md
    └── database-schema.md
```

### Markdown File Naming

- **Lowercase with hyphens**: `api-documentation.md`
- **Date-prefixed for reports**: `2024-12-24_deployment-status.md`
- **Numbered for sequences**: `0001-introduction.md`

### Test Placement Rules

**NEVER place tests in**:
- ❌ Root directory
- ❌ `src/` directory (alongside source)
- ❌ Backend root

**ALWAYS place tests in**:
- ✅ `src/test/{unit|integration|e2e}/`
- ✅ `scripts/test/` for script tests

### Dependency Direction Rules

Based on hexagonal architecture:

```
presentation  →  application  →  domain
     ↓              ↓
infrastructure ────┘

✅ Allowed: presentation imports from application
✅ Allowed: application imports from domain
✅ Allowed: infrastructure implements domain ports
❌ FORBIDDEN: domain imports from infrastructure
❌ FORBIDDEN: domain imports from application
```

### Validation Commands

```bash
# Check for domain layer violations
grep -r "from.*infrastructure" src/domain/
grep -r "from.*application" src/domain/

# Check for tests in wrong locations
find src -name "*.test.ts" ! -path "*/test/*"

# Check for uppercase filenames (except components)
find src -name "[A-Z]*.ts" ! -path "*/components/*"
```

## Consequences

### Positive

✅ **Predictability**: Easy to find files  
✅ **Clarity**: Architecture visible in structure  
✅ **Scalability**: Clear where new code belongs  
✅ **Tooling**: Easy to write automated checks  
✅ **Onboarding**: New developers understand layout quickly

### Negative

⚠️ **Rigidity**: Must follow conventions strictly  
⚠️ **Refactoring**: Moving files requires updating imports  
⚠️ **Verbosity**: More directories, deeper nesting

### Layout Checklist

When adding new files:

- [ ] File in correct layer (domain/application/infrastructure/presentation)?
- [ ] Naming convention followed (lowercase, hyphenated)?
- [ ] Tests in `src/test/` not alongside source?
- [ ] Dependencies flow inward only?
- [ ] One responsibility per file?

## Related ADRs

- [ADR-0001: Hexagonal Architecture](./0001-hexagonal-architecture.md)
- [ADR-0002: SOLID Principles](./0002-solid-principles.md)

## References

- Global Coding Standards: File/Layout Standards
- [TypeScript Project Structure Best Practices](https://github.com/microsoft/TypeScript/wiki/Performance#using-project-references)
