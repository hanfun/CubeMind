import {useEffect,useMemo,useRef,useState,type PointerEvent} from 'react';
import {ArrowLeft,Camera,Check,ChevronRight,ImagePlus,Move,RotateCcw,ShieldAlert,ShieldCheck,ZoomIn,ZoomOut,Info} from 'lucide-react';
import {FACE_COLORS,type Face} from '../lib/cube';
import {captureSquare,classifyTwoAngles,initialQuads,isUsableQuad,sampleFace,SCAN_FACES,stickerPoints,type AngleIndex,type FaceScan,type Point,type Quad} from '../lib/twoAngle';
import {photographQuality,readUploadedImage,type LoadedPhoto} from '../lib/imageInput';
import {focusTransform,quadCentre,scanReviewWarnings,unstableStickers} from '../lib/scanUx';
import {translateLegacyText,useI18n} from '../i18n';

type Photo=LoadedPhoto;
type Props={onBack:()=>void;onDone:(facelets:string,warnings:string[])=>void};
const FACE_LABELS:Record<Face,{vi:string;en:string}>={
 U:{vi:'Trên · Trắng',en:'Top · White'}, F:{vi:'Trước · Xanh lá',en:'Front · Green'},
 R:{vi:'Phải · Đỏ',en:'Right · Red'}, D:{vi:'Dưới · Vàng',en:'Bottom · Yellow'},
 L:{vi:'Trái · Cam',en:'Left · Orange'}, B:{vi:'Sau · Xanh dương',en:'Back · Blue'},
};
const LIMIT=(x:number)=>Math.min(0.999,Math.max(0.001,x));

