/// <reference lib="webworker" />
import Cube from 'cubejs';
import {basicFaceletValidation,normalizeFacelets,parseMoves,validateCubies,SOLVED} from '../lib/cube';
import type {SolverRequest} from '../lib/solver';
const w=self as DedicatedWorkerGlobalScope;
w.onmessage=(ev:MessageEvent<SolverRequest>)=>{
 try{
  const req=ev.data;
  let cube:InstanceType<typeof Cube>;
  if(req.kind==='scramble'){
    const scramble=parseMoves(req.scramble);
    if(scramble.length===0)throw new Error('Hãy nhập ít nhất một bước trộn.');
    cube=new Cube();cube.move(scramble.join(' '));
  } else {
    const facelets=normalizeFacelets(req.facelets), problems=basicFaceletValidation(facelets);
    if(problems.length)throw new Error(problems.join('\n'));
    cube=Cube.fromString(facelets);
    const invalid=validateCubies(cube.toJSON());
    if(invalid.length)throw new Error(`Khối Rubik không thể giải:\n${invalid.join('\n')}`);
  }
  const facelets=cube.asString();
  if(cube.isSolved()){
    w.postMessage({ok:true,facelets,moves:[],snapshots:[facelets]});return;
  }
  w.postMessage({progress:'Đang khởi tạo bảng tìm lời giải…'});
  Cube.initSolver();
  w.postMessage({progress:'Đang tính và xác minh các bước giải…'});
  const moves=parseMoves(cube.solve());
  if(moves.length===0)throw new Error('Solver không tìm được lời giải.');
  const snapshots=[facelets];
  for(const m of moves){cube.move(m);snapshots.push(cube.asString());}
  if(!cube.isSolved()||cube.asString()!==SOLVED)throw new Error('Xác minh thất bại: các bước không đưa khối về trạng thái hoàn chỉnh.');
  w.postMessage({ok:true,facelets,moves,snapshots});
 }catch(e){w.postMessage({ok:false,error:e instanceof Error?e.message:'Lỗi không xác định trong solver.'});}
};
