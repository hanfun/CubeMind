import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FACES,SOLVED} from '../src/lib/cube.ts';
import {LEARN_LESSONS} from '../src/lib/learn.ts';
import {stageFaceView,mainStickers,focusedStickerCount} from '../src/lib/lessonFaceView.ts';
import {lessonSnapshots,stageTargetState} from '../src/lib/lessonScenario.ts';

test('white-stage drawings look at D, F2L looks at F and last-layer drawings look at U',()=>{
 assert.deepEqual(LEARN_LESSONS.map(s=>stageFaceView(s.id).face),['D','D','F','U','U','U','U']);
 for(const stage of LEARN_LESSONS){
  const view=stageFaceView(stage.id);
  assert.equal(new Set(view.sideStrips.map(s=>s.orientation)).size,4);
  assert.equal(view.sideStrips.length,4);
  for(const strip of view.sideStrips){
   const offset=FACES.indexOf(strip.face)*9;
   assert.equal(strip.indices.length,3);
   assert.ok(strip.indices.every(i=>i>=offset&&i<offset+9),`Incorrect strip ${stage.id} / ${strip.face}`);
  }
  for(const language of ['vi','en']){
   assert.ok(view.label[language].length>8);
   assert.ok(view.countLabel[language].length>3);
  }
  const target=stageTargetState(stage.id);
  const face=mainStickers(target,stage.id);
  assert.equal(face.length,9);
  if(view.focusColor!==null){
   assert.equal(focusedStickerCount(target,stage.id),view.focusIndices.length,`Incomplete focus for ${stage.id}`);
  }else{
   assert.equal(focusedStickerCount(target,stage.id),0);
  }
  for(const c of stage.cases){
   const states=lessonSnapshots(stage.id,c.algorithm);
   assert.equal(mainStickers(states[0],stage.id).length,9);
   assert.equal(states.at(-1),target);
   if(stage.id!=='yellow-edges')assert.notEqual(target,SOLVED);
  }
 }
 assert.throws(()=>stageFaceView('made-up'),/Unknown/);
 assert.throws(()=>mainStickers('short','white-cross'),/54/);
});
test('front and bottom viewing directions agree with cube facelet offsets',()=>{
 const front=stageFaceView('middle-edges');
 assert.deepEqual(front.sideStrips.map(s=>s.face),['U','R','D','L']);
 assert.deepEqual(front.sideStrips[0].indices,[6,7,8]);
 assert.deepEqual(front.sideStrips[1].indices,[9,12,15]);
 assert.deepEqual(front.sideStrips[2].indices,[27,28,29]);
 assert.deepEqual(front.sideStrips[3].indices,[38,41,44]);
 const bottom=stageFaceView('white-cross');
 assert.deepEqual(bottom.sideStrips.map(s=>s.face),['F','R','B','L']);
 assert.deepEqual(bottom.sideStrips[0].indices,[24,25,26]);
 assert.deepEqual(bottom.sideStrips[2].indices,[53,52,51]);
 assert.equal(mainStickers(SOLVED,'white-cross'),'D'.repeat(9));
 assert.equal(mainStickers(SOLVED,'yellow-cross'),'U'.repeat(9));
});
