import {FACE_NAMES,invertMoves,parseMoves,type Face} from './cube.ts';
import {lessonSetupMoves} from './lessonScenario.ts';

/**
 * Curriculum in Vietnamese for a seven-stage beginner layer-by-layer method.
 * These algorithms are demonstrations of *individual cases*, not an automatic
 * sequence for any arbitrary scramble. Users must inspect the case and hold
 * their physical cube with white at the bottom and yellow at the top.
 */
export type LearnCase = {
  id:string;
  title:string;
  when:string;
  algorithm:string;
  explanation:string;
  caution?:string;
  /** Explicit physical orientation and pieces to observe, in the selected language. */
  hold?:string;
  expected?:string;
  next?:string;
};
export type LearnLesson = {
  id:string;
  title:string;
  subtitle:string;
  goal:string;
  instructions:string[];
  check:string;
  cases:LearnCase[];
};

export const NOTATION:ReadonlyArray<{face:Face;vi:string;description:string}> = [
  {face:'U',vi:'Mặt trên',description:'Up — mặt ở trên'},
  {face:'D',vi:'Mặt dưới',description:'Down — mặt ở dưới'},
  {face:'L',vi:'Mặt trái',description:'Left — mặt bên trái'},
  {face:'R',vi:'Mặt phải',description:'Right — mặt bên phải'},
  {face:'F',vi:'Mặt trước',description:'Front — mặt hướng về bạn'},
  {face:'B',vi:'Mặt sau',description:'Back — mặt đối diện mặt trước'},
];

