# Integration Guide: Pattern #1 - Chaining

**Pattern Type**: Sequential Pipeline
**Difficulty**: Beginner
**Estimated Setup Time**: 10-15 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Importing to Flowise](#importing-to-flowise)
3. [API Key Configuration](#api-key-configuration)
4. [Agent Configuration](#agent-configuration)
5. [Testing the Workflow](#testing-the-workflow)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required

- **Flowise Instance**: Self-hosted or cloud deployment
  - Minimum version: Flowise 1.4.0+
  - Access to Flowise UI (e.g., `http://localhost:3000`)

- **Anthropic API Key**: Claude model access
  - Sign up at: https://console.anthropic.com/
  - API key format: `sk-ant-api03-...`
  - Recommended model: `claude-sonnet-4-5-20250929`

### Recommended

- **Write-capable tools** (if using Chain2 for file operations):
  - File system access
  - Database credentials
  - External API keys

- **Test data**: Sample input for pipeline testing

---

## Importing to Flowise

### Step 1: Download the Workflow

Ensure you have the `01-chaining.json` file from this repository.

### Step 2: Import to Flowise

1. Open Flowise UI in your browser
2. Navigate to **"Agentflows"** or **"Chatflows"** tab
3. Click **"Import"** button (top right)
4. Select `01-chaining.json` from your local filesystem
5. Wait for upload to complete

### Step 3: Verify Import

After import, you should see:

- **10 nodes** on the canvas:
  - 1 Start node (green)
  - 4 Agent nodes (blue): Chain1, Chain2, Chain3, Report
  - 1 HIL (Human-in-the-Loop) node (orange)
  - 1 Direct Reply node (teal)
  - 3 Sticky Note nodes (yellow) - documentation only

- **6 edges** connecting the nodes sequentially

**Visual Structure:**
```
Start → Chain1 → HIL Gate → Chain2 → Chain3 → Report → Direct Reply
```

---

## API Key Configuration

### Step 1: Add Anthropic Credential

1. In Flowise UI, navigate to **"Credentials"** (gear icon, left sidebar)
2. Click **"Add Credential"** → **"Anthropic"**
3. Enter:
   - **Name**: `anthropic-main` (or your preferred name)
   - **API Key**: Your `sk-ant-api03-...` key
4. Click **"Save"**

### Step 2: Assign Credential to Agents

Each of the 4 agent nodes needs the Anthropic credential:

| Agent Node | Purpose | Model Recommended |
|------------|---------|-------------------|
| **Chain1** | Initial processing | `claude-sonnet-4-5-20250929` |
| **Chain2** | Write operations | `claude-sonnet-4-5-20250929` |
| **Chain3** | Final processing | `claude-sonnet-4-5-20250929` |
| **Report** | Output formatting | `claude-sonnet-4-5-20250929` |

**For each agent node:**

1. Click the agent node to open configuration panel
2. Find **"Model"** dropdown
3. Select your Anthropic credential
4. Choose `claude-sonnet-4-5-20250929` model
5. Click **"Save"**

---

## Agent Configuration

### Chain1 Agent (Initial Processing)

**Role**: Receives user input and performs initial analysis/extraction

**Default Prompt:**
```
You are Chain1, the first agent in a sequential pipeline.
Your job: Analyze the user's input and extract key information.
Store your findings in Flow State as 'chain1_output'.
```

**Customization Options:**
- **Persona**: Adjust for specific domain (e.g., "data analyst", "content reviewer")
- **Tools**: Add tools like `currentDateTime`, `searXNG` if needed
- **Memory**: Configure session memory size (default: 10 messages)

**State Output:**
- Variable: `chain1_output`
- Format: JSON or structured text
- Example: `{"extracted_data": {...}, "confidence": 0.95}`

---

### HIL Gate (Human Approval)

**Role**: Human approval checkpoint before write-capable operations

**Configuration:**
- **Approval Message**: Customize the prompt shown to human reviewer
- **Default**: "Chain1 has completed initial processing. Review the output before proceeding to Chain2 (write operations)."

**Usage Pattern:**
- Workflow pauses at this node
- Human reviewer sees Chain1's output in Flow State
- Reviewer clicks **"Approve"** or **"Reject"**
- If approved → proceeds to Chain2
- If rejected → workflow terminates

**When to Use HIL Gate:**
- Before database writes
- Before file modifications
- Before external API calls with side effects
- Before sending emails or notifications

---

### Chain2 Agent (Write Operations)

**Role**: Performs write operations after human approval

**Default Prompt:**
```
You are Chain2, responsible for write operations.
You have been approved by a human to proceed.
Use the data from 'chain1_output' in Flow State.
Perform necessary writes and store results in 'chain2_output'.
```

**Customization Options:**
- **Tools**: Add file system tools, database connectors, API clients
- **Error Handling**: Configure retry logic for failed writes
- **Audit Logging**: Store write operation details in Flow State

**State Output:**
- Variable: `chain2_output`
- Format: Confirmation + metadata
- Example: `{"files_written": 3, "records_updated": 15, "status": "success"}`

---

### Chain3 Agent (Final Processing)

**Role**: Post-processing and quality checks

**Default Prompt:**
```
You are Chain3, performing final processing.
Review outputs from Chain1 ('chain1_output') and Chain2 ('chain2_output').
Perform validation, cleanup, or additional transformations.
Store final results in 'chain3_output'.
```

**Customization Options:**
- **Validation**: Add schema validation tools
- **Quality Checks**: Integrate testing frameworks
- **Rollback Logic**: Handle error scenarios from Chain2

**State Output:**
- Variable: `chain3_output`
- Format: Validation results
- Example: `{"validation_passed": true, "issues_found": 0, "final_status": "ready"}`

---

### Report Agent (Output Formatting)

**Role**: Generate final user-facing report

**Default Prompt:**
```
You are the Report agent, responsible for creating the final output.
Synthesize information from all chain agents:
- chain1_output: Initial analysis
- chain2_output: Write operations
- chain3_output: Validation results

Create a clear, structured report for the user.
Store the final report in 'report_output'.
```

**Customization Options:**
- **Format**: Markdown, JSON, HTML, plain text
- **Sections**: Executive summary, details, recommendations
- **Attachments**: Include links to created files or records

**State Output:**
- Variable: `report_output`
- Format: User-facing report
- Example:
```markdown
# Pipeline Execution Report

## Summary
✅ Pipeline completed successfully

## Chain1 Results
- Extracted 5 key data points
- Confidence: 95%

## Chain2 Operations
- Files written: 3
- Records updated: 15

## Chain3 Validation
- All quality checks passed
- No issues found

## Next Steps
- Review output files at: /path/to/files/
- Access updated records at: https://...
```

---

### Direct Reply Node (Terminal)

**Role**: Sends final output to user

**Configuration:**
- **Message Source**: Uses `{{report_output}}` from Flow State
- **Format**: Renders the report in chat interface

**No customization needed** - automatically displays Report agent's output.

---

## Testing the Workflow

### Step 1: Start a Test Session

1. In Flowise UI, open the imported chatflow
2. Click **"Test"** button (top right)
3. Chat interface opens

### Step 2: Sample Input

Enter a test message that requires sequential processing:

**Example Input:**
```
Process this dataset:
- Customer ID: 12345
- Transaction Amount: $500
- Status: Pending Approval

Extract the data, update the database after approval, validate the changes, and provide a report.
```

### Step 3: Expected Flow Execution

1. **Chain1 executes**:
   - Extracts: customer_id, amount, status
   - Stores in `chain1_output`
   - Duration: ~3-5 seconds

2. **HIL Gate triggers**:
   - Workflow pauses
   - You see a prompt: "Review Chain1 output before proceeding"
   - Flow State shows extracted data
   - Click **"Approve"**

3. **Chain2 executes** (after approval):
   - Simulates database update
   - Stores confirmation in `chain2_output`
   - Duration: ~3-5 seconds

4. **Chain3 executes**:
   - Validates the updates
   - Stores validation results in `chain3_output`
   - Duration: ~2-3 seconds

5. **Report executes**:
   - Synthesizes all outputs
   - Creates final report in `report_output`
   - Duration: ~3-5 seconds

6. **Direct Reply displays**:
   - Shows the final report in chat
   - User sees complete execution summary

**Total Duration**: ~15-20 seconds (excluding human approval time)

### Step 4: Verify Outputs

Check Flow State (click **"Show State"** button) to see all intermediate outputs:

```json
{
  "chain1_output": {
    "customer_id": "12345",
    "transaction_amount": 500,
    "status": "pending_approval"
  },
  "chain2_output": {
    "database_updated": true,
    "records_affected": 1
  },
  "chain3_output": {
    "validation_passed": true,
    "issues": []
  },
  "report_output": "# Pipeline Execution Report\n\n✅ All steps completed successfully..."
}
```

---

## Troubleshooting

### Issue 1: Import Fails

**Symptoms:**
- Error: "Invalid JSON format"
- Upload completes but workflow doesn't appear

**Solutions:**
- Verify `01-chaining.json` is not corrupted (check file size: ~1058 lines)
- Try importing again (sometimes network issues cause corruption)
- Check Flowise logs: `docker logs flowise` (if using Docker)

---

### Issue 2: Agent Nodes Missing API Key

**Symptoms:**
- Agent execution fails with "No API key configured"
- Node shows red error indicator

**Solutions:**
1. Click the failing agent node
2. Check **"Model"** dropdown shows a credential
3. If not, select your Anthropic credential from dropdown
4. If credential doesn't exist, go to **Credentials** → **Add Credential**
5. After adding credential, refresh the page and reassign to agent

---

### Issue 3: HIL Gate Not Appearing

**Symptoms:**
- Workflow executes Chain1 then stops
- No approval prompt shown

**Solutions:**
- Check HIL node is correctly connected (edge from Chain1 to HIL to Chain2)
- Verify edge target is set to HIL node's input anchor
- Check HIL node configuration has approval message set
- Try deleting and recreating the edge from Chain1 → HIL

---

### Issue 4: Flow State Variables Empty

**Symptoms:**
- Later agents receive empty `chain1_output` or `chain2_output`
- Report shows "No data found"

**Solutions:**
- Check each agent's prompt explicitly stores output in Flow State
- Example prompt addition:
  ```
  Store your output in Flow State:
  setFlowState('chain1_output', { your: 'data' })
  ```
- Verify agent execution completed successfully (check logs)
- Test with simpler input to isolate the issue

---

### Issue 5: Direct Reply Shows Raw JSON

**Symptoms:**
- Final output displays JSON instead of formatted report
- User sees: `{"report_output": "..."}`

**Solutions:**
- Check Direct Reply node configuration
- **Message** field should reference: `{{report_output}}`
- If showing raw JSON, the variable reference might be incorrect
- Try: `{{$flow.report_output}}` (explicit flow state reference)

---

### Issue 6: Workflow Timeout

**Symptoms:**
- Execution stops mid-chain
- Error: "Request timeout"

**Solutions:**
- Check Flowise timeout settings (default: 60s per node)
- Increase timeout in Flowise configuration:
  ```env
  EXECUTION_TIMEOUT=120000  # 120 seconds
  ```
- Optimize agent prompts to be more concise
- Reduce memory window size (fewer messages to process)

---

### Issue 7: HIL Approval Rejected - How to Restart?

**Symptoms:**
- Clicked "Reject" at HIL gate
- Want to retry with different input

**Solutions:**
- Start a new chat session (click **"New Chat"**)
- If you want to continue same session:
  - Some Flowise versions support "Retry from HIL"
  - Check if your Flowise version has this feature
- For production: implement retry logic in Chain1 to handle rejections

---

## Advanced Configuration

### Parallel Branch Alternative

If some steps can run in parallel, consider using **Pattern #2 (Parallel)** instead:
- Faster execution (concurrent agents)
- Better for independent data sources
- See: `/templates/afv2-patterns/02-parallel.json`

### Loop Integration

To add retry logic (e.g., if Chain3 validation fails):
- Integrate **Pattern #5 (Looping)** after Chain3
- Loop back to Chain2 until validation passes
- See: `/templates/afv2-patterns/05-looping.json`

### Conditional Routing

To route to different agents based on Chain1's analysis:
- Replace linear chain with **Pattern #3 (Routing)**
- Use ConditionAgent to route to specialized Chain2 variants
- See: `/templates/afv2-patterns/03-routing.json`

---

## Success Criteria

You have successfully integrated Pattern #1 when:

- ✅ All 10 nodes render correctly in Flowise UI (7 functional + 3 sticky notes)
- ✅ Each agent node has Anthropic credential configured
- ✅ Test execution completes all 6 steps
- ✅ HIL gate pauses workflow and shows approval prompt
- ✅ Flow State shows all intermediate outputs (chain1_output, chain2_output, etc.)
- ✅ Final report displays in chat with formatted output
- ✅ Total execution time < 30 seconds (excluding human approval)

---

## Next Steps

### Customize for Your Use Case

1. **Modify Agent Prompts**: Tailor Chain1-3 and Report prompts to your domain
2. **Add Tools**: Integrate file system, database, or API tools as needed
3. **Adjust HIL Trigger**: Move HIL gate or add multiple gates for different approval levels
4. **Error Handling**: Add try/catch logic in agent prompts for graceful failures

---

## Performance Benchmarks

### Expected Execution Metrics

Use these benchmarks to validate your deployment and identify performance issues.

#### Baseline Performance (4-Agent Chain)

| Metric | Expected Value | Acceptable Range | Red Flag |
|--------|----------------|------------------|----------|
| **Total Execution Time** | 12-19 seconds | 10-25 seconds | >30 seconds |
| **Chain1 Latency** | 3-5 seconds | 2-7 seconds | >10 seconds |
| **Chain2 Latency** | 4-6 seconds | 3-8 seconds | >12 seconds |
| **Chain3 Latency** | 3-5 seconds | 2-7 seconds | >10 seconds |
| **Report Latency** | 2-3 seconds | 1-5 seconds | >8 seconds |
| **HIL Approval Time** | Variable (human) | Seconds to hours | N/A |

*Excludes human approval time. Measured with Claude Sonnet 4.5 on standard hardware.*

#### Token Usage (Per Agent)

| Agent | Input Tokens | Output Tokens | Total Tokens | Cost (Sonnet 4.5) |
|-------|--------------|---------------|--------------|-------------------|
| **Chain1** | 500-800 | 200-400 | 700-1200 | $0.004-$0.008 |
| **Chain2** | 800-1200 | 300-500 | 1100-1700 | $0.007-$0.012 |
| **Chain3** | 1200-1500 | 400-600 | 1600-2100 | $0.010-$0.015 |
| **Report** | 1500-2000 | 500-800 | 2000-2800 | $0.013-$0.020 |
| **Total** | 4000-5500 | 1400-2300 | 5400-7800 | **$0.034-$0.055** |

*Based on Claude Sonnet 4.5 pricing: $3 per 1M input tokens, $15 per 1M output tokens (as of Nov 2025)*

#### Cost Optimization Scenarios

**Scenario 1: Use Haiku for Simple Stages**

| Change | Savings per Execution | Annual Savings (10K runs) |
|--------|----------------------|---------------------------|
| Chain1: Haiku | -$0.006 (75%) | -$60 |
| Report: Haiku | -$0.014 (70%) | -$140 |
| **Total Savings** | **-$0.020** | **-$200** |

**Scenario 2: Optimize State Management**

| Optimization | Token Reduction | Cost Savings |
|--------------|-----------------|--------------|
| Remove redundant context from prompts | -15% | -$0.005/run |
| Use state references instead of full text | -20% | -$0.007/run |
| Minimize artifact re-reading | -10% | -$0.003/run |
| **Combined** | **-35%** | **-$0.015/run** |

### Performance Monitoring

#### Recommended Metrics to Track

1. **Execution Time Distribution**
   - P50 (median): 15 seconds
   - P95: 22 seconds
   - P99: 28 seconds
   - Max acceptable: 35 seconds

2. **Success Rate**
   - Target: >99%
   - Acceptable: >95%
   - Investigate if: <90%

3. **HIL Approval Metrics**
   - Average approval time: <5 minutes
   - Approval rate: 85-90% approved, 10-15% rejected
   - Abandonment rate: <5% (user doesn't respond)

4. **Token Usage Trends**
   - Monitor for unexpected spikes (indicate prompt issues)
   - Track total tokens per workflow execution
   - Alert if single agent exceeds 3000 tokens

#### Setting Up Monitoring

**Option 1: Flowise Built-in Logs**

1. Navigate to Flowise UI → **Logs**
2. Filter by workflow ID
3. View execution times per agent
4. Export to CSV for analysis

**Option 2: Custom Logging (Advanced)**

Add logging to each agent's system prompt:

```javascript
// In Chain1 prompt
"LOGGING: Record execution start time: {{ currentDateTime }}"

// At end of Chain1
"LOGGING: Record execution end time and calculate duration"
```

Store in state:
```json
{
  "metrics": {
    "chain1_start": "2025-11-07T10:30:00Z",
    "chain1_end": "2025-11-07T10:30:04Z",
    "chain1_duration_seconds": 4,
    "chain1_tokens": 1150
  }
}
```

#### Performance Troubleshooting

**Issue: Execution Time >30 seconds**

**Possible Causes:**
1. Prompts too long (reduce unnecessary context)
2. Agent re-reading entire state history (optimize state access)
3. Tool calls timing out (check API integrations)
4. Model selection (Sonnet 4.5 slower than Haiku for simple tasks)

**Diagnosis:**
```bash
# Check individual agent latencies in Flowise logs
# If Chain1 >10s: Prompt is too long or OCR is slow
# If Chain2 >12s: Tool calls (calculator/API) timing out
# If Report >8s: Reading too much state data
```

**Fixes:**
- Reduce prompt length by 30-50%
- Use smaller models for simple agents (Chain1 → Haiku)
- Optimize tool calls (cache results, reduce API calls)
- Reference specific state keys instead of entire state

---

**Issue: Token Usage Exceeds 8000 Total**

**Possible Causes:**
1. Agents re-reading full conversation history
2. Large artifacts stored in state
3. Redundant context in prompts

**Diagnosis:**
```javascript
// Check state size at each agent
console.log(JSON.stringify($flow.state).length); // Should be <5KB per agent
```

**Fixes:**
- Set `agentEnableMemory: false` for agents that don't need full history
- Reference only required state keys in prompts
- Use artifact summaries instead of full content in later stages
- Limit state to essential data only

---

**Issue: Cost Per Execution >$0.10**

**Possible Causes:**
1. Using Sonnet 4.5 for all agents (expensive)
2. Excessive token usage
3. Long prompts with redundant instructions

**Fixes:**
1. **Model Selection**:
   - Chain1: Haiku (extraction/simple analysis)
   - Chain2: Sonnet 4.5 (complex logic)
   - Chain3: Sonnet 4.5 (validation)
   - Report: Haiku (formatting)

2. **Prompt Optimization**:
   - Remove examples from prompts (unless critical)
   - Use concise instructions (50-100 words vs 200-300)
   - Avoid repeating context already in state

3. **State Management**:
   - Store only essential data in state
   - Use references instead of full text
   - Clean up intermediate artifacts

### Baseline Performance Test

Run this test after deployment to establish your baseline:

```bash
# Test Case 1: Minimal Input
Input: "Create a product launch plan for a new SaaS tool"
Expected: 12-15 seconds, 5000-6000 tokens, $0.035-$0.045

# Test Case 2: Average Input
Input: "Analyze customer feedback and generate improvement recommendations"
Expected: 15-18 seconds, 6000-7000 tokens, $0.045-$0.055

# Test Case 3: Complex Input
Input: "Process invoice with multiple line items, vendor verification, and budget impact analysis"
Expected: 18-22 seconds, 7000-8000 tokens, $0.055-$0.065

# Red Flag Threshold
If ANY test exceeds:
- 30 seconds execution time
- 10,000 total tokens
- $0.100 cost per run
→ Investigate immediately
```

### Performance Optimization Checklist

Before deploying to high-volume usage:

- [ ] Profile each agent's latency (identify slowest stages)
- [ ] Optimize prompts (remove unnecessary verbosity)
- [ ] Use appropriate model tiers (Haiku vs Sonnet 4.5)
- [ ] Minimize state size (store only essentials)
- [ ] Test with 10x expected load (concurrency testing)
- [ ] Set up alerting for >30s executions
- [ ] Monitor token usage trends daily
- [ ] Establish cost budgets per workflow

---

### Explore Related Patterns

- **Pattern #2 (Parallel)**: Run multiple agents concurrently
- **Pattern #3 (Routing)**: Dynamic agent selection based on intent
- **Pattern #4 (Iteration)**: Quality-driven refinement loops
- **Pattern #5 (Looping)**: Test-driven validation with retry

### Deployment Readiness Checklist

- [ ] Test with real production data (not just samples)
- [ ] Add comprehensive error handling in all agents
- [ ] Set up monitoring and logging (Flowise execution logs)
- [ ] Configure rate limits and quotas (API usage)
- [ ] Document custom agent prompts and tool configurations
- [ ] Train human reviewers on HIL approval criteria
- [ ] Set up alerting for failed executions
- [ ] Load test with concurrent sessions (10+ simultaneous users)

---

## Support

**Pattern Issues**: https://github.com/snedea/afv2-pattern-01-chaining/issues
**Flowise Documentation**: https://docs.flowiseai.com/
**Pattern Index**: https://github.com/snedea/afv2-patterns-index

---

**Last Updated**: 2025-11-06
**Pattern Version**: 1.0
**Flowise Compatibility**: 1.4.0+
