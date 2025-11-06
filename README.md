# AFv2 Pattern #1: Chaining

Sequential 3-agent pipeline with Human-in-the-Loop approval gate.

## Pattern Structure

```
Start → Chain1 → HIL Gate → Chain2 → Chain3 → Report → Direct Reply
```

## Key Features

- 4 specialized agents (Chain1, Chain2, Chain3, Report)
- Human-in-the-Loop approval gate before write-capable tools
- Sequential artifact handoffs via Flow State
- Direct Reply terminal node

## Files

- `01-chaining.json` - Complete Flowise workflow (1058 lines)
- `TESTING.md` - Comprehensive test cases

## Quick Start

1. Import `01-chaining.json` into Flowise
2. Configure Anthropic API key for all agents
3. Test with sample input

## Use Cases

- Document processing pipelines (OCR → Extract → Transform)
- Data transformation workflows (Raw → Clean → Enrich)
- Sequential approval workflows

## Documentation

See [Context Foundry Pattern Library](https://github.com/context-foundry/context-foundry/tree/main/extensions/flowise/templates/afv2-patterns) for complete documentation.

🤖 Built with Context Foundry

