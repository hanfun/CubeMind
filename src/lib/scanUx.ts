import type {FaceScan,Point,Quad} from './twoAngle.ts';

/** The four vertex handles are controlled in normalized, unscaled image coordinates. */
export function quadCentre(quad:Quad):Point {
 return {
  x:quad.reduce((sum,p)=>sum+p.x,0)/4,
  y:quad.reduce((sum,p)=>sum+p.y,0)/4,
 };
}

/**
 * Keep a chosen face centered while zooming image and SVG together.
 * CSS transform list is evaluated right-to-left: scale first, then translate.
 * The pointer handler can still use the SVG's transformed bounding rectangle.
 */
export function focusTransform(focus:Point,zoom:number):string {
 if(!Number.isFinite(zoom)||zoom<1||zoom>3)throw new Error('Invalid scan zoom');
 if(!Number.isFinite(focus.x)||!Number.isFinite(focus.y))throw new Error('Invalid focus');
 const x=(0.5-focus.x)*zoom*100;
 const y=(0.5-focus.y)*zoom*100;
 return `translate(${x}%, ${y}%) scale(${zoom})`;
}

export function unstableStickers(scan:FaceScan|undefined,threshold=18):number[] {
 if(!scan)return [];
 return scan.noise.reduce<number[]>((indices,noise,index)=>{
  if(!Number.isFinite(noise)||noise>threshold)indices.push(index);
  return indices;
 },[]);
}

export function scanReviewWarnings(
 scans:Partial<Record<string,FaceScan>>,
 faces:readonly string[],
 label:string,
 threshold=18,
 language:'vi'|'en'='vi',
):string[]{
 const warnings:string[]=[];
 for(const face of faces){
  const unstable=unstableStickers(scans[face],threshold).length;
  if(unstable>0)warnings.push(language==='en' ? `${label} · ${face}: ${unstable} stickers have uneven colour; please review.` : `${label} · ${face}: ${unstable} ô màu có độ đồng đều thấp, cần kiểm tra lại.`);
 }
 return warnings;
}
