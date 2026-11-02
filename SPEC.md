# RUBIK SOLVER 3×3 — Đặc tả chế độ hướng dẫn xoay Rubik thật từng bước

**Phiên bản:** 1.0  
**Phạm vi:** Web App mobile-first; React + Vite + TypeScript; hỗ trợ đầu vào từ quét 2 góc (mỗi góc 3 mặt) hoặc quét từng mặt (6 ảnh).  
**Ưu tiên:** Đúng trạng thái vật lý > đúng hoạt ảnh > tốc độ.  
**Tính chất:** Đặc tả để AI agent triển khai, không phải mã chạy sẵn.

## 1. Mục tiêu và ranh giới

Sau khi scan, hệ thống tái dựng đủ 54 facelet, xác định thứ tự/hướng 6 mặt, validate tính khả giải và tính solution. Cho người dùng chọn:

- **Xem giải tự động 3D:** Trình diễn toàn bộ chuỗi move, **không** ghi nhận rằng người dùng đã xoay khối thật.
- **Tự giải từng bước (phạm vi tài liệu này):** Mỗi lần chỉ hướng dẫn 1 move; người dùng thao tác trên Rubik thật rồi **chủ động xác nhận** trước khi sang move tiếp theo.

MVP dùng Rubik 3×3 thông thường, 6 màu với tâm cố định; hỗ trợ `U D L R F B`, hậu tố `'` (ngược chiều), `2` (180°). Cả `R2` là **một move / một bước** theo cách đếm thống nhất. Không tự nhận biết Rubik thật đã xoay đúng chỉ qua việc bấm nút. Camera kiểm tra lại là tính năng nâng cao và phải được mô tả đúng như vậy.

## 2. Luồng tổng thể và điều kiện mở màn hướng dẫn

```
Scan 2 góc / 6 mặt
  -> nhận diện màu + lập bản đồ orientation
  -> 54 facelet / cube state
  -> kiểm tra 9 ô mỗi màu, 6 tâm, 8 góc, 12 cạnh,
     tổng orientation và parity
  -> dựng state S0
  -> solver trả về moves[0..N-1]
  -> mô phỏng S0 + toàn bộ moves = solved
  -> màn hình kết quả (số bước thật từ solver)
  -> chọn AUTO_DEMO hoặc MANUAL_GUIDE
```

**Chặn vào màn hướng dẫn** nếu không đủ tin cậy/không hợp lệ/chưa xác minh được kết quả giải. Khi scan hoặc ánh xạ 6 mặt không chắc chắn, cho phép sửa màu/quét lại; không chọn ngẫu nhiên một trạng thái chỉ vì solver chấp nhận. Nếu `N = 0`, chuyển thẳng màn hình “Rubik đã hoàn thành”.

## 3. Giao diện mobile-first

### 3.1 Màn hình chọn cách giải sau khi scan

- Badge “Rubik hợp lệ”, màu tâm và mô hình 3D tương ứng; số bước được solver tính thực tế.
- Hai lựa chọn: **Xem 3D tự giải** và **Tự xoay Rubik theo hướng dẫn**.
- Nút “Bắt đầu”; không tự chạy khi người dùng chưa chọn.

### 3.2 Màn hướng dẫn — cấu trúc từ trên xuống

