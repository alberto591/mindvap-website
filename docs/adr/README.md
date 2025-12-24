# Architectural Decision Records (ADRs)

This directory contains Architectural Decision Records documenting significant architectural decisions made for the MindVap project.

## What is an ADR?

An Architectural Decision Record (ADR) captures an important architectural decision made along with its context and consequences. ADRs help teams understand why decisions were made and serve as documentation for future reference.

## ADR Format

Each ADR follows this structure:

- **Title**: A short, descriptive title
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: The issue motivating this decision
- **Decision**: The change being proposed or implemented
- **Consequences**: The resulting context after applying the decision

## Index of ADRs

### Core Architecture
- [ADR-0001: Hexagonal Architecture Pattern](./0001-hexagonal-architecture.md)
- [ADR-0002: SOLID Principles Enforcement](./0002-solid-principles.md)
- [ADR-0003: Dependency Injection at Composition Root](./0003-dependency-injection.md)
- [ADR-0004: No Mock/Fallback Data (Fail Fast)](./0004-fail-fast-no-mocks.md)

### Infrastructure & Operations
- [ADR-0005: Structured Logging with Context](./0005-structured-logging.md)
- [ADR-0006: Twelve-Factor Configuration](./0006-twelve-factor-config.md)
- [ADR-0007: File and Directory Layout Standards](./0007-file-layout-standards.md)

### Development Workflow
- [ADR-0008: Research Before Implementation](./0008-research-before-implementation.md)
- [ADR-0009: Documentation and Test Placement](./0009-documentation-test-placement.md)
- [ADR-0010: Decision Gate Process](./0010-decision-gate-process.md)

### Domain-Specific
- [ADR-0011: LLM/RAG Patterns and Model Routing](./0011-llm-rag-patterns.md)
- [ADR-0012: Security and Safeguarding Patterns](./0012-security-patterns.md)

## Creating New ADRs

When making significant architectural decisions:

1. Create a new ADR file using the next available number
2. Follow the standard ADR format
3. Update this README with a link to the new ADR
4. Commit the ADR along with the code implementing the decision

## References

- [ADR Organization on GitHub](https://adr.github.io/)
- Global Coding Standards (source of these ADRs)
