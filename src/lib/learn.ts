import {FACE_NAMES,invertMoves,parseMoves,type Face} from './cube.ts';

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
    goal:'Hướng bốn sticker màu vàng trên các viên cạnh quay lên mặt trên, tạm thời bỏ qua bốn góc.',
    instructions:[
      'Nhìn mặt vàng phía trên: có dạng chấm, chữ L, vạch ngang hoặc chữ thập.',
      'Giữ chữ L ở phía trên-trái theo hướng nhìn từ trên, hoặc vạch ngang từ trái sang phải.',
      'Chạy công thức, quan sát lại và lặp từ góc thích hợp cho tới khi thành dấu cộng.',
    ],
    check:'Bốn sticker cạnh trên màu vàng tạo dấu cộng quanh tâm vàng.',
    cases:[{id:'yellow-cross-formula',title:'Công thức chữ thập vàng',when:'Có hình chữ L hoặc vạch ngang (cần định hướng đúng trước khi dùng).',algorithm:"F R U R' U' F'",explanation:'Xoay F, làm công thức tay phải, rồi trả F’.',caution:'Với hình chữ L và vạch ngang, hướng cầm khối trước khi thực hiện là quan trọng.'}],
  },
  {
    id:'yellow-face',title:'Hoàn thiện mặt vàng',subtitle:'Tầng cuối · Định hướng góc',
    goal:'Hướng bốn sticker vàng của các viên góc lên mặt U, không cần đúng vị trí hoán vị ở bước này.',
    instructions:[
      'Quan sát số góc vàng đang hướng lên mặt trên và vị trí của chúng.',
      'Chọn hướng cầm để công thức Sune tác động vào mẫu hiện tại.',
      'Sau mỗi lần chạy hãy kiểm tra lại mẫu; không tự lặp vô hạn cùng một hướng.',
    ],
    check:'Cả chín ô của mặt trên đều màu vàng.',
    cases:[{id:'sune',title:'Công thức Sune (cá)',when:'Một dạng định hướng góc vàng phù hợp với mẫu Sune; hướng cầm phải đúng.',algorithm:"R U R' U R U2 R'",explanation:'Chuỗi 7 thao tác dùng để định hướng góc trên.',caution:'Không phải mọi mẫu mặt vàng đều giải bằng một lần Sune; cần nhìn đúng tình huống, xoay U hoặc đổi hướng cầm.'}],
  },
  {
    id:'yellow-corners',title:'Đưa góc vàng đúng vị trí',subtitle:'Tầng cuối · Hoán vị góc',
    goal:'Đổi vị trí các viên góc tầng cuối cho đúng bộ ba màu, sau khi đã hướng toàn bộ mặt vàng lên trên.',
    instructions:[
      'Tìm viên góc tầng trên nằm giữa đúng ba tâm màu (không xét hướng sticker).',
      'Nếu có một góc đúng, đặt nó ở vị trí trên-trước-phải (UFR).',
      'Thực hiện công thức đổi ba góc, rồi kiểm tra lại và lặp nếu cần.',
    ],
    check:'Bốn góc tầng trên nằm đúng vị trí theo màu tâm các mặt bên.',
    cases:[{id:'corner-cycle',title:'Hoán vị ba góc',when:'Có một góc đúng tại UFR. Nếu chưa có góc nào đúng, thử công thức từ một hướng rồi kiểm tra lại.',algorithm:"U R U' L' U R' U' L",explanation:'Giữ một góc đúng ở vị trí trước-phải, đổi chỗ ba góc còn lại.',caution:'Đặt góc đúng tại UFR trước khi làm; nếu đặt nhầm, trạng thái có thể không tiến triển như mong đợi.'}],
  },
  {
    id:'yellow-edges',title:'Hoàn thành các cạnh vàng',subtitle:'Tầng cuối · Hoán vị cạnh',
    goal:'Di chuyển ba cạnh trên sai vị trí về đúng tâm mặt bên, không làm xáo trộn hai tầng dưới.',
    instructions:[
      'Tìm mặt bên có hàng trên đúng màu tâm; nếu có, giữ mặt đúng ở phía sau.',
      'Xác định cạnh phía trước cần chuyển sang bên phải hay bên trái.',
      'Chạy Ua hoặc Ub thích hợp, chỉnh U nếu cần để hoàn thành Rubik.',
    ],
    check:'Sáu mặt đều có chín ô cùng màu. Rubik đã hoàn chỉnh!',
    cases:[
      {id:'ua',title:'Ua — chuyển cạnh trước sang phải',when:'Có một cạnh trên đúng ở phía sau; cạnh trước cần chuyển về phía phải.',algorithm:"R U' R U R U R U' R' U' R2",explanation:'Hoán vị vòng ba viên cạnh tầng trên theo một chiều.'},
      {id:'ub',title:'Ub — chuyển cạnh trước sang trái',when:'Có một cạnh trên đúng ở phía sau; cạnh trước cần chuyển về phía trái.',algorithm:"R2 U R U R' U' R' U' R' U R'",explanation:'Hoán vị ba viên cạnh tầng trên theo chiều ngược lại.'},
    ],
  },
];

export function findLearnLesson(id:string):LearnLesson | undefined{return LEARN_LESSONS.find(l=>l.id===id);}
export function getLearnCase(lessonId:string,caseId:string):LearnCase | undefined {return findLearnLesson(lessonId)?.cases.find(c=>c.id===caseId);}
export function getLearnMoves(sample:LearnCase):string[]{return parseMoves(sample.algorithm);}
export function sampleInitialSetup(sample:LearnCase):string{
  // x2 rotates a solved cube for white-down/yellow-up teaching orientation.
  // The reverse algorithm creates a *valid illustrative state* that will be
  // solved when the sample moves are played. It does not detect a real case.
  return ['x2',...invertMoves(getLearnMoves(sample))].join(' ');
}
export function notationDescription(move:string):string{
  const face=move[0] as Face;
  const suffix=move.slice(1);
  const direction=suffix==='2'?'180 độ':suffix==="'"?'90 độ ngược chiều kim đồng hồ':'90 độ theo chiều kim đồng hồ';
  return `${FACE_NAMES[face]} — ${direction}, khi nhìn trực diện mặt đó.`;
}