1. **Header:** Quay lại; “Bước 4 / 23”; trạng thái Đang hướng dẫn / Đang xem mẫu / Cần xác nhận; menu trợ giúp.
2. **3D viewer (chiếm khu vực chính):** Rubik ở `confirmedState`, có thể xoay *góc camera ảo* bằng ngón tay nhưng không sửa trạng thái logic. Có nút “Đưa góc nhìn về mặc định”.
3. **Nhận diện mặt cố định:** Hiển thị `Trên = màu tâm U`, `Trước = màu tâm F`, `Phải = màu tâm R` (theo scan đã khóa). Yêu cầu người dùng giữ/đưa Rubik thật về tư thế tham chiếu khi thao tác. Lệnh luôn được diễn giải trong hệ trục của 6 tâm, không theo góc camera 3D tạm thời.
4. **Thẻ move hiện tại:** Ký hiệu lớn (`R'`, `U2`...), tên mặt, số độ, chiều, cách nhìn mặt để xác định chiều (clockwise nhìn thẳng **vào chính mặt đang xoay**). Mũi tên đồ họa gắn với layer được chọn; hỗ trợ trường hợp mặt khuất bằng thay đổi camera *chỉ về mặt hiển thị*, không đổi trục logic.
5. **Điều khiển hoạt ảnh mẫu:** “Xem mẫu”, “Xem lại”, tốc độ `0.5× / 1× / 1.5×` (mặc định chậm), “Tạm dừng”, “Đặt lại góc nhìn”. Xem mẫu phải có điểm bắt đầu/kết thúc rõ ràng.
6. **CTA luôn nhìn thấy ở đáy:** Nút chính **“Tôi đã xoay xong”**, chỉ khả dụng ở trạng thái chờ xác nhận; nút phụ “Tôi xoay sai / Cần trợ giúp”. Nút đủ lớn cho một tay; cung cấp phản hồi haptic nếu thiết bị hỗ trợ, không phụ thuộc vào rung.
7. **Tiến độ:** Thanh tiến độ theo `confirmedCount / totalMoves`, không theo số frame hoạt ảnh; hiển thị bước liền trước/sau như thông tin tham khảo, không cho nhảy xác nhận bừa.

### 3.3 Ví dụ

```
Rubik Solver                         [?]
Bước 04 / 23                      3 đã xong
[              RUBIK 3D             ]
      Trên: Vàng     Trước: Xanh lá

               R'
Xoay mặt PHẢI 90° ngược chiều kim đồng hồ
(khi nhìn trực diện mặt phải của khối)

[ Xem mẫu ] [ Xem lại ] [ 0.5× ]

[       TÔI ĐÃ XOAY XONG          ]
[  Tôi xoay sai / không chắc chắn ]
```

Khi `R2`, hiển thị “Xoay 180°” và có thể animate bằng hai chặng 90° liên tiếp, nhưng vẫn **chỉ một lần xác nhận**.

## 4. Mô hình dữ liệu

```ts
type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B';
type MoveToken = string; // parse & validate: ^[UDLRFB](2|')?$
type GuideStatus =
  | 'READY' | 'DEMONSTRATING' | 'WAIT_CONFIRM'
  | 'RECOVERY' | 'UNDO_WAIT_CONFIRM' | 'COMPLETED';

type SolveSession = {
  id: string;
  initialState: CubeState;      // immutable, đã validate
  faceCenters: Record<Face, CubeColor>;
  moves: MoveToken[];          // immutable, từ solver đã xác minh
  snapshots: CubeState[];      // N+1: S[0] tới S[N]
  confirmedCount: number;      // 0..N, move thật được user xác nhận
  status: GuideStatus;
  preview?: { moveIndex: number; phase: 'before' | 'animating' | 'after' };
  uncertain: boolean;          // báo không khớp trạng thái thật
  updatedAt: number;
};
```

- `snapshots[0] = initialState`.
- `snapshots[i+1] = applyMove(snapshots[i], moves[i])`.
- Bất biến: `confirmedState === snapshots[confirmedCount]` **về mặt hệ thống**; chỉ có nghĩa là trạng thái người dùng *đã xác nhận*, không đảm bảo camera đã kiểm tra thật.
- `preview` là trạng thái hiển thị tạm, **không** sửa `confirmedCount`, không ghi tiến độ.
- `currentMove = moves[confirmedCount]` khi `confirmedCount < moves.length`.
- Không lưu “đã hoàn thành” khi chưa có xác nhận move cuối (hoặc tái quét xác minh).

## 5. State machine và event

