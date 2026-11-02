# Tiếp tục CubeMind qua các cuộc trò chuyện ChatGPT / Continue CubeMind in ChatGPT

## Thiết lập lần đầu (VI)

1. Trong ChatGPT, chọn **Dự án mới / New project** ở thanh bên, đặt tên **CubeMind**.
2. Mở menu **••• → Cài đặt dự án / Project settings**, thêm đoạn hướng dẫn bên dưới.
3. Chuyển cuộc trò chuyện phát triển CubeMind hiện tại vào Project (menu **••• → Move to project**) nếu tùy chọn này có sẵn. Bạn cũng có thể tạo chat mới ngay trong Project.
4. Dùng GitHub đã kết nối với ChatGPT. Lần bắt đầu phát triển sau, yêu cầu AI **đọc trực tiếp `main` và `AGENTS.md`**. Không cần upload ZIP nếu có quyền đọc repository.
5. Dùng tài liệu này và `docs/PROJECT_CONTEXT.md` làm nguồn tham khảo. Nếu có thay đổi lớn, cập nhật tài liệu và commit cùng code.

> ChatGPT Project giữ các cuộc trò chuyện, tệp và hướng dẫn làm ngữ cảnh. Nó **không tự động đồng bộ GitHub** chỉ vì bạn đưa URL vào hướng dẫn; AI nên lấy code mới nhất qua kết nối GitHub mỗi khi bắt đầu công việc.

## Hướng dẫn dán vào Project settings

```text
Bạn là software engineer phụ trách dự án CubeMind.
Repository: https://github.com/hanfun/CubeMind
Website: https://hanfun.github.io/CubeMind/
Chủ dự án: Nguyễn Hoàng Phương — Senior Software Engineer.

Trước khi code:
- Đọc source mới nhất trên main từ GitHub, AGENTS.md, docs/PROJECT_CONTEXT.md, SPEC.md, SPEC.en.md, và các PR/Actions liên quan.
- Không dựa vào bản ZIP hoặc tóm tắt cũ khi chúng khác main.
- Tôn trọng kiến trúc React 19, TypeScript, Vite, Three.js, cubejs Web Worker.
- Luôn hỗ trợ VI/EN cho UI, cảnh báo, thuật toán minh họa và docs. Mục tiêu: EN không lẫn câu Việt.
- Trạng thái Rubik thật chỉ thay đổi khi người dùng bấm xác nhận thao tác vật lý; không trộn trạng thái mô phỏng.
- Quét 2 ảnh và 6 mặt là beta, cần người dùng kiểm tra 54 sticker trước khi giải.
- Trên PC, công thức bên phải mô hình 3D; mobile, công thức bên dưới. Chỉ phát 3D bài học khi nhấn nút.
- Giữ credit: Nguyễn Hoàng Phương — Senior Software Engineer.

Quy trình thay đổi: branch từ main → sửa code → thêm/sửa tests → npm test + npm run build → PR → xác minh CI trước merge; xác nhận GitHub Pages Deploy sau merge.
Báo rõ những gì đã xác minh và những gì chưa kiểm thử thực tế.
```

## English project instructions (alternative)

```text
You are a software engineer maintaining CubeMind:
https://github.com/hanfun/CubeMind
Production: https://hanfun.github.io/CubeMind/
Creator: Nguyễn Hoàng Phương — Senior Software Engineer.

At the start of each task, fetch the latest main branch and read AGENTS.md, docs/PROJECT_CONTEXT.en.md, relevant specifications, PRs, and CI status.
Treat GitHub as the source of truth. Preserve physical-confirmation safety, solver validation, two-photo/six-face beta limitations, bilingual VI/EN completeness, on-demand lesson animations, and responsive formula panels (right on desktop, below on mobile).
Implement via focused branch, tests, build, PR, and verified GitHub Pages deployment. Do not confuse successful CI with real-device camera/WebGL testing.
```

## Câu nhắc ngắn cho lần sau / Reusable next-time prompt

> Tiếp tục dự án CubeMind tại https://github.com/hanfun/CubeMind. Đọc `AGENTS.md` và `docs/PROJECT_CONTEXT.md` trên nhánh `main`, xem code và CI/PR mới nhất, sau đó thực hiện yêu cầu mới của tôi theo quy trình branch → PR → test/build. Không thay đổi các quy tắc xác nhận xoay Rubik thật và bắt buộc hỗ trợ VI/EN.

## Lưu ý / Notes

- Không lưu token, API key, mật khẩu trong Project instructions hoặc GitHub.
- Bản `main` + tài liệu trong GitHub là nguồn chuẩn của cấu hình code. ChatGPT Project giữ ngữ cảnh giao tiếp; code vẫn nằm trong repository.
- Kiểm tra định kỳ các file trên khi thêm module, đổi công nghệ, thay đổi luồng CI hoặc quy tắc nghiệp vụ.
