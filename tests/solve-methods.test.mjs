import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SOLVE_METHODS,DEFAULT_SOLVE_METHOD,getSolveMethod,isSolveMethodId,methodText,stageExamples,loadSolveMethod,saveSolveMethod} from '../src/lib/solveMethods.ts';
import {LEARN_LESSONS} from '../src/lib/learn.ts';
import {EN_LESSONS} from '../src/lib/learn.en.ts';
import {lessonSnapshots,stageTargetState} from '../src/lib/lessonScenario.ts';
import {SOLVED} from '../src/lib/cube.ts';

test('every advertised method has a unique id, proper stage order and VI/EN copy',()=>{
 assert.equal(DEFAULT_SOLVE_METHOD,'beginner');
 assert.deepEqual(SOLVE_METHODS.map(m=>m.id),['beginner','cfop-2look','cfop','roux','zz']);
 const ids=new Set();
 for(const m of SOLVE_METHODS){
  assert.ok(!ids.has(m.id),m.id);
  ids.add(m.id);
  assert.equal(getSolveMethod(m.id),m);
  assert.ok(isSolveMethodId(m.id));
  assert.ok(m.resourceUrl.startsWith('https://'));
  for(const key of ['subtitle','summary','keyIdea']){
   assert.ok(methodText(m[key],'vi').length>15);
   assert.ok(methodText(m[key],'en').length>15);
  }
  assert.ok(m.stages.length>=3&&m.stages.length<=7);
  const stageIds=new Set();
  for(const s of m.stages){
   assert.ok(!stageIds.has(s.id),`${m.id} has duplicated ${s.id}`);
   stageIds.add(s.id);
   for(const key of ['title','goal','recognize','hold','done']){
    assert.ok(s[key].vi.length>5, `${m.id} / ${s.id}: VI ${key}`);
    assert.ok(s[key].en.length>5, `${m.id} / ${s.id}: EN ${key}`);
   }
   assert.ok(s.actions.length>0,`${m.id} / ${s.id}: no instructions`);
   assert.ok(s.actions.every(a=>a.vi.length>10&&a.en.length>10),`${m.id} / ${s.id}: missing translations`);
  }
 }
 assert.equal(isSolveMethodId('not-a-method'),false);
 assert.throws(()=>getSolveMethod('bogus'),/Unknown/);
});
test('Beginner reproduces all seven stages with the same original IDs and 3D examples',()=>{
 const beginner=getSolveMethod('beginner');
 assert.deepEqual(beginner.stages.map(s=>s.id),LEARN_LESSONS.map(s=>s.id));
 for(const stage of beginner.stages){
  assert.deepEqual(stageExamples(stage.example).map(c=>c.id),
   LEARN_LESSONS.find(l=>l.id===stage.id).cases.map(c=>c.id));
 }
});
test('Two-look CFOP is not falsely merged with full OLL/PLL or Roux/ZZ',()=>{
 const two=getSolveMethod('cfop-2look'),full=getSolveMethod('cfop');
 assert.deepEqual(two.stages.map(s=>s.id),['cross','f2l','oll-edges','oll-corners','pll-corners','pll-edges']);
 assert.deepEqual(full.stages.map(s=>s.id),['cross','f2l','oll','pll']);
 assert.deepEqual(getSolveMethod('roux').stages.map(s=>s.id),['first-block','second-block','cmll','lse']);
 assert.deepEqual(getSolveMethod('zz').stages.map(s=>s.id),['eoline','zzf2l','last-layer']);
 assert.ok(getSolveMethod('roux').stages.every(s=>!s.example));
 assert.ok(getSolveMethod('zz').stages.every(s=>!s.example));
 assert.equal(full.learningOnly,true);
 assert.equal(getSolveMethod('roux').learningOnly,true);
 assert.equal(getSolveMethod('zz').learningOnly,true);
 assert.match(full.stages.find(s=>s.id==='oll').note.en,/not implemented/i);
 assert.match(full.stages.find(s=>s.id==='pll').note.en,/not.*complete/i);
});
test('every method stage example references a real VI/EN case with matching move sequence',()=>{
 for(const method of SOLVE_METHODS)for(const stage of method.stages){
  if(!stage.example)continue;
  const lesson=LEARN_LESSONS.find(l=>l.id===stage.example.lessonId);
  assert.ok(lesson,`${method.id} / ${stage.id}: unknown stage`);
  const english=EN_LESSONS.find(l=>l.id===lesson.id);
  assert.ok(english);
  for(const sample of stageExamples(stage.example)){
   const translated=english.cases.find(c=>c.id===sample.id);
   assert.equal(translated?.algorithm,sample.algorithm);
   const states=lessonSnapshots(lesson.id,sample.algorithm);
   assert.equal(states.at(-1),stageTargetState(lesson.id),sample.id);
   if(lesson.id!=='yellow-edges')assert.notEqual(states.at(-1),SOLVED);
  }
 }
 assert.throws(()=>stageExamples({lessonId:'not-here'}),/Unknown/);
 assert.throws(()=>stageExamples({lessonId:'yellow-cross',caseIds:['invalid-case']}),/Unknown/);
});
test('saved method selection has safe default and ignores invalid IDs',()=>{
 const old=globalThis.localStorage;
 const data=new Map();
 globalThis.localStorage={getItem:key=>data.get(key)??null,setItem:(key,val)=>data.set(key,val)};
 try{
  assert.equal(loadSolveMethod(),'beginner');
  saveSolveMethod('roux');assert.equal(loadSolveMethod(),'roux');
  data.set('cubemind:solve-method-v1','untrusted');
  assert.equal(loadSolveMethod(),'beginner');
 }finally{
  if(old===undefined)delete globalThis.localStorage;
  else globalThis.localStorage=old;
 }
});
