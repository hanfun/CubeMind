import {LEARN_LESSONS,type LearnCase} from './learn.ts';

export type SolveMethodId='beginner'|'cfop-2look'|'cfop'|'roux'|'zz';
export type Locale='vi'|'en';
export type LocalText={vi:string;en:string};
export type MethodLevel='beginner'|'intermediate'|'advanced';
export type ExampleReference={lessonId:string;caseIds?:readonly string[]};
export type MethodStage={
 id:string;
 title:LocalText;
 goal:LocalText;
 recognize:LocalText;
 hold:LocalText;
 actions:readonly LocalText[];
 done:LocalText;
 example?:ExampleReference;
 note?:LocalText;
};
export type SolveMethod={
 id:SolveMethodId;
 name:string;
 level:MethodLevel;
 subtitle:LocalText;
 summary:LocalText;
 keyIdea:LocalText;
 learningOnly:boolean;
 stages:readonly MethodStage[];
 resourceUrl:string;
};
const txt=(vi:string,en:string):LocalText=>({vi,en});
const stage=(id:string,title:LocalText,goal:LocalText,recognize:LocalText,hold:LocalText,
 actions:readonly LocalText[],done:LocalText,example?:ExampleReference,note?:LocalText):MethodStage=>
 ({id,title,goal,recognize,hold,actions,done,example,note});
const beginnerStages:readonly MethodStage[]=LEARN_LESSONS.map(l=>stage(
 l.id,txt(l.title,l.title),txt(l.goal,l.goal),txt(l.instructions[0],l.instructions[0]),
 txt('Giữ trắng dưới và vàng trên trong các bài minh họa hiện tại.','For the current examples, hold white down and yellow up.'),
 l.instructions.map(t=>txt(t,t)),txt(l.check,l.check),{lessonId:l.id}));
const sourceBeginnerEn:Readonly<Record<string,{name:string;goal:string;recognize:string;done:string}>>={
 'white-cross':{name:'White cross',goal:'Place the four white edge pieces correctly relative to their side centres.',recognize:'Find a white edge and check both its white sticker and its other colour.',done:'White cross complete; all four edge side colours match their centres.'},
 'white-corners':{name:'White corners',goal:'Complete the first white layer without disturbing the cross.',recognize:'Find a white corner and match all three colours to its destination slot.',done:'The bottom white face and first-layer side rows are solved.'},
 'middle-edges':{name:'Middle-layer edges',goal:'Insert all four non-yellow edges into the middle layer.',recognize:'Choose a top edge without yellow; determine whether its destination is left or right.',done:'The first two layers are completed.'},
 'yellow-cross':{name:'Yellow cross',goal:'Orient the four top edges so their yellow stickers face up.',recognize:'Identify the yellow dot, L or line pattern, ignoring the corners.',done:'Four upward-facing yellow top edges form a cross.'},
 'yellow-face':{name:'Yellow face',goal:'Orient all top corners so the entire top face becomes yellow.',recognize:'Count the oriented yellow top corners and compare their side colours.',done:'All nine top stickers are yellow; the bottom layers remain solved.'},
 'yellow-corners':{name:'Place yellow corners',goal:'Move the top corners to their correct three-colour positions.',recognize:'Look for matching pairs of top corner stickers (headlights) on the side faces.',done:'All last-layer corners are correctly positioned; some edges may still be wrong.'},
 'yellow-edges':{name:'Place yellow edges',goal:'Move the top edges to match each side centre.',recognize:'Check which top edge matches its side centre, then compare the edge permutation case.',done:'All six faces are solved.'},
};
const BEGINNER_HOLD=txt(
 'Theo bộ ví dụ hiện tại, giữ trắng dưới và vàng trên. Khi làm bài có yêu cầu đổi góc cầm, hãy so hình trước.',
 'Current sample diagrams show white below and yellow above. Reorient the entire cube only when instructed.');
