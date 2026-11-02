import {test} from 'node:test';
import assert from 'node:assert/strict';
import {analyzeImageQuality,photographQuality,validateFileMetadata,IMAGE_FILE_LIMIT} from '../src/lib/imageInput.ts';

function createImage(width,height,pattern){
  const data=new Uint8ClampedArray(width*height*4);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*4;
    const color=pattern(x,y);
    data[i]=color[0];data[i+1]=color[1];data[i+2]=color[2];data[i+3]=255;
  }
  return {width,height,data};
}
test('reject unsupported image formats, empty and oversized uploads',()=>{
  assert.ok(validateFileMetadata({name:'evil.svg',type:'image/svg+xml',size:30}).length);
  assert.ok(validateFileMetadata({name:'zero.png',type:'image/png',size:0}).length);
  assert.ok(validateFileMetadata({name:'huge.jpg',type:'image/jpeg',size:IMAGE_FILE_LIMIT+1}).length);
  assert.deepEqual(validateFileMetadata({name:'photo.jpeg',type:'image/jpeg',size:12345}),[]);
  assert.deepEqual(validateFileMetadata({name:'iphone.heic',type:'',size:12345}),[]);
});
test('warn on monochrome and very dark images, without asserting a Rubik was detected',()=>{
  const blank=createImage(32,32,()=>[8,8,8]);
  const q=analyzeImageQuality(blank);
  assert.ok(q.warnings.length>=2);
  assert.ok(q.warnings.some(w=>w.includes('tối')));
  assert.ok(q.warnings.some(w=>w.includes('tương phản')));
});
test('detailed picture has greater edge detail than uniform picture',()=>{
  const flat=createImage(64,64,()=>[120,120,120]);
  const tiled=createImage(64,64,(x,y)=>(Math.floor(x/4)+Math.floor(y/4))%2?[200,150,60]:[50,90,200]);
  assert.ok(analyzeImageQuality(tiled).edgeSharpness>analyzeImageQuality(flat).edgeSharpness);
});
test('photo diagnostics preserve original capture dimensions',()=>{
  const img=createImage(640,640,(x,y)=>x%20<10?[255,220,35]:[40,70,170]);
  const q=photographQuality(img);
  assert.equal(q.width,640);assert.equal(q.height,640);
});
