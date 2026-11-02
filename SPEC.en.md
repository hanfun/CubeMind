# CubeMind — Functional & Technical Specification (English)

**Counterpart:** [Tiếng Việt](SPEC.md) · [English README](README.en.md)

## 1. Product goal

Build a mobile-first Rubik 3×3 web app for people who want to scan their real cube, understand whether the recognized cube is legal, choose how to solve it, learn beginner algorithms, and optionally play with a fully interactive digital cube. All primary features run on the client, with a Web Worker for computationally expensive solving.

## 2. Inputs and scanning

Support three state-input mechanisms:
1. **Two-angle guided scan:** first image shows U/F/R; second shows D/L/B. Take or upload each image. Preserve the physical cube state between captures. Adjust four corners for each of the three visible faces in each shot. Use perspective-correct mapping and inner-sticker patch medians.
2. **Six-face guided scan:** take or upload one photo per face in the U/R/F/D/L/B order with a consistent orientation and adjustable frame.
3. **Manual and scramble input:** edit 54 facelets or apply standard moves to a solved cube.

All paths produce the canonical 54-character sticker representation. A low-quality image warning does not imply the cube has been detected; unknown orientations or ambiguous colours require inspection. Two-angle recognition must always show the sticker editor **before** solving. Global colour assignment must enforce eight non-center stickers per colour but never silently assert correctness.

## 3. Validation

Validate 54 stickers, nine of each colour, six distinct centers, legal edge and corner identities, edge-flip parity, corner-twist parity and matching permutation parity. Reject impossible cube states with specific, understandable errors. The solver must verify a resulting move sequence by replaying the moves until the cube is solved.

## 4. Two solve modes

### Manual guidance
- Display the scanned initial cube, current move, face name and direction, slow on-demand 3D animation, and progress based solely on physical confirmations.
- The primary button **I completed this move** advances one step and cannot be activated during a demonstration or uncertainty.
- **Preview / replay** never commits a physical move.
- **Review previous** only changes the preview and must not move real-world progress backward.
- **Physically undo** instructs the inverse move and requires a separate confirmation.
- When uncertainty occurs, enter recovery, block advancing, and offer correction or rescan.
- Persist confirmed count locally; on restoration require the user to verify the physical cube still matches the last known confirmed state.

### Automatic demo
- Play verified moves through the 3D renderer at selectable speeds.
- No animation event modifies physical progress.
- Switching from demo to manual requires reconciling the real cube state.

## 5. Interactive playground

Implement a 26-visible-cubie Three.js model that accepts mouse and touch gestures. Drag a visible sticker to turn an outer layer; drag the background or enable orbit-only mode to rotate the view. Support keyboard turns, random scrambling, undo, persistent history, next-move hints, and automatic solver playback. Only completed turns change game state. Camera orbit never changes the cube state.

## 6. Learning and localization

- Provide seven beginner stages, a glossary for U/D/L/R/F/B and prime/double suffixes, physical holding orientation, illustrative cases, and on-demand 3D demonstrations.
- Animations never run automatically when a lesson is opened.
- Support **vi** and **en** for navigation, instructions, learning content, warnings, dialogs and accessible labels. Language preference persists; all new UI features should add both translations.
- Use Be Vietnam Pro for readable Vietnamese body text and Plus Jakarta Sans for headings. Maintain legible contrast, a restrained weight scale and touch targets of at least 44 CSS pixels.
- Keep English and Vietnamese markdown documentation in paired files: `README.md`/`README.en.md`, `SPEC.md`/`SPEC.en.md`.

## 7. Internal state and UI isolation

- Canonical face order: U/R/F/D/L/B.
- Solver snapshots: `S[0]` initial state, `S[k+1] = applyMove(S[k], move[k])`.
- Separate `confirmedState` (based on explicit physical confirmation) from `previewState` (visual-only), and distinguish both from the unverified physical cube.
- Scope cancellation, cleanup and render resources to the owning component. A stale animation or an interrupted Web Worker must not commit additional real moves.
- The playground game state and the scanned real cube solving session remain independent.

## 8. Accuracy limitations and future work

The beta two-photo scanner does not yet automatically recognize arbitrary three-face cube poses; users manually align quadrilaterals. Global colour balancing and a successful Kociemba run are not proof of photo recognition. Future options include OpenCV.js corner detection, learned colour calibration, controlled orientation tracking and device-based quality validation. Acceptance requires physical scans under different brightness, reflections, camera distances, rotated viewpoints and colour schemes.

## 9. Quality gates

- Unit tests: perspective mapping, balanced assignment and uncertain-colour warnings; every face and notation; parity validation; solver playback; no physical commit on demo; undo confirmation; persisted state.
- Integration: two-photo and six-photo flows both end in review and validation; test ambiguous red/orange, yellow/white, black grid borders, reflections and wrong scan orientation.
- Browser/device: Android Chrome and iOS Safari camera permissions, uploaded JPEG/PNG/HEIC where browser-supported, touch/drag behavior, WebGL lifecycle, offline behavior and responsive typography.
- CI: `npm ci`, `npm test`, `npm run build`. Publish only after reviewing the branch.

## 10. Privacy

Process photos locally by default. Do not upload camera or cube data without explicit consent. Local storage contains session and language preferences; no account is needed for the MVP.

## Supplement — Formula steps and illustrations

For every case in the seven beginner stages, show the complete algorithm, numbered and highlighted moves, an explicit face-oriented viewing instruction, and before/after diagrams of that face. Display the reference panel to the right of the 3D cube on desktop and beneath it on mobile. Animation must be user-initiated. The real-cube solving screen uses the same panel with verified solver snapshots and moves; watching a demo never commits physical progress. See [FORMULAS.en.md](FORMULAS.en.md) and [FORMULAS.md](FORMULAS.md).
