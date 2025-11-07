# Pattern #1: Chaining - Scaling Examples

This document shows how to scale the chaining pattern from 2 agents to 7+ agents, demonstrating the pattern's flexibility.

---

## Overview

The base pattern (`01-chaining.json`) uses 4 agents. These examples show:

1. **2-Agent Minimal** - Simplest viable chaining pattern
2. **5-Agent Pipeline** - Extended invoice processing workflow
3. **7-Agent Onboarding** - Complex customer onboarding (from blog post)
4. **Hybrid Pattern** - Combining Chaining + Parallel execution

---

## Example 1: 2-Agent Minimal Chain

**File**: `examples/02-minimal-2agent.json`

**Use Case**: Editorial approval workflow for blog publishing

### Flow Structure

```
Start → Draft Content → [HIL: Editor Approval] → Publish to CMS → Report → Reply
```

### Agent Breakdown

| Agent | Role | Tools | State Updates |
|-------|------|-------|---------------|
| **Agent.Draft** | Create blog post draft | `currentDateTime` | `artifacts.draft_content`<br/>`chain.step=1` |
| **HIL Gate** | Editorial review | None | None (human approval) |
| **Agent.Publish** | Publish to WordPress | `currentDateTime` | `artifacts.publication_result`<br/>`chain.step=2` |
| **Agent.Report** | Generate metrics | `currentDateTime` | `report.generated`<br/>`report.timestamp` |

### When to Use

- Simple approval workflows (2 stages max)
- Minimal complexity requirements
- Quick wins, fast implementation

### Customization Tips

- Remove HIL gate for fully automated publishing
- Add Agent.SEO between Draft and Publish for SEO optimization
- Add Agent.SocialMedia after Publish for auto-posting

### Execution Profile

| Metric | Value |
|--------|-------|
| **Total Agents** | 2 (Draft, Publish) + Report |
| **Execution Time** | ~8-10 seconds (excluding approval) |
| **Token Usage** | ~2,000-3,000 tokens |
| **Cost** | ~$0.015-$0.025 |

---

## Example 2: 5-Agent Document Pipeline

**File**: `examples/05-document-pipeline-5agent.json`

**Use Case**: Invoice processing with data enrichment and approval

### Flow Structure

```
Start → Extract (OCR) → Validate (Schema) → Enrich (Vendor Data) → [HIL: Payment Approval] → Process Payment → Report → Reply
```

### Agent Breakdown

| Agent | Role | Tools | State Updates | Model |
|-------|------|-------|---------------|-------|
| **Agent.Extract** | OCR + data extraction | `currentDateTime` | `artifacts.extracted_invoice`<br/>`chain.step=1` | Sonnet 4.5 |
| **Agent.Validate** | Schema validation | `currentDateTime` | `artifacts.validation_result`<br/>`chain.step=2` | Sonnet 4.5 |
| **Agent.Enrich** | Add vendor context | `currentDateTime` | `artifacts.enriched_data`<br/>`artifacts.risk_score`<br/>`chain.step=3` | Sonnet 4.5 |
| **HIL Gate** | Finance approval | None | None | N/A |
| **Agent.Process** | Payment processing | `currentDateTime` | `artifacts.payment_result`<br/>`chain.step=4` | Haiku (cost opt) |
| **Agent.Report** | Audit trail | `currentDateTime` | `report.generated`<br/>`report.timestamp`<br/>`chain.step=5` | Haiku |

### Data Flow

```
Input (PDF Invoice)
  ↓
extracted_invoice (JSON: vendor, amount, line_items, date)
  ↓
validation_result (boolean checks, issues array)
  ↓
enriched_data (vendor_history, risk_score, budget_impact)
  ↓
[Human Approval: Shows all context]
  ↓
payment_result (confirmation, scheduled_date, receipt)
  ↓
Final Report (complete audit trail)
```

### When to Use

- Multi-stage data transformations
- Compliance requirements (audit trail)
- Risk-based approval workflows
- Financial processing with enrichment

### Progressive Value-Add

Each stage **doubles the data value**:

1. **Extract**: Raw data (value: 1x)
2. **Validate**: Verified data (value: 2x)
3. **Enrich**: Contextualized data (value: 4x)
4. **Process**: Actionable data (value: 8x)
5. **Report**: Auditable record (value: 16x)

### Execution Profile

| Metric | Value |
|--------|-------|
| **Total Agents** | 5 (Extract, Validate, Enrich, Process) + Report |
| **Execution Time** | ~18-22 seconds (excluding approval) |
| **Token Usage** | ~5,500-7,000 tokens |
| **Cost** | ~$0.045-$0.060 |

### Cost Optimization

Replace Sonnet 4.5 with Haiku for non-critical stages:

| Change | Savings |
|--------|---------|
| Agent.Extract: Haiku | -$0.006 (75% reduction) |
| Agent.Report: Haiku | -$0.014 (70% reduction) |
| **Total Savings** | **~$0.020 per execution** (33% cost reduction) |

---

## Example 3: 7-Agent Customer Onboarding

