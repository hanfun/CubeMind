# CubeMind — Agent Instructions / Hướng dẫn cho AI Agent

> Persistent repository instructions for ChatGPT, coding agents, and contributors.
> Hướng dẫn phát triển lưu trong repository để tiếp tục công việc qua nhiều phiên trò chuyện.

## 1. Source of truth / Nguồn dữ liệu chính

- GitHub repository: https://github.com/hanfun/CubeMind
- Production: https://hanfun.github.io/CubeMind/
- Default protected-by-convention branch: `main`.
- **Always read the current GitHub source** before editing. Earlier chat descriptions, screenshots, and downloaded ZIPs may be out of date.
- Read `docs/PROJECT_CONTEXT.md` or `docs/PROJECT_CONTEXT.en.md`, then `SPEC.md`, `SPEC.en.md`, `FORMULAS.md`, and `FORMULAS.en.md` when relevant.
- **Luôn đọc phiên bản mới nhất trên `main` trước khi sửa.** Không coi tóm tắt cuộc trò chuyện hoặc file ZIP cũ là source chuẩn.

## 2. Stack / Công nghệ

- React 19 + TypeScript + Vite 6, CSS responsive, no required application backend.
- Three.js for interactive cube, solver guide and learning animations.
- `cubejs` Kociemba solver runs in a Web Worker; `cubing` may remain installed, but check the **current implementation** rather than assuming TwistyPlayer renders guide 3D.
- Browser camera/photo upload; PWA, service worker, localStorage for session and language preferences.
- Node.js 22 in CI. Vite `base: '/CubeMind/'` for GitHub Pages.

## 3. Non-negotiable behavior / Quy tắc không được phá vỡ

1. Real cube state is **not** the same as the 3D preview. The guide increments physical progress **only** when the user explicitly confirms the real move. Animation, replay, auto solve, and camera orbit must never commit a physical move.
2. Physically undoing a confirmed move requires the inverse turn and user confirmation. If a wrong move cannot be reconstructed, block progress and ask to rescan/re-enter the actual cube state.
3. Solver output must pass sticker counts, cubie validity/orientations/parity and final solved-state replay. An image being bright, sharp, or mathematically solvable does **not** prove recognition was accurate.
4. Two-photo and six-photo modes support camera **and** uploads. Two-photo mode is **beta**, with manual quadrilateral adjustment and a mandatory review of 54 stickers before solving. Never market it as fully automatic object detection.
5. Both **VI** and **EN** must cover all visible interface text: labels, instructions, dialogs, alerts, dynamic messages, lesson formulas, accessibility labels, and errors. Maintain Vietnamese and English documentation as paired files. Do not write new Vietnamese-only UI and depend on DOM text replacement; use explicit locale-aware strings or stable translation keys.
6. Learning animations are user-triggered, not autoplay on opening the lesson. Every algorithm needs a highlighted move list and correct viewing direction; desktop layout places steps to the right of 3D, mobile places them below.
7. Preserve the creator credit in the footer:
   - Name: **Nguyễn Hoàng Phương**
   - VI: **Kỹ sư phần mềm cấp cao**
   - EN: **Senior Software Engineer**
8. Keep touch, mouse, WebGL, React lifecycle cleanup and mobile responsiveness safe.

## 4. Editing workflow / Quy trình sửa code

1. Inspect the **latest** `main`, active PRs, and GitHub Actions results.
2. Create `feature/*`, `fix/*`, or `docs/*` from latest `main`; make focused changes.
3. Update relevant `tests/*` and both language variants of documents if behavior changes.
4. Run `npm ci`, `npm test`, `npm run build`; use GitHub Actions PR validation if local dependencies are unavailable.
5. Create a Pull Request targeting `main`; summarize changes, limitations, test evidence and manual QA.
6. Merge only after checks pass and the requested review/approval workflow permits it. A merge to `main` automatically triggers GitHub Pages deployment. Confirm the **Deploy** step succeeded before claiming the site was updated.
7. Do **not** claim device camera, browser rendering, touch, or WebGL were verified merely because unit tests/build succeeded.

## 5. Documentation & continuity / Lưu bối cảnh

- `docs/PROJECT_CONTEXT.md`: Vietnamese overview, architecture, decisions and open issues.
- `docs/PROJECT_CONTEXT.en.md`: English equivalent.
- `docs/CHATGPT_PROJECT_SETUP.md`: how to set up a ChatGPT Project and reusable instructions.
- Update these when architecture, deployment workflow, or major functional decisions change; avoid adding secrets, credentials, or access tokens.

**Development priority / Ưu tiên:** correctness of physical state → accessible, accurate steps → 3D illustration → performance, polish, and new features.
