import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
export type Language='vi'|'en';
const KEY='cubemind:language';
const preferred=():Language=>{try{const v=localStorage.getItem(KEY);return v==='en'||v==='vi'?v:'vi';}catch{return 'vi';}};

/**
 * UI text catalog. Original Vietnamese is the stable key for compatibility with
 * the pre-i18n React components. English terms are local, no translation API or
 * network access required.
 */
const en:Record<string,string>={
 'Chơi 3D':'Play 3D','Học giải Rubik':'Learn Rubik','Về công nghệ':'About the technology','Đóng':'Close',
 'RUBIK GIẢI ĐƠN GIẢN HƠN':'RUBIK MADE SIMPLE','Giải Rubik.':'Solve the cube.','Từng chuyển động.':'One move at a time.',
 'Tính lời giải chính xác, xem hoạt ảnh 3D và tự xoay Rubik thật theo từng bước — ngay trên điện thoại của bạn.':'Find accurate solutions, watch 3D animations, and solve your real cube step by step — right on your phone.',
 'Bắt đầu giải':'Start solving','Chơi Rubik 3D':'Play 3D cube','Thử khối mẫu':'Try an example',
 'Không cần tài khoản':'No account required','Xử lý ngay trên máy':'Processed on device',
 'Tiếp tục phiên trước':'Resume previous session','bước đã xác nhận · Cần xác nhận trạng thái Rubik thật':'moves confirmed · Check your real cube state',
 'QUY TRÌNH 3 BƯỚC':'THREE SIMPLE STEPS','Từ khối Rubik rối đến hoàn chỉnh':'From scrambled to solved',
 '01 / NHẬP DỮ LIỆU':'01 / INPUT','Nhận trạng thái':'Capture the state',
 'Nhập dãy trộn, chỉnh 54 ô màu hoặc quét 2 góc (mỗi góc 3 mặt) hoặc quét 6 mặt qua camera / tải ảnh (beta).':'Enter a scramble, edit 54 stickers, or scan two angles or six faces using camera or photos (beta).',
 '02 / PHÂN TÍCH':'02 / ANALYZE','Tính lời giải':'Find a solution',
 'Kiểm tra góc, cạnh, parity và mô phỏng xác minh toàn bộ chuỗi giải.':'Validate corners, edges and parity, then simulate and verify the solution.',
 '03 / TỪNG BƯỚC 3D':'03 / 3D GUIDANCE','Tự tay giải':'Solve it yourself',
 'Xem minh họa xoay chậm; chỉ chuyển bước khi bạn chủ động xác nhận.':'Watch slow rotations, then confirm each completed move yourself.',
 'Không cần backend. Dữ liệu phiên được lưu cục bộ trong trình duyệt của bạn.':'No backend required. Session data stays in your browser.',
 '← Quay lại':'← Back','← Trang chủ':'← Home','BƯỚC 01 · TRẠNG THÁI RUBIK':'STEP 01 · CUBE STATE',
 'Chuẩn bị khối Rubik':'Prepare your cube','Chọn cách cung cấp trạng thái để hệ thống phân tích và tìm lời giải thật.':'Choose how to provide the cube state for analysis and solving.',
 'Chuỗi trộn':'Scramble notation','Thử ngay với ký hiệu U R F…':'Try U R F… notation','54 ô màu':'54 stickers','Nhập màu từng mặt':'Edit each face',
 'Quét / tải ảnh':'Scan / upload photos','2 ảnh nhanh / 6 ảnh':'2 photos / 6 photos','CHUỖI TRỘN RUBIK':'SCRAMBLE MOVES',
 'Hãy áp dụng đúng chuỗi trộn này lên Rubik đang hoàn chỉnh để hai khối khớp nhau.':'Apply these exact moves to a solved real cube to match the virtual state.',
 'Khôi phục dãy mẫu':'Restore example','BẢNG 54 Ô MÀU':'54-STICKER EDITOR',
 'Giữ mặt trắng (U) ở trên, xanh lá (F) ở trước, đỏ (R) bên phải. Xoay toàn khối để nhập theo đúng hệ trục, không quay ngẫu nhiên từng mặt.':'Keep white (U) up, green (F) front and red (R) right. Maintain this orientation while entering each face.',
 'CHỌN CÁCH QUÉT · CAMERA HOẶC TẢI ẢNH':'CHOOSE SCAN MODE · CAMERA OR PHOTO',
 'Quét 6 mặt (beta)':'Scan 6 faces (beta)','Chụp hoặc tải 6 ảnh (mỗi mặt 1 ảnh). Căn khung 9 ô, kiểm tra màu trước khi giải.':'Take or upload 6 photos, one per face. Align the 9 stickers and review colours.',
 'Bắt đầu':'Start','Quét nhanh 2 ảnh (beta)':'Quick 2-photo scan (beta)',
 'Chụp hoặc tải 2 ảnh, mỗi ảnh 3 mặt. Kéo chỉnh 4 góc của từng mặt trước khi kiểm tra.':'Take or upload 2 photos with three faces each. Adjust four corners per face before checking.',
 'Kiểm tra & tìm lời giải':'Validate & solve',
 'Hệ thống chỉ cho phép giải khi 54 ô màu hợp lệ, viên góc/cạnh hợp lệ và lời giải đã được xác minh.':'Solving requires a valid 54-sticker state, legal pieces and a verified solution.',
 'BƯỚC 02 · KIỂM TRA':'STEP 02 · VALIDATION','Đang phân tích Rubik…':'Analyzing cube…',
 'Đang tính trên thiết bị. Lần đầu có thể lâu hơn do tạo bảng solver.':'Calculating on your device. The first run may take longer.',
 'KIỂM TRA THÀNH CÔNG':'VALIDATION PASSED','Sẵn sàng giải Rubik!':'Ready to solve!',
 'Dữ liệu hợp lệ và toàn bộ chuỗi thao tác đã được mô phỏng để xác minh.':'The cube is valid and the solution has been verified by simulation.',
 'Bước giải':'Solution moves','Ô màu':'Stickers','Hợp lệ':'Valid','CHUỖI LỜI GIẢI':'SOLUTION MOVES',
 'Rubik đã hoàn chỉnh, không cần thêm thao tác.':'Cube already solved. No moves needed.',
 'Bạn muốn giải theo cách nào?':'How would you like to solve?','Tự giải từng bước':'Solve step by step',
 'Nhìn 3D, xoay khối thật và xác nhận mỗi bước.':'Follow the 3D cube, turn your real cube and confirm each move.',
 'Xem 3D tự động':'Watch automatic 3D','Quan sát Rubik 3D xoay chậm theo lời giải.':'Watch the 3D cube slowly solve itself.',
 'Nhập khối Rubik khác':'Enter another cube','mô phỏng 3D':'3D demo','hướng dẫn giải':'guided solving','Theo đặc tả 1.0':'Specification 1.0',
 'Quay lại':'Back','Mặt':'Face','Chọn nguồn ảnh':'Choose image source','Dùng camera':'Use camera','Tải ảnh lên':'Upload photo',
 'Quét 6 mặt là beta. Chất lượng ảnh không bảo đảm Rubik đã được nhận diện đúng; người dùng cần kiểm tra và chỉnh 54 ô trước khi giải.':'Six-face scanning is beta. Image quality alone cannot guarantee accurate recognition; verify all 54 stickers before solving.',
 'QUÉT 6 MẶT · BETA':'6-FACE SCAN · BETA','Tải ảnh có đủ mặt 3×3 và giữ đúng hướng được hướng dẫn. Có thể sửa khung sau khi tải lên.':'Upload an image of a full 3×3 face, oriented as instructed. You may adjust the crop afterwards.',
 'Giữ mặt Rubik vuông góc camera, phủ gần khung 3×3.':'Hold a face straight toward the camera and align it within the 3×3 guide.',
 'Đang mở camera…':'Starting camera…','Ảnh camera':'Camera image',
 'Căn khung 3×3':'Align the 3×3 frame','Kéo 4 điểm trắng đến góc ngoài của mặt. Kiểm tra 9 dấu chấm nằm tại tâm các ô màu. Hãy chọn ảnh khác nếu không thể căn.':'Drag the four white handles to the outside corners. Ensure all nine dots fall inside stickers. Choose another photo if necessary.',
 'Chụp lại':'Retake photo','Chọn ảnh khác':'Choose another photo','Đặt lại khung':'Reset frame',
 'Ghép 54 ô và kiểm tra':'Combine and validate 54 stickers','Chụp mặt':'Capture face','Quay lại mặt trước':'Previous face',
 'Đã ghi nhận':'Captured','Kiểm tra định dạng/độ phân giải/độ sáng, cho chỉnh khung và lấy 9 màu/mặt; sau 6 mặt cần xác minh trạng thái và solver.':'Check image format, resolution and lighting; adjust the crop. Validate the complete state before solving.',
 'QUÉT NHANH HAI GÓC · BETA':'QUICK TWO-ANGLE SCAN · BETA','Ảnh':'Photo',
 'Góc 1: trắng trên, xanh lá trái, đỏ phải':'Angle 1: white top, green left, red right',
 'Góc 2: vàng trên, cam trái, xanh dương phải':'Angle 2: yellow top, orange left, blue right',
 'Giữ đúng màu tâm và vị trí. Cần khối 3×3 có sơ đồ màu chuẩn U=trắng, R=đỏ, F=xanh lá, D=vàng, L=cam, B=xanh dương.':'Maintain the indicated center colours and orientation. Standard colour layout: U white, R red, F green, D yellow, L orange, B blue.',
 'Căn lại khung nếu cần':'Adjust the frames if needed',
 'Chọn từng mặt bên dưới. Kéo 4 nút trắng đến':'Select a face below. Drag the four white handles to',
 '4 góc ngoài của mặt':'the four outside corners of that face',
 'tương ứng. Các dấu chấm phải nằm giữa từng ô màu, không nằm trên viền đen.':'respectively. Sample dots must be centered on stickers, not on the dark gaps.',
 'Đúng 3 mặt — quét góc 2':'Confirm 3 faces — scan angle 2',
 'Ghép 54 ô và kiểm tra':'Combine and verify 54 stickers','Tải ảnh':'Upload photo',
 'Chọn ảnh đã chụp từ thư viện, đủ ba mặt Rubik trong cùng ảnh.':'Choose a photo containing all three faces of the cube.',
 'Chất lượng ảnh cơ bản đạt yêu cầu. Cần tiếp tục kiểm tra màu Rubik.':'Basic quality checks passed; verify the sticker colours next.',
 'Đặt Rubik giữa khung, để 3 mặt khớp các đường viền. Giữ yên và chụp ảnh. Có thể căn 4 góc sau khi chụp.':'Center the cube, align three faces with the guide, hold still and capture. You may adjust the corners afterwards.',
 'Quét lại ảnh 1':'Retake photo 1',
 'Có thể dùng camera hoặc tải ảnh độc lập cho từng lượt; nếu camera không hoạt động, hãy chuyển sang tải ảnh. Ảnh không được chứng minh chứa Rubik chỉ bằng kiểm tra độ sáng/độ nét. Chế độ beta: 2 ảnh thật, nhận diện 27 ô/ảnh theo 3 mặt có khung định hướng và các góc có thể kéo chỉnh;':'Use camera or upload a photo for each shot. If the camera fails, switch to uploads. Lighting and sharpness do not prove the image shows a cube. Beta: each of two photos samples 27 stickers using adjustable corner guides;',
 'chưa tự tìm vị trí và chiều của khối Rubik tự do trong mọi ảnh':'automatic cube detection and orientation are not yet supported for arbitrary photos',
 'Mặt đang chỉnh':'Editing face','Tâm cố định':'Fixed center','Chọn màu để tô':'Choose a sticker colour',
 'Định hướng mặc định: U = trắng, F = xanh lá, R = đỏ. Tâm 6 mặt không thay đổi.':'Default orientation: U white, F green, R red. Face centres cannot change.',
 'Đặt lại khối đã giải':'Reset to solved cube',
 'HOÀN THÀNH THEO XÁC NHẬN':'COMPLETED BY CONFIRMATION','Tuyệt vời!':'Well done!',
 'Bạn đã xác nhận thực hiện đầy đủ':'You confirmed completing all','bước. Mô hình 3D đã được giải xong.':'moves. The 3D model is now solved.',
 'Đây là hoàn thành theo xác nhận của bạn; chưa có camera xác minh Rubik thật.':'Completion is based on your confirmations; the real cube has not been verified by camera.',
 'Giải một khối Rubik khác':'Solve another cube','Xem lại toàn bộ mô phỏng':'Replay entire animation',
 'MÔ PHỎNG':'DEMO','TỰ GIẢI':'MANUAL GUIDE','Xem Rubik tự giải':'Watch auto-solve','bước đã xác nhận':'moves confirmed',
 'Trên:':'Top:','Trước:':'Front:','Phải:':'Right:','Trắng':'White','Xanh lá':'Green','Đỏ':'Red','Vàng':'Yellow','Cam':'Orange','Xanh dương':'Blue',
 'CHẾ ĐỘ TỰ ĐỘNG':'AUTOMATIC MODE','Quan sát từng thao tác 3D':'Watch each 3D move',
 'Hoạt ảnh không xác nhận bạn đã xoay Rubik thật. Tiến độ thủ công luôn được giữ nguyên.':'Animations do not verify physical moves. Your manual progress remains unchanged.',
 'Dừng':'Stop','Phát mô phỏng':'Play demo','THAO TÁC HIỆN TẠI':'CURRENT MOVE','Đang xem mẫu':'Previewing','Chờ bạn xác nhận':'Awaiting your confirmation',
 'Chiều kim đồng hồ được tính khi nhìn trực diện chính mặt đang xoay, không theo góc camera 3D.':'Clockwise is defined looking directly at the moving face, regardless of the 3D camera angle.',
 'Xem mẫu':'Preview move','Tiếp tục':'Continue','Tạm dừng':'Pause','Xem lại':'Replay','Tốc độ hoạt ảnh':'Animation speed',
 'Xem bước trước':'Review previous step','Hoàn tác thật':'Physically undo','Bước đã làm:':'Completed move:',
 '. 3D đang hiển thị trạng thái trước bước đó, chỉ để tham khảo. Không lùi tiến độ thật.':'. The 3D view shows the state before that move for reference only. Real progress has not changed.',
 'Tôi đã xoay xong':'I completed this move','Tôi xoay sai / Không chắc chắn':'I made a mistake / Not sure',
 'Chỉ bấm sau khi bạn đã xoay Rubik thật đúng thao tác.':'Tap only after turning your real cube correctly.',
 'Hoàn tác thao tác thật':'Undo the real move','Khôi phục phiên giải':'Restore solving session','Bắt đầu lại?':'Start over?','Bạn cần trợ giúp?':'Need help?',
 'Hãy thực hiện':'Perform','trên Rubik thật để đảo ngược bước':'on your real cube to reverse','vừa xác nhận. Chỉ khi hoàn tất mới xác nhận bên dưới.':'just confirmed. Confirm only after completing the reversal.',
 'Tôi đã xoay ngược xong':'I completed the reverse move','Hủy (tôi chưa xoay gì)':'Cancel (I did not move)',
 'Ứng dụng lưu rằng bạn đã xác nhận':'The app saved that you confirmed',
 'bước. Rubik thật vẫn giữ nguyên trạng thái đó chứ?':'moves. Is your real cube still in that state?',
 'Đúng, tiếp tục giải':'Yes, continue','Không, bắt đầu phiên mới':'No, start a new session',
 'Ứng dụng không thể tự biết Rubik thật có bị xoay sai. Hãy chọn tình huống đúng:':'The app cannot detect mistakes on your real cube. Choose your situation:',
 'Tôi xác nhận nhầm, chưa xoay bước vừa ghi nhận':'I confirmed accidentally but did not turn the last move',
 'Tôi đã tự đảo ngược thao tác sai và kiểm tra trạng thái':'I reversed the incorrect move and checked the state',
 'Không chắc · Nhập / quét lại':'Not sure · Re-enter / rescan',
 'Nếu không chắc mặt nào đã xoay sai, nên quét hoặc nhập lại trạng thái thực tế, không tiếp tục dựa trên trạng thái cũ.':'If unsure what moved incorrectly, rescan your actual cube instead of continuing with an old state.',
 'HỌC RUBIK BẰNG TIẾNG VIỆT':'LEARN RUBIK IN ENGLISH','Học giải Rubik 3×3':'Learn to solve Rubik 3×3',
 'Tìm hiểu ký hiệu, 7 giai đoạn cơ bản và xem Rubik 3D xoay mẫu. Không tự phát hoạt ảnh khi mở màn hình.':'Learn notation, the seven beginner stages and 3D demos. Animations only play when you press a button.',
 'Quy ước ký hiệu':'Move notation','7 bước giải cơ bản':'Seven beginner stages','Sáu mặt của Rubik':'Six faces of the cube',
 'Chữ cái chỉ mặt cần xoay, không phải màu cố định. Đặt khối đúng tư thế trước khi làm theo công thức.':'Letters identify faces, not fixed colours. Orient the cube correctly before using an algorithm.',
 'Cách đọc dấu và số':'Primes and double turns','90° cùng chiều kim đồng hồ':'90° clockwise','90° ngược chiều kim đồng hồ':'90° counterclockwise','180° (nửa vòng)':'180° half-turn',
 'Rất quan trọng:':'Important:','chiều kim đồng hồ được tính khi bạn':'clockwise is defined when you',
 'nhìn thẳng vào mặt đang xoay':'look directly at the turning face',
 ', không tính từ góc bạn đang nhìn tổng thể cả khối.':', not from your overall viewing angle.',
 'Cách cầm khi học phương pháp cơ bản':'How to hold the cube for beginner lessons',
 'Giữ':'Keep','trắng ở dưới':'white on the bottom','vàng ở trên':'yellow on top',
 '. Công thức trong phần học là ví dụ cho từng trường hợp, không phải một chuỗi tự động giải mọi khối Rubik. Màu trên dưới của màn hình học có thể khác hướng mặc định trong màn hình quét.':'. These lesson algorithms illustrate specific cases; they do not automatically solve arbitrary cubes. Lesson orientation may differ from scanner orientation.',
 'Xoay thử từng ký hiệu':'Try each notation','Chọn mặt và cách xoay, sau đó nhấn Xem toàn bộ hoặc Xoay 1 bước để xem minh họa.':'Choose a face and a turn, then press Play all or Single move to preview.',
 'Bắt đầu 7 bước giải':'Start the seven stages','GIAI ĐOẠN':'STAGE','Thực hiện như thế nào?':'How to perform it?','Đạt khi:':'Done when:',
 'TRƯỜNG HỢP MINH HỌA':'EXAMPLE CASE','Chọn công thức để xem':'Select an algorithm to preview','Khi nào dùng:':'When to use:','Cách hoạt động:':'How it works:',
 'Bước trước':'Previous step','Thử giải Rubik':'Try solving a cube','Bước tiếp theo':'Next step','Chọn mặt':'Select face','Chọn hướng':'Turn direction','90° thuận':'90° clockwise','90° ngược':'90° counterclockwise',
 'MÔ PHỎNG TƯƠNG TÁC':'INTERACTIVE DEMO','CHƯA CHẠY':'NOT PLAYING','Xem toàn bộ':'Play all','Xoay 1 bước':'Single move','Lùi 1 bước':'Step back','Đặt lại':'Reset','Rất chậm':'Very slow','Chậm':'Slow','Bình thường':'Normal',
 'Kéo để đổi góc nhìn. Hoạt ảnh chỉ chạy khi bạn bấm nút; đây là khối minh họa công thức, không phản ánh Rubik thật đang cầm.':'Drag to orbit the view. Animation only plays on button press; this demo cube does not reflect the real cube in your hands.',
 'KHU VỰC CHƠI 3D':'3D PLAYGROUND','Chơi Rubik ngay trên web':'Play Rubik in your browser',
 'Xoay bằng chuột hoặc ngón tay. Khi bí, xem một bước gợi ý — hoặc để bộ giải tự hoàn thành khối Rubik.':'Turn using mouse or touch. When stuck, request a hint or let the solver finish the cube.',
 'Đã giải xong':'Solved','Đang chơi':'Playing','lượt':'moves','Góc mặc định':'Reset view',
 'Đang kéo đổi góc':'Orbit-only mode','Chế độ xoay mặt':'Turn faces',
 'Kéo ở bất kỳ đâu để xoay góc nhìn.':'Drag anywhere to orbit.',
 'Vuốt một hàng/cột ngoài của Rubik để xoay. Kéo vùng trống để đổi góc nhìn.':'Swipe an outer row/column to turn it. Drag outside the cube to orbit.',
 'XOAY BẰNG NÚT · HOẶC PHÍM R U F D L B':'TURN WITH BUTTONS OR R U F D L B KEYS',
 'Hoàn tác':'Undo','Trộn ngẫu nhiên':'Random scramble','Chơi lại':'New cube',
 'TRỢ LÝ GIẢI RUBIK':'RUBIK SOLVING ASSISTANT','Bạn đang bí?':'Stuck?',
 'Tính toán từ':'Calculates from','trạng thái hiện tại của Rubik 3D':'the current 3D cube state',
 ', không dùng một chuỗi mẫu cố định.':', not a fixed example sequence.',
 'Gợi ý bước tiếp theo':'Hint for next move','Xem gợi ý':'Get a hint','BƯỚC TIẾP THEO':'NEXT MOVE','Thực hiện':'Apply move',
 'AI giải nhanh':'Fast auto-solve','AI giải ngay':'Solve now','Đang tự giải…':'Solving…','Đang phân tích…':'Analyzing…',
 'Sẽ dừng sau lượt xoay hiện tại.':'Will stop after the current move.',
 'LỊCH SỬ XOAY':'MOVE HISTORY','Chưa có thao tác nào.':'No moves yet.',
 'Rubik đã hoàn chỉnh!':'Cube solved!','Bạn có thể trộn lại hoặc tạo một khối mới.':'You can scramble again or start a new cube.',
 'Mặt trên':'Top face','Mặt phải':'Right face','Mặt trước':'Front face','Mặt dưới':'Bottom face','Mặt trái':'Left face','Mặt sau':'Back face',
 'Trên':'Up','Dưới':'Down','Trái':'Left','Phải':'Right','Trước':'Front','Sau':'Back',
 'Tầng thứ nhất · Cạnh trắng':'First layer · White edges','Tầng thứ nhất · Góc trắng':'First layer · White corners',
 'Tầng thứ hai · Cạnh không vàng':'Middle layer · Non-yellow edges','Tầng cuối · Định hướng cạnh':'Last layer · Edge orientation',
 'Tầng cuối · Định hướng góc':'Last layer · Corner orientation','Tầng cuối · Hoán vị góc':'Last layer · Corner permutation',
 'Tầng cuối · Hoán vị cạnh':'Last layer · Edge permutation'
};

