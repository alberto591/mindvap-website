# ADR-0005: Structured Logging with Context

**Status**: Accepted

**Date**: 2024-12-24

## Context

Traditional logging with simple string messages creates major problems:
- **Impossible to search/query**: Can't filter by user ID, request ID, etc.
- **Missing context**: What was the user doing when this error occurred?
- **No correlation**: Can't trace a request across services
- **Poor observability**: Hard to build dashboards and alerts

Example of inadequate logging:
```typescript
console.log('User login failed'); // WHAT user? WHY failed? WHEN?
```

## Decision

We will use **structured logging with context** for all logging operations.

### Core Requirements

1. **Structured format**: Log as JSON/objects, not strings
2. **Context fields**: Include relevant metadata with every log
3. **Exception info**: Always include stack traces for errors
4. **Lifecycle logging**: Log start/end of operations with context IDs
5. **Basic metrics**: Track counters, latency, error rates

### Logging Structure

Every log entry must include:

```typescript
{
  timestamp: ISO8601,
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context: {
    requestId: string,      // Trace requests
    userId?: string,        // Who triggered this
    operation: string,      // What operation
    // ... other relevant fields
  },
  error?: {                 // For errors only
    message: string,
    stack: string,
    code?: string
  },
  metrics?: {               // Optional performance data
    duration: number,
    timestamp: number
  }
}
```

### Frontend Logging (TypeScript/React)

```typescript
// infrastructure/logging/logger.ts
export interface ILogger {
  debug(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, error: Error, context?: Record<string, any>): void;
}

export class ConsoleLogger implements ILogger {
  error(message: string, error: Error, context: Record<string, any> = {}) {
    console.error({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent
      },
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }
  
  info(message: string, context: Record<string, any> = {}) {
    console.log({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    });
  }
}
```

**Usage**:
```typescript
// ✅ GOOD: Structured with context
logger.error('Failed to update profile', error, {
  userId: user.id,
  operation: 'updateProfile',
  fields: ['name', 'email']
});

// ❌ BAD: Unstructured
console.log('Error updating profile:', error);
```

### Backend Logging (Node.js)

Use a proper logging library like `winston` or `pino`:

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add request context
app.use((req, res, next) => {
  req.id = uuidv4();
  req.logger = logger.child({
    requestId: req.id,
    userId: req.user?.id,
    method: req.method,
    path: req.path
  });
  next();
});

// Usage in route handlers
router.post('/update-profile', async (req, res) => {
  req.logger.info('Profile update started', {
    fields: Object.keys(req.body)
  });
  
  try {
    await accountService.updateProfile(req.user.id, req.body);
    req.logger.info('Profile update successful');
    res.json({ success: true });
  } catch (error) {
    req.logger.error('Profile update failed', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Update failed' });
  }
});
```

### Lifecycle Logging Pattern

Log operation start and completion with correlation IDs:

```typescript
async function processOrder(orderId: string) {
  const correlationId = uuidv4();
  
  logger.info('Order processing started', {
    correlationId,
    orderId,
    operation: 'processOrder'
  });
  
  try {
    // ... processing logic
    
    logger.info('Order processing completed', {
      correlationId,
      orderId,
      duration: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Order processing failed', error, {
      correlationId,
      orderId
    });
    throw error;
  }
}
```

### Metrics Integration

Track basic metrics alongside logs:

```typescript
const metrics = {
  counters: new Map<string, number>(),
  timers: new Map<string, number[]>()
};

function trackOperation<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  
  return fn()
    .then(result => {
      const duration = Date.now() - start;
      metrics.counters.set(`${name}.success`, (metrics.counters.get(`${name}.success`) || 0) + 1);
      metrics.timers.set(name, [...(metrics.timers.get(name) || []), duration]);
      
      logger.info(`${name} completed`, { duration, success: true });
      return result;
    })
    .catch(error => {
      const duration = Date.now() - start;
      metrics.counters.set(`${name}.error`, (metrics.counters.get(`${name}.error`) || 0) + 1);
      
      logger.error(`${name} failed`, error, { duration });
      throw error;
    });
}
```

## Consequences

### Positive

✅ **Searchability**: Query logs by user, request, operation  
✅ **Debugging**: Full context for every log entry  
✅ **Traceability**: Follow requests across the system  
✅ **Observability**: Build dashboards and alerts  
✅ **Metrics**: Basic performance tracking built-in

### Negative

⚠️ **Verbosity**: More data per log entry  
⚠️ **Storage**: Structured logs take more space  
⚠️ **Setup**: Requires logging infrastructure

### Logging Checklist

For every log statement:

- [ ] Use structured format (JSON/object)
- [ ] Include relevant context (user, request, operation)
- [ ] For errors: include `exc_info`/`stack`
- [ ] Use appropriate log level
- [ ] Include correlation/request IDs
- [ ] No sensitive data (passwords, tokens, PII)

## Related ADRs

- [ADR-0004: Fail Fast](./0004-fail-fast-no-mocks.md)
- [ADR-0006: Twelve-Factor Config](./0006-twelve-factor-config.md)

## References

- [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)
- Global Coding Standards: Non-Negotiables (Structured Logging)
