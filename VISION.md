# Flowturi Designer Vision

Flowturi Designer is a visual layout and configuration tool for crafting Sankey-style diagrams, designed to complement Flowturi Studio.

## 🔭 Purpose

Flowturi Designer enables users to:

- Visually lay out nodes and links in a spatial workspace
- Configure optional properties for nodes and links (colors, size, relative volume, etc.)
- Customize node appearance via user-provided icons (e.g. AWS/Azure SVGs)
- Export layouts for use in Flowturi Studio or other Flowturi-compatible tools

## 🔗 Integration

Designer is intended to run in two primary modes:

1. **Standalone app** (e.g., hosted separately or embedded in dashboards)
2. **Embedded within Flowturi Studio** via component exposure or shared layout system

## 🧰 Design Philosophy

- Defaults should "just work" — properties are optional and sensible defaults are applied
- Gradual enrichment is encouraged — advanced configuration is optional but powerful
- The layout is the source of truth for visual representation; separation of layout and live data
- Bring-your-own-icons allows teams to visually map their infrastructure or domain

## 📦 Future Goals

- Seamless transition between Designer and Studio ("easy button")
- Support for icon packs and marketplace-style extensibility
- Real-time sync/collaboration for team diagramming sessions
