# ADR-0006: Twelve-Factor Configuration

**Status**: Accepted

**Date**: 2024-12-24

## Context

Hardcoded configuration creates deployment nightmares:
- Can't deploy same codebase to dev/staging/prod
- Secrets committed to version control
- Need separate builds for different environments
- Configuration drift between environments

Traditional config files (JSON, YAML) aren't environment-specific and require build-time decisions.

## Decision

We will follow **Twelve-Factor App methodology** for configuration:

### Core Principles

1. **Environment variables**: All config stored in environment
2. **Strict separation**: Code and config are completely separate
3. **No defaults for secrets**: Must be explicitly set
4. **Validate at startup**: Fail fast if config is missing/invalid
5. **Documented in .env.example**: All required vars documented

### Configuration Structure

#### Environment Variables

```bash
# .env (NOT committed to git)
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_SIZE=20

# External Services
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SENDGRID_API_KEY=xxx

# Feature Flags
ENABLE_CHAT=true
ENABLE_ADMIN_PANEL=false
```

```bash
# .env.example (COMMITTED to git)
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DATABASE_URL=postgresql://localhost:5432/mindvap_dev
DATABASE_POOL_SIZE=10

# Supabase  (Required)
SUPABASE_URL=
SUPABASE_ANON_KEY=

# SendGrid (Required for email)
SENDGRID_API_KEY=

# Feature Flags
ENABLE_CHAT=true
ENABLE_ADMIN_PANEL=false
```

#### Type-Safe Configuration

```typescript
// config/settings.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  
  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_SIZE: z.coerce.number().default(10),
  
  // Supabase
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  
  // External APIs
  SENDGRID_API_KEY: z.string().min(1),
  
  // Feature Flags
  ENABLE_CHAT: z.coerce.boolean().default(true),
  ENABLE_ADMIN_PANEL: z.coerce.boolean().default(false)
});

type Env = z.infer<typeof envSchema>;

// Validate and parse environment
function loadConfig(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment configuration:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }
  
  return result.data;
}

export const config = loadConfig();
```

#### Startup Validation

```typescript
// main.ts
import { config } from './config/settings';

async function bootstrap() {
  console.log('🔧 Validating configuration...');
  
  // Config is validated in loadConfig()
  console.log(`✅ Configuration loaded for ${config.NODE_ENV}`);
  console.log(`✅ Port: ${config.PORT}`);
  console.log(`✅ Database: ${config.DATABASE_URL.split('@')[1]}`); // Don't log credentials
  
  // Start application
  const app = createApp();
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on port ${config.PORT}`);
  });
}

bootstrap().catch(error => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
```

### Frontend Configuration

For frontend (React/Vite), use environment variables with `VITE_` prefix:

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_ENABLE_DEBUG=false
```

```typescript
// config/settings.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  },
  features: {
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true'
  }
} as const;

// Validate required vars
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing required Supabase configuration');
}
```

### Per-Environment Files

Use different `.env` files for different environments:

```
.env                    # Base configuration (gitignored)
.env.local              # Local overrides (gitignored)
.env.development        # Development defaults (committed)
.env.test               # Test environment (committed)
.env.production         # Production template (committed, WITHOUT secrets)
.env.example            # Documentation (committed)
```

### Rules

**NEVER**:
- ❌ Commit `.env` files with secrets
- ❌ Hardcode configuration in source code
- ❌ Use different code for different environments
- ❌ Default to production URLs/keys

**ALWAYS**:
- ✅ Use environment variables for config
- ✅ Validate configuration at startup
- ✅ Document all vars in `.env.example`
- ✅ Fail fast if required config missing
- ✅ Use type-safe config parsing (Zod, TypeScript)

## Consequences

### Positive

✅ **Environment parity**: Same code runs everywhere  
✅ **Security**: Secrets not in version control  
✅ **Flexibility**: Easy to change config without code changes  
✅ **Type safety**: Validated config at runtime  
✅ **Documentation**: `.env.example` documents all required vars

### Negative

⚠️ **Deployment complexity**: Need to manage env vars per environment  
⚠️ **Debugging**: Harder to see what config is active  
⚠️ **Secret management**: Need secure way to store secrets

### Configuration Checklist

For every new config value:

- [ ] Add to appropriate `.env` file
- [ ] Add to `.env.example` with documentation
- [ ] Add to schema validation
- [ ] Use TypeScript type inference
- [ ] Never commit secrets
- [ ] Document in README if critical

## Related ADRs

- [ADR-0003: Dependency Injection](./0003-dependency-injection.md)
- [ADR-0004: Fail Fast](./0004-fail-fast-no-mocks.md)

## References

- [The Twelve-Factor App](https://12factor.net/config)
- [Zod for Schema Validation](https://zod.dev/)
- Global Coding Standards: Twelve-Factor Config
