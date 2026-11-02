import type {MoveToken} from './cube';
const TOKEN = /^[URFDLB](?:2|')?$/;
const parseTokens=(s:string)=>{const list=s.trim().split(/\s+/).filter(Boolean);if(list.some(m=>!TOKEN.test(m)))throw new Error('Ký hiệu xoay không hợp lệ.');return list;};
const inverse=(m:string)=>m.endsWith('2')?m:m.endsWith("'")?m.slice(0,-1):m+"'";

export type Axis = 'x'|'y'|'z';
export type V3 = {x:number;y:number;z:number};
export type FaceTurn = {face:'U'|'D'|'R'|'L'|'F'|'B';axis:Axis;layer:-1|1;angle:number};
const FACE_SPEC:Record<string,{axis:Axis;layer:-1|1}>={R:{axis:'x',layer:1},L:{axis:'x',layer:-1},U:{axis:'y',layer:1},D:{axis:'y',layer:-1},F:{axis:'z',layer:1},B:{axis:'z',layer:-1}};
export function moveToTurn(move:MoveToken):FaceTurn {
 const m=parseTokens(move);if(m.length!==1)throw new Error('Phải có đúng một thao tác xoay.');
 const face=m[0][0] as FaceTurn['face'];const {axis,layer}=FACE_SPEC[face];
 const sign=m[0].endsWith("'")?-1:1;
 return {face,axis,layer,angle:-layer*sign*(m[0].endsWith('2')?Math.PI:Math.PI/2)};
}
export function faceFromDrag(normal:V3,cubie:V3,delta:V3,threshold=0.12):MoveToken|null{
 // Motion on the tangent plane: n × delta is the real rotation axis.
 const cross={x:normal.y*delta.z-normal.z*delta.y,y:normal.z*delta.x-normal.x*delta.z,z:normal.x*delta.y-normal.y*delta.x};
 const entries=Object.entries(cross) as [Axis,number][];
 entries.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
 const [axis,direction]=entries[0];
 if(Math.abs(direction)<threshold)return null;
 const rounded=Math.round(cubie[axis]);if(Math.abs(rounded)!==1)return null; // middle slices not supported
 const layer=rounded as -1|1;
 const face=Object.entries(FACE_SPEC).find(([,v])=>v.axis===axis&&v.layer===layer)?.[0];
 if(!face)return null;
 return `${face}${Math.sign(direction)===-layer?'':"'"}`;
}
export function generateScramble(length=22,random:()=>number=Math.random):MoveToken[]{
 const faces=['R','L','U','D','F','B'];const axis=(s:string)=>'RL'.includes(s)?'x':'UD'.includes(s)?'y':'z';
 const suffix=['',"'",'2'];const moves:string[]=[];
 for(let i=0;i<length;i++){
  const permitted=faces.filter(f=>!moves.length||axis(f)!==axis(moves[moves.length-1][0]));
  const face=permitted[Math.floor(random()*permitted.length)];moves.push(face+suffix[Math.floor(random()*suffix.length)]);
 }
 return moves;
}
export function undoPlayMove(history:MoveToken[]):MoveToken|null{return history.length?inverse(history[history.length-1]):null;}
export function parseSavedHistory(value:unknown):MoveToken[]{
 if(!Array.isArray(value)||value.length>10000||!value.every(v=>typeof v==='string'))return [];
 try{return parseTokens(value.join(' '));}catch{return [];}
}