**Use Case**: Bank onboards new customers with regulatory compliance

### Flow Structure

```
Start → Identity Verify → Risk Assessment → [HIL: Compliance Review] → Create Account → Welcome Email → Email Verification → Compliance Audit → Report → Reply
```

### Agent Breakdown

| # | Agent | Role | Key Responsibility | Risk Level |
|---|-------|------|-------------------|------------|
| 1 | **Agent.IdentityVerify** | Verify ID documents | Third-party API integration | High |
| 2 | **Agent.RiskAssessment** | Calculate risk score | KYC/AML screening | High |
| - | **HIL Gate** | Compliance officer review | Review high-risk (score > 7) | Critical |
| 3 | **Agent.CreateAccount** | CRM account creation | POST to CRM API | Medium |
| 4 | **Agent.WelcomeEmail** | Generate welcome package | Email template + personalization | Low |
| 5 | **Agent.EmailVerification** | Track email verification | Monitor email open/click | Low |
| 6 | **Agent.ComplianceAudit** | Generate audit trail | Regulatory documentation | High |
| 7 | **Agent.Report** | Onboarding summary | Complete report with timestamps | Medium |

### State Progression

```javascript
// After Agent 1: Identity Verify
{
  "customer": {
    "id": "CUST-12345",
    "verified": true,
    "verification_confidence": 0.95,
    "documents_checked": ["passport", "proof_of_address"]
  },
  "chain.step": "1"
}

// After Agent 2: Risk Assessment
{
  ...previous_state,
  "risk": {
    "score": 7.2,
    "category": "high",
    "factors": ["new_customer", "high_initial_deposit", "foreign_address"],
    "requires_review": true
  },
  "chain.step": "2"
}

// After HIL: Compliance Approval
{
  ...previous_state,
  "compliance": {
    "reviewed_by": "officer@bank.com",
    "decision": "approved_with_monitoring",
    "notes": "Legitimate business purpose confirmed",
    "timestamp": "2025-11-07T10:30:00Z"
  }
}

// After Agent 3: Create Account
{
  ...previous_state,
  "account": {
    "account_number": "ACC-7890",
    "tier": "enhanced_due_diligence",
    "created_at": "2025-11-07T10:31:00Z",
    "status": "active"
  },
  "chain.step": "3"
}

// ... continues through all stages
```

### When to Use 7+ Agent Chains

Use extended chains (7+ agents) when:

- **Regulatory requirements** mandate multi-step verification
- **Risk mitigation** requires progressive validation
- **Complex workflows** have genuine sequential dependencies
- **Audit trails** must capture each decision point

### Don't Use If:

