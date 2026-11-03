> **Continue with an AI agent:** [AGENTS.md](AGENTS.md) · [Project context](docs/PROJECT_CONTEXT.en.md) · [ChatGPT Project setup](docs/CHATGPT_PROJECT_SETUP.md)

# CubeMind — Rubik 3×3 Scanner, Solver, 3D Playground

**Languages:** [English](README.en.md) · [Tiếng Việt](README.md)

CubeMind is a mobile-first React web application that helps people scan, verify, solve, learn and play with a Rubik 3×3 cube. It runs entirely on the device; no account or backend is required.

## Run locally

Requirements: Node.js 22 or newer, npm.

```sh
npm ci
npm test
npm run build
npm run dev
```

Vite uses the `/CubeMind/` base path for GitHub Pages. Open the URL printed by Vite; the deployed site is intended for `https://hanfun.github.io/CubeMind/`. The camera needs HTTPS (or a secure localhost origin).

## Features

| Feature | Current status |
|---|---|
| Two-angle scan | Beta — camera or two uploaded photos, each showing three faces |
| Six-face scan | Beta — camera or six photos, each showing nine stickers |
| Cube validation | Sticker counts, centers, pieces, corner/edge orientations and permutation parity |
| Solver | Kociemba two-phase through `cubejs` in a Web Worker |
| Auto 3D solve | `cubing.js` visualization |
| Manual real-world guide | One move at a time with explicit user confirmation and physical undo |
| 3D playground | Three.js, mouse and touch turns, random scramble, undo, hint and fast auto-solve |
| Learn | Move notation and seven beginner stages with button-controlled 3D demonstrations |
| Bilingual UI | Vietnamese / English switch, stored in localStorage |
| Typography | Be Vietnam Pro (body), Plus Jakarta Sans (headings) |

### Two-photo scanning: important limitations

The scanner uses a prescribed orientation. Image 1 sees U/F/R; image 2 sees D/L/B. Do **not** rotate individual layers between photos. All six face quadrilaterals have adjustable corners.

The accuracy update improves:
- projective corner-to-sticker sampling (homography, not merely bilinear interpolation);
- robust median sampling of each sticker's inner patch;
- global minimum-cost colour assignment of the 48 non-center stickers, with exactly eight stickers of each center colour;
- warnings for low-confidence or forced colour assignments;
- a **mandatory 54-sticker review** before the user runs the solver.

These steps improve colour consistency, **but cannot guarantee correctness** under reflections, occlusion, arbitrary cube orientation or incorrect corner alignment. The project does not yet contain automatic three-face object detection or a trained computer-vision model. A mathematically solvable state is not proof that the photographed physical cube was recognized correctly. Users should review doubtful stickers, correct them, or retake a photograph.

### Bilingual user interface

Tap **VI** or **EN** in the top navigation. Vietnamese is the default; the selection persists in the browser. The English learning curriculum shares algorithm IDs and moves with the Vietnamese source, so all demonstrations solve the same illustrative case in either language.

The UI uses a local phrase catalog for existing Vietnamese content; it makes no network translation requests. Future contributors should introduce new strings in both languages together and should migrate translated text to explicit component-level translation keys over time. Some beta diagnostics or runtime error details returned by the platform might remain untranslated.

## Code structure

```text
src/
  App.tsx                         Routes and app workflow
  i18n.tsx                        Language switch and local translation catalog
  components/
    CameraScanner.tsx             Six individual faces
    TwoAngleScanner.tsx           Two photos, three faces per photo
    FaceletEditor.tsx             Inspect and edit all 54 stickers
    Guide.tsx                     Physical move confirmations
    PlayPage.tsx                  Interactive 3D mode and hints
    PlayableCube3D.tsx            Three.js renderer and mouse/touch turns
    LearnPage.tsx                 Beginner lessons
    LearningCube.tsx              On-demand 3D algorithm demo
    TwistyCube.tsx                Solver visualization
  lib/
    cube.ts                       Facelet conventions, moves, validation
    color.ts                      RGB/CIELAB calculations
    scanAccuracy.ts               Capacity-constrained global colour assignment
    twoAngle.ts                   Perspective mapping and two-angle recognition
    imageInput.ts                 Upload validation and quality warnings
    learn.ts                      Vietnamese curriculum
    learn.en.ts                   English curriculum
    guide.ts                      Guide state machine
    play.ts                       Drag-to-move mapping
    solver.ts                     Worker interface
  workers/solver.worker.ts        Real solver, validation, snapshot verification
tests/                             Node tests
```

