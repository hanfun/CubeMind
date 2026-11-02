import type {Face} from './cube';

export type ColorLab = [number,number,number];
export type ColorCandidate = {face:Face;cell:number;color:Face;cost:number;nearest:Face;gap:number;uncertain:boolean};
const FACES:Face[]=['U','R','F','D','L','B'];

/**
 * Minimum cost assignment of 48 non-centre stickers to 48 slots (8 per colour).
 * It prevents inconsistent 10-red/8-orange counts caused by independent nearest-centre decisions.
 * Important: a mathematically balanced assignment is NOT evidence that colours were identified correctly.
 */
export function assignBalancedColors(
  observations: {face:Face;cell:number;lab:ColorLab;noise:number}[],
  reference:Record<Face,ColorLab>,
): {assignments:ColorCandidate[]; ambiguous:number; forced:number} {
  if(observations.length!==48)throw new Error('Expected 48 non-centre stickers.');
  const colors=FACES.flatMap(f=>Array<Face>(8).fill(f));
  const distance=(a:ColorLab,b:ColorLab)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  const costs=observations.map(o=>colors.map(c=>distance(o.lab,reference[c])));
  // Hungarian algorithm: rows=stickers, columns=eight equally capped slots for each colour.
  const n=48,p=Array(n+1).fill(0),way=Array(n+1).fill(0);
  const u=Array(n+1).fill(0),v=Array(n+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i;let j0=0;
    const minv=Array(n+1).fill(Infinity),used=Array(n+1).fill(false);
    do {
      used[j0]=true;
      const i0=p[j0];let delta=Infinity,j1=0;
      for(let j=1;j<=n;j++)if(!used[j]){
        const cur=costs[i0-1][j-1]-u[i0]-v[j];
        if(cur<minv[j]){minv[j]=cur;way[j]=j0;}
        if(minv[j]<delta){delta=minv[j];j1=j;}
      }
      for(let j=0;j<=n;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}
      else minv[j]-=delta;
      j0=j1;
    }while(p[j0]!==0);
    do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);
  }
  const chosen=Array(n).fill(0);
  for(let j=1;j<=n;j++)chosen[p[j]-1]=j-1;
  let forced=0,ambiguous=0;
  const assignments:ColorCandidate[]=observations.map((o,i)=>{
    const ranked=FACES.map(c=>({c,d:distance(o.lab,reference[c])})).sort((a,b)=>a.d-b.d);
    const color=colors[chosen[i]];
    const cost=distance(o.lab,reference[color]);
    const gap=ranked[1].d-ranked[0].d;
    if(color!==ranked[0].c)forced++;
    const uncertain=gap<8||ranked[0].d>26||cost>30||o.noise>16||color!==ranked[0].c;
    if(uncertain)ambiguous++;
    return {face:o.face,cell:o.cell,color,cost,nearest:ranked[0].c,gap,uncertain};
  });
  return {assignments,ambiguous,forced};
}
