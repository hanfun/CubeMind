# Rubik Studio — Web App giải và học Rubik 3×3 (MVP 0.3)

Source MVP dựa trên `RUBIK_MANUAL_STEP_GUIDE_SPEC.md`, có quét/tải ảnh 2 góc hoặc 6 mặt (beta) và chế độ chơi Rubik 3D tương tác, và màn hình học giải Rubik tiếng Việt với mô phỏng 3D chạy theo nút bấm.

## Chạy project

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`. Để thử camera trên **điện thoại thật**: deploy qua HTTPS, hoặc tạo HTTPS tunnel khi phát triển.

Build bản production:

```bash
npm run build
npm run preview
```

Unit tests (core, không cần React):

```bash
npm test
```

## Chức năng đã tạo

- **Chuỗi trộn:** người dùng nhập một chuỗi U/R/F/D/L/B (+ `'`, `2`), thực hiện chuỗi này lên Rubik thật đã hoàn chỉnh và hệ thống tính lời giải từ trạng thái vừa trộn.
- **54 ô màu:** editor mặt U/R/F/D/L/B, tô từng sticker; mặt trung tâm khóa để tránh nhập sai orientation.
- **Quét hoặc tải ảnh 6 mặt — beta:** camera hoặc file ảnh (nếu không cấp quyền camera); dùng khung 3×3, lấy mẫu RGB, phân loại bằng màu tâm và hiệu chỉnh qua editor. **Không tự nhận diện đầy đủ hướng của khối trong mọi ảnh; không đảm bảo mọi điều kiện ánh sáng.**
- **Quét nhanh 2 góc — beta:** chụp camera hoặc tải 2 ảnh, mỗi ảnh lấy mẫu 3 mặt. Người dùng kéo chỉnh 4 góc từng mặt, xác nhận 54 ô; bộ kiểm tra toán học và solver xác minh trước khi giải. **Không tự động phát hiện khung Rubik trong ảnh tùy ý; cần căn thủ công.**
- **Kiểm tra Rubik:** 54 sticker, mỗi màu 9, tâm, hoán vị góc/cạnh, orientation, parity.
- **Solver:** `cubejs` (Kociemba two-phase) chạy trong Web Worker, tạo các snapshots và xác minh cuối cùng là trạng thái giải xong.
- **Rubik 3D:** `cubing.js` `TwistyPlayer` với timeline được kiểm soát qua adapter React.
- **Giải từng bước:** confirm mới tăng tiến độ; demo không tăng; playback speed; hoàn tác vật lý với xác nhận riêng; recovery; localStorage restore với cảnh báo; auto mode tách biệt.
- **Học giải bằng tiếng Việt:** màn hình riêng có từ điển 6 mặt U/D/L/R/F/B, quy ước dấu nháy và `2`; 7 giai đoạn cơ bản (dấu cộng trắng → hoàn thiện cạnh vàng); từng trường hợp có mục tiêu, cách cầm, thuật toán, lưu ý, và Rubik 3D minh họa.
- **Hoạt ảnh bài học do người dùng điều khiển:** mặc định đứng yên; chỉ chạy khi bấm **Xem toàn bộ** hoặc **Xoay 1 bước**. Có **Lùi 1 bước**, **Đặt lại**, điều chỉnh tốc độ. Không ảnh hưởng phiên giải Rubik thật.
- **Giao diện:** responsive mobile-first, dark mode, PWA service worker cơ bản.

## Kiến trúc

```
src/
  components/
    CameraScanner.tsx   # Scan 6 mặt / calibration
    FaceletEditor.tsx   # Tô màu 54 ô
    TwistyCube.tsx      # 3D adapter (cubing.js)
    Guide.tsx           # Manual/auto view, undo/recovery
    LearnPage.tsx       # Bài học tiếng Việt, notation + 7 giai đoạn
    LearningCube.tsx   # Viewer 3D tương tác, chỉ play khi bấm nút
  lib/
    cube.ts             # Parser + validator toán học
    learn.ts            # Dữ liệu bài học và thuật toán mẫu
    color.ts            # Calibration & Lab / RGB
    guide.ts            # Session, reducer, persistence
    solver.ts           # Worker adapter
  workers/
    solver.worker.ts    # Solver và snapshots
  App.tsx
  styles.css
```

## Luồng thực tế

1. Chọn nhập **chuỗi trộn**, **54 ô màu** hoặc **camera/tải ảnh 2 góc hoặc 6 mặt**.
2. Kiểm tra trạng thái Rubik; nếu hợp lệ thì solver trả về lời giải; mô phỏng kiểm tra kết quả.
3. Chọn **Tự giải từng bước** hoặc **Xem 3D tự động**.
4. Trong thủ công: viewer luôn thể hiện trạng thái đã xác nhận, trừ khi đang xem demo. Chỉ nhấn “Tôi đã xoay xong” sau khi thực hiện Rubik thật.
5. Muốn quay lại thật: thực hiện bước nghịch đảo và xác nhận. Không được đánh đồng scrub/demo với physical state.

## Màn hình Học giải Rubik

- Từ trang chủ bấm **Học giải Rubik** (hoặc nút trong thanh điều hướng).
- Tab **Quy ước ký hiệu**: xem 6 mặt và luyện `R`, `R'`, `R2` hoặc các mặt khác.
- Tab **7 bước giải cơ bản**: chọn giai đoạn, chọn ví dụ, đọc điều kiện áp dụng và bật hoạt ảnh 3D **theo yêu cầu**.
- Ví dụ được dựng là một trạng thái Rubik **minh họa bằng công thức đảo ngược từ khối đã hoàn chỉnh**, không phải camera nhận dạng tình huống trên khối thật. Chỉ dùng công thức khi đã xác định đúng trường hợp và góc cầm.
- **Hướng cầm khi học**: trắng ở dưới, vàng ở trên. Đây là tư thế dạy tầng cơ bản; màn hình quét mặc định lại dùng U trắng/F xanh/R đỏ. Không trộn hai hệ quy chiếu khi thực hành.

