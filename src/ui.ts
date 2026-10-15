/**
 * RELAY - Monospace Entity-Relationship & SQL Schema Studio
 * Minimalist design language aligned with Skew and Peel.
 * Features draw.io level tooling:
 * - Topbar with file menu, dialect switch, templates, export actions, entity counts, zoom
 * - Left Sidebar with Object Library (Standard Entity, Weak Entity with Double Border, Associative Entity, 1:1, 1:N, N:M connectors)
 * - Canvas ER Visualizer: Pan, Zoom, Grid Snapping, Draggable nodes, Auto-Layout, Bezier Crow's foot lines, Double Border for Weak Entities
 * - Schema Objects Explorer Popup Modal: Comprehensive multi-table inspector to search, filter, and view all schema elements
 * - Inspector Pane: SQL DDL, Mermaid ER, DBML, Technical Analysis, Relations Manager, Telemetry Scorecard
 * - One-click Microsoft Word DOCX (.docx) export for Logical Analysis
 */

import { cleanIdentifier, splitTopLevel, parseMermaid, parseSqlDdl } from './engine.js';

export function renderDashboardHTML(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark" id="htmlRoot">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RELAY // SQL Schema & ER Studio</title>
  <link rel="icon" type="image/svg+xml" href="./logo.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0c0d12;
      --surface: #13151c;
      --card: #181a24;
      --border: #242735;
      --border-hover: #3b3f54;
      --accent: #10b981;
      --accent-hover: #059669;
      --accent-dim: rgba(16, 185, 129, 0.12);
      --text: #f1f3f9;
      --muted: #81889c;
      --danger: #ef4444;
      --warning: #f59e0b;
      --info: #38bdf8;
      --mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    /* Light Theme Palette */
    html.light {
      --bg: #f8fafc;
      --surface: #ffffff;
      --card: #f1f5f9;
      --border: #cbd5e1;
      --border-hover: #94a3b8;
      --accent: #059669;
      --accent-hover: #047857;
      --accent-dim: rgba(5, 150, 105, 0.12);
      --text: #0f172a;
      --muted: #64748b;
      --danger: #dc2626;
      --warning: #d97706;
      --info: #0284c7;
    }
    html.light .code-pre {
      color: #1e293b;
      background: #f8fafc;
    }
    html.light .canvas-toolbar, html.light .canvas-controls {
      background: var(--surface);
      border-color: var(--border);
    }
    html.light .rel-diamond-node .diamond-polygon {
      fill: var(--card);
      stroke: var(--border-hover);
    }
    html.light .rel-diamond-title {
      color: var(--text);
    }
    html.light .rel-diamond-attrs {
      color: var(--muted);
    }
    html.light .table-node.chen-node {
      background: var(--card);
      border-color: var(--border);
    }
    html.light .table-node.chen-node .table-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      color: var(--text);
    }
    html.light .cardinality-label {
      background: var(--surface);
      border-color: var(--border);
      color: var(--text);
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--mono);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
    ::selection { background: var(--accent); color: #000; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); }
    ::-webkit-scrollbar-thumb:hover { background: var(--border-hover); }

    /* Topbar */
    .topbar {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 6px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      z-index: 30;
      flex-shrink: 0;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-badge {
      background: var(--accent);
      color: #000;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: 2px;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .brand-title {
      font-weight: 600;
      font-size: 12px;
      letter-spacing: 0.5px;
      color: var(--text);
    }
    .topbar-menu {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Common Buttons & Inputs */
    .btn {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 600;
      padding: 4px 9px;
      border-radius: 3px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s, border-color 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .btn:hover {
      background: var(--card);
      border-color: var(--border-hover);
    }
    .btn-accent {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }
    .btn-accent:hover {
      background: var(--accent-hover);
      border-color: var(--accent-hover);
    }
    .btn-sm {
      padding: 3px 7px;
      font-size: 10px;
    }
    .btn-danger {
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: var(--danger);
    }
    .select {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--mono);
      font-size: 11px;
      padding: 4px 7px;
      border-radius: 3px;
      outline: none;
      cursor: pointer;
    }
    .select:focus { border-color: var(--accent); }

    /* Studio Main Layout */
    .studio-layout {
      flex: 1;
      display: grid;
      grid-template-columns: 220px 1fr 480px;
      height: calc(100vh - 43px);
      overflow: hidden;
      position: relative;
    }
    @media (max-width: 1200px) {
      .studio-layout {
        grid-template-columns: 190px 1fr 420px;
      }
    }

    /* Left Sidebar: Draw.io style Objects Library */
    .sidebar {
      background: var(--surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      user-select: none;
    }
    .sidebar-section {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
    }
    .sidebar-title {
      font-size: 10px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .library-item {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 8px 10px;
      margin-bottom: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: border-color 0.15s, background 0.15s;
    }
    .library-item:hover {
      border-color: var(--accent);
      background: rgba(16, 185, 129, 0.05);
    }
    .item-icon {
      width: 28px;
      height: 28px;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      border: 1px solid var(--border);
      flex-shrink: 0;
    }
    .item-icon.weak-icon {
      border: 2px double var(--accent);
    }
    .item-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .item-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--text);
    }
    .item-desc {
      font-size: 9px;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Center: Visual Canvas */
    .canvas-panel {
      position: relative;
      background: var(--bg);
      overflow: hidden;
      user-select: none;
      display: flex;
      flex-direction: column;
    }
    .canvas-toolbar {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 10;
      display: flex;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px 7px;
      border-radius: 4px;
    }
    .canvas-controls {
      position: absolute;
      bottom: 12px;
      left: 12px;
      z-index: 10;
      display: flex;
      gap: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px 8px;
      border-radius: 4px;
      align-items: center;
      font-size: 10px;
      color: var(--muted);
    }
    .canvas-viewport {
      flex: 1;
      width: 100%;
      height: 100%;
      cursor: grab;
      position: relative;
      background-image: radial-gradient(var(--border) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .canvas-viewport.panning {
      cursor: grabbing;
    }
    .canvas-svg-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: visible;
      z-index: 2;
    }
    .canvas-svg-layer path {
      stroke: var(--accent);
      stroke-width: 2;
      fill: none;
      transition: stroke 0.15s;
    }
    .canvas-svg-layer path.identifying-line {
      stroke-width: 3;
      stroke-dasharray: 4, 2;
    }
    .canvas-stage {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transform-origin: 0 0;
    }
    .labels-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 6;
    }
    .nodes-layer {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .dummy-nodes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      transform-origin: 0 0;
      z-index: 3;
    }

    /* Draw.io Notation Mode & Canvas Styling */
    .canvas-viewport.chen-mode {
      background-size: 20px 20px;
    }
    .canvas-viewport.no-grid {
      background-image: none !important;
    }

    /* Chen Entity Rectangle Node */
    .table-node.chen-node {
      border-radius: 2px;
      border: 1px solid var(--border-hover);
      background: var(--card);
    }
    .table-node.chen-node .table-header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      color: var(--text);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Relationship Diamond Node on Canvas */
    .rel-diamond-node {
      position: absolute;
      width: 140px;
      height: 90px;
      pointer-events: auto;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      z-index: 5;
      transition: transform 0.05s ease-out;
    }
    .rel-diamond-node .diamond-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .rel-diamond-node .diamond-polygon {
      fill: var(--card);
      stroke: var(--border-hover);
      stroke-width: 1.5;
      transition: stroke 0.15s, fill 0.15s;
    }
    .rel-diamond-node.weak .diamond-polygon-inner {
      fill: none;
      stroke: var(--border-hover);
      stroke-width: 1.5;
    }
    .rel-diamond-node.selected .diamond-polygon {
      stroke: var(--accent);
      stroke-width: 2;
      fill: var(--card);
    }
    .rel-diamond-content {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 100px;
    }
    .rel-diamond-title {
      font-size: 10px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .rel-diamond-attrs {
      font-size: 8px;
      color: var(--muted);
      margin-top: 2px;
      font-style: italic;
      line-height: 1.1;
      max-height: 36px;
      overflow: hidden;
    }

    /* Cardinality Connector Label Badges on Canvas */
    .cardinality-label {
      position: absolute;
      font-size: 9px;
      font-weight: 700;
      color: var(--text);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 1px 5px;
      border-radius: 3px;
      pointer-events: auto;
      cursor: pointer;
      z-index: 10;
      white-space: nowrap;
      user-select: none;
      transition: border-color 0.15s, background 0.15s, transform 0.1s;
    }
    .cardinality-label:hover {
      border-color: var(--accent);
      background: var(--card);
      transform: scale(1.1);
    }
    .cardinality-label.source { color: var(--accent); }
    .cardinality-label.target { color: var(--text); }

    /* Cardinality Quick-Picker Popover */
    .card-quick-popover {
      position: absolute;
      z-index: 120;
      background: var(--surface);
      border: 1px solid var(--border-hover);
      border-radius: 4px;
      padding: 5px;
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 9px;
      user-select: none;
    }
    .card-quick-chip {
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 2px 5px;
      border-radius: 2px;
      cursor: pointer;
      font-family: var(--mono);
      font-weight: 700;
      font-size: 9px;
    }
    .card-quick-chip:hover {
      border-color: var(--accent);
      color: var(--accent);
    }
    .card-quick-chip.action {
      background: var(--surface);
      color: var(--muted);
    }
    .card-quick-chip.action:hover {
      color: var(--text);
      border-color: var(--border-hover);
    }

    /* Inverted Triangle ISA Node on Canvas */
    .isa-triangle-node {
      position: absolute;
      width: 100px;
      height: 80px;
      pointer-events: auto;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      z-index: 6;
      transition: transform 0.05s ease-out;
    }
    .isa-triangle-node .isa-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .isa-triangle-node .isa-polygon {
      fill: var(--card);
      stroke: var(--border-hover);
      stroke-width: 1.5;
      transition: stroke 0.15s, fill 0.15s;
    }
    .isa-triangle-node.selected .isa-polygon {
      stroke: var(--accent);
      stroke-width: 2;
    }
    .isa-triangle-node .isa-double-line {
      stroke: var(--border-hover);
      stroke-width: 1.5;
    }
    .isa-triangle-node.selected .isa-double-line {
      stroke: var(--accent);
      stroke-width: 2;
    }
    .isa-node-content {
      position: relative;
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -8px;
    }
    .isa-title {
      font-size: 11px;
      font-weight: 800;
      color: var(--text);
      letter-spacing: 1px;
    }
    .isa-badge {
      font-size: 9px;
      font-weight: 700;
      color: var(--accent);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 0 4px;
      border-radius: 2px;
      margin-top: 2px;
      font-family: var(--mono);
    }
    .isa-total-double-stroke {
      stroke-width: 3.5px !important;
    }

    /* Inherited Primary Key & Subclass Styling */
    .column-row.inherited-row {
      background: rgba(2, 132, 199, 0.08);
      border-left: 2px solid #0284c7;
    }
    .col-badge-inherited {
      font-size: 8px;
      padding: 1px 4px;
      border-radius: 2px;
      background: #0284c7;
      color: #fff;
      font-weight: 700;
      margin-left: auto;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Composite Attributes & Tree Structure */
    .column-row.composite-parent {
      font-weight: 700;
      color: var(--text);
    }
    .column-row.sub-attribute-row {
      padding-left: 20px;
      background: rgba(0, 0, 0, 0.02);
      font-size: 11px;
      border-left: 2px solid var(--border);
      margin-left: 6px;
    }
    .col-tree-branch {
      font-family: monospace;
      color: var(--muted);
      margin-right: 4px;
      font-weight: bold;
    }
    .column-row.multivalued-row {
      outline: 1px solid rgba(56, 189, 248, 0.4);
      outline-offset: -1px;
    }
    .column-row.derived-row {
      border: 1px dashed rgba(251, 191, 36, 0.6);
      font-style: italic;
    }

    /* Inline Editing Styles (Zero-Modal Workflow) */
    .inline-edit-input {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--accent);
      border-radius: 2px;
      font-family: var(--font);
      font-size: 11px;
      font-weight: 700;
      padding: 1px 4px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }
    .inline-col-form {
      grid-column: 1 / -1;
      display: flex;
      gap: 4px;
      align-items: center;
      width: 100%;
      box-sizing: border-box;
    }
    .inline-col-name {
      background: var(--bg);
      color: var(--text);
      border: 1px solid var(--accent);
      border-radius: 2px;
      font-family: var(--font);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 4px;
      outline: none;
      flex: 1;
      min-width: 0;
    }
    .inline-col-type {
      background: var(--bg);
      color: var(--muted);
      border: 1px solid var(--border-hover);
      border-radius: 2px;
      font-family: var(--mono);
      font-size: 9px;
      padding: 2px 4px;
      outline: none;
      width: 85px;
    }

    /* Workspace Post-It Sticky Notes */
    .sticky-note {
      position: absolute;
      width: 220px;
      min-height: 140px;
      border-radius: 4px;
      z-index: 7;
      display: flex;
      flex-direction: column;
      pointer-events: auto;
      font-family: var(--mono);
      cursor: default;
    }
    .sticky-note.color-amber {
      background: #1f1b13;
      border: 1px solid #d97706;
      color: #fef3c7;
    }
    html.light .sticky-note.color-amber {
      background: #fef9c3;
      border: 1px solid #d97706;
      color: #713f12;
    }
    .sticky-note.color-slate {
      background: #181a24;
      border: 1px solid #64748b;
      color: #f1f3f9;
    }
    html.light .sticky-note.color-slate {
      background: #f1f5f9;
      border: 1px solid #94a3b8;
      color: #0f172a;
    }
    .sticky-note.color-emerald {
      background: #0d1f18;
      border: 1px solid #059669;
      color: #d1fae5;
    }
    html.light .sticky-note.color-emerald {
      background: #ecfdf5;
      border: 1px solid #059669;
      color: #064e3b;
    }
    .sticky-note.color-blue {
      background: #0f1d2d;
      border: 1px solid #0284c7;
      color: #e0f2fe;
    }
    html.light .sticky-note.color-blue {
      background: #f0f9ff;
      border: 1px solid #0284c7;
      color: #0c4a6e;
    }
    .sticky-header {
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      cursor: move;
      user-select: none;
    }
    html.light .sticky-header {
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    }
    .sticky-title {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .sticky-colors {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .color-dot-btn {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid transparent;
      cursor: pointer;
      padding: 0;
    }
    .sticky-body {
      flex: 1;
      padding: 6px 8px;
      display: flex;
    }
    .sticky-textarea {
      flex: 1;
      width: 100%;
      min-height: 85px;
      background: transparent;
      border: none;
      outline: none;
      resize: vertical;
      font-family: var(--mono);
      font-size: 11px;
      line-height: 1.4;
      color: inherit;
    }

    /* Toast Notification */
    .toast-pill {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--accent);
      padding: 8px 14px;
      border-radius: 4px;
      font-size: 11px;
      font-family: var(--mono);
      font-weight: 600;
      z-index: 1000;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: fadeInToast 0.2s ease-out;
    }
    @keyframes fadeInToast {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Right Style Inspector Tabs & Controls */
    .inspector-prop-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      font-size: 11px;
    }
    .inspector-prop-row label {
      color: var(--muted);
      font-size: 10px;
    }

    /* Draw.io Connection Anchor Points */
    .connection-point-dot {
      fill: var(--accent);
      stroke: var(--bg);
      stroke-width: 1.5;
      r: 3.5;
      opacity: 0;
      transition: opacity 0.15s, r 0.15s;
      pointer-events: none;
    }
    .table-node:hover ~ .canvas-svg-layer .connection-point-dot,
    .rel-diamond-node:hover ~ .canvas-svg-layer .connection-point-dot {
      opacity: 0.8;
    }
    /* Table Node Card */
    .table-node {
      position: absolute;
      width: 250px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 4px;
      pointer-events: auto;
      cursor: default;
      transition: border-color 0.15s;
    }
    /* Weak Entity: Double Border Representation */
    .table-node.weak-entity {
      border: 3px double var(--accent);
    }
    .table-node.selected {
      border-color: var(--accent);
      outline: 1px solid var(--accent);
    }
    .table-header {
      background: var(--surface);
      padding: 7px 10px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: move;
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }
    .table-title {
      font-weight: 700;
      font-size: 11px;
      color: var(--text);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .weak-badge {
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 2px;
      background: var(--surface);
      color: var(--accent);
      border: 1px solid var(--accent);
    }
    .table-actions {
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .icon-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      cursor: pointer;
      font-size: 11px;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: var(--mono);
      transition: background 0.1s, color 0.1s;
    }
    .icon-btn:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.08);
    }
    .icon-btn.danger:hover {
      color: var(--danger);
      background: rgba(239, 68, 68, 0.15);
    }
    .table-columns {
      padding: 3px 0;
      max-height: 260px;
      overflow-y: auto;
    }
    .column-row {
      padding: 4px 10px;
      font-size: 10px;
      display: grid;
      grid-template-columns: 14px 1fr auto auto;
      gap: 6px;
      align-items: center;
      border-bottom: 1px solid rgba(36, 39, 53, 0.35);
    }
    .column-row:last-child {
      border-bottom: none;
    }
    .column-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .col-key-icon {
      font-size: 9px;
      font-weight: 700;
      text-align: center;
    }
    .key-pk { color: var(--accent); }
    .key-fk { color: var(--info); }
    .col-name {
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      cursor: pointer;
    }
    .col-name:hover {
      text-decoration: underline;
      color: var(--accent);
    }
    .col-type {
      color: var(--muted);
      font-size: 9px;
      text-align: right;
    }
    .col-actions {
      display: none;
    }
    .column-row:hover .col-actions {
      display: inline-flex;
    }

    /* Right Panel: Inspector */
    .inspector-panel {
      background: var(--surface);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .panel-tabs {
      display: flex;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      overflow-x: auto;
    }
    .tab-btn {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--muted);
      padding: 9px 11px;
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .tab-btn:hover {
      color: var(--text);
    }
    .tab-btn.active {
      color: var(--accent);
      border-bottom-color: var(--accent);
      background: var(--card);
    }
    .panel-content {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .tab-pane {
      display: none;
      padding: 12px;
      flex: 1;
      flex-direction: column;
      gap: 10px;
    }
    .tab-pane.active {
      display: flex;
    }

    /* Code View Area */
    .code-container {
      position: relative;
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 4px;
      overflow: hidden;
      min-height: 280px;
    }
    .code-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: var(--card);
      border-bottom: 1px solid var(--border);
      font-size: 10px;
    }
    .code-pre {
      flex: 1;
      margin: 0;
      padding: 10px;
      color: #cbd5e1;
      font-family: var(--mono);
      font-size: 11px;
      line-height: 1.5;
      overflow: auto;
      white-space: pre;
    }

    /* Telemetry Grid */
    .telemetry-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .metric-card {
      background: var(--card);
      border: 1px solid var(--border);
      padding: 10px;
      border-radius: 4px;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 800;
      color: var(--accent);
      margin-top: 3px;
    }
    .metric-lbl {
      font-size: 9px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Relations Manager */
    .relations-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 6px;
      max-height: 240px;
      overflow-y: auto;
    }
    .rel-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 3px;
      font-size: 10px;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .modal-box {
      background: var(--surface);
      border: 1px solid var(--border-hover);
      border-radius: 4px;
      width: 90%;
      max-width: 540px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-box.wide {
      max-width: 820px;
      height: 600px;
    }
    .modal-head {
      padding: 10px 14px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--card);
    }
    .modal-head h3 {
      font-size: 12px;
      font-weight: 700;
    }
    .modal-body {
      padding: 14px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .modal-foot {
      padding: 10px 14px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background: var(--card);
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .form-group label {
      font-size: 10px;
      color: var(--muted);
    }
    .form-input {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      font-family: var(--mono);
      font-size: 11px;
      padding: 6px 9px;
      border-radius: 3px;
      outline: none;
    }
    .form-input:focus {
      border-color: var(--accent);
    }
    .checkbox-wrap {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text);
      cursor: pointer;
    }

    /* Objects Explorer Popup Table */
    .explorer-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .explorer-table th, .explorer-table td {
      border: 1px solid var(--border);
      padding: 6px 10px;
      text-align: left;
    }
    .explorer-table th {
      background: var(--card);
      color: var(--muted);
      font-size: 10px;
      text-transform: uppercase;
    }
    .explorer-table tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
  </style>
</head>
<body>

  <!-- Topbar -->
  <header class="topbar">
    <div class="topbar-left">
      <span class="brand-badge">RELAY</span>
      <span class="brand-title">SQL SCHEMA STUDIO</span>

      <div class="topbar-menu">
        <select id="templateSelector" class="select" title="Switch Starter Schema">
          <option value="universita" selected>Template: Università & Ricerca (ISA, N-Aria, Composti)</option>
          <option value="biblioteca">Template: Biblioteca (Chen ER Draw.io)</option>
          <option value="ecommerce">Template: E-Commerce Store</option>
          <option value="saas_auth">Template: SaaS Multi-Tenant & RBAC</option>
          <option value="blog_cms">Template: Content Publishing CMS</option>
        </select>
        <button id="btnOpenExplorer" class="btn btn-sm" title="Explore All Schema Objects">OBJECTS POPUP</button>
      </div>
    </div>

    <div class="topbar-right">
      <button id="btnToggleTheme" class="btn btn-sm" title="Toggle Light / Dark Theme">THEME: DARK</button>
      <button id="btnNewTable" class="btn btn-accent btn-sm">+ TABLE</button>
      <button id="btnNewWeakEntity" class="btn btn-sm" title="Add Weak Entity with double border">+ WEAK ENTITY</button>
      <button id="btnNewIsa" class="btn btn-sm" title="Add Generalization / Specialization ISA Hierarchy">+ ISA</button>
      <button id="btnNewRel" class="btn btn-sm">+ RELATION</button>
      <button id="btnNewNote" class="btn btn-sm" title="Add Workspace Post-It Sticky Note">+ NOTE</button>
      <button id="btnExportJson" class="btn btn-sm">JSON</button>
      <button id="btnOpenImportModal" class="btn btn-sm" title="Import Mermaid ER (.mmd) or JSON Schema">IMPORT</button>
      <input type="file" id="fileImport" accept=".mmd,.mermaid,.json,.txt" style="display:none;" />
    </div>
  </header>

  <!-- Studio Workspace -->
  <main class="studio-layout">
    
    <!-- Left Sidebar: Object Shapes Library -->
    <aside class="sidebar">
      <!-- Entity Shapes -->
      <div class="sidebar-section">
        <div class="sidebar-title">
          <span>ENTITIES & TABLES</span>
        </div>
        
        <div class="library-item" id="libStandardEntity" title="Add Standard Entity Card">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Entity Table</span>
            <span class="item-desc">Standard table card</span>
          </div>
        </div>

        <div class="library-item" id="libChenEntity" title="Add Chen Rectangle Entity">
          <div class="item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="1"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Chen Entity</span>
            <span class="item-desc">Rectangle block</span>
          </div>
        </div>

        <div class="library-item" id="libWeakEntity" title="Add Weak Entity (Double Rectangle)">
          <div class="item-icon weak-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="4" width="20" height="16" rx="1"/>
              <rect x="5" y="7" width="14" height="10" rx="1"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Weak Entity</span>
            <span class="item-desc">Double border rectangle</span>
          </div>
        </div>

        <div class="library-item" id="libAssociativeEntity" title="Add Associative Entity (Diamond in Box)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="2" y="3" width="20" height="18" rx="1"/>
              <polygon points="12 5 20 12 12 19 4 12"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Associative Entity</span>
            <span class="item-desc">Diamond in box bridge</span>
          </div>
        </div>

        <div class="library-item" id="libIsaHierarchy" title="Add Generalization / Specialization Hierarchy (Inverted Triangle ISA)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2">
              <polygon points="12 21 2 4 22 4"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Generalization (ISA) ▽</span>
            <span class="item-desc">Hierarchy (t/p, d/o)</span>
          </div>
        </div>

        <div class="library-item" id="libStickyNote" title="Add Workspace Sticky Note / Comment (Post-It)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="13" y2="17"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Post-It Note</span>
            <span class="item-desc">Workspace comment / note</span>
          </div>
        </div>
      </div>

      <!-- Relationship Shapes -->
      <div class="sidebar-section">
        <div class="sidebar-title">
          <span>RELATIONSHIPS</span>
        </div>

        <div class="library-item" id="libRelDiamond" title="Add Relationship Diamond (SCRIVE, PRESTITO)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 22 12 12 22 2 12"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Relationship ◇</span>
            <span class="item-desc">Chen relation diamond</span>
          </div>
        </div>

        <div class="library-item" id="libRelWeakDiamond" title="Add Identifying / Weak Relationship (Double Diamond)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polygon points="12 2 22 12 12 22 2 12"/>
              <polygon points="12 6 18 12 12 18 6 12"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Identifying Rel ◈</span>
            <span class="item-desc">Double diamond for weak entity</span>
          </div>
        </div>

        <div class="library-item" id="libRel1toN" title="Create 1:N Crow's Foot Connector">
          <div class="item-icon">
            <span style="font-size:10px; font-weight:800; color:var(--accent);">1:N</span>
          </div>
          <div class="item-meta">
            <span class="item-name">One-to-Many</span>
            <span class="item-desc">Crow's foot line (1:N)</span>
          </div>
        </div>

        <div class="library-item" id="libRel1to1" title="Create 1:1 Crow's Foot Connector">
          <div class="item-icon">
            <span style="font-size:10px; font-weight:800; color:var(--accent);">1:1</span>
          </div>
          <div class="item-meta">
            <span class="item-name">One-to-One</span>
            <span class="item-desc">Single cardinality (1:1)</span>
          </div>
        </div>

        <div class="library-item" id="libRelNtoM" title="Create N:M Relationship Connector">
          <div class="item-icon">
            <span style="font-size:10px; font-weight:800; color:#38bdf8;">N:M</span>
          </div>
          <div class="item-meta">
            <span class="item-name">Many-to-Many</span>
            <span class="item-desc">Bridge cardinality (N:M)</span>
          </div>
        </div>
      </div>

      <!-- Attributes Shapes (Chen notation) -->
      <div class="sidebar-section">
        <div class="sidebar-title">
          <span>ATTRIBUTES (CHEN)</span>
        </div>

        <div class="library-item" id="libAttrNormal" title="Add Attribute (Oval)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <ellipse cx="12" cy="12" rx="10" ry="6"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Attribute</span>
            <span class="item-desc">Regular oval</span>
          </div>
        </div>

        <div class="library-item" id="libAttrKey" title="Add Key Attribute (Underlined Oval)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
              <ellipse cx="12" cy="12" rx="10" ry="6"/>
              <line x1="6" y1="14" x2="18" y2="14" stroke-width="1.5"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Key Attribute</span>
            <span class="item-desc">Underlined primary key</span>
          </div>
        </div>

        <div class="library-item" id="libAttrMultivalued" title="Add Multivalued Attribute (Double Oval)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5">
              <ellipse cx="12" cy="12" rx="10" ry="7"/>
              <ellipse cx="12" cy="12" rx="7" ry="4"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Multivalued</span>
            <span class="item-desc">Double oval attribute</span>
          </div>
        </div>

        <div class="library-item" id="libAttrDerived" title="Add Derived Attribute (Dashed Oval)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="1.8" stroke-dasharray="3 2">
              <ellipse cx="12" cy="12" rx="10" ry="6"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Derived Attribute</span>
            <span class="item-desc">Dashed oval calculation</span>
          </div>
        </div>

        <div class="library-item" id="libAttrComposite" title="Add Composite Attribute (Branched Tree ⑂)">
          <div class="item-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2">
              <circle cx="6" cy="6" r="2.5"/>
              <circle cx="18" cy="6" r="2.5"/>
              <circle cx="12" cy="18" r="2.5"/>
              <path d="M6 8.5v3h6m0 0h6V8.5m-6 3v4"/>
            </svg>
          </div>
          <div class="item-meta">
            <span class="item-name">Composite Tree ⑂</span>
            <span class="item-desc">Branched sub-fields</span>
          </div>
        </div>
      </div>

      <!-- Cardinality Connectors & Shortcuts -->
      <div class="sidebar-section">
        <div class="sidebar-title">
          <span>CARDINALITY SHORTCUTS</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; margin-bottom:5px;">
          <button class="btn btn-sm" id="btnCard01" title="Apply (0,1) to Selected Relation">(0,1)</button>
          <button class="btn btn-sm" id="btnCard11" title="Apply (1,1) to Selected Relation">(1,1)</button>
          <button class="btn btn-sm" id="btnCard0N" title="Apply (0,N) to Selected Relation">(0,N)</button>
          <button class="btn btn-sm" id="btnCard1N" title="Apply (1,N) to Selected Relation">(1,N)</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px;">
          <button class="btn btn-sm" id="btnSidebarCopyCard" title="Copy Cardinality from Selected Relation" style="padding:2px 4px; font-size:9px;">COPY</button>
          <button class="btn btn-sm" id="btnSidebarPasteCard" title="Paste Cardinality to Selected Relation" style="padding:2px 4px; font-size:9px;">PASTE</button>
          <button class="btn btn-sm" id="btnSidebarSwapCard" title="Swap Source & Target Cardinalities" style="padding:2px 4px; font-size:9px;">⇄ SWAP</button>
        </div>
      </div>

      <div class="sidebar-section" style="margin-top:auto;">
        <div class="sidebar-title">
          <span>CANVAS STATS</span>
        </div>
        <div style="font-size:10px; color:var(--muted); display:flex; flex-direction:column; gap:4px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Entities:</span>
            <span id="sideEntities" style="color:var(--text); font-weight:700;">4</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Weak Entities:</span>
            <span id="sideWeakEntities" style="color:var(--accent); font-weight:700;">1</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Relations:</span>
            <span id="sideRelations" style="color:var(--text); font-weight:700;">3</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Center: ER Diagram Canvas -->
    <section class="canvas-panel">
      <div class="canvas-toolbar">
        <button id="btnZoomIn" class="btn btn-sm" title="Zoom In">+</button>
        <button id="btnZoomOut" class="btn btn-sm" title="Zoom Out">-</button>
        <button id="btnZoomReset" class="btn btn-sm" title="Reset Viewport">100%</button>
        <button id="btnAutoLayout" class="btn btn-sm" title="Auto-align diagram">AUTO-LAYOUT</button>
        <div style="width:1px; height:18px; background:var(--border); margin:0 3px;"></div>
        <button id="btnToggleNotation" class="btn btn-accent btn-sm" title="Switch between Chen Notation & Crow's Foot">NOTATION: CHEN</button>
        <button id="btnToggleRouting" class="btn btn-accent btn-sm" title="Toggle Smart Orthogonal Manhattan routing vs Direct lines">ROUTING: SMART ORTHO</button>
        <button id="btnToggleGrid" class="btn btn-sm" title="Toggle Grid Visibility">GRID: ON</button>
        <button id="btnToggleSnap" class="btn btn-sm" title="Toggle Grid Snapping">SNAP: ON</button>
        <div style="width:1px; height:18px; background:var(--border); margin:0 3px;"></div>
        <button id="btnToolbarNewIsa" class="btn btn-sm" title="Add Generalization / Specialization ISA Hierarchy">+ ISA</button>
        <button id="btnCompilePhysical" class="btn btn-sm" title="Normalize N:M relations into physical junction tables">NORMALIZZA FISICO</button>
        <button id="btnToolbarNewNote" class="btn btn-sm" title="Add Workspace Post-It Note">+ NOTE</button>
        <button id="btnToolbarImport" class="btn btn-sm" title="Import SQL DDL, Mermaid ER or JSON">IMPORT SQL / MERMAID</button>
      </div>

      <div class="canvas-controls">
        <span id="canvasCoords">X: 0 Y: 0</span>
        <span>|</span>
        <span id="zoomLevel">100%</span>
        <span>|</span>
        <span id="entityCount">5 Entities</span>
      </div>

      <div class="canvas-viewport" id="canvasViewport">
        <!-- Unified Canvas Transform Stage: scales and pans everything together -->
        <div class="canvas-stage" id="canvasStage">
          <!-- SVG Connections Layer -->
          <svg class="canvas-svg-layer" id="svgLayer">
            <defs>
              <marker id="crowOne" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                <line x1="8" y1="1" x2="8" y2="9" stroke="#10b981" stroke-width="1.5" />
              </marker>
              <marker id="crowMany" markerWidth="12" markerHeight="10" refX="10" refY="5" orient="auto">
                <path d="M0 0 L10 5 L0 10" fill="none" stroke="#10b981" stroke-width="1.5" />
                <line x1="6" y1="1" x2="6" y2="9" stroke="#10b981" stroke-width="1.5" />
              </marker>
            </defs>
          </svg>

          <!-- Dynamic Entity Nodes Layer -->
          <div class="nodes-layer" id="nodesLayer"></div>

          <!-- Cardinalities Badges Layer -->
          <div class="labels-layer" id="labelsLayer"></div>
        </div>
      </div>
    </section>

    <!-- Right Panel: Exporters, Analysis & Telemetry -->
    <aside class="inspector-panel">
      <div class="panel-tabs">
        <button class="tab-btn active" data-tab="style">STYLE</button>
        <button class="tab-btn" data-tab="sql">SQL DDL</button>
        <button class="tab-btn" data-tab="mermaid">MERMAID ER</button>
        <button class="tab-btn" data-tab="dbml">DBML</button>
        <button class="tab-btn" data-tab="analysis">ANALYSIS DOCX</button>
        <button class="tab-btn" data-tab="relations">RELATIONS</button>
        <button class="tab-btn" data-tab="telemetry">TELEMETRY</button>
      </div>

      <div class="panel-content">
        <!-- Tab: Diagram & Style Inspector (Draw.io format panel) -->
        <div class="tab-pane active" id="pane-style">
          <div style="background:var(--card); border:1px solid var(--border); border-radius:4px; padding:12px; display:flex; flex-direction:column; gap:8px;">
            <div style="font-size:11px; font-weight:700; color:var(--text); text-transform:uppercase; letter-spacing:0.5px; border-bottom:1px solid var(--border); padding-bottom:6px;">
              DIAGRAM FORMAT & STYLING
            </div>
            
            <div class="inspector-prop-row">
              <label>Notation Paradigm</label>
              <select id="inspectorNotationSelect" class="select" style="padding:2px 6px; font-size:10px;">
                <option value="chen">Chen ER (Diamonds, Ovals, (min,max))</option>
                <option value="crow">Crow's Foot (Physical Tables, Bezier)</option>
              </select>
            </div>

            <div class="inspector-prop-row">
              <label>Background Grid</label>
              <label class="checkbox-wrap">
                <input type="checkbox" id="chkInspectorGrid" checked /> Show Grid
              </label>
            </div>

            <div class="inspector-prop-row">
              <label>Grid Snap</label>
              <label class="checkbox-wrap">
                <input type="checkbox" id="chkInspectorSnap" checked /> Snap to 10px
              </label>
            </div>

            <div class="inspector-prop-row">
              <label>Selected Element</label>
              <span id="inspectorSelectedLabel" style="color:var(--accent); font-weight:700; font-size:11px;">None</span>
            </div>

            <!-- Full Color Picker Suite for Selected Element or Theme -->
            <div style="font-size:10px; font-weight:700; color:var(--accent); text-transform:uppercase; margin-top:6px; letter-spacing:0.5px;">
              ELEMENT COLOR CUSTOMIZATION
            </div>

            <div class="inspector-prop-row">
              <label>Fill Background</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="color" id="pickerFillColor" value="#181a24" style="width:24px; height:22px; padding:0; border:none; cursor:pointer; background:none;" />
                <input type="text" id="textFillColor" class="form-input" style="width:80px; padding:2px 5px; font-size:10px;" value="#181a24" />
              </div>
            </div>

            <div class="inspector-prop-row">
              <label>Border / Stroke Color</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="color" id="pickerStrokeColor" value="#242735" style="width:24px; height:22px; padding:0; border:none; cursor:pointer; background:none;" />
                <input type="text" id="textStrokeColor" class="form-input" style="width:80px; padding:2px 5px; font-size:10px;" value="#242735" />
              </div>
            </div>

            <div class="inspector-prop-row">
              <label>Header / Text Color</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="color" id="pickerTextColor" value="#f1f3f9" style="width:24px; height:22px; padding:0; border:none; cursor:pointer; background:none;" />
                <input type="text" id="textTextColor" class="form-input" style="width:80px; padding:2px 5px; font-size:10px;" value="#f1f3f9" />
              </div>
            </div>

            <div class="inspector-prop-row">
              <label>Fill Opacity</label>
              <div style="display:flex; gap:6px; align-items:center;">
                <input type="range" id="rangeFillOpacity" min="10" max="100" value="100" style="width:80px;" />
                <span id="labelFillOpacity" style="font-size:10px; color:var(--muted); min-width:28px;">100%</span>
              </div>
            </div>

            <div class="inspector-prop-row">
              <label>Stroke Width</label>
              <select id="selectStrokeWidth" class="select" style="padding:2px 6px; font-size:10px;">
                <option value="1">1 pt (Thin)</option>
                <option value="2" selected>2 pt (Standard)</option>
                <option value="3">3 pt (Bold)</option>
                <option value="4">4 pt (Heavy)</option>
              </select>
            </div>

            <!-- Quick Color Presets -->
            <div style="display:flex; gap:4px; align-items:center; margin-top:2px;">
              <span style="font-size:9px; color:var(--muted); margin-right:4px;">Presets:</span>
              <button class="btn btn-sm" style="padding:2px 5px; background:#059669; color:#fff;" onclick="applyColorPreset('#064e3b', '#10b981', '#ffffff')">Emerald</button>
              <button class="btn btn-sm" style="padding:2px 5px; background:#0284c7; color:#fff;" onclick="applyColorPreset('#075985', '#0284c7', '#ffffff')">Blue</button>
              <button class="btn btn-sm" style="padding:2px 5px; background:#475569; color:#fff;" onclick="applyColorPreset('#1e293b', '#475569', '#ffffff')">Slate</button>
              <button class="btn btn-sm" style="padding:2px 5px; background:#6366f1; color:#fff;" onclick="applyColorPreset('#312e81', '#6366f1', '#ffffff')">Indigo</button>
              <button class="btn btn-sm" style="padding:2px 5px; background:#d97706; color:#000;" onclick="applyColorPreset('#78350f', '#d97706', '#ffffff')">Amber</button>
            </div>

            <div style="display:flex; gap:6px; margin-top:8px;">
              <button class="btn btn-sm btn-accent" id="btnApplyShapeStyle" style="flex:1;">APPLY COLOR & STYLE</button>
              <button class="btn btn-sm" id="btnResetElementColor">RESET</button>
              <button class="btn btn-sm" id="btnDeselectAll">CLEAR</button>
            </div>
          </div>

          <div style="background:var(--card); border:1px solid var(--border); border-radius:4px; padding:12px; margin-top:6px;">
            <div style="font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; margin-bottom:6px;">
              DRAW.IO QUICK ACTIONS
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <button class="btn btn-sm" onclick="document.getElementById('libRelDiamond').click()">+ DIAMOND</button>
              <button class="btn btn-sm" onclick="document.getElementById('libChenEntity').click()">+ CHEN ENTITY</button>
              <button class="btn btn-sm" onclick="document.getElementById('libWeakEntity').click()">+ WEAK ENTITY</button>
              <button class="btn btn-sm" onclick="document.getElementById('btnOpenExplorer').click()">OBJECTS POPUP</button>
            </div>
          </div>
        </div>

        <!-- Tab: SQL DDL -->
        <div class="tab-pane" id="pane-sql">
          <div class="code-container">
            <div class="code-toolbar">
              <div style="display:flex; gap:6px; align-items:center;">
                <label style="color:var(--muted); font-size:10px;">DIALECT:</label>
                <select id="dialectSelector" class="select" style="padding:2px 6px; font-size:10px;">
                  <option value="postgres">PostgreSQL</option>
                  <option value="mysql">MySQL 8.0</option>
                  <option value="sqlite">SQLite 3</option>
                </select>
              </div>
              <button id="btnCopySql" class="btn btn-sm">COPY DDL</button>
            </div>
            <pre class="code-pre" id="codeSql">-- Generating SQL...</pre>
          </div>
        </div>

        <!-- Tab: Mermaid ER -->
        <div class="tab-pane" id="pane-mermaid">
          <div class="code-container" style="display:flex; flex-direction:column;">
            <div class="code-toolbar">
              <span style="color:var(--muted); font-size:10px;">MERMAID CROW'S FOOT ER</span>
              <div style="display:flex; gap:4px;">
                <button id="btnImportMermaidTab" class="btn btn-sm" title="Import from Mermaid file or template">IMPORT</button>
                <button id="btnApplyMermaidLive" class="btn btn-accent btn-sm" title="Apply edited Mermaid code directly to canvas">APPLY TO CANVAS</button>
                <button id="btnCopyMermaid" class="btn btn-sm">COPY</button>
              </div>
            </div>
            <textarea class="code-pre" id="codeMermaid" style="flex:1; min-height:280px; resize:none; border:none; outline:none; background:transparent; font-family:var(--mono); font-size:11px; line-height:1.5; padding:10px; width:100%; box-sizing:border-box;" spellcheck="false" placeholder="%% Mermaid erDiagram..."></textarea>
          </div>
        </div>

        <!-- Tab: DBML -->
        <div class="tab-pane" id="pane-dbml">
          <div class="code-container">
            <div class="code-toolbar">
              <span style="color:var(--muted); font-size:10px;">DATABASE MARKUP LANGUAGE</span>
              <button id="btnCopyDbml" class="btn btn-sm">COPY</button>
            </div>
            <pre class="code-pre" id="codeDbml">// Generating DBML...</pre>
          </div>
        </div>

        <!-- Tab: Logical Analysis & DOCX Export -->
        <div class="tab-pane" id="pane-analysis">
          <div class="code-container">
            <div class="code-toolbar">
              <span style="color:var(--muted); font-size:10px;">LOGICAL DATA MODEL REPORT</span>
              <div style="display:flex; gap:6px;">
                <button id="btnCopyAnalysis" class="btn btn-sm">COPY MD</button>
                <button id="btnExportDocx" class="btn btn-accent btn-sm">EXPORT .DOCX</button>
              </div>
            </div>
            <pre class="code-pre" id="codeAnalysis"># Generating technical analysis...</pre>
          </div>
        </div>

        <!-- Tab: Relations Manager -->
        <div class="tab-pane" id="pane-relations">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; font-weight:700; color:var(--text);">ACTIVE RELATIONSHIPS</span>
            <button class="btn btn-accent btn-sm" onclick="document.getElementById('btnNewRel').click()">+ ADD</button>
          </div>
          <div class="relations-list" id="relationsListContainer"></div>
        </div>

        <!-- Tab: Telemetry -->
        <div class="tab-pane" id="pane-telemetry">
          <div class="telemetry-grid">
            <div class="metric-card">
              <div class="metric-lbl">Total Entities</div>
              <div class="metric-val" id="metricTables">0</div>
            </div>
            <div class="metric-card">
              <div class="metric-lbl">Weak Entities</div>
              <div class="metric-val" id="metricWeak" style="color:#38bdf8;">0</div>
            </div>
            <div class="metric-card">
              <div class="metric-lbl">Total Columns</div>
              <div class="metric-val" id="metricColumns">0</div>
            </div>
            <div class="metric-card">
              <div class="metric-lbl">Primary Keys</div>
              <div class="metric-val" id="metricPks">0</div>
            </div>
            <div class="metric-card">
              <div class="metric-lbl">Foreign Keys</div>
              <div class="metric-val" id="metricFks">0</div>
            </div>
            <div class="metric-card">
              <div class="metric-lbl">Cyclomatic Complexity</div>
              <div class="metric-val" id="metricCyclomatic">1</div>
            </div>
            <div class="metric-card" style="grid-column: span 2;">
              <div class="metric-lbl">Est. Normalization</div>
              <div class="metric-val" id="metricNormal" style="font-size:15px; margin-top:4px;">3NF / BCNF</div>
            </div>
          </div>

          <div style="background:var(--card); border:1px solid var(--border); border-radius:4px; padding:12px; margin-top:10px;">
            <div style="font-size:10px; font-weight:700; margin-bottom:8px; color:var(--text); text-transform:uppercase;">Cardinality Distribution</div>
            <div style="font-size:11px; color:var(--muted); display:flex; flex-direction:column; gap:4px;">
              <div style="display:flex; justify-content:space-between;">
                <span>One-to-One (1:1):</span>
                <span id="metric1to1" style="color:var(--text); font-weight:600;">0</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>One-to-Many (1:N):</span>
                <span id="metric1toN" style="color:var(--text); font-weight:600;">0</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span>Many-to-Many (N:M):</span>
                <span id="metricNtoM" style="color:var(--text); font-weight:600;">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>

  </main>

  <!-- Popup Modal: Schema Objects Explorer -->
  <div class="modal-backdrop" id="modalExplorer">
    <div class="modal-box wide">
      <div class="modal-head">
        <h3>SCHEMA OBJECTS EXPLORER</h3>
        <button class="icon-btn" onclick="closeModal('modalExplorer')">✕</button>
      </div>
      <div class="modal-body">
        <div style="display:flex; gap:10px; align-items:center;">
          <input type="text" id="filterExplorerInput" class="form-input" style="flex:1;" placeholder="Filter tables or columns..." />
          <span id="explorerSummary" style="font-size:11px; color:var(--muted);">5 Tables, 24 Columns</span>
        </div>
        <div style="overflow-x:auto;">
          <table class="explorer-table" id="explorerTableElem">
            <thead>
              <tr>
                <th>Entity Name</th>
                <th>Type</th>
                <th>Columns</th>
                <th>Primary Key</th>
                <th>Incoming Foreign Keys</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="explorerTableBody"></tbody>
          </table>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal('modalExplorer')">CLOSE</button>
      </div>
    </div>
  </div>

  <!-- Add Table Modal -->
  <div class="modal-backdrop" id="modalTable">
    <div class="modal-box">
      <div class="modal-head">
        <h3 id="modalTableTitle">ADD NEW TABLE</h3>
        <button class="icon-btn" onclick="closeModal('modalTable')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Table Name</label>
          <input type="text" id="inputTableName" class="form-input" placeholder="e.g. accounts" />
        </div>
        <div class="form-group">
          <label>Description / Comment (Optional)</label>
          <input type="text" id="inputTableComment" class="form-input" placeholder="Platform accounts" />
        </div>
        <div style="margin-top:6px;">
          <label class="checkbox-wrap">
            <input type="checkbox" id="chkTableWeak" /> Weak Entity (Double border notation)
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal('modalTable')">CANCEL</button>
        <button class="btn btn-accent" id="btnSaveTable">SAVE TABLE</button>
      </div>
    </div>
  </div>

  <!-- Add / Edit Column Modal -->
  <div class="modal-backdrop" id="modalColumn">
    <div class="modal-box">
      <div class="modal-head">
        <h3 id="modalColumnTitle">COLUMN DETAILS</h3>
        <button class="icon-btn" onclick="closeModal('modalColumn')">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="inputColTableName" />
        <input type="hidden" id="inputColOriginalName" />
        <div class="form-group">
          <label>Column Name</label>
          <input type="text" id="inputColName" class="form-input" placeholder="e.g. email" />
        </div>
        <div class="form-group">
          <label>Data Type</label>
          <select id="inputColType" class="select form-input">
            <option value="uuid">uuid</option>
            <option value="serial">serial</option>
            <option value="bigserial">bigserial</option>
            <option value="varchar(255)">varchar(255)</option>
            <option value="varchar(100)">varchar(100)</option>
            <option value="text">text</option>
            <option value="integer">integer</option>
            <option value="bigint">bigint</option>
            <option value="boolean">boolean</option>
            <option value="timestamp">timestamp</option>
            <option value="jsonb">jsonb</option>
          </select>
        </div>
        <div class="form-group">
          <label>Default Value (Optional)</label>
          <input type="text" id="inputColDefault" class="form-input" placeholder="e.g. 'active' or 0" />
        </div>
        <div class="form-group">
          <label>Chen Attribute Representation</label>
          <select id="inputColAttrType" class="select form-input">
            <option value="normal">Normal Attribute (Regular Oval)</option>
            <option value="key">Key Attribute (Underlined Oval)</option>
            <option value="multivalued">Multivalued Attribute (Double Oval)</option>
            <option value="derived">Derived Attribute (Dashed Oval)</option>
            <option value="composite">Composite Attribute (Branched Tree ⑂)</option>
          </select>
        </div>
        <div id="subAttributesSection" style="display:none; background:var(--card); border:1px solid var(--border); border-radius:4px; padding:8px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:10px; font-weight:700; color:var(--text); text-transform:uppercase;">Sub-Attributes / Branched Fields</span>
            <button type="button" class="btn btn-sm btn-accent" id="btnAddSubAttrRow">+ ADD SUB-FIELD</button>
          </div>
          <div id="subAttributesList" style="display:flex; flex-direction:column; gap:4px; max-height:140px; overflow-y:auto;"></div>
        </div>
        <div style="display:flex; gap:16px; margin-top:4px;">
          <label class="checkbox-wrap">
            <input type="checkbox" id="chkColPk" /> Primary Key
          </label>
          <label class="checkbox-wrap">
            <input type="checkbox" id="chkColUnique" /> Unique
          </label>
          <label class="checkbox-wrap">
            <input type="checkbox" id="chkColNullable" /> Nullable
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-danger" id="btnDeleteColumnModal" style="display:none; margin-right:auto;">DELETE</button>
        <button class="btn" onclick="closeModal('modalColumn')">CANCEL</button>
        <button class="btn btn-accent" id="btnSaveColumn">SAVE COLUMN</button>
      </div>
    </div>
  </div>

  <!-- Add Relationship Modal -->
  <div class="modal-backdrop" id="modalRelation">
    <div class="modal-box">
      <div class="modal-head">
        <h3>ADD RELATIONSHIP</h3>
        <button class="icon-btn" onclick="closeModal('modalRelation')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Source Table (Primary Key Owner)</label>
          <select id="relSourceTable" class="select form-input"></select>
        </div>
        <div class="form-group">
          <label>Source Column</label>
          <select id="relSourceColumn" class="select form-input"></select>
        </div>
        <div class="form-group">
          <label>Target Table (Foreign Key Owner)</label>
          <select id="relTargetTable" class="select form-input"></select>
        </div>
        <div class="form-group">
          <label>Relationship Name (Chen Diamond, e.g. SCRIVE, PRESTITO)</label>
          <input type="text" id="relName" class="form-input" placeholder="e.g. PRESTITO, SCRIVE, HA_COPIA" />
        </div>
        <div class="form-group">
          <label>Target Column</label>
          <select id="relTargetColumn" class="select form-input"></select>
        </div>
        <!-- Quick Cardinality Presets & Shortcuts -->
        <div style="background:var(--card); border:1px solid var(--border); border-radius:4px; padding:8px; margin-bottom:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:9px; font-weight:700; color:var(--muted); text-transform:uppercase;">QUICK CARDINALITY PRESETS</span>
            <div style="display:flex; gap:4px;">
              <button type="button" class="btn btn-sm" id="btnModalCopyCard" title="Copy Current Cardinalities">COPY</button>
              <button type="button" class="btn btn-sm" id="btnModalPasteCard" title="Paste Copied Cardinalities">PASTE</button>
              <button type="button" class="btn btn-sm" id="btnModalSwapCard" title="Swap Source & Target">⇄ SWAP</button>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px;">
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(1,1)', '(0,N)', '1:N')">1:N (1,1)-(0,N)</button>
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(0,1)', '(1,N)', '1:N')">1:N (0,1)-(1,N)</button>
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(1,1)', '(1,1)', '1:1')">1:1 (1,1)-(1,1)</button>
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(0,1)', '(1,1)', '1:1')">1:1 (0,1)-(1,1)</button>
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(0,N)', '(0,N)', 'N:M')">N:M (0,N)-(0,N)</button>
            <button type="button" class="btn btn-sm" onclick="applyCardinalityToModal('(1,N)', '(1,N)', 'N:M')">N:M (1,N)-(1,N)</button>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label>Source Cardinality</label>
              <div style="display:flex; gap:2px;">
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relSourceCard').value='(1,1)'">(1,1)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relSourceCard').value='(0,1)'">(0,1)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relSourceCard').value='(1,N)'">(1,N)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relSourceCard').value='(0,N)'">(0,N)</button>
              </div>
            </div>
            <select id="relSourceCard" class="select form-input">
              <option value="(1,1)">(1,1)</option>
              <option value="(0,1)">(0,1)</option>
              <option value="(1,N)" selected>(1,N)</option>
              <option value="(0,N)">(0,N)</option>
            </select>
          </div>
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <label>Target Cardinality</label>
              <div style="display:flex; gap:2px;">
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relTargetCard').value='(0,N)'">(0,N)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relTargetCard').value='(1,N)'">(1,N)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relTargetCard').value='(1,1)'">(1,1)</button>
                <button type="button" class="btn btn-sm" style="padding:1px 3px; font-size:9px;" onclick="document.getElementById('relTargetCard').value='(0,1)'">(0,1)</button>
              </div>
            </div>
            <select id="relTargetCard" class="select form-input">
              <option value="(1,1)">(1,1)</option>
              <option value="(0,1)">(0,1)</option>
              <option value="(1,N)">(1,N)</option>
              <option value="(0,N)" selected>(0,N)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Relationship Attributes (Optional, comma-separated e.g. DataPrestito, OraPrestito)</label>
          <input type="text" id="relAttributes" class="form-input" placeholder="e.g. DataPrestito, OraPrestito, ScadenzaPrevista" />
        </div>
        <div class="form-group">
          <label>Cardinality</label>
          <select id="relType" class="select form-input">
            <option value="1:N">One-to-Many (1:N)</option>
            <option value="1:1">One-to-One (1:1)</option>
            <option value="N:M">Many-to-Many (N:M)</option>
          </select>
        </div>
        <div class="form-group">
          <label>On Delete</label>
          <select id="relOnDelete" class="select form-input">
            <option value="CASCADE">CASCADE</option>
            <option value="SET NULL">SET NULL</option>
            <option value="RESTRICT">RESTRICT</option>
            <option value="NO ACTION">NO ACTION</option>
          </select>
        </div>
        <div style="margin-top:4px;">
          <label class="checkbox-wrap">
            <input type="checkbox" id="relIsIdentifying" /> Identifying Relationship (Weak Entity Owner)
          </label>
        </div>

        <!-- N-ary Extra Branches Section -->
        <div id="naryParticipantsSection" style="background:var(--card); border:1px solid var(--border); border-radius:4px; padding:8px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:10px; font-weight:700; color:var(--text); text-transform:uppercase;">N-Ary Branches (3+ Participating Entities)</span>
            <button type="button" class="btn btn-sm btn-accent" id="btnAddNaryRow">+ ADD BRANCH</button>
          </div>
          <div id="naryParticipantsList" style="display:flex; flex-direction:column; gap:6px;"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal('modalRelation')">CANCEL</button>
        <button class="btn btn-accent" id="btnSaveRelation">CREATE RELATION</button>
      </div>
    </div>
  </div>

  <!-- ISA Hierarchy Modal -->
  <div class="modal-backdrop" id="modalIsa">
    <div class="modal-box">
      <div class="modal-head">
        <h3>GENERALIZATION / SPECIALIZATION (ISA)</h3>
        <button class="icon-btn" onclick="closeModal('modalIsa')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Superclass / Parent Entity (Genitore)</label>
          <select id="isaParentTable" class="select form-input"></select>
        </div>
        <div class="form-group">
          <label>Subclasses / Child Entities (Sottoclassi)</label>
          <div id="isaChildTablesCheckboxes" style="display:flex; flex-direction:column; gap:6px; max-height:150px; overflow-y:auto; background:var(--card); border:1px solid var(--border); padding:8px; border-radius:4px;"></div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:8px;">
          <div class="form-group">
            <label>Coverage Constraint</label>
            <select id="isaCoverage" class="select form-input">
              <option value="total">Total (Totale — doppia linea)</option>
              <option value="partial">Partial (Parziale — singola linea)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Exclusivity / Disjointness</label>
            <select id="isaDisjointness" class="select form-input">
              <option value="disjoint">Disjoint / Exclusive (d — Disgiunta)</option>
              <option value="overlapping">Overlapping (o — Sovrapposta)</option>
            </select>
          </div>
        </div>
        <div style="margin-top:6px; font-size:11px; color:var(--text-muted); line-height:1.4;">
          ℹ️ <b>Visual PK Inheritance:</b> All subclass entities visually inherit the Primary Key of the superclass on the canvas and in physical DDL schemas.
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-danger" id="btnDeleteIsaModal" style="display:none; margin-right:auto;">DELETE</button>
        <button class="btn" onclick="closeModal('modalIsa')">CANCEL</button>
        <button class="btn btn-accent" id="btnSaveIsa">SAVE ISA HIERARCHY</button>
      </div>
    </div>
  </div>

  <!-- Import Schema & Reverse Engineering Modal -->
  <div class="modal-backdrop" id="modalImport">
    <div class="modal-box wide" style="height:580px;">
      <div class="modal-head">
        <div style="display:flex; align-items:center; gap:8px;">
          <h3>IMPORT SCHEMA & REVERSE ENGINEERING</h3>
          <span style="background:var(--accent); color:#000; font-size:9px; font-weight:800; padding:1px 5px; border-radius:2px;">SQL DDL / MERMAID / JSON</span>
        </div>
        <button class="icon-btn" onclick="closeModal('modalImport')">✕</button>
      </div>
      <div class="modal-body" style="gap:10px;">
        <div style="display:flex; gap:6px; border-bottom:1px solid var(--border); padding-bottom:8px; align-items:center; flex-wrap:wrap;">
          <button class="btn btn-sm btn-accent" id="btnImportTabSql">SQL DDL (CREATE / ALTER TABLE)</button>
          <button class="btn btn-sm" id="btnImportTabMermaid">MERMAID ER (.mmd)</button>
          <button class="btn btn-sm" id="btnImportTabJson">RELAY JSON (.json)</button>
          <div style="margin-left:auto; display:flex; gap:6px;">
            <button class="btn btn-sm" id="btnLoadSqlSample">LOAD SQL SAMPLE</button>
            <button class="btn btn-sm" id="btnLoadMermaidSample">LOAD MERMAID</button>
            <button class="btn btn-sm" id="btnChooseFile">CHOOSE FILE...</button>
            <input type="file" id="fileUniversalImport" accept=".sql,.mmd,.mermaid,.json,.txt" style="display:none;" />
          </div>
        </div>

        <div id="importValidationStatus" style="font-size:10px; color:var(--muted); padding:5px 8px; background:var(--card); border:1px solid var(--border); border-radius:3px; display:flex; justify-content:space-between; align-items:center;">
          <span id="importStatusText">Paste SQL DDL (Postgres / MySQL / SQLite) script or choose a file:</span>
          <span id="importStatsBadge" style="font-weight:700; color:var(--accent);">Ready</span>
        </div>

        <div style="flex:1; display:flex; flex-direction:column;">
          <textarea id="importCodeArea" class="form-input" style="flex:1; min-height:280px; font-family:var(--mono); font-size:11px; line-height:1.4; resize:none;" placeholder="CREATE TABLE users (&#10;    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),&#10;    email VARCHAR(255) NOT NULL UNIQUE&#10;);&#10;&#10;CREATE TABLE orders (&#10;    id SERIAL PRIMARY KEY,&#10;    user_id UUID REFERENCES users(id) ON DELETE CASCADE&#10;);" spellcheck="false"></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn" onclick="closeModal('modalImport')">CANCEL</button>
        <button class="btn btn-accent" id="btnExecuteImport">IMPORT TO CANVAS</button>
      </div>
    </div>
  </div>

  <!-- Client Script -->
  <script>
    // Templates
    const TEMPLATES = {
      universita: {
        title: 'Università & Ricerca (ISA, N-Aria, Composti)',
        description: 'Academic model featuring ISA Generalization Hierarchy, N-ary Relationships, Composite branched attributes and Multivalued attributes',
        tables: [
          {
            name: 'PERSONA',
            comment: 'Superclass entity for academic personnel & students',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'CodiceFiscale', type: 'varchar(16)', pk: true, attributeType: 'key' },
              { name: 'Nome', type: 'varchar(50)', nullable: false, attributeType: 'normal' },
              { name: 'Cognome', type: 'varchar(50)', nullable: false, attributeType: 'normal' },
              {
                name: 'Indirizzo',
                type: 'composite',
                attributeType: 'composite',
                subAttributes: [
                  { name: 'Via', type: 'varchar(100)' },
                  { name: 'CAP', type: 'varchar(10)' },
                  { name: 'Citta', type: 'varchar(50)' },
                  { name: 'Provincia', type: 'varchar(4)' }
                ]
              },
              { name: 'Telefoni', type: 'varchar(20)', attributeType: 'multivalued' },
              { name: 'Eta', type: 'integer', attributeType: 'derived' }
            ]
          },
          {
            name: 'DOCENTE',
            comment: 'Subclass: university professors and researchers (inherits PK CodiceFiscale)',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'Stipendio', type: 'numeric(10,2)', nullable: false, attributeType: 'normal' },
              { name: 'Dipartimento', type: 'varchar(80)', nullable: false, attributeType: 'normal' }
            ]
          },
          {
            name: 'STUDENTE',
            comment: 'Subclass: registered university students (inherits PK CodiceFiscale)',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'Matricola', type: 'varchar(20)', unique: true, nullable: false, attributeType: 'normal' },
              { name: 'AnnoIscrizione', type: 'integer', nullable: false, attributeType: 'normal' }
            ]
          },
          {
            name: 'LABORATORIO',
            comment: 'Research laboratory facility',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'CodiceLab', type: 'varchar(10)', pk: true, attributeType: 'key' },
              { name: 'NomeLab', type: 'varchar(80)', nullable: false, attributeType: 'normal' },
              { name: 'Ubicazione', type: 'varchar(100)', nullable: false, attributeType: 'normal' }
            ]
          },
          {
            name: 'CORSO',
            comment: 'Degree course module',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'CodiceCorso', type: 'varchar(10)', pk: true, attributeType: 'key' },
              { name: 'NomeCorso', type: 'varchar(100)', nullable: false, attributeType: 'normal' },
              { name: 'CreditiCFU', type: 'integer', nullable: false, attributeType: 'normal' }
            ]
          },
          {
            name: 'SESSIONE_ESAME',
            comment: 'Weak entity dependent on CORSO existence',
            isWeak: true,
            shapeType: 'weak_entity',
            columns: [
              { name: 'NumeroAppello', type: 'integer', pk: true, attributeType: 'key' },
              { name: 'DataAppello', type: 'date', nullable: false, attributeType: 'normal' },
              { name: 'Aula', type: 'varchar(20)', nullable: false, attributeType: 'normal' }
            ]
          }
        ],
        relationships: [
          {
            id: 'rel_ternary_ricerca',
            name: 'PROGETTO_RICERCA',
            sourceTable: 'DOCENTE',
            sourceColumn: 'CodiceFiscale',
            targetTable: 'STUDENTE',
            targetColumn: 'CodiceFiscale',
            type: 'N:M',
            sourceCardinality: '(1,N)',
            targetCardinality: '(0,N)',
            extraParticipants: [
              { table: 'LABORATORIO', cardinality: '(1,1)', role: 'Sede' }
            ],
            attributes: [
              { name: 'Budget', type: 'numeric' },
              { name: 'AnnoAvvio', type: 'integer' }
            ]
          },
          {
            id: 'rel_weak_appello',
            name: 'OFFRE_APPELLO',
            sourceTable: 'CORSO',
            sourceColumn: 'CodiceCorso',
            targetTable: 'SESSIONE_ESAME',
            targetColumn: 'CodiceCorso',
            type: '1:N',
            sourceCardinality: '(1,1)',
            targetCardinality: '(1,N)',
            isIdentifying: true,
            onDelete: 'CASCADE'
          }
        ],
        isaHierarchies: [
          {
            id: 'isa_persona_1',
            parentTable: 'PERSONA',
            childTables: ['DOCENTE', 'STUDENTE'],
            coverage: 'total',
            disjointness: 'disjoint'
          }
        ],
        notes: [
          {
            id: 'note_demo',
            x: 80,
            y: 30,
            title: 'Chen Advanced (Milestone 2)',
            text: [
              '• Costrutto ISA: PERSONA -> DOCENTE, STUDENTE (Totale Disgiunto).',
              '• Eredita PK visuale: CodiceFiscale ereditato senza duplicazioni!',
              '• Relazione N-Aria (3 rami): PROGETTO_RICERCA (DOCENTE, STUDENTE, LABORATORIO).',
              '• Attributi Composti: Indirizzo (Via, CAP, Citta, Provincia).',
              '• Multivalore (Telefoni) & Derivati (Eta).'
            ].join('\\n'),
            color: 'emerald'
          }
        ]
      },
      biblioteca: {
        title: 'Biblioteca (Library Management)',
        description: 'Classic Chen ER model matching Biblioteca.drawio with authors, books, copies and loans',
        tables: [
          {
            name: 'AUTORE',
            comment: 'Book authors and creators',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'CodiceAutore', type: 'serial', pk: true, attributeType: 'key' },
              { name: 'Nome', type: 'varchar(100)', nullable: false, attributeType: 'normal' },
              { name: 'Cognome', type: 'varchar(100)', nullable: false, attributeType: 'normal' },
              { name: 'DataNascita', type: 'date', nullable: true, attributeType: 'normal' }
            ]
          },
          {
            name: 'OPERA',
            comment: 'Literary works and published titles',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'ISBN', type: 'varchar(20)', pk: true, attributeType: 'key' },
              { name: 'Titolo', type: 'varchar(255)', nullable: false, attributeType: 'normal' },
              { name: 'Genere', type: 'varchar(80)', nullable: true, attributeType: 'normal' },
              { name: 'AnnoPubblicazione', type: 'integer', nullable: true, attributeType: 'normal' }
            ]
          },
          {
            name: 'COPIA',
            comment: 'Physical book copy in inventory (Weak entity identified by Opera)',
            isWeak: true,
            shapeType: 'weak_entity',
            columns: [
              { name: 'NumInventario', type: 'serial', pk: true, attributeType: 'key' },
              { name: 'ISBN', type: 'varchar(20)', nullable: false, attributeType: 'normal' },
              { name: 'Collocazione', type: 'varchar(50)', nullable: false, attributeType: 'normal' },
              { name: 'StatoConservazione', type: 'varchar(50)', defaultVal: "'Ottimo'", attributeType: 'normal' }
            ]
          },
          {
            name: 'STUDENTE',
            comment: 'Library registered students / borrowers',
            isWeak: false,
            shapeType: 'chen_entity',
            columns: [
              { name: 'CodiceUnivoco', type: 'varchar(20)', pk: true, attributeType: 'key' },
              { name: 'Matricola', type: 'varchar(20)', unique: true, nullable: false, attributeType: 'normal' },
              { name: 'Nome', type: 'varchar(80)', nullable: false, attributeType: 'normal' },
              { name: 'Cognome', type: 'varchar(80)', nullable: false, attributeType: 'normal' },
              { name: 'Email', type: 'varchar(150)', unique: true, nullable: false, attributeType: 'normal' }
            ]
          }
        ],
        relationships: [
          {
            id: 'rel_bib_1',
            name: 'SCRIVE',
            sourceTable: 'AUTORE',
            sourceColumn: 'CodiceAutore',
            targetTable: 'OPERA',
            targetColumn: 'ISBN',
            type: 'N:M',
            sourceCardinality: '(1,N)',
            targetCardinality: '(1,N)',
            isIdentifying: false
          },
          {
            id: 'rel_bib_2',
            name: 'HA_COPIA',
            sourceTable: 'OPERA',
            sourceColumn: 'ISBN',
            targetTable: 'COPIA',
            targetColumn: 'ISBN',
            type: '1:N',
            sourceCardinality: '(1,1)',
            targetCardinality: '(0,N)',
            isIdentifying: true,
            onDelete: 'CASCADE'
          },
          {
            id: 'rel_bib_3',
            name: 'PRESTITO',
            sourceTable: 'STUDENTE',
            sourceColumn: 'CodiceUnivoco',
            targetTable: 'COPIA',
            targetColumn: 'NumInventario',
            type: 'N:M',
            sourceCardinality: '(0,N)',
            targetCardinality: '(0,N)',
            isIdentifying: false,
            attributes: [
              { name: 'DataPrestito', type: 'date' },
              { name: 'OraPrestito', type: 'time' },
              { name: 'ScadenzaPrevista', type: 'date' },
              { name: 'DataRestituzione', type: 'date' }
            ]
          }
        ]
      },
      ecommerce: {
        title: 'E-Commerce Platform',
        description: 'Schema for online stores, billing, items and reviews',
        tables: [
          {
            name: 'users',
            comment: 'Platform accounts and customer credentials',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'email', type: 'varchar(255)', unique: true, nullable: false },
              { name: 'password_hash', type: 'varchar(255)', nullable: false },
              { name: 'full_name', type: 'varchar(120)', nullable: false },
              { name: 'role', type: 'varchar(32)', defaultVal: "'customer'" },
              { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
            ]
          },
          {
            name: 'categories',
            comment: 'Catalog hierarchies and tags',
            isWeak: false,
            columns: [
              { name: 'id', type: 'serial', pk: true },
              { name: 'slug', type: 'varchar(80)', unique: true, nullable: false },
              { name: 'title', type: 'varchar(100)', nullable: false },
              { name: 'parent_id', type: 'integer', nullable: true }
            ]
          },
          {
            name: 'products',
            comment: 'Store goods, stock quantities and price points',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'category_id', type: 'integer', nullable: false },
              { name: 'sku', type: 'varchar(64)', unique: true, nullable: false },
              { name: 'title', type: 'varchar(200)', nullable: false },
              { name: 'price_cents', type: 'integer', nullable: false },
              { name: 'stock_qty', type: 'integer', defaultVal: '0' },
              { name: 'is_active', type: 'boolean', defaultVal: 'true' }
            ]
          },
          {
            name: 'orders',
            comment: 'Customer transactions and shipping states',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'user_id', type: 'uuid', nullable: false },
              { name: 'status', type: 'varchar(40)', defaultVal: "'pending'" },
              { name: 'total_amount_cents', type: 'integer', nullable: false },
              { name: 'shipping_address', type: 'text', nullable: false },
              { name: 'placed_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
            ]
          },
          {
            name: 'order_items',
            comment: 'Weak entity dependent on parent orders existence',
            isWeak: true, // Double border!
            columns: [
              { name: 'id', type: 'bigserial', pk: true },
              { name: 'order_id', type: 'uuid', nullable: false },
              { name: 'product_id', type: 'uuid', nullable: false },
              { name: 'unit_price_cents', type: 'integer', nullable: false },
              { name: 'quantity', type: 'integer', defaultVal: '1' }
            ]
          }
        ],
        relationships: [
          { id: 'rel_1', sourceTable: 'categories', sourceColumn: 'id', targetTable: 'categories', targetColumn: 'parent_id', type: '1:N', onDelete: 'SET NULL' },
          { id: 'rel_2', sourceTable: 'categories', sourceColumn: 'id', targetTable: 'products', targetColumn: 'category_id', type: '1:N', onDelete: 'RESTRICT' },
          { id: 'rel_3', sourceTable: 'users', sourceColumn: 'id', targetTable: 'orders', targetColumn: 'user_id', type: '1:N', onDelete: 'CASCADE' },
          { id: 'rel_4', sourceTable: 'orders', sourceColumn: 'id', targetTable: 'order_items', targetColumn: 'order_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' },
          { id: 'rel_5', sourceTable: 'products', sourceColumn: 'id', targetTable: 'order_items', targetColumn: 'product_id', type: '1:N', onDelete: 'RESTRICT' }
        ]
      },
      saas_auth: {
        title: 'Multi-Tenant SaaS & RBAC',
        description: 'Workspaces, team memberships, role permissions and API keys',
        tables: [
          {
            name: 'tenants',
            comment: 'Corporate organization workspaces',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'name', type: 'varchar(100)', nullable: false },
              { name: 'slug', type: 'varchar(64)', unique: true, nullable: false },
              { name: 'plan', type: 'varchar(32)', defaultVal: "'free'" },
              { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
            ]
          },
          {
            name: 'users',
            comment: 'Identities authenticated across organizations',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'email', type: 'varchar(255)', unique: true, nullable: false },
              { name: 'password_hash', type: 'varchar(255)', nullable: false },
              { name: 'is_active', type: 'boolean', defaultVal: 'true' }
            ]
          },
          {
            name: 'memberships',
            comment: 'Weak associative entity scoped to tenants',
            isWeak: true,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'tenant_id', type: 'uuid', nullable: false },
              { name: 'user_id', type: 'uuid', nullable: false },
              { name: 'role', type: 'varchar(32)', defaultVal: "'member'" }
            ]
          },
          {
            name: 'api_keys',
            comment: 'Weak credentials owned directly by tenants',
            isWeak: true,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'tenant_id', type: 'uuid', nullable: false },
              { name: 'key_hash', type: 'varchar(64)', unique: true, nullable: false },
              { name: 'label', type: 'varchar(100)', nullable: false }
            ]
          }
        ],
        relationships: [
          { id: 'rel_1', sourceTable: 'tenants', sourceColumn: 'id', targetTable: 'memberships', targetColumn: 'tenant_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' },
          { id: 'rel_2', sourceTable: 'users', sourceColumn: 'id', targetTable: 'memberships', targetColumn: 'user_id', type: '1:N', onDelete: 'CASCADE' },
          { id: 'rel_3', sourceTable: 'tenants', sourceColumn: 'id', targetTable: 'api_keys', targetColumn: 'tenant_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' }
        ]
      },
      blog_cms: {
        title: 'Content Publishing CMS',
        description: 'Authors, articles, categories and comments',
        tables: [
          {
            name: 'authors',
            comment: 'Writers, editors, and publication contributors',
            isWeak: false,
            columns: [
              { name: 'id', type: 'serial', pk: true },
              { name: 'pen_name', type: 'varchar(100)', nullable: false },
              { name: 'handle', type: 'varchar(60)', unique: true, nullable: false }
            ]
          },
          {
            name: 'articles',
            comment: 'Published markdown articles and metadata',
            isWeak: false,
            columns: [
              { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
              { name: 'author_id', type: 'integer', nullable: false },
              { name: 'slug', type: 'varchar(140)', unique: true, nullable: false },
              { name: 'title', type: 'varchar(255)', nullable: false },
              { name: 'body_markdown', type: 'text', nullable: false },
              { name: 'published_at', type: 'timestamp', nullable: true }
            ]
          },
          {
            name: 'comments',
            comment: 'Weak entity dependent on parent article existence',
            isWeak: true,
            columns: [
              { name: 'id', type: 'bigserial', pk: true },
              { name: 'article_id', type: 'uuid', nullable: false },
              { name: 'commenter_name', type: 'varchar(80)', nullable: false },
              { name: 'content', type: 'text', nullable: false }
            ]
          }
        ],
        relationships: [
          { id: 'rel_1', sourceTable: 'authors', sourceColumn: 'id', targetTable: 'articles', targetColumn: 'author_id', type: '1:N', onDelete: 'RESTRICT' },
          { id: 'rel_2', sourceTable: 'articles', sourceColumn: 'id', targetTable: 'comments', targetColumn: 'article_id', type: '1:N', isIdentifying: true, onDelete: 'CASCADE' }
        ]
      }
    };

    // State
    let currentSchema = JSON.parse(JSON.stringify(TEMPLATES.universita));
    let tablePositions = {};
    let relPositions = {};
    let isaPositions = {};
    let zoom = 1.0;
    let panX = 60;
    let panY = 60;
    let isPanning = false;
    let startPanX = 0;
    let startPanY = 0;
    let activeDragTable = null;
    let activeDragRel = null;
    let activeDragNote = null;
    let activeDragIsa = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let selectedTable = null;
    let selectedRel = null;
    let selectedIsa = null;
    let copiedCardinality = null;
    let currentDialect = 'postgres';
    let notationMode = 'chen';
    let showGrid = true;
    let snapToGrid = true;
    let currentTheme = 'dark';
    let elementStyles = {}; // key: 'table:NAME' or 'rel:ID' -> { fill, stroke, text, opacity, strokeWidth }

    function showToast(msg) {
      const existing = document.querySelector('.toast-pill');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.className = 'toast-pill';
      toast.innerHTML = '<span>' + msg + '</span>';
      document.body.appendChild(toast);
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2500);
    }

    // Elements
    const viewport = document.getElementById('canvasViewport');
    const canvasStage = document.getElementById('canvasStage');
    const nodesLayer = document.getElementById('nodesLayer');
    const labelsLayer = document.getElementById('labelsLayer');
    const svgLayer = document.getElementById('svgLayer');
    const zoomLevelEl = document.getElementById('zoomLevel');
    const coordsEl = document.getElementById('canvasCoords');
    const entityCountEl = document.getElementById('entityCount');

    // Layout - Align entities, relationships and ISA nodes
    function initLayout() {
      tablePositions = {};
      relPositions = {};
      isaPositions = {};

      if (currentSchema.title && currentSchema.title.includes('Università')) {
        tablePositions['PERSONA'] = { x: 380, y: 50 };
        tablePositions['DOCENTE'] = { x: 160, y: 350 };
        tablePositions['STUDENTE'] = { x: 580, y: 350 };
        tablePositions['LABORATORIO'] = { x: 100, y: 640 };
        tablePositions['CORSO'] = { x: 880, y: 50 };
        tablePositions['SESSIONE_ESAME'] = { x: 880, y: 350 };

        isaPositions['isa_persona_1'] = { x: 430, y: 220 };
        relPositions['rel_ternary_ricerca'] = { x: 380, y: 560 };
        relPositions['rel_weak_appello'] = { x: 880, y: 200 };
        return;
      }

      if (currentSchema.title && currentSchema.title.includes('Biblioteca')) {
        tablePositions['AUTORE'] = { x: 80, y: 40 };
        tablePositions['OPERA'] = { x: 80, y: 340 };
        tablePositions['COPIA'] = { x: 180, y: 640 };
        tablePositions['STUDENTE'] = { x: 340, y: 340 };

        relPositions['rel_bib_1'] = { x: 135, y: 220 };
        relPositions['rel_bib_2'] = { x: 105, y: 500 };
        relPositions['rel_bib_3'] = { x: 310, y: 500 };
        return;
      }

      const cols = 3;
      const colWidth = 320;
      const rowHeight = 300;
      currentSchema.tables.forEach((t, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        tablePositions[t.name] = {
          x: 60 + col * colWidth,
          y: 60 + row * rowHeight
        };
      });

      currentSchema.relationships.forEach((rel) => {
        const sPos = tablePositions[rel.sourceTable] || { x: 100, y: 100 };
        const tPos = tablePositions[rel.targetTable] || { x: 300, y: 300 };
        relPositions[rel.id] = {
          x: Math.round((sPos.x + tPos.x) / 2) + 40,
          y: Math.round((sPos.y + tPos.y) / 2) + 20
        };
      });

      (currentSchema.isaHierarchies || []).forEach(isa => {
        if (!isaPositions[isa.id]) {
          const pPos = tablePositions[isa.parentTable] || { x: 200, y: 100 };
          const childYs = (isa.childTables || []).map(ct => tablePositions[ct]?.y).filter(y => y !== undefined);
          const childXs = (isa.childTables || []).map(ct => tablePositions[ct]?.x).filter(x => x !== undefined);
          const avgX = childXs.length > 0 ? (pPos.x + childXs.reduce((a, b) => a + b, 0) / childXs.length) / 2 : pPos.x;
          const avgY = childYs.length > 0 ? (pPos.y + Math.min(...childYs)) / 2 : pPos.y + 120;
          isaPositions[isa.id] = { x: Math.round(avgX), y: Math.round(avgY) };
        }
      });
    }

    // Modal Helpers
    window.openModal = function(id) {
      document.getElementById(id).style.display = 'flex';
    };
    window.closeModal = function(id) {
      document.getElementById(id).style.display = 'none';
    };

    // Render Canvas Nodes (Entities, Columns, and Chen Relationship Diamonds)
    function renderCanvas() {
      nodesLayer.innerHTML = '';

      // 1. Render Table / Entity Nodes
      currentSchema.tables.forEach(table => {
        const pos = tablePositions[table.name] || { x: 50, y: 50 };
        const card = document.createElement('div');
        const isChen = notationMode === 'chen' || table.shapeType === 'chen_entity';
        const weakClass = table.isWeak ? ' weak-entity' : '';
        const chenClass = isChen ? ' chen-node' : '';
        const selectedClass = selectedTable === table.name ? ' selected' : '';
        card.className = 'table-node' + weakClass + chenClass + selectedClass;
        card.id = 'node_' + table.name;
        card.style.transform = \`translate(\${pos.x}px, \${pos.y}px)\`;
        const customStyle = elementStyles['table:' + table.name] || {};
        if (customStyle.fill) card.style.background = customStyle.fill;
        if (customStyle.stroke) {
          card.style.borderColor = customStyle.stroke;
          card.style.outline = \`1px solid \${customStyle.stroke}\`;
        }
        if (customStyle.strokeWidth) card.style.borderWidth = customStyle.strokeWidth + 'px';
        if (customStyle.opacity !== undefined) card.style.opacity = (customStyle.opacity / 100);

        // Card Header
        const header = document.createElement('div');
        header.className = 'table-header';
        const weakBadge = table.isWeak ? '<span class="weak-badge">WEAK</span>' : '';
        header.innerHTML = \`
          <div class="table-title" style="\${customStyle.text ? 'color:' + customStyle.text + ';' : ''}" title="Double-click to rename entity inline">
            <span class="table-title-text">\${table.name}</span>
            \${weakBadge}
          </div>
          <div class="table-actions">
            <button class="icon-btn" title="Toggle Weak Entity" onclick="toggleWeakEntity('\${table.name}')">⚏</button>
            <button class="icon-btn" title="Quick Add Column (or Ctrl+Enter)" onclick="quickAddColumn('\${table.name}')">+</button>
            <button class="icon-btn danger" title="Delete Table" onclick="deleteTable('\${table.name}')">✕</button>
          </div>
        \`;

        // Double-click to inline rename table
        const titleEl = header.querySelector('.table-title');
        if (titleEl) {
          titleEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            startInlineRenameTable(table.name, titleEl);
          });
        }

        // Card Drag Handler
        header.addEventListener('mousedown', (e) => {
          if (e.target.closest('button') || e.target.closest('input')) return;
          e.stopPropagation();
          activeDragTable = table.name;
          activeDragRel = null;
          selectedTable = table.name;
          selectedRel = null;
          updateSelectedLabel(table.name);
          dragOffsetX = (e.clientX / zoom) - pos.x;
          dragOffsetY = (e.clientY / zoom) - pos.y;
          document.querySelectorAll('.table-node, .rel-diamond-node').forEach(n => n.classList.remove('selected'));
          card.classList.add('selected');
        });

        // Columns
        const colList = document.createElement('div');
        colList.className = 'table-columns';

        // Visual PK Inheritance from ISA Superclass
        const isaParentRel = (currentSchema.isaHierarchies || []).find(isa => (isa.childTables || []).includes(table.name));
        if (isaParentRel) {
          const parentObj = currentSchema.tables.find(t => t.name === isaParentRel.parentTable);
          if (parentObj) {
            const parentPks = parentObj.columns.filter(c => c.pk || c.attributeType === 'key');
            parentPks.forEach(pPk => {
              if (!table.columns.some(c => c.name.toLowerCase() === pPk.name.toLowerCase())) {
                const inhRow = document.createElement('div');
                inhRow.className = 'column-row inherited-row';
                inhRow.title = 'Inherited Primary Key from ' + parentObj.name + ' via ISA (' + (isaParentRel.coverage || 'total') + ', ' + (isaParentRel.disjointness || 'disjoint') + ')';
                inhRow.innerHTML = \`
                  <span class="col-key-icon key-pk" style="background:#0284c7; color:#fff;" title="Inherited Primary Key">PK↸</span>
                  <span class="col-name" style="text-decoration:underline; font-style:italic;">\${pPk.name}</span>
                  <span class="col-type">\${pPk.type}</span>
                  <span class="col-badge-inherited">ISA \${parentObj.name}</span>
                \`;
                colList.appendChild(inhRow);
              }
            });
          }
        }

        table.columns.forEach(col => {
          if (col.attributeType === 'composite') {
            const compRow = document.createElement('div');
            compRow.className = 'column-row composite-parent';
            compRow.id = \`col_\${table.name}_\${col.name}\`;
            compRow.title = 'Composite Attribute - Branches into sub-fields';
            compRow.innerHTML = \`
              <span class="col-key-icon" style="color:#a855f7;" title="Composite Attribute">⑂</span>
              <span class="col-name" style="font-weight:700;" onclick="openEditColumn('\${table.name}', '\${col.name}')">\${col.name}</span>
              <span class="col-type" style="color:var(--muted); font-size:10px;">(composite)</span>
              <div class="col-actions">
                <button class="icon-btn" title="Add Sub-Attribute" onclick="openAddSubAttribute('\${table.name}', '\${col.name}')">+</button>
                <button class="icon-btn danger" title="Delete column" onclick="deleteColumn('\${table.name}', '\${col.name}')">✕</button>
              </div>
            \`;
            colList.appendChild(compRow);

            // Render Sub-Attributes
            (col.subAttributes || []).forEach((sub, sIdx) => {
              const isLast = sIdx === (col.subAttributes.length - 1);
              const subRow = document.createElement('div');
              subRow.className = 'column-row sub-attribute-row';
              subRow.innerHTML = \`
                <span class="col-tree-branch">\${isLast ? '└─' : '├─'}</span>
                <span class="col-name">\${sub.name}</span>
                <span class="col-type">\${sub.type}</span>
                <div class="col-actions">
                  <button class="icon-btn danger" title="Delete sub-field" onclick="deleteSubAttribute('\${table.name}', '\${col.name}', '\${sub.name}')">✕</button>
                </div>
              \`;
              colList.appendChild(subRow);
            });
            return;
          }

          const isFk = currentSchema.relationships.some(r => r.targetTable === table.name && r.targetColumn === col.name);
          const row = document.createElement('div');
          const rowClass = 'column-row' + (col.attributeType === 'multivalued' ? ' multivalued-row' : '') + (col.attributeType === 'derived' ? ' derived-row' : '');
          row.className = rowClass;
          row.id = \`col_\${table.name}_\${col.name}\`;
          row.title = 'Double-click to edit column name & type inline';

          let keySymbol = '';
          if (col.pk || col.attributeType === 'key') {
            keySymbol = '<span class="col-key-icon key-pk" title="Primary Key">PK</span>';
          } else if (isFk) {
            keySymbol = '<span class="col-key-icon key-fk" title="Foreign Key">FK</span>';
          } else if (col.attributeType === 'multivalued') {
            keySymbol = '<span class="col-key-icon" style="color:#38bdf8;" title="Multivalued">◎</span>';
          } else if (col.attributeType === 'derived') {
            keySymbol = '<span class="col-key-icon" style="color:#fbbf24;" title="Derived">◌</span>';
          } else {
            keySymbol = '<span class="col-key-icon" style="color:transparent">•</span>';
          }

          const underlinedStyle = (col.pk || col.attributeType === 'key') ? 'style="text-decoration:underline;"' : '';

          row.innerHTML = \`
            \${keySymbol}
            <span class="col-name" \${underlinedStyle} onclick="openEditColumn('\${table.name}', '\${col.name}')">\${col.name}</span>
            <span class="col-type">\${col.type}</span>
            <div class="col-actions">
              <button class="icon-btn danger" title="Delete column" onclick="deleteColumn('\${table.name}', '\${col.name}')">✕</button>
            </div>
          \`;

          // Double click on column row triggers inline editing
          row.addEventListener('dblclick', (e) => {
            if (e.target.closest('button')) return;
            e.stopPropagation();
            startInlineEditColumn(table.name, col.name, row);
          });

          colList.appendChild(row);
        });

        card.appendChild(header);
        card.appendChild(colList);
        nodesLayer.appendChild(card);
      });

      // 2. Render Chen Relationship Diamonds (SCRIVE, PRESTITO, HA_COPIA)
      if (notationMode === 'chen') {
        currentSchema.relationships.forEach(rel => {
          const relPos = relPositions[rel.id] || { x: 200, y: 200 };
          const diamondNode = document.createElement('div');
          const weakClass = rel.isIdentifying ? ' weak' : '';
          const selectedClass = selectedRel === rel.id ? ' selected' : '';
          diamondNode.className = 'rel-diamond-node' + weakClass + selectedClass;
          diamondNode.id = 'diamond_' + rel.id;
          diamondNode.style.transform = \`translate(\${relPos.x}px, \${relPos.y}px)\`;

          const relTitle = rel.name || (rel.sourceTable + '_' + rel.targetTable);
          let attrText = '';
          if (rel.attributes && rel.attributes.length > 0) {
            attrText = rel.attributes.map(a => a.name).join('<br>');
          }

          const relCustomStyle = elementStyles['rel:' + rel.id] || {};
          const diamondFill = relCustomStyle.fill || (rel.color || '');
          const diamondStroke = relCustomStyle.stroke || (rel.strokeColor || '');
          const diamondText = relCustomStyle.text || (rel.textColor || '');
          const diamondStrokeWidth = relCustomStyle.strokeWidth || 1.5;
          const diamondOpacity = relCustomStyle.opacity !== undefined ? (relCustomStyle.opacity / 100) : 1;

          diamondNode.style.opacity = diamondOpacity;
          const polyFillStyle = diamondFill ? \`fill:\${diamondFill};\` : '';
          const polyStrokeStyle = diamondStroke ? \`stroke:\${diamondStroke}; stroke-width:\${diamondStrokeWidth}px;\` : '';
          const textCustomStyle = diamondText ? \`style="color:\${diamondText};"\` : '';

          const innerPolygon = rel.isIdentifying ? \`<polygon class="diamond-polygon-inner" points="70,16 122,45 70,74 18,45" style="\${polyStrokeStyle}" />\` : '';

          diamondNode.innerHTML = \`
            <svg class="diamond-svg" viewBox="0 0 140 90">
              <polygon class="diamond-polygon" points="70,6 134,45 70,84 6,45" style="\${polyFillStyle} \${polyStrokeStyle}" />
              \${innerPolygon}
            </svg>
            <div class="rel-diamond-content">
              <span class="rel-diamond-title" \${textCustomStyle}>\${relTitle}</span>
              \${attrText ? \`<span class="rel-diamond-attrs">\${attrText}</span>\` : ''}
            </div>
          \`;

          diamondNode.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            activeDragRel = rel.id;
            activeDragTable = null;
            selectedRel = rel.id;
            selectedTable = null;
            updateSelectedLabel('Relation: ' + relTitle);
            dragOffsetX = (e.clientX / zoom) - relPos.x;
            dragOffsetY = (e.clientY / zoom) - relPos.y;
            document.querySelectorAll('.table-node, .rel-diamond-node').forEach(n => n.classList.remove('selected'));
            diamondNode.classList.add('selected');
          });

          nodesLayer.appendChild(diamondNode);
        });
      }

      // 2.5 Render ISA Hierarchy Nodes (Inverted Triangle ISA)
      if (!currentSchema.isaHierarchies) currentSchema.isaHierarchies = [];
      currentSchema.isaHierarchies.forEach(isa => {
        const isaPos = isaPositions[isa.id] || { x: 250, y: 250 };
        const isaNode = document.createElement('div');
        const selectedClass = selectedIsa === isa.id ? ' selected' : '';
        isaNode.className = 'isa-triangle-node' + selectedClass;
        isaNode.id = 'isa_' + isa.id;
        isaNode.style.transform = \`translate(\${isaPos.x}px, \${isaPos.y}px)\`;
        isaNode.title = 'ISA Hierarchy (' + (isa.coverage || 'total') + ', ' + (isa.disjointness || 'disjoint') + ') - Double-click to configure';

        const doubleLineSvg = isa.coverage === 'total' ? '<line x1="12" y1="16" x2="88" y2="16" class="isa-double-line" />' : '';

        isaNode.innerHTML = \`
          <svg class="isa-svg" viewBox="0 0 100 80">
            <polygon class="isa-polygon" points="50,72 96,8 4,8" />
            \${doubleLineSvg}
          </svg>
          <div class="isa-node-content">
            <span class="isa-title">ISA</span>
            <span class="isa-badge">(\${isa.coverage === 'total' ? 't' : 'p'}, \${isa.disjointness === 'disjoint' ? 'd' : 'o'})</span>
          </div>
        \`;

        isaNode.addEventListener('mousedown', (e) => {
          e.stopPropagation();
          activeDragIsa = isa.id;
          activeDragTable = null;
          activeDragRel = null;
          activeDragNote = null;
          selectedIsa = isa.id;
          selectedTable = null;
          selectedRel = null;
          updateSelectedLabel('ISA Hierarchy: ' + (isa.name || isa.parentTable));
          dragOffsetX = (e.clientX / zoom) - isaPos.x;
          dragOffsetY = (e.clientY / zoom) - isaPos.y;
          document.querySelectorAll('.table-node, .rel-diamond-node, .isa-triangle-node').forEach(n => n.classList.remove('selected'));
          isaNode.classList.add('selected');
        });

        isaNode.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          openEditIsa(isa.id);
        });

        nodesLayer.appendChild(isaNode);
      });

      // 3. Render Post-It Workspace Sticky Notes
      if (!currentSchema.notes) currentSchema.notes = [];
      currentSchema.notes.forEach(note => {
        const noteEl = document.createElement('div');
        const color = note.color || 'amber';
        noteEl.className = 'sticky-note color-' + color;
        noteEl.id = 'note_' + note.id;
        noteEl.style.transform = \`translate(\${note.x}px, \${note.y}px)\`;
        if (note.width) noteEl.style.width = note.width + 'px';
        if (note.height) noteEl.style.minHeight = note.height + 'px';

        noteEl.innerHTML = \`
          <div class="sticky-header">
            <div class="sticky-title">
              
              <span style="font-size:10px; font-weight:700;">\${note.title || 'NOTE'}</span>
            </div>
            <div class="sticky-colors">
              <button class="color-dot-btn" style="background:#d97706;" title="Amber Note" onclick="setNoteColor('\${note.id}', 'amber')"></button>
              <button class="color-dot-btn" style="background:#64748b;" title="Slate Note" onclick="setNoteColor('\${note.id}', 'slate')"></button>
              <button class="color-dot-btn" style="background:#059669;" title="Emerald Note" onclick="setNoteColor('\${note.id}', 'emerald')"></button>
              <button class="color-dot-btn" style="background:#0284c7;" title="Blue Note" onclick="setNoteColor('\${note.id}', 'blue')"></button>
              <button class="icon-btn danger" style="padding:1px 3px; font-size:10px;" title="Delete Note" onclick="deleteNote('\${note.id}')">✕</button>
            </div>
          </div>
          <div class="sticky-body">
            <textarea class="sticky-textarea" placeholder="Write comment, architecture note or TODO...">\${note.text || ''}</textarea>
          </div>
        \`;

        const textarea = noteEl.querySelector('textarea');
        if (textarea) {
          textarea.addEventListener('input', (e) => {
            note.text = e.target.value;
          });
        }

        const header = noteEl.querySelector('.sticky-header');
        if (header) {
          header.addEventListener('mousedown', (e) => {
            if (e.target && e.target.closest && e.target.closest('button')) return;
            e.stopPropagation();
            activeDragNote = note.id;
            activeDragTable = null;
            activeDragRel = null;
            dragOffsetX = (e.clientX / zoom) - note.x;
            dragOffsetY = (e.clientY / zoom) - note.y;
          });
        }

        nodesLayer.appendChild(noteEl);
      });

      renderConnections();
      renderRelationsList();
      updateSidebarStats();
      entityCountEl.innerText = \`\${currentSchema.tables.length} Entities (\${currentSchema.relationships.length} Rel)\`;
    }


    let connectorRouting = 'ortho'; // 'ortho' | 'direct'

    // Calculate nearest perimeter anchor point on a Rectangle with surface normal vector
    function getRectAnchorWithNormal(pos, width, height, targetPoint) {
      const anchors = [
        { x: Math.round(pos.x + width / 2), y: Math.round(pos.y),                  nx: 0,  ny: -1, face: 'top' },
        { x: Math.round(pos.x + width / 2), y: Math.round(pos.y + height),         nx: 0,  ny: 1,  face: 'bottom' },
        { x: Math.round(pos.x),              y: Math.round(pos.y + height / 2),     nx: -1, ny: 0,  face: 'left' },
        { x: Math.round(pos.x + width),      y: Math.round(pos.y + height / 2),     nx: 1,  ny: 0,  face: 'right' },
      ];

      let best = anchors[0];
      let minDist = Infinity;
      for (const a of anchors) {
        const dx = a.x - targetPoint.x;
        const dy = a.y - targetPoint.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          best = a;
        }
      }
      return best;
    }

    function getRectAnchorPoint(pos, width, height, targetPoint) {
      return getRectAnchorWithNormal(pos, width, height, targetPoint);
    }

    // Calculate nearest perimeter vertex on a Diamond with vertex normal vector
    function getDiamondAnchorWithNormal(diamondPos, targetPoint) {
      const anchors = [
        { x: diamondPos.x + 70,  y: diamondPos.y + 6,  nx: 0,  ny: -1, face: 'top' },
        { x: diamondPos.x + 70,  y: diamondPos.y + 84, nx: 0,  ny: 1,  face: 'bottom' },
        { x: diamondPos.x + 6,   y: diamondPos.y + 45, nx: -1, ny: 0,  face: 'left' },
        { x: diamondPos.x + 134, y: diamondPos.y + 45, nx: 1,  ny: 0,  face: 'right' }
      ];

      let best = anchors[0];
      let minDist = Infinity;
      for (const a of anchors) {
        const dx = a.x - targetPoint.x;
        const dy = a.y - targetPoint.y;
        const dist = dx * dx + dy * dy;
        if (dist < minDist) {
          minDist = dist;
          best = a;
        }
      }
      return best;
    }

    function getDiamondAnchorPoint(diamondPos, targetPoint) {
      return getDiamondAnchorWithNormal(diamondPos, targetPoint);
    }

    // Generate Smart Orthogonal (Manhattan) Waypoints
    function computeOrthoPath(p1, p2) {
      const stub = 20;
      const s1x = p1.x + (p1.nx || 0) * stub;
      const s1y = p1.y + (p1.ny || 0) * stub;
      const s2x = p2.x + (p2.nx || 0) * stub;
      const s2y = p2.y + (p2.ny || 0) * stub;

      const points = [{ x: p1.x, y: p1.y }];

      if (p1.nx !== undefined && p2.nx !== undefined) {
        if (p1.nx !== 0 && p2.nx !== 0) {
          const midX = Math.round((s1x + s2x) / 2);
          points.push({ x: midX, y: p1.y });
          points.push({ x: midX, y: p2.y });
        } else if (p1.ny !== 0 && p2.ny !== 0) {
          const midY = Math.round((s1y + s2y) / 2);
          points.push({ x: p1.x, y: midY });
          points.push({ x: p2.x, y: midY });
        } else if (p1.nx !== 0 && p2.ny !== 0) {
          points.push({ x: p2.x, y: p1.y });
        } else if (p1.ny !== 0 && p2.nx !== 0) {
          points.push({ x: p1.x, y: p2.y });
        } else {
          const midX = Math.round((p1.x + p2.x) / 2);
          points.push({ x: midX, y: p1.y });
          points.push({ x: midX, y: p2.y });
        }
      } else {
        const midX = Math.round((p1.x + p2.x) / 2);
        points.push({ x: midX, y: p1.y });
        points.push({ x: midX, y: p2.y });
      }

      points.push({ x: p2.x, y: p2.y });
      return pointsToSvgPath(points);
    }

    // Convert Points to Rounded Orthogonal Path
    function pointsToSvgPath(pts, radius = 6) {
      if (pts.length < 2) return '';
      if (pts.length === 2) return 'M ' + pts[0].x + ' ' + pts[0].y + ' L ' + pts[1].x + ' ' + pts[1].y;

      let d = 'M ' + pts[0].x + ' ' + pts[0].y;
      for (let i = 1; i < pts.length - 1; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const next = pts[i + 1];

        const v1x = curr.x - prev.x;
        const v1y = curr.y - prev.y;
        const d1 = Math.sqrt(v1x * v1x + v1y * v1y);

        const v2x = next.x - curr.x;
        const v2y = next.y - curr.y;
        const d2 = Math.sqrt(v2x * v2x + v2y * v2y);

        const r = Math.min(radius, d1 / 2, d2 / 2);
        if (r <= 0.5) {
          d += ' L ' + curr.x + ' ' + curr.y;
          continue;
        }

        const startX = curr.x - (v1x / d1) * r;
        const startY = curr.y - (v1y / d1) * r;
        const endX = curr.x + (v2x / d2) * r;
        const endY = curr.y + (v2y / d2) * r;

        d += ' L ' + Math.round(startX) + ' ' + Math.round(startY) + ' Q ' + curr.x + ' ' + curr.y + ' ' + Math.round(endX) + ' ' + Math.round(endY);
      }
      d += ' L ' + pts[pts.length - 1].x + ' ' + pts[pts.length - 1].y;
      return d;
    }

    // Toggle Weak Entity
    window.toggleWeakEntity = function(tableName) {
      const t = currentSchema.tables.find(x => x.name === tableName);
      if (t) {
        t.isWeak = !t.isWeak;
        renderCanvas();
        recompileAll();
      }
    };

    // Render SVG Connections (Direct Crow's Foot or Chen Through-Diamond Connectors)
    function renderConnections() {
      // Remove all previously drawn lines, paths, and connection anchor dots
      const relElements = svgLayer.querySelectorAll('.rel-line, .connection-point-dot');
      relElements.forEach(el => el.remove());

      // Remove cardinality labels
      document.querySelectorAll('.cardinality-label').forEach(l => l.remove());

      currentSchema.relationships.forEach(rel => {
        const srcPos = tablePositions[rel.sourceTable];
        const tgtPos = tablePositions[rel.targetTable];
        if (!srcPos || !tgtPos) return;

        const srcEl = document.getElementById('node_' + rel.sourceTable);
        const tgtEl = document.getElementById('node_' + rel.targetTable);
        if (!srcEl || !tgtEl) return;

        const srcWidth = srcEl.offsetWidth || 250;
        const tgtWidth = tgtEl.offsetWidth || 250;
        const srcHeight = srcEl.offsetHeight || 120;
        const tgtHeight = tgtEl.offsetHeight || 120;

        const scx = srcPos.x + srcWidth / 2;
        const scy = srcPos.y + srcHeight / 2;
        const tcx = tgtPos.x + tgtWidth / 2;
        const tcy = tgtPos.y + tgtHeight / 2;

        if (notationMode === 'chen') {
          const diamondPos = relPositions[rel.id] || { x: (scx + tcx)/2 - 70, y: (scy + tcy)/2 - 45 };
          const dcCenter = { x: diamondPos.x + 70, y: diamondPos.y + 45 };

          // 1. Connection Point on Source Entity (Perimeter border anchor closest to diamond center)
          const srcAnchor = getRectAnchorWithNormal(srcPos, srcWidth, srcHeight, dcCenter);

          // 2. Connection Point on Diamond towards Source Entity (Vertex on diamond closest to srcAnchor)
          const diamondSrcAnchor = getDiamondAnchorWithNormal(diamondPos, srcAnchor);

          // 3. Connection Point on Target Entity (Perimeter border anchor closest to diamond center)
          const tgtAnchor = getRectAnchorWithNormal(tgtPos, tgtWidth, tgtHeight, dcCenter);

          // 4. Connection Point on Diamond towards Target Entity (Vertex on diamond closest to tgtAnchor)
          const diamondTgtAnchor = getDiamondAnchorWithNormal(diamondPos, tgtAnchor);

          const relStyle = elementStyles['rel:' + rel.id] || {};
          const segColor = relStyle.stroke || rel.strokeColor || '';

          // Draw Segment 1: from Source perimeter connection point to Diamond vertex
          drawSegment(srcAnchor.x, srcAnchor.y, diamondSrcAnchor.x, diamondSrcAnchor.y, rel.isIdentifying, segColor, srcAnchor, diamondSrcAnchor);

          // Draw Segment 2: from Diamond vertex to Target perimeter connection point
          drawSegment(diamondTgtAnchor.x, diamondTgtAnchor.y, tgtAnchor.x, tgtAnchor.y, rel.isIdentifying, segColor, diamondTgtAnchor, tgtAnchor);

          // Add subtle visual connection point markers at the boundaries
          drawConnectionPointDot(srcAnchor.x, srcAnchor.y);
          drawConnectionPointDot(diamondSrcAnchor.x, diamondSrcAnchor.y);
          drawConnectionPointDot(diamondTgtAnchor.x, diamondTgtAnchor.y);
          drawConnectionPointDot(tgtAnchor.x, tgtAnchor.y);

          const srcCard = rel.sourceCardinality || (rel.type === '1:1' ? '(1,1)' : (rel.type === '1:N' ? '(1,N)' : '(0,N)'));
          const tgtCard = rel.targetCardinality || (rel.type === '1:1' ? '(1,1)' : (rel.type === '1:N' ? '(0,N)' : '(0,N)'));

          // Place cardinality labels along perimeter segments
          createCardinalityBadge(srcCard, srcAnchor.x + (diamondSrcAnchor.x - srcAnchor.x)*0.45, srcAnchor.y + (diamondSrcAnchor.y - srcAnchor.y)*0.45, 'source', rel);
          createCardinalityBadge(tgtCard, diamondTgtAnchor.x + (tgtAnchor.x - diamondTgtAnchor.x)*0.55, diamondTgtAnchor.y + (tgtAnchor.y - diamondTgtAnchor.y)*0.55, 'target', rel);

          // 2.3 Connect any Extra Participants (N-Ary Relationships)
          if (rel.extraParticipants && rel.extraParticipants.length > 0) {
            rel.extraParticipants.forEach(part => {
              const pPos = tablePositions[part.table];
              const pEl = document.getElementById('node_' + part.table);
              if (!pPos || !pEl) return;
              const pWidth = pEl.offsetWidth || 250;
              const pHeight = pEl.offsetHeight || 120;
              const pAnchor = getRectAnchorWithNormal(pPos, pWidth, pHeight, dcCenter);
              const diamondPAnchor = getDiamondAnchorWithNormal(diamondPos, pAnchor);

              drawSegment(diamondPAnchor.x, diamondPAnchor.y, pAnchor.x, pAnchor.y, false, segColor, diamondPAnchor, pAnchor);
              drawConnectionPointDot(diamondPAnchor.x, diamondPAnchor.y);
              drawConnectionPointDot(pAnchor.x, pAnchor.y);

              createCardinalityBadge(part.cardinality || '(0,N)', diamondPAnchor.x + (pAnchor.x - diamondPAnchor.x)*0.55, diamondPAnchor.y + (pAnchor.y - diamondPAnchor.y)*0.55, 'extra_' + part.table, rel);
            });
          }

        } else {
          // Crow's Foot: Connect perimeter borders directly
          const srcAnchor = getRectAnchorWithNormal(srcPos, srcWidth, srcHeight, { x: tcx, y: tcy });
          const tgtAnchor = getRectAnchorWithNormal(tgtPos, tgtWidth, tgtHeight, { x: scx, y: scy });

          const x1 = srcAnchor.x;
          const y1 = srcAnchor.y;
          const x2 = tgtAnchor.x;
          const y2 = tgtAnchor.y;

          let d = '';
          if (connectorRouting === 'ortho') {
            d = computeOrthoPath(srcAnchor, tgtAnchor);
          } else {
            const dx = Math.abs(x2 - x1) * 0.5;
            d = 'M ' + x1 + ' ' + y1 + ' C ' + (x1 + dx) + ' ' + y1 + ', ' + (x2 - dx) + ' ' + y2 + ', ' + x2 + ' ' + y2;
          }

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', d);
          path.setAttribute('class', 'rel-line' + (rel.isIdentifying ? ' identifying-line' : ''));
          path.setAttribute('marker-start', 'url(#crowOne)');
          path.setAttribute('marker-end', rel.type === '1:1' ? 'url(#crowOne)' : 'url(#crowMany)');
          svgLayer.appendChild(path);

          drawConnectionPointDot(x1, y1);
          drawConnectionPointDot(x2, y2);
        }
      });

      // Render ISA Hierarchy Connections (Superclass to ISA, ISA to Subclasses)
      (currentSchema.isaHierarchies || []).forEach(isa => {
        const parentPos = tablePositions[isa.parentTable];
        const parentEl = document.getElementById('node_' + isa.parentTable);
        const isaPos = isaPositions[isa.id];
        const isaEl = document.getElementById('isa_' + isa.id);
        if (!parentPos || !parentEl || !isaPos || !isaEl) return;

        const parentWidth = parentEl.offsetWidth || 250;
        const parentHeight = parentEl.offsetHeight || 120;

        // Top flat edge of inverted triangle
        const isaTopAnchor = { x: isaPos.x + 50, y: isaPos.y + 8, nx: 0, ny: -1 };
        const parentAnchor = getRectAnchorWithNormal(parentPos, parentWidth, parentHeight, isaTopAnchor);

        // Draw parent -> ISA connector
        if (isa.coverage === 'total') {
          // Double line for Total coverage
          drawSegment(parentAnchor.x - 2, parentAnchor.y, isaTopAnchor.x - 2, isaTopAnchor.y, false, '#0284c7');
          drawSegment(parentAnchor.x + 2, parentAnchor.y, isaTopAnchor.x + 2, isaTopAnchor.y, false, '#0284c7');
        } else {
          // Single line for Partial coverage
          drawSegment(parentAnchor.x, parentAnchor.y, isaTopAnchor.x, isaTopAnchor.y, false, '#0284c7', parentAnchor, isaTopAnchor);
        }
        drawConnectionPointDot(parentAnchor.x, parentAnchor.y);
        drawConnectionPointDot(isaTopAnchor.x, isaTopAnchor.y);

        // Bottom tip of inverted triangle
        const isaTipAnchor = { x: isaPos.x + 50, y: isaPos.y + 72, nx: 0, ny: 1 };

        // Connect to each child subclass
        (isa.childTables || []).forEach(childName => {
          const childPos = tablePositions[childName];
          const childEl = document.getElementById('node_' + childName);
          if (!childPos || !childEl) return;
          const childWidth = childEl.offsetWidth || 250;
          const childHeight = childEl.offsetHeight || 120;

          const childAnchor = getRectAnchorWithNormal(childPos, childWidth, childHeight, isaTipAnchor);
          drawSegment(isaTipAnchor.x, isaTipAnchor.y, childAnchor.x, childAnchor.y, false, '#0284c7', isaTipAnchor, childAnchor);
          drawConnectionPointDot(isaTipAnchor.x, isaTipAnchor.y);
          drawConnectionPointDot(childAnchor.x, childAnchor.y);
        });
      });
    }

    function drawConnectionPointDot(x, y) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', 'var(--accent)');
      circle.setAttribute('stroke', 'var(--bg)');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('class', 'connection-point-dot rel-line');
      svgLayer.appendChild(circle);
    }

    function drawSegment(x1, y1, x2, y2, isIdentifying, strokeColor, p1Normal, p2Normal) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = '';
      if (connectorRouting === 'ortho' && p1Normal && p2Normal) {
        d = computeOrthoPath(p1Normal, p2Normal);
      } else {
        d = 'M ' + x1 + ' ' + y1 + ' L ' + x2 + ' ' + y2;
      }
      path.setAttribute('d', d);
      path.setAttribute('class', 'rel-line' + (isIdentifying ? ' identifying-line' : ''));
      if (strokeColor) {
        path.style.stroke = strokeColor;
      }
      svgLayer.appendChild(path);
    }

    function createCardinalityBadge(text, x, y, type, rel) {
      // Append to labelsLayer inside canvasStage so it scales perfectly with zoom!
      const badge = document.createElement('div');
      badge.className = 'cardinality-label ' + type;
      badge.innerText = text;
      badge.title = 'Click to quickly change or paste cardinality';
      badge.style.left = Math.round(x - 14) + 'px';
      badge.style.top = Math.round(y - 9) + 'px';

      if (rel) {
        badge.addEventListener('click', (e) => {
          e.stopPropagation();
          openCardinalityQuickPicker(badge, rel, type);
        });
      }

      if (labelsLayer) {
        labelsLayer.appendChild(badge);
      } else {
        nodesLayer.appendChild(badge);
      }
    }

    function openCardinalityQuickPicker(badgeEl, rel, side) {
      document.querySelectorAll('.card-quick-popover').forEach(p => p.remove());
      const popover = document.createElement('div');
      popover.className = 'card-quick-popover';

      const rect = badgeEl.getBoundingClientRect();
      const options = ['(1,1)', '(0,1)', '(1,N)', '(0,N)'];
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'card-quick-chip';
        btn.innerText = opt;
        btn.onclick = (e) => {
          e.stopPropagation();
          if (side === 'source') rel.sourceCardinality = opt;
          else rel.targetCardinality = opt;
          renderCanvas();
          recompileAll();
          popover.remove();
          showToast('Updated ' + rel.name + ' ' + side + ': ' + opt);
        };
        popover.appendChild(btn);
      });

      // Quick Paste Chip
      const pasteBtn = document.createElement('button');
      pasteBtn.className = 'card-quick-chip action';
      pasteBtn.innerText = 'Paste';
      pasteBtn.title = 'Paste copied cardinality';
      pasteBtn.onclick = (e) => {
        e.stopPropagation();
        if (copiedCardinality) {
          rel.sourceCardinality = copiedCardinality.source;
          rel.targetCardinality = copiedCardinality.target;
          if (copiedCardinality.type) rel.type = copiedCardinality.type;
          renderCanvas();
          recompileAll();
          popover.remove();
          showToast('Pasted cardinality on ' + rel.name);
        } else {
          alert('No cardinality copied yet! Copy one first with COPY.');
        }
      };
      popover.appendChild(pasteBtn);

      // Quick Swap Chip
      const swapBtn = document.createElement('button');
      swapBtn.className = 'card-quick-chip action';
      swapBtn.innerText = '⇄ Swap';
      swapBtn.title = 'Swap Source & Target';
      swapBtn.onclick = (e) => {
        e.stopPropagation();
        const tmp = rel.sourceCardinality || '(1,1)';
        rel.sourceCardinality = rel.targetCardinality || '(0,N)';
        rel.targetCardinality = tmp;
        renderCanvas();
        recompileAll();
        popover.remove();
        showToast('Swapped cardinalities on ' + rel.name);
      };
      popover.appendChild(swapBtn);

      // Close chip
      const closeBtn = document.createElement('button');
      closeBtn.className = 'card-quick-chip action';
      closeBtn.innerText = '✕';
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        popover.remove();
      };
      popover.appendChild(closeBtn);

      document.body.appendChild(popover);
      popover.style.left = Math.max(10, rect.left - 20) + 'px';
      popover.style.top = (rect.bottom + 4) + 'px';

      const removeHandler = (ev) => {
        if (!popover.contains(ev.target)) {
          popover.remove();
          document.removeEventListener('mousedown', removeHandler);
        }
      };
      setTimeout(() => document.addEventListener('mousedown', removeHandler), 50);
    }

    // Sidebar Stats
    function updateSidebarStats() {
      const weakCount = currentSchema.tables.filter(t => t.isWeak).length;
      document.getElementById('sideEntities').innerText = currentSchema.tables.length;
      document.getElementById('sideWeakEntities').innerText = weakCount;
      document.getElementById('sideRelations').innerText = currentSchema.relationships.length;
    }

    // Render Relations List Tab
    function renderRelationsList() {
      const container = document.getElementById('relationsListContainer');
      if (!container) return;
      container.innerHTML = '';

      if (currentSchema.relationships.length === 0) {
        container.innerHTML = '<div style="color:var(--muted); font-size:11px; padding:8px;">No active relationships.</div>';
        return;
      }

      currentSchema.relationships.forEach(rel => {
        const item = document.createElement('div');
        item.className = 'rel-item';
        const identTag = rel.isIdentifying ? ' <span style="color:#38bdf8;">[IDENTIFYING]</span>' : '';
        const sCard = rel.sourceCardinality || '(1,1)';
        const tCard = rel.targetCardinality || (rel.type === '1:1' ? '(1,1)' : '(0,N)');
        item.innerHTML = \`
          <div style="flex:1; min-width:0;">
            <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
              <span style="color:var(--accent); font-weight:700;">\${rel.sourceTable}.\${rel.sourceColumn}</span>
              <span style="color:var(--muted); font-size:10px;">\${rel.type} &rarr;</span>
              <span style="color:var(--text); font-weight:700;">\${rel.targetTable}.\${rel.targetColumn}</span>
              \${identTag}
            </div>
            <div style="display:flex; align-items:center; gap:4px; margin-top:4px; font-size:9px;">
              <span class="card-quick-chip" style="cursor:default;" title="Cardinalities">\${sCard} ➔ \${tCard}</span>
              <button class="btn btn-sm" style="padding:1px 4px; font-size:9px;" title="Copy this relation cardinality" onclick="copyCardinality('\${sCard}', '\${tCard}', '\${rel.type}')">Copy</button>
              <button class="btn btn-sm" style="padding:1px 4px; font-size:9px;" title="Paste copied cardinality to this relation" onclick="pasteCardinalityToRel('\${rel.id}')">Paste</button>
              <button class="btn btn-sm" style="padding:1px 4px; font-size:9px;" title="Swap source and target cardinality" onclick="swapRelationCardinality('\${rel.id}')">⇄ Swap</button>
            </div>
          </div>
          <button class="icon-btn danger" title="Delete relation" onclick="deleteRelation('\${rel.id}')">✕</button>
        \`;
        container.appendChild(item);
      });
    }

    window.copyCardinality = function(src, tgt, type) {
      copiedCardinality = { source: src || '(1,1)', target: tgt || '(0,N)', type: type || '1:N' };
      showToast(\`Copied: \${copiedCardinality.source} ➔ \${copiedCardinality.target}\`);
    };

    window.pasteCardinalityToRel = function(id) {
      if (!copiedCardinality) return alert('No cardinality copied yet! Use Copy button first.');
      const r = currentSchema.relationships.find(x => x.id === id);
      if (r) {
        r.sourceCardinality = copiedCardinality.source;
        r.targetCardinality = copiedCardinality.target;
        if (copiedCardinality.type) r.type = copiedCardinality.type;
        renderCanvas();
        recompileAll();
        showToast(\`Pasted on \${r.name}: \${r.sourceCardinality} ➔ \${r.targetCardinality}\`);
      }
    };

    window.swapRelationCardinality = function(id) {
      const r = currentSchema.relationships.find(x => x.id === id);
      if (r) {
        const tmp = r.sourceCardinality || '(1,1)';
        r.sourceCardinality = r.targetCardinality || '(0,N)';
        r.targetCardinality = tmp;
        renderCanvas();
        recompileAll();
        showToast(\`Swapped: \${r.targetCardinality} ⇄ \${r.sourceCardinality}\`);
      }
    };

    window.deleteRelation = function(id) {
      currentSchema.relationships = currentSchema.relationships.filter(r => r.id !== id);
      renderCanvas();
      recompileAll();
    };

    window.deleteIsa = function(id) {
      if (currentSchema.isaHierarchies) {
        currentSchema.isaHierarchies = currentSchema.isaHierarchies.filter(i => i.id !== id);
        delete isaPositions[id];
        renderCanvas();
        recompileAll();
      }
    };

    // Viewport Pan / Zoom Handlers
    function updateTransform() {
      if (canvasStage) {
        canvasStage.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${zoom})\`;
      } else {
        nodesLayer.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${zoom})\`;
      }
      renderConnections();
      zoomLevelEl.innerText = \`\${Math.round(zoom * 100)}%\`;
      coordsEl.innerText = \`X: \${Math.round(panX)} Y: \${Math.round(panY)}\`;
    }

    viewport.addEventListener('mousedown', (e) => {
      if (e.target === viewport || e.target === svgLayer) {
        isPanning = true;
        startPanX = e.clientX - panX;
        startPanY = e.clientY - panY;
        viewport.classList.add('panning');
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panX = e.clientX - startPanX;
        panY = e.clientY - startPanY;
        updateTransform();
      } else if (activeDragTable) {
        let nx = (e.clientX / zoom) - dragOffsetX;
        let ny = (e.clientY / zoom) - dragOffsetY;
        if (snapToGrid) {
          nx = Math.round(nx / 10) * 10;
          ny = Math.round(ny / 10) * 10;
        } else {
          nx = Math.round(nx);
          ny = Math.round(ny);
        }
        tablePositions[activeDragTable] = { x: nx, y: ny };
        const card = document.getElementById('node_' + activeDragTable);
        if (card) {
          card.style.transform = \`translate(\${nx}px, \${ny}px)\`;
        }
        renderConnections();
      } else if (activeDragRel) {
        let nx = (e.clientX / zoom) - dragOffsetX;
        let ny = (e.clientY / zoom) - dragOffsetY;
        if (snapToGrid) {
          nx = Math.round(nx / 10) * 10;
          ny = Math.round(ny / 10) * 10;
        } else {
          nx = Math.round(nx);
          ny = Math.round(ny);
        }
        relPositions[activeDragRel] = { x: nx, y: ny };
        const diamond = document.getElementById('diamond_' + activeDragRel);
        if (diamond) {
          diamond.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        }
        renderConnections();
      } else if (activeDragNote) {
        let nx = (e.clientX / zoom) - dragOffsetX;
        let ny = (e.clientY / zoom) - dragOffsetY;
        if (snapToGrid) {
          nx = Math.round(nx / 10) * 10;
          ny = Math.round(ny / 10) * 10;
        } else {
          nx = Math.round(nx);
          ny = Math.round(ny);
        }
        const noteObj = (currentSchema.notes || []).find(n => n.id === activeDragNote);
        if (noteObj) {
          noteObj.x = nx;
          noteObj.y = ny;
        }
        const noteEl = document.getElementById('note_' + activeDragNote);
        if (noteEl) {
          noteEl.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        }
      } else if (activeDragIsa) {
        let nx = (e.clientX / zoom) - dragOffsetX;
        let ny = (e.clientY / zoom) - dragOffsetY;
        if (snapToGrid) {
          nx = Math.round(nx / 10) * 10;
          ny = Math.round(ny / 10) * 10;
        } else {
          nx = Math.round(nx);
          ny = Math.round(ny);
        }
        isaPositions[activeDragIsa] = { x: nx, y: ny };
        const isaEl = document.getElementById('isa_' + activeDragIsa);
        if (isaEl) {
          isaEl.style.transform = 'translate(' + nx + 'px, ' + ny + 'px)';
        }
        renderConnections();
      }
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      activeDragTable = null;
      activeDragRel = null;
      activeDragNote = null;
      activeDragIsa = null;
      viewport.classList.remove('panning');
    });

    window.createNote = function(x, y) {
      if (!currentSchema.notes) currentSchema.notes = [];
      const id = 'note_' + Date.now();
      const spawnX = x !== undefined ? x : Math.round((-panX + 180) / zoom);
      const spawnY = y !== undefined ? y : Math.round((-panY + 120) / zoom);
      currentSchema.notes.push({
        id: id,
        x: spawnX,
        y: spawnY,
        title: 'NOTE #' + (currentSchema.notes.length + 1),
        text: '',
        color: 'amber'
      });
      renderCanvas();
      showToast('Created Post-It note on workspace');
    };

    window.setNoteColor = function(id, color) {
      const n = (currentSchema.notes || []).find(x => x.id === id);
      if (n) {
        n.color = color;
        renderCanvas();
      }
    };

    window.deleteNote = function(id) {
      if (currentSchema.notes) {
        currentSchema.notes = currentSchema.notes.filter(x => x.id !== id);
        renderCanvas();
        showToast('Deleted note');
      }
    };

    // Inline Editing & Zero-Modal Actions
    window.startInlineRenameTable = function(tableName, containerEl) {
      const origHtml = containerEl.innerHTML;
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'inline-edit-input';
      input.value = tableName;
      containerEl.innerHTML = '';
      containerEl.appendChild(input);
      input.focus();
      input.select();

      let committed = false;
      function commit() {
        if (committed) return;
        committed = true;
        const newName = input.value.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
        if (!newName || newName === tableName) {
          containerEl.innerHTML = origHtml;
          return;
        }
        if (currentSchema.tables.some(t => t.name === newName && t.name !== tableName)) {
          alert('A table named ' + newName + ' already exists');
          containerEl.innerHTML = origHtml;
          return;
        }
        const t = currentSchema.tables.find(x => x.name === tableName);
        if (t) t.name = newName;

        if (tablePositions[tableName]) {
          tablePositions[newName] = tablePositions[tableName];
          delete tablePositions[tableName];
        }
        if (elementStyles['table:' + tableName]) {
          elementStyles['table:' + newName] = elementStyles['table:' + tableName];
          delete elementStyles['table:' + tableName];
        }

        currentSchema.relationships.forEach(r => {
          if (r.sourceTable === tableName) r.sourceTable = newName;
          if (r.targetTable === tableName) r.targetTable = newName;
        });

        currentSchema.tables.forEach(tbl => {
          tbl.columns.forEach(c => {
            if (c.fk && c.fk.targetTable === tableName) {
              c.fk.targetTable = newName;
            }
          });
        });

        selectedTable = newName;
        renderCanvas();
        recompileAll();
        showToast('Renamed entity to: ' + newName);
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          committed = true;
          containerEl.innerHTML = origHtml;
        }
      });
      input.addEventListener('blur', commit);
    };

    window.startInlineEditColumn = function(tableName, colName, rowEl) {
      const t = currentSchema.tables.find(x => x.name === tableName);
      if (!t) return;
      const col = t.columns.find(x => x.name === colName);
      if (!col) return;

      const origHtml = rowEl.innerHTML;
      rowEl.innerHTML = '' +
        '<div class="inline-col-form">' +
        '  <input type="text" class="inline-col-name" value="' + col.name + '" placeholder="column_name" />' +
        '  <input type="text" class="inline-col-type" value="' + col.type + '" placeholder="type" />' +
        '</div>';

      const nameInput = rowEl.querySelector('.inline-col-name');
      const typeInput = rowEl.querySelector('.inline-col-type');
      nameInput.focus();
      nameInput.select();

      let committed = false;
      function commit() {
        if (committed) return;
        setTimeout(() => {
          if (rowEl.contains(document.activeElement)) return;
          committed = true;
          const newName = nameInput.value.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
          const newType = typeInput.value.trim() || 'varchar(255)';

          if (!newName) {
            rowEl.innerHTML = origHtml;
            return;
          }

          if (newName !== colName) {
            currentSchema.relationships.forEach(r => {
              if (r.targetTable === tableName && r.targetColumn === colName) {
                r.targetColumn = newName;
              }
              if (r.sourceTable === tableName && r.sourceColumn === colName) {
                r.sourceColumn = newName;
              }
            });
            col.name = newName;
          }
          col.type = newType;

          renderCanvas();
          recompileAll();
          showToast('Updated column ' + col.name + ' (' + col.type + ')');
        }, 60);
      }

      function handleKey(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          committed = true;
          rowEl.innerHTML = origHtml;
        }
      }

      nameInput.addEventListener('keydown', handleKey);
      typeInput.addEventListener('keydown', handleKey);
      nameInput.addEventListener('blur', commit);
      typeInput.addEventListener('blur', commit);
    };

    window.quickAddColumn = function(tableName) {
      const t = currentSchema.tables.find(x => x.name === tableName);
      if (!t) return;
      const newColName = 'col_' + (t.columns.length + 1);
      t.columns.push({
        name: newColName,
        type: 'varchar(255)',
        attributeType: 'normal'
      });
      renderCanvas();
      recompileAll();
      showToast('Added column to ' + tableName);

      const newRow = document.getElementById('col_' + tableName + '_' + newColName);
      if (newRow) {
        startInlineEditColumn(tableName, newColName, newRow);
      }
    };

    window.quickCreateTable = function() {
      const baseName = 'entity_' + (currentSchema.tables.length + 1);
      currentSchema.tables.push({
        name: baseName,
        isWeak: false,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      });
      tablePositions[baseName] = {
        x: Math.round((-panX + 220) / zoom) + Math.random() * 40,
        y: Math.round((-panY + 160) / zoom) + Math.random() * 40
      };
      selectedTable = baseName;
      renderCanvas();
      recompileAll();
      showToast('Created ' + baseName + ' (Double-click to rename)');

      const nodeEl = document.getElementById('node_' + baseName);
      if (nodeEl) {
        const titleEl = nodeEl.querySelector('.table-title');
        if (titleEl) startInlineRenameTable(baseName, titleEl);
      }
    };

    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(Math.max(0.3, zoom * zoomFactor), 2.5);
      
      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      panX = mouseX - (mouseX - panX) * (newZoom / zoom);
      panY = mouseY - (mouseY - panY) * (newZoom / zoom);
      zoom = newZoom;
      updateTransform();
    }, { passive: false });

    // Zoom Buttons
    document.getElementById('btnZoomIn').addEventListener('click', () => {
      zoom = Math.min(2.5, zoom * 1.15);
      updateTransform();
    });
    document.getElementById('btnZoomOut').addEventListener('click', () => {
      zoom = Math.max(0.3, zoom * 0.85);
      updateTransform();
    });
    document.getElementById('btnZoomReset').addEventListener('click', () => {
      zoom = 1.0;
      panX = 40;
      panY = 40;
      updateTransform();
    });
    document.getElementById('btnAutoLayout').addEventListener('click', () => {
      initLayout();
      updateTransform();
      renderCanvas();
    });

    // Delete Table
    window.deleteTable = function(name) {
      if (!confirm(\`Delete entity table "\${name}" and related foreign keys?\`)) return;
      currentSchema.tables = currentSchema.tables.filter(t => t.name !== name);
      currentSchema.relationships = currentSchema.relationships.filter(r => r.sourceTable !== name && r.targetTable !== name);
      delete tablePositions[name];
      renderCanvas();
      recompileAll();
    };

    // Column Delete
    window.deleteColumn = function(tableName, colName) {
      const table = currentSchema.tables.find(t => t.name === tableName);
      if (!table) return;
      table.columns = table.columns.filter(c => c.name !== colName);
      currentSchema.relationships = currentSchema.relationships.filter(r => 
        !(r.sourceTable === tableName && r.sourceColumn === colName) &&
        !(r.targetTable === tableName && r.targetColumn === colName)
      );
      renderCanvas();
      recompileAll();
    };

    let tempSubAttributes = [];

    function renderSubAttributesUI() {
      const container = document.getElementById('subAttributesList');
      if (!container) return;
      container.innerHTML = '';
      tempSubAttributes.forEach((sub, idx) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '6px';
        row.style.alignItems = 'center';
        row.innerHTML = \`
          <input type="text" class="form-input" style="flex:1; padding:2px 6px; font-size:11px;" value="\${sub.name}" placeholder="Sub-field name (e.g. Via)" oninput="updateSubAttrName(\${idx}, this.value)" />
          <input type="text" class="form-input" style="width:110px; padding:2px 6px; font-size:11px;" value="\${sub.type}" placeholder="Type" oninput="updateSubAttrType(\${idx}, this.value)" />
          <button type="button" class="icon-btn danger" style="padding:1px 4px; font-size:10px;" onclick="removeSubAttrRow(\${idx})">✕</button>
        \`;
        container.appendChild(row);
      });
    }

    window.updateSubAttrName = function(idx, val) {
      if (tempSubAttributes[idx]) tempSubAttributes[idx].name = val.trim();
    };
    window.updateSubAttrType = function(idx, val) {
      if (tempSubAttributes[idx]) tempSubAttributes[idx].type = val.trim();
    };
    window.removeSubAttrRow = function(idx) {
      tempSubAttributes.splice(idx, 1);
      renderSubAttributesUI();
    };

    const btnAddSubRowEl = document.getElementById('btnAddSubAttrRow');
    if (btnAddSubRowEl) {
      btnAddSubRowEl.addEventListener('click', () => {
        tempSubAttributes.push({ name: 'field_' + (tempSubAttributes.length + 1), type: 'varchar(100)' });
        renderSubAttributesUI();
      });
    }

    const inputAttrTypeEl = document.getElementById('inputColAttrType');
    if (inputAttrTypeEl) {
      inputAttrTypeEl.addEventListener('change', (e) => {
        const isComp = e.target.value === 'composite';
        document.getElementById('subAttributesSection').style.display = isComp ? 'block' : 'none';
      });
    }

    // Open Column Edit Modal
    window.openEditColumn = function(tableName, colName) {
      const table = currentSchema.tables.find(t => t.name === tableName);
      if (!table) return;
      const col = table.columns.find(c => c.name === colName);
      if (!col) return;

      document.getElementById('modalColumnTitle').innerText = \`EDIT COLUMN: \${col.name}\`;
      document.getElementById('inputColTableName').value = tableName;
      document.getElementById('inputColOriginalName').value = colName;
      document.getElementById('inputColName').value = col.name;
      document.getElementById('inputColType').value = col.type;
      document.getElementById('inputColDefault').value = col.defaultVal || '';
      document.getElementById('chkColPk').checked = !!col.pk;
      document.getElementById('chkColUnique').checked = !!col.unique;
      document.getElementById('chkColNullable').checked = col.nullable !== false;
      document.getElementById('btnDeleteColumnModal').style.display = 'inline-block';

      const attrType = col.attributeType || (col.pk ? 'key' : 'normal');
      document.getElementById('inputColAttrType').value = attrType;
      tempSubAttributes = JSON.parse(JSON.stringify(col.subAttributes || []));
      document.getElementById('subAttributesSection').style.display = attrType === 'composite' ? 'block' : 'none';
      renderSubAttributesUI();

      openModal('modalColumn');
    };

    // Open Add Column Modal
    window.openAddColumn = function(tableName) {
      document.getElementById('modalColumnTitle').innerText = 'ADD COLUMN';
      document.getElementById('inputColTableName').value = tableName;
      document.getElementById('inputColOriginalName').value = '';
      document.getElementById('inputColName').value = '';
      document.getElementById('inputColDefault').value = '';
      document.getElementById('chkColPk').checked = false;
      document.getElementById('chkColUnique').checked = false;
      document.getElementById('chkColNullable').checked = true;
      document.getElementById('btnDeleteColumnModal').style.display = 'none';

      document.getElementById('inputColAttrType').value = 'normal';
      document.getElementById('subAttributesSection').style.display = 'none';
      tempSubAttributes = [];
      renderSubAttributesUI();

      openModal('modalColumn');
    };

    window.openAddSubAttribute = function(tableName, colName) {
      const table = currentSchema.tables.find(t => t.name === tableName);
      if (!table) return;
      const col = table.columns.find(c => c.name === colName);
      if (!col) return;
      const subName = prompt('Enter Sub-Attribute name (e.g. Via, CAP, Comune):');
      if (!subName || !subName.trim()) return;
      const subType = prompt('Enter data type:', 'varchar(100)') || 'varchar(100)';
      if (!col.subAttributes) col.subAttributes = [];
      col.subAttributes.push({ name: subName.trim(), type: subType.trim() });
      renderCanvas();
      recompileAll();
      showToast('Added sub-field ' + subName + ' to ' + colName);
    };

    window.deleteSubAttribute = function(tableName, colName, subName) {
      const table = currentSchema.tables.find(t => t.name === tableName);
      if (!table) return;
      const col = table.columns.find(c => c.name === colName);
      if (!col || !col.subAttributes) return;
      col.subAttributes = col.subAttributes.filter(s => s.name !== subName);
      renderCanvas();
      recompileAll();
      showToast('Removed sub-field ' + subName);
    };

    document.getElementById('btnDeleteColumnModal').addEventListener('click', () => {
      const tableName = document.getElementById('inputColTableName').value;
      const colName = document.getElementById('inputColOriginalName').value;
      if (tableName && colName) {
        deleteColumn(tableName, colName);
        closeModal('modalColumn');
      }
    });

    document.getElementById('btnSaveColumn').addEventListener('click', () => {
      const tableName = document.getElementById('inputColTableName').value;
      const originalName = document.getElementById('inputColOriginalName').value;
      const colName = document.getElementById('inputColName').value.trim();
      const colType = document.getElementById('inputColType').value;
      const defVal = document.getElementById('inputColDefault').value.trim();
      const isPk = document.getElementById('chkColPk').checked;
      const isUnique = document.getElementById('chkColUnique').checked;
      const isNullable = document.getElementById('chkColNullable').checked;
      const attrType = document.getElementById('inputColAttrType').value;

      if (!colName) return alert('Column name is required');
      const table = currentSchema.tables.find(t => t.name === tableName);
      if (!table) return;

      if (originalName) {
        const col = table.columns.find(c => c.name === originalName);
        if (col) {
          col.name = colName;
          col.type = colType;
          col.pk = isPk;
          col.unique = isUnique;
          col.nullable = isNullable;
          col.defaultVal = defVal || undefined;
          col.attributeType = attrType;
          if (attrType === 'composite') {
            col.subAttributes = tempSubAttributes;
          } else {
            delete col.subAttributes;
          }

          if (originalName !== colName) {
            currentSchema.relationships.forEach(r => {
              if (r.sourceTable === tableName && r.sourceColumn === originalName) r.sourceColumn = colName;
              if (r.targetTable === tableName && r.targetColumn === originalName) r.targetColumn = colName;
            });
          }
        }
      } else {
        table.columns.push({
          name: colName,
          type: colType,
          pk: isPk,
          unique: isUnique,
          nullable: isNullable,
          defaultVal: defVal || undefined,
          attributeType: attrType,
          subAttributes: attrType === 'composite' ? tempSubAttributes : undefined
        });
      }

      closeModal('modalColumn');
      renderCanvas();
      recompileAll();
    });

    // Add Table Flow
    document.getElementById('btnNewTable').addEventListener('click', () => {
      document.getElementById('modalTableTitle').innerText = 'ADD NEW TABLE';
      document.getElementById('inputTableName').value = '';
      document.getElementById('inputTableComment').value = '';
      document.getElementById('chkTableWeak').checked = false;
      openModal('modalTable');
    });

    document.getElementById('btnNewWeakEntity').addEventListener('click', () => {
      document.getElementById('modalTableTitle').innerText = 'ADD WEAK ENTITY (DOUBLE BORDER)';
      document.getElementById('inputTableName').value = '';
      document.getElementById('inputTableComment').value = 'Dependent weak entity';
      document.getElementById('chkTableWeak').checked = true;
      openModal('modalTable');
    });

    // Draw.io Toolbar & Notation Toggles
    const btnToggleNotation = document.getElementById('btnToggleNotation');
    if (btnToggleNotation) {
      btnToggleNotation.addEventListener('click', () => {
        notationMode = notationMode === 'chen' ? 'crow' : 'chen';
        btnToggleNotation.innerText = 'NOTATION: ' + notationMode.toUpperCase();
        document.getElementById('inspectorNotationSelect').value = notationMode;
        if (notationMode === 'chen') {
          viewport.classList.add('chen-mode');
        } else {
          viewport.classList.remove('chen-mode');
        }
        renderCanvas();
      });
    }

    const btnToggleGrid = document.getElementById('btnToggleGrid');
    if (btnToggleGrid) {
      btnToggleGrid.addEventListener('click', () => {
        showGrid = !showGrid;
        btnToggleGrid.innerText = 'GRID: ' + (showGrid ? 'ON' : 'OFF');
        document.getElementById('chkInspectorGrid').checked = showGrid;
        if (showGrid) viewport.classList.remove('no-grid');
        else viewport.classList.add('no-grid');
      });
    }

    const btnToggleSnap = document.getElementById('btnToggleSnap');
    if (btnToggleSnap) {
      btnToggleSnap.addEventListener('click', () => {
        snapToGrid = !snapToGrid;
        btnToggleSnap.innerText = 'SNAP: ' + (snapToGrid ? 'ON' : 'OFF');
        document.getElementById('chkInspectorSnap').checked = snapToGrid;
      });
    }

    // Inspector Style Tab Handlers
    document.getElementById('inspectorNotationSelect').addEventListener('change', (e) => {
      notationMode = e.target.value;
      if (btnToggleNotation) btnToggleNotation.innerText = 'NOTATION: ' + notationMode.toUpperCase();
      renderCanvas();
    });
    document.getElementById('chkInspectorGrid').addEventListener('change', (e) => {
      showGrid = e.target.checked;
      if (btnToggleGrid) btnToggleGrid.innerText = 'GRID: ' + (showGrid ? 'ON' : 'OFF');
      if (showGrid) viewport.classList.remove('no-grid');
      else viewport.classList.add('no-grid');
    });
    document.getElementById('chkInspectorSnap').addEventListener('change', (e) => {
      snapToGrid = e.target.checked;
      if (btnToggleSnap) btnToggleSnap.innerText = 'SNAP: ' + (snapToGrid ? 'ON' : 'OFF');
    });
    document.getElementById('btnDeselectAll').addEventListener('click', () => {
      selectedTable = null;
      selectedRel = null;
      updateSelectedLabel('None');
      document.querySelectorAll('.table-node, .rel-diamond-node').forEach(n => n.classList.remove('selected'));
    });


    // Theme Switcher (Dark <-> Light)
    const btnToggleTheme = document.getElementById('btnToggleTheme');
    if (btnToggleTheme) {
      btnToggleTheme.addEventListener('click', () => {
        const html = document.getElementById('htmlRoot');
        if (currentTheme === 'dark') {
          currentTheme = 'light';
          html.classList.remove('dark');
          html.classList.add('light');
          btnToggleTheme.innerText = 'THEME: LIGHT';
        } else {
          currentTheme = 'dark';
          html.classList.remove('light');
          html.classList.add('dark');
          btnToggleTheme.innerText = 'THEME: DARK';
        }
        renderCanvas();
      });
    }

    // Color Pickers 2-way sync
    const pickerFill = document.getElementById('pickerFillColor');
    const textFill = document.getElementById('textFillColor');
    const pickerStroke = document.getElementById('pickerStrokeColor');
    const textStroke = document.getElementById('textStrokeColor');
    const pickerText = document.getElementById('pickerTextColor');
    const textText = document.getElementById('textTextColor');
    const rangeOpacity = document.getElementById('rangeFillOpacity');
    const labelOpacity = document.getElementById('labelFillOpacity');
    const selectStrokeWidth = document.getElementById('selectStrokeWidth');

    if (pickerFill && textFill) {
      pickerFill.addEventListener('input', (e) => { textFill.value = e.target.value; });
      textFill.addEventListener('input', (e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) pickerFill.value = e.target.value; });
    }
    if (pickerStroke && textStroke) {
      pickerStroke.addEventListener('input', (e) => { textStroke.value = e.target.value; });
      textStroke.addEventListener('input', (e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) pickerStroke.value = e.target.value; });
    }
    if (pickerText && textText) {
      pickerText.addEventListener('input', (e) => { textText.value = e.target.value; });
      textText.addEventListener('input', (e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) pickerText.value = e.target.value; });
    }
    if (rangeOpacity && labelOpacity) {
      rangeOpacity.addEventListener('input', (e) => { labelOpacity.innerText = e.target.value + '%'; });
    }

    window.applyColorPreset = function(fill, stroke, text) {
      if (textFill) textFill.value = fill;
      if (pickerFill) pickerFill.value = fill;
      if (textStroke) textStroke.value = stroke;
      if (pickerStroke) pickerStroke.value = stroke;
      if (textText) textText.value = text;
      if (pickerText) pickerText.value = text;
      document.getElementById('btnApplyShapeStyle').click();
    };

    // Apply Style button
    const btnApplyStyle = document.getElementById('btnApplyShapeStyle');
    if (btnApplyStyle) {
      btnApplyStyle.addEventListener('click', () => {
        let key = null;
        if (selectedTable) {
          key = 'table:' + selectedTable;
        } else if (selectedRel) {
          key = 'rel:' + selectedRel;
        }

        if (!key) {
          alert('Please click on a Table card or a Relationship diamond ◇ first to select it.');
          return;
        }

        elementStyles[key] = {
          fill: textFill ? textFill.value : undefined,
          stroke: textStroke ? textStroke.value : undefined,
          text: textText ? textText.value : undefined,
          opacity: rangeOpacity ? parseInt(rangeOpacity.value, 10) : 100,
          strokeWidth: selectStrokeWidth ? parseInt(selectStrokeWidth.value, 10) : 2
        };

        renderCanvas();
      });
    }

    // Reset Element Color
    const btnResetColor = document.getElementById('btnResetElementColor');
    if (btnResetColor) {
      btnResetColor.addEventListener('click', () => {
        let key = null;
        if (selectedTable) key = 'table:' + selectedTable;
        else if (selectedRel) key = 'rel:' + selectedRel;
        if (key && elementStyles[key]) {
          delete elementStyles[key];
          renderCanvas();
        }
      });
    }

    // Helper: update inspector inputs when element is selected
    function loadSelectedElementStyles() {
      let key = null;
      if (selectedTable) key = 'table:' + selectedTable;
      else if (selectedRel) key = 'rel:' + selectedRel;

      const style = (key && elementStyles[key]) ? elementStyles[key] : {};
      if (style.fill) {
        if (textFill) textFill.value = style.fill;
        if (pickerFill && /^#[0-9A-Fa-f]{6}$/.test(style.fill)) pickerFill.value = style.fill;
      }
      if (style.stroke) {
        if (textStroke) textStroke.value = style.stroke;
        if (pickerStroke && /^#[0-9A-Fa-f]{6}$/.test(style.stroke)) pickerStroke.value = style.stroke;
      }
      if (style.text) {
        if (textText) textText.value = style.text;
        if (pickerText && /^#[0-9A-Fa-f]{6}$/.test(style.text)) pickerText.value = style.text;
      }
      if (style.opacity !== undefined && rangeOpacity) {
        rangeOpacity.value = style.opacity;
        if (labelOpacity) labelOpacity.innerText = style.opacity + '%';
      }
      if (style.strokeWidth && selectStrokeWidth) {
        selectStrokeWidth.value = String(style.strokeWidth);
      }
    }

    // Sidebar Library Click Handlers
    document.getElementById('libStandardEntity').addEventListener('click', () => {
      document.getElementById('btnNewTable').click();
    });

    const libChenEntity = document.getElementById('libChenEntity');
    if (libChenEntity) {
      libChenEntity.addEventListener('click', () => {
        const name = prompt('Chen Entity Name (e.g. AUTORE, STUDENTE):', 'ENTITA');
        if (!name) return;
        const uName = name.toUpperCase().trim();
        currentSchema.tables.push({
          name: uName,
          shapeType: 'chen_entity',
          isWeak: false,
          columns: [
            { name: 'Codice' + uName, type: 'serial', pk: true, attributeType: 'key' },
            { name: 'Descrizione', type: 'varchar(100)', nullable: false, attributeType: 'normal' }
          ]
        });
        tablePositions[uName] = { x: 100 - panX + Math.random() * 60, y: 100 - panY + Math.random() * 60 };
        renderCanvas();
        recompileAll();
      });
    }

    document.getElementById('libWeakEntity').addEventListener('click', () => {
      document.getElementById('btnNewWeakEntity').click();
    });

    document.getElementById('libAssociativeEntity').addEventListener('click', () => {
      const name = prompt('Associative bridge table name:', 'ENTITY_LINKS');
      if (!name) return;
      const uName = name.toUpperCase().trim();
      currentSchema.tables.push({
        name: uName,
        comment: 'Associative bridge entity',
        shapeType: 'associative_entity',
        isWeak: true,
        columns: [
          { name: 'id', type: 'uuid', pk: true, defaultVal: 'gen_random_uuid()' },
          { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      });
      tablePositions[uName] = { x: 80 - panX + Math.random() * 80, y: 80 - panY + Math.random() * 80 };
      renderCanvas();
      recompileAll();
    });

    const libRelDiamond = document.getElementById('libRelDiamond');
    if (libRelDiamond) {
      libRelDiamond.addEventListener('click', () => {
        document.getElementById('btnNewRel').click();
      });
    }

    const libRelWeakDiamond = document.getElementById('libRelWeakDiamond');
    if (libRelWeakDiamond) {
      libRelWeakDiamond.addEventListener('click', () => {
        document.getElementById('btnNewRel').click();
        document.getElementById('relIsIdentifying').checked = true;
      });
    }

    document.getElementById('libRel1toN').addEventListener('click', () => {
      document.getElementById('btnNewRel').click();
      document.getElementById('relType').value = '1:N';
    });

    document.getElementById('libRel1to1').addEventListener('click', () => {
      document.getElementById('btnNewRel').click();
      document.getElementById('relType').value = '1:1';
    });

    const libRelNtoM = document.getElementById('libRelNtoM');
    if (libRelNtoM) {
      libRelNtoM.addEventListener('click', () => {
        document.getElementById('btnNewRel').click();
        document.getElementById('relType').value = 'N:M';
      });
    }

    // Chen Attributes Palette Items
    const libAttrNormal = document.getElementById('libAttrNormal');
    if (libAttrNormal) {
      libAttrNormal.addEventListener('click', () => {
        if (!selectedTable && currentSchema.tables.length > 0) selectedTable = currentSchema.tables[0].name;
        if (selectedTable) {
          openAddColumn(selectedTable);
          document.getElementById('inputColAttrType').value = 'normal';
        } else {
          alert('Please select or create an entity table first.');
        }
      });
    }

    const libAttrKey = document.getElementById('libAttrKey');
    if (libAttrKey) {
      libAttrKey.addEventListener('click', () => {
        if (!selectedTable && currentSchema.tables.length > 0) selectedTable = currentSchema.tables[0].name;
        if (selectedTable) {
          openAddColumn(selectedTable);
          document.getElementById('chkColPk').checked = true;
          document.getElementById('inputColAttrType').value = 'key';
        }
      });
    }

    const libAttrMultivalued = document.getElementById('libAttrMultivalued');
    if (libAttrMultivalued) {
      libAttrMultivalued.addEventListener('click', () => {
        if (!selectedTable && currentSchema.tables.length > 0) selectedTable = currentSchema.tables[0].name;
        if (selectedTable) {
          openAddColumn(selectedTable);
          document.getElementById('inputColAttrType').value = 'multivalued';
        }
      });
    }

    const libAttrDerived = document.getElementById('libAttrDerived');
    if (libAttrDerived) {
      libAttrDerived.addEventListener('click', () => {
        if (!selectedTable && currentSchema.tables.length > 0) selectedTable = currentSchema.tables[0].name;
        if (selectedTable) {
          openAddColumn(selectedTable);
          document.getElementById('inputColAttrType').value = 'derived';
        }
      });
    }

    // Quick Cardinality Buttons
    ['01', '11', '0N', '1N'].forEach(c => {
      const b = document.getElementById('btnCard' + c);
      if (b) {
        b.addEventListener('click', () => {
          if (selectedRel) {
            const r = currentSchema.relationships.find(x => x.id === selectedRel);
            if (r) {
              const val = b.innerText;
              r.sourceCardinality = val;
              renderConnections();
              recompileAll();
            }
          } else {
            alert('Select a relationship diamond ◇ on the canvas to assign cardinality ' + b.innerText);
          }
        });
      }
    });

    document.getElementById('btnSaveTable').addEventListener('click', () => {
      const name = document.getElementById('inputTableName').value.trim().toLowerCase();
      const comment = document.getElementById('inputTableComment').value.trim();
      const isWeak = document.getElementById('chkTableWeak').checked;
      if (!name) return alert('Table name is required');
      if (currentSchema.tables.some(t => t.name === name)) return alert('Table name already exists');

      currentSchema.tables.push({
        name,
        comment: comment || undefined,
        isWeak: isWeak,
        columns: [
          { name: 'id', type: isWeak ? 'bigserial' : 'uuid', pk: true, defaultVal: isWeak ? undefined : 'gen_random_uuid()' },
          { name: 'created_at', type: 'timestamp', defaultVal: 'CURRENT_TIMESTAMP' }
        ]
      });

      tablePositions[name] = { x: 80 - panX + Math.random() * 80, y: 80 - panY + Math.random() * 80 };
      closeModal('modalTable');
      renderCanvas();
      recompileAll();
    });

    // Add Relationship Flow
    document.getElementById('btnNewRel').addEventListener('click', () => {
      const srcSelect = document.getElementById('relSourceTable');
      const tgtSelect = document.getElementById('relTargetTable');
      srcSelect.innerHTML = '';
      tgtSelect.innerHTML = '';

      currentSchema.tables.forEach(t => {
        srcSelect.add(new Option(t.name, t.name));
        tgtSelect.add(new Option(t.name, t.name));
      });

      function updateCols() {
        const sTable = currentSchema.tables.find(t => t.name === srcSelect.value);
        const tTable = currentSchema.tables.find(t => t.name === tgtSelect.value);
        const sColSelect = document.getElementById('relSourceColumn');
        const tColSelect = document.getElementById('relTargetColumn');
        sColSelect.innerHTML = '';
        tColSelect.innerHTML = '';

        if (sTable) {
          sTable.columns.forEach(c => sColSelect.add(new Option(c.name, c.name)));
        }
        if (tTable) {
          tTable.columns.forEach(c => tColSelect.add(new Option(c.name, c.name)));
        }

        // Auto-check identifying if target is weak
        if (tTable && tTable.isWeak) {
          document.getElementById('relIsIdentifying').checked = true;
        }
      }

      srcSelect.onchange = updateCols;
      tgtSelect.onchange = updateCols;
      updateCols();

      // Clear N-ary Extra Branches container
      const naryList = document.getElementById('naryParticipantsList');
      if (naryList) naryList.innerHTML = '';

      openModal('modalRelation');
    });

    const btnAddNaryEl = document.getElementById('btnAddNaryRow');
    if (btnAddNaryEl) {
      btnAddNaryEl.addEventListener('click', () => {
        const naryList = document.getElementById('naryParticipantsList');
        if (!naryList) return;
        const row = document.createElement('div');
        row.className = 'nary-row';
        row.style.display = 'flex';
        row.style.gap = '6px';
        row.style.alignItems = 'center';

        let options = '';
        currentSchema.tables.forEach(t => {
          options += '<option value="' + t.name + '">' + t.name + '</option>';
        });

        row.innerHTML = \`
          <select class="select form-input nary-table-select" style="flex:1; padding:2px 6px; font-size:11px;">
            \${options}
          </select>
          <select class="select form-input nary-card-select" style="width:80px; padding:2px 6px; font-size:11px;">
            <option value="(0,1)">(0,1)</option>
            <option value="(1,1)">(1,1)</option>
            <option value="(0,N)" selected>(0,N)</option>
            <option value="(1,N)">(1,N)</option>
          </select>
          <button type="button" class="icon-btn danger" style="padding:1px 4px; font-size:10px;" onclick="this.parentElement.remove()">✕</button>
        \`;
        naryList.appendChild(row);
      });
    }

    document.getElementById('btnSaveRelation').addEventListener('click', () => {
      const srcTable = document.getElementById('relSourceTable').value;
      const srcCol = document.getElementById('relSourceColumn').value;
      const tgtTable = document.getElementById('relTargetTable').value;
      const tgtCol = document.getElementById('relTargetColumn').value;
      const type = document.getElementById('relType').value;
      const onDelete = document.getElementById('relOnDelete').value;
      const isIdentifying = document.getElementById('relIsIdentifying').checked;

      const rName = document.getElementById('relName').value.trim() || (srcTable + '_' + tgtTable);
      const sCard = document.getElementById('relSourceCard').value;
      const tCard = document.getElementById('relTargetCard').value;
      const attrRaw = document.getElementById('relAttributes').value.trim();
      const rAttrs = attrRaw ? attrRaw.split(',').map(s => ({ name: s.trim() })).filter(a => a.name) : undefined;

      const extraParticipants = [];
      document.querySelectorAll('#naryParticipantsList .nary-row').forEach(row => {
        const tbl = row.querySelector('.nary-table-select')?.value;
        const card = row.querySelector('.nary-card-select')?.value;
        if (tbl && tbl !== srcTable && tbl !== tgtTable) {
          extraParticipants.push({ table: tbl, cardinality: card || '(0,N)' });
        }
      });

      const newRelId = 'rel_' + Date.now();
      currentSchema.relationships.push({
        id: newRelId,
        name: rName,
        sourceTable: srcTable,
        sourceColumn: srcCol,
        targetTable: tgtTable,
        targetColumn: tgtCol,
        type: type,
        sourceCardinality: sCard,
        targetCardinality: tCard,
        isIdentifying: isIdentifying,
        attributes: rAttrs,
        extraParticipants: extraParticipants.length > 0 ? extraParticipants : undefined,
        onDelete: onDelete
      });

      const sPos = tablePositions[srcTable] || { x: 80, y: 80 };
      const tPos = tablePositions[tgtTable] || { x: 280, y: 280 };
      relPositions[newRelId] = {
        x: Math.round((sPos.x + tPos.x)/2),
        y: Math.round((sPos.y + tPos.y)/2)
      };

      closeModal('modalRelation');
      renderCanvas();
      recompileAll();
    });

    // ISA Hierarchy Modal Flow
    window.openAddIsa = function(parentName) {
      document.getElementById('modalIsa').style.display = 'flex';
      document.getElementById('btnDeleteIsaModal').style.display = 'none';

      const parentSelect = document.getElementById('isaParentTable');
      parentSelect.innerHTML = '';
      currentSchema.tables.forEach(t => {
        parentSelect.add(new Option(t.name, t.name, false, t.name === parentName));
      });

      renderIsaChildCheckboxes(parentSelect.value, []);
      parentSelect.onchange = () => {
        renderIsaChildCheckboxes(parentSelect.value, []);
      };

      document.getElementById('isaCoverage').value = 'total';
      document.getElementById('isaDisjointness').value = 'disjoint';
      document.getElementById('modalIsa').dataset.editingId = '';
    };

    window.openEditIsa = function(isaId) {
      const isa = (currentSchema.isaHierarchies || []).find(i => i.id === isaId);
      if (!isa) return;

      document.getElementById('modalIsa').style.display = 'flex';
      document.getElementById('btnDeleteIsaModal').style.display = 'inline-block';

      const parentSelect = document.getElementById('isaParentTable');
      parentSelect.innerHTML = '';
      currentSchema.tables.forEach(t => {
        parentSelect.add(new Option(t.name, t.name, false, t.name === isa.parentTable));
      });

      renderIsaChildCheckboxes(isa.parentTable, isa.childTables || []);
      parentSelect.onchange = () => {
        renderIsaChildCheckboxes(parentSelect.value, isa.childTables || []);
      };

      document.getElementById('isaCoverage').value = isa.coverage || 'total';
      document.getElementById('isaDisjointness').value = isa.disjointness || 'disjoint';
      document.getElementById('modalIsa').dataset.editingId = isa.id;
    };

    function renderIsaChildCheckboxes(parentTable, selectedChildren) {
      const container = document.getElementById('isaChildTablesCheckboxes');
      container.innerHTML = '';
      currentSchema.tables.filter(t => t.name !== parentTable).forEach(t => {
        const wrap = document.createElement('label');
        wrap.className = 'checkbox-wrap';
        wrap.style.fontSize = '12px';
        const isChecked = selectedChildren.includes(t.name);
        wrap.innerHTML = \`<input type="checkbox" value="\${t.name}" \${isChecked ? 'checked' : ''} /> \${t.name}\`;
        container.appendChild(wrap);
      });
    }

    document.getElementById('btnSaveIsa').addEventListener('click', () => {
      const parentTable = document.getElementById('isaParentTable').value;
      const coverage = document.getElementById('isaCoverage').value;
      const disjointness = document.getElementById('isaDisjointness').value;
      const editingId = document.getElementById('modalIsa').dataset.editingId;

      const childTables = [];
      document.querySelectorAll('#isaChildTablesCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        childTables.push(cb.value);
      });

      if (childTables.length === 0) {
        return alert('Please select at least one subclass / child entity for the ISA hierarchy.');
      }

      if (!currentSchema.isaHierarchies) currentSchema.isaHierarchies = [];

      if (editingId) {
        const existing = currentSchema.isaHierarchies.find(i => i.id === editingId);
        if (existing) {
          existing.parentTable = parentTable;
          existing.childTables = childTables;
          existing.coverage = coverage;
          existing.disjointness = disjointness;
        }
      } else {
        const id = 'isa_' + Date.now();
        currentSchema.isaHierarchies.push({
          id: id,
          parentTable: parentTable,
          childTables: childTables,
          coverage: coverage,
          disjointness: disjointness
        });

        const pPos = tablePositions[parentTable] || { x: 200, y: 100 };
        const childYs = childTables.map(ct => tablePositions[ct]?.y).filter(y => y !== undefined);
        const childXs = childTables.map(ct => tablePositions[ct]?.x).filter(x => x !== undefined);
        const avgX = childXs.length > 0 ? (pPos.x + childXs.reduce((a, b) => a + b, 0) / childXs.length) / 2 : pPos.x;
        const avgY = childYs.length > 0 ? (pPos.y + Math.min(...childYs)) / 2 : pPos.y + 120;
        isaPositions[id] = { x: Math.round(avgX), y: Math.round(avgY) };
      }

      closeModal('modalIsa');
      renderCanvas();
      recompileAll();
      showToast('Saved ISA Hierarchy (' + coverage + ', ' + disjointness + ')');
    });

    document.getElementById('btnDeleteIsaModal').addEventListener('click', () => {
      const editingId = document.getElementById('modalIsa').dataset.editingId;
      if (editingId && currentSchema.isaHierarchies) {
        currentSchema.isaHierarchies = currentSchema.isaHierarchies.filter(i => i.id !== editingId);
        delete isaPositions[editingId];
        closeModal('modalIsa');
        renderCanvas();
        recompileAll();
        showToast('Deleted ISA Hierarchy');
      }
    });

    // Buttons connecting ISA & Physical Normalization
    const btnNewIsa = document.getElementById('btnNewIsa');
    if (btnNewIsa) {
      btnNewIsa.addEventListener('click', () => {
        openAddIsa(selectedTable || (currentSchema.tables[0]?.name));
      });
    }

    const btnToolbarNewIsa = document.getElementById('btnToolbarNewIsa');
    if (btnToolbarNewIsa) {
      btnToolbarNewIsa.addEventListener('click', () => {
        openAddIsa(selectedTable || (currentSchema.tables[0]?.name));
      });
    }

    const libIsaHierarchy = document.getElementById('libIsaHierarchy');
    if (libIsaHierarchy) {
      libIsaHierarchy.addEventListener('click', () => {
        openAddIsa(selectedTable || (currentSchema.tables[0]?.name));
      });
    }

    const libAttrComposite = document.getElementById('libAttrComposite');
    if (libAttrComposite) {
      libAttrComposite.addEventListener('click', () => {
        const tbl = selectedTable || (currentSchema.tables[0]?.name);
        if (tbl) {
          openAddColumn(tbl);
          document.getElementById('inputColAttrType').value = 'composite';
          document.getElementById('subAttributesSection').style.display = 'block';
        } else {
          alert('Please select or create an entity table first.');
        }
      });
    }

    const btnCompilePhysical = document.getElementById('btnCompilePhysical');
    if (btnCompilePhysical) {
      btnCompilePhysical.addEventListener('click', () => {
        compilePhysicalSchema();
      });
    }

    // Normalizza / Compila in Schema Fisico (Junction Tables generation for N:M / N-Ary)
    window.compilePhysicalSchema = function() {
      const nmRels = currentSchema.relationships.filter(r => r.type === 'N:M' || (r.extraParticipants && r.extraParticipants.length > 0));
      if (nmRels.length === 0) {
        return showToast('Nessuna relazione N:M o N-aria da normalizzare');
      }

      function getTablePk(tableName) {
        const t = currentSchema.tables.find(x => x.name === tableName);
        if (!t) return { name: 'id', type: 'integer' };
        const direct = t.columns.find(c => c.pk || c.attributeType === 'key');
        if (direct) return direct;
        const isa = (currentSchema.isaHierarchies || []).find(h => h.childTables.includes(tableName));
        if (isa) return getTablePk(isa.parentTable);
        return { name: 'id', type: 'integer' };
      }

      nmRels.forEach(rel => {
        const junctionName = (rel.name ? rel.name.toLowerCase() : (rel.sourceTable.toLowerCase() + '_' + rel.targetTable.toLowerCase())) + '_junction';
        if (currentSchema.tables.some(t => t.name.toLowerCase() === junctionName.toLowerCase())) return;

        const srcPk = getTablePk(rel.sourceTable);
        const tgtPk = getTablePk(rel.targetTable);

        const jColumns = [
          { name: rel.sourceTable.toLowerCase() + '_' + srcPk.name, type: srcPk.type, pk: true, attributeType: 'key' },
          { name: rel.targetTable.toLowerCase() + '_' + tgtPk.name, type: tgtPk.type, pk: true, attributeType: 'key' }
        ];

        (rel.extraParticipants || []).forEach(part => {
          const pPk = getTablePk(part.table);
          jColumns.push({
            name: part.table.toLowerCase() + '_' + pPk.name,
            type: pPk.type,
            pk: true,
            attributeType: 'key'
          });
        });

        (rel.attributes || []).forEach(a => {
          jColumns.push({ name: a.name, type: a.type || 'varchar(255)', attributeType: 'normal' });
        });

        currentSchema.tables.push({
          name: junctionName,
          comment: 'Physical junction bridge generated from ' + (rel.name || 'N:M relationship'),
          isWeak: false,
          shapeType: 'table',
          columns: jColumns
        });

        const sPos = tablePositions[rel.sourceTable] || { x: 100, y: 100 };
        const tPos = tablePositions[rel.targetTable] || { x: 300, y: 300 };
        tablePositions[junctionName] = {
          x: Math.round((sPos.x + tPos.x)/2),
          y: Math.round((sPos.y + tPos.y)/2) + 60
        };

        currentSchema.relationships.push({
          id: 'rel_j_' + Date.now() + '_1',
          sourceTable: rel.sourceTable,
          sourceColumn: srcPk.name,
          targetTable: junctionName,
          targetColumn: rel.sourceTable.toLowerCase() + '_' + srcPk.name,
          type: '1:N',
          onDelete: 'CASCADE'
        });
        currentSchema.relationships.push({
          id: 'rel_j_' + Date.now() + '_2',
          sourceTable: rel.targetTable,
          sourceColumn: tgtPk.name,
          targetTable: junctionName,
          targetColumn: rel.targetTable.toLowerCase() + '_' + tgtPk.name,
          type: '1:N',
          onDelete: 'CASCADE'
        });

        currentSchema.relationships = currentSchema.relationships.filter(r => r.id !== rel.id);
      });

      renderCanvas();
      recompileAll();
      showToast('Schema fisico compilato: generate tabelle di giunzione!');
    };

    // Schema Objects Explorer Popup
    document.getElementById('btnOpenExplorer').addEventListener('click', () => {
      renderExplorerTable();
      openModal('modalExplorer');
    });

    function renderExplorerTable(filter = '') {
      const tbody = document.getElementById('explorerTableBody');
      tbody.innerHTML = '';
      const f = filter.toLowerCase().trim();

      const filteredTables = currentSchema.tables.filter(t => {
        if (!f) return true;
        return t.name.toLowerCase().includes(f) || t.columns.some(c => c.name.toLowerCase().includes(f));
      });

      filteredTables.forEach(t => {
        const pkCol = t.columns.find(c => c.pk)?.name || '-';
        const incoming = currentSchema.relationships
          .filter(r => r.targetTable === t.name)
          .map(r => \`\${r.sourceTable}.\${r.sourceColumn}\`)
          .join(', ') || 'none';

        const tr = document.createElement('tr');
        const typeLabel = t.isWeak ? '<span style="color:#38bdf8; font-weight:700;">WEAK ENTITY</span>' : '<span style="color:var(--muted);">STANDARD</span>';

        tr.innerHTML = \`
          <td style="font-weight:700; color:var(--text);">\${t.name}</td>
          <td>\${typeLabel}</td>
          <td>\${t.columns.length} columns</td>
          <td style="color:var(--accent);">\${pkCol}</td>
          <td style="color:var(--info);">\${incoming}</td>
          <td>
            <button class="btn btn-sm" onclick="closeModal('modalExplorer'); selectedTable='\${t.name}'; renderCanvas();">FOCUS</button>
            <button class="btn btn-sm btn-danger" onclick="deleteTable('\${t.name}'); renderExplorerTable();">DELETE</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      let totalCols = 0;
      currentSchema.tables.forEach(t => totalCols += t.columns.length);
      document.getElementById('explorerSummary').innerText = \`\${currentSchema.tables.length} Tables, \${totalCols} Columns\`;
    }

    document.getElementById('filterExplorerInput').addEventListener('input', (e) => {
      renderExplorerTable(e.target.value);
    });

    // Compilers
    function compileSql(schema, dialect) {
      const lines = [];
      lines.push(\`-- -----------------------------------------------------\`);
      lines.push(\`-- Schema: \${schema.title || 'Relay SQL Schema'}\`);
      lines.push(\`-- Dialect: \${dialect.toUpperCase()}\`);
      lines.push(\`-- Generated by RELAY Studio\`);
      lines.push(\`-- -----------------------------------------------------\\n\`);

      if (dialect === 'postgres') {
        lines.push(\`CREATE EXTENSION IF NOT EXISTS "pgcrypto";\\n\`);
      } else if (dialect === 'sqlite') {
        lines.push(\`PRAGMA foreign_keys = ON;\\n\`);
      }

      for (const table of schema.tables) {
        const weakComment = table.isWeak ? ' [WEAK ENTITY]' : '';
        const desc = table.comment ? \` (\${table.comment})\` : '';
        lines.push(\`-- Table: \${table.name}\${weakComment}\${desc}\`);
        lines.push(\`CREATE TABLE IF NOT EXISTS "\${table.name}" (\`);
        const colDefs = [];

        for (const col of table.columns) {
          let cStr = \`  "\${col.name}" \${mapType(col.type, dialect)}\`;
          if (col.pk) cStr += ' PRIMARY KEY';
          if (col.unique && !col.pk) cStr += ' UNIQUE';
          if (col.nullable === false) cStr += ' NOT NULL';
          if (col.defaultVal) cStr += \` DEFAULT \${mapDefault(col.defaultVal, dialect)}\`;
          colDefs.push(cStr);
        }

        const incomingFks = schema.relationships.filter(r => r.targetTable === table.name);
        for (const rel of incomingFks) {
          let fkStr = \`  CONSTRAINT "fk_\${table.name}_\${rel.targetColumn}" FOREIGN KEY ("\${rel.targetColumn}") REFERENCES "\${rel.sourceTable}" ("\${rel.sourceColumn}")\`;
          if (rel.onDelete) fkStr += \` ON DELETE \${rel.onDelete}\`;
          colDefs.push(fkStr);
        }

        lines.push(colDefs.join(',\\n'));
        lines.push(\`);\\n\`);
      }

      return lines.join('\\n');
    }

    function mapType(t, dialect) {
      t = t.toLowerCase().trim();
      if (dialect === 'sqlite') {
        if (t.includes('serial') || t.includes('int')) return 'INTEGER';
        if (t.includes('char') || t.includes('text') || t === 'uuid' || t.includes('json')) return 'TEXT';
        if (t.includes('bool')) return 'INTEGER';
        return 'TEXT';
      }
      if (dialect === 'mysql') {
        if (t === 'serial' || t === 'bigserial') return 'BIGINT UNSIGNED AUTO_INCREMENT';
        if (t === 'uuid') return 'VARCHAR(36)';
        if (t === 'jsonb') return 'JSON';
        if (t === 'boolean') return 'TINYINT(1)';
        return t;
      }
      return t;
    }

    function mapDefault(val, dialect) {
      if (dialect === 'sqlite' && val.includes('uuid')) return "'00000000-0000-0000-0000-000000000000'";
      if (dialect === 'mysql' && val.includes('uuid')) return '(UUID())';
      return val;
    }

    function compileMermaid(schema) {
      const lines = ['erDiagram'];
      for (const t of schema.tables) {
        lines.push(\`    \${t.name} {\`);
        for (const c of t.columns) {
          const pkMarker = c.pk ? 'PK' : '';
          const fkMarker = schema.relationships.some(r => r.targetTable === t.name && r.targetColumn === c.name) ? 'FK' : '';
          const marker = (pkMarker && fkMarker) ? 'PK,FK' : (pkMarker || fkMarker || '');
          lines.push(\`        \${c.type.replace(/[^a-zA-Z0-9_]/g, '_')} \${c.name} \${marker}\`);
        }
        lines.push('    }');
      }
      for (const r of schema.relationships) {
        const symbol = r.type === '1:1' ? '||--||' : (r.type === 'N:M' ? '}o--o{' : '||--o{');
        const ident = r.isIdentifying ? ' [identifying]' : '';
        lines.push(\`    \${r.sourceTable} \${symbol} \${r.targetTable} : "\${r.targetColumn}\${ident}"\`);
      }
      return lines.join('\\n');
    }

    ${cleanIdentifier.toString()}

    ${splitTopLevel.toString()}

    ${parseMermaid.toString()}

    ${parseSqlDdl.toString()}

    function compileDbml(schema) {
      const lines = [];
      for (const t of schema.tables) {
        const weakNote = t.isWeak ? ' [weak entity]' : '';
        lines.push(\`Table \${t.name} {\`);
        for (const c of t.columns) {
          const tags = [];
          if (c.pk) tags.push('pk');
          if (c.unique) tags.push('unique');
          if (c.defaultVal) tags.push('default: ' + String.fromCharCode(96) + c.defaultVal + String.fromCharCode(96));
          const tagStr = tags.length ? \` [\${tags.join(', ')}]\` : '';
          lines.push(\`  \${c.name} \${c.type}\${tagStr}\`);
        }
        if (t.comment || t.isWeak) {
          lines.push(\`  Note: '\${(t.comment || '') + weakNote}'\`);
        }
        lines.push('}\\n');
      }
      for (const r of schema.relationships) {
        const sym = r.type === '1:1' ? '-' : '<';
        lines.push(\`Ref: \${r.targetTable}.\${r.targetColumn} \${sym} \${r.sourceTable}.\${r.sourceColumn}\`);
      }
      return lines.join('\\n');
    }

    function generateLogicalAnalysis(schema) {
      const lines = [];
      lines.push(\`# LOGICAL DATA MODEL ANALYSIS: \${(schema.title || 'SCHEMA').toUpperCase()}\\n\`);
      if (schema.description) {
        lines.push(\`*\${schema.description}*\\n\`);
      }

      lines.push(\`## 1. ENTITIES AND ATTRIBUTES SPECIFICATION\\n\`);
      for (const table of schema.tables) {
        const weakBadge = table.isWeak ? ' **[WEAK ENTITY - DOUBLE BORDER]**' : '';
        lines.push(\`### Entity: \${table.name}\${weakBadge}\`);
        if (table.comment) {
          lines.push(\`> Description: \${table.comment}\\n\`);
        }
        lines.push(\`| Attribute | Type | Key | Constraints | Default |\`);
        lines.push(\`| :--- | :--- | :--- | :--- | :--- |\`);
        for (const col of table.columns) {
          const isPk = col.pk ? 'PK' : '';
          const isFk = schema.relationships.some(r => r.targetTable === table.name && r.targetColumn === col.name) ? 'FK' : '';
          const keyLabel = (isPk && isFk) ? 'PK, FK' : (isPk || isFk || '-');
          const constraints = [
            col.nullable === false ? 'NOT NULL' : 'NULLABLE',
            col.unique ? 'UNIQUE' : ''
          ].filter(Boolean).join(', ');
          lines.push(\`| \${col.name} | \${col.type} | \${keyLabel} | \${constraints} | \${col.defaultVal || '-'} |\`);
        }
        lines.push('');
      }

      lines.push(\`## 2. RELATIONSHIPS AND REFERENTIAL INTEGRITY RULES\\n\`);
      if (schema.relationships.length === 0) {
        lines.push('No relationships defined.');
      } else {
        lines.push(\`| Source (Owner) | Target (FK) | Cardinality | Identifying | On Delete | On Update |\`);
        lines.push(\`| :--- | :--- | :--- | :--- | :--- | :--- |\`);
        for (const rel of schema.relationships) {
          const isIdent = rel.isIdentifying ? 'YES (Weak ID)' : 'NO';
          lines.push(\`| \${rel.sourceTable}.\${rel.sourceColumn} | \${rel.targetTable}.\${rel.targetColumn} | \${rel.type} | \${isIdent} | \${rel.onDelete || 'NO ACTION'} | \${rel.onUpdate || 'NO ACTION'} |\`);
        }
      }

      const telem = calculateTelemetry(schema);
      lines.push(\`\\n## 3. NORMALIZATION EVALUATION AND COMPLEXITY METRICS\\n\`);
      lines.push(\`- Total Entities: \${telem.tableCount} (\${telem.weakEntityCount} Weak Entities)\`);
      lines.push(\`- Total Attributes: \${telem.columnCount}\`);
      lines.push(\`- Primary Keys: \${telem.pkCount}\`);
      lines.push(\`- Foreign Keys: \${telem.fkCount}\`);
      lines.push(\`- Estimated Normalization Level: \${telem.normalizationLevel}\`);
      lines.push(\`- McCabe Cyclomatic Complexity (M = E - V + 2P): \${telem.cyclomatic}\`);
      lines.push(\`- Cardinality Ratios: 1:1 = \${telem.oneToOne}, 1:N = \${telem.oneToMany}, N:M = \${telem.manyToMany}\`);

      return lines.join('\\n');
    }

    // Pure Client-Side DOCX Generation
    function exportDocxFile(schema) {
      function crc32(buf) {
        const table = new Uint32Array(256);
        for (let i = 0; i < 256; i++) {
          let c = i;
          for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
          table[i] = c;
        }
        let c = -1;
        for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF];
        return (c ^ -1) >>> 0;
      }

      function createZip(files) {
        const encoder = new TextEncoder();
        const chunks = [];
        const cdEntries = [];
        let offset = 0;

        for (const f of files) {
          const nameBytes = encoder.encode(f.name);
          const dataBytes = typeof f.data === 'string' ? encoder.encode(f.data) : f.data;
          const crc = crc32(dataBytes);
          const size = dataBytes.length;

          const lh = new Uint8Array(30);
          const lv = new DataView(lh.buffer);
          lv.setUint32(0, 0x04034b50, true);
          lv.setUint16(4, 20, true);
          lv.setUint16(6, 0, true);
          lv.setUint16(8, 0, true);
          lv.setUint16(10, 0, true);
          lv.setUint16(12, 0, true);
          lv.setUint32(14, crc, true);
          lv.setUint32(18, size, true);
          lv.setUint32(22, size, true);
          lv.setUint16(26, nameBytes.length, true);
          lv.setUint16(28, 0, true);

          const localOffset = offset;
          chunks.push(lh, nameBytes, dataBytes);
          offset += lh.length + nameBytes.length + dataBytes.length;

          const cd = new Uint8Array(46);
          const cv = new DataView(cd.buffer);
          cv.setUint32(0, 0x02014b50, true);
          cv.setUint16(4, 20, true);
          cv.setUint16(6, 20, true);
          cv.setUint16(8, 0, true);
          cv.setUint16(10, 0, true);
          cv.setUint16(12, 0, true);
          cv.setUint16(14, 0, true);
          cv.setUint32(16, crc, true);
          cv.setUint32(20, size, true);
          cv.setUint32(24, size, true);
          cv.setUint16(28, nameBytes.length, true);
          cv.setUint16(30, 0, true);
          cv.setUint16(32, 0, true);
          cv.setUint16(34, 0, true);
          cv.setUint16(36, 0, true);
          cv.setUint32(38, 0, true);
          cv.setUint32(42, localOffset, true);

          cdEntries.push(cd, nameBytes);
        }

        const cdOffset = offset;
        let cdSize = 0;
        for (const c of cdEntries) cdSize += c.length;

        const eocd = new Uint8Array(22);
        const ev = new DataView(eocd.buffer);
        ev.setUint32(0, 0x06054b50, true);
        ev.setUint16(4, 0, true);
        ev.setUint16(6, 0, true);
        ev.setUint16(8, files.length, true);
        ev.setUint16(10, files.length, true);
        ev.setUint32(12, cdSize, true);
        ev.setUint32(16, cdOffset, true);
        ev.setUint16(20, 0, true);

        const allParts = [...chunks, ...cdEntries, eocd];
        let totalLen = 0;
        for (const p of allParts) totalLen += p.length;
        const result = new Uint8Array(totalLen);
        let ptr = 0;
        for (const p of allParts) {
          result.set(p, ptr);
          ptr += p.length;
        }
        return result;
      }

      const contentTypesXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\\n  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\\n  <Default Extension="xml" ContentType="application/xml"/>\\n  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\\n</Types>';
      const rootRelsXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\\n  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\\n</Relationships>';

      let docBody = '';
      function addPara(text, size = 22, bold = false, color = '111827') {
        const bTag = bold ? '<w:b/>' : '';
        docBody += \`<w:p><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:rPr>\${bTag}<w:sz w:val="\${size}"/><w:color w:val="\${color}"/></w:rPr><w:t>\${escapeXml(text)}</w:t></w:r></w:p>\`;
      }
      function addHeading(text, size = 26) {
        docBody += \`<w:p><w:pPr><w:spacing w:before="240" w:after="120"/></w:pPr><w:r><w:rPr><w:b/><w:sz w:val="\${size}"/><w:color w:val="10B981"/></w:rPr><w:t>\${escapeXml(text)}</w:t></w:r></w:p>\`;
      }
      function escapeXml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
      }

      addHeading(\`LOGICAL DATA MODEL ANALYSIS: \${(schema.title || 'SCHEMA').toUpperCase()}\`, 32);
      if (schema.description) {
        addPara(schema.description, 20, false, '6B7280');
      }

      addHeading('1. ENTITIES AND ATTRIBUTES SPECIFICATION', 26);
      for (const t of schema.tables) {
        const weakTag = t.isWeak ? ' [WEAK ENTITY - DOUBLE BORDER]' : '';
        addHeading(\`Entity: \${t.name}\${weakTag}\`, 22);
        if (t.comment) addPara(\`Description: \${t.comment}\`, 18, false, '6B7280');

        docBody += '<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="none"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="EEEEEE"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>';
        
        docBody += '<w:tr>';
        ['Attribute', 'Type', 'Key', 'Nullability', 'Default'].forEach(h => {
          docBody += \`<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/><w:tcMar><w:top w:w="120"/><w:bottom w:w="120"/><w:left w:w="160"/><w:right w:w="160"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>\${h}</w:t></w:r></w:p></w:tc>\`;
        });
        docBody += '</w:tr>';

        for (const c of t.columns) {
          const isPk = c.pk ? 'PK' : '';
          const isFk = schema.relationships.some(r => r.targetTable === t.name && r.targetColumn === c.name) ? 'FK' : '';
          const keyLabel = (isPk && isFk) ? 'PK, FK' : (isPk || isFk || '-');
          const nullLabel = c.nullable === false ? 'NOT NULL' : 'NULLABLE';

          docBody += '<w:tr>';
          [c.name, c.type, keyLabel, nullLabel, c.defaultVal || '-'].forEach(val => {
            docBody += \`<w:tc><w:tcPr><w:tcMar><w:top w:w="100"/><w:bottom w:w="100"/><w:left w:w="160"/><w:right w:w="160"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>\${escapeXml(val)}</w:t></w:r></w:p></w:tc>\`;
          });
          docBody += '</w:tr>';
        }
        docBody += '</w:tbl>';
      }

      addHeading('2. RELATIONSHIPS AND REFERENTIAL INTEGRITY', 26);
      if (schema.relationships.length > 0) {
        docBody += '<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:left w:val="none"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/><w:right w:val="none"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="EEEEEE"/><w:insideV w:val="none"/></w:tblBorders></w:tblPr>';
        docBody += '<w:tr>';
        ['Source', 'Target', 'Cardinality', 'Identifying', 'On Delete'].forEach(h => {
          docBody += \`<w:tc><w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F3F4F6"/><w:tcMar><w:top w:w="120"/><w:bottom w:w="120"/><w:left w:w="160"/><w:right w:w="160"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr><w:b/><w:sz w:val="18"/></w:rPr><w:t>\${h}</w:t></w:r></w:p></w:tc>\`;
        });
        docBody += '</w:tr>';

        for (const r of schema.relationships) {
          docBody += '<w:tr>';
          [\`\${r.sourceTable}.\${r.sourceColumn}\`, \`\${r.targetTable}.\${r.targetColumn}\`, r.type, r.isIdentifying ? 'YES (Weak)' : 'NO', r.onDelete || 'NO ACTION'].forEach(v => {
            docBody += \`<w:tc><w:tcPr><w:tcMar><w:top w:w="100"/><w:bottom w:w="100"/><w:left w:w="160"/><w:right w:w="160"/></w:tcMar></w:tcPr><w:p><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>\${escapeXml(v)}</w:t></w:r></w:p></w:tc>\`;
          });
          docBody += '</w:tr>';
        }
        docBody += '</w:tbl>';
      } else {
        addPara('No relationships defined.', 20);
      }

      const telem = calculateTelemetry(schema);
      addHeading('3. NORMALIZATION EVALUATION AND METRICS', 26);
      addPara(\`Total Entities: \${telem.tableCount} (\${telem.weakEntityCount} Weak Entities)\`, 20);
      addPara(\`Total Attributes: \${telem.columnCount}\`, 20);
      addPara(\`Primary Keys: \${telem.pkCount}\`, 20);
      addPara(\`Foreign Keys: \${telem.fkCount}\`, 20);
      addPara(\`Normalization Level: \${telem.normalizationLevel}\`, 20, true);
      addPara(\`McCabe Cyclomatic Complexity: \${telem.cyclomatic}\`, 20);

      const documentXml = \`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\\n<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\\n  <w:body>\\n\${docBody}\\n  </w:body>\\n</w:document>\`;

      const zipBytes = createZip([
        { name: '[Content_Types].xml', data: contentTypesXml },
        { name: '_rels/.rels', data: rootRelsXml },
        { name: 'word/document.xml', data: documentXml }
      ]);

      const blob = new Blob([zipBytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = \`\${(schema.title || 'schema_analysis').toLowerCase().replace(/\\s+/g, '_')}_analysis.docx\`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function calculateTelemetry(schema) {
      let colCount = 0;
      let pkCount = 0;
      let fkCount = schema.relationships.length;
      let weakCount = schema.tables.filter(t => t.isWeak).length;

      schema.tables.forEach(t => {
        colCount += t.columns.length;
        pkCount += t.columns.filter(c => c.pk).length;
      });

      const cyclomatic = Math.max(1, schema.relationships.length - schema.tables.length + 2);
      const tablesWithPk = schema.tables.filter(t => t.columns.some(c => c.pk)).length;
      let norm = '1NF';
      if (tablesWithPk === schema.tables.length && schema.tables.length > 0) {
        norm = '3NF / BCNF';
      }

      return {
        tableCount: schema.tables.length,
        weakEntityCount: weakCount,
        columnCount: colCount,
        pkCount,
        fkCount,
        cyclomatic,
        normalizationLevel: norm,
        oneToOne: schema.relationships.filter(r => r.type === '1:1').length,
        oneToMany: schema.relationships.filter(r => r.type === '1:N').length,
        manyToMany: schema.relationships.filter(r => r.type === 'N:M').length
      };
    }

    function recompileAll() {
      // SQL
      const sql = compileSql(currentSchema, currentDialect);
      document.getElementById('codeSql').textContent = sql;

      // Mermaid
      const mmd = compileMermaid(currentSchema);
      const mmdEl = document.getElementById('codeMermaid');
      if (mmdEl) {
        if (document.activeElement !== mmdEl) {
          mmdEl.value = mmd;
        }
        mmdEl.textContent = mmd;
      }

      // DBML
      const dbml = compileDbml(currentSchema);
      document.getElementById('codeDbml').textContent = dbml;

      // Analysis
      const analysis = generateLogicalAnalysis(currentSchema);
      document.getElementById('codeAnalysis').textContent = analysis;

      // Telemetry
      const telem = calculateTelemetry(currentSchema);
      document.getElementById('metricTables').innerText = telem.tableCount;
      document.getElementById('metricWeak').innerText = telem.weakEntityCount;
      document.getElementById('metricColumns').innerText = telem.columnCount;
      document.getElementById('metricPks').innerText = telem.pkCount;
      document.getElementById('metricFks').innerText = telem.fkCount;
      document.getElementById('metricCyclomatic').innerText = telem.cyclomatic;
      document.getElementById('metricNormal').innerText = telem.normalizationLevel;
      document.getElementById('metric1to1').innerText = telem.oneToOne;
      document.getElementById('metric1toN').innerText = telem.oneToMany;
      document.getElementById('metricNtoM').innerText = telem.manyToMany;
    }

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab');
        document.getElementById('pane-' + tab).classList.add('active');
      });
    });

    // Dialect Change
    document.getElementById('dialectSelector').addEventListener('change', (e) => {
      currentDialect = e.target.value;
      recompileAll();
    });

    // Template Change
    document.getElementById('templateSelector').addEventListener('change', (e) => {
      const key = e.target.value;
      if (TEMPLATES[key]) {
        currentSchema = JSON.parse(JSON.stringify(TEMPLATES[key]));
        initLayout();
        renderCanvas();
        recompileAll();
      }
    });

    // Copy Handlers
    function copyText(elemId, btn) {
      const el = document.getElementById(elemId);
      const text = (el && el.value !== undefined) ? el.value : (el ? el.textContent : '');
      navigator.clipboard.writeText(text).then(() => {
        const orig = btn.innerText;
        btn.innerText = 'COPIED!';
        setTimeout(() => { btn.innerText = orig; }, 1500);
      });
    }
    document.getElementById('btnCopySql').addEventListener('click', function() { copyText('codeSql', this); });
    document.getElementById('btnCopyMermaid').addEventListener('click', function() { copyText('codeMermaid', this); });
    document.getElementById('btnCopyDbml').addEventListener('click', function() { copyText('codeDbml', this); });
    document.getElementById('btnCopyAnalysis').addEventListener('click', function() { copyText('codeAnalysis', this); });
    document.getElementById('btnExportDocx').addEventListener('click', function() { exportDocxFile(currentSchema); });

    // Workspace Sticky Notes Buttons
    const btnNewNote = document.getElementById('btnNewNote');
    if (btnNewNote) btnNewNote.addEventListener('click', () => createNote());

    const btnToolbarNewNote = document.getElementById('btnToolbarNewNote');
    if (btnToolbarNewNote) btnToolbarNewNote.addEventListener('click', () => createNote());

    const libStickyNote = document.getElementById('libStickyNote');
    if (libStickyNote) libStickyNote.addEventListener('click', () => createNote());

    // Modal Relation Cardinality Presets & Clipboard
    window.applyCardinalityToModal = function(src, tgt, type) {
      if (src) document.getElementById('relSourceCard').value = src;
      if (tgt) document.getElementById('relTargetCard').value = tgt;
      if (type) document.getElementById('relType').value = type;
    };

    const btnModalCopyCard = document.getElementById('btnModalCopyCard');
    if (btnModalCopyCard) {
      btnModalCopyCard.addEventListener('click', () => {
        const s = document.getElementById('relSourceCard').value;
        const t = document.getElementById('relTargetCard').value;
        copiedCardinality = { source: s, target: t };
        showToast('Copied modal cardinalities: ' + s + ' - ' + t);
      });
    }

    const btnModalPasteCard = document.getElementById('btnModalPasteCard');
    if (btnModalPasteCard) {
      btnModalPasteCard.addEventListener('click', () => {
        if (!copiedCardinality) return showToast('No cardinality copied yet');
        document.getElementById('relSourceCard').value = copiedCardinality.source;
        document.getElementById('relTargetCard').value = copiedCardinality.target;
        showToast('Pasted cardinalities: ' + copiedCardinality.source + ' - ' + copiedCardinality.target);
      });
    }

    const btnModalSwapCard = document.getElementById('btnModalSwapCard');
    if (btnModalSwapCard) {
      btnModalSwapCard.addEventListener('click', () => {
        const s = document.getElementById('relSourceCard').value;
        const t = document.getElementById('relTargetCard').value;
        document.getElementById('relSourceCard').value = t;
        document.getElementById('relTargetCard').value = s;
        showToast('Swapped modal cardinalities: ' + t + ' - ' + s);
      });
    }

    // Sidebar Cardinality Shortcuts (Copy / Paste / Swap)
    const btnSidebarCopyCard = document.getElementById('btnSidebarCopyCard');
    if (btnSidebarCopyCard) {
      btnSidebarCopyCard.addEventListener('click', () => {
        if (!selectedRel) return alert('Please select a relationship diamond on canvas first');
        const r = currentSchema.relationships.find(x => x.id === selectedRel);
        if (r) {
          copiedCardinality = { source: r.sourceCardinality || '(1,1)', target: r.targetCardinality || '(0,N)' };
          showToast('Copied relationship cardinality: ' + copiedCardinality.source + ' - ' + copiedCardinality.target);
        }
      });
    }

    const btnSidebarPasteCard = document.getElementById('btnSidebarPasteCard');
    if (btnSidebarPasteCard) {
      btnSidebarPasteCard.addEventListener('click', () => {
        if (!copiedCardinality) return showToast('No cardinality copied yet. Click COPY first.');
        if (!selectedRel) return alert('Please select a relationship diamond on canvas first');
        const r = currentSchema.relationships.find(x => x.id === selectedRel);
        if (r) {
          r.sourceCardinality = copiedCardinality.source;
          r.targetCardinality = copiedCardinality.target;
          renderConnections();
          renderRelationsList();
          recompileAll();
          showToast('Pasted cardinality to ' + (r.name || 'relation') + ': ' + r.sourceCardinality + ' - ' + r.targetCardinality);
        }
      });
    }

    const btnSidebarSwapCard = document.getElementById('btnSidebarSwapCard');
    if (btnSidebarSwapCard) {
      btnSidebarSwapCard.addEventListener('click', () => {
        if (!selectedRel) return alert('Please select a relationship diamond on canvas first');
        const r = currentSchema.relationships.find(x => x.id === selectedRel);
        if (r) {
          const tmp = r.sourceCardinality || '(1,1)';
          r.sourceCardinality = r.targetCardinality || '(0,N)';
          r.targetCardinality = tmp;
          renderConnections();
          renderRelationsList();
          recompileAll();
          showToast('Swapped cardinalities for ' + (r.name || 'relation') + ': ' + r.sourceCardinality + ' - ' + r.targetCardinality);
        }
      });
    }

    // Universal SQL DDL, Mermaid & JSON Import Modal
    let importMode = 'sql';

    function setImportMode(mode) {
      importMode = mode;
      const btnSql = document.getElementById('btnImportTabSql');
      const btnMermaid = document.getElementById('btnImportTabMermaid');
      const btnJson = document.getElementById('btnImportTabJson');

      if (btnSql) btnSql.className = mode === 'sql' ? 'btn btn-sm btn-accent' : 'btn btn-sm';
      if (btnMermaid) btnMermaid.className = mode === 'mermaid' ? 'btn btn-sm btn-accent' : 'btn btn-sm';
      if (btnJson) btnJson.className = mode === 'json' ? 'btn btn-sm btn-accent' : 'btn btn-sm';

      const codeArea = document.getElementById('importCodeArea');
      if (mode === 'sql') {
        codeArea.placeholder = 'CREATE TABLE users (\\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\\n    email VARCHAR(255) NOT NULL UNIQUE\\n);\\n\\nCREATE TABLE orders (\\n    id SERIAL PRIMARY KEY,\\n    user_id UUID REFERENCES users(id) ON DELETE CASCADE\\n);';
      } else if (mode === 'mermaid') {
        codeArea.placeholder = 'erDiagram\\n    CUSTOMER ||--o{ ORDER : places\\n    CUSTOMER {\\n        uuid id PK\\n        string email UK\\n    }\\n    ORDER {\\n        uuid id PK\\n        uuid customer_id FK\\n    }';
      } else {
        codeArea.placeholder = '{\\n  "title": "My Schema",\\n  "tables": [...],\\n  "relationships": [...]\\n}';
      }
      validateImportPreview();
    }

    const btnImportTabSql = document.getElementById('btnImportTabSql');
    if (btnImportTabSql) btnImportTabSql.addEventListener('click', () => setImportMode('sql'));

    const btnImportTabMermaid = document.getElementById('btnImportTabMermaid');
    if (btnImportTabMermaid) btnImportTabMermaid.addEventListener('click', () => setImportMode('mermaid'));

    const btnImportTabJson = document.getElementById('btnImportTabJson');
    if (btnImportTabJson) btnImportTabJson.addEventListener('click', () => setImportMode('json'));

    const btnOpenImportModal = document.getElementById('btnOpenImportModal');
    if (btnOpenImportModal) {
      btnOpenImportModal.addEventListener('click', () => {
        openModal('modalImport');
        validateImportPreview();
      });
    }

    const btnToolbarImport = document.getElementById('btnToolbarImport');
    if (btnToolbarImport) {
      btnToolbarImport.addEventListener('click', () => {
        openModal('modalImport');
        validateImportPreview();
      });
    }

    const btnToggleRouting = document.getElementById('btnToggleRouting');
    if (btnToggleRouting) {
      btnToggleRouting.addEventListener('click', () => {
        connectorRouting = connectorRouting === 'ortho' ? 'direct' : 'ortho';
        btnToggleRouting.innerText = 'ROUTING: ' + (connectorRouting === 'ortho' ? 'SMART ORTHO' : 'DIRECT');
        btnToggleRouting.classList.toggle('btn-accent', connectorRouting === 'ortho');
        renderConnections();
        showToast('Switched routing to ' + (connectorRouting === 'ortho' ? 'Smart Orthogonal (Manhattan)' : 'Direct Lines'));
      });
    }

    const btnChooseFile = document.getElementById('btnChooseFile');
    if (btnChooseFile) {
      btnChooseFile.addEventListener('click', () => {
        document.getElementById('fileUniversalImport').click();
      });
    }

    const fileUniversalImport = document.getElementById('fileUniversalImport');
    if (fileUniversalImport) {
      fileUniversalImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const text = evt.target.result;
          document.getElementById('importCodeArea').value = text;
          if (file.name.endsWith('.sql') || /CREATE\s+TABLE/i.test(text)) {
            setImportMode('sql');
          } else if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
            setImportMode('json');
          } else {
            setImportMode('mermaid');
          }
          validateImportPreview();
        };
        reader.readAsText(file);
      });
    }

    const importCodeArea = document.getElementById('importCodeArea');
    if (importCodeArea) {
      importCodeArea.addEventListener('input', () => {
        validateImportPreview();
      });
    }

    function validateImportPreview() {
      const code = document.getElementById('importCodeArea').value.trim();
      const badge = document.getElementById('importStatsBadge');
      const statusText = document.getElementById('importStatusText');
      if (!code) {
        if (badge) badge.innerText = 'Ready';
        if (statusText) statusText.innerText = 'Paste SQL DDL, Mermaid erDiagram or JSON schema:';
        return;
      }
      try {
        if (importMode === 'sql' || /CREATE\s+TABLE/i.test(code)) {
          const parsed = parseSqlDdl(code);
          const tCount = parsed.tables.length;
          const rCount = parsed.relationships.length;
          if (badge) badge.innerText = tCount + ' Tables, ' + rCount + ' Rel';
          if (statusText) statusText.innerText = 'Valid SQL DDL schema (' + (parsed.title || 'SQL Schema') + ')';
        } else if (importMode === 'mermaid' || code.toLowerCase().startsWith('erdiagram') || code.includes('{')) {
          const parsed = parseMermaid(code);
          const tCount = parsed.tables.length;
          const rCount = parsed.relationships.length;
          if (badge) badge.innerText = tCount + ' Tables, ' + rCount + ' Rel';
          if (statusText) statusText.innerText = 'Valid Mermaid ER syntax (' + (parsed.title || 'ER Schema') + ')';
        } else {
          const parsed = JSON.parse(code);
          const tCount = (parsed.tables || []).length;
          const rCount = (parsed.relationships || []).length;
          if (badge) badge.innerText = tCount + ' Tables, ' + rCount + ' Rel';
          if (statusText) statusText.innerText = 'Valid JSON schema (' + (parsed.title || 'Schema') + ')';
        }
      } catch (err) {
        if (badge) badge.innerText = 'Syntax Error';
        if (statusText) statusText.innerText = err.message;
      }
    }

    const btnLoadSqlSample = document.getElementById('btnLoadSqlSample');
    if (btnLoadSqlSample) {
      btnLoadSqlSample.addEventListener('click', () => {
        setImportMode('sql');
        const sqlSample = [
          '-- E-Commerce & Inventory Schema (SQL DDL)',
          'CREATE TABLE customers (',
          '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '    email VARCHAR(255) NOT NULL UNIQUE,',
          '    full_name VARCHAR(120) NOT NULL,',
          '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
          ');',
          '',
          'CREATE TABLE categories (',
          '    id SERIAL PRIMARY KEY,',
          '    name VARCHAR(100) NOT NULL UNIQUE,',
          '    description TEXT',
          ');',
          '',
          'CREATE TABLE products (',
          '    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),',
          '    category_id INT NOT NULL,',
          '    sku VARCHAR(64) NOT NULL UNIQUE,',
          '    name VARCHAR(200) NOT NULL,',
          '    price DECIMAL(10, 2) NOT NULL,',
          '    stock_qty INT DEFAULT 0,',
          '    CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT',
          ');',
          '',
          'CREATE TABLE orders (',
          '    id SERIAL PRIMARY KEY,',
          '    customer_id UUID NOT NULL,',
          "    status VARCHAR(40) DEFAULT 'pending',",
          '    total_amount DECIMAL(10, 2) NOT NULL,',
          '    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,',
          '    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE',
          ');',
          '',
          'CREATE TABLE order_items (',
          '    order_id INT NOT NULL,',
          '    product_id UUID NOT NULL,',
          '    quantity INT DEFAULT 1,',
          '    unit_price DECIMAL(10, 2) NOT NULL,',
          '    PRIMARY KEY (order_id, product_id),',
          '    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,',
          '    CONSTRAINT fk_item_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT',
          ');'
        ].join('\\n');
        document.getElementById('importCodeArea').value = sqlSample;
        validateImportPreview();
      });
    }

    const btnLoadMermaidSample = document.getElementById('btnLoadMermaidSample');
    if (btnLoadMermaidSample) {
      btnLoadMermaidSample.addEventListener('click', () => {
        setImportMode('mermaid');
        const sample = [
          'erDiagram',
          '    %% E-Commerce & Inventory Schema',
          '    CUSTOMER ||--o{ ORDER : places',
          '    ORDER ||--|{ ORDER_ITEM : contains',
          '    PRODUCT ||--o{ ORDER_ITEM : "ordered in"',
          '    CATEGORY ||--o{ PRODUCT : categorizes',
          '',
          '    CUSTOMER {',
          '        uuid id PK',
          '        string email UK "Customer contact email"',
          '        string full_name',
          '        timestamp created_at',
          '    }',
          '',
          '    ORDER {',
          '        uuid id PK',
          '        uuid customer_id FK',
          '        string status "pending, shipped, delivered"',
          '        decimal total_amount',
          '        timestamp order_date',
          '    }',
          '',
          '    ORDER_ITEM {',
          '        uuid id PK',
          '        uuid order_id FK',
          '        uuid product_id FK',
          '        int quantity',
          '        decimal unit_price',
          '    }',
          '',
          '    PRODUCT {',
          '        uuid id PK',
          '        uuid category_id FK',
          '        string sku UK',
          '        string name',
          '        decimal price',
          '        int stock_qty',
          '    }',
          '',
          '    CATEGORY {',
          '        uuid id PK',
          '        string name UK',
          '        string description',
          '    }'
        ].join('\\n');
        document.getElementById('importCodeArea').value = sample;
        validateImportPreview();
      });
    }

    const btnExecuteImport = document.getElementById('btnExecuteImport');
    if (btnExecuteImport) {
      btnExecuteImport.addEventListener('click', () => {
        const raw = document.getElementById('importCodeArea').value.trim();
        if (!raw) return alert('Please enter code or choose a file first.');

        try {
          let parsed = null;
          if (importMode === 'sql' || /CREATE\s+TABLE/i.test(raw)) {
            parsed = parseSqlDdl(raw);
            if (!parsed || !parsed.tables || parsed.tables.length === 0) {
              return alert('Could not find any CREATE TABLE statements in the SQL code.');
            }
          } else if (importMode === 'mermaid' || raw.toLowerCase().startsWith('erdiagram') || raw.includes('{')) {
            parsed = parseMermaid(raw);
            if (!parsed || !parsed.tables || parsed.tables.length === 0) {
              return alert('Could not find any entities in the Mermaid code.');
            }
          } else {
            parsed = JSON.parse(raw);
            if (!parsed || !parsed.tables || !Array.isArray(parsed.tables)) {
              return alert('Invalid Relay JSON schema format.');
            }
          }

          currentSchema = parsed;
          initLayout();
          closeModal('modalImport');
          renderCanvas();
          recompileAll();
          showToast('Imported ' + parsed.tables.length + ' entities & ' + (parsed.relationships || []).length + ' relationships!');
        } catch (err) {
          alert('Import Error: ' + err.message);
        }
      });
    }

    // Global Power-User Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
        return;
      }

      // Quick Add Column on selected table: Ctrl+Enter or 'c'
      if ((e.ctrlKey && e.key === 'Enter') || e.key === 'c' || e.key === 'C') {
        if (selectedTable) {
          e.preventDefault();
          quickAddColumn(selectedTable);
        }
      }

      // Quick Create Entity: 't' or 'e'
      if (e.key === 't' || e.key === 'T' || e.key === 'e' || e.key === 'E') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          quickCreateTable();
        }
      }

      // Quick Create Relation: 'r'
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          document.getElementById('btnNewRel').click();
        }
      }

      // Quick Create ISA Hierarchy: 'i'
      if (e.key === 'i' || e.key === 'I') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          openAddIsa(selectedTable || (currentSchema.tables[0] ? currentSchema.tables[0].name : ''));
        }
      }

      // Delete selected entity, relation, or ISA hierarchy: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTable) {
          e.preventDefault();
          if (confirm('Delete table ' + selectedTable + '?')) {
            deleteTable(selectedTable);
          }
        } else if (selectedRel) {
          e.preventDefault();
          deleteRelation(selectedRel);
        } else if (selectedIsa) {
          e.preventDefault();
          deleteIsa(selectedIsa);
          selectedIsa = null;
        }
      }
    });

    // Inspector Live Mermaid Apply
    const btnApplyMermaidLive = document.getElementById('btnApplyMermaidLive');
    if (btnApplyMermaidLive) {
      btnApplyMermaidLive.addEventListener('click', () => {
        const mmd = document.getElementById('codeMermaid').value.trim();
        if (!mmd) return alert('Mermaid code is empty');
        try {
          const parsed = parseMermaid(mmd);
          if (!parsed.tables || parsed.tables.length === 0) {
            return alert('No entities found in Mermaid code');
          }
          parsed.tables.forEach((t, i) => {
            if (!tablePositions[t.name]) {
              tablePositions[t.name] = {
                x: 80 + (i % 3) * 280,
                y: 80 + Math.floor(i / 3) * 260
              };
            }
          });
          if (currentSchema.notes) parsed.notes = currentSchema.notes;
          currentSchema = parsed;
          renderCanvas();
          recompileAll();
          showToast('Applied Mermaid code to canvas (' + parsed.tables.length + ' entities)');
        } catch (err) {
          alert('Error applying Mermaid: ' + err.message);
        }
      });
    }

    // JSON Export / Import
    document.getElementById('btnExportJson').addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentSchema, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", (currentSchema.title || "relay_schema").toLowerCase().replace(/\\s+/g, '_') + ".json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    const btnImportJson = document.getElementById('btnImportJson');
    if (btnImportJson) {
      btnImportJson.addEventListener('click', () => {
        const fileImport = document.getElementById('fileImport');
        if (fileImport) fileImport.click();
      });
    }

    const fileImport = document.getElementById('fileImport');
    if (fileImport) {
      fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (parsed.tables && Array.isArray(parsed.tables)) {
              currentSchema = parsed;
              initLayout();
              renderCanvas();
              recompileAll();
            } else {
              alert('Invalid Relay schema format');
            }
          } catch (err) {
            alert('Failed to parse JSON file');
          }
        };
        reader.readAsText(file);
      });
    }

    // Boot
    initLayout();
    renderCanvas();
    updateTransform();
    recompileAll();

  </script>
</body>
</html>`;
}