export const LEARN_LESSONS:readonly LearnLesson[] = [
  {
    id:'white-cross',title:'Tạo dấu cộng trắng',subtitle:'Tầng thứ nhất · Cạnh trắng',
    goal:'Đưa bốn viên cạnh có màu trắng về quanh tâm trắng, đồng thời màu còn lại của mỗi cạnh phải trùng với tâm của mặt bên.',
    instructions:[
      'Tìm lần lượt bốn viên cạnh có màu trắng (viên có đúng hai màu).',
      'Đưa từng viên về cạnh của tâm trắng, không phá các cạnh đã đúng.',
      'Không chỉ làm đúng hình chữ thập: bốn màu cạnh bên cũng phải khớp tâm bên.',
    ],
    check:'Có một dấu cộng trắng và cả bốn cạnh bên trùng màu tâm tương ứng.',
    cases:[{id:'cross-half-turn',title:'Ví dụ: xoay nửa vòng một mặt',when:'Một viên cạnh đang nằm đối diện vị trí đích; đây là ví dụ thao tác F2, không phải công thức chung cho mọi dấu cộng.',algorithm:'F2',explanation:'Xoay mặt trước 180°. Quan sát viên cạnh đi từ vị trí này sang vị trí đối diện.',caution:'Dấu cộng trắng thường cần quan sát và xoay từng viên, không có một công thức cố định cho mọi trạng thái.'}],
  },
  {
    id:'white-corners',title:'Hoàn thành bốn góc trắng',subtitle:'Tầng thứ nhất · Góc trắng',
    goal:'Đưa bốn viên góc có màu trắng vào đúng ba tâm màu để hoàn thiện tầng trắng.',
    instructions:[
      'Giữ trắng ở dưới, vàng ở trên. Tìm viên góc có trắng ở tầng trên.',
      'Xoay U để đặt góc mục tiêu phía trên vị trí trước-phải của nó.',
      'Dùng công thức tay phải và quan sát. Lặp khi cần, tùy hướng mặt trắng.',
    ],
    check:'Toàn bộ mặt dưới trắng; hàng dưới của bốn mặt bên khớp tâm.',
    cases:[{id:'right-trigger',title:'Công thức tay phải',when:'Góc cần đưa xuống vị trí trước-phải; số lần lặp tùy hướng viên góc.',algorithm:"R U R' U'",explanation:'R kéo tầng phải lên, U dịch tầng trên, R’ trả mặt phải, U’ trả mặt trên.',caution:'Trước khi thực hành, đặt đúng viên góc và vị trí đích; chỉ lặp công thức khi trường hợp yêu cầu.'}],
  },
  {
    id:'middle-edges',title:'Giải bốn cạnh tầng giữa',subtitle:'Tầng thứ hai · Cạnh không vàng',
    goal:'Lắp bốn viên cạnh không có màu vàng vào tầng giữa mà vẫn giữ nguyên tầng trắng.',
    instructions:[
      'Giữ trắng dưới, vàng trên. Tìm cạnh không vàng trên tầng U.',
      'Xoay U để màu bên hông của cạnh trùng với tâm mặt trước.',
      'Quan sát màu còn lại của cạnh: cần đưa sang phải hay sang trái?',
    ],
    check:'Hai tầng dưới hoàn chỉnh; các hàng mặt bên có màu đồng nhất theo tâm.',
    cases:[
      {id:'edge-right',title:'Đưa cạnh sang phải',when:'Cạnh ở phía trên-trước có màu mặt bên còn lại trùng tâm phải.',algorithm:"U R U' R' U' F' U F",explanation:'Dịch viên cạnh ra khỏi khe, mở khe bên phải và đưa viên cạnh vào.'},
      {id:'edge-left',title:'Đưa cạnh sang trái',when:'Cạnh ở phía trên-trước có màu còn lại trùng tâm trái.',algorithm:"U' L' U L U F U' F'",explanation:'Thực hiện thuật toán đối xứng để đưa cạnh vào khe bên trái.'},
    ],
  },
  {
    id:'yellow-cross',title:'Tạo dấu cộng vàng',subtitle:'Tầng cuối · Định hướng cạnh',
    goal:'Đưa đúng bốn mặt vàng của các viên cạnh lên U; chưa cần khớp tâm bên và chưa cần góc vàng đúng.',
    instructions:[
      'Nhìn từ trên, chỉ xem 4 ô cạnh của mặt vàng, không tính bốn góc.',
      'Nhận dạng đường ngang, chữ L ở trên-trái, hoặc chỉ có một tâm vàng (dạng chấm).',
      'Chọn đúng trường hợp; nhìn ảnh trước/sau và giữ nguyên cách cầm khi xoay công thức.'
    ],
    check:'Bốn cạnh vàng hướng lên, tạo dấu cộng quanh tâm vàng.',
    cases:[
      {id:'yellow-line',title:'Đường ngang — 2 cạnh đã hướng đúng',
       when:'Từ trên nhìn xuống: hai cạnh vàng nằm trái và phải tâm U.',
       hold:'Giữ vạch vàng nằm ngang từ trái sang phải; vàng lên trên, trắng ở dưới.',
       algorithm:"F R U R' U' F'",
       explanation:'Xoay mặt trước, thao tác tay phải và trả mặt trước. Quan sát hai cạnh còn lại lật lên.',
       expected:'Bốn cạnh trên cùng hướng vàng lên; góc vàng chưa cần hoàn chỉnh.'},
      {id:'yellow-l',title:'Chữ L — hai cạnh kề nhau',
       when:'Từ trên nhìn xuống: hai cạnh vàng kề nhau tạo chữ L ở ô trên và ô trái.',
       hold:'Xoay toàn khối (không xoay tầng) để chữ L nằm ở phía trên-trái theo sơ đồ.',
       algorithm:"F U R U' R' F'",
       explanation:'Một biến thể phù hợp cho chữ L ở trên-trái, có hướng cầm cố định.',
       expected:'Sau công thức, bốn cạnh sẽ hướng vàng lên.',
       caution:'Đường ngang và chữ L không được cầm cùng hướng; chú ý hai hình mẫu trước khi thực hiện.'},
      {id:'yellow-dot',title:'Dạng chấm — chưa cạnh nào hướng vàng',
       when:'Chỉ thấy tâm vàng; cả bốn ô cạnh U đều không vàng.',
       hold:'Giữ vàng ở trên. Đây là bài thực hành gồm hai công thức nối tiếp và đổi U ở giữa.',
       algorithm:"F U R U' R' F' U F R U R' U' F' U'",
       explanation:'Trường hợp chấm cần hai lần định hướng cạnh theo thứ tự thể hiện. Xem mỗi lần xoay trong 3D.',
       expected:'Tạo dấu cộng vàng sau chuỗi kết hợp.',
       caution:'Công thức dài chỉ minh họa một hướng cầm cụ thể; không tự chạy khi chưa so khớp với hình.'}
    ],
  },
  {
    id:'yellow-face',title:'Hoàn thiện mặt vàng',subtitle:'Tầng cuối · Định hướng góc',
    goal:'Làm cả 4 góc trên quay màu vàng lên U trong khi giữ dấu cộng vàng. Chưa xét vị trí hoán vị góc.',
    instructions:[
      'Nhìn 4 ô góc U để đếm có 0, 1 hay 2 góc vàng đang hướng lên. 3 góc vàng hướng lên là không hợp lệ.',
      'Với trường hợp chỉ 1 góc, phân biệt Sune và Anti-Sune bằng vị trí góc đó và màu ở cạnh bên.',
      'Với 0 hoặc 2 góc, xem mẫu ghép hai công thức; xem lại vị trí sau từng lượt U nếu cầm khối thật.'
    ],
    check:'Toàn bộ 9 ô trên mặt U đều vàng; hai tầng dưới vẫn nguyên trạng.',
    cases:[
      {id:'sune',title:'Sune — một góc vàng hướng lên',
       when:'Một góc vàng hướng lên tại UFL trong hình mẫu; các góc còn lại lệch hướng.',
       hold:'Giữ vàng trên; đưa góc vàng đang hướng lên về UFL (trước-trái) theo sơ đồ. Không xoay cả khối giữa công thức.',
       algorithm:"R U R' U R U2 R'",
       explanation:'Định hướng các góc bằng Sune; một trường hợp cơ bản để ghi nhớ.',
       expected:'Bốn góc hướng vàng lên.'},
      {id:'anti-sune',title:'Anti-Sune — dạng cá đối xứng',
       when:'Một góc vàng hướng lên tại URB theo mẫu (đối xứng với Sune).',
       hold:'Giữ vàng trên; xoay toàn khối để nhận ra đúng góc vàng theo ảnh rồi giữ nguyên.',
       algorithm:"R U2 R' U' R U' R'",
       explanation:'Biến thể đảo chiều của Sune, dùng khi mẫu góc có hướng ngược.',
       expected:'Bốn góc hướng vàng lên.'},
      {id:'two-yellow-corners',title:'Hai góc vàng hướng lên',
       when:'Có đúng 2 trong 4 góc của U đang hướng vàng lên.',
       hold:'Đặt góc theo hình mẫu trước; đây là một ví dụ hai công thức kết hợp với U ở giữa.',
       algorithm:"R U R' U R U2 R' U R U2 R' U' R U' R' U'",
       explanation:'Dùng Sune, thay đổi tầng U và Anti-Sune để hoàn thiện mẫu cụ thể này.',
       expected:'Toàn bộ 9 ô U đều vàng.'},
      {id:'zero-yellow-corners',title:'Không góc nào vàng hướng lên',
       when:'Bốn ô góc U đều không vàng; dấu cộng vàng vẫn còn.',
       hold:'So khớp màu bên ở hình mẫu. Đây là ví dụ gồm hai lần Sune từ một trạng thái hợp lệ.',
       algorithm:"R U R' U R U2 R' R U R' U R U2 R'",
       explanation:'Xem 3D sau lần Sune thứ nhất rồi tiếp tục với lần thứ hai.',
       expected:'Toàn bộ 9 ô U đều vàng.',
       caution:'Không có một góc cầm chung cho mọi cách sắp xếp bốn góc; nếu khác hình, hãy chọn ví dụ thích hợp hoặc chuyển bài nhận diện.'}
    ],
  },
  {
    id:'yellow-corners',title:'Hoán vị góc tầng cuối',subtitle:'Tầng cuối · Đặt góc đúng vị trí',
    goal:'Đưa góc có ba màu về đúng ba mặt tâm; mặt vàng đã hướng lên từ bước trước phải được giữ nguyên.',
    instructions:[
      'Phân biệt: góc đúng hướng (vàng quay lên) và góc đúng vị trí (đúng bộ ba màu theo tâm). Hai điều này không giống nhau.',
      'Nhìn hai sticker góc trên một mặt bên: nếu cùng màu gọi là cặp đèn pha (headlights). Xoay toàn khối để cặp đèn pha ở phía sau.',
      'Nếu không thấy cặp đèn pha trên bất kỳ mặt nào, dùng Y-perm cho trường hợp đổi góc chéo. Sau đó kiểm tra lại.'
    ],
    check:'Mặt U vẫn vàng hoàn toàn và cả bốn góc tầng cuối ở đúng vị trí theo màu tâm; cạnh có thể chưa đúng.',
    cases:[
      {id:'aa-corner-cycle',title:'Cặp đèn pha phía sau — A-perm',
       when:'Hai góc U ở cùng một mặt bên có sticker trùng nhau; mẫu này có cặp đèn pha ở phía sau.',
       hold:'Giữ cặp đèn pha ở mặt sau (B); góc UFL là góc giữ nguyên trong công thức này.',
       algorithm:"R' F R' B2 R F' R' B2 R2",
       explanation:'A-perm đổi ba góc trên, giữ nguyên một góc. Công thức không phá mặt vàng đã hoàn thành.',
       expected:'Cả bốn góc U đúng vị trí, các lớp dưới vẫn hoàn chỉnh.',
       caution:'Công thức cũ dạng U R U’ L’… không giữ nguyên mặt vàng, nên đã được thay thế.'},
      {id:'diagonal-corners',title:'Không có đèn pha — đổi góc chéo',
       when:'Không có mặt bên nào với hai góc U cùng màu. Hai góc cần đổi chéo.',
       hold:'Giữ vàng lên, trắng xuống và mặt trước khớp với hình; không cần tìm góc đúng UFR.',
       algorithm:"F R U' R' U' R U R' F' R U R' U' R' F R F'",
       explanation:'Y-perm xử lý hoán vị góc chéo; công thức cũng có thể đổi vị trí một số cạnh tầng cuối.',
       expected:'Bốn góc trên về đúng vị trí. Nếu cạnh còn sai, tiếp tục bước 7.',
       caution:'Đừng nhầm “không có đèn pha” với “không có góc đúng”; đó là hai cách kiểm tra khác nhau.'}
    ],
  },
  {
    id:'yellow-edges',title:'Hoán vị cạnh tầng cuối',subtitle:'Tầng cuối · Hoàn thành Rubik',
    goal:'Hoán vị bốn cạnh trên cho khớp tâm mặt bên, giữ nguyên các góc và toàn bộ mặt vàng.',
    instructions:[
      'Tìm cạnh trên trùng màu tâm mặt bên. Nếu có đúng một cạnh đúng, đặt ở phía sau B.',
      'Nếu không có cạnh đúng, xem đường đi của các viên: H đổi hai cặp đối diện, Z đổi hai cặp kề.',
      'Chọn Ua, Ub, H hoặc Z. Các công thức H/Z dùng hai vòng Ua với thay đổi U ở giữa để không cần ký hiệu M.'
    ],
    check:'Tất cả sáu mặt đồng nhất và khối Rubik đã giải xong.',
    cases:[
      {id:'ua',title:'Ua — vòng ba cạnh theo một chiều',
       when:'Có một cạnh đã đúng ở phía sau (UB), ba cạnh trước, phải, trái đi thành vòng.',
       hold:'Giữ cạnh đúng ở phía sau B; mặt U vàng, tầng trắng D ở dưới.',
       algorithm:"R U' R U R U R U' R' U' R2",
       explanation:'Ba cạnh U còn lại luân phiên đổi vị trí; tất cả các góc giữ nguyên.',
       expected:'Cả bốn cạnh U khớp màu tâm, Rubik hoàn chỉnh.'},
      {id:'ub',title:'Ub — vòng ba cạnh chiều ngược lại',
       when:'Có một cạnh đúng ở phía sau (UB), ba cạnh còn lại chạy theo vòng ngược Ua.',
       hold:'Giữ cạnh đúng ở phía sau B và quan sát chiều mũi tên so với Ua.',
       algorithm:"R2 U R U R' U' R' U' R' U R'",
       explanation:'Ba cạnh U xoay vòng ngược chiều Ua.',
       expected:'Bốn cạnh U đúng vị trí, Rubik hoàn chỉnh.'},
      {id:'h-edges',title:'H-perm — hai cặp cạnh đối diện',
       when:'Không có cạnh nào đúng: UF đổi với UB và UR đổi với UL (hai cặp đối diện).',
       hold:'Giữ vàng trên; nhìn các mũi tên: trước ↔ sau và phải ↔ trái.',
       algorithm:"R U' R U R U R U' R' U' R2 U R U' R U R U R U' R' U' R2 U'",
       explanation:'Ghép hai chu kỳ Ua, có U và U’ để đổi hướng trung gian. Đây là ví dụ chỉ dùng ký hiệu sáu mặt.',
       expected:'Hai cặp cạnh đối diện về đúng chỗ, Rubik hoàn chỉnh.',
       caution:'Có cách H-perm ngắn hơn với ký hiệu M; bản này ưu tiên tương thích với 3D và bộ nhập hiện tại.'},
      {id:'z-edges',title:'Z-perm — hai cặp cạnh kề',
       when:'Không có cạnh nào đúng: UF đổi với UR và UB đổi với UL (hai cặp kề).',
       hold:'Giữ vàng trên; nhìn hai mũi tên đổi cặp trước-phải và sau-trái.',
       algorithm:"R U' R U R U R U' R' U' R2 U' R U' R U R U R U' R' U' R2 U",
       explanation:'Hai chu kỳ Ua với đổi U ngược chiều H-perm; sau một vòng, tiếp tục vòng thứ hai.',
       expected:'Hai cặp cạnh kề về đúng chỗ, Rubik hoàn chỉnh.',
       caution:'Công thức dài để không dùng ký hiệu M; hãy tập Ua/Ub trước, sau đó học H/Z.'}
    ],
  },
];

