# Flowturi Designer – Technical Overview

This document provides a technical overview of Flowturi Designer: its architecture, technology stack, core features, extensibility, and integration goals.

---

## 🧱 Stack & Tooling

Flowturi Designer is built with:

- **Vite** for modern frontend tooling and hot module reloads.
- **React (w/ TypeScript)** for composable UI development.
- **Tailwind CSS** for design consistency and utility-first styling.
- **Zustand** for minimal global state management.
- **React Flow** or a similar node-link editor library for layout interaction and rendering.
- **YAML + JSON** for layout export formats.
- **FileSaver.js** or similar utility to allow export to disk.

---

## ✨ Core Capabilities

Flowturi Designer enables users to:

1. **Lay Out Nodes & Links**

   - Drag and drop nodes.
   - Draw directional links.
   - Snap-to-grid or freeform layout.

2. **Configure Node & Link Properties**

   - Editable properties panel (colors, size, tags, relative volumes).
   - Properties are optional and fall back to sensible defaults.

3. **Save/Export Layouts**

   - Outputs clean, structured `.yaml` and/or `.json` files.
   - Files are portable between Designer and Flowturi Studio.

4. **Save/Export Flowturi Historical Mode Files**

   - Flowturi displays animated Sankey diagrams
   - Using the nodes, links, and optional properties (e.g., total duration, interval, node/link properties) Designer should export files compatible with Flowturi
   - Flowturi's Historical Mode can consume CSV and JSON files in the following formats

```json
{
  "timestamp": "2023-05-10 15:30:00",
  "tick": 1,
  "nodes": [{ "name": "Source 1" }, { "name": "Target 1" }],
  "links": [{ "source": "Source 1", "target": "Target 1", "value": 10 }]
}
```

```csv
timestamp,source,target,value
2025-05-10 00:00:00,Crude Tank,Desalter,456.7
2025-05-10 00:00:00,Desalter,Heater,277.04
```

5. **Bring Your Own Icons (BYOI)**
   - Users may upload or reference custom SVG icons.
   - Support for cloud architecture kits like AWS and Azure.
   - Icons are stored with layout metadata or fetched at render time.
   - Icons integrate seamlessly into node render components using React's inline SVG or `dangerouslySetInnerHTML`.

---

## 🧩 Extensibility

- Layout schemas will be versioned to support migration.
- Plug-in hooks for:
  - Custom link types.
  - Additional node properties or behaviors.
- The icon system will use a flexible map-based registry to support future extensions (e.g. icon packs or CDN-sourced bundles).

---

## 🔌 Integration Targets

Designer can be used:

1. **As a Standalone Tool**

   - Launchable via a browser with no backend.
   - Full feature access in an embedded React app.

2. **Inside Flowturi Studio**
   - Exposed via iframe, module federation, or direct React mount.
   - Two-way communication layer (to be defined later) for exporting or syncing layouts.

---

## 🧪 Testing & DX

- Unit testing with Vitest.
- E2E testing with Playwright or Cypress (optional in early stages).
- Dev-friendly error messages and validation for malformed layouts.

---

## 🛣️ Milestone Roadmap

1. Basic Node/Link canvas.
2. Property inspector for nodes and links.
3. Layout export to YAML/JSON.
4. Optional icon upload and rendering.
5. Flowturi Studio bridge (manual import/export).
6. (Future) Live sync between Designer and Studio.

---
