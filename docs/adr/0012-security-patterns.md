# ADR-0012: Security and Safeguarding Patterns

**Status**: Accepted

**Date**: 2024-12-24

## Context

Security vulnerabilities commonly arise from:
- SQL injection through string concatenation
- Blocking operations in async contexts
- Missing circuit breakers for external services
- Keyword-based filtering (easy to bypass)
- Hardcoded secrets in code
- Missing input validation

These create production incidents, data breaches, and poor user experience.

## Decision

We will enforce **security patterns** across all layers of the application.

### SQL Security: Parameterized Queries ONLY

**NEVER concatenate SQL strings.**

❌ **FORBIDDEN - SQL Injection Risk**:
```typescript
// CRITICAL BUG: SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${email}'`;
const result = await db.query(query);
```

✅ **REQUIRED - Parameterized Queries**:
```typescript
// ✅ Safe: Parameters escaped automatically
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [email]);
```

```typescript
// ✅ Safe: Using query builder
const users = await supabase
  .from('users')
  .select('*')
  .eq('email', email); // Automatically parameterized
```

### Async Safety: No Blocking Operations

**NEVER use blocking sync calls in async code paths.**

❌ **FORBIDDEN - Blocks Event Loop**:
```typescript
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

app.get('/data', async (req, res) => {
  // BAD: Blocks event loop
  const data = readFileSync('./data.json', 'utf-8');
  const result = execSync('ls -la');
  res.json(data);
});
```

✅ **REQUIRED - Async Operations**:
```typescript
import { readFile } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

app.get('/data', async (req, res) => {
  // ✅ Non-blocking
  const data = await readFile('./data.json', 'utf-8');
  const result = await execAsync('ls -la');
  res.json(data);
});
```

### Circuit Breakers for External Services

**ALWAYS use circuit breakers for external API calls.**

```typescript
import CircuitBreaker from 'opossum';

// Configure circuit breaker
const breakerOptions = {
  timeout: 3000,                    // 3s timeout
  errorThresholdPercentage: 50,     // Open after 50% failures
  resetTimeout: 30000               // Try again after 30s
};

const sendEmail = async (email: EmailData): Promise<void> => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(email)
  });
  
  if (!response.ok) {
    throw new Error(`SendGrid error: ${response.status}`);
  }
};

// Wrap with circuit breaker
const sendEmailWithBreaker = new CircuitBreaker(sendEmail, breakerOptions);

// Handle circuit breaker events
sendEmailWithBreaker.on('open', () => {
  logger.error('Circuit breaker opened - email service down');
});

sendEmailWithBreaker.on('halfOpen', () => {
  logger.info('Circuit breaker testing email service');
});

// Usage
try {
  await sendEmailWithBreaker.fire(emailData);
} catch (error) {
  if (error.message.includes('breaker is open')) {
    // Service is down, handle gracefully
    logger.warn('Email service unavailable, queuing for retry');
    await queueForRetry(emailData);
  } else {
    throw error;
  }
}
```

### Reasoning Over Keywords

**Use semantic analysis, NOT keyword blacklists.**

❌ **BAD - Easy to Bypass**:
```typescript
const PROFANITY_LIST = ['badword1', 'badword2', 'badword3'];

function filterContent(text: string): string {
  let filtered = text;
  PROFANITY_LIST.forEach(word => {
    filtered = filtered.replace(new RegExp(word, 'gi'), '***');
  });
  return filtered;
}

// Easily bypassed: "bad word1", "b@dword1", etc.
```

✅ **GOOD - Reasoning-Based**:
```typescript
async function moderateContent(text: string): Promise<ModerationResult> {
  const prompt = `
    Analyze the following text for policy violations:
    - Profanity or offensive language
    - Hate speech or discrimination
    - Violence or threats
    - Spam or promotional content
    
    Text: "${text}"
    
    Violations: (list any violations)
    Severity: (none/low/medium/high)
    Recommendation: (allow/flag/block)
    Reasoning: (brief explanation)
  `;
  
  const analysis = await llm.complete(prompt);
  
  return {
    allowed: analysis.recommendation === 'allow',
    flagged: analysis.recommendation === 'flag',
    blocked: analysis.recommendation === 'block',
    severity: analysis.severity,
    reasoning: analysis.reasoning
  };
}
```

### Input Validation with Type Safety

**ALWAYS validate and sanitize input.**

```typescript
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

// Define schema
const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  bio: z.string().max(500).optional()
});

// Validate and sanitize
app.post('/profile', async (req, res) => {
  // 1. Validate structure
  const validationResult = userProfileSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: validationResult.error.format()
    });
  }
  
  const profile = validationResult.data;
  
  // 2. Sanitize HTML if needed
  if (profile.bio) {
    profile.bio = sanitizeHtml(profile.bio, {
      allowedTags: ['b', 'i', 'em', 'strong'],
      allowedAttributes: {}
    });
  }
  
  // 3. Save to database (using parameterized query)
  await db.query(
    'INSERT INTO profiles (name, email, age, bio) VALUES ($1, $2, $3, $4)',
    [profile.name, profile.email, profile.age, profile.bio]
  );
  
  res.json({ success: true });
});
```

### Rate Limiting

**Protect endpoints from abuse.**

```typescript
import rateLimit from 'express-rate-limit';

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later.'
});

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,                     // Only 5 login attempts
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### Secrets Management

**NEVER hardcode secrets.**

❌ **FORBIDDEN**:
```typescript
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // BAD
const API_KEY = 'sk-1234567890abcdef'; // BAD
```

✅ **REQUIRED**:
```typescript
// config/settings.ts
import { z } from 'zod';

const secretsSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
});

export const secrets = secretsSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
});

// .env (gitignored)
// SUPABASE_URL=https://xxx.supabase.co
// SUPABASE_ANON_KEY=eyJhb...
// SENDGRID_API_KEY=SG.xxx
```

### CORS Configuration

**Configure CORS properly for production.**

```typescript
import cors from 'cors';

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://mindvap.com', 'https://www.mindvap.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Consequences

### Positive

✅ **Security**: Protection against common vulnerabilities  
✅ **Reliability**: Circuit breakers prevent cascading failures  
✅ **Performance**: Non-blocking async operations  
✅ **Type safety**: Validation catches errors early  
✅ **Compliance**: Proper handling of sensitive data

### Negative

⚠️ **Complexity**: More code for security measures  
⚠️ **Performance**: Validation/sanitization overhead  
⚠️ **Maintenance**: Keep security dependencies updated

### Security Checklist

For every feature:

- [ ] SQL queries parameterized (no string concatenation)?
- [ ] No blocking sync calls in async paths?
- [ ] External calls wrapped in circuit breakers?
- [ ] Content moderation uses reasoning, not keywords?
- [ ] Input validated with schemas (Zod)?
- [ ] HTML sanitized if accepting user content?
- [ ] Rate limiting on public endpoints?
- [ ] Secrets from environment, not hardcoded?
- [ ] CORS configured properly?

## Related ADRs

- [ADR-0006: Twelve-Factor Config](./0006-twelve-factor-config.md)
- [ADR-0011: LLM/RAG Patterns](./0011-llm-rag-patterns.md)

## References

- Global Coding Standards: Non-Negotiables, Security Patterns
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
