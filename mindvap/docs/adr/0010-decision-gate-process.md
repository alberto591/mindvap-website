# ADR-0010: Decision Gate Process

**Status**: Accepted

**Date**: 2024-12-24

## Context

Significant technical decisions made in isolation or without proper review lead to:
- Wasted effort implementing the wrong solution
- Technical debt from suboptimal choices
- Team misalignment on approach
- Difficulty reversing decisions later
- Unknown trade-offs and limitations

Major decisions need structured review and approval.

## Decision

We will use a **Decision Gate Process** requiring approval before proceeding with significant technical work.

### When Decision Gate is REQUIRED

Trigger decision gate for:

1. **New frameworks/libraries**: Adding Express, React Query, etc.
2. **New datastores**: Redis, Elasticsearch, new database
3. **New message queues**: RabbitMQ, Kafka, etc.
4. **Cloud services**: New AWS/GCP/Azure services
5. **Public API shapes**: REST endpoints, GraphQL schema
6. **New environment variables**: Configuration changes
7. **Build/logging/testing stack changes**: Webpack, Jest config
8. **Third-party licenses**: New licensing requirements
9. **Data models/migrations**: Database schema changes
10. **Performance/cost-impacting patterns**: Caching, optimization strategies

### Decision Template

Use this template for all decision gate requests:

```markdown
# Decision Gate: [Brief Title]

## 1. Context

**Problem we're solving:**
- What pain point are we addressing?
- Why do we need this now?
- What happens if we don't do this?

**Current state:**
- How do we handle this today?
- What are the limitations?

## 2. Options Considered

### Option A: [Name]

**Description**: Brief description of approach

**Pros**:
- Pro 1
- Pro 2
- Pro 3

**Cons**:
- Con 1
- Con 2

**Effort**: X days/weeks

**Risks**:
- Risk 1
- Risk 2

---

### Option B: [Name]

[Same structure as Option A]

---

### Option C: [Name]

[Same structure as Option A]

## 3. Recommendation

**Proposed choice**: Option [X]

**Rationale**:
1. Reason 1 - why this best solves the problem
2. Reason 2 - trade-offs we're accepting
3. Reason 3 - alignment with architecture

**Fallback plan**:
If this doesn't work out, we will [fallback approach]

## 4. Blocking Questions

**Questions that MUST be answered before proceeding:**
1. Question 1?
2. Question 2?
3. Question 3?

**Open concerns:**
- Concern 1
- Concern 2
```

### Example Decision Gate

```markdown
# Decision Gate: Chat Message Storage Strategy

## 1. Context

**Problem**: We need to store chat history for user conversations. Current in-memory storage loses data on refresh and doesn't scale across devices.

**Current state**: Messages stored in React state, lost on page reload.

## 2. Options Considered

### Option A: Supabase JSONB Column

**Pros**:
- Already using Supabase
- Simple schema
- Built-in RLS support

**Cons**:
- JSONB querying less performant
- Limited full-text search

**Effort**: 1-2 days

### Option B: Separate Messages Table

**Pros**:
- Better query performance
- Easier to implement search
- More flexible

**Cons**:
- More complex schema
- Requires migration

**Effort**: 3-4 days

### Option C: External Service (Firebase)

**Pros**:
- Real-time out of box
- Scalable

**Cons**:
- Another dependency
- Cost implications
- Different auth model

**Effort**: 1 week + ongoing maintenance

## 3. Recommendation

**Proposed**: Option B (Separate Messages Table)

**Rationale**:
1. Performance matters for chat UX
2. Search is key feature requirement
3. Worth the extra effort upfront
4. Stays within our existing stack

**Fallback**: If migration difficult, use Option A temporarily

## 4. Blocking Questions

1. Do we need real-time updates initially?
2. What's max expected message volume per user?
3. Should we partition by user or by conversation?
```

### Approval Process

1. **Create decision document**: Use template above
2. **Submit for review**: Share with team lead/architect
3. **Discuss**: Schedule sync discussion if needed
4. **Pause implementation**: DO NOT implement workarounds
5. **Get explicit approval**: Written approval required
6. **Proceed**: Once approved, implement recommended option

### Rules

**DO NOT**:
- ❌ Implement workarounds while waiting for approval
- ❌ Make the decision implicitly by starting implementation
- ❌ Skip the gate because "it's urgent"
- ❌ Present only one option

**DO**:
- ✅ Present multiple alternatives
- ✅ Be honest about trade-offs
- ✅ Identify blocking questions
- ✅ Wait for explicit approval

### Fast-Track for Emergencies

For production emergencies:

1. **Implement hotfix** (do what's needed)
2. **Document decision retroactively**
3. **Review in next available meeting**
4. **Create follow-up task** if needed

But this is for **emergencies only**, not convenience.

## Consequences

### Positive

✅ **Better decisions**: Multiple perspectives considered  
✅ **Team alignment**: Everyone knows the approach  
✅ **Avoid waste**: Don't build wrong solution  
✅ **Knowledge transfer**: Decisions documented  
✅ **Risk mitigation**: Trade-offs explicit upfront

### Negative

⚠️ **Slower initial progress**: Approval adds delay  
⚠️ **Process overhead**: Documentation and review time  
⚠️ **Frustration**: Blocked on approvals

### Mitigation

- **48-hour SLA**: Reviewers commit to 2-day turnaround
- **Template**: Standard template speeds up creation
- **Async approval**: Don't always need meetings
- **Fast-track option**: For genuine emergencies

### Decision Gate Checklist

Before requesting approval:

- [ ] Trigger condition met (framework/datastore/API/etc.)?
- [ ] At least 3 options considered?
- [ ] Pros/cons listed for each?
- [ ] Effort estimated?
- [ ] Recommendation with rationale?
- [ ] Blocking questions identified?
- [ ] Fallback plan included?

## Related ADRs

- [ADR-0008: Research Before Implementation](./0008-research-before-implementation.md)
- [ADR-0002: SOLID Principles](./0002-solid-principles.md)

## References

- Global Coding Standards: Decision Gate (approval required)
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
