import {useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,Hand,Lightbulb,ShieldAlert} from 'lucide-react';
import {LEARN_LESSONS,NOTATION,notationDescription} from '../lib/learn';
import {EN_LESSONS} from '../lib/learn.en';
import {useI18n} from '../i18n';
import LearningCube from './LearningCube';

type Props={onBack:()=>void;onStartSolve:()=>void};
export default function LearnPage({onBack,onStartSolve}:Props){
 const {language}=useI18n();
 const lessons=language==='en'?EN_LESSONS:LEARN_LESSONS;
 const [tab,setTab]=useState<'notation'|'lessons'>('notation');
 const [lessonIndex,setLessonIndex]=useState(0);
 const [caseIndex,setCaseIndex]=useState(0);
 const lesson=lessons[lessonIndex];
 const sample=lesson.cases[caseIndex];
 const changeLesson=(idx:number)=>{setLessonIndex(idx);setCaseIndex(0);};
 return <div className="learning-page">
   <button className="nav-back" onClick={onBack}><ArrowLeft size={16}/> Quay lại</button>
   <div className="learning-header"><span className="micro-badge"><BookOpen size={15}/> HỌC RUBIK BẰNG TIẾNG VIỆT</span>
     <h1 className="page-title">Học giải Rubik 3×3</h1>
     <p className="page-description">Tìm hiểu ký hiệu, 7 giai đoạn cơ bản và xem Rubik 3D xoay mẫu. Không tự phát hoạt ảnh khi mở màn hình.</p>
   </div>
   <div className="learning-tabs" role="tablist" aria-label="Nội dung bài học">
     <button role="tab" aria-selected={tab==='notation'} className={tab==='notation'?'active':''} onClick={()=>setTab('notation')}><BookOpen size={18}/> Quy ước ký hiệu</button>
     <button role="tab" aria-selected={tab==='lessons'} className={tab==='lessons'?'active':''} onClick={()=>setTab('lessons')}><Hand size={18}/> 7 bước giải cơ bản</button>
   </div>
   {tab==='notation'?<div className="learning-notation">
     <div className="learning-section-heading"><h2>Sáu mặt của Rubik</h2><p>Chữ cái chỉ mặt cần xoay, không phải màu cố định. Đặt khối đúng tư thế trước khi làm theo công thức.</p></div>
     <div className="learning-notation-grid">{NOTATION.map(item=><div key={item.face} className="learning-notation-card"><strong>{item.face}</strong><div><b>{item.vi}</b><span>{item.description}</span></div></div>)}</div>
     <div className="learning-symbol-card"><h3>Cách đọc dấu và số</h3><div className="learning-suffix-examples"><div><b>R</b><span>90° cùng chiều kim đồng hồ</span></div><div><b>R'</b><span>90° ngược chiều kim đồng hồ</span></div><div><b>R2</b><span>180° (nửa vòng)</span></div></div><p><strong>Rất quan trọng:</strong> chiều kim đồng hồ được tính khi bạn <strong>nhìn thẳng vào mặt đang xoay</strong>, không tính từ góc bạn đang nhìn tổng thể cả khối.</p></div>
     <div className="learning-notice"><Lightbulb size={20}/><div><b>Cách cầm khi học phương pháp cơ bản</b><p>Giữ <b>trắng ở dưới</b>, <b>vàng ở trên</b>. Công thức trong phần học là ví dụ cho từng trường hợp, không phải một chuỗi tự động giải mọi khối Rubik. Màu trên dưới của màn hình học có thể khác hướng mặc định trong màn hình quét.</p></div></div>
     <div className="learning-symbol-demo"><div className="learning-section-heading"><h2>Xoay thử từng ký hiệu</h2><p>Chọn mặt và cách xoay, sau đó nhấn Xem toàn bộ hoặc Xoay 1 bước để xem minh họa.</p></div><NotationPractice/></div>
     <button className="btn btn-primary learning-next" onClick={()=>setTab('lessons')}>Bắt đầu 7 bước giải <ArrowRight size={18}/></button>
   </div>:<div className="learning-lessons">
     <div className="learning-lesson-picker" aria-label="Chọn giai đoạn giải">{lessons.map((l,i)=><button key={l.id} className={i===lessonIndex?'active':''} onClick={()=>changeLesson(i)} title={l.title}><span>{i+1}</span><b>{l.title}</b></button>)}</div>
     <section className="learning-lesson-body">
       <div className="learning-lesson-title"><span className="eyebrow">GIAI ĐOẠN {lessonIndex+1} / {lessons.length} · {lesson.subtitle.toUpperCase()}</span><h2>{lesson.title}</h2><p>{lesson.goal}</p></div>
       <div className="learning-instructions"><h3>Thực hiện như thế nào?</h3><ol>{lesson.instructions.map(s=><li key={s}>{s}</li>)}</ol><div className="learning-check"><CheckCircle2 size={19}/><span><b>Đạt khi:</b> {lesson.check}</span></div></div>
       <div className="learning-case-header"><div><span className="eyebrow">TRƯỜNG HỢP MINH HỌA</span><h3>Chọn công thức để xem</h3></div><span className="learning-counter">{caseIndex+1}/{lesson.cases.length}</span></div>
       <div className="learning-case-picker">{lesson.cases.map((c,i)=><button key={c.id} className={i===caseIndex?'active':''} onClick={()=>setCaseIndex(i)}><strong>{c.title}</strong><code>{c.algorithm}</code></button>)}</div>
       <div className="learning-case-description"><h3>{sample.title}</h3><p><b>Khi nào dùng:</b> {sample.when}</p><p><b>Cách hoạt động:</b> {sample.explanation}</p></div>
       <LearningCube key={sample.id} sample={sample}/>
       {sample.caution&&<div className="learning-notice warning"><ShieldAlert size={20}/><p>{sample.caution}</p></div>}
       <div className="learning-lesson-navigation"><button className="btn btn-outline" disabled={lessonIndex===0} onClick={()=>changeLesson(lessonIndex-1)}><ArrowLeft size={16}/> Bước trước</button><button className="btn btn-primary" onClick={()=>{if(lessonIndex===lessons.length-1){onStartSolve();}else changeLesson(lessonIndex+1);}}>{lessonIndex===lessons.length-1?'Thử giải Rubik':'Bước tiếp theo'} <ArrowRight size={16}/></button></div>
     </section>
   </div>}
 </div>;
}

function NotationPractice(){
 const [face,setFace]=useState('R');const [suffix,setSuffix]=useState('');
 const algorithm=`${face}${suffix}`;
 const sample={id:`notation-${algorithm}`,title:`Ký hiệu ${algorithm}`,when:'Bài thực hành xem hướng xoay từ đúng mặt.',algorithm,explanation:notationDescription(algorithm)};
 return <>
   <div className="learning-practice-controls"><div><b>Chọn mặt</b><div className="learning-chip-row">{NOTATION.map(item=><button key={item.face} className={face===item.face?'active':''} onClick={()=>setFace(item.face)}>{item.face}</button>)}</div></div>
   <div><b>Chọn hướng</b><div className="learning-chip-row">{[{label:'90° thuận',value:''},{label:'90° ngược',value:"'"},{label:'180°',value:'2'}].map(it=><button key={it.label} className={suffix===it.value?'active':''} onClick={()=>setSuffix(it.value)}>{it.label}</button>)}</div></div></div>
   <p className="learning-case-description"><b>{algorithm}:</b> {notationDescription(algorithm)}</p>
   <LearningCube key={sample.id} sample={sample}/>
 </>;
}