| Trạng thái | Trigger | Điều kiện | Kết quả |
|---|---|---|---|
| READY | START | N>0 | WAIT_CONFIRM, viewer=S[0] |
| WAIT_CONFIRM | SHOW_DEMO / REPLAY | move còn lại | DEMONSTRATING, render S[k] -> S[k+1] |
| DEMONSTRATING | DEMO_FINISHED | token animation hiện hành khớp | WAIT_CONFIRM, trở về góc/khung của S[k] hoặc hiển thị hai trạng thái có nhãn; không commit |
| DEMONSTRATING | PAUSE / RESUME | animation hiện hành | chỉ thay đổi playback; không commit |
| WAIT_CONFIRM | CONFIRM_MOVE | không uncertain, không đang animation, không pending | confirmedCount=k+1; viewer=S[k+1]; sang WAIT_CONFIRM hoặc COMPLETED |
| WAIT_CONFIRM | REPORT_WRONG / UNSURE | bất kỳ | RECOVERY; khóa xác nhận |
| RECOVERY | REPLAY_INSTRUCTION | không đổi cube thật | trình diễn lại từ confirmedState; không commit |
| RECOVERY | RESCAN | người dùng đồng ý | tái quét thực tế, validate, solver lại; thay session và lưu lịch sử tùy chọn |
| WAIT_CONFIRM | REQUEST_UNDO_LAST | k>0 | hướng dẫn xoay ngược `moves[k-1]`; chuyển UNDO_WAIT_CONFIRM |
| UNDO_WAIT_CONFIRM | CONFIRM_PHYSICAL_UNDO | người dùng đã xoay ngược ngoài đời | k=k-1; viewer=S[k]; WAIT_CONFIRM |
| UNDO_WAIT_CONFIRM | CANCEL | chưa xoay thật | giữ k; WAIT_CONFIRM |
| COMPLETED | RESTART_GUIDE | chỉ khi xác nhận reset/thực trạng vật lý | không được tự coi khối thật đã trở về trạng thái đầu |

**Quan trọng:** “Bước trước” dùng để *xem lại* thì chỉ thay đổi vùng preview/hướng dẫn, không cập nhật tiến độ khối thật. Muốn lùi tiến độ thật phải thực hiện **xoay ngược move đã xác nhận** và xác nhận riêng. Nếu người dùng đã xoay ngược nhưng lại bấm “Hủy”, đề nghị xác minh/tái quét thay vì lặng lẽ giữ session.

## 6. Trình tự thao tác một move

Giả sử `moves = [R, U, R', U']`, đang ở `k=1` (đã xác nhận `R`; bước hiện tại `U`):

1. Renderer hiện `S[1]`, chỉ rõ mặt trên và mặt trước tham chiếu, highlight mặt U.
2. Người dùng nhấn “Xem mẫu”. Viewer animate bản sao `S[1] -> S[2]`; nút xác nhận tạm khóa trong thời gian animate. Cuối demo trở về `S[1]` (hoặc đối chiếu trước/sau có nhãn rõ ràng) để không ngộ nhận đã xoay khối thật.
3. Người dùng tự xoay **mặt U thật** và bấm “Tôi đã xoay xong”.
4. Controller commit `confirmedCount=2`, hiện `S[2]` ngay, lưu session. Bước tiếp theo là `R'`.
5. Không có thao tác tự động nào chuyển step khi chỉ mới chạy xong animation mẫu.

Trong trường hợp demo 3D ở phía sau diễn đạt trạng thái sau bước, phải có dòng “Đây chỉ là mô phỏng; Rubik thật chưa được xác nhận”. Thiết kế khuyến nghị: render kết quả tạm rồi đưa 3D quay về `S[k]` trước khi mở lại CTA.

## 7. Hai chế độ giải phải chia sẻ lõi nhưng khác tiến độ

