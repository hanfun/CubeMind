import {LEARN_LESSONS,type LearnLesson} from './learn.ts';

// English curriculum follows the same immutable ids and algorithms as the Vietnamese source.
// The cases are illustrative examples, not automatic pattern matching from a physical cube.
type CaseTranslation={title:string;when:string;explanation:string;caution?:string};
type LessonTranslation={title:string;subtitle:string;goal:string;instructions:string[];check:string;cases:Record<string,CaseTranslation>};
const dictionary:Record<string,LessonTranslation>={
 'white-cross':{
  title:'Make the white cross',subtitle:'First layer · White edges',
  goal:'Place the four white edge pieces around the white center; the side colour of each edge must also match its adjacent center.',
  instructions:[
    'Find the four white edge pieces (each edge has two colours).',
    'Bring each white edge next to the white center without disrupting the completed edges.',
    'Do not stop at a white cross: all four adjacent edge colours must also match their centers.'
  ],
  check:'A white cross is present and all four side-edge colours match their respective centers.',
  cases:{'cross-half-turn':{
   title:'Example: a half-turn on one face',when:'An edge is opposite its target position; this demonstrates F2, not a universal white-cross algorithm.',
   explanation:'Turn the front face 180°. Watch how the edge moves to the opposite position.',
   caution:'Building the white cross usually requires inspecting and moving each edge individually; there is no single algorithm for every situation.'
  }}
 },
 'white-corners':{
  title:'Solve the four white corners',subtitle:'First layer · White corners',
  goal:'Put all four white corner pieces in their correct three-colour positions to complete the first layer.',
  instructions:[
   'Keep white down and yellow up. Find a white corner in the top layer.',
   'Turn U until the target corner is above its front-right slot.',
   'Use the right-hand trigger and inspect the result. Repeat if necessary depending on the white sticker orientation.'
  ],
  check:'The entire bottom face is white and the bottom rows of all four side faces match their centers.',
  cases:{'right-trigger':{
   title:'Right-hand trigger',when:'A target corner is above the front-right slot; repetitions depend on its sticker orientation.',
   explanation:'R raises the right layer, U moves the top, R’ restores the right, and U’ restores the top.',
   caution:'Position the intended corner above the correct slot before applying the algorithm.'
  }}
 },
 'middle-edges':{
  title:'Solve the middle-layer edges',subtitle:'Second layer · Non-yellow edges',
  goal:'Insert the four edges without yellow into the middle layer while preserving the white layer.',
  instructions:[
   'Keep white down and yellow up. Find a top-layer edge with no yellow.',
   'Turn U so the front sticker colour matches the front center.',
   'Read the other edge colour to decide whether the piece belongs to the right or the left.'
  ],
  check:'The bottom two layers are complete and each side face matches its center in those layers.',
  cases:{
   'edge-right':{title:'Insert an edge to the right',when:'The other sticker on the top-front edge matches the right center.',explanation:'Move the edge out of the way, open the right slot, then insert it.'},
   'edge-left':{title:'Insert an edge to the left',when:'The other sticker on the top-front edge matches the left center.',explanation:'Use the mirrored sequence to insert the edge into the left slot.'}
  }
 },
 'yellow-cross':{
  title:'Make the yellow cross',subtitle:'Last layer · Orient edges',
  goal:'Point all four yellow edge stickers upward; ignore the yellow corners for now.',
  instructions:[
   'Examine the top face: you may see a dot, an L, a horizontal line, or a cross.',
   'Hold an L shape toward the upper-left or a line horizontally when viewed from above.',
   'Run the algorithm, inspect the new shape and repeat with the appropriate orientation.'
  ],
  check:'The four yellow edge stickers form a cross around the yellow center.',
  cases:{'yellow-cross-formula':{
   title:'Yellow-cross algorithm',when:'An L or line case, after the correct cube orientation.',
   explanation:'Turn F, do the right-hand trigger, then restore F’.',
   caution:'Correctly orient the L or line case before executing the algorithm.'
  }}
 },
 'yellow-face':{
  title:'Complete the yellow face',subtitle:'Last layer · Orient corners',
  goal:'Point all four yellow corner stickers upward, without yet requiring their positions to match.',
  instructions:[
   'Count the top-facing yellow corners and check their arrangement.',
   'Orient the cube so the Sune algorithm matches your current case.',
   'Inspect the new pattern after each execution; do not repeat blindly.'
  ],
  check:'All nine stickers on the top face are yellow.',
  cases:{sune:{
   title:'Sune algorithm',when:'A top-corner orientation case matching Sune, with the cube held correctly.',
   explanation:'A seven-move sequence used to orient the last-layer corners.',
   caution:'Not every yellow-face case is solved by one Sune. Inspect the pattern and adjust U or the viewpoint first.'
  }}
 },
 'yellow-corners':{
  title:'Permute the yellow corners',subtitle:'Last layer · Permute corners',
  goal:'Move the last-layer corner pieces into their correct three-colour locations after the yellow face is oriented.',
  instructions:[
   'Find a top corner whose three colours match the three adjacent centers (ignore sticker orientation).',
   'If one corner is correctly placed, put it at upper-front-right (UFR).',
   'Execute the three-corner cycle and inspect the cube; repeat if needed.'
  ],
  check:'All four top corners are in their correct positions relative to side centers.',
  cases:{'corner-cycle':{
   title:'Cycle three corners',when:'One correct corner at UFR. If none is correct, run the algorithm from a suitable orientation and inspect again.',
   explanation:'Keep the correct corner at the front-right while cycling the other three corners.',
   caution:'Make sure the fixed corner really belongs at UFR before applying the algorithm.'
  }}
 },
 'yellow-edges':{
  title:'Permute the yellow edges',subtitle:'Last layer · Permute edges',
  goal:'Put the remaining three last-layer edges in place without disturbing the bottom two layers.',
  instructions:[
   'Look for a side face whose top edge matches its center; if found, put it at the back.',
   'Determine whether the front edge needs to move to the right or to the left.',
   'Use the matching Ua or Ub algorithm, adjusting U if needed.'
  ],
  check:'All six faces contain nine matching stickers. The Rubik cube is solved!',
  cases:{
   ua:{title:'Ua — cycle front edge toward right',when:'The back top edge is correctly placed; the front edge needs to move toward the right.',explanation:'Cycle three last-layer edges in one direction.'},
   ub:{title:'Ub — cycle front edge toward left',when:'The back top edge is correctly placed; the front edge needs to move toward the left.',explanation:'Cycle three last-layer edges in the opposite direction.'}
  }
 }
};
export const EN_LESSONS:readonly LearnLesson[]=LEARN_LESSONS.map(lesson=>{
 const t=dictionary[lesson.id];
 if(!t)return lesson;
 return {...lesson,...t,cases:lesson.cases.map(c=>({...c,...t.cases[c.id]}))};
});
