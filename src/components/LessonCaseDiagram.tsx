import {useId,useMemo} from 'react';
import {ArrowRight,Hand,ScanEye} from 'lucide-react';
import {FACE_COLORS,type Face} from '../lib/cube';
import type {LearnCase} from '../lib/learn';
import {lessonPattern,movedTopPieces,TOP_SIDE_RING,orientedTopCount,correctTopPieces,headlights,type PieceKind,type PiecePath} from '../lib/lessonDiagrams';
import {useI18n} from '../i18n';

const lessonPalette:Record<Face,string>={
 U:FACE_COLORS.D.hex,D:FACE_COLORS.U.hex,
 F:FACE_COLORS.B.hex,B:FACE_COLORS.F.hex,
 R:FACE_COLORS.R.hex,L:FACE_COLORS.L.hex
};
type Focus='edge-orientation'|'corner-orientation'|'corner-permutation'|'edge-permutation'|'other';
const focusFor=(stageId:string):Focus=>({
 'yellow-cross':'edge-orientation','yellow-face':'corner-orientation',
 'yellow-corners':'corner-permutation','yellow-edges':'edge-permutation',
}[stageId] as Focus|undefined)??'other';

function LayerMap({state,focus,paths=[],compact=false,caption}:{state:string;focus:Focus;paths?:PiecePath[];compact?:boolean;caption?:string}){
 const marker=useId().replace(/:/g,'');
 const edges=focus==='edge-orientation'||focus==='edge-permutation';
 const corners=focus==='corner-orientation'||focus==='corner-permutation';
 const orientation=focus.endsWith('orientation');
 const count=orientation?orientedTopCount(state,edges?'edge':'corner'):0;
 const focusIndices=edges?[1,3,5,7]:corners?[0,2,6,8]:[];
 const pos=(x:number,y:number)=>({x:72+x*48+24,y:72+y*48+24});
 return <svg className={compact?'case-top-svg compact':'case-top-svg'} viewBox="0 0 288 294"
   role="img" aria-label={caption??'Top view of cube and adjacent side stickers'}>
   <defs>
     <marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto" markerUnits="strokeWidth">
       <path d="M0,0 L7,3.5 L0,7 Z" fill="#49f9ce"/>
     </marker>
   </defs>
   <rect x="41" y="41" width="205" height="205" rx="10" fill="#081420" stroke="#507089" strokeWidth="2"/>
   {Array.from({length:9},(_,i)=>{
     const col=i%3,row=Math.floor(i/3),c=state[i] as Face;
     const flagged=orientation&&focusIndices.includes(i)&&state[i]!=='U';
     const x=72+col*48,y=72+row*48;
     return <g key={i}>
       <rect x={x} y={y} width="44" height="44" rx="5" fill={lessonPalette[c]}
         stroke={flagged?'#ffffff':'#0c1d2c'} strokeWidth={flagged?4:2}/>
       {flagged&&<circle cx={x+22} cy={y+22} r="6" fill="#082030" stroke="#ffffff" strokeWidth="2"/>}
     </g>;
   })}
   {TOP_SIDE_RING.map(side=>side.indices.map((index,i)=>{
     let x=0,y=0,w=0,h=0;
     if(side.orientation==='top'){x=72+48*i;y=47;w=44;h=20;}
     if(side.orientation==='bottom'){x=72+48*i;y=219;w=44;h=20;}
     if(side.orientation==='left'){x=47;y=72+48*i;w=20;h=44;}
     if(side.orientation==='right'){x=219;y=72+48*i;w=20;h=44;}
     return <rect key={side.face+i} x={x} y={y} width={w} height={h} rx="3"
       fill={lessonPalette[state[index] as Face]} stroke="#08202d" strokeWidth="2"/>;
   }))}
   <g className="case-map-labels">
     <text x="144" y="36" textAnchor="middle">B</text>
     <text x="144" y="258" textAnchor="middle">F ↓</text>
     <text x="28" y="151" textAnchor="middle">L</text>
     <text x="262" y="151" textAnchor="middle">R</text>
     <text x="144" y="288" textAnchor="middle">{orientation?`${count}/4 ${focus==='edge-orientation'?'edges':'corners'} ↑`:'U / TOP'}</text>
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
 const {before,after}=useMemo(()=>lessonPattern(sample),[sample.algorithm]);
 const focus=focusFor(stageId);
 const kind:PieceKind=focus==='corner-permutation'?'corner':'edge';
 const paths=useMemo(()=>focus.endsWith('permutation')?movedTopPieces(before,after,kind):[],[before,after,kind,focus]);
 return <LayerMap state={before} compact focus={focus} paths={paths} caption={sample.title}/>;
}

export default function LessonCaseDiagram({sample,stageId}:{sample:LearnCase;stageId:string}){
 const {language}=useI18n(),en=language==='en';
 const focus=focusFor(stageId);
 const {before,after}=useMemo(()=>lessonPattern(sample),[sample.algorithm]);
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
       <LayerMap state={before} focus={focus} paths={arrows} caption={en?'Before algorithm':'Trước công thức'}/>
     </div>
     <div className="lesson-case-direction"><ArrowRight size={26}/><span>{en?'Apply the algorithm':'Làm công thức'}</span></div>
     <div className="lesson-case-diagram-card">
       <span className="lesson-diagram-label">{en?'AFTER':'SAU'}</span>
       <LayerMap state={after} focus={focus} caption={en?'After algorithm':'Sau công thức'}/>
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
         <p>{focus==='edge-orientation'
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
