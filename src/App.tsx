import {useCallback,useEffect,useState} from 'react';
import {ArrowRight,Box,Camera,Check,ChevronRight,CircleHelp,ClipboardList,Clock3,Code2,FastForward,FileText,Hand,Gamepad2,BookOpen,Layers3,LockKeyhole,Play,Rotate3d,ScanLine,ShieldCheck,SlidersHorizontal,Sparkles,TriangleAlert,Zap} from 'lucide-react';
import {basicFaceletValidation,SOLVED} from './lib/cube';
import {clearSession,loadSession,saveSession,type SolveSession} from './lib/guide';
import {solveInWorker,type SolverRequest} from './lib/solver';
import {FaceletEditor} from './components/FaceletEditor';
import CameraScanner from './components/CameraScanner';
import TwoAngleScanner from './components/TwoAngleScanner';
import Guide from './components/Guide';
import LearnPage from './components/LearnPage';
import PlayPage from './components/PlayPage';
import {LanguageSwitch,useI18n} from './i18n';

type Stage='play'|'learn'|'home'|'source'|'scan'|'scan-two'|'analyzing'|'ready'|'guide';
type InputMethod='scramble'|'facelets'|'scan';
type SolveMode='manual'|'auto';
const DEFAULT_SCRAMBLE="R U R' U' F2 D L2 B R U2 F' D2";
export default function App(){
 const {language}=useI18n();
 const [stage,setStage]=useState<Stage>('home'),[method,setMethod]=useState<InputMethod>('scramble');
 const [scramble,setScramble]=useState(DEFAULT_SCRAMBLE),[facelets,setFacelets]=useState(SOLVED);
 const [session,setSession]=useState<SolveSession|null>(null),[selectedMode,setSelectedMode]=useState<SolveMode>('manual');
 const [error,setError]=useState(''),[progress,setProgress]=useState(''),[savedSession,setSavedSession]=useState<SolveSession|null>(null);
 const [showTech,setShowTech]=useState(false);
 const [scanWarnings,setScanWarnings]=useState<string[]>([]);
 useEffect(()=>{setSavedSession(loadSession());},[]);
 const startSolve=async(req:SolverRequest)=>{
  setError('');setProgress('Đang chuẩn bị dữ liệu…');setStage('analyzing');
  try{const s=await solveInWorker(req,setProgress);setSession(s);setSavedSession(s);saveSession(s);setStage('ready');}
  catch(e){setError(e instanceof Error?e.message:'Không thể giải Rubik.');setStage('source');}
 };
 const beginFromData=()=>{
  if(method==='scramble'){void startSolve({kind:'scramble',scramble});return;}
  if(method==='facelets'){
   const errors=basicFaceletValidation(facelets);
   if(errors.length){setError(errors.join('\n'));return;}
   void startSolve({kind:'facelets',facelets});
  }
 };
 const restore=()=>{if(savedSession){setSession(savedSession);setSelectedMode('manual');setStage('guide');}};
 const newProject=()=>{clearSession();setSession(null);setSavedSession(null);setStage('source');setError('');};
 const onSession=useCallback((s:SolveSession)=>setSession(s),[]);
 const goBack=()=>{if(stage==='home')return;if(stage==='learn'||stage==='play'){setStage('home');return;}if(stage==='guide'){setStage('ready');return;}if(stage==='scan'||stage==='scan-two'){setStage('source');return;}setStage('home');};
 return <div className="app-shell">
   <div className="ambient ambient-one"/><div className="ambient ambient-two"/>
   <header className="topbar"><button className="brand" onClick={()=>setStage('home')} aria-label="Trang chủ CubeMind"><span className="brand-icon"><Box size={21}/></span><span>Cube<span className="brand-accent">Mind</span></span></button>
     <div className="topbar-right"><LanguageSwitch/><button type="button" className="top-learn-link" onClick={()=>setStage('play')}><Gamepad2 size={17}/> Chơi 3D</button><button type="button" className="top-learn-link" onClick={()=>setStage('learn')}><BookOpen size={17}/> Học giải Rubik</button><span className="header-tag">3×3 SOLVER</span><button className="icon-header" onClick={()=>setShowTech(v=>!v)} title="Về công nghệ"><CircleHelp size={20}/></button></div></header>
   {showTech&&<div className="tech-panel"><div><b>CubeMind · MVP 0.4</b><p>Ứng dụng chạy trên thiết bị: cubejs solver trong Worker, cubing.js 3D, điều khiển tiến độ riêng. Camera hoặc tải ảnh: 6 mặt và 2 góc đều có khung chỉnh thủ công, kiểm tra chất lượng cơ bản và xác minh Rubik. Quét 2 góc vẫn là beta, chưa tự tìm hình khối tự do.</p></div><button className="text-button" onClick={()=>setShowTech(false)}>Đóng</button></div>}
   <main className="main">
   {stage==='home'&&<>
     <div className="hero"><div className="hero-copy"><span className="micro-badge"><Sparkles size={14}/> RUBIK GIẢI ĐƠN GIẢN HƠN</span><h1>Giải Rubik.<br/><span>Từng chuyển động.</span></h1><p>Tính lời giải chính xác, xem hoạt ảnh 3D và tự xoay Rubik thật theo từng bước — ngay trên điện thoại của bạn.</p>
       <div className="hero-actions"><button className="btn btn-primary" onClick={()=>setStage('source')}>Bắt đầu giải <ArrowRight size={19}/></button><button className="btn btn-outline" onClick={()=>setStage('play')}>Chơi Rubik 3D <Gamepad2 size={16}/></button><button className="btn btn-outline" onClick={()=>setStage('learn')}>Học giải Rubik <BookOpen size={16}/></button><button className="btn btn-ghost" onClick={()=>{setMethod('scramble');setStage('source');}}>Thử khối mẫu <Play size={16}/></button></div>
       <div className="trust-row"><span><Check size={15}/> Không cần tài khoản</span><span><ShieldCheck size={15}/> Xử lý ngay trên máy</span></div>
     </div><div className="hero-visual" aria-hidden="true"><div className="halo-ring ring-1"/><div className="halo-ring ring-2"/><div className="cube-hero"><div className="cube-face hero-front">{Array.from({length:9},(_,i)=><span key={i} style={{background:['#30c99a','#30c99a','#3f8af1','#ffcb40','#30c99a','#ec536b','#30c99a','#ec536b','#30c99a'][i]}}/>)}</div><div className="cube-face hero-top">{Array.from({length:9},(_,i)=><span key={i} style={{background:['#fff','#ffcb40','#fff','#fff','#fff','#ffcb40','#ec536b','#fff','#fff'][i]}}/>)}</div><div className="cube-face hero-right">{Array.from({length:9},(_,i)=><span key={i} style={{background:['#ff914c','#4289ef','#4289ef','#ec536b','#ec536b','#ffcb40','#4289ef','#ff914c','#ec536b'][i]}}/>)}</div></div><div className="floating-label float-one"><span>↻</span> 3D Animation</div><div className="floating-label float-two"><Zap size={16}/> Step-by-step</div></div></div>
     {savedSession&&<button className="resume-banner" onClick={restore}><div className="resume-logo"><Clock3 size={22}/></div><span><b>Tiếp tục phiên trước</b><small>{savedSession.confirmedCount}/{savedSession.solution.length} bước đã xác nhận · Cần xác nhận trạng thái Rubik thật</small></span><ChevronRight size={19}/></button>}
     <div className="features-title"><span>QUY TRÌNH 3 BƯỚC</span><h2>Từ khối Rubik rối đến hoàn chỉnh</h2></div>
     <div className="feature-grid"><div className="feature-card"><div className="feature-icon blue"><ScanLine size={23}/></div><span className="feature-number">01 / NHẬP DỮ LIỆU</span><h3>Nhận trạng thái</h3><p>Nhập dãy trộn, chỉnh 54 ô màu hoặc quét 2 góc (mỗi góc 3 mặt) hoặc quét 6 mặt qua camera / tải ảnh (beta).</p></div><div className="feature-card"><div className="feature-icon yellow"><ShieldCheck size={23}/></div><span className="feature-number">02 / PHÂN TÍCH</span><h3>Tính lời giải</h3><p>Kiểm tra góc, cạnh, parity và mô phỏng xác minh toàn bộ chuỗi giải.</p></div><div className="feature-card"><div className="feature-icon green"><Rotate3d size={23}/></div><span className="feature-number">03 / TỪNG BƯỚC 3D</span><h3>Tự tay giải</h3><p>Xem minh họa xoay chậm; chỉ chuyển bước khi bạn chủ động xác nhận.</p></div></div>
     <div className="bottom-tip"><LockKeyhole size={18}/><span>Không cần backend. Dữ liệu phiên được lưu cục bộ trong trình duyệt của bạn.</span></div>
   </>}
   {stage==='play'&&<PlayPage onBack={()=>setStage('home')}/>}
   {stage==='learn'&&<LearnPage onBack={()=>setStage('home')} onStartSolve={()=>setStage('source')}/>}
   {stage==='source'&&<div className="workspace"><button className="nav-back" onClick={goBack}>← Quay lại</button><span className="micro-badge">BƯỚC 01 · TRẠNG THÁI RUBIK</span><h1 className="page-title">Chuẩn bị khối Rubik</h1><p className="page-description">Chọn cách cung cấp trạng thái để hệ thống phân tích và tìm lời giải thật.</p>
    <div className="method-grid"><button type="button" className={`method-card ${method==='scramble'?'active':''}`} onClick={()=>{setMethod('scramble');setError('');}}><Code2 size={24}/><b>Chuỗi trộn</b><small>Thử ngay với ký hiệu U R F…</small></button>
    <button type="button" className={`method-card ${method==='facelets'?'active':''}`} onClick={()=>{setMethod('facelets');setError('');}}><Layers3 size={24}/><b>54 ô màu</b><small>Nhập màu từng mặt</small></button>
    <button type="button" className={`method-card ${method==='scan'?'active':''}`} onClick={()=>{setMethod('scan');setError('');}}><Camera size={24}/><b>Quét / tải ảnh</b><small>2 ảnh nhanh / 6 ảnh</small></button></div>
    {method==='scramble'&&<div className="entry-card"><div className="field-label">CHUỖI TRỘN RUBIK</div><textarea className="code-entry" rows={3} spellCheck={false} value={scramble} onChange={e=>setScramble(e.target.value)} placeholder="Ví dụ: R U R' U' F2"/><div className="input-hint"><FileText size={16}/> Hãy áp dụng đúng chuỗi trộn này lên Rubik đang hoàn chỉnh để hai khối khớp nhau.</div><button className="text-button" onClick={()=>setScramble(DEFAULT_SCRAMBLE)}>Khôi phục dãy mẫu</button></div>}
    {method==='facelets'&&<div className="entry-card"><div className="field-label">BẢNG 54 Ô MÀU</div><p className="muted small">Giữ mặt trắng (U) ở trên, xanh lá (F) ở trước, đỏ (R) bên phải. Xoay toàn khối để nhập theo đúng hệ trục, không quay ngẫu nhiên từng mặt.</p><FaceletEditor value={facelets} onChange={setFacelets}/></div>}
    {method==='scan'&&<div className="entry-card scan-options"><div className="field-label">CHỌN CÁCH QUÉT · CAMERA HOẶC TẢI ẢNH</div><div className="scan-option"><div className="feature-icon blue"><Camera size={22}/></div><div><b>Quét 6 mặt (beta)</b><p>Chụp hoặc tải 6 ảnh (mỗi mặt 1 ảnh). Căn khung 9 ô, kiểm tra màu trước khi giải.</p></div><button className="btn btn-outline btn-small" onClick={()=>setStage('scan')}>Bắt đầu</button></div><div className="scan-option"><div className="feature-icon yellow"><Zap size={22}/></div><div><b>Quét nhanh 2 ảnh (beta)</b><p>Chụp hoặc tải 2 ảnh, mỗi ảnh 3 mặt. Kéo chỉnh 4 góc của từng mặt trước khi kiểm tra.</p></div><button className="btn btn-primary btn-small" onClick={()=>setStage('scan-two')}>Bắt đầu</button></div></div>}
    {scanWarnings.length>0&&method==='facelets'&&<div className="alert" role="status"><ShieldCheck size={18}/><span>{scanWarnings.join(' ')}</span></div>}
    {error&&<div role="alert" className="alert error"><TriangleAlert size={18}/><span style={{whiteSpace:'pre-line'}}>{error}</span></div>}
    {method!=='scan'&&<button className="btn btn-primary btn-wide entry-submit" onClick={beginFromData}>Kiểm tra & tìm lời giải <ArrowRight size={19}/></button>}
    <p className="fine-print">Hệ thống chỉ cho phép giải khi 54 ô màu hợp lệ, viên góc/cạnh hợp lệ và lời giải đã được xác minh.</p>
   </div>}
   {stage==='scan'&&<CameraScanner onBack={()=>setStage('source')} onDone={(f,warnings)=>{setFacelets(f);setMethod('facelets');setScanWarnings(['Vui lòng kiểm tra 54 ô màu, thứ tự 6 mặt và hướng trước khi giải.',...warnings]);setStage('source');setError(basicFaceletValidation(f).join('\n'));}}/>}
   {stage==='scan-two'&&<TwoAngleScanner onBack={()=>setStage('source')} onDone={(f,warnings)=>{
     setFacelets(f);setMethod('facelets');setScanWarnings(warnings);
     const errors=basicFaceletValidation(f);
     setError(errors.join('\n'));
     setScanWarnings(['Quét hai góc: hãy đối chiếu 54 ô màu và hướng với khối thật trước khi bấm giải.',...warnings]);
     setStage('source');
   }}/>}
   
   {stage==='analyzing'&&<div className="analyzing"><div className="loading-cube"><Box size={54}/></div><span className="eyebrow">BƯỚC 02 · KIỂM TRA</span><h1>Đang phân tích Rubik…</h1><p className="muted">{progress}</p><div className="loading-line"><span/></div><small>Đang tính trên thiết bị. Lần đầu có thể lâu hơn do tạo bảng solver.</small></div>}
   {stage==='ready'&&session&&<div className="ready-screen"><button className="nav-back" onClick={goBack}>← Trang chủ</button><div className="success-icon"><ShieldCheck size={32}/></div><div className="eyebrow green-text">KIỂM TRA THÀNH CÔNG</div><h1 className="page-title">Sẵn sàng giải Rubik!</h1><p className="page-description">Dữ liệu hợp lệ và toàn bộ chuỗi thao tác đã được mô phỏng để xác minh.</p>
     <div className="result-stats"><div><strong>{session.solution.length}</strong><span>Bước giải</span></div><div><strong>54/54</strong><span>Ô màu</span></div><div><strong><Check size={26}/></strong><span>Hợp lệ</span></div></div>
     <div className="solution-preview"><span className="eyebrow">CHUỖI LỜI GIẢI</span><div>{session.solution.length?session.solution.map((m,i)=><span className="move-chip" key={i}>{m}</span>):<span className="muted">Rubik đã hoàn chỉnh, không cần thêm thao tác.</span>}</div></div>
     <h2 className="choose-title">Bạn muốn giải theo cách nào?</h2><div className="solve-options"><button className={`solve-option ${selectedMode==='manual'?'selected':''}`} onClick={()=>setSelectedMode('manual')}><span className="option-icon"><Hand size={23}/></span><span><b>Tự giải từng bước</b><small>Nhìn 3D, xoay khối thật và xác nhận mỗi bước.</small></span><span className="radio-dot"/></button><button className={`solve-option ${selectedMode==='auto'?'selected':''}`} onClick={()=>setSelectedMode('auto')}><span className="option-icon"><FastForward size={24}/></span><span><b>Xem 3D tự động</b><small>Quan sát Rubik 3D xoay chậm theo lời giải.</small></span><span className="radio-dot"/></button></div>
     <button className="btn btn-primary btn-wide entry-submit" onClick={()=>setStage('guide')}>Bắt đầu {selectedMode==='auto'?'mô phỏng 3D':'hướng dẫn giải'} <ArrowRight size={19}/></button>
     <button className="btn btn-ghost btn-wide" onClick={newProject}>Nhập khối Rubik khác</button>
   </div>}
   {stage==='guide'&&session&&<Guide key={session.id} session={session} mode={selectedMode} onModeChange={setSelectedMode} onExit={()=>setStage('ready')} onRestart={newProject} onSession={onSession}/>}
   </main>
   <footer className="footer">
     <div className="footer-meta">
       <div className="footer-copyright">© 2026 CubeMind · React + TypeScript · Play 3D</div>
       <div className="footer-author">
         <span>{language==='vi'?'Sáng tạo & phát triển bởi':'Created & developed by'}</span>
         <strong>Nguyễn Hoàng Phương</strong>
         <span className="footer-author-role">· {language==='vi'?'Kỹ sư phần mềm cấp cao':'Senior Software Engineer'}</span>
       </div>
       <div className="footer-dedication">
         <span>{language==='vi'?'Dành tặng cho':'Dedicated to'}</span>
         <strong>Nguyễn Võ Yến Ngọc</strong>
         <span>{language==='vi'?'và':'and'}</span>
         <strong>Nguyễn Võ Minh Ngọc</strong>
       </div>
     </div>
     <div className="footer-tech">
       <span><SlidersHorizontal size={14}/> Mobile-first</span>
       <span><ClipboardList size={14}/> {language==='vi'?'Theo đặc tả 1.0':'Specification 1.0'}</span>
     </div>
   </footer>
 </div>;
}
