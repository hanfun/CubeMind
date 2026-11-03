import {test} from 'node:test';
import assert from 'node:assert/strict';
import Cube from 'cubejs';
import {LEARN_LESSONS} from '../src/lib/learn.ts';
import {EN_LESSONS} from '../src/lib/learn.en.ts';
import {lessonPattern,movedTopPieces,orientedTopCount,headlights,correctTopPieces} from '../src/lib/lessonDiagrams.ts';
import {algorithmSnapshots} from '../src/lib/stepVisual.ts';
import {SOLVED} from '../src/lib/cube.ts';

const lesson=id=>LEARN_LESSONS.find(l=>l.id===id);
const example=id=>LEARN_LESSONS.flatMap(l=>l.cases).find(c=>c.id===id);
const before=id=>lessonPattern(example(id)).before;
const sideBase=[9,18,36,45];
const twoLayersSolved=s=>s.slice(27,36)==='D'.repeat(9)&&sideBase.every(b=>[3,4,5,6,7,8].every(i=>s[b+i]===SOLVED[b+i]));

test('all lesson translations cover each case and holding/expected-result instruction',()=>{
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
test('every last-four-stage case is an actual solvable last-layer example',()=>{
 for(const lesson of LEARN_LESSONS.slice(3)){
  for(const c of lesson.cases){
   const states=algorithmSnapshots(c.algorithm);
   const state=states[0];
   assert.equal(states.at(-1),SOLVED,`example does not solve: ${c.id}`);
   assert.ok(twoLayersSolved(state),`example scrambles the solved lower layers: ${c.id}`);
   const cube=new Cube();cube.move(c.algorithm);
   const afterDirect=cube.asString();
   if(['yellow-corners','yellow-edges'].includes(lesson.id)){
    assert.equal(state.slice(0,9),'U'.repeat(9),`yellow top not preserved: ${c.id}`);
    assert.equal(afterDirect.slice(0,9),'U'.repeat(9),`algorithm disrupts the yellow top: ${c.id}`);
   }
   if(lesson.id==='yellow-face')assert.equal(orientedTopCount(state,'edge'),4,`cross broken: ${c.id}`);
  }
 }
});
test('yellow cross examples show dot, horizontal line and upper-left L',()=>{
 assert.equal(orientedTopCount(before('yellow-dot'),'edge'),0);
 for(const id of ['yellow-line','yellow-l'])assert.equal(orientedTopCount(before(id),'edge'),2);
 const line=before('yellow-line'),L=before('yellow-l');
 assert.deepEqual([line[1]==='U',line[3]==='U',line[5]==='U',line[7]==='U'],[false,true,true,false]);
 assert.deepEqual([L[1]==='U',L[3]==='U',L[5]==='U',L[7]==='U'],[true,true,false,false]);
});
test('yellow corner orientation illustrates 0, 1 and 2 corners, not impossible 3',()=>{
 assert.equal(orientedTopCount(before('sune'),'corner'),1);
 assert.equal(orientedTopCount(before('anti-sune'),'corner'),1);
 assert.equal(orientedTopCount(before('two-yellow-corners'),'corner'),2);
 assert.equal(orientedTopCount(before('zero-yellow-corners'),'corner'),0);
});
test('corner permutation repairs headlights and diagonal cases while keeping yellow up',()=>{
 const a=before('aa-corner-cycle'),y=before('diagonal-corners');
 assert.deepEqual(headlights(a),['B']);
 assert.deepEqual(headlights(y),[]);
 assert.deepEqual(correctTopPieces(a,'corner'),['ULF']);
 assert.equal(movedTopPieces(a,SOLVED,'corner').length,3);
 assert.equal(movedTopPieces(y,SOLVED,'corner').length,2);
 // The old lesson used Niklas, which tilts yellow corner orientation. Never restore it here.
 const old=new Cube();old.move("U R U' L' U R' U' L");
 assert.notEqual(old.asString().slice(0,9),'U'.repeat(9));
});
test('Ua/Ub have one fixed back edge; H/Z arrows reflect their distinct swap pairs',()=>{
 for(const id of ['ua','ub']){
   assert.deepEqual(correctTopPieces(before(id),'edge'),['UB']);
   assert.equal(movedTopPieces(before(id),SOLVED,'edge').length,3);
 }
 for(const id of ['h-edges','z-edges']){
   assert.deepEqual(correctTopPieces(before(id),'corner').sort(),['UBL','UFR','ULF','URB'].sort());
   assert.deepEqual(correctTopPieces(before(id),'edge'),[]);
   assert.equal(movedTopPieces(before(id),SOLVED,'edge').length,4);
 }
 const edgePaths=id=>new Set(movedTopPieces(before(id),SOLVED,'edge').map(p=>[p.from,p.to].sort().join(':')));
 assert.deepEqual(edgePaths('h-edges'),new Set(['UB:UF','UL:UR']));
 assert.deepEqual(edgePaths('z-edges'),new Set(['UF:UR','UB:UL']));
});