- `CubeEngine`: `applyMove`, `validateState`, `isSolved`, `parseMoves`.
- `Solver`: cho chuỗi move đã được xác minh từ `S0`.
- `AnimationAdapter`: `showState(S)`, `demoMove(S,move,speed)`, `resetView()`; demo không ảnh hưởng domain state.
- `ManualGuideController`: xác nhận người thật, sửa sai, undo, persist.
- `AutoDemoController`: timeline mô phỏng độc lập, có play/pause/scrub. **Không được update `confirmedCount`.**

Khi chuyển AUTO -> MANUAL: chọn “Bắt đầu hướng dẫn từ tiến độ Rubik thật” (`confirmedCount`), hoặc “Bắt đầu từ đầu” **chỉ khi** Rubik thật đang ở `S0`. Không đồng bộ physical progress theo vị trí timeline Auto. MANUAL -> AUTO: demo có thể phát từ đầu hoặc từ `S[confirmedCount]`, nhưng không thay đổi physical progress.

## 8. Orientation và quy ước lệnh

- Khi scan, lập `faceCenters` và khóa ánh xạ 6 mặt: `U,D,L,R,F,B`. Sau đó mọi move/3D đều dùng hệ trục này.
- Chỉ xoay cả khối trên tay không làm đổi cube state logic, nhưng làm thay đổi hướng hiểu R/U/F so với người dùng. Do đó màn hình luôn có nhắc “Giữ màu tâm ... phía trên, màu tâm ... phía trước”, có hướng dẫn đưa tư thế về đúng trước mỗi move.
- Viewer cho phép orbit camera để nhìn dễ hơn; **orbit camera không thay đổi tên mặt hoặc các phép xoay trong solver**.
- `R` là xoay 90° theo chiều kim đồng hồ khi **nhìn thẳng vào mặt R**; `R'` ngược chiều; `R2` 180°. Tương tự cho 5 mặt còn lại. Không giải thích clockwise từ góc nhìn camera tổng quan.
- Thêm sơ đồ mũi tên/layer, nhãn màu tâm và mặt có liên quan; ưu tiên không phụ thuộc chỉ vào màu vì hỗ trợ người mù màu.

## 9. Xử lý lỗi và phục hồi

1. **Bấm nhầm “Đã xoay” khi chưa xoay:** Không thể tự kết luận Rubik thật khớp; đưa ra lối vào “Tôi xác nhận nhầm”, hướng dẫn xem và thực hiện lại thao tác vừa ghi nhận, hoặc tái quét.
2. **Xoay sai chiều / sai mặt:** Nếu biết chắc thao tác sai, hướng dẫn đảo ngược thao tác **sai đã thực hiện**, không đảo ngược mặc định `expectedMove`. Nếu không chắc, tái quét và giải lại từ trạng thái thực tế.
3. **Xoay xong nhưng quên xác nhận:** Giải thích rằng hệ thống đang ở bước chưa xác nhận; người dùng chọn “Tôi đã xoay xong”, không xem mẫu như một lần xoay thật.
4. **Chuyển tab/điện thoại khóa màn hình:** Pause hoạt ảnh; giữ `confirmedCount`; khôi phục trạng thái viewer từ snapshot; nếu không chắc physical cube vẫn tương ứng, hiện xác nhận tình trạng trước khi tiếp tục.
5. **Nút nhấn liên tiếp:** Reducer xử lý event tuần tự, khóa double-submit, mỗi move chỉ commit tối đa một lần theo `sessionId + moveIndex`.
6. **Mất phiên / reload:** Lưu bản session nhỏ tại IndexedDB/local storage theo consent phù hợp; khi mở lại hỏi “Rubik thật vẫn ở đúng trạng thái bước X?”; không âm thầm tiếp tục.
7. **Khối ban đầu đã hoàn thành:** `N=0`, hiển thị Completed; không để bước 1/0.
8. **Khi quay lại từ history hoặc dùng browser back:** Không xoá session; không tự hoàn tác bước thật.
9. **Khối đã bị trộn thêm trong lúc nghỉ:** Đưa vào RECOVERY và quét lại; không dùng session cũ.
10. **Không thể hiển thị WebGL:** fallback 2D mặt/ảnh minh họa và văn bản, vẫn giữ logic confirmation.