## Correctness and safety

- Each face has exactly nine sticker colours. Every color center is fixed by the U/R/F/D/L/B scheme.
- The cubie validator rejects impossible corner/edge permutations or orientations.
- The solver verifies that the entire planned move sequence reaches the solved state before showing a result.
- Watching an animation does not confirm a turn on the physical cube. A user must explicitly confirm real-world progress.
- The playground state is separate from a scanned real-cube session.
- Uploaded photos are processed locally; no app backend receives them.
- Do not classify a photo as containing a Rubik cube based solely on brightness, sharpness, or mathematical solvability.

## Development and release checklist

1. Run `npm ci && npm test && npm run build`.
2. Validate Vietnamese and English navigation, scanner, recovery modals, and all seven lessons.
3. Verify two-angle scans with varied real lighting and angles, including intentionally wrong orientations; review flagged stickers.
4. Test WebGL, pointer events, camera permissions and file uploads on Chrome Android and Safari iOS.
5. Check service worker upgrades and PWA install experience.
6. Merge to `main` only after code review and CI checks.

See [English specification](SPEC.en.md) and [Vietnamese specification](SPEC.md).

## License and libraries

React, Vite, Three.js, cubing.js and cubejs. Font families are available through Google Fonts under the appropriate open-font licenses. The actual license of the CubeMind project is determined by its repository owner.

## Visual move formulas

Each of the seven lessons shows its full algorithm, a highlighted move list, before/after face diagrams and a clear viewing direction. The reference panel is **right of the 3D cube on desktop** and **below it on mobile**. Animation starts only on a user action. Real-cube guidance shows the actual solver-generated move sequence, without counting visual previews as physical confirmations.

See the [English algorithm reference](FORMULAS.en.md) or [Vietnamese reference](FORMULAS.md).

## Two-photo scanner usability upgrade

Guided camera framing now shows three clean face outlines instead of overlaying all 27 sample dots. After capture, select one face (U/F/R or D/L/B), drag its four larger corner handles, zoom to 160%/220%, and inspect a 3×3 sampled colour preview. Reset one face or all three, or retake the shot. Between shots rotate only the **entire cube**, never individual layers. A final 54-sticker review is mandatory. Recognition remains beta and does not detect arbitrary cube poses automatically.

## Audited visual beginner lessons (November 2026)

Seven-stage lessons now include a **case atlas** with actual top and side stickers, movement arrows for where each corner/edge travels, holding directions and expected results. The 3D cube and per-turn formula list illustrate the selected case; there is no autoplay on entry.

Stage 6 replaces the former corner algorithm (which failed to preserve the yellow top face) with an A-perm/back-headlights and Y-perm/no-headlights example. Stage 7 covers Ua, Ub, H and Z, using face-turn-only combinations for H/Z instead of unsupported M slice notation. Teaching orientation is U yellow, D white, F blue; this is rotated from the scanner's default U white.

Examples are created from legal cube states and checked to preserve solved lower layers. See [English formula reference](FORMULAS.en.md) / [Vietnamese reference](FORMULAS.md).

## Stage-scoped 3D lesson examples

Lesson examples no longer reconstruct their initial state from `fully solved + inverse(formula)`, because this accidentally finished the **entire cube** in every early-stage animation. Instead, the 3D model, SVG case diagrams and move list now use one shared **stage target state** from `src/lib/lessonScenario.ts`:

- Stage 1: complete the white cross, leaving later pieces incomplete.
- Stage 2: complete the white layer, keeping later layers unfinished.
- Stage 3: finish both bottom layers, leaving the yellow top unsolved.
- Stage 4: complete the yellow cross but not the yellow corners.
- Stage 5: orient the yellow top, leaving last-layer permutation unfinished.
- Stage 6: permute yellow corners, leaving some top edges misplaced.
- **Stage 7:** only now finish the entire cube.

The example 3D stops at the selected stage milestone. Regression tests verify these exact goals and consistency between 3D setup and the SVG before/after states. Standalone single-move notation practice remains a separate demo.
