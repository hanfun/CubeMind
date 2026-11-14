# CubeMind — Sổ tay công thức Rubik 3×3

**Ngôn ngữ:** [Tiếng Việt](FORMULAS.md) · [English](FORMULAS.en.md)

Các công thức dưới đây dùng cho **trường hợp mẫu** trong phương pháp giải 7 giai đoạn dành cho người mới. Đây **không phải** 7 công thức có thể tự giải mọi khối Rubik nếu dùng nối tiếp. Cần kiểm tra màu, vị trí viên và hướng cầm Rubik trước khi xoay.

## Quy ước

- **U**: mặt trên; **D**: mặt dưới; **L**: mặt trái; **R**: mặt phải; **F**: mặt trước; **B**: mặt sau.
- **R**: xoay mặt phải 90° theo chiều kim đồng hồ khi **nhìn trực diện mặt phải**.
- **R'**: xoay mặt phải 90° ngược chiều kim đồng hồ; **R2**: xoay mặt phải 180°.
- Khi học phương pháp cơ bản, giữ **trắng ở dưới** và **vàng ở trên**. Không xoay toàn khối trong khi thực hiện một công thức, trừ khi hướng dẫn yêu cầu.

## Bảng công thức — các trường hợp đã kiểm tra

**Quan trọng:** Chọn trường hợp theo *cả ảnh trên U lẫn các màu cạnh bên*. Các công thức trong bảng được minh họa bằng cách tạo trạng thái khởi đầu hợp lệ, chạy công thức và so sánh kết quả bằng `cubejs` trong unit test. Chúng không phải một chuỗi để thực hiện liên tục trên mọi khối.

| Giai đoạn | Trường hợp | Công thức |
|---|---|---|
| 1. Cạnh trắng | Nửa vòng mặt trước (ví dụ) | `F2` |
| 2. Góc trắng | Tay phải (ví dụ) | `R U R' U'` |
| 3. Tầng giữa | Đưa cạnh sang phải | `U R U' R' U' F' U F` |
| 3. Tầng giữa | Đưa cạnh sang trái | `U' L' U L U F U' F'` |
| 4. Cạnh vàng | Đường ngang, giữ ngang | `F R U R' U' F'` |
| 4. Cạnh vàng | Chữ L trên-trái | `F U R U' R' F'` |
| 4. Cạnh vàng | Dạng chấm (một trường hợp ghép) | `F U R U' R' F' U F R U R' U' F' U'` |
| 5. Mặt vàng | Sune (1 góc hướng lên) | `R U R' U R U2 R'` |
| 5. Mặt vàng | Anti-Sune (1 góc) | `R U2 R' U' R U' R'` |
| 5. Mặt vàng | 2 góc hướng lên (ví dụ ghép) | `R U R' U R U2 R' U R U2 R' U' R U' R' U'` |
| 5. Mặt vàng | 0 góc hướng lên (ví dụ ghép) | `R U R' U R U2 R' R U R' U R U2 R'` |
| 6. Hoán vị góc | Đèn pha phía sau — A-perm | `R' F R' B2 R F' R' B2 R2` |
| 6. Hoán vị góc | Không đèn pha — Y-perm | `F R U' R' U' R U R' F' R U R' U' R' F R F'` |
| 7. Hoán vị cạnh | Ua, giữ cạnh đúng ở sau | `R U' R U R U R U' R' U' R2` |
| 7. Hoán vị cạnh | Ub, giữ cạnh đúng ở sau | `R2 U R U R' U' R' U' R' U R'` |
| 7. Hoán vị cạnh | H, hai cặp đối diện | `Ua U Ua U'` (thay Ua bằng công thức ở trên) |
| 7. Hoán vị cạnh | Z, hai cặp kề | `Ua U' Ua U` (thay Ua bằng công thức ở trên) |

### Lỗi bài giảng cũ đã sửa

Công thức `U R U' L' U R' U' L` trước đây gắn với bước 6 **không giữ nguyên mặt vàng** nên gây sai ngữ cảnh sau khi hoàn thành bước 5. Bước 6 nay sử dụng A-perm/Y-perm, được kiểm thử để giữ nguyên 9 ô vàng trên U và hai tầng dưới.

H/Z có các công thức ngắn hơn dùng `M` (middle slice). Vì bộ ký hiệu 3D hiện chỉ hỗ trợ U/D/L/R/F/B, bài học dùng hai lần Ua với bước xoay U ở giữa. Trên website, hai công thức này được triển khai thành chuỗi move đầy đủ có thể chạy từng bước.

