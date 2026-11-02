import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import {ArrowLeft,Camera,Check,ChevronRight,ImagePlus,Move,RotateCcw,ShieldAlert,ShieldCheck} from 'lucide-react';
import {FACE_COLORS,type Face} from '../lib/cube';
import {captureSquare,classifyTwoAngles,initialQuads,isUsableQuad,sampleFace,SCAN_FACES,stickerPoints,type AngleIndex,type FaceScan,type Point,type Quad} from '../lib/twoAngle';
import {photographQuality,readUploadedImage,type LoadedPhoto} from '../lib/imageInput';

type Photo=LoadedPhoto;
type Props={onBack:()=>void;onDone:(facelets:string,warnings:string[])=>void};
const POSITIONS:Record<AngleIndex,Record<string,string>> = {
  0:{U:'TRÊN · trắng',F:'TRÁI · xanh lá',R:'PHẢI · đỏ'},
  1:{D:'TRÊN · vàng',L:'TRÁI · cam',B:'PHẢI · xanh dương'},
};
const LIMIT=(x:number)=>Math.min(0.999,Math.max(0.001,x));

export default function TwoAngleScanner({onBack,onDone}:Props){
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),svg=useRef<SVGSVGElement>(null),fileInput=useRef<HTMLInputElement>(null);
 const drag=useRef<{face:Face;index:number}|null>(null);
 const [step,setStep]=useState<AngleIndex>(0),[photo,setPhoto]=useState<Photo|null>(null);
 const [source,setSource]=useState<'camera'|'upload'>('camera'),[loading,setLoading]=useState(false),[cameraIssue,setCameraIssue]=useState('');
 const [first,setFirst]=useState<Partial<Record<Face,FaceScan>>>({});
 const [firstWarnings,setFirstWarnings]=useState<string[]>([]);
 const [quads,setQuads]=useState<Record<Face,Quad>>(()=>initialQuads(0));
 const [selected,setSelected]=useState<Face>('U'),[ready,setReady]=useState(false),[error,setError]=useState('');
 const faces=SCAN_FACES[step];
 useEffect(()=>{
   if(source!=='camera') {setReady(false);return;}
   let alive=true;
   setReady(false);
   if(!navigator.mediaDevices?.getUserMedia){
     setCameraIssue('Trình duyệt không hỗ trợ camera hoặc trang chưa mở bằng HTTPS. Bạn có thể tải ảnh từ thư viện điện thoại.');
     setSource('upload');return;
   }
   navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:1280}},audio:false})
    .then(media=>{
      if(!alive){media.getTracks().forEach(t=>t.stop());return;}
      stream.current=media;
      if(video.current){video.current.srcObject=media;void video.current.play().then(()=>{if(alive){setReady(true);setCameraIssue('');}}).catch(()=>{if(alive){setCameraIssue('Không phát được camera. Hãy dùng chức năng tải ảnh.');setSource('upload');}});}
    }).catch(e=>{if(alive){setCameraIssue(`Không mở được camera: ${e instanceof Error?e.message:'Không có quyền truy cập.'} Bạn vẫn có thể tải ảnh.`);setSource('upload');}});
   return ()=>{alive=false;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;};
 },[source]);
 const onUpload=async(file?:File)=>{
   if(!file)return;
   setLoading(true);setError('');
   try{
     const loaded=await readUploadedImage(file,480);
     setPhoto(loaded);setQuads(initialQuads(step));setSelected(faces[0]);
   }catch(e){setError(e instanceof Error?e.message:'Không đọc được ảnh tải lên.');}
   finally{setLoading(false);if(fileInput.current)fileInput.current.value='';}
 };
 const onCapture=()=>{
   if(!video.current||!ready)return;
   try{const shot=captureSquare(video.current);setPhoto({...shot,quality:photographQuality(shot.pixels)});setQuads(initialQuads(step));setSelected(faces[0]);setError('');}
   catch(e){setError(e instanceof Error?e.message:'Không lấy được ảnh.');}
 };
 const preview=useMemo(()=>{
   if(!photo)return null;
   const result={} as Partial<Record<Face,FaceScan>>;
   for(const f of faces) if(quads[f]&&isUsableQuad(quads[f])) result[f]=sampleFace(photo.pixels,quads[f]);
   return result;
 },[photo,quads,step]);
 const valid=faces.every(f=>Boolean(quads[f]&&isUsableQuad(quads[f])&&preview?.[f]));
 const accept=()=>{
   if(!photo||!valid||!preview){setError('Vui lòng căn đủ bốn góc của mỗi mặt.');return;}
   try{
     const picked=Object.fromEntries(faces.map(f=>[f,preview[f]])) as Record<Face,FaceScan>;
     if(step===0){setFirst(picked);setFirstWarnings(photo.quality.warnings.map(w=>`Ảnh 1: ${w}`));setStep(1);setPhoto(null);setSelected('D');setQuads(initialQuads(1));setError('');}
     else{
       const samples={...first,...picked} as Record<Face,FaceScan>;
       const result=classifyTwoAngles(samples);
       onDone(result.facelets,[...firstWarnings,...photo.quality.warnings.map(w=>`Ảnh 2: ${w}`),...result.warnings]);
     }
   }catch(e){setError(e instanceof Error?e.message:'Không thể ghép hai ảnh.');}
 };
 const setCorner=(face:Face,i:number,p:Point)=>setQuads(prev=>{
   const updated=[...prev[face]] as Quad;
   updated[i]={x:LIMIT(p.x),y:LIMIT(p.y)};
   return {...prev,[face]:updated};
 });
 const movePointer=(e:PointerEvent<SVGCircleElement>)=>{
   if(!drag.current||!svg.current)return;
   const bounds=svg.current.getBoundingClientRect();
   setCorner(drag.current.face,drag.current.index,{x:(e.clientX-bounds.left)/bounds.width,y:(e.clientY-bounds.top)/bounds.height});
 };
 const reset=()=>{setQuads(initialQuads(step));setError('');};
 return <div className="scan-page two-angle-page">
  <div className="section-header"><button type="button" className="circle-btn" onClick={onBack} aria-label="Quay lại"><ArrowLeft size={18}/></button><div><div className="eyebrow">QUÉT NHANH HAI GÓC · BETA</div><h2>Ảnh {step+1} / 2</h2></div></div>
  <div className="image-source-switch" role="group" aria-label="Chọn nguồn ảnh">
    <button type="button" className={`source-choice ${source==='camera'?'active':''}`} onClick={()=>setSource('camera')}><Camera size={17}/> Dùng camera</button>
    <button type="button" className={`source-choice ${source==='upload'?'active':''}`} onClick={()=>setSource('upload')}><ImagePlus size={17}/> Tải ảnh lên</button>
  </div>
  {cameraIssue&&<div className="alert" role="status"><ShieldAlert size={18}/><span>{cameraIssue}</span></div>}
  <input className="visually-hidden" ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif" aria-label={`Chọn ảnh Rubik số ${step+1}`} onChange={e=>{void onUpload(e.target.files?.[0]);}}/>
  <div className="scan-progress"><div className={`scan-dot ${step===0?'current':'done'}`}>{step===1?<Check size={16}/>:1} · U/F/R</div><div className={`scan-dot ${step===1?'current':''}`}>2 · D/L/B</div></div>
  <div className="scan-instruction"><strong>{step===0?'Góc 1: trắng trên, xanh lá trái, đỏ phải':'Góc 2: vàng trên, cam trái, xanh dương phải'}</strong>
   <p>{step===0?'Giữ khối Rubik như hình phủ lên camera: nhìn thấy đồng thời ba mặt U, F, R. Không xoay các tầng.':'Xoay CẢ KHỐI Rubik để thấy ba mặt đối diện D, L, B. Không xoay riêng tầng nào; đặt mặt vàng lên trên, cam bên trái, xanh dương bên phải.'}</p>
   <small>Giữ đúng màu tâm và vị trí. Cần khối 3×3 có sơ đồ màu chuẩn U=trắng, R=đỏ, F=xanh lá, D=vàng, L=cam, B=xanh dương.</small>
  </div>
  <div className="camera-frame angle-frame">
   {source==='camera'&&<video ref={video} autoPlay playsInline muted className={photo?'camera-hidden':''}/>}
   {source==='upload'&&!photo&&<div className="upload-placeholder"><ImagePlus size={44}/><b>Ảnh {step+1} / 2</b><span>Chọn ảnh đã chụp từ thư viện, đủ ba mặt Rubik trong cùng ảnh.</span></div>}
   {photo&&<img className="frozen-photo" src={photo.dataUrl} alt={`Ảnh Rubik góc ${step+1} đã chụp`}/>}
   <svg ref={svg} className="angle-svg" style={{display:source==='upload'&&!photo?'none':undefined}} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-label="Khung hướng dẫn ba mặt Rubik">
     {faces.map(f=>{
       const q=quads[f];
       return <g key={f}>
         <polygon points={q.map(p=>`${p.x*1000},${p.y*1000}`).join(' ')} className={`angle-polygon ${photo&&selected===f?'angle-selected':''}`} onClick={()=>setSelected(f)}/>
         {stickerPoints(q).map((p,i)=><circle key={i} cx={p.x*1000} cy={p.y*1000} r={photo?'9':'7'} fill={photo? preview?.[f]?.pixels[i]?`rgb(${preview[f]!.pixels[i].join(',')})`:'#ffffff':'#ffffff'} stroke="#183144" strokeWidth="3" opacity={photo?1:.8} pointerEvents="none"/>)}
         <text x={q.reduce((s,p)=>s+p.x,0)*250} y={q.reduce((s,p)=>s+p.y,0)*250-22} className="angle-label">{f}</text>
         {photo&&selected===f&&q.map((p,i)=><circle key={`c${i}`} cx={p.x*1000} cy={p.y*1000} r="19" fill="#fff" stroke="#0d927e" strokeWidth="7" className="angle-handle" onPointerDown={e=>{drag.current={face:f,index:i};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={movePointer} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}/>)}
       </g>;
     })}
   </svg>
   {source==='camera'&&!ready&&!photo&&<div className="camera-wait">{cameraIssue?'Camera chưa sẵn sàng':'Đang mở camera…'}</div>}
  </div>
  {photo&&<div className="photo-quality" role="status"><b>{photo.filename?`Ảnh: ${photo.filename}`:'Ảnh camera'} · {photo.quality.width}×{photo.quality.height}px</b>
     {photo.quality.warnings.length?photo.quality.warnings.map((w,i)=><p key={i}>⚠ {w}</p>):<p className="photo-quality-ok">✓ Chất lượng ảnh cơ bản đạt yêu cầu. Cần tiếp tục kiểm tra màu Rubik.</p>}
   </div>}
  {photo ? <>
    <div className="scan-instruction scan-adjust"><strong><Move size={16}/> Căn lại khung nếu cần</strong><p>Chọn từng mặt bên dưới. Kéo 4 nút trắng đến <b>4 góc ngoài của mặt</b> tương ứng. Các dấu chấm phải nằm giữa từng ô màu, không nằm trên viền đen.</p></div>
    <div className="angle-face-select">{faces.map(f=><button key={f} type="button" className={`angle-face-chip ${selected===f?'active':''}`} onClick={()=>setSelected(f)}><span style={{background:FACE_COLORS[f].hex}}/>{POSITIONS[step][f]} {valid&&<Check size={13}/>}</button>)}</div>
    <div className="angle-samples">{faces.map(f=><div key={f}><strong>{f}</strong><div className="angle-nine">{preview?.[f]?.pixels.map((rgb,i)=><span key={i} title={`${f}${i+1}`} style={{background:`rgb(${rgb.join(',')})`}}/>)}</div></div>)}</div>
    <div className="angle-actions"><button type="button" className="btn btn-outline" onClick={()=>{setPhoto(null);setError('');}}><RotateCcw size={16}/> {source==='upload'?'Chọn ảnh khác':'Chụp lại'}</button><button type="button" className="btn btn-outline" onClick={reset}>Đặt lại khung</button></div>
    <button type="button" className="btn btn-primary btn-wide" disabled={!valid} onClick={accept}>{step===0?'Đúng 3 mặt — quét góc 2':'Ghép 54 ô và kiểm tra'} <ChevronRight size={18}/></button>
   </> : <>
    <div className="scan-steps-info"><Camera size={18}/><span>Đặt Rubik giữa khung, để 3 mặt khớp các đường viền. Giữ yên và chụp ảnh. Có thể căn 4 góc sau khi chụp.</span></div>
    {source==='camera'?<button type="button" className="btn btn-primary btn-wide" disabled={!ready} onClick={onCapture}><Camera size={19}/> Chụp ảnh {step+1} <ChevronRight size={18}/></button>
    :<button type="button" className="btn btn-primary btn-wide" disabled={loading} onClick={()=>fileInput.current?.click()}><ImagePlus size={19}/> {loading?'Đang kiểm tra ảnh…':`Tải ảnh ${step+1} từ điện thoại`} <ChevronRight size={18}/></button>}
    {step===1&&<button type="button" className="text-button" onClick={()=>{setStep(0);setPhoto(null);setQuads(initialQuads(0));setSelected('U');}}>← Quét lại ảnh 1</button>}
   </>}
   {error&&<div role="alert" className="alert error"><ShieldAlert size={18}/>{error}</div>}
   <div className="scan-steps-info"><ShieldCheck size={18}/><span>Ứng dụng sẽ kiểm tra số màu, tâm, cạnh, góc, parity và xác minh lời giải. Nếu không hợp lệ, bạn có thể sửa màu hoặc quét lại.</span></div>
   <p className="warning-copy">Có thể dùng camera hoặc tải ảnh độc lập cho từng lượt; nếu camera không hoạt động, hãy chuyển sang tải ảnh. Ảnh không được chứng minh chứa Rubik chỉ bằng kiểm tra độ sáng/độ nét. Chế độ beta: 2 ảnh thật, nhận diện 27 ô/ảnh theo 3 mặt có khung định hướng và các góc có thể kéo chỉnh; <b>chưa tự tìm vị trí và chiều của khối Rubik tự do trong mọi ảnh</b>. Chỉ chụp cùng một trạng thái, không xoay các tầng giữa hai lần.</p>
  </div>;
}
