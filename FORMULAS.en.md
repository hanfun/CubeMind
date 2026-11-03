# CubeMind — Rubik 3×3 Algorithm Reference

**Languages:** [English](FORMULAS.en.md) · [Tiếng Việt](FORMULAS.md)

The algorithms below demonstrate **specific example cases** of the seven-stage beginner method. They are **not** a sequence that can be blindly executed to solve every scramble. Check piece positions, colors and cube orientation first.

## Notation

- **U** up, **D** down, **L** left, **R** right, **F** front, **B** back.
- **R** turns the right face 90° clockwise **when looking directly at that face**.
- **R'** turns it counterclockwise; **R2** turns it 180°.
- For beginner lessons, keep **white on the bottom** and **yellow on the top**. Do not reorient the whole cube partway through an algorithm unless instructed.

## Audited formulas and recognition cases

**Important:** Match both the U-face diagram and its surrounding side stickers. Each worked example is generated from a legal cube state and checked by cubejs in automated tests. These are **not** moves to concatenate blindly for every scramble.

| Stage | Recognized case | Algorithm |
|---|---|---|
| 1. White edges | Front half-turn example | `F2` |
| 2. White corners | Right trigger | `R U R' U'` |
| 3. Middle layer | Insert edge right | `U R U' R' U' F' U F` |
| 3. Middle layer | Insert edge left | `U' L' U L U F U' F'` |
| 4. Yellow cross | Horizontal line | `F R U R' U' F'` |
| 4. Yellow cross | Upper-left L | `F U R U' R' F'` |
| 4. Yellow cross | Dot (combined example) | `F U R U' R' F' U F R U R' U' F' U'` |
| 5. Yellow face | Sune, one top yellow corner | `R U R' U R U2 R'` |
| 5. Yellow face | Anti-Sune, one top corner | `R U2 R' U' R U' R'` |
| 5. Yellow face | Two top corners (combined case) | `R U R' U R U2 R' U R U2 R' U' R U' R' U'` |
| 5. Yellow face | No top corners (combined case) | `R U R' U R U2 R' R U R' U R U2 R'` |
| 6. Last-layer corners | Back headlights — A-perm | `R' F R' B2 R F' R' B2 R2` |
| 6. Last-layer corners | No headlights — Y-perm | `F R U' R' U' R U R' F' R U R' U' R' F R F'` |
| 7. Last-layer edges | Ua (correct back edge) | `R U' R U R U R U' R' U' R2` |
| 7. Last-layer edges | Ub (correct back edge) | `R2 U R U R' U' R' U' R' U R'` |
| 7. Last-layer edges | H (opposite swaps) | `Ua U Ua U'` (expand Ua above) |
| 7. Last-layer edges | Z (adjacent swaps) | `Ua U' Ua U` (expand Ua above) |

### Correction in stage 6

The former `U R U' L' U R' U' L` sequence **does not preserve the complete yellow U face**, making it unsuitable after stage 5. The corner-permutation examples now use A-perm or Y-perm, with automated checks that they preserve the solved lower two layers and yellow U face.

H and Z perms have shorter algorithms involving the `M` middle slice. Because the current app only supports U/D/L/R/F/B turns, the lesson uses two Ua cycles and intermediate U turns. The on-screen walkthrough expands the full sequences into individually animated turns.

### Reading the illustrated cases

- Yellow is on **U**, white on **D**. The teaching view is rotated from the initial scanner orientation, so **F is blue** and **B is green**.
- The diagram includes the U-face 3×3 sticker grid and the four surrounding side strips (B above the image, F below it).
- **Green arrows** show the physical corner or edge piece's original position → final position. These arrows are not camera motion.
- A corner being correctly *positioned* is different from being correctly *oriented*.
- **Headlights** are a matching-colour pair of top corner stickers on a side face. Hold them at B for the A-perm example; the Y-perm example has no headlights.
- Every case image represents one legal, precisely oriented example. If the real cube does not match, choose a different case or reorient it first.

Reference: [4-look Last Layer — speedcubing.org](https://speedcubing.org/pages/4-look-last-layer-tutorial) and [Rubik's Cube Beginner Method](https://rubikscube.ampli.fi/beginner_new.html).

## In-app visual reference

Open **Learn Rubik → Seven beginner stages → select a stage and case**. A 3D cube appears next to the full formula and move list on desktop; on mobile the panel appears **underneath** the 3D cube.

Each move displays a **Before / After** diagram of its turning face, a direction arrow, and an explicit viewing-angle instruction. **One move** animates just the next step, **Play formula** runs through the sequence, and **Previous** reconstructs the earlier state. The lesson never starts animating without a click.

In **Solve a real cube**, the right-side panel displays the unique solution computed for the currently scanned cube. Those solver moves are distinct from the named beginner algorithms. Watching a 3D preview must never count as physically turning a cube.

> **Note:** Before/after illustrations are based on mathematically valid sample states. They do **not** verify the physical cube in your hands.
