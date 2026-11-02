import {useEffect,useMemo,useRef,useState} from 'react';
import PlayableCube3D,{type PlayableCubeHandle} from './PlayableCube3D';
import {viewerSetupMoves} from '../lib/guideViewer';

type Props={
 solution:string[];confirmedCount:number;mode:'manual'|'auto';
 demo:boolean;paused?:boolean;speed:number;
};

/**
 * Solution viewer uses the same local Three.js cube that powers the playable mode.
 * It does not depend on cubing.js asset loading or its experimental setup API.
 * In particular, neither preview nor automatic playback can confirm a real turn.
 */
export default function TwistyCube({solution,confirmedCount,mode,demo,paused=false,speed}:Props){
 const cube=useRef<PlayableCubeHandle>(null);
 const [ready,setReady]=useState(false),[autoStep,setAutoStep]=useState(0),[error,setError]=useState('');
 const autoBusy=useRef(false),epoch=useRef(0),lastPreview=useRef(false);
 const signature=solution.join(' ');
 const initialMoves=useMemo(()=>viewerSetupMoves(solution,confirmedCount,mode),[signature,confirmedCount,mode]); // eslint-disable-line react-hooks/exhaustive-deps
 const identity=`${mode}:${confirmedCount}:${signature}`;

 // A change of physical confirmation means a new, exactly reconstructed S[k].
 // Destroy the old WebGL instance and cancel its running playback sequence.
 useEffect(()=>{
  epoch.current++;
  autoBusy.current=false;
  lastPreview.current=false;
  setAutoStep(0);
  setError('');
  return ()=>{epoch.current++;};
 },[identity]);

 useEffect(()=>{cube.current?.setPlaybackPaused(paused);},[ready,paused]);

 useEffect(()=>{
  if(mode!=='manual'||!ready)return;
  if(!demo){lastPreview.current=false;return;}
  if(lastPreview.current||confirmedCount>=solution.length)return;
  lastPreview.current=true;
  const generation=epoch.current;
  void cube.current?.preview(solution[confirmedCount]).catch(err=>{
    if(epoch.current===generation)setError(err instanceof Error?err.message:'Không thể phát bước mô phỏng.');
  });
 },[mode,ready,demo,confirmedCount,signature]);

 useEffect(()=>{
  if(mode!=='auto'||!ready||!demo||paused||autoBusy.current||autoStep>=solution.length)return;
  const generation=epoch.current;
  autoBusy.current=true;
  const run=async()=>{
   try{
    // The turn promise resolves at the precise end of the rendered face rotation.
    // Pausing freezes the 3D animation without advancing this index.
    for(let i=autoStep;i<solution.length;i++){
     if(epoch.current!==generation)return;
     const move=solution[i];
     const duration=(move.endsWith('2')?950:620)/Math.max(0.25,speed);
     await cube.current?.turn(move,duration);
     if(epoch.current!==generation)return;
     setAutoStep(i+1);
    }
   }catch(err){
    if(epoch.current===generation)setError(err instanceof Error?err.message:'Không thể hoàn thành mô phỏng.');
   }finally{
    if(epoch.current===generation)autoBusy.current=false;
   }
  };
  void run();
 },[ready,mode,demo,paused,autoStep,signature,speed]);

 return <div className="viewer-container">
   <div className="twisty-mount" aria-label="Khối Rubik 3D mô phỏng lời giải">
     <PlayableCube3D key={identity} ref={cube} initialMoves={initialMoves}
       onUserMove={()=>{/* view-only: never change physical progress */}}
       onReadyChange={setReady} orbitOnly/>
   </div>
   {error&&<div className="viewer-error" role="alert">{error}</div>}
   <div className="viewer-footer">
     <span className="viewer-live-dot"/>
     {mode==='auto'
       ? `Mô phỏng 3D · ${autoStep}/${solution.length} bước`
       : 'Mô phỏng 3D · Kéo để đổi góc nhìn'}
     <button type="button" className="plain-small" onClick={()=>cube.current?.resetView()}>
       Đặt lại góc nhìn
     </button>
   </div>
 </div>;
}
