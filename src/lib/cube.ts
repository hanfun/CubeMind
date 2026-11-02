export type Face = 'U'|'R'|'F'|'D'|'L'|'B';
export type MoveToken = string;
export type FaceletString = string;
export const FACES: Face[] = ['U','R','F','D','L','B'];
export const MOVE_RE = /^[URFDLB](?:2|')?$/;
export const SOLVED = FACES.map(f=>f.repeat(9)).join('');
export const FACE_NAMES: Record<Face,string> = {U:'Trên',R:'Phải',F:'Trước',D:'Dưới',L:'Trái',B:'Sau'};
export const FACE_COLORS:Record<Face,{name:string;hex:string}> = {
  U:{name:'Trắng',hex:'#f5f6fa'},R:{name:'Đỏ',hex:'#ef465c'},F:{name:'Xanh lá',hex:'#25c894'},
  D:{name:'Vàng',hex:'#ffcb42'},L:{name:'Cam',hex:'#ff8a48'},B:{name:'Xanh dương',hex:'#3984ed'}
};
export function parseMoves(input:string):MoveToken[] {
  const tokens=input.replace(/[\n,;]+/g,' ').trim().split(/\s+/).filter(Boolean);
  for(const token of tokens) if(!MOVE_RE.test(token))throw new Error(`Bước không hợp lệ: "${token}". Chỉ hỗ trợ U D L R F B với ' hoặc 2.`);
  return tokens;
}
export function inverseMove(m:MoveToken):MoveToken {
  if(!MOVE_RE.test(m))throw new Error(`Bước không hợp lệ: ${m}`);
  return m.endsWith('2')?m:m.endsWith("'")?m.slice(0,-1):`${m}'`;
}
export function invertMoves(moves:MoveToken[]):MoveToken[] {return [...moves].reverse().map(inverseMove);}
export function normalizeFacelets(input:string):string {return input.toUpperCase().replace(/\s/g,'');}
export function basicFaceletValidation(input:string):string[] {
  const f=normalizeFacelets(input), errors:string[]=[];
  if(f.length!==54)return [`Cần đúng 54 ô màu (hiện có ${f.length}).`];
  for(const face of FACES){const count=[...f].filter(c=>c===face).length;if(count!==9)errors.push(`Màu ${FACE_NAMES[face]} (${face}): ${count}/9 ô.`);}
  for(let i=0;i<6;i++)if(f[i*9+4]!==FACES[i])errors.push(`Ô tâm của mặt ${FACES[i]} phải là ${FACES[i]}.`);
  if([...f].some(c=>!FACES.includes(c as Face)))errors.push('Có ô màu không thuộc U, R, F, D, L, B.');
  return errors;
}
export type MoveInfo = {face: Face; faceName:string;degrees:90|180;direction:string; description:string;};
export function moveInfo(move:string):MoveInfo {
  if(!MOVE_RE.test(move))throw new Error(`Bước không hợp lệ: ${move}`);
  const face=move[0] as Face, degrees=move.endsWith('2')?180:90;
  const direction=degrees===180?'180° (hướng nào cũng được)':move.endsWith("'")?'ngược chiều kim đồng hồ':'theo chiều kim đồng hồ';
  return {face,faceName:FACE_NAMES[face],degrees,direction,description:`Xoay mặt ${FACE_NAMES[face].toLowerCase()} ${degrees}°${degrees===90?` ${direction}`:''} khi nhìn thẳng vào chính mặt đó.`};
}
export function permParity(arr:number[]):number {let p=0;for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++)if(arr[i]>arr[j])p^=1;return p;}
export type CubieState={cp:number[];co:number[];ep:number[];eo:number[]};
export function validateCubies(c:CubieState):string[] {
  const err:string[]=[];
  const validPerm=(a:number[],n:number)=>a.length===n&&new Set(a).size===n&&a.every(x=>Number.isInteger(x)&&x>=0&&x<n);
  if(!validPerm(c.cp,8))err.push('Có viên góc trùng, thiếu hoặc không tồn tại.');
  if(!validPerm(c.ep,12))err.push('Có viên cạnh trùng, thiếu hoặc không tồn tại.');
  if(c.co.length!==8||c.co.some(x=>!Number.isInteger(x)||x<0||x>2)||c.co.reduce((a,b)=>a+b,0)%3!==0)err.push('Tổng hướng xoay 8 viên góc không hợp lệ.');
  if(c.eo.length!==12||c.eo.some(x=>x!==0&&x!==1)||c.eo.reduce((a,b)=>a+b,0)%2!==0)err.push('Tổng hướng lật 12 viên cạnh không hợp lệ.');
  if(validPerm(c.cp,8)&&validPerm(c.ep,12)&&permParity(c.cp)!==permParity(c.ep))err.push('Parity góc và cạnh không khớp.');
  return err;
}
