import Cube from 'cubejs';
import {FACES,invertMoves,parseMoves,type Face} from './cube.ts';

export type ViewInfo={face:Face;vi:string;en:string;degrees:90|180;clockwise:boolean|null};
const viewNames:Record<Face,{vi:string;en:string}>={
 U:{vi:'mặt trên',en:'top face'},R:{vi:'mặt phải',en:'right face'},
 F:{vi:'mặt trước',en:'front face'},D:{vi:'mặt dưới',en:'bottom face'},
 L:{vi:'mặt trái',en:'left face'},B:{vi:'mặt sau',en:'back face'}
};

/** Viewing direction is defined by the turning face, NOT by the global camera. */
export function viewForMove(move:string):ViewInfo{
 const [token]=parseMoves(move);
 if(!token||parseMoves(move).length!==1)throw new Error('Expected exactly one face turn.');
 const face=token[0] as Face;
 const degrees=token.endsWith('2')?180:90;
 return {...viewNames[face],face,degrees,clockwise:degrees===180?null:!token.endsWith("'")};
}
export function faceGrid(facelets:string,face:Face):Face[]{
 if(facelets.length!==54)throw new Error('Expected 54 facelets.');
 const at=FACES.indexOf(face)*9;
 return facelets.slice(at,at+9).split('') as Face[];
}

/** Standalone notation demonstration only.
 * Stage lessons MUST use lessonSnapshots(stageId, algorithm) from lessonScenario.ts
 * so they stop at the current teaching milestone instead of solving the cube.
 * This function remains for a single-move notation sandbox. */
export function algorithmSnapshots(algorithm:string):string[]{
 const moves=parseMoves(algorithm);
 const cube=new Cube();
 if(moves.length)cube.move(invertMoves(moves).join(' '));
 const result=[cube.asString()];
 for(const move of moves){cube.move(move);result.push(cube.asString());}
 return result;
}