### Cách đọc sơ đồ

- **U nằm trên**, **D trắng nằm dưới**. Ở bài học đang dùng quy ước lật khối, **F là xanh dương**, **B là xanh lá**; đừng nhầm với hướng ban đầu của màn hình quét.
- Hình lớn minh họa cả 3×3 mặt U **và các dải màu cạnh bên** (B ở phía trên hình, F ở phía dưới).
- **Mũi tên xanh:** vị trí nguồn → vị trí đích của chính viên góc/cạnh sau công thức; không phải chiều quay camera.
- **Góc đúng vị trí** có bộ ba màu khớp các tâm, không nhất thiết được xác định chỉ từ màu nhìn lên trên.
- Cặp **đèn pha (headlights)**: hai sticker góc trên cùng một mặt bên có cùng màu. Với A-perm trong ví dụ, giữ đèn pha tại B; với Y-perm không có mặt nào có đèn pha.
- Mỗi trường hợp minh họa là **một trạng thái toán học cụ thể**. Nếu Rubik thật khác ảnh, hãy chọn trường hợp khác hoặc điều chỉnh hướng trước khi thực hành.

Nguồn đối chiếu trường hợp PLL: [4-look Last Layer — speedcubing.org](https://speedcubing.org/pages/4-look-last-layer-tutorial) và [Rubik's Cube Beginner Method](https://rubikscube.ampli.fi/beginner_new.html).

## Minh họa trong website

Mở **Học giải Rubik → 7 bước giải → chọn giai đoạn và trường hợp**. Website hiển thị mô hình Rubik 3D và bảng công thức đầy đủ. Trên PC, bảng nằm **bên phải**; trên điện thoại, bảng nằm **bên dưới** mô hình.

Khi bấm **Xoay 1 bước**, công thức đang chạy được tô sáng. Mỗi bước có hình **Trước / Sau** của mặt cần xoay, mũi tên chỉ hướng và chỉ dẫn góc nhìn. **Xem toàn bộ** chạy tuần tự; **Lùi 1 bước** quay lại trạng thái để quan sát. Không tự phát mô phỏng khi mới mở bài học.

Ở màn hình **Tự giải Rubik thật**, bên cạnh mô hình 3D là **chuỗi lời giải thực sự do Solver tính cho khối đang quét**; không được gọi nhầm đó là công thức của một trường hợp bài học. Tiến độ Rubik thật chỉ được tăng khi bấm xác nhận đã xoay.

> **Lưu ý:** Hình trước/sau được dựng từ trạng thái minh họa chính xác của thuật toán. Chúng **không xác nhận** người dùng đã xoay đúng khối thật.

## Các phương pháp giải khác và thứ tự học

| Phương pháp | Trình tự chính | Tình trạng công thức CubeMind |
|---|---|---|
| Beginner | Dấu cộng trắng → góc trắng → tầng giữa → dấu cộng vàng → mặt vàng → hoán vị góc → cạnh | Bảy bài mẫu với 3D và công thức đã kiểm chứng, chưa phủ mọi tình huống |
| CFOP 2-look | Cross → F2L → OLL hai lượt (cạnh + góc) → PLL hai lượt (góc + cạnh) | Có các case luyện OLL/PLL liên quan; thiếu nhiều trường hợp F2L và OLL đầy đủ |
| CFOP Full | Cross → F2L → OLL 57 trường hợp → PLL 21 trường hợp | Mới là lộ trình, chưa có đủ bộ thuật toán |
| Roux | Hai khối 1×2×3 → CMLL → LSE dùng M/U | Lộ trình hướng dẫn, chưa có công thức/3D Roux đầy đủ |
| ZZ | EOLine → ZZF2L → tầng cuối | Lộ trình hướng dẫn, chưa có engine EO/EOLine và 3D riêng |

**Không trộn thuật toán:** 3D giải tự động vẫn lấy dãy move tối ưu từ `cubejs` Kociemba, **không phải** lời giải theo CFOP/Roux/ZZ. Ví dụ 3D trong từng chặng được tái sử dụng khi có cùng kỹ thuật và đã xác minh, không được hiểu là một lời giải hoàn chỉnh cho mọi trạng thái.

Tài liệu tham khảo: [J Perm CFOP](https://www.jperm.net/3x3/cfop), [Roux](https://bradleykh.github.io/CubeTools/tutorials/roux/), [ZZ](https://cuborithm.com/methods/zz).
