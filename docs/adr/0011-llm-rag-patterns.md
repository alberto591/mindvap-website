# ADR-0011: LLM/RAG Patterns and Model Routing

**Status**: Accepted

**Date**: 2024-12-24

## Context

When building LLM-powered features, common mistakes include:
- Relying on model memory instead of grounding answers in facts
- Using expensive models for simple tasks
- No safeguarding for crisis situations
- Hardcoded keyword matching instead of semantic understanding
- Wrong embedding dimensions causing compatibility issues

These lead to inaccurate responses, high costs, and potential safety issues.

## Decision

We will adopt **LLM/RAG patterns with tiered model routing** and **grounding requirements** for factual content.

### Core Principles

1. **RAG for facts**: Legal/medical/factual answers MUST be grounded in retrieved documents
2. **Tiered routing**: Use appropriate model for task complexity
3. **Standard embeddings**: 1024d embeddings unless explicitly overridden
4. **Reasoning over keywords**: Use LLM reasoning, not keyword lists
5. **Required disclaimers**: Include disclaimers where appropriate

### Ra G (Retrieval-Augmented Generation) Pattern

For any factual, legal, or domain-specific answers:

```typescript
interface IChatService {
  generateResponse(query: string, context: ConversationContext): Promise<string>;
}

class RAGChatService implements IChatService {
  constructor(
    private readonly vectorDB: IVectorDatabase,
    private readonly llm: ILLMService
  ) {}
  
  async generateResponse(query: string, context: ConversationContext): Promise<string> {
    // 1. Generate query embedding
    const queryEmbedding = await this.llm.embed(query);
    
    // 2. Retrieve relevant documents
    const relevantDocs = await this.vectorDB.similaritySearch(
      queryEmbedding,
      { limit: 5, threshold: 0.7 }
    );
    
    // 3. Build grounded prompt
    const prompt = `
      Answer the following question based ONLY on the provided context.
      If the answer is not in the context, say "I don't have enough information."
      
      Context:
      ${relevantDocs.map(doc => doc.content).join('\n\n')}
      
      Question: ${query}
      
      Answer:
    `;
    
    // 4. Generate response
    const response = await this.llm.complete(prompt);
    
    // 5. Include sources
    return {
      answer: response,
      sources: relevantDocs.map(d => ({ title: d.title, url: d.url }))
    };
  }
}
```

**Key Points**:
- ✅ Answers grounded in retrieved documents
- ✅ Citation of sources
- ✅ Explicit "I don't know" when information not available
- ❌ Never rely on model's pre-training alone for facts

### Model Tiering Strategy

Route to appropriate model based on task:

```typescript
enum ModelTier {
  FAST = 'gpt-3.5-turbo',      // $0.0015/1K tokens - Simple tasks
  BALANCED = 'gpt-4-turbo',     // $0.01/1K tokens - Most tasks
  ACCURATE = 'gpt-4',           // $0.03/1K tokens - Complex reasoning
}

class TieredLLMService {
  async complete(prompt: string, options: CompletionOptions): Promise<string> {
    const model = this.selectModel(options.complexity);
    return this.callLLM(model, prompt);
  }
  
  private selectModel(complexity: 'simple' | 'moderate' | 'complex'): ModelTier {
    switch (complexity) {
      case 'simple':   // Filler, greetings, acknowledgments
        return ModelTier.FAST;
      
      case 'moderate': // Most user questions
        return ModelTier.BALANCED;
      
      case 'complex':  // Legal analysis, complex reasoning
        return ModelTier.ACCURATE;
    }
  }
}
```

**Routing Guidelines**:
- **FAST model**: Greetings, filler, simple acknowledgments
- **BALANCED model**: Standard Q&A, recommendations (80% of queries)
- **ACCURATE model**: Legal research, complex analysis, safety-critical

### Embedding Standards

**Standard**: 1024-dimensional embeddings

```typescript
// config/settings.ts
export const config = {
  embeddings: {
    dimensions: 1024,           // Standard dimension
    model: 'text-embedding-ada-002'
  }
};

// Vector database setup
const vectorDB = new SupabaseVectorStore({
  dimensions: config.embeddings.dimensions, // Must match embeddings
  distanceMetric: 'cosine'
});
```

**Override only if**:
- Specific model requires different dimensions
- Documented reason for deviation

### Crisis/Safeguarding Pattern

Use **reasoning, NOT keyword matching**:

❌ **BAD - Keyword Matching**:
```typescript
const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end it all'];

if (CRISIS_KEYWORDS.some(kw => message.toLowerCase().includes(kw))) {
  return CRISIS_RESPONSE;
}
```

✅ **GOOD - Reasoning-Based Detection**:
```typescript
const safeguardingPrompt = `
  Analyze the following message for signs of crisis or self-harm.
  Consider context, not just keywords.
  
  Message: "${message}"
  
  Is this a crisis situation requiring intervention? (yes/no)
  Confidence: (low/medium/high)
  Reasoning: (brief explanation)
`;

const analysis = await llm.complete(safeguardingPrompt);

if (analysis.isCrisis && analysis.confidence !== 'low') {
  return {
    response: CRISIS_RESPONSE,
    alert: true,  // Alert human moderator
    confidence: analysis.confidence
  };
}
```

### Required Disclaimers

Include disclaimers for:

**Legal Content**:
```typescript
const legalDisclaimer = `
  ⚠️ This information is for educational purposes only and does not 
  constitute legal advice. Consult with a qualified attorney for advice 
  specific to your situation.
`;
```

**Medical/Health**:
```typescript
const medicalDisclaimer = `
  ⚠️ This information is not medical advice. Consult with a healthcare 
  professional before making any health-related decisions.
`;
```

**Financial**:
```typescript
const financialDisclaimer = `
  ⚠️ This is not financial advice. Consult with a certified financial 
  advisor before making investment decisions.
`;
```

### Prompt Engineering Best Practices

```typescript
// ✅ GOOD: Clear instructions, grounded, role-based
const prompt = `
  You are a helpful assistant for MindVap, an herbal vape company.
  
  Context from our knowledge base:
  ${context}
  
  User question: ${question}
  
  Instructions:
  1. Answer based ONLY on the provided context
  2. If unsure, say "I don't have that information"
  3. Be concise and helpful
  4. Include product links where relevant
  
  Answer:
`;

// ❌ BAD: Vague, ungrounded
const prompt = `Answer this: ${question}`;
```

## Consequences

### Positive

✅ **Accuracy**: Answers grounded in facts, not hallucination  
✅ **Cost-effective**: Right model for each task  
✅ **Safety**: Reasoning-based crisis detection  
✅ **Transparency**: Sources cited  
✅ **Compliance**: Disclaimers where needed

### Negative

⚠️ **Complexity**: More sophisticated than simple LLM calls  
⚠️ **Latency**: RAG adds retrieval step  
⚠️ **Maintenance**: Vector DB and embeddings to manage

### LLM/RAG Checklist

For LLM features:

- [ ] Factual answers use RAG, not model memory?
- [ ] Appropriate model tier selected?
- [ ] 1024d embeddings (or documented reason for deviation)?
- [ ] Crisis detection uses reasoning, not keywords?
- [ ] Disclaimers included where required?
- [ ] Sources cited for RAG responses?
- [ ] "I don't know" handling implemented?

## Related ADRs

- [ADR-0012: Security Patterns](./0012-security-patterns.md)
- [ADR-0008: Research Before Implementation](./0008-research-before-implementation.md)

## References

- Global Coding Standards: LLM/RAG & Domain Guardrails
- [RAG Pattern (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
