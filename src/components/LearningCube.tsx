import {useMemo,useRef,useState} from 'react';
import {Play,RotateCcw,SkipBack,StepForward,AlertCircle} from 'lucide-react';
import {invertMoves} from '../lib/cube';
import type {LearnCase} from '../lib/learn';
import {getLearnMoves} from '../lib/learn';
import {algorithmSnapshots} from '../lib/stepVisual';
import {lessonSetupMoves,lessonSnapshots} from '../lib/lessonScenario';
import {useI18n} from '../i18n';
import PlayableCube3D,{type PlayableCubeHandle} from './PlayableCube3D';
import FormulaSteps from './FormulaSteps';

type Props={sample:LearnCase;stageId?:string;stageGoal?:string};

/**
 * 3D illustrations use the same Three.js viewer as the playable cube.
 * Stage-scoped initial states preserve the incomplete later stages.
 * Never autoplay on mount; progress changes only after an actual animation finishes.
 * A viewer is reconstructed at an exact prefix when the learner seeks backward.
 */
export default function LearningCube({sample,stageId,stageGoal}:Props){
 const {language}=useI18n(),en=language==='en';
 const cubeRef=useRef<PlayableCubeHandle>(null);
 const actionRef=useRef(false),generation=useRef(0);
 const [ready,setReady]=useState(false),[busy,setBusy]=useState(false),[step,setStep]=useState(0),[sceneKey,setSceneKey]=useState(0);
 const [speed,setSpeed]=useState(0.65),[error,setError]=useState('');
 const moves=useMemo(()=>getLearnMoves(sample),[sample.algorithm]);
 const snapshots=useMemo(()=>stageId?lessonSnapshots(stageId,sample.algorithm):algorithmSnapshots(sample.algorithm),[stageId,sample.algorithm]);
 const setup=useMemo(()=>[
   ...(stageId?lessonSetupMoves(stageId,sample.algorithm):invertMoves(moves)),
   ...moves.slice(0,step),
 ],[stageId,sample.algorithm,step]); // eslint-disable-line react-hooks/exhaustive-deps

 const seek=(index:number)=>{
   if(actionRef.current)return;
   const next=Math.max(0,Math.min(index,moves.length));
   generation.current++;
   setStep(next);
   setReady(false);
   setError('');
   setSceneKey(k=>k+1);
 };
 const play=(all:boolean)=>{
   if(!ready||actionRef.current||step>=moves.length)return;
   actionRef.current=true;
   setBusy(true);
   setError('');
   const token=generation.current;
   const start=step,end=all?moves.length:start+1;
   const run=async()=>{
     try{
       for(let i=start;i<end;i++){
         if(generation.current!==token)return;
         await cubeRef.current?.turn(moves[i],(moves[i].endsWith('2')?800:530)/speed);
         if(generation.current!==token)return;
         setStep(i+1);
       }
     }catch(e){
       if(generation.current===token)setError(e instanceof Error?e.message:(en?'Animation unavailable.':'Không thể phát mô phỏng.'));
     }finally{
       if(generation.current===token){actionRef.current=false;setBusy(false);}
     }
   };
   void run();
 };
 return <div className="learning-viewer-shell">
   <div className="learning-viewer-column">
     <div className="learning-viewer">
       <PlayableCube3D key={sceneKey} ref={cubeRef} initialMoves={setup}
         orbitOnly teachingOrientation onUserMove={()=>{}}
         onReadyChange={setReady}/>
       {!ready&&!error&&<div className="learning-viewer-loading">{en?'Loading interactive 3D cube…':'Đang mở mô hình Rubik 3D…'}</div>}
       {error&&<div className="learning-viewer-error"><AlertCircle size={17}/>{error}</div>}
     </div>
     <div className="learning-viewer-action-area">
       <div className="learning-viewer-controls">
         <button type="button" className="btn btn-primary" disabled={!ready||busy||step>=moves.length} onClick={()=>play(true)}><Play size={16}/>{en?'Play formula':'Xem toàn bộ'}</button>
         <button type="button" className="btn btn-outline" disabled={!ready||busy||step>=moves.length} onClick={()=>play(false)}><StepForward size={16}/>{en?'One move':'Xoay 1 bước'}</button>
         <button type="button" className="btn btn-outline" disabled={!ready||busy||step===0} onClick={()=>seek(step-1)}><SkipBack size={16}/>{en?'Previous':'Lùi 1 bước'}</button>
         <button type="button" className="btn btn-outline" disabled={!ready||busy} onClick={()=>seek(0)}><RotateCcw size={16}/>{en?'Reset':'Đặt lại'}</button>
         <label className="learning-speed">{en?'Speed':'Tốc độ'}
           <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} disabled={busy} aria-label={en?'3D animation speed':'Tốc độ hoạt ảnh 3D'}>
             <option value={0.35}>{en?'Very slow':'Rất chậm'}</option>
             <option value={0.65}>{en?'Slow':'Chậm'}</option>
             <option value={1}>{en?'Normal':'Bình thường'}</option>
           </select>
         </label>
       </div>
       <p className="learning-step-status" aria-live="polite">
         {step===0?(en?'Ready. Click Play formula or One move.':'Sẵn sàng. Bấm Xem toàn bộ hoặc Xoay 1 bước.'):
          step===moves.length?(stageId&&stageId!=='yellow-edges'?
           (en?'This stage is complete. The cube is NOT fully solved; continue learning the next stage.':'Đã đạt mục tiêu giai đoạn này. Rubik CHƯA giải hoàn toàn; hãy tiếp tục giai đoạn sau.'):
           (en?'Example complete. Click Reset to replay.':'Đã xem xong ví dụ. Bấm Đặt lại để xem từ đầu.')):
          (en?`Completed ${step}/${moves.length} moves.`:`Đã xem ${step}/${moves.length} bước.`)}
       </p>
       {stageGoal&&<p className="learning-step-goal"><strong>{en?'Stage target:':'Mục tiêu giai đoạn:'}</strong> {stageGoal}</p>}
       <p className="learning-viewer-notice">{en
          ? 'Drag to change the view. The cube turns only when you click a play button. White is down and yellow is up in this lesson.'
          : 'Kéo để đổi góc nhìn. Rubik chỉ tự xoay khi bạn bấm nút. Bài học giữ trắng ở dưới và vàng ở trên.'}</p>
     </div>
   </div>
   <FormulaSteps moves={moves} snapshots={snapshots} activeIndex={step} completedCount={step} variant="lesson" onSelectStep={seek}/>
 </div>;
}
