import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SOLVED,parseMoves,invertMoves,validateCubies,basicFaceletValidation,moveInfo} from '../src/lib/cube.ts';
import {newSession,guideReducer} from '../src/lib/guide.ts';
test('parse & invert every face plus prime/double',()=>{
 const moves=parseMoves("U D' L2 R F B");
 assert.deepEqual(invertMoves(moves),["B'","F'","R'","L2","D","U'"]);
 assert.throws(()=>parseMoves('X R'),/không hợp lệ/);
 assert.equal(moveInfo('F2').degrees,180);
});
test('basic sticker validation',()=>{
 assert.deepEqual(basicFaceletValidation(SOLVED),[]);
 const bad=SOLVED.slice(0,10)+'U'+SOLVED.slice(11);
 assert.ok(basicFaceletValidation(bad).length>0);
});
test('cubie parity & orientation',()=>{
 const state={cp:[0,1,2,3,4,5,6,7],co:[0,0,0,0,0,0,0,0],ep:[0,1,2,3,4,5,6,7,8,9,10,11],eo:Array(12).fill(0)};
 assert.deepEqual(validateCubies(state),[]);
 assert.ok(validateCubies({...state,co:[1,...state.co.slice(1)]}).length>0);
 assert.ok(validateCubies({...state,ep:[1,0,...state.ep.slice(2)]}).length>0);
});
test('demo never commits, repeated confirmation blocked',()=>{
 let s=newSession(SOLVED,['R','U'],[SOLVED,'snap1','snap2']);
 s=guideReducer(s,{type:'START'});s=guideReducer(s,{type:'START_DEMO'});
 assert.equal(s.confirmedCount,0);
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,0);
 s=guideReducer(s,{type:'DEMO_FINISH'});
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,1);
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,1);
});
test('physical undo only after confirmation',()=>{
 let s=newSession(SOLVED,['R'],[SOLVED,'snap1']);s=guideReducer(s,{type:'START'});
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,1);
 assert.equal(s.status,'COMPLETED');
});
test('undo does not change progress before physical confirmation',()=>{
 let s=newSession(SOLVED,['R','U'],[SOLVED,'snap1','snap2']);
 s=guideReducer(s,{type:'START'});s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});
 s=guideReducer(s,{type:'UNDO_REQUEST'});assert.equal(s.confirmedCount,1);
 s=guideReducer(s,{type:'UNDO_CANCEL'});assert.equal(s.confirmedCount,1);
 s=guideReducer(s,{type:'UNDO_REQUEST'});s=guideReducer(s,{type:'UNDO_CONFIRMED'});
 assert.equal(s.confirmedCount,0);
});
test('reported physical uncertainty prevents confirmation',()=>{
 let s=newSession(SOLVED,['R','U'],[SOLVED,'snap1','snap2']);
 s=guideReducer(s,{type:'START'});s=guideReducer(s,{type:'REPORT_WRONG'});
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,0);
 s=guideReducer(s,{type:'RECOVERY_RESOLVED'});
 s=guideReducer(s,{type:'CONFIRM_MOVE',index:0});assert.equal(s.confirmedCount,1);
});
