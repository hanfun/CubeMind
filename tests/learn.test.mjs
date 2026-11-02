import {test} from 'node:test';
import assert from 'node:assert/strict';
import {NOTATION,LEARN_LESSONS,findLearnLesson,getLearnCase,getLearnMoves,sampleInitialSetup,notationDescription} from '../src/lib/learn.ts';
import {invertMoves,parseMoves} from '../src/lib/cube.ts';

test('Vietnamese glossary contains each of six faces',()=>{
 assert.deepEqual(NOTATION.map(n=>n.face),['U','D','L','R','F','B']);
 assert.match(notationDescription("R'"),/ngược chiều/);
 assert.match(notationDescription('F2'),/180 độ/);
});
test('seven stages have complete Vietnamese explanations',()=>{
 assert.equal(LEARN_LESSONS.length,7);
 assert.equal(new Set(LEARN_LESSONS.map(l=>l.id)).size,7);
 for(const lesson of LEARN_LESSONS){
  assert.ok(lesson.goal&&lesson.check&&lesson.title);
  assert.ok(lesson.instructions.length>=3);
  assert.ok(lesson.cases.length);
  assert.equal(findLearnLesson(lesson.id),lesson);
 }
});
test('all learning cases have valid move notations and unique ids',()=>{
 const ids=[];
 for(const lesson of LEARN_LESSONS){
  for(const example of lesson.cases){
   const moves=getLearnMoves(example);
   assert.ok(moves.length>0);
   assert.deepEqual(parseMoves(example.algorithm),moves);
   assert.deepEqual(sampleInitialSetup(example).split(' ').slice(1),invertMoves(moves));
   assert.equal(getLearnCase(lesson.id,example.id),example);
   ids.push(example.id);
  }
 }
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(getLearnCase('missing','missing'),undefined);
});
