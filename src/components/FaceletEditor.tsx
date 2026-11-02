import {useState} from 'react';
import {FACES,FACE_NAMES,FACE_COLORS,SOLVED,type Face} from '../lib/cube';

type Props={value:string;onChange:(v:string)=>void};
export function FaceletEditor({value,onChange}:Props){
 const [paint,setPaint]=useState<Face>('R'),[active,setActive]=useState<Face>('F');
 const faceIndex=FACES.indexOf(active),start=faceIndex*9;
 const setSticker=(i:number)=>{if(i===4)return;const arr=value.padEnd(54,'U').split('');arr[start+i]=paint;onChange(arr.join(''));};
 return <div className="facelet-editor">
   <div className="field-label">Mặt đang chỉnh</div>
   <div className="face-picker">{FACES.map(f=><button type="button" key={f} className={`face-pick ${active===f?'active':''}`} onClick={()=>setActive(f)}>{f}</button>)}</div>
   <div className="editor-layout"><div>
   <div className="face-title">{FACE_NAMES[active]} <span>· Tâm cố định</span></div>
   <div className="sticker-grid">{Array.from({length:9},(_,i)=>{
     const col=value[start+i] as Face;return <button type="button" key={i} aria-label={`Ô ${i+1} mặt ${active}`} className={`sticker ${i===4?'center-sticker':''}`} style={{backgroundColor:FACE_COLORS[col]?.hex??'#4b5563'}} onClick={()=>setSticker(i)} disabled={i===4}/>;
   })}</div></div>
   <div><div className="field-label">Chọn màu để tô</div><div className="palette">{FACES.map(f=><button type="button" title={FACE_NAMES[f]} key={f} onClick={()=>setPaint(f)} className={`palette-item ${paint===f?'selected':''}`}><span style={{backgroundColor:FACE_COLORS[f].hex}}/> <small>{FACE_COLORS[f].name}</small></button>)}</div></div></div>
   <div className="hint-line">Định hướng mặc định: U = trắng, F = xanh lá, R = đỏ. Tâm 6 mặt không thay đổi.</div>
   <button type="button" className="text-button" onClick={()=>onChange(SOLVED)}>Đặt lại khối đã giải</button>
 </div>;
}
