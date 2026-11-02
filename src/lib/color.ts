import {FACES, type Face} from './cube.ts';
export type RGB=[number,number,number];
export const HEX_COLOR:Record<Face,string>={U:'#f4f6fa',R:'#ec3f57',F:'#15bd88',D:'#ffd246',L:'#ff914c',B:'#3985f8'};
// CIE Lab conversion for center-calibrated matching under varying lighting.
export function lab([r,g,b]:RGB):[number,number,number]{
  const lin=(v:number)=>{v/=255;return v>.04045?((v+.055)/1.055)**2.4:v/12.92;};
  const R=lin(r),G=lin(g),B=lin(b);
  const x=(R*.4124564+G*.3575761+B*.1804375)/.95047;
  const y=(R*.2126729+G*.7151522+B*.0721750);
  const z=(R*.0193339+G*.1191920+B*.9503041)/1.08883;
  const f=(n:number)=>n>.008856?Math.cbrt(n):(7.787*n)+16/116;
  const X=f(x),Y=f(y),Z=f(z);return [116*Y-16,500*(X-Y),200*(Y-Z)];
}
export function calibrateFaces(samples:Record<Face,RGB[]>):string {
 const centers=FACES.map(f=>lab(samples[f][4]));
 return FACES.map((f)=>samples[f].map((c,i)=>{
  if(i===4)return f;
  const v=lab(c);let best=0,min=Infinity;
  centers.forEach((p,j)=>{const d=(v[0]-p[0])**2+(v[1]-p[1])**2+(v[2]-p[2])**2;if(d<min){min=d;best=j;}});
  return FACES[best];
 }).join('')).join('');
}
export function sampleGrid(video:HTMLVideoElement):{pixels:RGB[]; imageData:string}{
 const w=480,h=480,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas không khả dụng.');
 const vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)throw new Error('Camera chưa sẵn sàng.');
 const side=Math.min(vw,vh)*.76;
 ctx.drawImage(video,(vw-side)/2,(vh-side)/2,side,side,0,0,w,h);
 const pixels:RGB[]=[];
 for(let y=0;y<3;y++)for(let x=0;x<3;x++){
   const cx=(x+.5)*w/3,cy=(y+.5)*h/3;
   let R=0,G=0,B=0,n=0;
   // central 25x25 square to avoid the plastic sticker borders
   for(let dy=-12;dy<=12;dy+=2)for(let dx=-12;dx<=12;dx+=2){const p=ctx.getImageData(cx+dx,cy+dy,1,1).data;R+=p[0];G+=p[1];B+=p[2];n++;}
   pixels.push([Math.round(R/n),Math.round(G/n),Math.round(B/n)]);
 }
 return {pixels,imageData:canvas.toDataURL('image/jpeg',.7)};
}
