import {test} from 'node:test';
import assert from 'node:assert/strict';
import Cube from 'cubejs';
import {LEARN_LESSONS} from '../src/lib/learn.ts';
import {EN_LESSONS} from '../src/lib/learn.en.ts';
import {lessonPattern,movedTopPieces,orientedTopCount,headlights,correctTopPieces} from '../src/lib/lessonDiagrams.ts';
import {lessonSnapshots,lessonSetupMoves,stageTargetState} from '../src/lib/lessonScenario.ts';
import {SOLVED,parseMoves} from '../src/lib/cube.ts';

const lesson=id=>LEARN_LESSONS.find(l=>l.id===id);
const example=id=>LEARN_LESSONS.flatMap(l=>l.cases).find(c=>c.id===id);
const stageOf=id=>LEARN_LESSONS.find(l=>l.cases.some(c=>c.id===id)).id;
const before=id=>lessonPattern(example(id),stageOf(id)).before;
const after=id=>lessonPattern(example(id),stageOf(id)).after;
const sideBase=[9,18,36,45];
const bottomCross=s=>[28,30,32,34].every(i=>s[i]==='D')&&sideBase.every(b=>s[b+7]===SOLVED[b+7]);
const firstLayer=s=>s.slice(27,36)==='D'.repeat(9)&&sideBase.every(b=>[6,7,8].every(i=>s[b+i]===SOLVED[b+i]));
const twoLayersSolved=s=>firstLayer(s)&&sideBase.every(b=>[3,4,5].every(i=>s[b+i]===SOLVED[b+i]));
const yellowCross=s=>twoLayersSolved(s)&&[1,3,4,5,7].every(i=>s[i]==='U');
const yellowFace=s=>twoLayersSolved(s)&&s.slice(0,9)==='U'.repeat(9);
const yellowCorners=s=>yellowFace(s)&&correctTopPieces(s,'corner').length===4;
const goalReached=(stage,s)=>({
 'white-cross':()=>bottomCross(s),
 'white-corners':()=>firstLayer(s),
 'middle-edges':()=>twoLayersSolved(s),
 'yellow-cross':()=>yellowCross(s),
 'yellow-face':()=>yellowFace(s),
 'yellow-corners':()=>yellowCorners(s),
 'yellow-edges':()=>s===SOLVED,
}[stage]());

