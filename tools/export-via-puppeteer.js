#!/usr/bin/env node

/**
 * Automated Flowise Flow Diagram Exporter
 *
 * Converts Flowise JSON workflows to high-fidelity PNG images using Puppeteer and React Flow.
 *
 * Usage:
 *   node export-via-puppeteer.js <input.json> <output.png>
 *
 * Example:
 *   node export-via-puppeteer.js ../01-chaining.json ../diagrams/01-chaining-flow.png
 */

const fs = require('fs');
const path = require('path');

// Check if puppeteer is installed
try {
    require.resolve('puppeteer');
} catch (e) {
    console.error('❌ Puppeteer not installed. Run: npm install puppeteer');
    process.exit(1);
}

const puppeteer = require('puppeteer');

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.error('Usage: node export-via-puppeteer.js <input.json> <output.png>');
    console.error('Example: node export-via-puppeteer.js ../01-chaining.json ../diagrams/01-chaining-flow.png');
    process.exit(1);
}

const [inputPath, outputPath] = args;

// Validate input file exists
if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
}

// Read and parse JSON
let workflowData;
try {
    const jsonContent = fs.readFileSync(inputPath, 'utf-8');
    workflowData = JSON.parse(jsonContent);
    console.log(`✅ Loaded workflow: ${workflowData.nodes.length} nodes, ${workflowData.edges.length} edges`);
} catch (error) {
    console.error(`❌ Error reading JSON: ${error.message}`);
    process.exit(1);
}

// Ensure output directory exists
const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`✅ Created output directory: ${outputDir}`);
}

// Generate HTML page with workflow embedded
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@xyflow/react@12.0.0/dist/umd/index.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@xyflow/react@12.0.0/dist/style.css">
    <style>
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        #reactflow-wrapper { width: 100vw; height: 100vh; background: white; }
        .react-flow__node { font-size: 12px; font-weight: 500; }
    </style>
</head>
<body>
    <div id="reactflow-wrapper"></div>
    <script>
        const { useState, useCallback } = React;
        const { ReactFlow, Controls, Background } = ReactFlowRenderer;

        const workflowData = ${JSON.stringify(workflowData)};

        function getNodeStyle(type) {
            const baseStyle = { padding: '10px', borderRadius: '8px', border: '2px solid', fontSize: '12px' };
            switch(type) {
                case 'startAgentflow': return { ...baseStyle, background: '#7EE787', borderColor: '#2EA043' };
                case 'agentAgentflow': return { ...baseStyle, background: '#4DD0E1', borderColor: '#0097A7' };
                case 'humanInputAgentflow': return { ...baseStyle, background: '#FF6B6B', borderColor: '#D32F2F', color: '#fff' };
                case 'directReplyAgentflow': return { ...baseStyle, background: '#FFD700', borderColor: '#FFA000' };
                case 'stickyNote': return { ...baseStyle, background: '#FFF9C4', borderColor: '#F9A825', fontSize: '10px' };
                default: return { ...baseStyle, background: '#fff', borderColor: '#ccc' };
            }
        }

        const nodes = workflowData.nodes.map(node => ({
            id: node.id,
            type: 'default',
            position: node.position || { x: 0, y: 0 },
            data: { label: node.data?.label || node.data?.name || node.id },
            style: getNodeStyle(node.type)
        }));

        const edges = workflowData.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            style: { stroke: '#555', strokeWidth: 2 }
        }));

        function FlowDiagram() {
            const onInit = (instance) => {
                setTimeout(() => {
                    instance.fitView({ padding: 0.2 });
                    window.flowReady = true;
                }, 500);
            };

            return React.createElement(ReactFlow, {
                nodes,
                edges,
                onInit,
                fitView: true,
                minZoom: 0.5,
                maxZoom: 2
            }, [
                React.createElement(Background, { key: 'bg', color: '#f0f0f0', gap: 16 })
            ]);
        }

        const root = ReactDOM.createRoot(document.getElementById('reactflow-wrapper'));
        root.render(React.createElement(FlowDiagram));
    </script>
</body>
</html>
`;

// Launch Puppeteer and generate PNG
(async () => {
    console.log('🚀 Launching headless browser...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

        // Load HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Wait for React Flow to render and fit view
        console.log('⏳ Waiting for React Flow to render...');
        await page.waitForFunction('window.flowReady === true', { timeout: 30000 });
        await page.waitForTimeout(2000); // Extra time for animations and layout

        console.log('📸 Capturing screenshot...');

        // Take screenshot of the workflow area
        const element = await page.$('#reactflow-wrapper');
        await element.screenshot({
            path: outputPath,
            type: 'png',
            omitBackground: false
        });

        console.log(`✅ Exported successfully: ${outputPath}`);

    } catch (error) {
        console.error(`❌ Export failed: ${error.message}`);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
