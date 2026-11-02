import {invertMoves,parseMoves,type MoveToken} from './cube.ts';

/**
 * Reconstructs the visual cube from a verified solver sequence.
 * Initial state S0 = solved + inverse(solution).
 * Manual mode shows S[k] = S0 + k user-confirmed moves.
 * Automatic mode starts at S0 regardless of physical confirmations.
 */
export function viewerSetupMoves(solution:readonly MoveToken[],confirmedCount:number,mode:'manual'|'auto'):MoveToken[] {
 const moves=parseMoves(solution.join(' '));
 if(!Number.isInteger(confirmedCount)||confirmedCount<0||confirmedCount>moves.length)
   throw new Error('Invalid confirmed move index.');
 return [...invertMoves(moves),...(mode==='manual'?moves.slice(0,confirmedCount):[])];
}