test('all lesson translations cover each case and holding/result instructions',()=>{
 assert.equal(LEARN_LESSONS.length,7);
 for(let i=0;i<7;i++){
  const vi=LEARN_LESSONS[i],en=EN_LESSONS[i];
  assert.equal(vi.id,en.id);
  assert.deepEqual(vi.cases.map(x=>x.id),en.cases.map(x=>x.id));
  for(let j=0;j<vi.cases.length;j++){
   const c=vi.cases[j],d=en.cases[j];
   assert.equal(c.algorithm,d.algorithm,`misaligned formula: ${c.id}`);
   if(i>=3){
    for(const field of ['title','when','hold','explanation','expected']){
      assert.ok(typeof c[field]==='string'&&c[field].length>8,`missing VI ${c.id}.${field}`);
      assert.ok(typeof d[field]==='string'&&d[field].length>8,`missing EN ${c.id}.${field}`);
    }
   }
  }
 }
});
test('3D model and case diagram use exactly the same stage-scoped before/after snapshots',()=>{
 for(const stage of LEARN_LESSONS)for(const c of stage.cases){
   const states=lessonSnapshots(stage.id,c.algorithm);
   const moves=parseMoves(c.algorithm);
   const view=lessonPattern(c,stage.id);
   assert.equal(states.length,moves.length+1,c.id);
   assert.equal(view.before,states[0],c.id);
   assert.equal(view.after,states.at(-1),c.id);
   const cube=new Cube();
   const setup=lessonSetupMoves(stage.id,c.algorithm);
   if(setup.length)cube.move(setup.join(' '));
   assert.equal(cube.asString(),view.before,`3D starts in wrong state for ${c.id}`);
   for(let k=0;k<moves.length;k++){
     cube.move(moves[k]);
     assert.equal(cube.asString(),states[k+1],`3D move ${k+1} differs from illustration ${c.id}`);
   }
   assert.equal(cube.asString(),stageTargetState(stage.id),`wrong target for ${c.id}`);
 }
});
test('a lesson stops when its own goal is reached, not when the whole cube is solved',()=>{
 for(const [index,stage] of LEARN_LESSONS.entries()){
  const target=stageTargetState(stage.id);
  assert.equal(goalReached(stage.id,target),true,`stage goal incomplete: ${stage.id}`);
  assert.equal(target===SOLVED,index===6,`only final stage should solve the complete cube: ${stage.id}`);
  for(const c of stage.cases){
   const states=lessonSnapshots(stage.id,c.algorithm),beforeState=states[0],final=states.at(-1);
   assert.equal(goalReached(stage.id,final),true,`case does not finish stage: ${c.id}`);
   if(index<6)assert.notEqual(final,SOLVED,`stage ${stage.id} incorrectly solves the whole cube`);
   assert.equal(goalReached(stage.id,beforeState),false,`lesson starts already completed: ${c.id}`);
   if(index>0)assert.equal(goalReached(LEARN_LESSONS[index-1].id,beforeState),true,`prior stage damaged: ${c.id}`);
  }
 }
});
test('last four stages preserve two solved layers, while stage 6 keeps yellow up',()=>{
 for(const stage of LEARN_LESSONS.slice(3))for(const c of stage.cases){
  const states=lessonSnapshots(stage.id,c.algorithm);
  assert.ok(states.every(twoLayersSolved),`lower layers broken in ${c.id}`);
  if(stage.id==='yellow-face')assert.equal(orientedTopCount(states[0],'edge'),4,`cross broken: ${c.id}`);
  if(['yellow-corners','yellow-edges'].includes(stage.id)){
   assert.equal(states[0].slice(0,9),'U'.repeat(9),`initial yellow top broken: ${c.id}`);
   assert.equal(states.at(-1).slice(0,9),'U'.repeat(9),`final yellow top broken: ${c.id}`);
  }
 }
});
test('yellow cross pattern cards retain horizontal line, upper-left L and dot',()=>{
 assert.equal(orientedTopCount(before('yellow-dot'),'edge'),0);
 for(const id of ['yellow-line','yellow-l'])assert.equal(orientedTopCount(before(id),'edge'),2);
 const line=before('yellow-line'),l=before('yellow-l');
 assert.deepEqual([line[1]==='U',line[3]==='U',line[5]==='U',line[7]==='U'],[false,true,true,false]);
 assert.deepEqual([l[1]==='U',l[3]==='U',l[5]==='U',l[7]==='U'],[true,true,false,false]);
 assert.equal(orientedTopCount(after('yellow-line'),'corner')<4,true,'stage 4 should leave yellow corners undone');
});
test('yellow corner orientation includes 0, 1 and 2 upward-facing yellow corners',()=>{
 assert.equal(orientedTopCount(before('sune'),'corner'),1);
 assert.equal(orientedTopCount(before('anti-sune'),'corner'),1);
 assert.equal(orientedTopCount(before('two-yellow-corners'),'corner'),2);
 assert.equal(orientedTopCount(before('zero-yellow-corners'),'corner'),0);
});
test('corner cases preserve headlights and correctly cycle/diagonally swap corners',()=>{
 const a=before('aa-corner-cycle'),y=before('diagonal-corners');
 assert.deepEqual(headlights(a),['B']);
 assert.deepEqual(headlights(y),[]);
 assert.deepEqual(correctTopPieces(a,'corner'),['ULF']);
 assert.equal(movedTopPieces(a,after('aa-corner-cycle'),'corner').length,3);
 assert.equal(movedTopPieces(y,after('diagonal-corners'),'corner').length,2);
});
test('edge cases have correct fixed edge and H/Z pair swap path',()=>{
 for(const id of ['ua','ub']){
   assert.deepEqual(correctTopPieces(before(id),'edge'),['UB']);
   assert.equal(movedTopPieces(before(id),after(id),'edge').length,3);
 }
 for(const id of ['h-edges','z-edges']){
   assert.deepEqual(correctTopPieces(before(id),'edge'),[]);
   assert.equal(movedTopPieces(before(id),after(id),'edge').length,4);
 }
 const edges=id=>new Set(movedTopPieces(before(id),after(id),'edge').map(p=>[p.from,p.to].sort().join(':')));
 assert.deepEqual(edges('h-edges'),new Set(['UB:UF','UL:UR']));
 assert.deepEqual(edges('z-edges'),new Set(['UF:UR','UB:UL']));
});
