import {useEffect,useReducer,useRef,useState} from 'react';
import {ArrowLeft,Check,CheckCircle2,ChevronRight,Eye,HelpCircle,Pause,Play,RotateCcw,ShieldAlert,SkipBack,Undo2,X} from 'lucide-react';
import {FACE_COLORS,moveInfo,inverseMove} from '../lib/cube';
import {guideReducer,saveSession,type SolveSession} from '../lib/guide';
import TwistyCube from './TwistyCube';

type Props={session:SolveSession;mode:'manual'|'auto';onModeChange:(mode:'manual'|'auto')=>void;onExit:()=>void;onRestart:()=>void;onSession:(s:SolveSession)=>void;};
export default function Guide({session:initial,mode,onModeChange,onExit,onRestart,onSession}:Props){
 const [session,dispatch]=useReducer(guideReducer,initial);
 const [speed,setSpeed]=useState(0.5),[paused,setPaused]=useState(false),[autoPlaying,setAutoPlaying]=useState(false),[dialog,setDialog]=useState<'none'|'recovery'|'undo'|'reset'|'resume'>('none');
 const [reviewIndex,setReviewIndex]=useState<number|null>(null),timer=useRef<number|null>(null),timeRemaining=useRef(0),startedAt=useRef(0);
 const k=session.confirmedCount,total=session.solution.length,move=session.solution[k],info=move?moveInfo(move):null;
 const isDemo=session.status==='DEMONSTRATING';
 const progress=Math.round(total===0?100:k/total*100);
 useEffect(()=>{onSession(session);if(session.status!=='DEMONSTRATING')saveSession(session);},[session,onSession]);
 useEffect(()=>{if(session.status==='READY')dispatch({type:'START'});},[session.status]);
 useEffect(()=>{if(initial.uncertain&&initial.confirmedCount<initial.solution.length)setDialog('resume');},[]);
 const finishDemo=()=>{if(timer.current!==null)window.clearTimeout(timer.current);timer.current=null;dispatch({type:'DEMO_FINISH'});setPaused(false);};
 useEffect(()=>{
  if(!isDemo){if(timer.current!==null)window.clearTimeout(timer.current);timer.current=null;return;}
  if(paused){if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null;timeRemaining.current=Math.max(0,timeRemaining.current-(performance.now()-startedAt.current));}return;}
  if(timeRemaining.current<=0)timeRemaining.current=(move?.endsWith('2')?1800:1200)/speed+350;
  startedAt.current=performance.now();timer.current=window.setTimeout(finishDemo,timeRemaining.current);
  return ()=>{if(timer.current!==null){window.clearTimeout(timer.current);timer.current=null;timeRemaining.current=Math.max(0,timeRemaining.current-(performance.now()-startedAt.current));}};
 },[isDemo,paused,speed,move]); // Timer is UI-only. Reducer never commits on DEMO_FINISH.
 useEffect(()=>{timeRemaining.current=0;setReviewIndex(null);},[k]);
 useEffect(()=>{const handler=()=>{if(document.hidden){setPaused(true);setAutoPlaying(false);}};document.addEventListener('visibilitychange',handler);return ()=>document.removeEventListener('visibilitychange',handler);},[]);
 const confirm=()=>{if(reviewIndex!==null)return;if(navigator.vibrate)navigator.vibrate(25);dispatch({type:'CONFIRM_MOVE',index:k});};
 const showDemo=()=>{if(session.status!=='WAIT_CONFIRM'||reviewIndex!==null)return;timeRemaining.current=0;setPaused(false);dispatch({type:'START_DEMO'});};
 const report=()=>{if(isDemo)finishDemo();dispatch({type:'REPORT_WRONG'});setDialog('recovery');};
 const undo=()=>{if(k===0)return;dispatch({type:'UNDO_REQUEST'});setDialog('undo');};
 const resetViewer=()=>{if(isDemo)finishDemo();setReviewIndex(null);};
 const needsResume=dialog==='resume';
 if(session.status==='COMPLETED'&&mode==='manual')return <div className="guide-screen">
   <div className="section-header"><button className="circle-btn" onClick={onExit}><ArrowLeft size={18}/></button><div className="eyebrow">HOÀN THÀNH THEO XÁC NHẬN</div></div>
   <div className="finish-icon"><CheckCircle2 size={58}/></div><h1 className="center-text">Tuyệt vời!</h1><p className="center-text muted">Bạn đã xác nhận thực hiện đầy đủ {total} bước. Mô hình 3D đã được giải xong.</p>
   <TwistyCube solution={session.solution} confirmedCount={total} mode="manual" demo={false} speed={speed}/>
   <div className="alert info"><HelpCircle size={18}/>Đây là hoàn thành theo xác nhận của bạn; chưa có camera xác minh Rubik thật.</div>
   <button className="btn btn-primary btn-wide" onClick={onRestart}>Giải một khối Rubik khác</button>
   <button className="btn btn-ghost btn-wide" onClick={()=>onModeChange('auto')}>Xem lại toàn bộ mô phỏng</button>
 </div>;
 return <div className="guide-screen">
  <div className="guide-top"><button className="circle-btn" onClick={onExit} aria-label="Quay lại"><ArrowLeft size={20}/></button><div className="guide-title"><div className="eyebrow">RUBIK 3×3 · {mode==='auto'?'MÔ PHỎNG':'TỰ GIẢI'}</div><strong>{mode==='auto'?'Xem Rubik tự giải':`Bước ${Math.min(k+1,total)} / ${total}`}</strong></div><button className="circle-btn" onClick={()=>setDialog('recovery')} aria-label="Trợ giúp"><HelpCircle size={20}/></button></div>
  <div className="progress-summary"><span><b>{k}</b> / {total} bước đã xác nhận</span><span>{progress}%</span></div><div className="progress"><div style={{width:`${progress}%`}}/></div>
  <TwistyCube solution={session.solution} confirmedCount={reviewIndex??k} mode={mode} demo={mode==='auto'?autoPlaying:isDemo} paused={mode==='auto'?!autoPlaying:paused} speed={speed}/>
  <div className="guide-reference"><span><i style={{background:FACE_COLORS.U.hex}}/> Trên: <b>Trắng</b></span><span><i style={{background:FACE_COLORS.F.hex}}/> Trước: <b>Xanh lá</b></span><span><i style={{background:FACE_COLORS.R.hex}}/> Phải: <b>Đỏ</b></span></div>
  {mode==='auto'?<div className="guide-auto">
    <div className="eyebrow">CHẾ ĐỘ TỰ ĐỘNG</div><h2>Quan sát từng thao tác 3D</h2>
    <p className="muted">Hoạt ảnh không xác nhận bạn đã xoay Rubik thật. Tiến độ thủ công luôn được giữ nguyên.</p>
    <div className="control-bar"><button className="control-main" onClick={()=>setAutoPlaying(s=>!s)}>{autoPlaying?<Pause size={19}/>:<Play size={19}/>} {autoPlaying?'Dừng':'Phát mô phỏng'}</button><button className="btn btn-outline" onClick={()=>{setAutoPlaying(false);onModeChange('manual');}}>Tự giải từng bước</button></div>
  </div>:<>
    <div className="step-card"><div className="step-heading"><span>THAO TÁC HIỆN TẠI</span><span className={`status-pill ${isDemo?'playing':''}`}>{isDemo?'Đang xem mẫu':'Chờ bạn xác nhận'}</span></div>
      <div className="move-panel"><div className="move-symbol">{move}</div><div><h2>{info?.faceName} <span>{info?.degrees}°</span></h2><p>{info?.description}</p></div></div>
      <div className="direction-note"><Eye size={16}/> Chiều kim đồng hồ được tính khi nhìn trực diện chính mặt đang xoay, không theo góc camera 3D.</div>
    </div>
    <div className="step-controls"><button className="btn btn-outline" onClick={showDemo} disabled={isDemo||session.status!=='WAIT_CONFIRM'||reviewIndex!==null}><Play size={16}/> Xem mẫu</button>
      <button className="btn btn-outline" onClick={()=>{if(isDemo)setPaused(s=>!s);else showDemo();}} disabled={reviewIndex!==null||(!isDemo&&session.status!=='WAIT_CONFIRM')}>{isDemo&& !paused?<Pause size={16}/>:<RotateCcw size={16}/>} {isDemo?(paused?'Tiếp tục':'Tạm dừng'):'Xem lại'}</button>
      <select value={speed} onChange={e=>setSpeed(Number(e.target.value))} aria-label="Tốc độ hoạt ảnh"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={1.5}>1.5×</option></select>
    </div>
    <div className="sub-actions"><button className="text-button" disabled={k===0||isDemo} onClick={()=>setReviewIndex(k-1)}><SkipBack size={16}/> Xem bước trước</button><button className="text-button" disabled={k===0||isDemo} onClick={undo}><Undo2 size={16}/> Hoàn tác thật</button></div>
    {reviewIndex!==null&&<div className="alert info"><Eye size={17}/><div> Bước đã làm: <b>{session.solution[reviewIndex]}</b>. 3D đang hiển thị trạng thái trước bước đó, chỉ để tham khảo. Không lùi tiến độ thật. <button className="link-button" onClick={()=>setReviewIndex(null)}>Đóng</button></div></div>}
    <div className="sticky-confirm"><button className="btn btn-primary btn-wide" onClick={confirm} disabled={session.status!=='WAIT_CONFIRM'||session.uncertain||reviewIndex!==null}><Check size={20}/> Tôi đã xoay xong <ChevronRight size={18}/></button><button className="btn btn-ghost btn-wide" onClick={report} disabled={session.status==='RECOVERY'}><ShieldAlert size={16}/> Tôi xoay sai / Không chắc chắn</button><div className="sticky-caption">Chỉ bấm sau khi bạn đã xoay Rubik thật đúng thao tác.</div></div>
  </>}
  {dialog!=='none'&&<div className="modal-overlay" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-label="Trợ giúp"><div className="modal-heading"><h3>{dialog==='undo'?'Hoàn tác thao tác thật':needsResume?'Khôi phục phiên giải':dialog==='reset'?'Bắt đầu lại?':'Bạn cần trợ giúp?'}</h3><button className="circle-btn" onClick={()=>setDialog('none')} aria-label="Đóng"><X size={18}/></button></div>
    {dialog==='undo'?<><p>Hãy thực hiện <b>{inverseMove(session.solution[k-1])}</b> trên Rubik thật để đảo ngược bước <b>{session.solution[k-1]}</b> vừa xác nhận. Chỉ khi hoàn tất mới xác nhận bên dưới.</p><button className="btn btn-primary btn-wide" onClick={()=>{dispatch({type:'UNDO_CONFIRMED'});setDialog('none');}}>Tôi đã xoay ngược xong</button><button className="btn btn-outline btn-wide" onClick={()=>{dispatch({type:'UNDO_CANCEL'});setDialog('none');}}>Hủy (tôi chưa xoay gì)</button></>
    :needsResume?<><p>Ứng dụng lưu rằng bạn đã xác nhận <b>{k}/{total}</b> bước. Rubik thật vẫn giữ nguyên trạng thái đó chứ?</p><button className="btn btn-primary btn-wide" onClick={()=>{dispatch({type:'RESTORE_RECONFIRMED'});setDialog('none');}}>Đúng, tiếp tục giải</button><button className="btn btn-outline btn-wide" onClick={()=>{setDialog('none');onRestart();}}>Không, bắt đầu phiên mới</button></>
    :<><p>Ứng dụng không thể tự biết Rubik thật có bị xoay sai. Hãy chọn tình huống đúng:</p>
       <div className="modal-actions"><button className="btn btn-outline btn-wide" onClick={()=>{dispatch({type:'FALSE_CONFIRM_CORRECTION'});setDialog('none');}}>Tôi xác nhận nhầm, chưa xoay bước vừa ghi nhận</button>
       <button className="btn btn-outline btn-wide" onClick={()=>{dispatch({type:'RECOVERY_RESOLVED'});setDialog('none');resetViewer();}}>Tôi đã tự đảo ngược thao tác sai và kiểm tra trạng thái</button>
       <button className="btn btn-danger btn-wide" onClick={onRestart}>Không chắc · Nhập / quét lại</button></div>
       <div className="hint-line">Nếu không chắc mặt nào đã xoay sai, nên quét hoặc nhập lại trạng thái thực tế, không tiếp tục dựa trên trạng thái cũ.</div>
      </>}
   </section></div>}
 </div>;
}
