# AFv2 Pattern #1: Chaining - Test Cases

## Overview

**Pattern:** Sequential 4-agent chaining pipeline with Human-in-the-Loop (HIL) approval gate
**Flow:** Start → Chain1 → HIL Gate → Chain2 → Chain3 → Report → Direct Reply
**Repository:** https://github.com/snedea/afv2-pattern-01-chaining

---

## Prerequisites

### 1. Import Pattern into Flowise

1. Open Flowise UI (http://localhost:3000)
2. Navigate to **Agentflows** section
3. Click **"Add New"** → **"Import Agentflow"**
4. Upload `01-chaining.json`
5. Pattern should load with 10 nodes:
   - Start
   - Agent.Chain1
   - HIL Approval Gate (Human Input)
   - Agent.Chain2
   - Agent.Chain3
   - Agent.Report
   - Direct Reply
   - 3 Sticky Notes (documentation)

### 2. Configure API Keys

**All 4 agents require Anthropic API key configuration:**

1. Click on **Agent.Chain1** node
2. In the **Model** dropdown, select model configuration:
   - **Credential:** Select your "Anthropic API Key" credential
   - **Model Name:** `claude-sonnet-4-5-20250929`
   - **Temperature:** `0.2` (default)
   - **Streaming:** `true` (default)

3. Repeat for:
   - **Agent.Chain2**
   - **Agent.Chain3**
   - **Agent.Report**

4. Save the workflow

### 3. Verify Node Configuration

**Expected Configuration:**

| Node | Type | Tools | State Updates | Key Feature |
|------|------|-------|---------------|-------------|
| Agent.Chain1 | Agent | `currentDateTime` | `artifacts.artifact_1`, `chain.step=1` | Produces artifact_1 |
| HIL Approval Gate | HumanInput | N/A | N/A | Human approval checkpoint |
| Agent.Chain2 | Agent | `currentDateTime`, `calculator` | `artifacts.artifact_2`, `chain.step=2` | Consumes artifact_1, produces artifact_2 |
| Agent.Chain3 | Agent | `currentDateTime` | `artifacts.final_draft`, `chain.step=3`, `output` | Consumes artifact_2, produces final_draft |
| Agent.Report | Agent | `currentDateTime` | `report.generated`, `report.timestamp` | Generates execution report |
| Direct Reply | DirectReply | N/A | N/A | Terminal node (hideOutput: true) |

---

## Test Cases

### TC-1.1: Basic Sequential Chain (Happy Path)

**Objective:** Verify complete 3-stage sequential processing with HIL approval

**Input:**
```
Create a product launch plan. Start with market research, then develop a marketing strategy, and finally create a detailed execution timeline.
```

**Expected Execution Flow:**

1. **Agent.Chain1 Executes:**
   - Performs initial market research analysis
   - Produces `artifact_1` (research findings)
   - Updates state: `artifacts.artifact_1`, `chain.step=1`

2. **HIL Approval Gate Activates:**
   - Displays approval prompt to user:
     ```
     Agent Chain 2 requires approval to proceed. This agent will use write and edit tools to modify artifacts.

     Artifact 1 summary: [artifact_1 contents]

     Approve continuation to Chain 2?
     ```
   - **User Action:** Click **"Proceed"** button

3. **Agent.Chain2 Executes:**
   - Reads `artifacts.artifact_1` from state
   - Develops marketing strategy based on research
   - Uses `calculator` tool for budget calculations
   - Produces `artifact_2` (marketing strategy)
   - Updates state: `artifacts.artifact_2`, `chain.step=2`

4. **Agent.Chain3 Executes:**
   - Reads `artifacts.artifact_2` from state
   - Creates detailed execution timeline
   - Produces `final_draft` (complete plan)
   - Updates state: `artifacts.final_draft`, `chain.step=3`, `output`

5. **Agent.Report Executes:**
   - Generates structured report with:
     - Final artifact (from `state.output`)
     - Execution metrics (steps completed, timestamps)
     - Artifact lineage (artifact_1 → artifact_2 → final_draft)
     - HIL approval records
   - Updates state: `report.generated=true`, `report.timestamp`

6. **Direct Reply Returns:**
   - Displays completion message:
     ```
     ✅ Chain Processing Complete

     Final artifact generated successfully through 3-stage sequential pipeline with HIL approval.

     📊 Execution Summary:
     • Chain1 → artifact_1 (initial draft)
     • HIL Gate → approval checkpoint
     • Chain2 → artifact_2 (refined version)
     • Chain3 → final_draft (complete)
     • Report → structured documentation

     The complete processing report has been generated and is ready for review.
     ```

**Validation Checklist:**

- [ ] Agent.Chain1 executed and produced artifact_1
- [ ] State contains `artifacts.artifact_1` with research findings
- [ ] State contains `chain.step=1` after Chain1
- [ ] HIL Approval Gate displayed approval prompt
- [ ] Approval prompt included artifact_1 summary
- [ ] User successfully clicked "Proceed" button
- [ ] Agent.Chain2 executed ONLY after approval
- [ ] Agent.Chain2 accessed `artifacts.artifact_1` from state
- [ ] Agent.Chain2 produced artifact_2 (marketing strategy)
- [ ] State contains `chain.step=2` after Chain2
- [ ] Agent.Chain3 accessed `artifacts.artifact_2` from state
- [ ] Agent.Chain3 produced final_draft
- [ ] State contains `artifacts.final_draft` and `output`
- [ ] State contains `chain.step=3` after Chain3
- [ ] Agent.Report generated structured report
- [ ] Report includes artifact lineage (artifact_1 → artifact_2 → final_draft)
- [ ] Report includes HIL approval records
- [ ] Direct Reply displayed completion message
- [ ] **CRITICAL:** Chain2 did NOT execute before HIL approval

**Success Criteria:**
- All 4 agents executed in sequence: Chain1 → Chain2 → Chain3 → Report
- HIL gate successfully blocked Chain2 until user approval
- Each agent accessed the correct previous artifact from state
- Final report includes complete artifact lineage
- Workflow terminated cleanly at Direct Reply node

---

### TC-1.2: HIL Rejection Path

**Objective:** Verify workflow stops when user rejects at HIL gate

**Input:**
```
Analyze customer feedback data and create an action plan for service improvements.
```

**Expected Execution Flow:**

1. **Agent.Chain1 Executes:**
   - Analyzes customer feedback data
   - Produces `artifact_1` (feedback analysis)
   - Updates state: `artifacts.artifact_1`, `chain.step=1`

2. **HIL Approval Gate Activates:**
   - Displays approval prompt with artifact_1 summary
   - **User Action:** Click **"Reject"** button

3. **Workflow Terminates:**
   - Agent.Chain2 does NOT execute
   - Agent.Chain3 does NOT execute
   - Agent.Report does NOT execute
   - Direct Reply does NOT execute
   - Workflow stops at HIL gate rejection path

**Validation Checklist:**

- [ ] Agent.Chain1 executed successfully
- [ ] State contains `artifacts.artifact_1`
- [ ] State contains `chain.step=1` (NOT 2 or 3)
- [ ] HIL Approval Gate displayed approval prompt
- [ ] User successfully clicked "Reject" button
- [ ] **CRITICAL:** Agent.Chain2 did NOT execute
- [ ] **CRITICAL:** Agent.Chain3 did NOT execute
- [ ] **CRITICAL:** Agent.Report did NOT execute
- [ ] State does NOT contain `artifacts.artifact_2`
- [ ] State does NOT contain `artifacts.final_draft`
- [ ] State does NOT contain `chain.step=2` or `chain.step=3`
- [ ] Workflow stopped cleanly at rejection path
- [ ] No error messages displayed

**Success Criteria:**
- ONLY Agent.Chain1 executed (Chain2/Chain3/Report did not run)
- HIL gate successfully blocked all downstream agents on rejection
- State correctly shows `chain.step=1` only
- Workflow terminated cleanly without errors

**Expected Behavior:**
```
✅ PASS if:
- chain.step = 1
- artifacts.artifact_1 exists
- artifacts.artifact_2 does NOT exist
- Agent.Chain2/Chain3/Report never executed

❌ FAIL if:
- chain.step > 1
- Any downstream agent executed after rejection
- Error messages displayed
```

---

### TC-1.3: Artifact Versioning and State Tracking

**Objective:** Verify proper artifact lineage and state management across the chain

**Input:**
```
Transform raw sales data into an executive dashboard. Step 1: Clean and validate data. Step 2: Calculate key metrics. Step 3: Create visualization recommendations.
```

**Expected Execution Flow:**

1. **Agent.Chain1 Executes:**
   - Cleans and validates raw sales data
   - Produces `artifact_1` (cleaned data)
   - State after Chain1:
     ```json
     {
       "artifacts.artifact_1": "[cleaned data results]",
       "chain.step": "1"
     }
     ```

2. **HIL Approval Gate:**
   - User clicks "Proceed"

3. **Agent.Chain2 Executes:**
   - Reads `artifacts.artifact_1` from state
   - Calculates key metrics using `calculator` tool
   - Produces `artifact_2` (metrics analysis)
   - State after Chain2:
     ```json
     {
       "artifacts.artifact_1": "[cleaned data results]",  // Preserved
       "artifacts.artifact_2": "[metrics analysis]",       // New
       "chain.step": "2"                                   // Updated
     }
     ```

4. **Agent.Chain3 Executes:**
   - Reads `artifacts.artifact_2` from state
   - Creates visualization recommendations
   - Produces `final_draft` (complete dashboard plan)
   - State after Chain3:
     ```json
     {
       "artifacts.artifact_1": "[cleaned data results]",     // Preserved
       "artifacts.artifact_2": "[metrics analysis]",          // Preserved
       "artifacts.final_draft": "[dashboard plan]",           // New
       "chain.step": "3",                                     // Updated
       "output": "[dashboard plan]"                           // Final output
     }
     ```

5. **Agent.Report Executes:**
   - Reads ALL artifacts from state
   - Generates report with artifact lineage:
     ```
     Artifact Lineage:
     1. artifact_1 (Chain1): Cleaned data
     2. artifact_2 (Chain2): Metrics analysis
     3. final_draft (Chain3): Dashboard plan
     ```
   - State after Report:
     ```json
     {
       "artifacts.artifact_1": "[cleaned data results]",
       "artifacts.artifact_2": "[metrics analysis]",
       "artifacts.final_draft": "[dashboard plan]",
       "chain.step": "3",
       "output": "[dashboard plan]",
       "report.generated": "true",                           // New
       "report.timestamp": "[current timestamp]"             // New
     }
     ```

**Validation Checklist:**

- [ ] **After Chain1:**
  - State contains `artifacts.artifact_1`
  - State contains `chain.step=1`
  - artifact_1 contains cleaned data results

- [ ] **After Chain2:**
  - State STILL contains `artifacts.artifact_1` (not overwritten)
  - State contains `artifacts.artifact_2` (new)
  - State contains `chain.step=2` (updated)
  - artifact_2 references or builds upon artifact_1

- [ ] **After Chain3:**
  - State STILL contains `artifacts.artifact_1` (preserved)
  - State STILL contains `artifacts.artifact_2` (preserved)
  - State contains `artifacts.final_draft` (new)
  - State contains `output` (final output)
  - State contains `chain.step=3` (updated)
  - final_draft references or builds upon artifact_2

- [ ] **After Report:**
  - State STILL contains ALL previous artifacts
  - State contains `report.generated=true`
  - State contains `report.timestamp` with valid timestamp
  - Report includes artifact lineage showing all 3 stages
  - Report shows progression: artifact_1 → artifact_2 → final_draft

**Success Criteria:**
- All artifacts preserved in state (no overwrites)
- `chain.step` correctly increments: 1 → 2 → 3
- Each artifact references or builds upon previous artifact
- Final report includes complete artifact lineage
- State contains all expected keys at each stage

**State Tracking Validation:**

```javascript
// Expected state progression

// After Chain1
{
  "artifacts": { "artifact_1": "..." },
  "chain": { "step": "1" }
}

// After Chain2
{
  "artifacts": {
    "artifact_1": "...",  // ✅ Preserved
    "artifact_2": "..."   // ✅ New
  },
  "chain": { "step": "2" }
}

// After Chain3
{
  "artifacts": {
    "artifact_1": "...",      // ✅ Preserved
    "artifact_2": "...",      // ✅ Preserved
    "final_draft": "..."      // ✅ New
  },
  "chain": { "step": "3" },
  "output": "..."             // ✅ Final output
}

// After Report
{
  "artifacts": {
    "artifact_1": "...",      // ✅ Preserved
    "artifact_2": "...",      // ✅ Preserved
    "final_draft": "..."      // ✅ Preserved
  },
  "chain": { "step": "3" },
  "output": "...",
  "report": {
    "generated": "true",      // ✅ New
    "timestamp": "..."        // ✅ New
  }
}
```

---

## Common Issues & Debugging

### Issue 1: HIL Gate Not Displaying Approval Prompt

**Symptoms:**
- Workflow executes Chain1 but stops without showing approval prompt
- No approval dialog appears in Flowise UI

**Debugging Steps:**
1. Check **HIL Approval Gate** node configuration:
   - `humanInputDescriptionType` should be `"fixed"`
   - `humanInputDescription` should contain approval message with `{{ artifacts.artifact_1 }}` variable
   - `humanInputEnableFeedback` should be `true`

2. Verify state contains `artifacts.artifact_1` after Chain1:
   - Check Chain1's "Update State" configuration
   - Key: `artifacts.artifact_1`
   - Value: `{{ artifact_1 }}`

3. Check Flowise UI console for errors

**Solution:**
- Ensure Chain1 properly updates state with `artifacts.artifact_1`
- Verify HIL gate is using "fixed" description type
- Confirm approval message references correct state variable

---

### Issue 2: Agent.Chain2 Executes Before HIL Approval

**Symptoms:**
- Chain2 runs immediately after Chain1 without waiting for approval
- HIL gate appears to be bypassed

**Debugging Steps:**
1. Verify edge connections:
   - Chain1 should connect to HIL gate (NOT directly to Chain2)
   - HIL gate "Proceed" output should connect to Chain2
   - Check `edges` array in JSON:
     ```json
     {
       "source": "agent_chain_1",
       "target": "humanInput_hil_gate",  // ✅ Correct
       "type": "buttonedge"
     },
     {
       "source": "humanInput_hil_gate",
       "sourceHandle": "humanInput_hil_gate-output-proceed",
       "target": "agent_chain_2",  // ✅ Correct path
       "type": "buttonedge"
     }
     ```

2. Check for accidental direct edge from Chain1 to Chain2:
   ```bash
   jq '.edges[] | select(.source == "agent_chain_1" and .target == "agent_chain_2")' 01-chaining.json
   # Should return NO results
   ```

**Solution:**
- Delete any direct edge from Chain1 to Chain2
- Ensure HIL gate is properly positioned in the flow
- Re-import pattern if edges are corrupted

---

### Issue 3: Agents Cannot Access Previous Artifacts from State

**Symptoms:**
- Chain2 says "cannot find artifact_1"
- Chain3 says "cannot find artifact_2"
- Agents produce output without referencing previous work

**Debugging Steps:**
1. Verify state update configuration for each agent:
   - **Chain1** must update `artifacts.artifact_1`
   - **Chain2** must update `artifacts.artifact_2`
   - **Chain3** must update `artifacts.final_draft`

2. Check agent prompts reference correct state variables:
   - Chain2 prompt should include instruction to read `{{ artifacts.artifact_1 }}`
   - Chain3 prompt should include instruction to read `{{ artifacts.artifact_2 }}`

3. Verify `agentEnableMemory` is `true` for all agents:
   ```json
   {
     "agentEnableMemory": true  // ✅ Required for state access
   }
   ```

**Solution:**
- Enable memory for all agents
- Configure proper state updates with correct keys
- Test state variables are accessible between agents

---

### Issue 4: Direct Reply Node Shows Error or No Output

**Symptoms:**
- Workflow completes but Direct Reply shows error
- Final message not displayed to user
- Direct Reply node appears disconnected

**Debugging Steps:**
1. Verify Direct Reply connection:
   - Check edge from Agent.Report to Direct Reply exists
   - Verify edge has correct `targetHandle`:
     ```json
     {
       "source": "agent_report",
       "target": "directReply_final",
       "targetHandle": "directReply_final-input",  // ✅ Required
       "type": "buttonedge"                         // ✅ Required
     }
     ```

2. Check Direct Reply configuration:
   - `hideOutput` should be `true`
   - `directReplyMessage` should contain HTML-formatted completion message

3. Verify Direct Reply is terminal node:
   - Should have NO output anchors
   - Should have NO outgoing edges

**Solution:**
- Add `targetHandle` to incoming edge if missing
- Change edge type to `buttonedge` if different
- Verify Direct Reply has no outgoing edges

---

### Issue 5: chain.step Not Incrementing Correctly

**Symptoms:**
- State shows `chain.step=1` after all agents complete
- Report cannot determine which agents executed

**Debugging Steps:**
1. Check each agent's state update configuration:
   - **Chain1:** `chain.step` = `"1"`
   - **Chain2:** `chain.step` = `"2"`
   - **Chain3:** `chain.step` = `"3"`

2. Verify state updates are string values (not integers):
   ```json
   {
     "key": "chain.step",
     "value": "2"  // ✅ String, not integer
   }
   ```

**Solution:**
- Ensure each agent explicitly sets `chain.step` in state updates
- Use string values for step numbers
- Verify state persistence between agents

---

## Test Execution Report

**Test Date:** `[YYYY-MM-DD]`
**Flowise Version:** `[version]`
**Pattern Version:** `1.0`

### Test Results Summary

| Test Case | Status | Duration | Notes |
|-----------|--------|----------|-------|
| TC-1.1: Basic Sequential Chain | ⬜ Pass / ⬜ Fail | `[time]` | |
| TC-1.2: HIL Rejection Path | ⬜ Pass / ⬜ Fail | `[time]` | |
| TC-1.3: Artifact Versioning | ⬜ Pass / ⬜ Fail | `[time]` | |

### Configuration Details

- **Anthropic Model:** `claude-sonnet-4-5-20250929`
- **Temperature:** `0.2`
- **Streaming:** `Enabled`
- **Memory Enabled:** `Yes`

### Issues Encountered

`[List any issues encountered during testing]`

### Additional Notes

`[Any additional observations or recommendations]`

---

## Pattern Validation

This pattern has been validated against `validate_workflow.py` with the following checks:

✅ **Structural Validation:**
- Proper JSON structure with nodes and edges arrays
- All required node fields present (id, type, data, position)
- All required edge fields present (source, target, type)

✅ **Node Type Validation:**
- Start node present with correct configuration
- 4 Agent nodes with proper model configuration
- 1 HumanInput node with approval gate setup
- 1 DirectReply terminal node with hideOutput: true
- 3 StickyNote nodes for documentation

✅ **Edge Validation:**
- All nodes properly connected in sequence
- No orphaned nodes (all have incoming/outgoing edges except Start/DirectReply)
- HIL gate properly positioned between Chain1 and Chain2
- Direct Reply has incoming edge with targetHandle + buttonedge type

✅ **State Management:**
- All agents have agentEnableMemory: true
- Proper state updates for artifact handoffs
- chain.step increments correctly (1 → 2 → 3)

✅ **Tool Configuration:**
- Chain1: currentDateTime
- Chain2: currentDateTime, calculator (write-capable tools)
- Chain3: currentDateTime
- Report: currentDateTime

✅ **HIL Gate Enforcement:**
- HIL gate positioned before write-capable agent (Chain2)
- Approval required before Chain2 execution
- Reject path properly terminates workflow

---

## State Verification Checklist

Use this checklist to verify Flow State is correctly maintained throughout workflow execution.

### Overview

The chaining pattern relies on **state accumulation** - each agent adds new state keys without overwriting previous ones. This creates a complete artifact lineage from start to finish.

### State Verification Points

#### ✅ After Chain1 Execution

**Expected State Keys:**
```json
{
  "artifacts": {
    "artifact_1": "[Chain1 output data]"
  },
  "chain": {
    "step": "1"
  }
}
```

**Verification Steps:**
1. Click "View Flow State" in Flowise UI
2. Confirm `artifacts.artifact_1` exists and contains Chain1's output
3. Confirm `chain.step` equals `"1"`
4. Confirm NO other artifact keys exist yet (`artifact_2`, `final_draft` should be absent)

**✅ PASS**: artifact_1 exists, step=1, no artifact_2 or final_draft
**❌ FAIL**: Missing artifact_1, incorrect step value, or premature artifact_2/final_draft

---

#### ✅ After HIL Gate Approval

**Expected State Keys:**
```json
{
  "artifacts": {
    "artifact_1": "[Chain1 output - PRESERVED]"
  },
  "chain": {
    "step": "1"
  }
}
```

**Verification Steps:**
1. After clicking [Approve] in HIL gate
2. Verify state is **unchanged** (HIL gate doesn't modify state)
3. Confirm `artifacts.artifact_1` still exists (not overwritten)

**✅ PASS**: artifact_1 preserved, no state changes from approval action
**❌ FAIL**: artifact_1 missing or modified

---

#### ✅ After Chain2 Execution

**Expected State Keys:**
```json
{
  "artifacts": {
    "artifact_1": "[Chain1 output - PRESERVED]",
    "artifact_2": "[Chain2 output data]"
  },
  "chain": {
    "step": "2"
  }
}
```

**Verification Steps:**
1. Confirm `artifacts.artifact_1` **still exists** (not overwritten)
2. Confirm `artifacts.artifact_2` **now exists** (newly added)
3. Confirm `chain.step` incremented to `"2"`
4. Confirm artifact_2 references or builds upon artifact_1 content

**✅ PASS**: Both artifact_1 and artifact_2 exist, step=2
**❌ FAIL**: artifact_1 missing (overwritten), artifact_2 missing, or wrong step value

---

#### ✅ After Chain3 Execution

**Expected State Keys:**
```json
{
  "artifacts": {
    "artifact_1": "[Chain1 output - PRESERVED]",
    "artifact_2": "[Chain2 output - PRESERVED]",
    "final_draft": "[Chain3 output data]"
  },
  "chain": {
    "step": "3"
  },
  "output": "[Chain3 final output]"
}
```

**Verification Steps:**
1. Confirm `artifacts.artifact_1` **still exists** (complete preservation)
2. Confirm `artifacts.artifact_2` **still exists** (complete preservation)
3. Confirm `artifacts.final_draft` **now exists** (newly added)
4. Confirm `output` key exists with Chain3's final output
5. Confirm `chain.step` incremented to `"3"`

**✅ PASS**: All 3 artifacts exist (artifact_1, artifact_2, final_draft), step=3
**❌ FAIL**: Any artifact missing, wrong step value, or missing output key

---

#### ✅ After Report Execution

**Expected State Keys:**
```json
{
  "artifacts": {
    "artifact_1": "[Chain1 output - PRESERVED]",
    "artifact_2": "[Chain2 output - PRESERVED]",
    "final_draft": "[Chain3 output - PRESERVED]"
  },
  "chain": {
    "step": "3"
  },
  "output": "[Chain3 final output]",
  "report": {
    "generated": "true",
    "timestamp": "2025-11-07T10:30:00Z"
  }
}
```

**Verification Steps:**
1. Confirm ALL previous artifacts **still exist** (complete lineage preserved)
2. Confirm `report.generated` equals `"true"`
3. Confirm `report.timestamp` contains valid ISO 8601 timestamp
4. Confirm Report agent accessed all artifacts (check report content references them)

**✅ PASS**: All artifacts preserved, report keys exist with valid values
**❌ FAIL**: Any artifact missing, report.generated not true, or invalid timestamp

---

### State Preservation Principles

**✅ DO:**
- Add new state keys at each agent
- Increment `chain.step` sequentially (1 → 2 → 3)
- Reference previous artifacts in prompts using `{{ artifacts.artifact_N }}`
- Preserve all previous state when adding new keys

**❌ DON'T:**
- Overwrite existing state keys
- Skip step numbers (1 → 3, skipping 2)
- Clear state between agents
- Re-use state key names (e.g., don't set `artifacts.artifact_2` twice)

---

### Debugging State Issues

#### Issue: "State key missing after agent execution"

**Diagnosis:**
1. Check agent's `agentStateUpdates` configuration
2. Verify key name matches exactly (case-sensitive)
3. Confirm agent has `agentEnableMemory: true`

**Fix:**
```json
// In agent configuration
{
  "agentEnableMemory": true,
  "agentStateUpdates": [
    { "key": "artifacts.artifact_1", "value": "{{ artifact_1 }}" },
    { "key": "chain.step", "value": "1" }
  ]
}
```

---

#### Issue: "Previous artifact overwritten"

**Diagnosis:**
1. Check if agent uses same key name as previous agent
2. Verify state update doesn't use wildcard or root keys

**Wrong** ❌:
```json
{
  "key": "artifacts",  // Overwrites entire artifacts object!
  "value": "{{ new_artifact }}"
}
```

**Correct** ✅:
```json
{
  "key": "artifacts.artifact_2",  // Adds to artifacts, doesn't overwrite
  "value": "{{ artifact_2 }}"
}
```

---

#### Issue: "Chain.step not incrementing"

**Diagnosis:**
1. Check each agent updates `chain.step` with correct value
2. Verify value is string (e.g., `"1"` not `1`)

**Configuration:**
```json
// Chain1
{ "key": "chain.step", "value": "1" }

// Chain2
{ "key": "chain.step", "value": "2" }

// Chain3
{ "key": "chain.step", "value": "3" }
```

---

### Automated State Verification Script

For advanced users, use this script to validate state progression:

```javascript
// validate-state.js
const expectedStateProgression = [
  {
    after: "Chain1",
    required: ["artifacts.artifact_1", "chain.step"],
    forbidden: ["artifacts.artifact_2", "artifacts.final_draft"],
    values: { "chain.step": "1" }
  },
  {
    after: "Chain2",
    required: ["artifacts.artifact_1", "artifacts.artifact_2", "chain.step"],
    forbidden: ["artifacts.final_draft"],
    values: { "chain.step": "2" }
  },
  {
    after: "Chain3",
    required: ["artifacts.artifact_1", "artifacts.artifact_2", "artifacts.final_draft", "chain.step", "output"],
    forbidden: [],
    values: { "chain.step": "3" }
  },
  {
    after: "Report",
    required: ["artifacts.artifact_1", "artifacts.artifact_2", "artifacts.final_draft", "chain.step", "output", "report.generated", "report.timestamp"],
    forbidden: [],
    values: { "chain.step": "3", "report.generated": "true" }
  }
];

function validateState(currentState, expectedAfter) {
  const expected = expectedStateProgression.find(e => e.after === expectedAfter);

  // Check required keys exist
  for (const key of expected.required) {
    if (!getNestedKey(currentState, key)) {
      console.error(`❌ Missing required key: ${key}`);
      return false;
    }
  }

  // Check forbidden keys don't exist
  for (const key of expected.forbidden) {
    if (getNestedKey(currentState, key)) {
      console.error(`❌ Forbidden key exists: ${key}`);
      return false;
    }
  }

  // Check specific values
  for (const [key, expectedValue] of Object.entries(expected.values)) {
    const actualValue = getNestedKey(currentState, key);
    if (actualValue !== expectedValue) {
      console.error(`❌ Wrong value for ${key}: expected "${expectedValue}", got "${actualValue}"`);
      return false;
    }
  }

  console.log(`✅ State valid after ${expectedAfter}`);
  return true;
}

function getNestedKey(obj, path) {
  return path.split('.').reduce((current, part) => current?.[part], obj);
}

// Usage in Flowise:
// After each agent execution, call:
// validateState($flow.state, "Chain1");
// validateState($flow.state, "Chain2");
// validateState($flow.state, "Chain3");
// validateState($flow.state, "Report");
```

---

## Additional Resources

- **Pattern Library:** [Context Foundry AFv2 Patterns](https://github.com/snedea/afv2-patterns-index)
- **Pattern #1 Repository:** https://github.com/snedea/afv2-pattern-01-chaining
- **Flowise Documentation:** https://docs.flowiseai.com/
- **AgentFlow v2 Specification:** [AFv2 Docs](https://docs.flowiseai.com/agentflows)

---

🤖 Built with Context Foundry
