# CubeMind — Rubik 3×3 Algorithm Reference

**Languages:** [English](FORMULAS.en.md) · [Tiếng Việt](FORMULAS.md)

The algorithms below demonstrate **specific example cases** of the seven-stage beginner method. They are **not** a sequence that can be blindly executed to solve every scramble. Check piece positions, colors and cube orientation first.

## Notation

- **U** up, **D** down, **L** left, **R** right, **F** front, **B** back.
- **R** turns the right face 90° clockwise **when looking directly at that face**.
- **R'** turns it counterclockwise; **R2** turns it 180°.
- For beginner lessons, keep **white on the bottom** and **yellow on the top**. Do not reorient the whole cube partway through an algorithm unless instructed.

## Algorithms

| Stage | Example case | Algorithm |
|---|---|---|
| 1. White cross | Half-turn of a single face (example only) | `F2` |
| 2. White corners | Right-hand trigger | `R U R' U'` |
| 3. Middle layer | Insert edge right | `U R U' R' U' F' U F` |
| 3. Middle layer | Insert edge left | `U' L' U L U F U' F'` |
| 4. Yellow cross | Orient yellow edges | `F R U R' U' F'` |
| 5. Yellow face | Sune | `R U R' U R U2 R'` |
| 6. Yellow corners | Three-corner cycle | `U R U' L' U R' U' L` |
| 7. Yellow edges | Ua | `R U' R U R U R U' R' U' R2` |
| 7. Yellow edges | Ub | `R2 U R U R' U' R' U' R' U R'` |

## In-app visual reference

Open **Learn Rubik → Seven beginner stages → select a stage and case**. A 3D cube appears next to the full formula and move list on desktop; on mobile the panel appears **underneath** the 3D cube.

Each move displays a **Before / After** diagram of its turning face, a direction arrow, and an explicit viewing-angle instruction. **One move** animates just the next step, **Play formula** runs through the sequence, and **Previous** reconstructs the earlier state. The lesson never starts animating without a click.

In **Solve a real cube**, the right-side panel displays the unique solution computed for the currently scanned cube. Those solver moves are distinct from the named beginner algorithms. Watching a 3D preview must never count as physically turning a cube.

> **Note:** Before/after illustrations are based on mathematically valid sample states. They do **not** verify the physical cube in your hands.