export default function TwoAngleScanner({onBack,onDone}:Props){
 const {language}=useI18n(),en=language==='en';
 const tr=(vi:string,english:string)=>en?english:vi;
 const localized=(message:string)=>{
   if(!en)return message;
   const known:Record<string,string>={
     'Ảnh khá tối; nên chụp nơi đủ sáng.':'The photo is dark; use a brighter location.',
     'Ảnh quá sáng; màu trắng/vàng có thể bị lóa.':'The photo is overexposed; white and yellow may wash out.',
     'Nhiều vùng cháy sáng; tránh ánh đèn phản chiếu vào sticker.':'Glare detected; avoid direct reflections on stickers.',
     'Nhiều vùng rất tối; hãy tăng ánh sáng.':'Large dark areas detected; increase lighting.',
     'Độ tương phản thấp; kiểm tra khối Rubik có nằm rõ trong ảnh.':'Low contrast; make sure the cube is clearly visible.',
     'Ảnh có thể bị mờ hoặc thiếu chi tiết; thử chụp lại nếu khó đọc màu.':'The photo may be blurry; retake it if sticker colours are unclear.',
     'Khung mặt không hợp lệ. Hãy căn lại 4 góc.':'Invalid face frame; readjust all four corners.',
     'Không thể ghép hai ảnh.':'Unable to combine the two photos.',
     'Không đọc được ảnh tải lên.':'Unable to read the uploaded photo.',
     'Không lấy được ảnh.':'Unable to capture the photo.',
   };
   if(known[message])return known[message];
   const uncertain=message.match(/^(\\d+) ô màu có độ tin cậy thấp/);
   if(uncertain)return `${uncertain[1]} stickers have uncertain colours. Verify them on your real cube.`;
   const forced=message.match(/^(\\d+) ô được cân bằng lại/);
   if(forced)return `${forced[1]} stickers were reassigned to balance the colours. Do not automatically trust this recognition.`;
   return translateLegacyText(message);
 };
 const video=useRef<HTMLVideoElement>(null),stream=useRef<MediaStream|null>(null),svg=useRef<SVGSVGElement>(null),fileInput=useRef<HTMLInputElement>(null);
 const drag=useRef<{face:Face;index:number}|null>(null);
 const [step,setStep]=useState<AngleIndex>(0),[photo,setPhoto]=useState<Photo|null>(null);
 const [source,setSource]=useState<'camera'|'upload'>('camera'),[loading,setLoading]=useState(false),[cameraIssue,setCameraIssue]=useState('');
 const [first,setFirst]=useState<Partial<Record<Face,FaceScan>>>({});
 const [firstWarnings,setFirstWarnings]=useState<string[]>([]);
 const [quads,setQuads]=useState<Record<Face,Quad>>(()=>initialQuads(0));
 const [selected,setSelected]=useState<Face>('U'),[ready,setReady]=useState(false),[error,setError]=useState('');
 const [zoom,setZoom]=useState(1),[zoomFocus,setZoomFocus]=useState<Point>({x:.5,y:.5});

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
     const loaded=await readUploadedImage(file,360);
     setPhoto(loaded);setQuads(initialQuads(step));setSelected(faces[0]);setZoom(1);setZoomFocus({x:.5,y:.5});
   }catch(e){setError(e instanceof Error?e.message:'Không đọc được ảnh tải lên.');}
   finally{setLoading(false);if(fileInput.current)fileInput.current.value='';}
 };
 const onCapture=()=>{
   if(!video.current||!ready)return;
   try{const shot=captureSquare(video.current);setPhoto({...shot,quality:photographQuality(shot.pixels)});setQuads(initialQuads(step));setSelected(faces[0]);setZoom(1);setZoomFocus({x:.5,y:.5});setError('');}
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
     if(step===0){
       setFirst(picked);
       setFirstWarnings([...photo.quality.warnings.map(w=>`${tr('Ảnh 1','Photo 1')}: ${localized(w)}`),...scanReviewWarnings(picked,faces,tr('Ảnh 1','Photo 1'),18,language)]);
       setStep(1);setPhoto(null);setSelected('D');setQuads(initialQuads(1));setZoom(1);setZoomFocus({x:.5,y:.5});setError('');
     }
     else{
       const samples={...first,...picked} as Record<Face,FaceScan>;
       const result=classifyTwoAngles(samples);
       onDone(result.facelets,[...firstWarnings,...photo.quality.warnings.map(w=>`${tr('Ảnh 2','Photo 2')}: ${localized(w)}`),...scanReviewWarnings(picked,faces,tr('Ảnh 2','Photo 2'),18,language),...result.warnings.map(localized)]);
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
 const reset=()=>{setQuads(initialQuads(step));setZoomFocus(quadCentre(initialQuads(step)[selected]));setError('');};
 const resetSelected=()=>{setQuads(previous=>({...previous,[selected]:initialQuads(step)[selected]}));setZoomFocus(quadCentre(initialQuads(step)[selected]));setError('');};
 const selectFace=(face:Face)=>{setSelected(face);setZoomFocus(quadCentre(quads[face]));};
 const setZoomLevel=(level:number)=>{setZoom(level);setZoomFocus(quadCentre(quads[selected]));};
 const selectedPreview=preview?.[selected];
 const selectedNoise=unstableStickers(selectedPreview).length;
 const selectedValid=Boolean(quads[selected]&&isUsableQuad(quads[selected])&&selectedPreview);
 const zoomStyle=photo?{transform:focusTransform(zoomFocus,zoom)}:undefined;
 const caption=step===0
   ?tr('Trắng ở trên · Xanh lá phía trước · Đỏ bên phải','White on top · Green front · Red right')
   :tr('Vàng ở trên · Cam bên trái · Xanh dương bên phải','Yellow on top · Orange left · Blue right');
 return <div className="scan-page two-angle-page scan-ux-page">
   <div className="section-header">
     <button type="button" className="circle-btn" onClick={onBack} aria-label={tr('Quay lại','Back')}><ArrowLeft size={19}/></button>
     <div>
       <div className="eyebrow">{tr('QUÉT RUBIK · 2 ẢNH · BETA','RUBIK SCAN · 2 PHOTOS · BETA')}</div>
       <h2>{tr(`Ảnh ${step+1} / 2`,`Photo ${step+1} / 2`)}</h2>
     </div>
   </div>
   <div className="scan-ux-steps" aria-label={tr('Tiến trình quét hai ảnh','Two-photo scan progress')}>
     <div className={`scan-ux-step ${step===0?'active':'done'}`}>
       <span className="scan-ux-step-number">{step===1?<Check size={17}/>:1}</span>
       <div><b>{tr('Ảnh 1','Photo 1')}</b><small>U · F · R</small></div>
     </div>
     <div className="scan-ux-step-connector" aria-hidden="true"/>
     <div className={`scan-ux-step ${step===1?'active':''}`}>
       <span className="scan-ux-step-number">2</span>
       <div><b>{tr('Ảnh 2','Photo 2')}</b><small>D · L · B</small></div>
     </div>
   </div>
   <div className="scan-ux-orientation">
     <div className="scan-ux-orientation-title"><Info size={16}/><strong>{caption}</strong></div>
     <div className="scan-ux-legend">
       {faces.map(f=><span key={f}><i style={{background:FACE_COLORS[f].hex}}/>{FACE_LABELS[f][language]} ({f})</span>)}
     </div>
     <p>{step===0
       ?tr('Giữ cả 3 mặt trong cùng ảnh. Không xoay bất kỳ tầng nào.','Include all 3 faces in one photo. Do not turn any cube layers.')
       :tr('Chỉ xoay TOÀN BỘ KHỐI để nhìn thấy ba mặt còn lại. Không xoay từng tầng.','Rotate the ENTIRE cube to see the remaining faces. Do not turn individual layers.')}</p>
   </div>
   <div className="scan-ux-layout">
     <section className="scan-ux-visual" aria-label={tr('Ảnh và vùng căn góc','Photo and corner adjustment')}>
       {photo&&<div className="scan-ux-face-picker" role="group" aria-label={tr('Chọn mặt cần căn','Select a face to align')}>
         {faces.map(f=>{
           const noise=unstableStickers(preview?.[f]).length;
           return <button type="button" key={f} className={`scan-ux-face-button ${selected===f?'active':''}`}
             aria-pressed={selected===f} onClick={()=>selectFace(f)}>
             <i style={{background:FACE_COLORS[f].hex}}/>
             <span><strong>{FACE_LABELS[f][language]}</strong><small>{tr('Chỉnh mặt','Edit face')} {f}</small></span>
             {noise>0&&<span className="scan-ux-alert-count" title={tr('Ô có màu không đồng đều','Uneven-colour stickers')}>!{noise}</span>}
           </button>;
         })}
       </div>}
       <div className="scan-ux-frame-bar">
         <strong>{photo?tr(`Đang căn mặt ${selected}`,`Aligning face ${selected}`):tr('Đưa 3 mặt vào khung','Fit 3 faces inside the guide')}</strong>
         {photo&&<div className="scan-ux-zoom">
           <button type="button" disabled={zoom===1} onClick={()=>setZoomLevel(zoom===2.2?1.6:1)} aria-label={tr('Thu nhỏ','Zoom out')}><ZoomOut size={17}/></button>
           <output aria-live="polite">{Math.round(zoom*100)}%</output>
           <button type="button" disabled={zoom===2.2} onClick={()=>setZoomLevel(zoom===1?1.6:2.2)} aria-label={tr('Phóng to mặt đang chọn','Zoom into selected face')}><ZoomIn size={17}/></button>
         </div>}
       </div>
       <div className="camera-frame angle-frame scan-ux-frame">
         {source==='upload'&&!photo&&<div className="upload-placeholder">
           <ImagePlus size={44}/><strong>{tr('Chụp hoặc tải một ảnh có 3 mặt','Capture or upload one photo with 3 faces')}</strong>
           <span>{tr('Ảnh ngang hoặc dọc đều được; chọn ảnh đủ sáng, không bị lóa.','Landscape or portrait is fine. Use a well-lit photo without glare.')}</span>
         </div>}
         <div className="scan-ux-image-layer" style={zoomStyle}>
           {source==='camera'&&<video ref={video} autoPlay playsInline muted className={photo?'camera-hidden':''}/>}
           {photo&&<img className="frozen-photo" src={photo.dataUrl} alt={tr(`Ảnh Rubik số ${step+1}`,`Cube photo ${step+1}`)}/>}
           <svg ref={svg} className="angle-svg" style={{display:source==='upload'&&!photo?'none':undefined}}
             viewBox="0 0 1000 1000" preserveAspectRatio="none"
             role="img" aria-label={tr('Hướng dẫn căn 3 mặt Rubik','Three-face Rubik alignment guide')}>
             {faces.map(f=>{
               const q=quads[f];const centre=quadCentre(q);
               return <g key={f}>
                 <polygon points={q.map(p=>`${p.x*1000},${p.y*1000}`).join(' ')}
                   className={`angle-polygon ${photo&&selected===f?'angle-selected':''} ${!photo?'scan-ux-guide-polygon':''}`}
                   onClick={()=>{if(photo)selectFace(f);}}/>
                 {photo&&selected===f&&stickerPoints(q).map((p,i)=><circle key={i}
                   cx={p.x*1000} cy={p.y*1000} r="12"
                   fill={preview?.[f]?.pixels[i]?`rgb(${preview[f]!.pixels[i].join(',')})`:'#ffffff'}
                   stroke="#09192b" strokeWidth="5" pointerEvents="none"/>)}
                 <circle cx={centre.x*1000} cy={centre.y*1000-38} r={photo?30:37}
                   fill={FACE_COLORS[f].hex} stroke="#ffffff" strokeWidth="6" pointerEvents="none"/>
                 <text x={centre.x*1000} y={centre.y*1000-38} className="angle-label scan-ux-face-label" pointerEvents="none">{f}</text>
                 {photo&&selected===f&&q.map((p,i)=><g key={i}>
                   <circle cx={p.x*1000} cy={p.y*1000} r="26" className="scan-ux-handle-visible" pointerEvents="none"/>
                   <circle cx={p.x*1000} cy={p.y*1000} r="67" className="scan-ux-handle-hit"
                     role="button" aria-label={tr(`Kéo góc ${i+1} của mặt ${f}`,`Drag corner ${i+1} of face ${f}`)}
                     onPointerDown={e=>{e.preventDefault();drag.current={face:f,index:i};e.currentTarget.setPointerCapture(e.pointerId);}}
                     onPointerMove={movePointer}
                     onPointerUp={()=>{drag.current=null;}}
                     onPointerCancel={()=>{drag.current=null;}}/>
                 </g>)}
               </g>;
             })}
           </svg>
         </div>
         {source==='camera'&&!ready&&!photo&&<div className="camera-wait">
           {cameraIssue?tr('Camera chưa sẵn sàng','Camera not ready'):tr('Đang mở camera…','Opening camera…')}
         </div>}
       </div>
       {photo?<div className="scan-ux-photo-hint"><Move size={16}/>
         {tr('Kéo 4 vòng tròn đến 4 góc ngoài của mặt. Dùng + để phóng to và căn chính xác hơn.',
             'Drag the four circles to the outer corners of the face. Use + to zoom in for accuracy.')}
       </div>:<div className="scan-ux-photo-hint"><Camera size={16}/>
         {tr('Đưa Rubik vào giữa, để cả 3 mặt hiện rõ rồi chụp. Có thể căn góc sau khi chụp.',
             'Center the cube, keep all three faces visible, then capture. You can adjust corners afterwards.')}
       </div>}
     </section>
     <aside className="scan-ux-sidebar">
       <div className="image-source-switch" role="group" aria-label={tr('Chọn nguồn ảnh','Image source')}>
         <button type="button" className={`source-choice ${source==='camera'?'active':''}`} onClick={()=>setSource('camera')}>
           <Camera size={17}/>{tr('Camera','Camera')}
         </button>
         <button type="button" className={`source-choice ${source==='upload'?'active':''}`} onClick={()=>setSource('upload')}>
           <ImagePlus size={17}/>{tr('Tải ảnh','Upload')}
         </button>
       </div>
       <input className="visually-hidden" ref={fileInput} type="file"
         accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif"
         aria-label={tr(`Chọn ảnh Rubik số ${step+1}`,`Select cube photo ${step+1}`)}
         onChange={e=>{void onUpload(e.target.files?.[0]);}}/>
       {cameraIssue&&<div className="alert info" role="status"><ShieldAlert size={18}/><span>{localized(cameraIssue)}</span></div>}
       {!photo?<div className="scan-ux-side-card">
         <div className="eyebrow">{tr('BƯỚC CHỤP ẢNH','CAPTURE STEP')}</div>
         <h3>{tr('Chỉ cần thấy rõ 3 mặt','Make all three faces visible')}</h3>
         <p>{step===0
            ?tr('Mặt trên trắng, mặt trước xanh lá và mặt phải đỏ. Chụp tất cả cùng lúc.',
                'White top, green front and red right. Capture all three at once.')
            :tr('Xoay nguyên khối để có vàng trên, cam trái và xanh dương phải; không xoay riêng các tầng.',
                'Rotate the entire cube: yellow top, orange left and blue right; do not turn individual layers.')}</p>
         <button type="button" className="btn btn-primary btn-wide scan-ux-primary"
           disabled={loading||(source==='camera'&&!ready)}
           onClick={()=>source==='camera'?onCapture():fileInput.current?.click()}>
           {source==='camera'?<Camera size={19}/>:<ImagePlus size={19}/>}
           {loading?tr('Đang xử lý ảnh…','Processing photo…'):
            source==='camera'?tr(`Chụp ảnh ${step+1}`,`Take photo ${step+1}`):
            tr(`Chọn ảnh ${step+1} từ thiết bị`,`Choose photo ${step+1} from device`)}
           <ChevronRight size={17}/>
         </button>
       </div>:<div className="scan-ux-side-card">
         <div className="eyebrow">{tr('BƯỚC CĂN GÓC','ALIGN FACE CORNERS')}</div>
         <h3>{tr(`Mặt ${selected} · ${FACE_LABELS[selected].vi}`,`Face ${selected} · ${FACE_LABELS[selected].en}`)}</h3>
         <p>{tr('Đối chiếu 9 ô màu mẫu bên dưới với ảnh gốc. Mỗi dấu chấm phải nằm giữa một ô, tránh đường viền đen.',
                 'Compare the nine sampled stickers below with your photo. Dots should sit inside stickers, away from black borders.')}</p>
         <div className="scan-ux-sample-view">
           <div className="scan-ux-sample-top">
             <b>{tr('9 màu đang nhận diện','9 sampled colours')}</b>
             <span style={{background:FACE_COLORS[selected].hex}} title={tr('Màu tâm dự kiến','Expected centre colour')}/>
           </div>
           <div className="angle-nine scan-ux-nine">
             {selectedPreview?.pixels.map((rgb,i)=><span key={i}
               aria-label={tr(`Ô ${i+1}`,`Sticker ${i+1}`)}
               title={tr(`Ô ${i+1}`,`Sticker ${i+1}`)}
               style={{background:`rgb(${rgb.join(',')})`}}/>)}
           </div>
           <div className={`scan-ux-confidence ${selectedNoise?'warning':'ok'}`}>
             {selectedNoise
               ?tr(`${selectedNoise} ô màu không đồng đều; xem lại hoặc chụp ảnh khác.`,
                   `${selectedNoise} uneven-colour stickers; review or retake the photo.`)
               :tr(selectedValid?'Vùng lấy mẫu có thể sử dụng — vẫn cần đối chiếu màu.':'Cần căn lại khung mặt.',
                   selectedValid?'Sampling area is usable — still verify the colours.':'The face guide needs adjustment.')}
           </div>
         </div>
         <div className="scan-ux-edit-actions">
           <button type="button" className="btn btn-outline" onClick={resetSelected}><RotateCcw size={15}/>{tr('Đặt lại mặt','Reset face')}</button>
           <button type="button" className="btn btn-outline" onClick={reset}>{tr('Đặt lại 3 mặt','Reset all 3')}</button>
           <button type="button" className="btn btn-outline" onClick={()=>{setPhoto(null);setZoom(1);setError('');}}>
             <ImagePlus size={15}/>{source==='camera'?tr('Chụp lại','Retake'):tr('Ảnh khác','New photo')}
           </button>
         </div>
         {photo.quality.warnings.length>0&&<div className="scan-ux-quality-warning" role="status">
           <ShieldAlert size={16}/>
           <div>{photo.quality.warnings.map((w,i)=><p key={i}>{localized(w)}</p>)}</div>
         </div>}
         <button type="button" className="btn btn-primary btn-wide scan-ux-primary"
           disabled={!valid} onClick={accept}>
           {step===0?tr('Đã căn xong · Tiếp tục ảnh 2','Aligned · Continue to photo 2'):
             tr('Tiếp tục kiểm tra 54 ô màu','Continue to review 54 stickers')}
           <ChevronRight size={17}/>
         </button>
         <small className="scan-ux-disclaimer">{tr('Hệ thống sẽ còn kiểm tra số ô màu, tính hợp lệ và lời giải. Căn góc chưa có nghĩa là nhận diện chính xác.',
           'Sticker counts, cube legality and the solution will be checked next. Alignment alone does not prove accuracy.')}</small>
       </div>}
       {step===1&&<button type="button" className="text-button scan-ux-back" onClick={()=>{
         setStep(0);setPhoto(null);setQuads(initialQuads(0));setSelected('U');setZoom(1);setZoomFocus({x:.5,y:.5});setError('');
       }}><ArrowLeft size={15}/>{tr('Chụp lại ảnh 1','Retake photo 1')}</button>}
       <details className="scan-ux-details">
         <summary>{tr('Hướng dẫn & giới hạn nhận diện','Guide and recognition limitations')}</summary>
         <p>{tr('Dùng sơ đồ màu chuẩn: U trắng, R đỏ, F xanh lá, D vàng, L cam, B xanh dương. Không đổi các tầng giữa hai ảnh.',
                'Use the standard scheme: U white, R red, F green, D yellow, L orange, B blue. Do not turn layers between photos.')}</p>
         <p>{tr('Chế độ quét 2 ảnh còn beta. Ứng dụng chưa tự động xác định Rubik trong ảnh chụp tùy ý; ánh sáng, phản chiếu và góc căn sai có thể khiến màu nhận diện sai.',
                'Two-photo scanning remains beta. It does not automatically locate arbitrary cube poses. Lighting, reflections and incorrect alignment can produce wrong colours.')}</p>
       </details>
     </aside>
   </div>
   {error&&<div role="alert" className="alert error"><ShieldAlert size={18}/>{localized(error)}</div>}
   <div className="scan-ux-bottom-note"><ShieldCheck size={17}/>
     {tr('Sau hai ảnh, hãy kiểm tra và sửa lại từng ô trong bảng 54 màu trước khi giải.',
         'After both photos, review and correct the 54-sticker editor before solving.')}
   </div>
 </div>;
}
