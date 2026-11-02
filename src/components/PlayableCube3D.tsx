import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {FACE_COLORS} from '../lib/cube';
import {faceFromDrag,moveToTurn,type Axis} from '../lib/play';

export interface PlayableCubeHandle {turn(move:string,duration?:number):Promise<void>;preview(move:string):Promise<void>;resetView():void;}
type Props={initialMoves:string[];onUserMove:(move:string)=>void;onBusyChange?:(busy:boolean)=>void;orbitOnly?:boolean};
const SPACE=1.05;
const AXES:Axis[]=['x','y','z'];
const smooth=(x:number)=>1-Math.pow(1-x,3);

/** Interactive Three.js cube: a swipe across a visible sticker twists a layer;
 * a swipe outside the cube (or View mode) orbits the camera. All face turns use
 * the same URFDLB coordinate system as cubejs, and notify the game only after
 * their 3D animation actually finishes. */
const PlayableCube3D=forwardRef<PlayableCubeHandle,Props>(function PlayableCube3D({initialMoves,onUserMove,onBusyChange,orbitOnly=false},ref){
 const host=useRef<HTMLDivElement>(null);
 const api=useRef<PlayableCubeHandle|null>(null);
 const onUserMoveRef=useRef(onUserMove);const onBusyRef=useRef(onBusyChange);const orbitRef=useRef(orbitOnly);
 const [error,setError]=useState('');
 onUserMoveRef.current=onUserMove;onBusyRef.current=onBusyChange;orbitRef.current=orbitOnly;
 useImperativeHandle(ref,()=>({
  turn:(m,d)=>api.current?api.current.turn(m,d):Promise.reject(new Error('Mô hình 3D chưa sẵn sàng.')),
  preview:m=>api.current?api.current.preview(m):Promise.reject(new Error('Mô hình 3D chưa sẵn sàng.')),
  resetView:()=>api.current?.resetView()
 }),[]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setError('Thiết bị hoặc trình duyệt chưa hỗ trợ WebGL. Vui lòng thử Chrome/Safari mới hơn.');return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Khối Rubik 3D tương tác: kéo mặt ngoài để xoay, kéo vùng trống để đổi góc nhìn');
  renderer.domElement.style.touchAction='none';
  const scene=new THREE.Scene();const group=new THREE.Group();scene.add(group);
  const camera=new THREE.PerspectiveCamera(40,1,0.1,100);camera.position.set(5.5,4.8,7.2);
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=0.08;controls.enablePan=false;controls.minDistance=5;controls.maxDistance=16;
  const resetView=()=>{camera.position.set(5.5,4.8,7.2);controls.target.set(0,0,0);controls.update();};
  scene.add(new THREE.AmbientLight(0xffffff,2.35));
  const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(4,8,9);scene.add(key);
  const dim=new THREE.DirectionalLight(0x7aafff,1.25);dim.position.set(-6,-2,-5);scene.add(dim);
  const black='#0a1020';const palette=FACE_COLORS;
  const mats:(THREE.MeshStandardMaterial)[]=[];
  const makeMat=(c:string)=>{const m=new THREE.MeshStandardMaterial({color:c,roughness:0.41,metalness:0.025});mats.push(m);return m;};
  const dark=makeMat(black);const colors={R:makeMat(palette.R.hex),L:makeMat(palette.L.hex),U:makeMat(palette.U.hex),D:makeMat(palette.D.hex),F:makeMat(palette.F.hex),B:makeMat(palette.B.hex)};
  const cubelets:THREE.Mesh[]=[];const geometry=new THREE.BoxGeometry(0.98,0.98,0.98);
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++){
   if(x===0&&y===0&&z===0)continue;
   const material=[x===1?colors.R:dark,x===-1?colors.L:dark,y===1?colors.U:dark,y===-1?colors.D:dark,z===1?colors.F:dark,z===-1?colors.B:dark];
   const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x*SPACE,y*SPACE,z*SPACE);
   mesh.userData.coords={x,y,z};cubelets.push(mesh);group.add(mesh);
  }
  type Pending={pivot:THREE.Group;pieces:THREE.Mesh[];axis:Axis;angle:number;start:number;duration:number;resolve:()=>void};
  let pending:Pending|null=null,disposed=false,locked=false;
  const lock=(v:boolean)=>{locked=v;onBusyRef.current?.(v);};
  const syncCoords=(pieces:THREE.Mesh[])=>{
   for(const m of pieces){group.attach(m);
    for(const axis of AXES){const value=Math.round(m.position[axis]/SPACE);m.position[axis]=value*SPACE;}
    // Snap rotation matrix to the nearest right-angle orientation: no float drift.
    const rotation=new THREE.Matrix4().makeRotationFromQuaternion(m.quaternion);
    const e=rotation.elements;
    for(const i of [0,1,2,4,5,6,8,9,10])e[i]=Math.round(e[i]);
    m.quaternion.setFromRotationMatrix(rotation);
    m.userData.coords={x:Math.round(m.position.x/SPACE),y:Math.round(m.position.y/SPACE),z:Math.round(m.position.z/SPACE)};
   }
  };
  const rotate=(move:string,duration=330):Promise<void>=>{
   if(disposed)return Promise.reject(new Error('Mô hình 3D đã đóng.'));
   if(pending)return Promise.reject(new Error('Đang xoay, vui lòng đợi.'));
   const {axis,layer,angle}=moveToTurn(move);
   const pieces=cubelets.filter(m=>m.userData.coords[axis]===layer);
   const pivot=new THREE.Group();group.add(pivot);for(const m of pieces)pivot.attach(m);
   if(duration<=0){pivot.rotation[axis]=angle;syncCoords(pieces);group.remove(pivot);return Promise.resolve();}
   return new Promise(resolve=>{pending={pivot,pieces,axis,angle,start:performance.now(),duration,resolve};needsRender=true;});
  };
  const preview=async(move:string)=>{
   if(locked)throw new Error('Đang có một thao tác khác.');
   lock(true);
   try{await rotate(move,500);await new Promise<void>(resolve=>window.setTimeout(resolve,350));
       const {inverseMove}=await import('../lib/cube');await rotate(inverseMove(move),500);
   }finally{lock(false);}
  };
  // Initialise saved state without animation or pretending any move occurred.
  for(const move of initialMoves){void rotate(move,0);}
  api.current={turn:rotate,preview,resetView};
  const raycaster=new THREE.Raycaster();const ndc=new THREE.Vector2();
  const rayAt=(clientX:number,clientY:number)=>{
   const r=renderer.domElement.getBoundingClientRect();
   ndc.set(((clientX-r.left)/r.width)*2-1,-((clientY-r.top)/r.height)*2+1);
   raycaster.setFromCamera(ndc,camera);
  };
  type Drag={id:number;origin:THREE.Vector3;normal:THREE.Vector3;cube:THREE.Vector3;start:{x:number;y:number};plane:THREE.Plane};
  let drag:Drag|null=null;
  const down=(e:PointerEvent)=>{
   if(disposed||locked||pending||orbitRef.current||e.button!==0||!e.isPrimary)return;
   rayAt(e.clientX,e.clientY);const hit=raycaster.intersectObjects(cubelets,false)[0];
   if(!hit||!hit.face)return; // background = OrbitControls rotates the whole view
   const mesh=hit.object as THREE.Mesh;
   const normal=hit.face.normal.clone().transformDirection(mesh.matrixWorld);
   normal.set(Math.round(normal.x),Math.round(normal.y),Math.round(normal.z));
   const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,hit.point);
   drag={id:e.pointerId,origin:hit.point.clone(),normal,cube:new THREE.Vector3().copy(mesh.position).divideScalar(SPACE),start:{x:e.clientX,y:e.clientY},plane};
   controls.enabled=false;
   e.stopImmediatePropagation();e.preventDefault();renderer.domElement.setPointerCapture(e.pointerId);
  };
  const up=(e:PointerEvent)=>{
   const start=drag;if(!start||start.id!==e.pointerId)return;
   drag=null;controls.enabled=true;
   if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);
   if(e.type==='pointercancel'||Math.hypot(e.clientX-start.start.x,e.clientY-start.start.y)<14)return;
   rayAt(e.clientX,e.clientY);
   const end=raycaster.ray.intersectPlane(start.plane,new THREE.Vector3());if(!end)return;
   const delta=end.sub(start.origin);
   const move=faceFromDrag(start.normal,start.cube,delta);
   if(!move)return;
   lock(true);
   void rotate(move,300).then(()=>onUserMoveRef.current(move)).catch(console.error).finally(()=>lock(false));
   e.stopPropagation();
  };
  const onContext=(e:MouseEvent)=>e.preventDefault();
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',down,true);canvas.addEventListener('pointerup',up,true);canvas.addEventListener('pointercancel',up,true);canvas.addEventListener('contextmenu',onContext);
  let needsRender=true;
  const observer=new ResizeObserver(()=>{const r=el.getBoundingClientRect();const w=Math.max(r.width,1),h=Math.max(r.height,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();needsRender=true;});observer.observe(el);
  let frame=0;
  const tick=(now:number)=>{
   if(disposed)return;
   if(pending){const p=pending;const ratio=Math.min(1,(now-p.start)/p.duration);
    p.pivot.rotation[p.axis]=p.angle*smooth(ratio);
    if(ratio>=1){syncCoords(p.pieces);group.remove(p.pivot);pending=null;p.resolve();}
   }
   const cameraChanged=controls.update();
   if(pending||cameraChanged||needsRender){renderer.render(scene,camera);needsRender=false;}
   frame=requestAnimationFrame(tick);
  };
  frame=requestAnimationFrame(tick);
  return ()=>{
   disposed=true;cancelAnimationFrame(frame);observer.disconnect();
   canvas.removeEventListener('pointerdown',down,true);canvas.removeEventListener('pointerup',up,true);canvas.removeEventListener('pointercancel',up,true);canvas.removeEventListener('contextmenu',onContext);
   // Resolve any pending animation to prevent dangling callers on unmount.
   if(pending){pending.resolve();pending=null;}
   controls.dispose();geometry.dispose();mats.forEach(m=>m.dispose());renderer.dispose();canvas.remove();api.current=null;
  };
 },[]); // Keep one graphics context for the entire play session.
 return <div className="play-cube-canvas" ref={host}>{error&&<div className="viewer-error" role="alert">{error}</div>}</div>;
});
export default PlayableCube3D;
