import type {MoveToken} from './cube';
export type GuideStatus = 'READY'|'WAIT_CONFIRM'|'DEMONSTRATING'|'RECOVERY'|'UNDO_WAIT_CONFIRM'|'COMPLETED';
export type SolveSession={
 id:string; initialFacelets:string; solution:MoveToken[]; snapshots:string[];
 confirmedCount:number; status:GuideStatus; uncertain:boolean; updatedAt:number;
};
export type GuideAction=
 |{type:'START'}|{type:'START_DEMO'}|{type:'DEMO_FINISH'}|{type:'CONFIRM_MOVE';index:number}
 |{type:'REPORT_WRONG'}|{type:'RECOVERY_RESOLVED'}|{type:'UNDO_REQUEST'}|{type:'UNDO_CONFIRMED'}
 |{type:'UNDO_CANCEL'}|{type:'FALSE_CONFIRM_CORRECTION'}|{type:'RESTORE_RECONFIRMED'};
export function newSession(initialFacelets:string, solution:MoveToken[],snapshots:string[]):SolveSession {
 if(snapshots.length!==solution.length+1||snapshots[0]!==initialFacelets)throw new Error('Snapshot không phù hợp lời giải.');
 return {id:typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():`session-${Date.now()}`,initialFacelets,solution:[...solution],snapshots:[...snapshots],confirmedCount:0,status:solution.length?'READY':'COMPLETED',uncertain:false,updatedAt:Date.now()};
}
export function guideReducer(s:SolveSession,a:GuideAction):SolveSession {
 const upd=(part:Partial<SolveSession>)=>({...s,...part,updatedAt:Date.now()});
 switch(a.type){
  case 'START':return s.status==='READY'?upd({status:'WAIT_CONFIRM'}):s;
  case 'START_DEMO':return s.status==='WAIT_CONFIRM'&&!s.uncertain&&s.confirmedCount<s.solution.length?upd({status:'DEMONSTRATING'}):s;
  case 'DEMO_FINISH':return s.status==='DEMONSTRATING'?upd({status:'WAIT_CONFIRM'}):s;
  case 'CONFIRM_MOVE':{
   if(s.status!=='WAIT_CONFIRM'||s.uncertain||a.index!==s.confirmedCount||s.confirmedCount>=s.solution.length)return s;
   const n=s.confirmedCount+1;return upd({confirmedCount:n,status:n===s.solution.length?'COMPLETED':'WAIT_CONFIRM'});
  }
  case 'REPORT_WRONG':return s.status==='WAIT_CONFIRM'||s.status==='DEMONSTRATING'?upd({status:'RECOVERY',uncertain:true}):s;
  case 'RECOVERY_RESOLVED':return s.status==='RECOVERY'?upd({status:'WAIT_CONFIRM',uncertain:false}):s;
  case 'UNDO_REQUEST':return s.status==='WAIT_CONFIRM'&&s.confirmedCount>0?upd({status:'UNDO_WAIT_CONFIRM'}):s;
  case 'UNDO_CONFIRMED':return s.status==='UNDO_WAIT_CONFIRM'?upd({confirmedCount:s.confirmedCount-1,status:'WAIT_CONFIRM'}):s;
  case 'UNDO_CANCEL':return s.status==='UNDO_WAIT_CONFIRM'?upd({status:'WAIT_CONFIRM'}):s;
  case 'FALSE_CONFIRM_CORRECTION':return s.status==='RECOVERY'&&s.confirmedCount>0?upd({confirmedCount:s.confirmedCount-1,status:'WAIT_CONFIRM',uncertain:false}):s;
  case 'RESTORE_RECONFIRMED':return s.uncertain?upd({uncertain:false,status:s.confirmedCount===s.solution.length?'COMPLETED':'WAIT_CONFIRM'}):s;
  default:return s;
 }
}
const KEY='rubik-studio-session-v1';
export function saveSession(s:SolveSession):void {try{localStorage.setItem(KEY,JSON.stringify(s));}catch{ /* private mode */ }}
export function clearSession():void {try{localStorage.removeItem(KEY);}catch{/* nothing */}}
export function loadSession():SolveSession|null {try{
 const raw=localStorage.getItem(KEY);if(!raw)return null;const s=JSON.parse(raw) as SolveSession;
 if(!Array.isArray(s.solution)||!Array.isArray(s.snapshots)||s.snapshots.length!==s.solution.length+1||!Number.isInteger(s.confirmedCount)||s.confirmedCount<0||s.confirmedCount>s.solution.length)return null;
 return {...s,status:s.confirmedCount===s.solution.length?'COMPLETED':'RECOVERY',uncertain:s.confirmedCount!==s.solution.length};
 }catch{return null;}}
