# EC-031 — 3D Engine

> **Status:** Active
> **Phase:** D — Universal Design Engine
> **Canonical code:** `package.json` (verified: no 3D library), `src/app/assets/page.tsx`, `src/app/configure/`, `prisma/schema.prisma` (`KpnDigitalTwin`, line 7071; `KpnConfiguratorSession`, line 7109)
> **Overrides:** `docs/canvas/04-3d-engine.md` and `docs/canvas/10-k3d-engine.md` on conflict — the K3D vision (browser-native 3D engine powering every studio, digital twin, simulation, AR/VR) is a long-range evolution target; this file records the verified 3D truth, which is currently "no 3D code in the repository."

## Purpose

Scope the 3D engine for Kauvex: where 3D rendering, scene graphs, materials, camera control, and future WebGPU rendering will plug into the platform (AI Design Studio configurators, digital twins, product configurators), and enforce the discipline that 3D remains an additive layer that never compromises the marketplace critical path. This document exists mainly to flag: the repo contains zero 3D implementation today, and every 3D capability is an evolution target until a verified dependency and integration point exist.

## Current Truth (in this repo today)

- **Dependency truth (verified)** — `package.json` lists no 3D library: `three`, `@react-three/fiber`, `@react-three/drei`, `@babylonjs`, or any WebGL wrapper are absent from `dependencies` and `devDependencies`. A repo-wide grep of `src/` for `three`/`webgl` returns only unrelated matches (e.g., a `threeDModelUrl?` optional field in `src/types/index.ts:320`, prose strings like "three steps"). There is no 3D viewport, no scene graph, no WebGL context anywhere in the codebase.
- **Closest anchors (2D/data only)**:
  - `src/app/assets/page.tsx` — Digital Twin and Asset Registry surface. Its data model `KpnDigitalTwin` (`prisma/schema.prisma:7071`, table `kv_kpn_digital_twins`) carries asset metadata (`ownerId`, `assetType`, `isForSale`, installer relation, maintenance schedules) — a registry anchor for 3D assets, not a renderer.
  - `src/app/configure/` — eight client-side configurator wizards (`boat`, `solar`, `security`, `kitchen`, `house`, `farm`, `dredging`, `cctv`) that collect parameters as form steps; no visual preview of any kind.
  - `KpnConfiguratorSession` (`prisma/schema.prisma:7109`) has an `aiRenderUrl` text field — the designated future home for a rendered preview URL of a configured design (static image today, 3D later); no code writes it.
- **Rendering in the platform today is 2D only**: `leaflet` (maps), `recharts` (charts), and static images via `next/image` (e.g., POD marketplace thumbnails in `src/app/pod-marketplace/page.tsx`).

## Rules

1. No 3D library may be added to `package.json` without a written design decision that names the first integration point; the decision must record bundle-size impact and WebGL fallback behavior.
2. 3D must be strictly client-side (`"use client"` + dynamic import, `ssr: false`). 3D code must never execute during server rendering, in API routes, or in edge middleware; server roles are limited to serving model files and persisted scene data.
3. Scene state must serialize to JSON and persist on the session/twin record — `configuration` (session) or the digital-twin record — so a scene can be reconstructed deterministically from data, never only from canvas memory.
4. The 3D layer must be fail-soft: if WebGL is unavailable or the bundle fails, the page degrades to the 2D/parameter view (configurators keep working without the viewport).
5. Digital twins (`kv_kpn_digital_twins`) are the canonical asset registry; a 3D scene is a visualization of a twin, never a separate unanchored asset.
6. Performance budgets (see Evolution Targets) apply from the first 3D integration; a viewport that exceeds budget on a mid-range mobile device cannot ship.

## Evolution Targets

> **Evolution target — NOT in the repo today. Nearly all of this document's subject matter is an evolution target.**

- **Three.js / React Three Fiber viewport**: an interactive scene viewport (orbit camera controls, object selection) for configurator previews and digital twin inspection. Not present — no dependency exists.
- **Scene graph**: hierarchical transforms (groups, meshes, instances, parent-child placement) shared with the 2D layer's layer model; no graph exists in `src/`.
- **Material pipeline**: PBR materials mapped to the material system (see EC-032) so material choice in a configurator changes the rendered surface; no material engine exists.
- **Camera controls**: orbit/pan/zoom with configurator-appropriate constraints (e.g., boat hull inspection, kitchen room walk-through); nothing to build on today.
- **WebGPU future**: a WebGPU renderer path for large scenes (warehouses, buildings) once browser support and bundle economics justify it; today is a research note, not a commitment.
- **Integration point A — configure studios**: `src/app/configure/` wizards gain a 3D preview fed by their parameters (boat hull from dimensions/hull type; solar array layout; kitchen cabinet configuration).
- **Integration point B — digital twins**: `src/app/assets/` gains a 3D viewer for `kv_kpn_digital_twins` assets, with maintenance schedule overlays.
- **Integration point C — product configurators**: marketplace custom products render a 3D preview of the configured variant (see EC-029).

**Performance budgets (targets, to be enforced at first integration):**
- Initial 3D bundle (gzip, shared, excluding scene assets): <= 250 KB target, 400 KB hard ceiling.
- First interactive frame: <= 1.5 s on mid-range mobile (Moto G-series class), <= 700 ms desktop.
- Sustained: 60 fps for scenes under 200k triangles; drop to 30 fps acceptable only in orbit-slow mode.
- Scene asset budget: <= 8 MB per scene served from storage; LOD for larger scenes.
- GPU memory: <= 512 MB peak on mobile; scenes exceeding budget must stream LODs.

## Checklist

- [ ] 3D dependency added only with a design decision naming the first integration point.
- [ ] First integration shipped (configurator preview or twin viewer) with fail-soft 2D fallback.
- [ ] Scene state persists to the session/twin record and reloads deterministically.
- [ ] Bundle size verified against the 250 KB/400 KB budgets at CI time.
- [ ] WebGL-unsupported devices verified to degrade to the 2D view.
- [ ] Digital twin 3D assets reference the twin registry record.
- [ ] No 3D code executes in server components, API routes, or middleware (grep-audited).
