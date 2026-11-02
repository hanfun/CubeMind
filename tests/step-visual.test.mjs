import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEARN_LESSONS} from '../src/lib/learn.ts';
import {EN_LESSONS} from '../src/lib/learn.en.ts';
import {algorithmSnapshots,faceGrid,viewForMove} from '../src/lib/stepVisual.ts';
import {SOLVED,FACES,parseMoves} from '../src/lib/cube.ts';

test('every translated lesson preserves exactly the same algorithms and case IDs',()=>{
 assert.equal(LEARN_LESSONS.length,EN_LESSONS.length);
 for(let i=0;i<LEARN_LESSONS.length;i++){
   const vi=LEARN_LESSONS[i],en=EN_LESSONS[i];
   assert.equal(vi.id,en.id);assert.equal(vi.cases.length,en.cases.length);
   for(let j=0;j<vi.cases.length;j++){
     assert.equal(vi.cases[j].id,en.cases[j].id);
     assert.equal(vi.cases[j].algorithm,en.cases[j].algorithm);
     assert.ok(en.cases[j].title&&en.cases[j].when&&en.cases[j].explanation);
   }
 }
});
test('all learning sequences have one exact 54-sticker snapshot per move and solve the sample',()=>{
 for(const lesson of LEARN_LESSONS)for(const sample of lesson.cases){
   const moves=parseMoves(sample.algorithm);
   const states=algorithmSnapshots(sample.algorithm);
   assert.equal(states.length,moves.length+1,sample.id);
   assert.ok(states.every(f=>f.length===54),sample.id);
   assert.equal(states.at(-1),SOLVED,sample.id);
   for(const face of FACES)assert.equal(faceGrid(states[0],face).length,9);
 }
});
test('illustrations use the correct viewing face and direction',()=>{
 assert.deepEqual([viewForMove('R').face,viewForMove('R').clockwise],['R',true]);
 assert.deepEqual([viewForMove("R'").face,viewForMove("R'").clockwise],['R',false]);
 assert.deepEqual([viewForMove('U2').degrees,viewForMove('U2').clockwise],[180,null]);
 assert.equal(viewForMove('B').en,'back face');
 assert.throws(()=>viewForMove('R U'),/exactly one/);
 assert.throws(()=>faceGrid('invalid','F'),/54/);
});