const ui=createContext<{language:Language;setLanguage:(v:Language)=>void}>({language:'vi',setLanguage:()=>{}});
type Tracked={source:string;translated:string};
const textCache=new WeakMap<Text,Tracked>();
const attrCache=new WeakMap<Element,Record<string,Tracked>>();
const ATTRS=['title','placeholder','alt','aria-label'];
function translate(v:string):string{
 const trimmed=v.trim();if(!trimmed)return v;
 let result=en[trimmed];
 if(!result){
   // Translate compound dynamic text safely using the longest matching catalog phrases.
   result=trimmed;
   for(const [source,target] of Object.entries(en).sort((a,b)=>b[0].length-a[0].length)){
     if(source.length>=10 && result.includes(source))result=result.split(source).join(target);
   }
 }
 return v.slice(0,v.indexOf(trimmed))+result+v.slice(v.indexOf(trimmed)+trimmed.length);
}
function localize(root:Element,language:Language){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let node:Node|null;
 while((node=walker.nextNode())){
   const t=node as Text,p=t.parentElement;
   if(!p||p.closest('script,style,code,pre,svg,[data-no-i18n]'))continue;
   let cache=textCache.get(t);
   if(!cache||t.data!==cache.translated && t.data!==cache.source){cache={source:t.data,translated:t.data};textCache.set(t,cache);}
   const target=language==='en'?translate(cache.source):cache.source;
   cache.translated=target;
   if(t.data!==target)t.data=target;
 }
 const els=[root,...Array.from(root.querySelectorAll('*'))];
 for(const el of els){
   let cached=attrCache.get(el);if(!cached){cached={};attrCache.set(el,cached);}
   for(const a of ATTRS){
     const current=el.getAttribute(a);if(current===null)continue;
     let record=cached[a];
     if(!record||current!==record.source&&current!==record.translated){record={source:current,translated:current};cached[a]=record;}
     const dest=language==='en'?translate(record.source):record.source;
     record.translated=dest;
     if(current!==dest)el.setAttribute(a,dest);
   }
 }
}
export function I18nProvider({children}:{children:ReactNode}){
 const [language,setLanguage]=useState<Language>(preferred);
 useEffect(()=>{
   const root=document.getElementById('root');if(!root)return;
   document.documentElement.lang=language;
   document.title=language==='en'?'CubeMind — Scan, Play & Solve Rubik 3×3':'CubeMind — Quét, chơi & giải Rubik 3×3';
   try{localStorage.setItem(KEY,language);}catch{/* private mode */}
   let running=false;
   const apply=()=>{if(running)return;running=true;try{localize(root,language);}finally{running=false;}};
   const observer=new MutationObserver(apply);observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
   apply();return()=>observer.disconnect();
 },[language]);
 const ctx=useMemo(()=>({language,setLanguage}),[language]);
 return <ui.Provider value={ctx}>{children}</ui.Provider>;
}
export const useI18n=()=>useContext(ui);
export function LanguageSwitch(){
 const {language,setLanguage}=useI18n();
 return <div className="language-switch" role="group" aria-label="Language / Ngôn ngữ">
  <button type="button" onClick={()=>setLanguage('vi')} className={language==='vi'?'active':''} aria-pressed={language==='vi'}>VI</button>
  <button type="button" onClick={()=>setLanguage('en')} className={language==='en'?'active':''} aria-pressed={language==='en'}>EN</button>
 </div>;
}