- Stages can run in parallel (use Pattern #2 instead)
- Workflow is actually conditional routing (use Pattern #3)
- Refinement loops are needed (use Pattern #4)

### Execution Profile

| Metric | Value |
|--------|-------|
| **Total Agents** | 7 + Report |
| **Execution Time** | ~30-40 seconds (excluding approval) |
| **Token Usage** | ~8,000-10,000 tokens |
| **Cost** | ~$0.070-$0.090 |
| **Human Approval Time** | Variable (minutes to hours) |

### Compliance Considerations

This pattern ensures:

✅ **Complete Audit Trail**: Every decision recorded in state
✅ **Human Oversight**: Critical decisions require approval
✅ **Progressive Verification**: Each stage validates previous
✅ **Rollback Capability**: Can restart from any checkpoint
✅ **Immutable Records**: State preserves all artifacts

---

## Example 4: Hybrid Pattern (Chaining + Parallel)

**Use Case**: Research synthesis with parallel data gathering

### Flow Structure

```
Start → Define Query (Chain1) → [Web Search || KB Search || Database Query] (Parallel) → Aggregate Results (Chain2) → Analyze Findings (Chain3) → Report → Reply
```

### Hybrid Architecture

This pattern combines:

- **Chaining (Pattern #1)**: Sequential stages (Define → Aggregate → Analyze)
- **Parallel (Pattern #2)**: Concurrent data gathering (3 sources simultaneously)

### Node Structure

| Stage | Type | Agents | Execution |
|-------|------|--------|-----------|
| **Stage 1** | Chain | Define Query | Sequential |
| **Stage 2** | Parallel | Web + KB + DB | **Concurrent** (3x speedup) |
| **Stage 3** | Chain | Aggregate | Sequential (waits for all 3) |
| **Stage 4** | Chain | Analyze | Sequential |
| **Stage 5** | Chain | Report | Sequential |

### Data Flow

```
User Query
  ↓
Chain1: Define Query → produces search_parameters
  ↓
  ├─→ [Branch A: Web Search]     ─┐
  ├─→ [Branch B: KB Search]      ─┼─→ Run in Parallel
  └─→ [Branch C: Database Query] ─┘
       ↓ (all 3 complete)
Chain2: Aggregate → produces unified_results (deduplication, conflict resolution)
  ↓
Chain3: Analyze → produces insights (patterns, recommendations)
  ↓
Report: Summary with citations
```

### Performance Comparison

| Approach | Execution Time | Notes |
|----------|----------------|-------|
| **Pure Sequential** | Web (5s) + KB (3s) + DB (4s) = **12s** | ❌ Slow, inefficient |
| **Hybrid (This Pattern)** | max(5s, 3s, 4s) = **5s** | ✅ 58% faster |

### Implementation Guide

**Step 1**: Start with base chaining pattern (`01-chaining.json`)

**Step 2**: Replace Chain2 with parallel branches:

```json
// Delete single Chain2 agent, add 3 agents:
{
  "id": "agent_web_search",
  "type": "agentAgentflow",
  "inputs": {
    "agentName": "Agent.WebSearch",
    "agentStateUpdates": [
      { "key": "branches.web.results", "value": "{{ web_results }}" },
      { "key": "branches.web.completed", "value": "true" }
    ]
  }
}

{
  "id": "agent_kb_search",
  "type": "agentAgentflow",
  "inputs": {
    "agentName": "Agent.KBSearch",
    "agentStateUpdates": [
      { "key": "branches.kb.results", "value": "{{ kb_results }}" },
      { "key": "branches.kb.completed", "value": "true" }
    ]
  }
}

{
  "id": "agent_db_query",
  "type": "agentAgentflow",
  "inputs": {
    "agentName": "Agent.DBQuery",
    "agentStateUpdates": [
      { "key": "branches.db.results", "value": "{{ db_results }}" },
      { "key": "branches.db.completed", "value": "true" }
    ]
  }
}
```

**Step 3**: Add parallel edges (fan-out from Chain1):

```json
{
  "source": "agent_chain_1",
  "target": "agent_web_search"
},
{
  "source": "agent_chain_1",
  "target": "agent_kb_search"
},
{
  "source": "agent_chain_1",
  "target": "agent_db_query"
}
```

**Step 4**: Add aggregator (fan-in to Chain3):

```json
{
  "id": "agent_aggregator",
  "type": "agentAgentflow",
  "inputs": {
    "agentSystemPrompt": "Wait for all 3 branches to complete. Then aggregate results.\n\nWeb: {{ branches.web.results }}\nKB: {{ branches.kb.results }}\nDB: {{ branches.db.results }}\n\nPerform:\n1. Deduplication\n2. Conflict resolution\n3. Source ranking\n\nOutput: unified_results",
    "agentStateUpdates": [
      { "key": "artifacts.unified_results", "value": "{{ unified_results }}" }
    ]
  }
}
```

**Step 5**: Connect aggregator to Chain3 (analysis stage)

### When to Use Hybrid

Use hybrid patterns when:

- **Some stages are sequential** (must wait for previous)
- **Some stages are parallel** (independent data gathering)
- **Performance is critical** (minimize total execution time)
- **Data quality requires multiple sources** (web + KB + DB)

### Real-World Use Cases

1. **Competitive Intelligence**: Define query → [Web || LinkedIn || CrunchBase] → Aggregate → Analyze → Report
2. **Medical Diagnosis**: Symptoms → [Literature || Cases || Imaging] → Synthesize → Diagnose → Report
3. **Financial Analysis**: Company → [News || Financials || Social] → Aggregate → Risk Score → Report

---

## Pattern Selection Matrix

| If You Need... | Use This Example |
|----------------|------------------|
| **Simplest pattern** | 2-Agent Minimal |
| **Data enrichment pipeline** | 5-Agent Pipeline |
| **Regulatory compliance** | 7-Agent Onboarding |
| **Performance optimization** | Hybrid Parallel-Chain |
| **Standard workflow** | Base Pattern (4-agent) |

---

## Customization Quick Reference

### Adding an Agent

1. Copy existing agent node JSON
2. Change `id`, `label`, `agentName`
3. Update `position` (x: increment by 300)
4. Modify `agentSystemPrompt` for new role
5. Update `agentStateUpdates` keys
6. Add edges: `previous_agent → new_agent`, `new_agent → next_agent`

### Removing an Agent

1. Delete agent node from JSON
2. Update edge: `previous_agent → next_agent` (skip deleted agent)
3. Update Report agent to remove references to deleted agent's state

### Moving HIL Gate

1. Delete edge: `chain_N → humanInput → chain_N+1`
2. Add edges at new position: `chain_M → humanInput → chain_M+1`
3. Update HIL description to reference correct state variables

---

## Testing Your Custom Pattern

After modifying any example:

1. **Validate JSON**: `python validate_workflow.py your-pattern.json`
2. **Import to Flowise**: Agentflows → Import → Upload JSON
3. **Configure API keys**: All agents need Anthropic credentials
4. **Test with sample data**: Use test cases from TESTING.md
5. **Verify state tracking**: Check Flow State after each agent execution
6. **Measure performance**: Track execution time and token usage

---

## Additional Resources

- **[TESTING.md](./TESTING.md)** - Test cases for base pattern (adapt for examples)
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - Import and configuration steps
- **[README.md](./README.md)** - Complete pattern documentation
- **[Pattern Library](https://github.com/snedea/afv2-patterns-index)** - All 13 patterns

---

🤖 Built with Context Foundry
