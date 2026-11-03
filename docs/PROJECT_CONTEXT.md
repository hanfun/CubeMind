# CubeMind — Bối cảnh và cấu hình phát triển

**Cập nhật:** 02/11/2026 · [English](PROJECT_CONTEXT.en.md)

## 1. Nhận diện dự án

- **Tên:** CubeMind — ứng dụng web hỗ trợ quét, chơi, học và giải Rubik 3×3.
- **GitHub:** https://github.com/hanfun/CubeMind
- **Website:** https://hanfun.github.io/CubeMind/
- **Tác giả:** Nguyễn Hoàng Phương — Kỹ sư phần mềm cấp cao (Senior Software Engineer).
- **Nhánh chính:** `main`. Các thay đổi phát triển qua Pull Request.
- **Ngôn ngữ giao diện:** tiếng Việt (`vi`) và tiếng Anh (`en`), có nút chuyển VI/EN và lưu lựa chọn trên trình duyệt.
- **Cấu hình triển khai:** `vite.config.ts` đặt `base: '/CubeMind/'`; GitHub Pages build từ workflow `.github/workflows/deploy-pages.yml` sau khi push/merge `main`.

## 2. Công nghệ hiện tại

| Lớp | Công nghệ |
|---|---|
| Giao diện | React 19, TypeScript, Vite 6, CSS responsive, Lucide React |
| Khối Rubik 3D | Three.js, OrbitControls, điều khiển chuột/touch |
| Giải Rubik | `cubejs` (Kociemba two-phase), chạy trong Web Worker |
| Kiểm tra đầu vào | 54 facelet U/R/F/D/L/B, màu tâm, cạnh/góc, orientation và parity |
| Ảnh | Camera hoặc upload; quét hai góc hoặc sáu mặt, chỉnh các điểm góc |
| Lưu cục bộ | localStorage (phiên giải, lịch sử chơi, ngôn ngữ); PWA/service worker |
| CI/CD | Node.js 22, GitHub Actions, GitHub Pages |

**Lưu ý:** `package.json` hiện còn `name: rubik-solver-webapp` và `version: 0.3.0`, dù giao diện/thương hiệu là CubeMind. Đây là tồn đọng cấu hình; không tự coi con số trong README là version phát hành chính thức.

## 3. Các chức năng trong source

- Nhập chuỗi trộn (scramble) hoặc sửa 54 ô màu.
- Quét nhanh **2 ảnh**, mỗi ảnh 3 mặt; hỗ trợ camera hoặc tải ảnh, căn tứ giác 4 góc và xem lại màu.
- Quét **6 mặt**, camera hoặc upload, chỉnh khung, kiểm tra dữ liệu.
- Kiểm tra trạng thái vật lý có thể giải; Web Worker tính và xác minh toàn bộ bước giải.
- Hướng dẫn giải Rubik thật: 3D mô phỏng, confirm từng bước, undo vật lý có xác nhận, phục hồi khi lệch trạng thái, lưu tiến độ.
- Chế độ giải tự động bằng 3D; tách rời tiến độ của khối Rubik thật.
- Chơi khối Rubik 3D bằng chuột và touch, đổi góc nhìn, trộn, undo, gợi ý và tự giải.
- 7 bài học cơ bản VI/EN, có ký hiệu mặt, trường hợp, công thức, hình SVG trước/sau, hướng nhìn và 3D chạy khi bấm nút.
- Trên desktop, bảng công thức ở **bên phải** 3D; trên mobile, bảng ở **bên dưới**.

## 4. Tệp và cấu trúc quan trọng

- `src/App.tsx`: luồng màn hình và chọn chế độ.
- `src/components/TwoAngleScanner.tsx`, `CameraScanner.tsx`: quét/tải ảnh.
- `src/lib/scanAccuracy.ts`, `twoAngle.ts`, `color.ts`: cân bằng màu, phối cảnh, lấy mẫu.
- `src/components/FaceletEditor.tsx`: kiểm tra/sửa 54 sticker.
- `src/lib/cube.ts`, `src/workers/solver.worker.ts`: trạng thái Rubik và solver.
- `src/components/Guide.tsx`, `TwistyCube.tsx`, `FormulaSteps.tsx`: hướng dẫn Rubik thật, viewer 3D và công thức.
- `src/components/PlayableCube3D.tsx`, `PlayPage.tsx`: renderer Three.js và chế độ chơi.
- `src/components/LearnPage.tsx`, `LearningCube.tsx`, `src/lib/learn.ts`, `learn.en.ts`, `stepVisual.ts`: bài học và hình trước/sau.
- `src/i18n.tsx`: chuyển đổi ngôn ngữ, hiện còn lớp dịch tương thích.
- `tests/`: kiểm thử Node theo `npm test`.
- `SPEC.md` + `SPEC.en.md`, `FORMULAS.md` + `FORMULAS.en.md`: tài liệu song ngữ.

## 5. Các quyết định nghiệp vụ cần giữ

