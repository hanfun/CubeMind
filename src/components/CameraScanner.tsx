import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import {ArrowLeft,Camera,Check,ChevronRight,ImagePlus,Move,RotateCcw,ShieldAlert,ShieldCheck} from 'lucide-react';
import {FACES,FACE_NAMES,FACE_COLORS,type Face} from '../lib/cube';
import {calibrateFaces,HEX_COLOR,lab,type RGB} from '../lib/color';
import {captureSquare,isUsableQuad,sampleFace,stickerPoints,type Quad} from '../lib/twoAngle';
import {photographQuality,readUploadedImage,type LoadedPhoto} from '../lib/imageInput';

type Scan={pixels:RGB[];warnings:string[]};
type Props={onDone:(facelets:string,warnings:string[])=>void;onBack:()=>void};
const INSTRUCTIONS:Record<Face,string>={
 U:'Mặt trên: giữ mặt trước (F) hướng xuống dưới khung hình.',
 R:'Mặt phải: giữ mặt trên (U) phía trên, mặt trước (F) về bên trái.',
 F:'Mặt trước: giữ mặt trên (U) phía trên, mặt phải (R) bên phải.',
 D:'Mặt dưới: giữ mặt trước (F) phía trên khung hình.',
 L:'Mặt trái: giữ mặt trên (U) phía trên, mặt trước (F) về bên phải.',
 B:'Mặt sau: giữ mặt trên (U) phía trên, mặt phải (R) về bên trái.'
};
const DEFAULT_QUAD:Quad=[{x:.12,y:.12},{x:.88,y:.12},{x:.88,y:.88},{x:.12,y:.88}];
const CLAMP=(x:number)=>Math.min(.999,Math.max(.001,x));
function centerWarning(face:Face,color:RGB):string|null {
  const actual=lab(color);
  const ranked=(Object.keys(HEX_COLOR) as Face[]).map(f=>{
    const hex=HEX_COLOR[f];
    const rgb=([1,3,5] as const).map(i=>parseInt(hex.slice(i,i+2),16)) as RGB;
    const target=lab(rgb);
    return {f,d:Math.hypot(...actual.map((v,i)=>v-target[i]))};
  }).sort((a,b)=>a.d-b.d);
  if(ranked[0].f!==face&&ranked.find(x=>x.f===face)!.d-ranked[0].d>22)
    return `Tâm mặt ${face} có vẻ giống màu ${FACE_COLORS[ranked[0].f].name} hơn ${FACE_COLORS[face].name}. Kiểm tra bạn đã chọn đúng mặt và hướng.`;
  return null;
}
export default function CameraScanner({onDone,onBack}:Props){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),fileInput=useRef<HTMLInputElement>(null),svg=useRef<SVGSVGElement>(null);
 const drag=useRef<number|null>(null);
 const [scans,setScans]=useState<Partial<Record<Face,Scan>>>({}),[step,setStep]=useState(0),[error,setError]=useState(''),[ready,setReady]=useState(false);
 const [source,setSource]=useState<'camera'|'upload'>('camera'),[cameraIssue,setCameraIssue]=useState(''),[loading,setLoading]=useState(false);
 const [photo,setPhoto]=useState<LoadedPhoto|null>(null),[quad,setQuad]=useState<Quad>(DEFAULT_QUAD);
 const current=FACES[step];
 useEffect(()=>{
   if(source!=='camera'){setReady(false);return;}
   let active=true;setReady(false);
   if(!navigator.mediaDevices?.getUserMedia){setCameraIssue('Camera không khả dụng hoặc cần HTTPS. Bạn có thể tải ảnh từ thư viện.');setSource('upload');return;}
   navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280}},audio:false})
     .then(media=>{
       if(!active){media.getTracks().forEach(t=>t.stop());return;}
       stream.current=media;
       if(video.current){video.current.srcObject=media;void video.current.play().then(()=>{if(active){setReady(true);setCameraIssue('');}}).catch(()=>{if(active){setCameraIssue('Không phát được camera; vui lòng dùng ảnh đã chụp.');setSource('upload');}});}
     }).catch(e=>{if(active){setCameraIssue(`Không mở được camera: ${e instanceof Error?e.message:'Thiếu quyền truy cập'}. Có thể thay bằng tải ảnh.`);setSource('upload');}});
   return()=>{active=false;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};
 },[source]);
 const choosePhoto=(p:LoadedPhoto)=>{setPhoto(p);setQuad(DEFAULT_QUAD.map(v=>({...v})) as Quad);setError('');};
 const capture=()=>{
   if(!video.current||!ready)return;
   try{const shot=captureSquare(video.current);choosePhoto({...shot,quality:photographQuality(shot.pixels)});}
   catch(e){setError(e instanceof Error?e.message:'Không đọc được ảnh camera.');}
 };
 const upload=async(file?:File)=>{
   if(!file)return;
   setLoading(true);setError('');
   try{choosePhoto(await readUploadedImage(file,360));}
   catch(e){setError(e instanceof Error?e.message:'Không đọc được ảnh.');}
   finally{setLoading(false);if(fileInput.current)fileInput.current.value='';}
 };
 const preview=useMemo(()=>photo&&isUsableQuad(quad)?sampleFace(photo.pixels,quad):null,[photo,quad]);
 const centerIssue=preview?centerWarning(current,preview.pixels[4]):null;
 const noisy=preview?.noise.filter(n=>n>18).length||0;
 const accept=()=>{
   if(!preview||!photo){setError('Cần ảnh hợp lệ và khung đúng 4 góc của mặt Rubik.');return;}
   const warnings=[...photo.quality.warnings];
   if(centerIssue)warnings.push(centerIssue);
   if(noisy>0)warnings.push(`${noisy} ô của mặt ${current} có màu không đồng đều; cần đối chiếu lại.`);
   const next={...scans,[current]:{pixels:preview.pixels,warnings}};
   setScans(next);setError('');setPhoto(null);
   if(step<5){setStep(s=>s+1);return;}
   const all=Object.fromEntries(FACES.map(f=>[f,next[f]!.pixels])) as Record<Face,RGB[]>;
   const warningsAll=FACES.flatMap(f=>next[f]!.warnings.map(w=>`Mặt ${f}: ${w}`));
   onDone(calibrateFaces(all),warningsAll);
 };
 const previous=()=>{if(step===0)return;setStep(s=>s-1);setPhoto(null);setError('');};
 const movePointer=(e:PointerEvent<SVGCircleElement>)=>{
   if(drag.current===null||!svg.current)return;
   const rect=svg.current.getBoundingClientRect(),index=drag.current;
   setQuad(prev=>prev.map((p,i)=>i===index?{x:CLAMP((e.clientX-rect.left)/rect.width),y:CLAMP((e.clientY-rect.top)/rect.height)}:p) as Quad);
 };
 return <div className="scan-page six-face-page">
   <div className="section-header"><button type="button" className="circle-btn" onClick={onBack} aria-label="Quay lại"><ArrowLeft size={18}/></button><div><div className="eyebrow">QUÉT 6 MẶT · BETA</div><h2>Mặt {step+1} / 6</h2></div></div>
   <div className="image-source-switch" role="group" aria-label="Chọn nguồn ảnh">
     <button type="button" className={`source-choice ${source==='camera'?'active':''}`} onClick={()=>setSource('camera')}><Camera size={17}/> Dùng camera</button>
     <button type="button" className={`source-choice ${source==='upload'?'active':''}`} onClick={()=>setSource('upload')}><ImagePlus size={17}/> Tải ảnh lên</button>
   </div>
   {cameraIssue&&<div className="alert" role="status"><ShieldAlert size={18}/><span>{cameraIssue}</span></div>}
   <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" aria-label={`Chọn ảnh mặt ${current}`} onChange={e=>{void upload(e.target.files?.[0]);}}/>
   <div className="scan-progress">{FACES.map((f,i)=><div key={f} className={`scan-dot ${i<step?'done':i===step?'current':''}`}>{i<step?<Check size={13}/>:f}</div>)}</div>
   <div className="scan-instruction"><strong>{FACE_NAMES[current]} ({current}) — tâm {FACE_COLORS[current].name}</strong><p>{INSTRUCTIONS[current]}</p><small>Đảm bảo đúng hệ trục U/R/F/D/L/B trên toàn bộ 6 ảnh, không xoay từng tầng giữa các lần.</small></div>
   <div className="camera-frame angle-frame">
     {source==='camera'&&<video ref={video} autoPlay playsInline muted className={photo?'camera-hidden':''}/>}
     {source==='upload'&&!photo&&<div className="upload-placeholder"><ImagePlus size={43}/><b>Chọn ảnh mặt {FACE_NAMES[current]}</b><span>Ảnh thẳng mặt 3×3, đủ 9 sticker, không bị che khuất.</span></div>}
     {photo&&<img className="frozen-photo" src={photo.dataUrl} alt={`Ảnh mặt ${current} đã chọn`}/>}
     <svg ref={svg} className="angle-svg" style={{display:source==='upload'&&!photo?'none':undefined}} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Khung chỉnh bốn góc mặt Rubik">
       <polygon points={quad.map(p=>`${p.x*1000},${p.y*1000}`).join(' ')} className="angle-polygon"/>
       {stickerPoints(quad).map((p,i)=><circle key={i} cx={p.x*1000} cy={p.y*1000} r="10" fill={preview?`rgb(${preview.pixels[i].join(',')})`:'#ffffff'} stroke="#183144" strokeWidth="3" pointerEvents="none"/>)}
       {photo&&quad.map((p,i)=><circle key={i} cx={p.x*1000} cy={p.y*1000} r="19" fill="#fff" stroke="#0d927e" strokeWidth="7" className="angle-handle" onPointerDown={e=>{drag.current=i;e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={movePointer} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>)}
     </svg>
     {source==='camera'&&!ready&&!photo&&<div className="camera-wait">Đang mở camera…</div>}
   </div>
   {photo&&<>
     <div className="photo-quality" role="status"><b>{photo.filename?`Ảnh: ${photo.filename}`:'Ảnh camera'} · {photo.quality.width}×{photo.quality.height}px</b>
       {photo.quality.warnings.length?photo.quality.warnings.map((w,i)=><p key={i}>⚠ {w}</p>):<p className="photo-quality-ok">✓ Chất lượng ảnh cơ bản đạt. Cần tiếp tục kiểm tra màu Rubik.</p>}
       {centerIssue&&<p>⚠ {centerIssue}</p>}{noisy>0&&<p>⚠ {noisy} ô có màu chưa đều.</p>}
     </div>
     <div className="scan-instruction scan-adjust"><strong><Move size={16}/> Căn khung 3×3</strong><p>Kéo 4 điểm trắng đến góc ngoài của mặt. Kiểm tra 9 dấu chấm nằm tại tâm các ô màu. Hãy chọn ảnh khác nếu không thể căn.</p></div>
     <div className="angle-samples one-face-samples"><div><strong>{current}</strong><div className="angle-nine">{preview?.pixels.map((rgb,i)=><span key={i} title={`${current}${i+1}`} style={{background:`rgb(${rgb.join(',')})`}}/>)}</div></div></div>
     <div className="angle-actions"><button className="btn btn-outline" onClick={()=>{setPhoto(null);setError('');}}><RotateCcw size={16}/>{source==='camera'?'Chụp lại':'Chọn ảnh khác'}</button><button className="btn btn-outline" onClick={()=>setQuad(DEFAULT_QUAD.map(p=>({...p})) as Quad)}>Đặt lại khung</button></div>
     <button type="button" className="btn btn-primary btn-wide" onClick={accept} disabled={!preview}>{step===5?'Ghép 54 ô và kiểm tra':`Xác nhận mặt ${current}`}<ChevronRight size={18}/></button>
   </>}
   {!photo&&<>
     <div className="scan-steps-info"><Camera size={18}/><span>{source==='camera'?'Giữ mặt Rubik vuông góc camera, phủ gần khung 3×3.':'Tải ảnh có đủ mặt 3×3 và giữ đúng hướng được hướng dẫn. Có thể sửa khung sau khi tải lên.'}</span></div>
     {source==='camera'?<button type="button" className="btn btn-primary btn-wide" disabled={!ready} onClick={capture}><Camera size={19}/> Chụp mặt {FACE_NAMES[current]}<ChevronRight size={18}/></button>
      :<button type="button" className="btn btn-primary btn-wide" disabled={loading} onClick={()=>fileInput.current?.click()}><ImagePlus size={19}/>{loading?'Đang đọc & kiểm tra ảnh…':`Tải ảnh mặt ${FACE_NAMES[current]}`}<ChevronRight size={18}/></button>}
   </>}
   {error&&<div role="alert" className="alert error"><ShieldAlert size={18}/>{error}</div>}
   <div className="between"><button className="text-button" disabled={step===0} onClick={previous}><RotateCcw size={15}/> Quay lại mặt trước</button><span className="muted tiny">Đã ghi nhận {Object.keys(scans).length}/6</span></div>
   <div className="scan-steps-info"><ShieldCheck size={18}/><span>Kiểm tra định dạng/độ phân giải/độ sáng, cho chỉnh khung và lấy 9 màu/mặt; sau 6 mặt cần xác minh trạng thái và solver.</span></div>
   <p className="warning-copy">Quét 6 mặt là beta. Chất lượng ảnh không bảo đảm Rubik đã được nhận diện đúng; người dùng cần kiểm tra và chỉnh 54 ô trước khi giải.</p>
 </div>;
}
