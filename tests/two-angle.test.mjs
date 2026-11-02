import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initialQuads,isUsableQuad,pointOnFace,stickerPoints,SCAN_FACES,sampleFace,classifyTwoAngles} from '../src/lib/twoAngle.ts';
import {SOLVED,FACES,basicFaceletValidation} from '../src/lib/cube.ts';
const COLORS={U:[245,245,245],R:[210,35,55],F:[40,170,82],D:[238,207,40],L:[238,117,29],B:[37,87,206]};
const SIZE=640;
function blank(){let data=new Uint8ClampedArray(SIZE*SIZE*4);for(let i=3;i<data.length;i+=4)data[i]=255;return {width:SIZE,height:SIZE,data};}
function colorRectangle(img,x,y,rgb){
 for(let yy=Math.max(0,y-12);yy<=Math.min(SIZE-1,y+12);yy++)for(let xx=Math.max(0,x-12);xx<=Math.min(SIZE-1,x+12);xx++){
  const i=(yy*SIZE+xx)*4;img.data[i]=rgb[0];img.data[i+1]=rgb[1];img.data[i+2]=rgb[2];
 }
}
function imagesForCube(facelets=SOLVED){
 const result={};
 for(const angle of [0,1]){
  const img=blank(),quads=initialQuads(angle);
  for(const face of SCAN_FACES[angle]){
   const offset=FACES.indexOf(face)*9;
   stickerPoints(quads[face]).forEach((p,i)=>colorRectangle(img,Math.round(p.x*(SIZE-1)),Math.round(p.y*(SIZE-1)),COLORS[facelets[offset+i]]));
  }
  for(const face of SCAN_FACES[angle])result[face]=sampleFace(img,quads[face]);
 }
 return result;
}
test('two guided scans cover every face exactly once',()=>{
 assert.deepEqual([...SCAN_FACES[0],...SCAN_FACES[1]].sort(),[...FACES].sort());
 for(const angle of [0,1])for(const face of SCAN_FACES[angle]){
   const quad=initialQuads(angle)[face];
   assert.equal(isUsableQuad(quad),true,face);
   assert.equal(stickerPoints(quad).length,9);
   assert.deepEqual(pointOnFace(quad,0,0),quad[0]);
 }
});
test('each face sample is in canonical U R F D L B order for both angle views',()=>{
 const samples=imagesForCube();
 for(const face of FACES)assert.equal(samples[face].pixels.length,9);
 const found=classifyTwoAngles(samples);
 assert.equal(found.facelets,SOLVED);
 assert.deepEqual(found.warnings,[]);
 assert.deepEqual(basicFaceletValidation(found.facelets),[]);
});
test('classification catches a physically wrong sticker despite correct center',()=>{
 const changed=SOLVED.split('');changed[0]='R';
 const found=classifyTwoAngles(imagesForCube(changed.join('')));
 assert.equal(found.facelets[0],'R');
 assert.ok(basicFaceletValidation(found.facelets).length);
});
test('misaligned quad is rejected rather than silently sampling',()=>{
 const q=initialQuads(0).U;
 assert.equal(isUsableQuad([q[0],q[2],q[1],q[3]]),false);
 assert.equal(isUsableQuad(q.map(p=>({...p,x:p.x+0.8}))),false);
});