## Cảnh báo kỹ thuật

1. `experimentalSetupAlg` của cubing.js là API thử nghiệm. Đã pin `cubing@0.66.1`; trước khi nâng cấp cần kiểm thử 3D và orientation.
2. `cubejs` dùng giả định sticker `U R F D L B`. Theo quy ước màu viewer: **U trắng, R đỏ, F xanh lá, D vàng, L cam, B xanh dương**.
3. Cả 6 mặt và 2 góc đều là **beta**: cần căn lưới/điểm góc thủ công trước khi lấy mẫu, định dạng ảnh phụ thuộc trình duyệt, và chỉ kiểm tra màu + quy tắc Rubik. Không có CV tự phát hiện 3 mặt bất kỳ, không kiểm thử HEIC/iOS thực tế.
4. Confirm là **xác nhận của user**, chưa phải computer vision xác minh Rubik vật lý. Hoạt ảnh học giải cũng không thay đổi trạng thái phiên solve.
5. `cubejs` tạo bảng solver trong Worker trên thiết bị: lần đầu có thể mất vài giây. Offline chỉ ổn định sau khi tài nguyên đã được tải/cache lần đầu.
6. PWA dùng manifest icon SVG (một số nền tảng cần tạo PNG 192/512 riêng để hỗ trợ install tốt nhất).

## Acceptance tests tiếp theo

- Test thiết bị iPhone Safari, Android Chrome thực tế.
- Chuẩn hóa camera 6 mặt với mapping hướng U/R/F/D/L/B bằng overlay chi tiết hơn.
- Nâng cấp scan 2 góc từ căn phối cảnh thủ công thành tự phát hiện ba mặt/định hướng bằng OpenCV.js hoặc mô hình CV, kiểm tra chất lượng ảnh và đối chiếu hai lượt.
- E2E WebGL trên điện thoại, kiểm thử resume/offline, WCAG.

## Tham khảo

- cubing.js: https://js.cubing.net/cubing/twisty/
- cubejs: https://www.npmjs.com/package/cubejs

## Tình trạng kiểm thử phiên bản này

- Đã chạy `npm test`: **18/18 bài test đạt** cho logic lõi, xử lý ảnh, scan hai góc và dữ liệu bài học.
- **Chưa xác minh `npm run build` hoặc WebGL trên trình duyệt thật** vì môi trường bàn giao không thể kết nối npm registry để tải thư viện React/cubing.js. Người nhận cần `npm install` rồi `npm run build` trên máy có Internet.
- Bản học giải 3D dùng thuộc tính `experimentalSetupAlg` và `play()` của cubing.js; nên kiểm tra hoạt ảnh trên Android Chrome và iOS Safari trước khi release.

## Mới ở phiên bản 0.3 — Chơi Rubik 3D tương tác

- Vào trang chủ, bấm **Chơi Rubik 3D** hoặc nút **Chơi 3D** trên thanh điều hướng.
- Khối Three.js 26 viên hiển thị màu U trắng, R đỏ, F xanh lá, D vàng, L cam, B xanh dương.
- **Máy tính:** kéo chuột trực tiếp qua hàng/cột ngoài để xoay tầng tương ứng; kéo chuột ở vùng trống để quay toàn khối và scroll để zoom. Có nút bật **Chỉ đổi góc nhìn**, nút từng mặt và phím `R/L/U/D/F/B` (`Shift` để đảo chiều).
- **Điện thoại:** vuốt 1 ngón trực tiếp trên viên ngoài để xoay tầng; vuốt vùng trống hoặc bật chế độ đổi góc nhìn để xoay góc nhìn; thao tác cảm ứng được nhận qua Pointer Events, không kích hoạt cuộn trang trong vùng WebGL.
- **Trộn 22 bước**, **Hoàn tác**, **Chơi lại**, tự lưu lịch sử xoay vào localStorage và khôi phục sau tải lại.
- **Gợi ý bước tiếp theo:** tính lời giải theo trạng thái hiện tại bằng `cubejs` Worker; xem một bước, xem trước 3D rồi hoàn nguyên, hoặc áp dụng bước.
- **AI giải nhanh:** dùng chính thuật toán Kociemba two-phase **chạy cục bộ, không dùng mô hình ngôn ngữ hoặc dịch vụ AI trả phí**. Mô phỏng toàn bộ chuỗi lời giải dưới dạng các lượt xoay có thể dừng. Luôn kiểm tra lời giải trước khi hiển thị.
- **Không đồng nhất orbit camera với face turns**. Trạng thái giải được tính từ lịch sử thao tác logic; thay đổi góc nhìn không đổi trạng thái.
- Chuyển về màn hình Quét/Học vẫn giữ dữ liệu chơi cho lần truy cập lại. Phần chơi 3D độc lập với phiên quét và phiên giải Rubik thật.
- Cài thêm `three` và `@types/three` qua `npm install`.

**Kiểm thử giới hạn:** Các unit test kiểm tra ánh xạ hướng xoay, vuốt chuyển thành move, chuỗi trộn và dữ liệu lưu. Cần chạy `npm install && npm run build` và kiểm tra thực tế render WebGL, raycasting, pointer drag và pinch zoom trên Chrome Android/Safari iOS. Môi trường tạo source không kết nối npm registry nên chưa xác nhận build giao diện ở đây.
