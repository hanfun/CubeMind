import type {Face} from './cube.ts';
import {FACES} from './cube.ts';
import {algorithmSnapshots} from './stepVisual.ts';
import type {LearnCase} from './learn.ts';

export type LayerPiece={name:string;indices:readonly number[];x:number;y:number};
export type PieceKind='corner'|'edge';
export type PiecePath={from:string;to:string;start:{x:number;y:number};end:{x:number;y:number}};
export const LAST_LAYER_CORNERS:readonly LayerPiece[]=[
 {name:'UBL',indices:[0,47,36],x:0,y:0},
 {name:'URB',indices:[2,11,45],x:2,y:0},
 {name:'UFR',indices:[8,9,20],x:2,y:2},
 {name:'ULF',indices:[6,38,18],x:0,y:2}
];
export const LAST_LAYER_EDGES:readonly LayerPiece[]=[
 {name:'UB',indices:[1,46],x:1,y:0},
 {name:'UR',indices:[5,10],x:2,y:1},
 {name:'UF',indices:[7,19],x:1,y:2},
 {name:'UL',indices:[3,37],x:0,y:1}
];

export const TOP_SIDE_RING:ReadonlyArray<{face:Face;indices:readonly number[];orientation:'top'|'right'|'bottom'|'left'}>=[
 {face:'B',indices:[47,46,45],orientation:'top'},
 {face:'R',indices:[11,10,9],orientation:'right'},
 {face:'F',indices:[18,19,20],orientation:'bottom'},
 {face:'L',indices:[36,37,38],orientation:'left'},
];
function identity(state:string,piece:LayerPiece):string{
 return piece.indices.map(index=>state[index]).sort().join('');
}
function validate(state:string){
 if(state.length!==54||![...state].every(c=>FACES.includes(c as Face)))throw new Error('Expected a valid 54-character cube state.');
}

/** Map physical piece identity before -> its destination after applying an algorithm. */
export function movedTopPieces(before:string,after:string,kind:PieceKind):PiecePath[]{
 validate(before);validate(after);
 const positions=kind==='corner'?LAST_LAYER_CORNERS:LAST_LAYER_EDGES;
 const next=new Map(positions.map(p=>[identity(after,p),p]));
 return positions.flatMap(piece=>{
  const dest=next.get(identity(before,piece));
  return dest&&dest.name!==piece.name?
   [{from:piece.name,to:dest.name,start:{x:piece.x,y:piece.y},end:{x:dest.x,y:dest.y}}]:[];
 });
}
export function lessonPattern(caseData:LearnCase):{before:string;after:string}{
 const snapshots=algorithmSnapshots(caseData.algorithm);
 return {before:snapshots[0],after:snapshots[snapshots.length-1]};
}
export function orientedTopCount(state:string,kind:PieceKind):number{
 validate(state);
 const pos=(kind==='corner'?LAST_LAYER_CORNERS:LAST_LAYER_EDGES);
 return pos.filter(p=>state[p.indices[0]]==='U').length;
}
export function headlights(state:string):Face[]{
 validate(state);
 const slots:{face:Face;a:number;b:number}[]=[
  {face:'F',a:18,b:20},{face:'R',a:9,b:11},
  {face:'B',a:45,b:47},{face:'L',a:36,b:38}
 ];
 return slots.filter(({a,b})=>state[a]===state[b]).map(x=>x.face);
}
export function correctTopPieces(state:string,kind:PieceKind):string[]{
 validate(state);
 const solved=FACES.map(f=>f.repeat(9)).join('');
 const pieces=kind==='corner'?LAST_LAYER_CORNERS:LAST_LAYER_EDGES;
 return pieces.filter(p=>identity(state,p)===identity(solved,p)).map(p=>p.name);
}
