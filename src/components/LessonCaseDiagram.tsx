import {useId,useMemo} from 'react';
import {ArrowRight,Hand,ScanEye} from 'lucide-react';
import {FACE_COLORS,type Face} from '../lib/cube';
import type {LearnCase} from '../lib/learn';
import {lessonPattern,movedTopPieces,correctTopPieces,headlights,type PieceKind,type PiecePath} from '../lib/lessonDiagrams';
import {useI18n} from '../i18n';
import {stageFaceView,mainStickers,focusedStickerCount} from '../lib/lessonFaceView';

const lessonPalette:Record<Face,string>={
 U:FACE_COLORS.D.hex,D:FACE_COLORS.U.hex,
 F:FACE_COLORS.B.hex,B:FACE_COLORS.F.hex,
 R:FACE_COLORS.R.hex,L:FACE_COLORS.L.hex
};
type Focus='white-edge'|'white-corner'|'middle-edge'|'edge-orientation'|'corner-orientation'|'corner-permutation'|'edge-permutation'|'other';
const focusFor=(stageId:string):Focus=>({
 'white-cross':'white-edge','white-corners':'white-corner','middle-edges':'middle-edge',
 'yellow-cross':'edge-orientation','yellow-face':'corner-orientation',
 'yellow-corners':'corner-permutation','yellow-edges':'edge-permutation',
}[stageId] as Focus|undefined)??'other';

function LayerMap({state,stageId,paths=[],compact=false,caption,comparison}:{state:string;stageId:string;paths?:PiecePath[];compact?:boolean;caption?:string;comparison?:string}){
 const marker=useId().replace(/:/g,'');
 const {language}=useI18n();
 const view=stageFaceView(stageId),main=mainStickers(state,stageId);
 const compare=comparison?mainStickers(comparison,stageId):null;
 const count=focusedStickerCount(state,stageId);
 const pos=(x:number,y:number)=>({x:72+x*48+24,y:72+y*48+24});
 const side=(orientation:'top'|'right'|'bottom'|'left')=>view.sideStrips.find(item=>item.orientation===orientation)?.face??'';
 const highlightDifference=stageId==='white-cross'||stageId==='white-corners'||stageId==='middle-edges';
 return <svg className={compact?'case-top-svg compact':'case-top-svg'} viewBox="0 0 288 306"
   role="img" aria-label={caption??view.label[language]}>
   <defs>
     <marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
       <path d="M0,0 L7,3.5 L0,7 Z" fill="#49f9ce"/>
     </marker>
   </defs>
   <rect x="41" y="41" width="205" height="205" rx="10" fill="#081420" stroke="#507089" strokeWidth="2"/>
   {Array.from({length:9},(_,i)=>{
     const col=i%3,row=Math.floor(i/3),c=main[i] as Face;
     const flagged=view.focusColor!==null&&view.focusIndices.includes(i)&&c!==view.focusColor;
     const changed=highlightDifference&&compare!==null&&compare[i]!==main[i];
     const x=72+col*48,y=72+row*48;
     return <g key={i}>
       <rect x={x} y={y} width="44" height="44" rx="5" fill={lessonPalette[c]}
         stroke={changed?'#ffd06f':flagged?'#ffffff':'#0c1d2c'} strokeWidth={changed?4:flagged?3.5:2}/>
       {flagged&&<circle cx={x+22} cy={y+22} r="6" fill="#082030" stroke="#ffffff" strokeWidth="2"/>}
     </g>;
   })}
   {view.sideStrips.map(strip=>strip.indices.map((index,i)=>{
     let x=0,y=0,w=0,h=0;
     if(strip.orientation==='top'){x=72+48*i;y=47;w=44;h=20;}
     if(strip.orientation==='bottom'){x=72+48*i;y=219;w=44;h=20;}
     if(strip.orientation==='left'){x=47;y=72+48*i;w=20;h=44;}
     if(strip.orientation==='right'){x=219;y=72+48*i;w=20;h=44;}
     return <rect key={strip.face+i} x={x} y={y} width={w} height={h} rx="3"
       fill={lessonPalette[state[index] as Face]} stroke="#08202d" strokeWidth="2"/>;
   }))}
   <g className="case-map-labels">
     <text x="144" y="36" textAnchor="middle">{side('top')}</text>
     <text x="144" y="258" textAnchor="middle">{side('bottom')}</text>
     <text x="28" y="151" textAnchor="middle">{side('left')}</text>
     <text x="262" y="151" textAnchor="middle">{side('right')}</text>
     <text x="144" y="282" textAnchor="middle">{view.label[language]}</text>
     <text x="144" y="301" textAnchor="middle">{view.focusColor!==null?`${count}/${view.focusIndices.length} ${view.countLabel[language]}`:''}</text>
   </g>
   {paths.map((path,i)=>{
     const a=pos(path.start.x,path.start.y),b=pos(path.end.x,path.end.y);
     const dx=b.x-a.x,dy=b.y-a.y;
     const cx=(a.x+b.x)/2+(-dy)*0.12+(i%2?5:-5);
     const cy=(a.y+b.y)/2+dx*0.12+(i%2?5:-5);
     return <g key={i}>
       <path d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
         fill="none" stroke="#062837" strokeWidth="9" strokeLinecap="round"/>
       <path d={`M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`}
         fill="none" stroke="#49f9ce" strokeWidth="3.8" markerEnd={`url(#${marker})`}
         strokeLinecap="round" opacity=".98"/>
       <circle cx={a.x} cy={a.y} r="6" fill="#ffffff" stroke="#0b3c4b" strokeWidth="2"/>
     </g>;
   })}
 </svg>;
}