1. **Nguồn sự thật của Rubik thật là xác nhận của người dùng.** Quay hoạt ảnh không tự đánh dấu xoay Rubik thật. Xem bước mẫu không tăng tiến độ.
2. Trạng thái toán học kiểm tra parity, orientation, các viên; solver phải mô phỏng và xác minh đích đã giải xong.
3. Khi xoay sai không rõ bước, yêu cầu quét hoặc nhập lại trạng thái thực tế thay vì tiếp tục lời giải sai.
4. Quét ảnh vẫn là **beta**: phép homography, trung vị màu, Hungarian assignment ràng buộc số ô màu, cảnh báo ô mơ hồ; không tự nhận diện mọi góc ảnh và không đảm bảo độ chính xác với ảnh thật.
5. Chế độ EN phải dùng tiếng Anh nhất quán, kể cả nội dung động, dialog, lỗi và accessibility. Tên tác giả giữ nguyên chữ Việt.
6. Mô phỏng bài học mặc định **không tự chạy**; chỉ chạy sau thao tác nhấn nút.
7. Ưu tiên UI mobile-first và an toàn WebGL; chỉ coi triển khai thành công nếu workflow GitHub Pages hoàn tất bước Deploy.

## 6. Tồn đọng / cải tiến tiếp theo

- **i18n debt:** `src/i18n.tsx` đang dùng catalog đối chiếu với câu Việt và cập nhật DOM làm lớp tương thích. Nên chuyển sang các **translation keys** cố định và dùng hàm `t(key, params)` trực tiếp trong React; thêm kiểm tra bản dịch thiếu để EN không lẫn VI.
- **Scan accuracy:** nhận diện tự động vị trí Rubik/ba mặt trong ảnh, kiểm thử trên nhiều thiết bị, ánh sáng, góc nghiêng và ảnh có phản xạ.
- **QA thực tế:** CI kiểm tra unit và build, **chưa chứng minh** tương tác chuột/touch/camera/WebGL trên thiết bị thật.
- **Đồng bộ tài liệu/metadata:** cập nhật README, tên package, version và nhãn thương hiệu khi thống nhất version phát hành.

## 7. Quy trình phát triển

```bash
npm ci
npm test
npm run build
npm run dev
```

- Luôn lấy source mới nhất từ `main` → tạo branch `feature/*` hoặc `fix/*` → code + test + cập nhật tài liệu VI/EN → Pull Request → kiểm tra CI → merge → xác nhận GitHub Pages Deploy.
- Không đưa secrets, token, mật khẩu vào tài liệu hoặc commit.
- Trước yêu cầu mới, đọc `AGENTS.md` và file này, sau đó kiểm tra GitHub để xác nhận thay đổi mới nhất.

## Cập nhật UX quét 2 ảnh

Chế độ quét đã tách trạng thái chụp (chỉ hiện khung 3 mặt) và trạng thái căn ảnh (chọn một mặt, 9 điểm màu, 4 tay nắm lớn, phóng to theo mặt và xem trước 3×3). CSS live video dùng `object-fit:cover` giống ảnh camera crop vuông. Có cảnh báo độ đồng đều mẫu màu nhưng không coi kiểm tra ảnh/khung là bằng chứng nhận dạng chính xác. Cần QA thực tế trên Safari iOS, Chrome Android và nhiều ảnh ánh sáng khác nhau.

## Cập nhật bài giảng trực quan và sửa công thức tầng cuối (11/2026)

- Bổ sung `src/lib/lessonDiagrams.ts`, `src/components/LessonCaseDiagram.tsx` để hiển thị sticker trên U cùng 4 dải màu F/R/B/L, cảnh báo ô chưa đúng hướng, mũi tên chuyển vị trí viên thật tính từ cubejs, hình trước và sau.
- Thư viện trường hợp bước 4–7 gồm chấm/L/vạch, Sune/Anti-Sune/0/2 góc vàng, A-perm/Y-perm (đèn pha/không đèn pha), Ua/Ub/H/Z. Mô phỏng 3D và bảng công thức hoạt động theo case đã chọn.
- Thay thuật toán hoán vị góc cũ không bảo toàn mặt vàng bằng A/Y; H/Z dùng ghép Ua+U để chỉ cần 6 ký hiệu mặt. Kiểm thử trong `tests/lesson-cases.test.mjs` đối chiếu tính hợp lệ các trường hợp và đường đi vị trí viên.
- Góc cầm khi học: U vàng, D trắng, F xanh dương; khi quét mặc định U trắng, F xanh lá. Không trộn hai quy ước.
- Cần test browser thực tế trên thiết bị trước khi đánh giá trải nghiệm dạy học đã hoàn hảo.

## Sửa lỗi 3D bài học giải hết Rubik ở mọi giai đoạn

Đã tách trạng thái bài giảng khỏi `Rubik đã giải + công thức đảo`. `src/lib/lessonScenario.ts` định nghĩa target từng giai đoạn: 1 dấu cộng trắng, 2 tầng trắng, 3 hai tầng dưới, 4 dấu cộng vàng, 5 mặt vàng, 6 hoán vị góc vàng, 7 hoàn thành toàn bộ khối. `LearningCube.tsx` và `lessonDiagrams.ts` dùng chung target/snapshot để hình và 3D không lệch nhau. Trạng thái kết thúc bước 1–6 phải **chưa giải toàn bộ**. Test trong `tests/lesson-cases.test.mjs` và `tests/step-visual.test.mjs` là điều kiện không được phá vỡ.
