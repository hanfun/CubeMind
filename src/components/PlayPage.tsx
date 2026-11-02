import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import Cube from 'cubejs';
import {ArrowLeft,CheckCircle2,Eye,Hand,Lightbulb,LoaderCircle,Play,RotateCcw,Shuffle,SkipForward,Sparkles,Undo2,View} from 'lucide-react';
import PlayableCube3D,{type PlayableCubeHandle} from './PlayableCube3D';
import {SOLVED,moveInfo,type MoveToken} from '../lib/cube';
import {generateScramble,parseSavedHistory,undoPlayMove} from '../lib/play';
import {solveInWorker} from '../lib/solver';

const SAVE_KEY='rubik-studio-play-v1';
const readSaved=():MoveToken[]=>{try{return parseSavedHistory(JSON.parse(localStorage.getItem(SAVE_KEY)||'[]'));}catch{return [];}};
type Hint={forFacelets:string;moves:string[]};
type Job='idle'|'hint'|'scramble'|'auto';
type Props={onBack:()=>void};
const BUTTONS=['U','R','F','D','L','B'] as const;
export default function PlayPage({onBack}:Props){
 const [initial]=useState(readSaved);
 const [history,setHistory]=useState<MoveToken[]>(initial);
 const [sceneKey,setSceneKey]=useState(0);
 const [job,setJob]=useState<Job>('idle');
 const [rotating,setRotating]=useState(false);
 const [orbitOnly,setOrbitOnly]=useState(false);
 const [hint,setHint]=useState<Hint|null>(null);
 const [message,setMessage]=useState('');
 const [progress,setProgress]=useState('');
 const cubeRef=useRef<PlayableCubeHandle>(null),historyRef=useRef(initial),jobRef=useRef<Job>('idle'),cancelRef=useRef(false),faceletsRef=useRef(SOLVED);
 // Pure replay of player actions: never derive solver state from current camera/viewer pose.
 const facelets=useMemo(()=>{const c=new Cube();if(history.length)c.move(history.join(' '));return c.asString();},[history]);
 const solved=facelets===SOLVED;
 faceletsRef.current=facelets;
 const busy=job!=='idle'||rotating;
 const changeHistory=(fn:(h:MoveToken[])=>MoveToken[])=>{setHistory(prev=>{const next=fn(prev);historyRef.current=next;return next;});setHint(null);};
 useEffect(()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(history));}catch{/* private mode */}},[history]);
 useEffect(()=>()=>{cancelRef.current=true;},[]);
 const onUserMove=useCallback((move:string)=>{
  changeHistory(h=>[...h,move]);setMessage(`Đã xoay ${move}.`);
 },[]);
 const requireCube=()=>{if(cubeRef.current)return true;setMessage('Mô hình WebGL chưa sẵn sàng; không thể thực hiện lượt xoay.');return false;};
 const doMove=async(move:string)=>{
  if(busy||!requireCube())return;
  setMessage('');try{await cubeRef.current?.turn(move,300);changeHistory(h=>[...h,move]);}catch(e){setMessage(e instanceof Error?e.message:'Chưa thể xoay Rubik.');}
 };
 useEffect(()=>{
  const key=(e:KeyboardEvent)=>{if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName))return;
   const move=e.key.toUpperCase();if(!BUTTONS.includes(move as typeof BUTTONS[number]))return;
   e.preventDefault();void doMove(move+(e.shiftKey?"'":''));};
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 });
 const fresh=()=>{cancelRef.current=true;jobRef.current='idle';setJob('idle');setRotating(false);setHistory([]);historyRef.current=[];setHint(null);setProgress('');setMessage('Đã tạo Rubik hoàn chỉnh mới.');setSceneKey(k=>k+1);};
 const undo=async()=>{if(busy||!requireCube())return;const move=undoPlayMove(history);if(!move)return;
  try{await cubeRef.current?.turn(move,330);changeHistory(h=>h.slice(0,-1));setMessage('Đã hoàn tác bước vừa xoay.');}catch(e){setMessage(String(e));}
 };
 const beginJob=(name:Job)=>{if(jobRef.current!=='idle')return false;jobRef.current=name;setJob(name);setMessage('');cancelRef.current=false;return true;};
 const endJob=()=>{jobRef.current='idle';setJob('idle');setProgress('');};
 const scramble=async()=>{
  if(busy||!requireCube()||!beginJob('scramble'))return;
  const moves=generateScramble(22);
  try{for(const move of moves){if(cancelRef.current)break;
   await cubeRef.current?.turn(move,125);if(cancelRef.current)break;
   changeHistory(h=>[...h,move]);}
   if(!cancelRef.current)setMessage(`Đã trộn Rubik bằng ${moves.length} thao tác.`);
  }catch(e){setMessage(`Trộn bị gián đoạn: ${String(e)}`);}finally{endJob();}
 };
 const fetchSolution=async():Promise<Hint|null>=>{
  const state=faceletsRef.current;if(state===SOLVED){setMessage('Rubik đã hoàn chỉnh.');return null;}
  if(hint?.forFacelets===state)return hint;
  setProgress('Đang tìm lời giải từ trạng thái hiện tại…');
  const result=await solveInWorker({kind:'facelets',facelets:state},setProgress);
  if(cancelRef.current||faceletsRef.current!==state)throw new Error('Rubik đã thay đổi trong khi tính. Hãy thử lại.');
  const next={forFacelets:state,moves:result.solution};setHint(next);return next;
 };
 const requestHint=async()=>{if(busy||!beginJob('hint'))return;
  try{const h=await fetchSolution();if(h?.moves.length)setMessage(`Gợi ý: ${h.moves[0]} — ${moveInfo(h.moves[0]).description}`);}
  catch(e){setMessage(`Không thể tạo gợi ý: ${String(e)}`);}finally{endJob();}
 };
 const applyHint=async()=>{if(!hint||hint.forFacelets!==facelets||busy)return;
  await doMove(hint.moves[0]);
 };
 const previewHint=async()=>{if(!hint||hint.forFacelets!==facelets||busy||!requireCube())return;
  try{await cubeRef.current?.preview(hint.moves[0]);}catch(e){setMessage(String(e));}
 };
 const autoSolve=async()=>{
  if(busy||solved||!requireCube()||!beginJob('auto'))return;
  try{const h=await fetchSolution();if(!h)return;
   for(let i=0;i<h.moves.length;i++){
    if(cancelRef.current)break;
    setProgress(`Đang giải: ${i+1}/${h.moves.length} bước`);
    await cubeRef.current?.turn(h.moves[i],420);
    if(cancelRef.current)break;
    changeHistory(prev=>[...prev,h.moves[i]]);
   }
   if(!cancelRef.current)setMessage('Đã hoàn thành lời giải được xác minh bởi Solver.');
  }catch(e){setMessage(`Không thể giải nhanh: ${String(e)}`);}finally{endJob();}
 };
 const cancel=()=>{cancelRef.current=true;setMessage('Sẽ dừng sau lượt xoay hiện tại.');};
 return <section className="play-page">
  <button className="nav-back" onClick={onBack}><ArrowLeft size={16}/> Trang chủ</button>
  <div className="play-intro"><span className="micro-badge"><Sparkles size={14}/> KHU VỰC CHƠI 3D</span><h1 className="page-title">Chơi Rubik ngay trên web</h1>
   <p className="page-description">Xoay bằng chuột hoặc ngón tay. Khi bí, xem một bước gợi ý — hoặc để bộ giải tự hoàn thành khối Rubik.</p></div>
  <div className="play-layout">
   <div className="play-scene-card">
    <div className="play-cube-top"><span className="play-pill">{solved?<><CheckCircle2 size={16}/> Đã giải xong</>:<>● Đang chơi · {history.length} lượt</>}</span><button className="play-text-button" onClick={()=>cubeRef.current?.resetView()}><View size={16}/> Góc mặc định</button></div>
    <PlayableCube3D key={sceneKey} ref={cubeRef} initialMoves={sceneKey===0?initial:[]} onUserMove={onUserMove} onBusyChange={setRotating} orbitOnly={orbitOnly||job!=='idle'}/>
    <div className="play-gesture-row"><button className={`play-view-mode ${orbitOnly?'selected':''}`} onClick={()=>setOrbitOnly(v=>!v)}><Hand size={17}/>{orbitOnly?'Đang kéo đổi góc':'Chế độ xoay mặt'}</button><small>{orbitOnly?'Kéo ở bất kỳ đâu để xoay góc nhìn.':'Vuốt một hàng/cột ngoài của Rubik để xoay. Kéo vùng trống để đổi góc nhìn.'}</small></div>
    <div className="play-turns"><span>XOAY BẰNG NÚT · HOẶC PHÍM R U F D L B</span><div className="play-turn-grid">{BUTTONS.map(f=><div className="play-turn-pair" key={f}><button disabled={busy} onClick={()=>void doMove(f)}>{f}</button><button disabled={busy} onClick={()=>void doMove(`${f}'`)}>{f}'</button></div>)}</div></div>
    <div className="play-actions"><button className="btn btn-outline" disabled={busy} onClick={()=>void undo()}><Undo2 size={17}/> Hoàn tác</button><button className="btn btn-outline" disabled={busy} onClick={()=>void scramble()}><Shuffle size={17}/> Trộn ngẫu nhiên</button><button className="btn btn-ghost" onClick={fresh}><RotateCcw size={17}/> Chơi lại</button></div>
   </div>
   <aside className="play-helper">
    <div className="play-help-head"><span className="eyebrow">TRỢ LÝ GIẢI RUBIK</span><h2>Bạn đang bí?</h2><p>Tính toán từ <b>trạng thái hiện tại của Rubik 3D</b>, không dùng một chuỗi mẫu cố định.</p></div>
    <div className="play-help-card hint"><div className="play-help-icon"><Lightbulb size={22}/></div><h3>Gợi ý bước tiếp theo</h3><p>Hiển thị chính xác mặt và chiều xoay để bạn tự giải. Nút xem mẫu chỉ mô phỏng và tự trở lại vị trí cũ.</p>
     <button className="btn btn-outline btn-wide" disabled={busy||solved} onClick={()=>void requestHint()}><Lightbulb size={17}/> {job==='hint'?'Đang phân tích…':'Xem gợi ý'}</button>
     {hint&&hint.forFacelets===facelets&&hint.moves.length>0&&<div className="play-hint-result"><span>BƯỚC TIẾP THEO</span><strong>{hint.moves[0]}</strong><p>{moveInfo(hint.moves[0]).description}</p><div className="play-hint-controls"><button disabled={busy} onClick={()=>void previewHint()}><Eye size={16}/> Xem mẫu</button><button disabled={busy} onClick={()=>void applyHint()}><SkipForward size={16}/> Thực hiện</button></div><small>Còn khoảng {hint.moves.length} bước theo lời giải đã tính.</small></div>}
    </div>
    <div className="play-help-card auto"><div className="play-help-icon"><Sparkles size={22}/></div><h3>AI giải nhanh</h3><p>Bộ giải Kociemba trên thiết bị tính và thực hiện toàn bộ bước, Rubik 3D sẽ xoay từng mặt cho đến khi hoàn chỉnh.</p>
     <button className="btn btn-primary btn-wide" disabled={busy||solved} onClick={()=>void autoSolve()}><Play size={17}/> {job==='auto'?'Đang tự giải…':'AI giải ngay'}</button>
    </div>
    {(job!=='idle'||progress)&&<div className="play-progress" role="status"><LoaderCircle size={18} className="play-spin"/><span>{progress||'Đang xoay Rubik…'}</span>{(job==='auto'||job==='scramble')&&<button onClick={cancel}>Dừng</button>}</div>}
    {message&&<div className="play-feedback" role="status">{message}</div>}
    {solved&&<div className="play-success"><CheckCircle2 size={20}/><div><b>Rubik đã hoàn chỉnh!</b><p>Bạn có thể trộn lại hoặc tạo một khối mới.</p></div></div>}
    <div className="play-history"><span className="eyebrow">LỊCH SỬ XOAY</span><div>{history.length?history.slice(-18).map((m,i)=><span className="move-chip" key={`${history.length-18+i}-${m}`}>{m}</span>):<small>Chưa có thao tác nào.</small>}</div></div>
    <p className="play-disclaimer">“AI giải nhanh” là tên tính năng giải tự động bằng thuật toán Kociemba, không gọi dịch vụ AI bên ngoài. Trạng thái luôn được tính lại từ các thao tác của người chơi.</p>
   </aside>
  </div>
 </section>;
}