export function findLearnLesson(id:string):LearnLesson | undefined{return LEARN_LESSONS.find(l=>l.id===id);}
export function getLearnCase(lessonId:string,caseId:string):LearnCase | undefined {return findLearnLesson(lessonId)?.cases.find(c=>c.id===caseId);}
export function getLearnMoves(sample:LearnCase):string[]{return parseMoves(sample.algorithm);}
export function sampleInitialSetup(sample:LearnCase,stageId?:string):string{
  // x2 is an orientation cue used by historical demos. The lesson's source state
  // is built from a stage target, not from the fully solved cube.
  const moves=stageId?lessonSetupMoves(stageId,sample.algorithm):invertMoves(getLearnMoves(sample));
  return ['x2',...moves].join(' ');
}
export function notationDescription(move:string):string{
  const face=move[0] as Face;
  const suffix=move.slice(1);
  const english=typeof document!=='undefined'&&document.documentElement.lang==='en';
  const direction=suffix==='2'?(english?'180°':'180 độ'):suffix==="'"?(english?'90° counterclockwise':'90 độ ngược chiều kim đồng hồ'):(english?'90° clockwise':'90 độ theo chiều kim đồng hồ');
  const name=english?({U:'Top',D:'Bottom',L:'Left',R:'Right',F:'Front',B:'Back'} as Record<Face,string>)[face]:FACE_NAMES[face];
  return english?`${name} — ${direction}, looking directly at that face.`:`${name} — ${direction}, khi nhìn trực diện mặt đó.`;
}