export function CaseThumbnail({sample,stageId}:{sample:LearnCase;stageId:string}){
 const {before,after}=useMemo(()=>lessonPattern(sample,stageId),[sample.algorithm,stageId]);
 const focus=focusFor(stageId);
 const kind:PieceKind=focus==='corner-permutation'?'corner':'edge';
 const paths=useMemo(()=>focus.endsWith('permutation')?movedTopPieces(before,after,kind):[],[before,after,kind,focus]);
 return <LayerMap state={before} stageId={stageId} compact paths={paths} caption={sample.title}/>;
}

export default function LessonCaseDiagram({sample,stageId}:{sample:LearnCase;stageId:string}){
 const {language}=useI18n(),en=language==='en';
 const focus=focusFor(stageId);
 const {before,after}=useMemo(()=>lessonPattern(sample,stageId),[sample.algorithm,stageId]);
 const kind:PieceKind=focus==='corner-permutation'?'corner':'edge';
 const arrows=useMemo(()=>focus.endsWith('permutation')?movedTopPieces(before,after,kind):[],[before,after,focus,kind]);
 const correctBefore=focus.endsWith('permutation')?correctTopPieces(before,kind):[];
 const headlightsBefore=focus==='corner-permutation'?headlights(before):[];
 return <section className="lesson-case-visual" aria-label={en?'Case recognition diagram':'Sơ đồ nhận diện trường hợp'}>
   <div className="lesson-case-visual-header">
     <span className="eyebrow"><ScanEye size={15}/>{en?'RECOGNIZE THIS CASE':'NHẬN DIỆN TRƯỜNG HỢP'}</span>
     <h3>{sample.title}</h3>
     <p>{sample.when}</p>
   </div>
   {sample.hold&&<div className="lesson-hold-instruction"><Hand size={19}/>
     <div><strong>{en?'How to hold the cube':'Cầm Rubik như thế nào?'}</strong><p>{sample.hold}</p></div>
   </div>}
   <div className="lesson-case-diagram-pair">
     <div className="lesson-case-diagram-card">
       <span className="lesson-diagram-label">{en?'BEFORE':'TRƯỚC'}</span>
       <LayerMap state={before} stageId={stageId} comparison={after} paths={arrows} caption={en?'Before algorithm':'Trước công thức'}/>
     </div>
     <div className="lesson-case-direction"><ArrowRight size={26}/><span>{en?'Apply the algorithm':'Làm công thức'}</span></div>
     <div className="lesson-case-diagram-card">
       <span className="lesson-diagram-label">{en?'AFTER':'SAU'}</span>
       <LayerMap state={after} stageId={stageId} comparison={before} caption={en?'After algorithm':'Sau công thức'}/>
     </div>
   </div>
   <div className="lesson-case-explainer">
     {focus.endsWith('permutation')?
       <div>
         <strong>{en?'Where the pieces move':'Các viên chuyển từ đâu sang đâu'}</strong>
         <div className="lesson-piece-paths">
           {arrows.map((p,i)=><span key={i}><b>{p.from}</b> <ArrowRight size={14}/> <b>{p.to}</b></span>)}
           {arrows.length===0&&<span>{en?'The top pieces are already positioned.':'Các viên đã đúng vị trí.'}</span>}
         </div>
         <p>{en?'A green arrow shows a physical piece moving from its original slot to its destination.':'Mũi tên xanh chỉ viên thật di chuyển từ vị trí ban đầu đến vị trí cần đến.'}</p>
         {focus==='corner-permutation'&&<p>
           {en?'Matching corner pairs (headlights): ':'Cặp đèn pha cùng màu: '}
           <b>{headlightsBefore.length?headlightsBefore.join(', '):(en?'none':'không có')}</b>.
           {' '}{en?'Correctly positioned corners: ':'Góc đã đúng vị trí: '}
           <b>{correctBefore.length?correctBefore.join(', '):(en?'none':'không có')}</b>.
         </p>}
       </div>:
       <div>
         <strong>{en?'Which stickers to inspect':'Nhìn vào những ô màu nào?'}</strong>
         <p>{focus==='white-edge'
           ?(en?'This diagram is the WHITE bottom face D, viewed from below. The side strips show adjacent sticker colours; gold outlines highlight changed stickers.':'Đây là mặt D màu TRẮNG, nhìn từ dưới lên. Dải bên cạnh cho biết màu sát mép; viền vàng đánh dấu ô thay đổi.')
           :focus==='white-corner'
           ?(en?'Look at the four bottom D corners and compare all their adjacent side colours with the centres.':'Hãy nhìn bốn góc mặt dưới D và so đủ màu bên cạnh với các tâm.')
           :focus==='middle-edge'
           ?(en?'This view looks directly at the FRONT F face, not U. Compare the middle-left/right stickers and adjacent side strips.':'Hình nhìn thẳng MẶT TRƯỚC F, không phải mặt U. So hai cạnh giữa và dải màu kề bên.')
           :focus==='edge-orientation'
           ?(en?'Watch only the four U-edge stickers (top, right, bottom, left). White dots mark edges that still need yellow oriented upward.':'Chỉ nhìn bốn ô cạnh trên U (trên, phải, dưới, trái). Dấu chấm trắng đánh dấu cạnh cần đưa vàng lên.')
           :focus==='corner-orientation'
           ?(en?'Watch only the four top corner stickers. The white circles mark corners not yet pointing yellow upward.':'Chỉ nhìn bốn ô góc của U. Vòng tròn trắng là góc còn chưa hướng vàng lên.')
           :(en?'Compare the highlighted face and the piece location before turning.':'So sánh ô màu và vị trí viên trước khi xoay.')}</p>
       </div>}
     <div className="lesson-case-legend">
       <span><i style={{background:lessonPalette.U}}/>{en?'Yellow top (U)':'Vàng trên (U)'}</span>
       <span><i style={{background:lessonPalette.D}}/>{en?'White bottom (D)':'Trắng dưới (D)'}</span>
       <span><i style={{background:lessonPalette.F}}/>{en?'Blue front (F)':'Xanh dương trước (F)'}</span>
       <span><i style={{background:lessonPalette.R}}/>{en?'Red right (R)':'Đỏ bên phải (R)'}</span>
     </div>
   </div>
   {sample.expected&&<div className="lesson-case-result"><strong>{en?'Expected result':'Kết quả cần đạt'}:</strong> {sample.expected}</div>}
   <p className="lesson-case-disclaimer">{en
     ?'The diagram shows an exact mathematically valid example for this algorithm, not a reading of the cube you are holding. Compare all visible side colours as well as the top.'
     :'Sơ đồ là một trạng thái ví dụ hợp lệ về mặt toán học cho công thức này, không phải nhận diện khối thật. Hãy so cả màu cạnh bên, không chỉ nhìn mặt trên.'}</p>
 </section>;
}
