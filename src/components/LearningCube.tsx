import {useCallback,useEffect,useRef,useState} from 'react';
import {Play,RotateCcw,SkipBack,StepForward,AlertCircle} from 'lucide-react';
import type {TwistyPlayer} from 'cubing/twisty';
import type {LearnCase} from '../lib/learn';
import {getLearnMoves,notationDescription,sampleInitialSetup} from '../lib/learn';

type Props={sample:LearnCase};

/** All playback is user initiated. No useEffect ever calls `player.play()`. */
export default function LearningCube({sample}:Props){
 const mount=useRef<HTMLDivElement>(null);
 const player=useRef<TwistyPlayer|null>(null);
 const [loaded,setLoaded]=useState(false);
 const [error,setError]=useState('');
 const [step,setStep]=useState(0);
 const [speed,setSpeed]=useState(0.65);
 const moves=getLearnMoves(sample);
 const setup=sampleInitialSetup(sample);

 useEffect(()=>{
   let disposed=false;
   void import('cubing/twisty').then(({TwistyPlayer})=>{
     if(disposed||!mount.current)return;
     const p=new TwistyPlayer({puzzle:'3x3x3',visualization:'3D',background:'none',controlPanel:'none',viewerLink:'none',hintFacelets:'floating',experimentalSetupAnchor:'start',experimentalSetupAlg:setup,alg:'',tempoScale:speed});
     player.current=p;
     mount.current.appendChild(p);
     p.pause();p.jumpToStart();
     setLoaded(true);
   }).catch(()=>{if(!disposed)setError('Không tải được Rubik 3D. Bạn vẫn có thể đọc các công thức tiếng Việt bên dưới.');});
   return()=>{disposed=true;player.current?.pause();player.current?.remove();player.current=null;};
 // Only create viewer once. Switching samples resets it in the next effect.
 },[]); // eslint-disable-line react-hooks/exhaustive-deps

 useEffect(()=>{
   const p=player.current;
   if(!loaded||!p)return;
   p.pause();p.experimentalSetupAlg=setup;p.alg='';p.jumpToStart();
   setStep(0);
 },[sample.id,loaded,setup]);
 useEffect(()=>{if(player.current)player.current.tempoScale=speed;},[speed]);

 const reset=useCallback(()=>{
   const p=player.current;if(!p)return;
   p.pause();p.experimentalSetupAlg=setup;p.alg='';p.jumpToStart();setStep(0);
 },[setup]);
 const runAll=()=>{
   const p=player.current;if(!p)return;
   p.pause();p.experimentalSetupAlg=setup;p.alg=sample.algorithm;p.jumpToStart();p.play();setStep(moves.length);
 };
 const runOne=()=>{
   const p=player.current;if(!p||step>=moves.length)return;
   const previous=moves.slice(0,step).join(' ');
   // One button click plays only the requested move, from the correct prefix.
   p.pause();p.experimentalSetupAlg=[setup,previous].filter(Boolean).join(' ');
   p.alg=moves[step];p.jumpToStart();p.play();setStep(s=>s+1);
 };
 const previous=()=>{
   const p=player.current;if(!p||step===0)return;
   const prior=moves.slice(0,step-1).join(' ');
   p.pause();p.experimentalSetupAlg=setup;p.alg=prior;p.jumpToEnd();setStep(s=>s-1);
 };
 return <div className="learning-viewer-shell">
   <div className="learning-viewer">
     <div ref={mount} className="learning-viewer-mount" aria-label="Rubik 3D minh họa công thức, chỉ phát khi bấm nút" />
     {!loaded&&!error&&<div className="learning-viewer-loading">Đang tải mô hình Rubik 3D…</div>}
     {error&&<div className="learning-viewer-error"><AlertCircle size={17}/>{error}</div>}
   </div>
   <div className="learning-viewer-detail">
     <span className="eyebrow">MÔ PHỎNG TƯƠNG TÁC</span>
     <div className="learning-move-sequence" aria-label="Chuỗi bước xoay mẫu">
       {moves.map((move,i)=><button key={`${sample.id}-${i}`} type="button" className={`learning-move-token ${i<step?'completed':''} ${i===step?'current':''}`} title={notationDescription(move)} onClick={()=>{
         const p=player.current;if(!p)return;
         p.pause();p.experimentalSetupAlg=setup;p.alg=moves.slice(0,i).join(' ');p.jumpToEnd();setStep(i);
       }}>{move}</button>)}
     </div>
     <p className="learning-step-status" role="status">{step===0?'Chưa chạy hoạt ảnh. Hãy bấm Xem toàn bộ hoặc Xoay 1 bước.':step>=moves.length?'Đã chọn đến cuối công thức. Bạn có thể xem lại từ đầu.':`Đã xem đến bước ${step}/${moves.length}. Tiếp theo: ${moves[step]} — ${notationDescription(moves[step])}`}</p>
     <div className="learning-viewer-controls">
       <button type="button" className="btn btn-primary" disabled={!loaded} onClick={runAll}><Play size={16}/> Xem toàn bộ</button>
       <button type="button" className="btn btn-outline" disabled={!loaded||step>=moves.length} onClick={runOne}><StepForward size={16}/> Xoay 1 bước</button>
       <button type="button" className="btn btn-outline" disabled={!loaded||step===0} onClick={previous}><SkipBack size={16}/> Lùi 1 bước</button>
       <button type="button" className="btn btn-outline" disabled={!loaded} onClick={reset}><RotateCcw size={16}/> Đặt lại</button>
       <label className="learning-speed">Tốc độ
         <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} aria-label="Tốc độ hoạt ảnh Rubik 3D">
           <option value={0.35}>Rất chậm</option><option value={0.65}>Chậm</option><option value={1}>Bình thường</option>
         </select>
       </label>
     </div>
     <p className="learning-viewer-notice">Kéo để đổi góc nhìn. Hoạt ảnh chỉ chạy khi bạn bấm nút; đây là khối minh họa công thức, không phản ánh Rubik thật đang cầm.</p>
   </div>
 </div>;
}
