import type {PixelSource} from './twoAngle.ts';

export const IMAGE_FILE_LIMIT=20*1024*1024;
export const IMAGE_SIZE=640;
export const IMAGE_TYPES=['image/jpeg','image/png','image/webp','image/avif','image/heic','image/heif'];
export type QualityReport={
  width:number;height:number;meanLight:number;contrast:number;edgeSharpness:number;
  warnings:string[];
};
export type LoadedPhoto={dataUrl:string;pixels:PixelSource;quality:QualityReport;filename?:string};

export function validateFileMetadata(file:Pick<File,'size'|'type'|'name'>):string[] {
  const errors:string[]=[];
  if (!(IMAGE_TYPES.includes(file.type.toLowerCase()) || (!file.type && /\.(jpe?g|png|webp|avif|heic|heif)$/i.test(file.name))))
    errors.push('Định dạng chưa được hỗ trợ. Chọn JPG, PNG, WebP, AVIF hoặc HEIC/HEIF nếu trình duyệt đọc được.');
  if(file.size<=0)errors.push('File ảnh trống.');
  if(file.size>IMAGE_FILE_LIMIT)errors.push('Ảnh vượt quá 20 MB. Vui lòng chọn hoặc nén ảnh khác.');
  return errors;
}

/** Diagnostics only; visual quality warnings do not prove that a Rubik is present. */
export function analyzeImageQuality(img:PixelSource):QualityReport {
  const {data,width,height}=img;
  if(width<2||height<2||data.length!==width*height*4)throw new Error('Dữ liệu ảnh không hợp lệ.');
  let sum=0,sumSq=0,bright=0,dark=0;
  const lum=new Float32Array(width*height);
  for(let i=0;i<lum.length;i++){
    const p=i*4,y=0.2126*data[p]+0.7152*data[p+1]+0.0722*data[p+2];
    lum[i]=y;sum+=y;sumSq+=y*y;
    if(y>248)bright++;if(y<14)dark++;
  }
  const n=lum.length,mean=sum/n,contrast=Math.sqrt(Math.max(0,sumSq/n-mean*mean));
  let edgeSum=0,edgeSq=0,edgeN=0;
  for(let y=1;y<height-1;y+=2)for(let x=1;x<width-1;x+=2){
    const i=y*width+x;
    const lap=4*lum[i]-lum[i-1]-lum[i+1]-lum[i-width]-lum[i+width];
    edgeSum+=lap;edgeSq+=lap*lap;edgeN++;
  }
  const edgeMean=edgeSum/Math.max(1,edgeN);
  const sharpness=edgeSq/Math.max(1,edgeN)-edgeMean*edgeMean;
  const warnings:string[]=[];
  if(mean<43)warnings.push('Ảnh khá tối; nên chụp nơi đủ sáng.');
  if(mean>230)warnings.push('Ảnh quá sáng; màu trắng/vàng có thể bị lóa.');
  if(bright/n>0.68)warnings.push('Nhiều vùng cháy sáng; tránh ánh đèn phản chiếu vào sticker.');
  if(dark/n>0.70)warnings.push('Nhiều vùng rất tối; hãy tăng ánh sáng.');
  if(contrast<17)warnings.push('Độ tương phản thấp; kiểm tra khối Rubik có nằm rõ trong ảnh.');
  if(sharpness<22)warnings.push('Ảnh có thể bị mờ hoặc thiếu chi tiết; thử chụp lại nếu khó đọc màu.');
  return {width,height,meanLight:+mean.toFixed(1),contrast:+contrast.toFixed(1),edgeSharpness:+Math.max(0,sharpness).toFixed(1),warnings};
}

function getPixels(c:HTMLCanvasElement):PixelSource {
  const ctx=c.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Không đọc được ảnh từ Canvas.');
  return ctx.getImageData(0,0,c.width,c.height);
}

/** Center-contain (not crop) the whole uploaded image so its corners remain available to manual alignment. */
export function normalizeImage(img:CanvasImageSource,w:number,h:number):{dataUrl:string;pixels:PixelSource} {
  const c=document.createElement('canvas');c.width=IMAGE_SIZE;c.height=IMAGE_SIZE;
  const ctx=c.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw new Error('Canvas không khả dụng trên thiết bị này.');
  const scale=Math.min(IMAGE_SIZE/w,IMAGE_SIZE/h);
  const rw=w*scale,rh=h*scale;
  ctx.fillStyle='#142034';ctx.fillRect(0,0,IMAGE_SIZE,IMAGE_SIZE);
  ctx.drawImage(img,(IMAGE_SIZE-rw)/2,(IMAGE_SIZE-rh)/2,rw,rh);
  return {dataUrl:c.toDataURL('image/jpeg',0.91),pixels:getPixels(c)};
}

function checkDimensions(width:number,height:number,minSide:number){
  if(width<minSide||height<minSide)throw new Error(`Ảnh quá nhỏ (${width}×${height}). Cần ít nhất ${minSide}px mỗi chiều để đọc ô màu.`);
  if(width*height>90_000_000)throw new Error('Ảnh quá lớn, vui lòng giảm kích thước trước khi tải lên.');
}

export async function readUploadedImage(file:File,minSide=360):Promise<LoadedPhoto>{
  const metadataErrors=validateFileMetadata(file);
  if(metadataErrors.length)throw new Error(metadataErrors.join(' '));
  const url=URL.createObjectURL(file);
  try {
    const image=new Image();
    image.src=url;
    try{await image.decode();}catch{throw new Error('Không đọc được ảnh. Thử chuyển ảnh sang JPG/PNG hoặc chọn ảnh khác.');}
    const w=image.naturalWidth,h=image.naturalHeight;
    checkDimensions(w,h,minSide);
    const diag=document.createElement('canvas');diag.width=256;diag.height=256;
    const dctx=diag.getContext('2d',{willReadFrequently:true});
    if(!dctx)throw new Error('Không thể đánh giá ảnh.');
    dctx.drawImage(image,0,0,256,256);
    const quality=analyzeImageQuality(getPixels(diag));
    quality.width=w;quality.height=h;
    const normalized=normalizeImage(image,w,h);
    return {...normalized,quality,filename:file.name};
  } finally {URL.revokeObjectURL(url);}
}

export function photographQuality(pixels:PixelSource):QualityReport {
  // Canvas frames have a fixed 640px size. Sampling at 256px saves CPU.
  const w=256,h=256;
  const scaled=new Uint8ClampedArray(w*h*4);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const a=(y*w+x)*4,b=(Math.floor(y*pixels.height/h)*pixels.width+Math.floor(x*pixels.width/w))*4;
    for(let i=0;i<4;i++)scaled[a+i]=pixels.data[b+i];
  }
  return {...analyzeImageQuality({width:w,height:h,data:scaled}),width:pixels.width,height:pixels.height};
}
