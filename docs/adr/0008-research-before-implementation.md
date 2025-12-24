# ADR-0008: Research Before Implementation

**Status**: Accepted

**Date**: 2024-12-24

## Context

Developers often dive into implementation without proper research, leading to:
- Using outdated or deprecated APIs
- Implementing patterns that don't work as expected
- Security vulnerabilities from copy-pasting Stack Overflow
- Wasted time implementing the wrong solution
- Technical debt from quick hacks

"Move fast and break things" fails when you don't know what you're building.

## Decision

We will **mandate research before implementation** for specific categories of work.

### When Research is REQUIRED

Research is **mandatory** before working on:

1. **New features**: Understand requirements and existing solutions
2. **External APIs/libraries**: Read official docs, not just blog posts
3. **Complex fixes**: Research root cause before applying patches
4. **Security**: Validate all security-related patterns
5. **Performance**: Understand performance characteristics
6. **Architecture**: Research design patterns and trade-offs
7. **Dependency upgrades**: Check breaking changes and migration guides
8. **Prompt engineering**: Test prompts, don't guess

### Trust Order for Sources

When researching, trust sources in this order:

**Tier 1 - Most Trusted**:
1. Official documentation
2. Official GitHub repository examples
3. Vendor-provided SDK code samples

**Tier 2 - Generally Reliable**:
4. Reputable engineering blogs (Netflix Tech Blog, Martin Fowler, etc.)
5. Published books by recognized authorities
6. Conference talks by maintainers

**Tier 3 - Verify Before Using**:
7. Stack Overflow (verify answer date and votes)
8. Medium articles (check author credentials)
9. ChatGPT/LLMs (always validate with official docs)

**Tier 4 - High Skepticism**:
10. Random blogs without credentials
11. Outdated tutorials
12. Forums without moderation

### Research Documentation Template

For every research task, document:

```markdown
## Research: [Topic]

### Sources Consulted
- [Official Docs](https://link.to/docs) - Reviewed sections X, Y, Z
- [GitHub Example](https://github.com/repo/example) - Studied implementation
- [Blog Post](https://link) - Additional context

### Key Findings
1. **Finding 1**: Brief description
2. **Finding 2**: Brief description
3. **Finding 3**: Brief description

### Decision & Rationale
We will use [approach X] because:
- Reason 1
- Reason 2
- Reason 3

### Alternatives Considered & Rejected
- **Alternative A**: Rejected because...
- **Alternative B**: Rejected because...

### Implementation Notes
- Watch out for: [Gotcha 1]
- Configuration needed: [Config]
- Testing approach: [How to test]
```

### Quick Validation Checklist

Before using any external code/pattern:

- [ ] **Package exists**: Verified on npm/PyPI
- [ ] **Still maintained**: Recent commits/releases
- [ ] **No known CVEs**: Checked security advisories
- [ ] **License compatible**: MIT/Apache/BSD (check for copyleft)
- [ ] **API signatures match**: Verified against official docs
- [ ] **Pattern is current**: Not deprecated or superseded
- [ ] **Examples work**: Tested sample code locally

### Examples

#### ✅ GOOD Research

```markdown
## Research: Supabase Real-time Subscriptions

### Sources Consulted
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime) 
- [Supabase JS Client Source](https://github.com/supabase/supabase-js)
- [Supabase Realtime Examples](https://github.com/supabase/supabase/tree/master/examples/realtime)

### Key Findings
1. Subscriptions auto-reconnect on disconnect
2. Must enable realtime on tables in Supabase dashboard
3. Row-level security applies to subscriptions

### Decision
Use `supabase.channel()` for subscriptions with error handling:
- Handles reconnection automatically
- Works with RLS policies
- Supports presence and broadcast

### Implementation Notes
- Enable realtime in Supabase dashboard
- Subscribe to specific events (INSERT, UPDATE, DELETE)
- Clean up subscriptions on unmount
```

#### ❌ BAD - No Research

```typescript
// Found this on Stack Overflow, hope it works! 🤞
const subscription = supabase
  .from('users')
  .on('*', payload => console.log(payload))
  .subscribe();
```

### Time Budget

Allocate research time proportionally:

| Task Complexity | Research Time |
|----------------|---------------|
| Simple feature | 15-30 min |
| Medium feature | 1-2 hours |
| Complex feature | 4-8 hours |
| Architecture decision | 1-2 days |

"Hours of debugging can save you minutes of reading documentation."

## Consequences

### Positive

✅ **Higher quality**: Solutions based on best practices  
✅ **Fewer bugs**: Understanding prevents common mistakes  
✅ **Security**: Validated patterns, not vulnerable code  
✅ **Performance**: Optimal approaches upfront  
✅ **Knowledge sharing**: Research documents help team  
✅ **Faster debugging**: Understanding aids troubleshooting

### Negative

⚠️ **Slower initial progress**: Research takes time  
⚠️ **Analysis paralysis**: Over-researching delays implementation  
⚠️ **Documentation overhead**: Writing research takes effort

### Mitigation

- **Time-box research**: Set deadlines to avoid over-analyzing
- **Share research**: Avoid duplicate research across team
- **Templates**: Use standard template for consistency
- **Review**: Include research in code review checklist

## Enforcement

### Code Review Checklist

For reviewers, ask:

- [ ] Was research done for this feature/fix?
- [ ] Are sources cited and trustworthy?
- [ ] Were alternatives considered?
- [ ] Is the approach validated against official docs?
- [ ] Are there Edge cases documented?

### Research Artifacts

Research should produce:
1. **Markdown doc**: In `docs/research/` or as comment in PR
2. **Working example**: Proof of concept code
3. **Test coverage**: Validate assumptions with tests

## Related ADRs

- [ADR-0010: Decision Gate Process](./0010-decision-gate-process.md)
- [ADR-0009: Documentation Placement](./0009-documentation-test-placement.md)

## References

- Global Coding Standards: Research Before Implementation
- [How to Read Documentation](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)
