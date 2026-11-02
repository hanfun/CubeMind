import type {SolveSession} from './guide';
export type SolverRequest={kind:'scramble';scramble:string}|{kind:'facelets';facelets:string};
type SolverReply={ok:true;facelets:string;moves:string[];snapshots:string[]}|{ok:false;error:string};
export function solveInWorker(request:SolverRequest,onProgress?:(msg:string)=>void):Promise<SolveSession>{
 const worker=new Worker(new URL('../workers/solver.worker.ts',import.meta.url),{type:'module'});
 return new Promise((resolve,reject)=>{
   const timeout=window.setTimeout(()=>{worker.terminate();reject(new Error('Tính toán quá lâu. Hãy thử lại hoặc kiểm tra dữ liệu.'));},120000);
   worker.onmessage=(ev:MessageEvent<SolverReply|{progress:string}>)=>{
     const reply=ev.data;
     if('progress'in reply){onProgress?.(reply.progress);return;}
     window.clearTimeout(timeout);worker.terminate();
     if(!reply.ok){reject(new Error(reply.error));return;}
     import('./guide').then(({newSession})=>resolve(newSession(reply.facelets,reply.moves,reply.snapshots))).catch(reject);
   };
   worker.onerror=err=>{window.clearTimeout(timeout);worker.terminate();reject(new Error(err.message||'Worker không hoạt động.'));};
   worker.postMessage(request);
 });
}
