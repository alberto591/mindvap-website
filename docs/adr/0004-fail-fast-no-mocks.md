# ADR-0004: No Mock/Fallback Data (Fail Fast)

**Status**: Accepted

**Date**: 2024-12-24

## Context

When systems encounter errors, there's a temptation to hide failures by:
- Returning mock/fallback data to avoid breaking the UI
- Catching exceptions and silently logging them
- Degrading gracefully to "dummy" data

While this might seem user-friendly, it creates serious problems:
- **Hidden bugs**: Failures go unnoticed in production
- **Incorrect behavior**: Users see stale or fake data
- **False confidence**: Metrics show "success" when systems are broken
- **Debugging nightmares**: Hard to trace when/where failures occurred

## Decision

We will **NEVER hide failures with mock or fallback data** in production code paths. Instead, we **fail fast and visibly**.

### Core Principles

1. **Real errors, real responses**: If something fails, the error must be visible
2. **No silent fallbacks**: Don't catch exceptions just to return dummy data
3. **Fail fast**: Detect and report errors as early as possible
4. **User-visible failures**: Show error UI instead of fake data

### Frontend (React/TypeScript)

❌ **WRONG - Hiding Failure**:
```typescript
async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products', error);
    // BAD: Return mock data on failure
    return MOCK_PRODUCTS; 
  }
}
```

✅ **CORRECT - Fail Visibly**:
```typescript
async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    // Log with context
    logger.error('Failed to fetch products', { error, url: '/products' });
    // Rethrow - let UI handle with Error Boundary
    throw new Error('Unable to load products. Please try again later.');
  }
}

// UI Component with Error Boundary
function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(setError); // Show error UI
  }, []);
  
  if (error) {
    return <ErrorDisplay message={error.message} onRetry={refetch} />;
  }
  
  return <>{products.map(p => <ProductCard key={p.id} product={p} />)}</>;
}
```

### Backend (Node.js/Express)

❌ **WRONG - Silent Failure**:
```typescript
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await userRepo.findById(req.params.id);
    res.json(user);
  } catch (error) {
    console.log('Error fetching user', error);
    // BAD: Return mock user
    res.json({ id: req.params.id, name: 'Unknown User' });
  }
});
```

✅ **CORRECT - Real Error Response**:
```typescript
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: `User ${req.params.id} not found`
      });
    }
    
    res.json(user);
  } catch (error) {
    // Log with full context and traceback
    logger.error('Failed to fetch user', {
      userId: req.params.id,
      error: error.message,
      stack: error.stack
    });
    
    // Return real error to client
    res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Unable to fetch user. Please try again later.',
      requestId: req.id // For support tracking
    });
  }
});
```

### When Mock Data IS Acceptable

Mock/fallback data is ONLY acceptable in these contexts:

✅ **Development seeds**:
```typescript
// scripts/seed-dev-data.ts
if (process.env.NODE_ENV === 'development') {
  await seedDatabase(MOCK_PRODUCTS);
}
```

✅ **Test fixtures**:
```typescript
// tests/user.test.ts
const mockUser = { id: '123', name: 'Test User' };
```

✅ **Explicit demos** (clearly marked):
```typescript
// Demo mode with clear indicator
if (isDemoMode) {
  return {
    data: DEMO_DATA,
    isDemo: true // CLEARLY marked
  };
}
```

❌ **NEVER in production code paths**

## Consequences

### Positive

✅ **Visibility**: Failures are immediately obvious  
✅ **Reliability**: Forces us to fix real issues  
✅ **Debuggability**: Clear error trails with context  
✅ **User trust**: Users know when something is wrong  
✅ **Monitoring**: Metrics accurately reflect system health

### Negative

⚠️ **User experience**: Users see error messages instead of content  
⚠️ **Support burden**: May require user support for transient issues

### Mitigation

- **Retry logic**: Implement exponential backoff for transient failures
- **Circuit breakers**: Prevent cascading failures
- **Helpful error messages**: Guide users on what to do
- **Monitoring**: Alert on error rate spikes
- **Error boundaries**: Graceful UI degradation without fake data

## Error Handling Checklist

When handling errors:

- [ ] Log error with full context (user ID, request ID, stack trace)
- [ ] Return appropriate HTTP status code (4xx, 5xx)
- [ ] Include actionable error message for users
- [ ] Provide request ID for support tracking
- [ ] **DO NOT** return mock/fallback data
- [ ] **DO NOT** silently catch and ignore

## Related ADRs

- [ADR-0005: Structured Logging](./0005-structured-logging.md)
- [ADR-0006: Twelve-Factor Configuration](./0006-twelve-factor-config.md)

## References

- [Fail Fast Principle](https://www.martinfowler.com/ieeeSoftware/failFast.pdf)
- Global Coding Standards: No Mock/Fallback Data section
