# ADR-0009: Documentation and Test Placement

**Status**: Accepted

**Date**: 2024-12-24

## Context

Poor organization of documentation and tests creates:
- Cluttered root directories
- Difficulty finding test files
- Inconsistent naming
- Unclear documentation structure

Projects often accumulate random markdown files in the root, making navigation difficult.

## Decision

We will enforce **strict rules for documentation and test placement** with clear naming conventions.

### Documentation Rules

#### Allowed Root Markdown Files (ONLY)

These files MAY exist in project root:

```
mindvap/
├── README.md                   # Project overview
├── ARCHITECTURE.md             # Architecture guide
├── GETTING_STARTED.md          # Quick start guide
├── DEVELOPMENT.md              # Development setup
├── DEPLOYMENT.md               # Deployment instructions
├── STATUS.md                   # Project status
└── CHANGELOG.md                # Version history
```

**ALL other documentation** must follow the documentation manifest structure.

#### Documentation Manifest Structure

All other docs go in `docs/` following this structure:

```
docs/
├── adr/                        # Architectural Decision Records
│   ├── README.md              # ADR index
│   └── {nnnn}-{slug}.md       # e.g., 0001-hexagonal-architecture.md
│
├── guides/                     # How-to guides
│   ├── deployment.md
│   ├── testing.md
│   └── troubleshooting.md
│
├── reference/                  # API reference, schemas
│   ├── api-endpoints.md
│   ├── database-schema.md
│   └── environment-variables.md
│
├── reports/                    # Status reports, retrospectives
│   └── {YYYY-MM-DD}_{slug}.md # e.g., 2024-12-24_sprint-review.md
│
└── archive/                    # Deprecated docs
    └── old-design.md
```

#### Markdown Naming Conventions

**General Rules**:
- Lowercase with hyphens: `getting-started.md`
- Descriptive, not generic: `supabase-setup.md` not `setup.md`

**Date-Prefixed** (for reports):
```
2024-12-24_deployment-status.md
2024-12-24_performance-analysis.md
```

**Number-Prefixed** (for sequences):
```
0001-introduction.md
0002-core-concepts.md
```

**ADRs**:
```
{nnnn}-{descriptive-slug}.md
0001-hexagonal-architecture.md
0012-security-patterns.md
```

### Test Placement Rules

#### ❌ NEVER Place Tests Here

Tests must **NEVER** be in:
- Root directory
- `src/` directory (alongside source code)
- Backend root directory
- Scattered throughout codebase

#### ✅ ALWAYS Place Tests Here

**Option 1: Dedicated Test Directory** (Preferred)

```
src/
├── test/
│   ├── unit/
│   │   ├── account-service.test.ts
│   │   ├── user-entity.test.ts
│   │   └── validation-utils.test.ts
│   │
│   ├── integration/
│   │   ├── supabase-repository.test.ts
│   │   ├── api-endpoints.test.ts
│   │   └── email-service.test.ts
│   │
│   └── e2e/
│       ├── user-registration.test.ts
│       └── checkout-flow.test.ts
```

**Option 2: Script Tests**

```
scripts/
└── test/
    ├── test_database_migration.ts
    ├── test_seed_data.ts
    └── test_config_validation.ts
```

#### Test Naming Conventions

**Unit/Integration Tests**:
```
{module-name}.test.ts
account-service.test.ts
user-repository.test.ts
```

**E2E Tests** (describe flow):
```
{flow-description}.test.ts
user-registration-flow.test.ts
checkout-with-discount.test.ts
```

**Script Tests**:
```
test_{target}_{qualifier}.ts
test_migration_rollback.ts
test_email_templates.ts
```

### Creating New Documentation

When creating documentation:

1. **Determine type**: Guide? Reference? Report? ADR?
2. **Choose location**: Based on type
3. **Name appropriately**: Follow naming conventions
4. **Update index**: Add link to relevant README

#### Example: Creating a Guide

```bash
# Create guide
touch docs/guides/setting-up-supabase.md

# Update guides README (create if doesn't exist)
echo "- [Setting Up Supabase](./setting-up-supabase.md)" >> docs/guides/README.md
```

### Validation Commands

Check for violations:

```bash
# Find tests in wrong location
find src -name "*.test.ts" ! -path "*/test/*"
find . -maxdepth 1 -name "*.test.ts"

# Find docs in root (excluding allowed files)
find . -maxdepth 1 -name "*.md" \
  ! -name "README.md" \
  ! -name "ARCHITECTURE.md" \
  ! -name "GETTING_STARTED.md" \
  ! -name "DEVELOPMENT.md" \
  ! -name "DEPLOYMENT.md" \
  ! -name "STATUS.md" \
  ! -name "CHANGELOG.md"

# Find improperly named report files
find docs/reports -name "*.md" ! -name "????-??-??_*.md"
```

### Documentation Checklist

When adding documentation:

- [ ] File type appropriate for content (guide vs reference)?
- [ ] Placed in correct directory?
- [ ] Named according to conventions?
- [ ] Linked from relevant index/README?
- [ ] Follows markdown formatting guidelines?
- [ ] Code examples are tested and working?

### Test Checklist

When adding tests:

- [ ] Tests in `src/test/` or `scripts/test/`?
- [ ] Named with `.test.ts` suffix?
- [ ] In appropriate subdirectory (unit/integration/e2e)?
- [ ] Not scattered alongside source code?

## Consequences

### Positive

✅ **Discoverability**: Easy to find documentation  
✅ **Organization**: Clear structure for different doc types  
✅ **Consistency**: Predictable naming  
✅ **Clean root**: Not cluttered with random files  
✅ **Maintainability**: Easy to update and reorganize

### Negative

⚠️ **Rigid structure**: Must learn conventions  
⚠️ **Moving files**: Need to update links when reorganizing

### Enforcement

- **Pre-commit hooks**: Check for files in wrong locations
- **CI checks**: Validate naming conventions
- **Code review**: Check documentation placement
- **Linting**: Automated checks for violations

## Related ADRs

- [ADR-0007: File Layout Standards](./0007-file-layout-standards.md)
- [ADR-0008: Research Before Implementation](./0008-research-before-implementation.md)

## References

- Global Coding Standards: Documentation & Tests Placement
- [Divio Documentation System](https://documentation.divio.com/)
