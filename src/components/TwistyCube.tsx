import {useEffect,useMemo,useRef,useState} from 'react';
import {invertMoves} from '../lib/cube';
import type {TwistyPlayer} from 'cubing/twisty';

type Props={solution:string[];confirmedCount:number;mode:'manual'|'auto';demo:boolean;paused?:boolean;speed:number};
export default function TwistyCube({solution,confirmedCount,mode,demo,paused=false,speed}:Props){
 const mount=useRef<HTMLDivElement>(null),player=useRef<TwistyPlayer|null>(null);
 const [ready,setReady]=useState(false),[err,setErr]=useState('');
 const lastConfiguration=useRef('');
 const signature=solution.join(' ');
 const setup=useMemo(()=>invertMoves(solution).join(' '),[signature]); // eslint-disable-line react-hooks/exhaustive-deps
 const previous=useMemo(()=>solution.slice(0,confirmedCount).join(' '),[signature,confirmedCount]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{
  let disposed=false;
  void import('cubing/twisty').then(({TwistyPlayer})=>{
   if(disposed||!mount.current)return;
   const p=new TwistyPlayer({puzzle:'3x3x3',visualization:'3D',background:'none',controlPanel:'none',viewerLink:'none',hintFacelets:'floating',experimentalSetupAlg:setup,experimentalSetupAnchor:'start',alg:'',tempoScale:speed});
   player.current=p; mount.current.appendChild(p);setReady(true);
  }).catch(()=>{if(!disposed)setErr('Không tải được mô hình 3D trên thiết bị này. Bạn vẫn có thể xem hướng dẫn bằng chữ.');});
  return ()=>{disposed=true;player.current?.pause();player.current?.remove();player.current=null;};
 },[]); // One WebGL viewer for entire session; controlled by second effect.
 useEffect(()=>{
   if(!ready||!player.current)return;
   const p=player.current;
   p.tempoScale=speed;
   const configuredSetup=mode==='auto'?setup:`${setup} ${previous}`.trim();
   const configuredAlg=mode==='auto'?signature:(demo?(solution[confirmedCount]??''):'');
   const configuration=JSON.stringify([mode,configuredSetup,configuredAlg]);
   if(lastConfiguration.current!==configuration){
     p.pause();p.experimentalSetupAlg=configuredSetup;p.alg=configuredAlg;p.jumpToStart();
     lastConfiguration.current=configuration;
   }
   if(demo&&!paused)p.play();else p.pause();
   // Completion is driven by domain layer timer, not visual frame listener.
 },[ready,setup,previous,signature,mode,confirmedCount,demo,paused,speed]);
 // Do not pretend the 3D player can verify physical moves.
 return <div className="viewer-container">
  <div ref={mount} className="twisty-mount" aria-label="Mô hình Rubik 3D có thể xoay góc nhìn" />
  {err&&<div className="viewer-error">{err}</div>}
  <div className="viewer-footer"><span className="viewer-live-dot"/> Mô phỏng 3D · Kéo để đổi góc nhìn <button type="button" className="plain-small" onClick={()=>{const p=player.current;if(p){p.cameraLatitude=35;p.cameraLongitude=35;}}}>Đặt lại góc nhìn</button></div>
  </div>;
}