## 10. Phác thảo reducer TypeScript

```ts
type GuideAction =
  | { type: 'START' }
  | { type: 'DEMO_START' }
  | { type: 'DEMO_FINISH'; moveIndex: number; animationId: string }
  | { type: 'CONFIRM_MOVE'; moveIndex: number }
  | { type: 'REPORT_WRONG' }
  | { type: 'REQUEST_UNDO' }
  | { type: 'CONFIRM_UNDO' }
  | { type: 'CANCEL_UNDO' }
  | { type: 'RESUME_AFTER_RESCAN'; newSession: SolveSession };

function confirmMove(s: SolveSession, moveIndex: number): SolveSession {
  if (s.status !== 'WAIT_CONFIRM' || s.uncertain) return s;
  if (moveIndex !== s.confirmedCount) return s; // chặn stale/double taps
  if (s.confirmedCount >= s.moves.length) return s;
  const next = s.confirmedCount + 1;
  return {
    ...s,
    confirmedCount: next,
    preview: undefined,
    status: next === s.moves.length ? 'COMPLETED' : 'WAIT_CONFIRM',
    updatedAt: Date.now(),
  };
}
```

**Lưu ý triển khai:** Đây là pseudocode cho domain; cần xác định logic animation cancellation/ID và chuyện `DEMO_FINISH` cũ đến trễ sau khi đổi trang. Animation phải dùng `AbortController`/epoch ID; chỉ kết quả của animation hiện tại mới được cập nhật UI. Trong trạng thái DEMONSTRATING, UI phải vô hiệu hóa CTA xác nhận. Persist khi reducer xác nhận chuyển bước, tránh lưu liên tục theo frame.

## 11. Renderer và thư viện

- React + Vite + TypeScript, thiết kế mobile-first/PWA.
- Gợi ý `cubing.js` (`TwistyPlayer`) để hiển thị 3D và timeline; lõi `cubing/kpuzzle` có thể giúp tính transformations. Xem tài liệu chính thức: https://js.cubing.net/cubing/twisty/ và https://js.cubing.net/cubing/kpuzzle/.
- Những API `experimental*` được nhà phát triển mô tả là có thể thay đổi; **khóa phiên bản**, thử trên iOS Safari / Android Chrome. Không để `TwistyPlayer` làm nguồn dữ liệu `confirmedCount`.
- Viết adapter để UI không lệ thuộc trực tiếp vào các API playback/timeline thiếu ổn định. `AnimationAdapter` phải đảm bảo đầu vào là snapshot + move, và có thể cancel/reset.
- Render một viewer chính, tái sử dụng tài nguyên, lazy-load 3D, giới hạn DPR trên mobile, pause animation khi page hidden; không tái tạo scene trong mỗi lần tick progress.
- Không cần backend cho MVP; state/solver chạy client-side trong Web Worker nếu tốn CPU. Camera yêu cầu secure context HTTPS.

## 12. Accessibility, UX, telemetry tối thiểu

- CTA kích thước cảm ứng ≥ 44px; có focus state, nhãn screen reader, không chỉ màu để báo mặt xoay; tùy chọn giảm chuyển động khi `prefers-reduced-motion`.
- Tốc độ mặc định chậm; có nút phát lại không giới hạn; văn bản hướng dẫn rõ hướng nhìn của mặt trước khi xoay.
- Hiển thị “Mô phỏng 3D không xác minh bước xoay thật; nút xác nhận là do người dùng tự kiểm tra.”
- Telemetry chỉ nên ghi loại lỗi/trạng thái chung, không upload ảnh camera nếu không có đồng ý rõ ràng.

## 13. Kiểm thử bắt buộc

