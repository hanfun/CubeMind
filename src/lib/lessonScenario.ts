import Cube from 'cubejs';
import {invertMoves,parseMoves,SOLVED} from './cube.ts';

/**
 * A lesson does not solve the entire Rubik's Cube.
 *
 * Start from a legal, intentionally still-unsolved TARGET that has completed
 * precisely this lesson's milestone.  Play the inverse of the lesson formula
 * to construct the before-state; replay the lesson formula to return to TARGET.
 *
 * This setup must be used by the Three.js model, the 2D before/after diagrams,
 * the move panel and the lesson-case thumbnails.  The 3D notation sandbox
 * remains a separate single-move demonstration (no curriculum stage).
 *
 * White-down teaching is a *display colour palette*; cubejs URFDLB state
 * letters remain unchanged.
 */
export const STAGE_TARGET_SCRAMBLE:Readonly<Record<string,string>>={
 'white-cross':"R U R' U'",
 'white-corners':"U R U' R' U' F' U F",
 'middle-edges':"F R U R' U' F'",
 'yellow-cross':"R U R' U R U2 R'",
 'yellow-face':"R' F R' B2 R F' R' B2 R2",
 'yellow-corners':"R U' R U R U R U' R' U' R2",
 'yellow-edges':'',
};

export function lessonTargetMoves(stageId:string):string[]{
 const formula=STAGE_TARGET_SCRAMBLE[stageId];
 if(formula===undefined)throw new Error(`Unknown beginner lesson stage: ${stageId}`);
 return parseMoves(formula);
}

export function lessonSetupMoves(stageId:string,algorithm:string):string[]{
 return [...lessonTargetMoves(stageId),...invertMoves(parseMoves(algorithm))];
}

export function lessonSnapshots(stageId:string,algorithm:string):string[]{
 const solution=parseMoves(algorithm);
 const cube=new Cube();
 const setup=lessonSetupMoves(stageId,algorithm);
 if(setup.length)cube.move(setup.join(' '));
 const states=[cube.asString()];
 for(const move of solution){
  cube.move(move);
  states.push(cube.asString());
 }
 return states;
}

export function stageTargetState(stageId:string):string{
 const cube=new Cube();
 const turns=lessonTargetMoves(stageId);
 if(turns.length)cube.move(turns.join(' '));
 return cube.asString();
}

export function isSolvedState(state:string):boolean{return state===SOLVED;}
