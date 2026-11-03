# CubeMind — Persistent Development Context

**Updated:** November 2, 2026 · [Tiếng Việt](PROJECT_CONTEXT.md)

## Identity

- Product: **CubeMind**, a mobile-first web app for scanning, playing, learning and solving Rubik 3×3.
- Repository: https://github.com/hanfun/CubeMind
- Site: https://hanfun.github.io/CubeMind/
- Creator: **Nguyễn Hoàng Phương — Senior Software Engineer**.
- Default branch: `main`. New work uses feature/fix branches and Pull Requests.
- Languages: Vietnamese (`vi`) and English (`en`), with browser-persisted VI/EN switch.
- GitHub Pages base path: `/CubeMind/`, configured in `vite.config.ts`.

## Tech stack

- React 19, TypeScript, Vite 6, responsive CSS and Lucide icons.
- Three.js and OrbitControls for 3D lessons, the solving guide and the playable cube; supports mouse/touch.
- `cubejs` Kociemba two-phase solver via a Web Worker, cube legality/parity validation.
- Two-angle and six-face scans via camera or uploaded photos; manual face-corner alignment and facelet review.
- localStorage sessions, PWA/service worker.
- Node.js 22 in GitHub Actions; `npm ci` → `npm test` → `npm run build` → GitHub Pages deployment on changes to `main`.

The current `package.json` metadata still says `rubik-solver-webapp` and `0.3.0`. This metadata is not a reliable indication of the user-facing CubeMind version; aligning metadata and docs is a future task.

## Capabilities

- Scramble notation or manual entry of 54 facelets.
- Beta scan using **two photos** (three visible faces in each) or **six face photos**; camera and image upload fallback.
- Image corners adjusted manually; projective sampling, robust median colour sampling and capacity-constrained colour classification.
- Strict cubie legality and solver playback validation.
- Manual guidance for real physical turns, explicit per-move confirmation, inverse-turn undo, uncertain-state recovery and persisted sessions.
- Auto 3D solution demo, separate from physical progress.
- Interactive Three.js playground with mouse/touch turns, scrambling, undo, hints and automatic solving.
- Seven beginner lessons in VI/EN, formula lists, per-step SVG before/after views, arrow directions, on-demand 3D playback.
- Desktop: formula and step panel **to the right** of 3D. Mobile: **below** 3D.

## Important files

- `src/App.tsx`: application screens and state flow.
- `src/components/TwoAngleScanner.tsx`, `CameraScanner.tsx`, `FaceletEditor.tsx`: scanning/review.
- `src/lib/scanAccuracy.ts`, `twoAngle.ts`, `color.ts`: recognition helpers.
- `src/lib/cube.ts`, `src/workers/solver.worker.ts`: cube maths and solver.
- `src/components/Guide.tsx`, `TwistyCube.tsx`, `FormulaSteps.tsx`: solving guide and 3D.
- `src/components/PlayPage.tsx`, `PlayableCube3D.tsx`: interactive 3D.
- `src/components/LearnPage.tsx`, `LearningCube.tsx`, `src/lib/learn.ts`, `learn.en.ts`, `stepVisual.ts`: lesson materials.
- `src/i18n.tsx`: language selection and legacy translation compatibility.
- `SPEC.md`/`SPEC.en.md`, `FORMULAS.md`/`FORMULAS.en.md`: paired specs and formula reference.

## Non-negotiable design rules

1. Physical cube progress changes **only after explicit user confirmation**; previews, demos, camera orbit and auto solve never count as actual turns.
2. Require confirmation for physical undo. If uncertain, rescan or re-enter the physical cube; do not silently assume the state.
3. Validate 54 sticker counts, corner/edge identities, orientations and parity; verify solution reaches solved state. A balanced assignment or solver success does not prove image recognition.
4. Two-photo scanning is **beta**: manual quadrilateral alignment and review all 54 stickers before solving. Do not describe it as automatically detecting arbitrary cubes.
5. EN must contain proper English across labels, lessons, warnings, dynamic messages and accessibility text. Keep personal names unchanged.
6. Learning animations only start when the user clicks; don't autoplay on lesson entry.
7. Preserve creator attribution and mobile-first layout.
8. Confirm actual deployment success in GitHub Actions before claiming a website update.

## Known technical debt / roadmap

- Migrate legacy DOM-based phrase translation in `src/i18n.tsx` to stable React-level `t(key, params)` keys with completeness checks. This is needed for reliable EN-only UI.
- Improve automated cube detection and guided orientation, and conduct real-device colour/camera testing across diverse lighting.
- Test WebGL, touch interactions and camera upload on Safari iOS / Chrome Android; passing CI alone is not device evidence.
- Align package/README version and metadata with the CubeMind brand.

## Continuation workflow

1. Read latest `main`, `AGENTS.md` and this file. Check active PRs and recent Actions runs.
2. Implement focused changes in a new branch; update tests and both language versions of documents.
3. Validate with `npm ci`, `npm test`, `npm run build` and the PR workflow.
4. Create a Pull Request and review. Merge only after checks and the applicable approval.
5. Confirm the GitHub Pages Deploy step completed successfully before announcing the live site.
6. Never commit secrets, passwords, access tokens or private credentials.

## Two-photo scan UX update

The two-photo screen separates live capture (three face outlines only) from post-capture alignment (selected-face nine samples, large corner handles, face-centered zoom and a 3×3 colour preview). Live camera `object-fit:cover` matches square photo capture. Sample-variance warnings are advisory, not proof of cube recognition. Real iOS Safari/Android Chrome camera and touch QA remains necessary.

## Visual beginner lessons and last-layer algorithm correction (November 2026)

- `src/lib/lessonDiagrams.ts` and `src/components/LessonCaseDiagram.tsx` add actual cubejs-derived U-face/adjacent side colours, highlighted unoriented stickers, cubie movement arrows from before to after, and larger case diagrams.
- Stages 4–7 offer dot/L/line, Sune/Anti-Sune/zero/two oriented corners, A/Y permutations (headlights/no-headlights), and Ua/Ub/H/Z edge permutations.
- The former corner permutation sequence did not preserve yellow U; A/Y examples do. H/Z use two Ua cycles with U adjustments and no unsupported slice M.
- `tests/lesson-cases.test.mjs` audits valid first-two-layer cases and their actual corner/edge destinations. Learning orientation U yellow, D white, F blue differs from the scanner default (U white, F green).
- Browser and physical teaching QA are still required.

## Fixed: 3D lesson examples must not finish the whole cube early

`src/lib/lessonScenario.ts` now defines one stage target per learning stage: white cross, white first layer, first two layers, yellow cross, yellow face, correctly permuted yellow corners, and full cube completion **only at stage 7**. `LearningCube.tsx`, `lessonDiagrams.ts`, per-turn steps and case SVGs share the same stage snapshots. The final cube must remain globally unsolved after stages 1–6. Do not regress this behavior; see `tests/lesson-cases.test.mjs` and `tests/step-visual.test.mjs`.
