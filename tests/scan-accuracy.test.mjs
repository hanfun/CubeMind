import {test} from 'node:test';
import assert from 'node:assert/strict';
import {assignBalancedColors} from '../src/lib/scanAccuracy.ts';
import {pointOnFace} from '../src/lib/twoAngle.ts';
const faces=['U','R','F','D','L','B'];
test('global assignment balances colours and flags forced choices',()=>{
 const refs=Object.fromEntries(faces.map((f,i)=>[f,[i*25,0,0]]));
 const items=faces.flatMap((face,i)=>Array.from({length:8},(_,cell)=>({face,cell,lab:[i*25,0,0],noise:0})));
 // One colour reading lies closer to the wrong centre; global constraint restores 8/colour.
 items[0].lab=[25,0,0];
 const res=assignBalancedColors(items,refs);
 const counts=Object.fromEntries(faces.map(f=>[f,0]));
 for(const c of res.assignments)counts[c.color]++;
 assert.deepEqual(Object.values(counts),Array(6).fill(8));
 assert.ok(res.forced>=1);
 assert.ok(res.ambiguous>=1);
});
test('homography maps all corners and square centre',()=>{
 const q=[{x:.16,y:.08},{x:.84,y:.12},{x:.76,y:.88},{x:.24,y:.80}];
 for(const [i,uv] of [[0,[0,0]],[1,[1,0]],[2,[1,1]],[3,[0,1]]]){
   const p=pointOnFace(q,...uv);
   assert.ok(Math.abs(p.x-q[i].x)<1e-7&&Math.abs(p.y-q[i].y)<1e-7);
 }
 const p=pointOnFace(q,.5,.5);
 assert.ok(p.x>.2&&p.x<.8&&p.y>.2&&p.y<.8);
});