### Unit
- Mỗi token `U/D/L/R/F/B`, `'`, `2` được parser chấp nhận; ký hiệu lạ bị từ chối.
- `snapshots[N]` là solved; `snapshots[i+1]` đúng khi apply `moves[i]`.
- DEMO_START/DEMO_FINISH không thay `confirmedCount`.
- Confirm đúng 1 lần làm `k -> k+1`; bấm lặp, stale `moveIndex` không tạo double-commit.
- `UNDO` không giảm k nếu người dùng chưa xác nhận đã xoay ngược thật.
- Auto playback không thay physical progress.
- Restore session giữ đúng confirmedCount, không tự nhảy bước.

### Integration / E2E
- Quét 2 lần hợp lệ, quét 6 lần hợp lệ -> đều có cùng hợp đồng `CubeState`.
- Scan lỗi màu/hướng -> bị khóa giải cho tới khi sửa.
- 3D trước bước k khớp `S[k]`; sau xác nhận khớp `S[k+1]`.
- Replay animation k lần, tiến độ không đổi.
- Người dùng báo sai -> không cho Confirm, có lối thoát tái quét.
- Test `R2` như một step, hoàn thành một lần xác nhận.
- Test Safari iOS và Chrome Android, xoay màn hình, background/foreground, offline PWA, thiết bị cấu hình thấp.

## 14. Acceptance criteria (Definition of Done)

- [ ] Khi scan hợp lệ và solver xác minh xong, người dùng chọn được MANUAL.
- [ ] Có nhãn 6 mặt theo tâm, giao diện hướng dẫn 1 move tại một thời điểm.
- [ ] 3D mô phỏng đúng layer/chiều/biên độ, có highlight/mũi tên và xem lại.
- [ ] Demo/Replay/Auto **không thay đổi** `confirmedCount`.
- [ ] Chỉ CONFIRM_MOVE hợp lệ mới tăng tiến độ thật; có chống double-tap.
- [ ] Có hiển thị tiến độ `k/N`, giữ phiên và xác nhận khi khôi phục.
- [ ] “Previous” chỉ review; muốn lùi tiến độ phải undo **trên khối thật**.
- [ ] Khi không chắc đã xoay đúng, có chế độ RECOVERY và tái quét.
- [ ] Khi k=N, trạng thái 3D là solved; màn Completed ghi rõ hoàn tất **theo các xác nhận của người dùng** nếu chưa camera-verify.
- [ ] Không cần camera mở liên tục trong lúc hướng dẫn ở MVP; UI không được ngụ ý đang theo dõi Rubik thật.

## 15. Thứ tự triển khai khuyến nghị cho AI agent

1. Định nghĩa `CubeState`, ánh xạ tâm/hệ trục và `MoveEngine`, unit tests.
2. Tạo `SolveSession` immutable + snapshots, verify solution từ `S0`.
3. Dựng `ManualGuideController` dạng reducer và state machine, test xác nhận, replay, undo.
4. Tạo viewer adapter 3D và panel step mobile; bind `S[k]` (committed) vs demo.
5. Thêm persistence, resume warning, recovery flow và rescan từ current physical cube.
6. Gắn kết quả scan 2 góc/6 mặt và màn chọn AUTO/MANUAL.
7. E2E trên máy Android/iOS thật; kiểm thử 3D/performance, lỗi ánh sáng, background/resume.

**Nguyên tắc xuyên suốt:** Trạng thái hệ thống đã xác nhận, trạng thái 3D đang xem mẫu và trạng thái Rubik vật lý là ba khái niệm khác nhau. Không được đồng nhất chúng khi chưa có bằng chứng từ camera hoặc thao tác xác nhận rõ ràng của người dùng.

---
## Phụ lục 0.2 — Màn hình học Rubik tiếng Việt

