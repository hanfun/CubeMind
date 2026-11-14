import {FACES,type Face} from './cube.ts';
import {TOP_SIDE_RING} from './lessonDiagrams.ts';

export type SideStrip={face:Face;indices:readonly number[];orientation:'top'|'right'|'bottom'|'left'};
export type StageFaceView={
 face:Face;
 sideStrips:readonly SideStrip[];
 focusIndices:readonly number[];
 focusColor:Face|null;
 label:{vi:string;en:string};
 countLabel:{vi:string;en:string};
};
/**
 * Educational 2D diagram viewing direction:
 * - D is seen from directly BELOW with F above it;
 * - F is seen head-on with U above;
 * - U is seen from directly ABOVE with B above it.
 * Facelets follow cubejs URFDLB ordering; never rotate stickers independently
 * of their physical cube state to make a teaching diagram look convenient.
 */
const SIDE_D:readonly SideStrip[]=[
 {face:'F',indices:[24,25,26],orientation:'top'},
 {face:'R',indices:[15,16,17],orientation:'right'},
 {face:'B',indices:[53,52,51],orientation:'bottom'},
 {face:'L',indices:[44,43,42],orientation:'left'},
];
const SIDE_F:readonly SideStrip[]=[
 {face:'U',indices:[6,7,8],orientation:'top'},
 {face:'R',indices:[9,12,15],orientation:'right'},
 {face:'D',indices:[27,28,29],orientation:'bottom'},
 {face:'L',indices:[38,41,44],orientation:'left'},
];
export const LESSON_FACE_VIEWS:Readonly<Record<string,StageFaceView>>={
 'white-cross':{
  face:'D',sideStrips:SIDE_D,focusIndices:[1,3,5,7],focusColor:'D',
  label:{vi:'Mặt D nhìn từ dưới · Trắng',en:'Face D from below · White'},
  countLabel:{vi:'cạnh trắng',en:'white edges'}
 },
 'white-corners':{
  face:'D',sideStrips:SIDE_D,focusIndices:[0,2,6,8],focusColor:'D',
  label:{vi:'Mặt D nhìn từ dưới · Trắng',en:'Face D from below · White'},
  countLabel:{vi:'góc trắng',en:'white corners'}
 },
 'middle-edges':{
  face:'F',sideStrips:SIDE_F,focusIndices:[3,5],focusColor:'F',
  label:{vi:'Mặt F nhìn từ trước',en:'Face F from the front'},
  countLabel:{vi:'cạnh giữa trước',en:'front middle edges'}
 },
 'yellow-cross':{
  face:'U',sideStrips:TOP_SIDE_RING,focusIndices:[1,3,5,7],focusColor:'U',
  label:{vi:'Mặt U nhìn từ trên · Vàng',en:'Face U from above · Yellow'},
  countLabel:{vi:'cạnh vàng',en:'yellow edges'}
 },
 'yellow-face':{
  face:'U',sideStrips:TOP_SIDE_RING,focusIndices:[0,2,6,8],focusColor:'U',
  label:{vi:'Mặt U nhìn từ trên · Vàng',en:'Face U from above · Yellow'},
  countLabel:{vi:'góc vàng',en:'yellow corners'}
 },
 'yellow-corners':{
  face:'U',sideStrips:TOP_SIDE_RING,focusIndices:[0,2,6,8],focusColor:null,
  label:{vi:'Mặt U nhìn từ trên · Vàng',en:'Face U from above · Yellow'},
  countLabel:{vi:'góc tầng cuối',en:'last-layer corners'}
 },
 'yellow-edges':{
  face:'U',sideStrips:TOP_SIDE_RING,focusIndices:[1,3,5,7],focusColor:null,
  label:{vi:'Mặt U nhìn từ trên · Vàng',en:'Face U from above · Yellow'},
  countLabel:{vi:'cạnh tầng cuối',en:'last-layer edges'}
 }
};
export function stageFaceView(stageId:string):StageFaceView{
 const view=LESSON_FACE_VIEWS[stageId];
 if(!view)throw new Error(`Unknown lesson stage ${stageId}`);
 return view;
}
export function mainStickers(state:string,stageId:string):string{
 if(state.length!==54)throw new Error('Expected exactly 54 stickers.');
 const view=stageFaceView(stageId);
 const offset=FACES.indexOf(view.face)*9;
 return state.slice(offset,offset+9);
}
export function focusedStickerCount(state:string,stageId:string):number{
 const view=stageFaceView(stageId);
 if(view.focusColor===null)return 0;
 const main=mainStickers(state,stageId);
 return view.focusIndices.filter(i=>main[i]===view.focusColor).length;
}
