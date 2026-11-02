/**
 * Two-photo cube scan. Coordinates are fixed to the U/R/F/D/L/B sticker convention.
 * Shot 1: U on top, F on screen-left, R on screen-right.
 * Shot 2: D on top, L on screen-left, B on screen-right.
 * No individual face/layer should be turned between the two photographs.
 */
import { FACES, type Face } from './cube.ts';
import { lab, type RGB } from './color.ts';

export type Point = { x: number; y: number };
export type Quad = [Point, Point, Point, Point]; // face-local TL, TR, BR, BL
export type AngleIndex = 0 | 1;
export const SCAN_FACES: readonly [readonly Face[], readonly Face[]] = [['U', 'F', 'R'], ['D', 'L', 'B']];
export const PHOTO_SIZE = 640;

type Vec3 = readonly [number, number, number];
// Canonical facelet winding (exactly the cubejs URFDLB facelet convention).
export const FACE_CORNERS: Record<Face, readonly [Vec3, Vec3, Vec3, Vec3]> = {
  U: [[-1, 1, -1], [1, 1, -1], [1, 1, 1], [-1, 1, 1]],
  R: [[1, 1, 1], [1, 1, -1], [1, -1, -1], [1, -1, 1]],
  F: [[-1, 1, 1], [1, 1, 1], [1, -1, 1], [-1, -1, 1]],
  D: [[-1, -1, 1], [1, -1, 1], [1, -1, -1], [-1, -1, -1]],
  L: [[-1, 1, -1], [-1, 1, 1], [-1, -1, 1], [-1, -1, -1]],
  B: [[1, 1, -1], [-1, 1, -1], [-1, -1, -1], [1, -1, -1]],
};

export function projectVertex(v: Vec3, angle: AngleIndex): Point {
  const [x, y, z] = angle === 0 ? v : [-v[2], -v[1], -v[0]];
  return { x: 0.5 + (x - z) * 0.22, y: 0.5 + (-2 * y + x + z) * 0.11 };
}
export function initialQuads(angle: AngleIndex): Record<Face, Quad> {
  const result = {} as Record<Face, Quad>;
  for (const face of SCAN_FACES[angle]) {
    result[face] = FACE_CORNERS[face].map(v => projectVertex(v, angle)) as Quad;
  }
  return result;
}

/** Bilinear mapping for 4 face vertices in canonical local TL,TR,BR,BL order. */
export function pointOnFace(quad: Quad, u: number, v: number): Point {
  const [tl, tr, br, bl] = quad;
  return {
    x: (1-u)*(1-v)*tl.x + u*(1-v)*tr.x + u*v*br.x + (1-u)*v*bl.x,
    y: (1-u)*(1-v)*tl.y + u*(1-v)*tr.y + u*v*br.y + (1-u)*v*bl.y,
  };
}
export function stickerPoints(quad: Quad): Point[] {
  const result: Point[] = [];
  for (let row=0; row<3; row++) for (let col=0; col<3; col++)
    result.push(pointOnFace(quad, (col+0.5)/3, (row+0.5)/3));
  return result;
}
export function isUsableQuad(quad: Quad): boolean {
  const inside = quad.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1);
  let area = 0;
  for(let i=0;i<4;i++)area += quad[i].x*quad[(i+1)%4].y - quad[(i+1)%4].x*quad[i].y;
  return inside && area > 0.008 && stickerPoints(quad).every(p=>p.x>0.015&&p.x<0.985&&p.y>0.015&&p.y<0.985);
}

export type FaceScan = { pixels: RGB[]; noise: number[] };
export type ScanResult = { samples: Record<Face, FaceScan>; facelets: string; warnings: string[]; ambiguous: Array<{face:Face;cell:number}> };
export type PixelSource = {width:number;height:number;data:Uint8ClampedArray};

