# Flowise Flow Diagram Export Tools

This directory contains tools for exporting Flowise AgentFlow diagrams to PNG images using **authentic Flowise design language** scraped from the official GitHub repository.

## Files

### `export-flow-diagram.html`

Browser-based interactive tool for exporting Flowise JSON workflows to high-resolution PNG diagrams with pixel-perfect Flowise styling.

**Features:**
- ✅ **Authentic Flowise Design** - Colors, gradients, and styling directly from Flowise source code
- ✅ **Light & Dark Mode** - Full theme support with localStorage persistence
- ✅ **Official Color Palette** - Extracted from `_themes-vars.module.scss`
- ✅ **Gradient Edges** - Purple (#ae53ba) to blue (#2a8af6) gradient strokes
- ✅ **Bezier Curves** - Smooth curves matching React Flow's `getBezierPath()`
- ✅ **Grid Background** - 16px dot grid matching Flowise canvas
- ✅ **Node Colors** - Uses `data.color` from JSON with lighten/darken effects
- ✅ **Ultra High-Res** - 3x scaling for crisp exports

**Flowise Design Language Implementation:**

**From Official Source Code:**
- **Color Palette**: `packages/ui/src/assets/scss/_themes-vars.module.scss`
- **Node Styling**: `packages/ui/src/views/agentflowsv2/AgentFlowNode.jsx`
- **Edge Styling**: `packages/ui/src/views/agentflowsv2/AgentFlowEdge.jsx`
- **Theme System**: `packages/ui/src/themes/index.js`

**Authentic Elements:**
- Node borders: 1px solid with alpha(nodeColor, 0.5)
- Node background: lighten(color, 0.9) in light mode, darken(color, 0.8) in dark
- Shadow: `0 2px 14px 0 rgb(32 40 45 / 8%)`
- Edge opacity: 0.75 with 2px stroke width
- Grid: 16px spacing (matches React Flow Background component)
- Border radius: 10px (exact Flowise spec)

**Usage:**
1. Open `export-flow-diagram.html` in your web browser
2. Click **Choose File** and select a Flowise JSON workflow (e.g., `01-chaining.json`)
3. The workflow renders automatically with Flowise styling
4. Click **🌓 Toggle Theme** to switch between light/dark mode
5. Click **📥 Export to PNG** to download

**Output:**
- Filename: `01-chaining-flow.png`
- Format: PNG with Flowise background color
- Resolution: 3x scaling (ultra high-res for documentation)
- Theme: Matches currently selected theme (light/dark)

**Color Reference:**

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `#fafafa` | `#252525` |
| Grid Dots | `#aaa` | `#333333` |
| Edge Start | `#ae53ba` (purple) | `#ae53ba` |
| Edge End | `#2a8af6` (blue) | `#2a8af6` |
| Primary | `#2196f3` | `#2196f3` |
| Secondary | `#673ab7` | `#7c4dff` |
| Text | `#212121` | `#d7dcec` |

### `export-via-puppeteer.js`

Automated CLI tool for batch PNG generation using Puppeteer (headless browser).

**Setup:**
```bash
cd tools
npm install
```

**Usage:**
```bash
node export-via-puppeteer.js
```

**Status:**
- ✅ Created with proper structure
- ⚠️ Needs refinement for production use
- ⚠️ CDN dependencies require optimization

**Note:** The browser-based tool (`export-flow-diagram.html`) is fully functional and recommended for current use.

---

## Design Language Research

The Flowise design language was extracted from the official repository:

**Repository**: https://github.com/FlowiseAI/Flowise

**Key Files Analyzed:**
1. `packages/ui/src/assets/scss/_themes-vars.module.scss` - Complete color palette
2. `packages/ui/src/views/agentflowsv2/AgentFlowNode.jsx` - Node rendering logic
3. `packages/ui/src/views/agentflowsv2/AgentFlowEdge.jsx` - Edge gradient implementation
4. `packages/ui/src/views/agentflowsv2/index.css` - Canvas styling
5. `packages/ui/src/themes/index.js` - Theme configuration
6. `packages/ui/src/views/canvas/index.css` - Additional styling

**Implementation Methodology:**
- Scraped official Flowise GitHub repo for React/SCSS source code
- Extracted exact color hex values from SCSS variables
- Replicated node/edge styling algorithms (lighten/darken calculations)
- Matched border styles, shadows, and spacing from Material-UI components
- Implemented Flowise's bezier curve calculation with precision hack
- Used official gradient colors for edge rendering

---

## Why Canvas API?

The original implementation attempted to use React Flow CDN libraries, but encountered dependency issues:
- `ReferenceError: Can't find variable: ReactFlowRenderer`
- CDN UMD builds not exposing expected globals
- Puppeteer headless browser compatibility issues

The Canvas API solution provides:
- ✅ Zero external dependencies
- ✅ Works offline
- ✅ Full control over rendering
- ✅ Consistent cross-browser behavior
- ✅ High-resolution export capability
- ✅ **Pixel-perfect replication of Flowise design**

---

🤖 Built with Context Foundry
🎨 Design scraped from [Flowise Official Repo](https://github.com/FlowiseAI/Flowise)
