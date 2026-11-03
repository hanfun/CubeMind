import {test} from 'node:test';
import assert from 'node:assert/strict';
import {focusTransform,quadCentre,scanReviewWarnings,unstableStickers} from '../src/lib/scanUx.ts';
import {initialQuads,SCAN_FACES} from '../src/lib/twoAngle.ts';

test('selected scanner face has stable normalized focus',()=>{
 for(const angle of [0,1]){
  for(const face of SCAN_FACES[angle]){
   const center=quadCentre(initialQuads(angle)[face]);
   assert.ok(center.x>0&&center.x<1&&center.y>0&&center.y<1);
   const transform=focusTransform(center,2);
   assert.match(transform,/translate\(.*\) scale\(2\)/);
   // The center of the face moves to center of a unit viewport after translation.
   const tx=(.5-center.x)*2,ty=(.5-center.y)*2;
   assert.ok(Math.abs((center.x-.5)*2+.5+tx-.5)<1e-9);
   assert.ok(Math.abs((center.y-.5)*2+.5+ty-.5)<1e-9);
  }
 }
 assert.equal(focusTransform({x:.5,y:.5},1),'translate(0%, 0%) scale(1)');
 assert.throws(()=>focusTransform({x:0,y:0},0.5),/zoom/);
});
test('scanner warns about high-variance stickers, without asserting recognition',()=>{
 const face={pixels:Array.from({length:9},()=>[200,10,10]),noise:[0,0,0,21,0,0,Infinity,0,0]};
 assert.deepEqual(unstableStickers(face),[3,6]);
 assert.deepEqual(unstableStickers(undefined),[]);
 assert.deepEqual(scanReviewWarnings({U:face},['U'],'Ảnh 1'),['Ảnh 1 · U: 2 ô màu có độ đồng đều thấp, cần kiểm tra lại.']);
 assert.deepEqual(scanReviewWarnings({U:face},['U'],'Photo 1',18,'en'),['Photo 1 · U: 2 stickers have uneven colour; please review.']);
});
