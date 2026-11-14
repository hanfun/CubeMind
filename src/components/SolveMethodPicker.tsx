import {Check,ChevronRight,GraduationCap,Layers3,Waypoints} from 'lucide-react';
import {SOLVE_METHODS,getSolveMethod,methodText,type SolveMethodId} from '../lib/solveMethods';
import {useI18n} from '../i18n';

type Props={
 value:SolveMethodId;
 onChange:(id:SolveMethodId)=>void;
 compact?:boolean;
 engineNotice?:boolean;
};
export default function SolveMethodPicker({value,onChange,compact=false,engineNotice=false}:Props){
 const {language}=useI18n();
 const current=getSolveMethod(value);
 const en=language==='en';
 const tierNames={
  beginner:en?'Beginner':'Cơ bản',
  intermediate:en?'Intermediate':'Trung cấp',
  advanced:en?'Advanced':'Nâng cao',
 };
 return <section className={`solve-method-picker ${compact?'compact':''}`} aria-label={en?'Choose a Rubik solving method':'Chọn phương pháp giải Rubik'}>
   {!compact&&<div className="solve-method-heading">
     <div className="eyebrow"><GraduationCap size={16}/>{en?'CHOOSE A SOLVING METHOD':'CHỌN PHƯƠNG PHÁP GIẢI'}</div>
     <h2>{en?'From beginner to advanced':'Từ cơ bản đến nâng cao'}</h2>
     <p>{en?'Select your preferred learning path. Each method has its own checkpoints and instructions.':'Chọn lộ trình phù hợp. Mỗi phương pháp có những chặng và cách nhận diện khác nhau.'}</p>
   </div>}
   <div className="solve-method-grid" role="group" aria-label={en?'Available solving methods':'Các phương pháp giải'}>
     {SOLVE_METHODS.map(m=><button key={m.id} type="button"
       className={`solve-method-tile ${m.id===value?'active':''}`}
       aria-pressed={m.id===value} onClick={()=>onChange(m.id)}>
       <span className="solve-method-tile-top">
         <strong>{m.name}</strong>
         {m.id===value&&<Check size={18} aria-hidden="true"/>}
       </span>
       <span className="solve-method-tier">{tierNames[m.level]} · {m.stages.length} {en?'stages':'chặng'}</span>
       <span className="solve-method-short">{methodText(m.subtitle,language)}</span>
     </button>)}
   </div>
   <div className="solve-method-selection">
     <div className="solve-method-selection-heading">
       <span><Layers3 size={17}/><b>{current.name}</b></span>
       <span>{current.stages.length} {en?'stages':'chặng'}</span>
     </div>
     <p>{methodText(current.summary,language)}</p>
     <div className="solve-method-trail">
       {current.stages.map((stage,i)=><span key={stage.id}><b>{i+1}.</b> {methodText(stage.title,language)} {i<current.stages.length-1&&<ChevronRight size={12}/>}</span>)}
     </div>
     <div className="solve-method-idea"><Waypoints size={17}/>{methodText(current.keyIdea,language)}</div>
   </div>
   {engineNotice&&<p className="solve-method-engine-note">
     {en?'Important: the live camera/scramble solver currently generates validated Kociemba moves, regardless of your chosen learning method. Selecting Roux, ZZ or CFOP does not generate method-specific automatic moves. Their stages are for guided learning and practice.':
       'Lưu ý: Bộ giải tự động từ camera/chuỗi trộn hiện tạo dãy xoay Kociemba đã xác minh, không phụ thuộc phương pháp bạn chọn. Chọn Roux, ZZ hay CFOP không biến dãy xoay đó thành lời giải của phương pháp tương ứng. Các lộ trình này dùng để học và thực hành theo từng chặng.'}
   </p>}
 </section>;
}