const beginnerTranslated:readonly MethodStage[]=beginnerStages.map(s=>{
 const e=sourceBeginnerEn[s.id];
 return {...s,title:txt(s.title.vi,e.name),goal:txt(s.goal.vi,e.goal),recognize:txt(s.recognize.vi,e.recognize),hold:BEGINNER_HOLD,
  actions:LEARN_LESSONS.find(l=>l.id===s.id)!.instructions.map((vi,index)=>txt(vi,[
   'Find the relevant pieces by their sticker colours and the face centres.',
   'Reorient the whole cube and align the pieces to the pictured case.',
   'Perform only the matching algorithm and verify the physical result.'
  ][index]??'Compare the shown case and check your result.')),done:txt(s.done.vi,e.done)};
});
const METHODS:readonly SolveMethod[]=[
 {
  id:'beginner',name:'Beginner · Layer by Layer',level:'beginner',learningOnly:false,
  subtitle:txt('Cơ bản · Từng tầng','Beginner · Layer by Layer'),
  summary:txt('Bảy chặng rõ ràng: dấu cộng trắng → tầng trắng → tầng giữa → mặt vàng → đổi vị trí tầng cuối.',
   'Seven clear checkpoints: white cross, first layer, middle layer, yellow orientation and last-layer positioning.'),
  keyIdea:txt('Tìm đúng viên, đưa tới đúng khe rồi mới dùng công thức.','Find the target piece and its correct slot before using a formula.'),
  stages:beginnerTranslated,
  resourceUrl:'https://zyorubik.com/blogs/huong-dan-nguoi-choi/huong-dan-xoay-rubik-3x3-don-gian-nhat-cho-nguoi-moi-bat-dau'
 },
 {
  id:'cfop-2look',name:'CFOP · 2-Look',level:'intermediate',learningOnly:false,
  subtitle:txt('Trung cấp · CFOP từng lượt','Intermediate · Two-look CFOP'),
  summary:txt('Cross → F2L → hai lượt OLL → hai lượt PLL; cầu nối từ Beginner sang speedcubing.',
   'Cross → F2L → two-look OLL → two-look PLL. A bridge from beginner solving to speedcubing.'),
  keyIdea:txt('Ghép góc và cạnh thành từng cặp F2L; dùng 2 lượt để định hướng rồi hoán vị tầng cuối.',
   'Pair F2L corners and edges; orient and permute the last layer in two looks each.'),
  stages:[
   stage('cross',txt('Cross · Dấu cộng dưới','Cross · Bottom cross'),
    txt('Lập dấu cộng ở D, màu bên khớp tâm.','Build the bottom cross and align all side stickers to their centres.'),
    txt('Tìm bốn cạnh có màu trắng.','Find the four white edges.'),
    txt('Giữ trắng dưới khi luyện CFOP.','Hold white on the bottom for CFOP.'),
    [txt('Dự kiến đường đi từng cạnh trước khi xoay.','Plan the location of each cross edge before turning.'),
     txt('Giải bốn cạnh mà không làm hỏng những cạnh đã xong.','Solve the four cross edges without breaking already placed pieces.')],
    txt('Bốn cạnh của dấu cộng đều đúng vị trí.','All four cross edges are correctly positioned.'),
    {lessonId:'white-cross'},
    txt('3D chỉ minh họa một tình huống cạnh trắng, chưa phải bộ giải Cross cho mọi scramble.','3D shows one white-edge situation, not a universal Cross solver.')),
   stage('f2l',txt('F2L · 4 cặp góc–cạnh','F2L · Four corner-edge pairs'),
    txt('Ghép góc trắng với cạnh tầng giữa thành bốn cặp và chèn từng cặp.','Pair each white corner with its middle-layer edge and insert four pairs.'),
    txt('Tìm góc trắng và cạnh không vàng có chung hai màu bên.','Find a white corner and a non-yellow edge sharing the same two side colours.'),
    txt('Trắng dưới, vàng trên; đặt khe đích ở trước-phải hoặc trước-trái.','White down, yellow up; place the target slot at front-right or front-left.'),
    [txt('Tìm cặp góc–cạnh, đưa về tầng U mà không phá cặp đã xong.','Locate the corner and edge, and bring them to U without breaking solved pairs.'),
     txt('Ghép hai viên thành một cặp trước khi chèn vào khe.','Pair the two pieces before inserting them into their slot.'),
     txt('Lặp với bốn khe và kiểm tra tâm màu bên.','Repeat for all four slots, checking side-centre colours.')],
    txt('Hai tầng dưới hoàn chỉnh.','Both bottom layers are solved.'),
    {lessonId:'middle-edges'},
    txt('Ví dụ 3D hiện có chỉ là thao tác chèn cạnh tầng giữa, KHÔNG phải minh họa ghép F2L đầy đủ.','The existing 3D example shows a middle-edge insertion, NOT a complete F2L pair solution.')),
   stage('oll-edges',txt('OLL lượt 1 · Định hướng cạnh','OLL look 1 · Orient edges'),
    txt('Tạo dấu cộng vàng trên U.','Form the yellow cross on U.'),
    txt('Xác định chấm, L hoặc đường ngang.','Recognize dot, L or horizontal line.'),
    txt('Giữ vàng trên; đặt L ở trên-trái, vạch ở ngang.','Hold yellow up; place the L at upper-left or the line horizontally.'),
    [txt('Chọn hình khớp với khối thật.','Choose the case that matches the real cube.'),
     txt('Làm công thức định hướng cạnh, rồi kiểm tra.','Apply the edge orientation formula, then verify.')],
    txt('Bốn cạnh U đều hướng vàng lên.','All four U edges face yellow upward.'),{lessonId:'yellow-cross'}),
   stage('oll-corners',txt('OLL lượt 2 · Định hướng góc','OLL look 2 · Orient corners'),
    txt('Xoay bốn góc tầng cuối để hoàn thành mặt vàng.','Orient all last-layer corners to complete the yellow face.'),
    txt('Đếm góc vàng trên U và so các màu bên cạnh.','Count the yellow U corners and compare adjacent side colours.'),
    txt('Giữ U vàng và đặt trường hợp đúng hướng theo sơ đồ.','Keep U yellow; align the exact case as illustrated.'),
    [txt('Chọn Sune, Anti-Sune hoặc trường hợp mẫu tương ứng.','Select Sune, Anti-Sune or the matching example case.'),
     txt('Xoay theo công thức, kiểm tra 9 ô vàng.','Perform the formula, then inspect all nine yellow stickers.')],
    txt('Mặt U toàn màu vàng.','All of U is yellow.'),{lessonId:'yellow-face'},
    txt('Thư viện hiện có 4 ví dụ, chưa đủ 7 trường hợp OLL 2-look chuẩn.','The current atlas has four examples, not yet the full seven 2-look corner OLL cases.')),
   stage('pll-corners',txt('PLL lượt 1 · Hoán vị góc','PLL look 1 · Permute corners'),
    txt('Đưa bốn góc tầng cuối vào đúng bộ ba màu.','Position the four last-layer corners by their three colours.'),
    txt('Tìm cặp đèn pha ở các mặt bên, so vị trí góc đúng.','Look for matching corner headlights and correctly positioned corners.'),
    txt('Vàng trên; xoay cả khối để cầm đúng hướng hình case.','Yellow up; reorient the entire cube to match the selected case.'),
    [txt('So trường hợp đèn pha hoặc đổi chéo.','Compare the headlights or diagonal-swap case.'),
     txt('Xoay công thức phù hợp và kiểm tra góc theo ba tâm.','Execute the matching algorithm and check corner positions against centres.')],
    txt('Bốn góc tầng cuối đúng vị trí; cạnh có thể còn sai.','All last-layer corners are positioned; edges may remain unsolved.'),
    {lessonId:'yellow-corners'}),
   stage('pll-edges',txt('PLL lượt 2 · Hoán vị cạnh','PLL look 2 · Permute edges'),
    txt('Đưa bốn cạnh tầng cuối về đúng màu tâm.','Place the four last-layer edges to match their centres.'),
    txt('Một cạnh đúng → Ua/Ub; không cạnh đúng → H/Z.','One correct edge → Ua/Ub; no fixed edge → H/Z.'),
    txt('Giữ cạnh cố định ở B nếu hình yêu cầu.','Hold the fixed edge at B when the case requires it.'),
    [txt('So chính xác hướng mũi tên cạnh.','Compare exact edge movement arrows.'),
     txt('Làm công thức; kiểm tra toàn bộ sáu mặt.','Apply the case formula; inspect all six faces.')],
    txt('Rubik hoàn chỉnh.','The entire cube is solved.'),{lessonId:'yellow-edges'}),
  ],
  resourceUrl:'https://www.jperm.net/3x3/cfop'
 },
 {
  id:'cfop',name:'CFOP · Full',level:'advanced',learningOnly:true,
  subtitle:txt('Nâng cao · CFOP đầy đủ','Advanced · Full CFOP'),
  summary:txt('Cross, F2L, 57 trường hợp OLL và 21 trường hợp PLL. Lộ trình luyện nâng cao.',
   'Cross, F2L, 57 OLL and 21 PLL cases: an advanced training roadmap.'),
  keyIdea:txt('Nhận diện OLL/PLL một lần để giảm số lượt dừng, nâng tốc độ giải.',
   'Recognize full OLL and PLL in one look to reduce pauses and improve speed.'),
  stages:[
   stage('cross',txt('Cross · Lập kế hoạch','Cross · Plan ahead'),
    txt('Giải dấu cộng dưới một cách hiệu quả.','Build the bottom cross efficiently.'),
    txt('Xem bốn cạnh trong thời gian quan sát trước khi xoay.','Plan four cross edges during inspection.'),
    txt('Trắng ở mặt D, hạn chế đổi hướng cầm.','White down; minimize cube rotations.'),
    [txt('Quan sát vị trí và hướng cả bốn cạnh trắng.','Inspect positions and orientation of all four white edges.'),
     txt('Thực hiện kế hoạch Cross, kiểm tra tâm cạnh.','Execute the Cross plan and check adjacent centres.')],
    txt('Cross chính xác.','Cross solved.'),{lessonId:'white-cross'}),
   stage('f2l',txt('F2L · Nhận diện ghép cặp','F2L · Pair recognition'),
    txt('Ghép bốn cặp cạnh–góc với số nước tối ưu hơn.','Build and insert the four corner-edge pairs efficiently.'),
    txt('Phân loại cặp rời, cặp đã ghép, cặp sai hướng hoặc nằm trong khe.','Identify split pairs, connected pairs, misoriented and trapped pairs.'),
    txt('Giữ khe đích tại trước-phải hoặc trước-trái.','Keep the target slot at front-right or front-left.'),
    [txt('Nhận diện cả hai viên trước khi xoay.','Identify both pieces before turning.'),
     txt('Ghép cặp, chèn và tìm trước cặp tiếp theo.','Pair and insert while looking ahead to the next pair.')],
    txt('F2L hoàn thành.','First two layers solved.'),{lessonId:'middle-edges'},
    txt('Chưa triển khai đầy đủ 41 case F2L trong 3D; ví dụ hiện có chỉ là thao tác chèn cạnh.','The full 41 F2L cases are not implemented in 3D; available examples only demonstrate edge insertion.')),
   stage('oll',txt('OLL · 57 trường hợp','OLL · 57 cases'),
    txt('Định hướng cả 8 viên tầng trên bằng một trường hợp OLL tương ứng.','Orient the complete top layer using its exact OLL case.'),
    txt('So mẫu vàng cả ô cạnh và góc, cùng màu trên mặt bên.','Compare top edge/corner patterns and side stickers.'),
    txt('Vàng trên, xoay U để khớp sơ đồ nhận diện.','Hold yellow on top; adjust U to match the recognition diagram.'),
    [txt('Phân loại case OLL rồi học thuật toán chính xác.','Classify the OLL case and learn its exact algorithm.'),
     txt('Thực hành bằng slow 3D và kiểm tra góc/cạnh.','Practice slowly in 3D and verify corner/edge orientation.')],
    txt('Toàn bộ mặt U vàng.','Entire U face is yellow.'),{lessonId:'yellow-face'},
    txt('Hiện mới có một số ví dụ OLL từ Beginner, CHƯA có 57 công thức và bộ nhận diện đầy đủ.','Only a few Beginner OLL examples are available; the full 57-algorithm recognition library is NOT implemented.')),
   stage('pll',txt('PLL · 21 trường hợp','PLL · 21 cases'),
    txt('Hoán vị toàn bộ tầng cuối bằng một trường hợp PLL.','Permute the complete last layer using its exact PLL case.'),
    txt('Nhận diện cặp đèn pha, khối cùng màu và chu kỳ cạnh/góc.','Identify headlights, matching colour blocks and corner/edge cycles.'),
    txt('Giữ mặt vàng trên, đặt khối đúng hướng của công thức.','Keep yellow on top and align the cube to the formula orientation.'),
    [txt('Nhận diện case và bước U cuối cùng (AUF).','Recognize the case and the final U adjustment (AUF).'),
     txt('Làm công thức PLL rồi kiểm tra sáu mặt.','Apply PLL and check all six faces.')],
    txt('Rubik hoàn chỉnh.','The cube is solved.'),{lessonId:'yellow-edges'},
    txt('Thư viện 3D hiện có Ua/Ub/H/Z và ví dụ hoán vị góc, CHƯA đủ 21 case PLL.','The 3D atlas contains Ua/Ub/H/Z and corner examples, NOT the complete 21-case PLL set.')),
  ],
  resourceUrl:'https://www.jperm.net/3x3/cfop'
 },
 {
  id:'roux',name:'Roux',level:'advanced',learningOnly:true,
  subtitle:txt('Nâng cao · Dựng khối','Advanced · Block building'),
  summary:txt('Dựng hai khối 1×2×3 → CMLL → giải sáu cạnh cuối bằng U/M.','Build two 1×2×3 blocks → CMLL → solve the last six edges with U/M.'),
  keyIdea:txt('Dựng khối trực giác, giữ U và tầng giữa M tự do để xử lý cuối.','Use intuitive block-building, preserving U and M slice freedom for the finish.'),
  stages:[
   stage('first-block',txt('Khối thứ nhất · 1×2×3','First 1×2×3 block'),
    txt('Dựng một khối 1 rộng, 2 cao, 3 sâu ở bên trái.','Build a 1-wide, 2-high, 3-deep block on the left.'),
    txt('Tìm góc và cạnh có chung tâm của hai mặt ở bên trái và dưới.','Locate corner and edge pieces sharing the left and bottom colours.'),
    txt('Giữ L bên trái và D dưới, còn U và M thuận tiện xoay.','Keep L to the left, D below, and U/M accessible.'),
    [txt('Dựng cặp góc–cạnh 1×2×2 trước.','Build an intuitive 1×2×2 piece group first.'),
     txt('Mở rộng thành khối 1×2×3 mà không phá cặp đã ghép.','Extend to a 1×2×3 block without breaking solved pairs.')],
    txt('Khối trái 1×2×3 hoàn chỉnh.','Left 1×2×3 block complete.')),
   stage('second-block',txt('Khối thứ hai · 1×2×3','Second 1×2×3 block'),
    txt('Dựng khối đối diện bên phải mà không phá khối trái.','Build the opposing right block without disturbing the left block.'),
    txt('Tìm các viên góc/cạnh của khối phải chưa được xếp đúng.','Find misplaced corners and edges belonging to the right block.'),
    txt('Giữ khối trái cố định; ưu tiên R/U, theo dõi M.','Keep the left block protected and prefer right/top moves.'),
    [txt('Ghép góc và cạnh cùng nhóm màu thành cặp.','Pair matching corners and edges.'),
     txt('Chèn cặp vào khối phải; kiểm tra cả hai khối.','Insert into the right block and verify both blocks.')],
    txt('Hai khối hai bên đúng vị trí.','Both left and right blocks are solved.')),
   stage('cmll',txt('CMLL · Bốn góc trên','CMLL · Last-layer corners'),
    txt('Định hướng và hoán vị bốn góc U, không bắt buộc giải cạnh U.','Orient and permute all four U corners without solving the U edges.'),
    txt('Xem màu trên U và các sticker góc bên, nhận diện một trong 42 CMLL.','Check U colours and top side-corner stickers to recognize a CMLL case.'),
    txt('Giữ hai khối đã dựng, U hướng lên.','Keep both 1×2×3 blocks intact and U upward.'),
    [txt('Học 2-look CMLL trước khi mở rộng đủ 42 case.','Learn two-look CMLL before all 42 full cases.'),
     txt('Thực hiện thuật toán đúng mẫu và kiểm tra bốn góc.','Apply the matching algorithm and verify all four corners.')],
    txt('Bốn góc U đúng vị trí và hướng.','All four U corners correctly positioned and oriented.')),
   stage('lse',txt('LSE · Sáu cạnh cuối','LSE · Last six edges'),
    txt('Định hướng và hoán vị sáu cạnh còn lại bằng M/U.','Orient and permute the remaining six edges using M/U turns.'),
    txt('Kiểm tra chiều lật cạnh, vị trí UL/UR và các viên trong tầng M.','Check edge orientation, UL/UR placement and M-slice pieces.'),
    txt('U ở trên; M là tầng giữa đứng dọc.','Keep U on top; M is the vertical middle slice.'),
    [txt('Định hướng sáu cạnh.','Orient the last six edges.'),
     txt('Đặt cạnh UL/UR đúng vị trí.','Place UL and UR edges.'),
     txt('Hoán vị cạnh/tâm còn lại trong M để kết thúc.','Permute remaining M edges/centres to finish.')],
    txt('Rubik hoàn chỉnh.','The cube is solved.'),
    undefined,txt('CubeMind chưa hỗ trợ hướng dẫn animation M/CMLL thực chiến; đây là lộ trình học, KHÔNG phải lời giải Roux tự động.','CubeMind does not yet animate practical M/CMLL cases; this is a roadmap, NOT an automatic Roux solution.')),
  ],
  resourceUrl:'https://bradleykh.github.io/CubeTools/tutorials/roux/'
 },
 {
  id:'zz',name:'ZZ',level:'advanced',learningOnly:true,
  subtitle:txt('Nâng cao · Định hướng cạnh','Advanced · Edge orientation'),
  summary:txt('EOLine → ZZF2L → tầng cuối; tối ưu hướng cạnh sớm để giảm xoay cả khối.','EOLine → ZZF2L → last layer; orient edges early to reduce cube rotations.'),
  keyIdea:txt('Định hướng 12 cạnh từ đầu; sau đó giải theo nhóm động tác thuận tiện.','Orient all twelve edges first, then solve the layers using convenient restricted turns.'),
  stages:[
   stage('eoline',txt('EOLine · Hướng 12 cạnh','EOLine · Orient 12 edges'),
    txt('Định hướng 12 cạnh và đặt hai cạnh DF/DB để tạo đường đáy.','Orient 12 edges and place DF/DB to form the bottom line.'),
    txt('Xác định các cạnh lật sai hướng trước khi xoay.','Identify misoriented edges before turning.'),
    txt('Giữ trục F/B nhất quán vì định nghĩa hướng cạnh phụ thuộc hướng cầm.','Keep a consistent F/B axis because edge orientation depends on the reference frame.'),
    [txt('Đếm các cạnh cần định hướng và lên kế hoạch.','Identify bad edges and plan their correction.'),
     txt('Định hướng cạnh, đồng thời lắp DF và DB.','Orient the edges while solving DF and DB.')],
    txt('Tất cả cạnh được định hướng và đáy có DF–DB line.','All edges oriented, with DF–DB bottom line.')),
   stage('zzf2l',txt('ZZF2L · Hai tầng đầu','ZZF2L · First two layers'),
    txt('Dựng hai tầng đầu mà vẫn giữ hướng cạnh đã giải.','Build the first two layers while preserving the solved edge orientation.'),
    txt('Tìm góc trắng và cạnh phù hợp để ghép thành cặp hoặc khối.','Find matching white corners and edges to form pairs or blocks.'),
    txt('Giữ trắng dưới, sử dụng R/U/L là chính.','Keep white down; work primarily with R/U/L.'),
    [txt('Dựng các cặp/khối trong tầng đầu và giữa.','Build first-layer and middle-layer pairs/blocks.'),
     txt('Không làm đảo ngược EO đã giải ở EOLine.','Avoid undoing the edge orientation established during EOLine.')],
    txt('F2L hoàn chỉnh và EO được giữ.','F2L complete with edge orientation preserved.')),
   stage('last-layer',txt('Tầng cuối · OCLL + PLL','Last layer · OCLL + PLL'),
    txt('Giải góc vàng rồi hoán vị tầng cuối.','Orient yellow corners then permute the remaining last-layer pieces.'),
    txt('Định hướng cạnh đã có sẵn; nhận diện hướng góc và thứ tự các viên.','Edge orientation is already solved; recognize corner orientation and piece permutation.'),
    txt('Vàng trên, giữ hướng EO từ hai bước đầu.','Keep yellow up and preserve the EO reference frame.'),
    [txt('Hoàn thiện góc bằng OCLL hoặc biến thể tương đương.','Orient corners using OCLL or an equivalent method.'),
     txt('Dùng PLL phù hợp; xác minh cả sáu mặt.','Use the matching PLL case and verify all six faces.')],
    txt('Rubik hoàn chỉnh.','The cube is solved.')),
  ],
  resourceUrl:'https://cuborithm.com/methods/zz'
 }
];
export const SOLVE_METHODS:readonly SolveMethod[]=METHODS;
export const DEFAULT_SOLVE_METHOD:SolveMethodId='beginner';
const KEY='cubemind:solve-method-v1';
export function isSolveMethodId(value:unknown):value is SolveMethodId{
 return typeof value==='string'&&METHODS.some(m=>m.id===value);
}
export function getSolveMethod(id:SolveMethodId):SolveMethod{
 const method=METHODS.find(m=>m.id===id);
 if(!method)throw new Error(`Unknown solving method: ${id}`);
 return method;
}
export function methodText(value:LocalText,language:Locale):string{return value[language];}
export function loadSolveMethod():SolveMethodId{
 try{
  const saved=localStorage.getItem(KEY);
  return isSolveMethodId(saved)?saved:DEFAULT_SOLVE_METHOD;
 }catch{return DEFAULT_SOLVE_METHOD;}
}
export function saveSolveMethod(id:SolveMethodId):void{
 try{localStorage.setItem(KEY,id);}catch{/* Storage unavailable, selection remains in React state. */}
}
export function stageExamples(reference:ExampleReference):readonly LearnCase[]{
 const lesson=LEARN_LESSONS.find(l=>l.id===reference.lessonId);
 if(!lesson)throw new Error(`Unknown reference lesson: ${reference.lessonId}`);
 if(!reference.caseIds)return lesson.cases;
 const ids=new Set(reference.caseIds);
 const examples=lesson.cases.filter(c=>ids.has(c.id));
 if(examples.length!==ids.size)throw new Error(`Unknown example for ${reference.lessonId}`);
 return examples;
}