function pixelAt(img:PixelSource, x:number, y:number):RGB {
  const px = Math.max(0,Math.min(img.width-1,Math.round(x))), py = Math.max(0,Math.min(img.height-1,Math.round(y)));
  const i=(py*img.width+px)*4;
  return [img.data[i],img.data[i+1],img.data[i+2]];
}
/** Median sampled patches avoid glare and dark grid separators. */
export function sampleFace(img:PixelSource, quad:Quad):FaceScan {
  if (!isUsableQuad(quad))throw new Error('Khung mặt không hợp lệ. Hãy căn lại 4 góc.');
  const pixels:RGB[] = [], noise:number[] = [];
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
    const pixelSamples:RGB[]=[];
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++) {
      // +/- 0.12 of one sticker across width/height: sample inside colored square.
      const p=pointOnFace(quad,(col+0.5 + dx*0.03)/3,(row+0.5 + dy*0.03)/3);
      pixelSamples.push(pixelAt(img,p.x*(img.width-1),p.y*(img.height-1)));
    }
    const med = ([0,1,2] as const).map(k=>pixelSamples.map(c=>c[k]).sort((a,b)=>a-b)[12]) as RGB;
    pixels.push(med);
    const deviation=pixelSamples.reduce((s,c)=>s+Math.hypot(...lab(c).map((v,i)=>v-lab(med)[i])),0)/pixelSamples.length;
    noise.push(deviation);
  }
  return {pixels,noise};
}

export function classifyTwoAngles(samples: Record<Face,FaceScan>):ScanResult {
  for(const face of FACES) if (!samples[face] || samples[face].pixels.length !== 9) throw new Error(`Thiếu 9 ô mặt ${face}.`);
  const centers=Object.fromEntries(FACES.map(f=>[f,lab(samples[f].pixels[4])])) as Record<Face,[number,number,number]>;
  const warnings:string[]=[], ambiguous:Array<{face:Face;cell:number}>=[];
  const result:Record<Face,string> = {} as Record<Face,string>;
  for(const face of FACES){
    const letters=samples[face].pixels.map((pix,cell)=>{
      if(cell===4)return face;
      const p=lab(pix);
      const ranked=FACES.map(f=>({f,d:Math.hypot(...p.map((v,i)=>v-centers[f][i]))})).sort((a,b)=>a.d-b.d);
      if(ranked[0].d>30 || ranked[1].d-ranked[0].d<7 || samples[face].noise[cell]>18)
        ambiguous.push({face,cell});
      return ranked[0].f;
    });
    result[face]=letters.join('');
  }
  if(ambiguous.length)warnings.push(`${ambiguous.length} ô có màu chưa chắc chắn. Hãy kiểm tra/chỉnh trong bảng 54 ô trước khi giải.`);
  return {samples,facelets:FACES.map(f=>result[f]).join(''),warnings,ambiguous};
}

export function imgDataFromCanvas(canvas:HTMLCanvasElement):PixelSource{
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Không thể đọc dữ liệu ảnh.');
  return ctx.getImageData(0,0,canvas.width,canvas.height);
}
/** Export square-cropped frame exactly as displayed by object-fit:cover. */
export function captureSquare(video:HTMLVideoElement): {dataUrl:string; pixels:PixelSource} {
  const {videoWidth:w,videoHeight:h}=video;
  if(!w||!h)throw new Error('Camera chưa sẵn sàng.');
  const c=document.createElement('canvas'); c.width=PHOTO_SIZE;c.height=PHOTO_SIZE;
  const ctx=c.getContext('2d',{willReadFrequently:true}); if(!ctx)throw new Error('Không thể tạo ảnh từ camera.');
  const side=Math.min(w,h);
  ctx.drawImage(video,(w-side)/2,(h-side)/2,side,side,0,0,PHOTO_SIZE,PHOTO_SIZE);
  return {dataUrl:c.toDataURL('image/jpeg',0.88),pixels:imgDataFromCanvas(c)};
}
