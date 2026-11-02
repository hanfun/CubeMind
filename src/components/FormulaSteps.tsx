import {useMemo} from 'react';
import {Copy,Eye,CheckCircle2} from 'lucide-react';
import {FACE_COLORS,type Face} from '../lib/cube';
import {faceGrid,viewForMove} from '../lib/stepVisual';
import {useI18n} from '../i18n';

type Props={
 moves:string[];
 snapshots:string[];
 activeIndex:number;
 completedCount:number;
 variant:'lesson'|'solve';
 onSelectStep?:(index:number)=>void;
};
const displayColor=(face:Face,lesson:boolean)=>{
 const name:Face=lesson?({U:'D',D:'U',F:'B',B:'F',R:'R',L:'L'} as const)[face]:face;
 return FACE_COLORS[name].hex;
};
function StickerGrid({facelets,face,lesson,caption}:{facelets:string;face:Face;lesson:boolean;caption:string}){
 const cells=faceGrid(facelets,face);
 return <div className="formula-state">
   <span>{caption}</span>
   <svg role="img" aria-label={`${caption}: ${face}`} viewBox="0 0 122 122" className="formula-face-svg">
     <rect x="1" y="1" width="120" height="120" rx="10" fill="#081421" stroke="#38536e" strokeWidth="2"/>
     {cells.map((color,index)=><rect key={index}
       x={7+(index%3)*37} y={7+Math.floor(index/3)*37} width="34" height="34" rx="4"
       fill={displayColor(color,lesson)} stroke="#0a1523" strokeWidth="2"/>)}
   </svg>
   <small>{face}</small>
 </div>;
}
export function MoveIllustration({move,before,after,lesson=false}:{move:string;before:string;after:string;lesson?:boolean}){
 const {language}=useI18n(),en=language==='en';
 const details=viewForMove(move);
 const direction=details.clockwise===null?(en?'180° half-turn':'Xoay 180°'):details.clockwise?(en?'Clockwise 90°':'Thuận chiều 90°'):(en?'Counterclockwise 90°':'Ngược chiều 90°');
 return <div className="formula-illustration">
   <div className="formula-viewpoint">
     <Eye size={16}/>
     <span>{en?'Look directly at the':'Nhìn trực diện'} <b>{en?details.en:details.vi} ({details.face})</b></span>
   </div>
   <div className="formula-before-after">
     <StickerGrid facelets={before} face={details.face} lesson={lesson} caption={en?'Before':'Trước'}/>
     <div className="formula-turn-arrow" role="img" aria-label={direction}>
       <span>{details.clockwise===null?'↻ 180°':details.clockwise?'↻':'↺'}</span>
       <small>{direction}</small>
     </div>
     <StickerGrid facelets={after} face={details.face} lesson={lesson} caption={en?'After':'Sau'}/>
   </div>
   <p className="formula-orientation-hint">
     {en
       ? 'Only change your viewing direction to understand the turn. Keep the cube orientation fixed during the algorithm.'
       : 'Chỉ đổi góc nhìn để hiểu chiều xoay; giữ nguyên hướng cầm Rubik khi thực hiện công thức.'}
   </p>
 </div>;
}
export default function FormulaSteps({moves,snapshots,activeIndex,completedCount,variant,onSelectStep}:Props){
 const {language}=useI18n(),en=language==='en';
 const current=Math.max(0,Math.min(activeIndex,moves.length-1));
 const show=moves.length>0&&snapshots.length===moves.length+1;
 const sequence=useMemo(()=>moves.join(' '),[moves]);
 const copy=()=>{if(navigator.clipboard?.writeText)void navigator.clipboard.writeText(sequence);};
 if(!show)return <aside className="formula-panel">{en?'No moves required.':'Không cần thêm bước xoay.'}</aside>;
 return <aside className="formula-panel" aria-label={en?'Move formula and instructions':'Công thức và hướng dẫn xoay'}>
   <div className="formula-panel-heading">
     <div><span className="eyebrow">{variant==='lesson'?(en?'LESSON ALGORITHM':'CÔNG THỨC BÀI HỌC'):(en?'SOLVER MOVE SEQUENCE':'CHUỖI BƯỚC GIẢI')}</span>
       <h3>{variant==='lesson'?(en?'Follow the algorithm':'Làm theo công thức'):(en?'Your solve steps':'Các bước giải của bạn')}</h3>
     </div>
     <button type="button" className="formula-copy" onClick={copy} aria-label={en?'Copy algorithm':'Sao chép công thức'} title={en?'Copy sequence':'Sao chép công thức'}><Copy size={16}/></button>
   </div>
   <div className="formula-full-sequence" aria-label={en?'Full move sequence':'Công thức đầy đủ'}>{sequence}</div>
   <div className="formula-current-count">
     <span>{en?'Current move':'Bước đang xem'}</span>
     <strong>{current+1} / {moves.length}</strong>
   </div>
   <div className="formula-move-list" role="list" aria-label={en?'Individual turns':'Các lượt xoay'}>
    {moves.map((move,index)=>{
      const completed=index<completedCount;
      const currentStep=index===current;
      const inner=<><span className="formula-number">{index+1}</span><b>{move}</b>{completed&&<CheckCircle2 size={13}/>}</>;
      return onSelectStep?
        <button type="button" role="listitem" key={index} className={`formula-move ${currentStep?'active':''} ${completed?'done':''}`}
          onClick={()=>onSelectStep(index)} aria-current={currentStep?'step':undefined} title={en?'See state before this move':'Xem trạng thái trước bước này'}>{inner}</button>:
        <span role="listitem" key={index} className={`formula-move ${currentStep?'active':''} ${completed?'done':''}`} aria-current={currentStep?'step':undefined}>{inner}</span>;
    })}
   </div>
   <MoveIllustration move={moves[current]} before={snapshots[current]} after={snapshots[current+1]} lesson={variant==='lesson'}/>
   <p className="formula-step-caption">
     {variant==='lesson'?(en?'Lesson algorithms demonstrate specific cases, not universal solutions.':'Công thức trong bài học minh họa một trường hợp cụ thể, không áp dụng cho mọi trạng thái.'):
       (en?'These moves were computed for the scanned cube; previewing never confirms a physical turn.':'Đây là các bước dành cho khối đã quét; xem mô phỏng không xác nhận bạn đã xoay Rubik thật.')}
   </p>
 </aside>;
}