- Truy cập từ nút **Học giải Rubik** trên trang chủ hoặc thanh điều hướng.
- Tab **Quy ước ký hiệu**: 6 mặt U,D,L,R,F,B; dấu `'` là quay ngược 90°, `2` là 180°, chiều tính khi nhìn trực diện mặt đang xoay. Luyện chọn mặt, chiều và phát minh họa trên mô hình 3D.
- Tab **7 bước giải**: dấu cộng trắng, bốn góc trắng, cạnh tầng giữa, dấu cộng vàng, mặt vàng, vị trí góc vàng, vị trí cạnh vàng. Mỗi giai đoạn có mục tiêu, cách cầm/nhận diện trường hợp, tiêu chí hoàn thành, ít nhất một công thức với lời giải thích và cảnh báo áp dụng.
- **Mô phỏng không autoplay**: chỉ `p.play()` trong event handler cho nút `Xem toàn bộ` hoặc `Xoay 1 bước`. `Lùi 1 bước`, `Đặt lại`, chọn ký hiệu/trường hợp chỉ cập nhật khung hình tĩnh.
- Khối demo tạo từ trạng thái đã giải, quay `x2` để trắng dưới/vàng trên, rồi đảo thuật toán mẫu tạo trạng thái hợp lệ làm bài tập. Trạng thái này minh họa cơ chế phép xoay, **không cam kết tự động nhận diện trường hợp học từ camera hoặc giải bất kỳ khối Rubik nào bằng một công thức**.
- Màn hình học hoàn toàn độc lập với session/confirmedState của quá trình giải Rubik thật, không lưu/ghi đè tiến độ solve.
- Bài test: kiểm tra đầy đủ 6 mặt, 7 bài, thuật toán mẫu hợp lệ, công thức nghịch đảo cho trạng thái bài tập.

## V0.3 — Module Playable Rubik 3D

**Nguồn trạng thái duy nhất:** `PlayPage.history: MoveToken[]` và `cubejs` replay. Khi một cử chỉ đủ rõ được nhận diện, tạo MoveToken bằng `faceFromDrag`, mô phỏng chuyển động 3D, chỉ commit lịch sử khi animation đã hoàn tất. Các cử chỉ orbit đổi camera không commit. Các move từ nút bấm/AI/scramble cùng đi qua một API `PlayableCubeHandle.turn`.

**Mouse/Touch:** Trong chế độ xoay mặt, pointerdown raycast trên sticker để chọn cubie, xác định normal mặt và mặt phẳng tiếp tuyến. Pointerup chiếu tia lên mặt phẳng cũ, tích có hướng `n × delta` cho trục và chiều quay, lớp từ tọa độ cubie đầu, ánh xạ U/R/F/D/L/B. Chỉ xoay tầng ngoài và bỏ qua cử chỉ quá ngắn. Kéo từ nền đổi góc qua OrbitControls; bật chế độ View để orbit ở mọi vị trí. Pinch zoom qua OrbitControls cần test trên iOS.

**Gợi ý:** `solveInWorker({kind:'facelets',facelets})` trả về chuỗi giải hợp lệ; `preview(move)` cho chạy move rồi inverse, không commit `history`. Người chơi bấm thực hiện mới commit.

**Giải nhanh:** lấy lời giải từ state hiện tại, animate và commit từng move. Dừng giữa các move, không cắt animation giữa chừng. Lời giải dùng Kociemba two-phase, không dùng LLM.

**Undo:** animate nghịch đảo bước cuối và xóa đúng bước cuối trong lịch sử; khác với nối thêm move đảo chiều. Đóng màn hình/tải lại thì phát lại lịch sử lên 3D từ solved, không dựa trên video/matrix camera đã render trước đó.

**Nghiệm thu bổ sung:** So sánh `faceFromDrag` với hệ URFDLB, test quay R sau R' trả về ban đầu, nhiều lượt quay không trôi tọa độ cubies, kiểm tra viewport orientation/Pointer Events iOS Safari/Chrome Android, kiểm tra solver từ trạng thái game độc lập và sau dùng Undo, kiểm tra race khi đang AI giải, mất WebGL context.
