import {useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,CircleHelp,Eye,Hand,Info,Play,ShieldAlert} from 'lucide-react';
import {EN_LESSONS} from '../lib/learn.en';
import type {LearnCase} from '../lib/learn';
import {getSolveMethod,methodText,stageExamples,type MethodStage,type SolveMethodId} from '../lib/solveMethods';
import {useI18n} from '../i18n';
import LessonCaseDiagram,{CaseThumbnail} from './LessonCaseDiagram';
import LearningCube from './LearningCube';

type Props={methodId:Exclude<SolveMethodId,'beginner'>;onStartSolve:()=>void};
const FACE_DATA=[
 {face:'U',x:104,y:5},{face:'L',x:5,y:104},{face:'F',x:104,y:104},
 {face:'R',x:203,y:104},{face:'D',x:104,y:203},
] as const;
const focus=(methodId:SolveMethodId,stageId:string,face:string,row:number,col:number)=>{
 if(methodId==='roux'){
  if(stageId==='first-block')return face==='L'&&row>=1;
  if(stageId==='second-block')return face==='R'&&row>=1;
  if(stageId==='cmll')return face==='U'&&(row===0||row===2)&&(col===0||col===2);
  return (face==='U'&&(row===1||col===1))||(face==='F'&&col===1)||(face==='D'&&col===1);
 }
 if(methodId==='zz'){
  if(stageId==='eoline')return (face==='D'&&(row===0||row===2)&&col===1)
   ||(face==='U'&&[0,1,2].includes(row)&&(row===1||col===1))
   ||(face==='F'&&(row===0||row===2)&&col===1);
  if(stageId==='zzf2l')return face!=='U'&&row>=1;
  return face==='U';
 }
 if(stageId==='cross')return face==='D'&&((row===1&&col!==1)||(col===1&&row!==1));
 if(stageId==='f2l')return face!=='U'&&row>=1;
 if(stageId.includes('oll'))return face==='U'&&(stageId==='oll-edges'?(row===1||col===1):true);
 if(stageId.includes('pll'))return face==='U'||(face==='F'&&row===0);
 return face==='U';
};
function MethodConceptMap({methodId,stage}:{methodId:SolveMethodId;stage:MethodStage}){
 const {language}=useI18n();
 return <div className="method-concept">
   <svg viewBox="0 0 306 308" role="img" aria-label={language==='en'?'Concept diagram showing the stage focus, not an exact cube state':'Sơ đồ khái niệm về vùng cần giải, không phải trạng thái Rubik thật'}>
     {FACE_DATA.map(({face,x,y})=><g key={face}>
       <rect x={x-4} y={y-4} width="97" height="97" rx="9" fill="#0e1b2b" stroke="#35566d" strokeWidth="2"/>
       {Array.from({length:9},(_,i)=>{
         const row=Math.floor(i/3),col=i%3,active=focus(methodId,stage.id,face,row,col);
         return <rect key={i} x={x+col*30} y={y+row*30} width="27" height="27" rx="4"
           fill={active?'#57e1b2':'#20374e'} stroke={active?'#c6ffec':'#496078'} strokeWidth={active?2:1}/>;
       })}
       <text x={x+44} y={y+45} fontSize="14" fontWeight="800" textAnchor="middle" fill={face==='U'?'#12392d':'#eaf8f8'} opacity=".92">{face}</text>
     </g>)}
   </svg>
   <p><b>{language==='en'?'Highlighted region':'Vùng được tô sáng'}:</b> {language==='en'
    ?'A conceptual learning target. It is not a detected 54-sticker cube state or a computed method-specific solution.'
    :'Đây là sơ đồ vùng cần học, không phải ảnh 54 ô màu được nhận diện hoặc lời giải riêng của phương pháp.'}</p>
 </div>;
}
function translatedCase(sourceId:string,caseData:LearnCase,english:boolean):LearnCase{
 if(!english)return caseData;
 const found=EN_LESSONS.find(l=>l.id===sourceId)?.cases.find(c=>c.id===caseData.id);
 return found??caseData;
}
export default function MethodCurriculum({methodId,onStartSolve}:Props){
 const {language}=useI18n(),en=language==='en';
 const method=getSolveMethod(methodId);
 const [index,setIndex]=useState(0),[exampleIndex,setExampleIndex]=useState(0);
 const [confirmed,setConfirmed]=useState<Readonly<Record<string,boolean>>>({});
 useEffect(()=>{setIndex(0);setExampleIndex(0);setConfirmed({});},[methodId]);
 const current=method.stages[index];
 const examples=useMemo(()=>current.example?stageExamples(current.example):[],[current.example]);
 const sample=examples[exampleIndex]??examples[0];
 const caseData=sample&&current.example?translatedCase(current.example.lessonId,sample,en):null;
 const sourceStage=current.example?.lessonId;
 const changeIndex=(next:number)=>{setIndex(next);setExampleIndex(0);};
 const goNext=()=>{if(index<method.stages.length-1)changeIndex(index+1);};
 const completed=Object.keys(confirmed).filter(k=>confirmed[k]).length;
 return <div className="method-curriculum">
   <div className="method-curriculum-heading">
     <span className="eyebrow"><BookOpen size={16}/>{en?'METHOD-SPECIFIC LEARNING':'HỌC THEO PHƯƠNG PHÁP'}</span>
     <h2>{method.name}</h2>
     <p>{methodText(method.keyIdea,language)}</p>
   </div>
   <div className="method-curriculum-progress">
     <b>{completed}/{method.stages.length} {en?'stages you have marked as practised':'chặng bạn đã đánh dấu thực hành'}</b>
     <div className="progress"><div style={{width:`${Math.round(100*completed/method.stages.length)}%`}}/></div>
     <small>{en?'Self-reported practice only, not camera-verified physical cube progress.':
      'Tiến độ do bạn tự đánh dấu, chưa có camera xác minh Rubik thật.'}</small>
   </div>
   <nav className="method-curriculum-nav" aria-label={en?'Select a stage':'Chọn giai đoạn'}>
     {method.stages.map((stage,i)=><button type="button" key={stage.id} aria-current={index===i?'step':undefined}
       className={index===i?'active':''} onClick={()=>changeIndex(i)}>
       <span className="method-stage-index">{confirmed[stage.id]?<CheckCircle2 size={17}/>:i+1}</span>
       <span>{methodText(stage.title,language)}</span>
     </button>)}
   </nav>
   <section className="method-stage-content" aria-labelledby="method-stage-title">
     <div className="method-stage-heading">
       <span>{en?'STAGE':'CHẶNG'} {index+1} / {method.stages.length}</span>
       <h3 id="method-stage-title">{methodText(current.title,language)}</h3>
       <p>{methodText(current.goal,language)}</p>
     </div>
     <div className="method-stage-guidance">
       <div className="method-instruction"><Eye size={19}/><div><strong>{en?'1 · Recognize':'1 · Nhận diện'}</strong>
         <p>{methodText(current.recognize,language)}</p></div></div>
       <div className="method-instruction"><Hand size={19}/><div><strong>{en?'2 · Hold the cube':'2 · Cách cầm'}</strong>
         <p>{methodText(current.hold,language)}</p></div></div>
       <div className="method-instruction"><Play size={19}/><div><strong>{en?'3 · Solve this stage':'3 · Thực hiện'}</strong>
         <ol>{current.actions.map((a,i)=><li key={i}>{methodText(a,language)}</li>)}</ol></div></div>
       <div className="method-instruction"><CheckCircle2 size={19}/><div><strong>{en?'4 · Check the result':'4 · Kiểm tra'}</strong>
         <p>{methodText(current.done,language)}</p></div></div>
     </div>
     {current.note&&<div className="method-stage-limit" role="note"><Info size={18}/>{methodText(current.note,language)}</div>}
     <MethodConceptMap stage={current} methodId={methodId}/>
     {sourceStage&&caseData&&<>
       <div className="method-example-header">
         <div><span className="eyebrow">{en?'VERIFIED PRACTICE EXAMPLES':'VÍ DỤ 3D ĐÃ KIỂM THỬ'}</span>
           <h3>{en?'Choose a related algorithm example':'Chọn ví dụ thao tác liên quan'}</h3></div>
         <small>{examples.length} {en?'examples':'ví dụ'}</small>
       </div>
       <div className="learning-case-picker lesson-case-gallery method-example-gallery">
         {examples.map((c,i)=><button key={c.id} type="button" className={i===exampleIndex?'active':''}
           aria-pressed={i===exampleIndex} onClick={()=>setExampleIndex(i)}>
           <CaseThumbnail sample={translatedCase(sourceStage,c,en)} stageId={sourceStage}/>
           <strong>{translatedCase(sourceStage,c,en).title}</strong>
           <code>{c.algorithm}</code>
         </button>)}
       </div>
       <LessonCaseDiagram key={caseData.id} sample={caseData} stageId={sourceStage}/>
       <LearningCube key={`${methodId}-${sourceStage}-${caseData.id}`} sample={caseData}
         stageId={sourceStage} stageGoal={methodText(current.done,language)}/>
       <div className="method-example-note"><ShieldAlert size={17}/>
         {en?'This is a verified technique example from the existing beginner atlas, not a complete automatically generated solution for the selected method. The 3D cube stops at the example stage milestone.':
          'Đây là ví dụ kỹ thuật đã kiểm thử từ bài học hiện có, chưa phải lời giải tự động đầy đủ theo phương pháp đang chọn. 3D dừng ở mục tiêu giai đoạn của ví dụ.'}</div>
     </>}
     {!sourceStage&&<div className="method-stage-unavailable"><CircleHelp size={19}/>
       <div><b>{en?'Technique roadmap (no dedicated 3D solver yet)':'Lộ trình kỹ thuật (chưa có bộ giải 3D riêng)'}</b>
         <p>{en?'Read the recognition and holding steps above. Specific Roux/ZZ case generation and M-slice animation are not implemented; do not use the Kociemba move list as a Roux/ZZ algorithm.':
          'Hãy theo hướng dẫn nhận diện và cầm khối phía trên. CubeMind chưa tạo case Roux/ZZ và hoạt ảnh tầng giữa M riêng; không nên coi dãy xoay Kociemba là công thức Roux/ZZ.'}</p>
       </div>
     </div>}
     <div className="method-stage-footer">
       <button className={confirmed[current.id]?'btn btn-outline':'btn btn-primary'}
         onClick={()=>setConfirmed(p=>({...p,[current.id]:!p[current.id]}))}>
         <CheckCircle2 size={17}/>{confirmed[current.id]?
          (en?'Unmark completed':'Bỏ dấu hoàn thành'):(en?'I completed this stage on my real cube':'Tôi đã làm xong chặng này trên Rubik thật')}
       </button>
       <div className="method-stage-move-nav">
         <button className="btn btn-outline" disabled={index===0} onClick={()=>changeIndex(index-1)}><ArrowLeft size={16}/>{en?'Previous':'Trước'}</button>
         <button className="btn btn-primary" disabled={index===method.stages.length-1} onClick={goNext}>
           {en?'Next stage':'Chặng tiếp'}<ArrowRight size={16}/>
         </button>
       </div>
     </div>
   </section>
   <div className="method-learn-footer">
     <a href={method.resourceUrl} target="_blank" rel="noopener noreferrer">{en?'See the detailed method tutorial':'Xem tài liệu kỹ thuật chi tiết'}</a>
     <button className="btn btn-outline" onClick={onStartSolve}>
       {en?'Use the validated Kociemba 3D solver':'Dùng bộ giải 3D Kociemba đã xác minh'}<ArrowRight size={17}/>
     </button>
   </div>
 </div>;
}
