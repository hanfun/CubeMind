import {LEARN_LESSONS,type LearnLesson} from './learn.ts';

// English curriculum follows the same immutable ids and algorithms as the Vietnamese source.
// The cases are illustrative examples, not automatic pattern matching from a physical cube.
type CaseTranslation={title:string;when:string;explanation:string;caution?:string;hold?:string;expected?:string;next?:string};
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
  title:'Build the yellow cross',subtitle:'Last layer · Orient edges',
  goal:'Face all four yellow edge stickers upward. Ignore side-center alignment and corner orientation for now.',
  instructions:[
   'From above, inspect only the four top edge stickers, not the corner stickers.',
   'Identify a horizontal line, an upper-left L, or a single center dot.',
   'Choose the matching case, compare the diagrams and keep the cube fixed while performing the algorithm.'
  ],
  check:'All four top edges show yellow, forming a cross around the yellow center.',
  cases:{
   'yellow-line':{
    title:'Horizontal line — two edges up',
    when:'Viewed from above, the two yellow top edges lie to the left and right of the center.',
    hold:'Keep the yellow line horizontal, left to right, yellow on top and white below.',
    explanation:'Turn the front, perform the right trigger, then restore the front. Watch the other two edges flip up.',
    expected:'All four top edges point yellow upward; top corners are not required to match yet.'
   },
   'yellow-l':{
    title:'L-shape — two adjacent edges',
    when:'Viewed from above, two yellow edges form an L at top and left.',
    hold:'Rotate the entire cube (not an individual layer) so the L appears in the upper-left of the diagram.',
    explanation:'An L-specific variant, with the illustrated holding orientation.',
    expected:'All four top edges point yellow upward.',
    caution:'The line and L cases require different holding directions; check the diagrams carefully.'
   },
   'yellow-dot':{
    title:'Dot — no top edge is yellow',
    when:'Only the yellow center is visible on top; none of the four U-edge stickers are yellow.',
    hold:'Keep yellow up. The illustrated example combines two algorithms, with a U turn between them.',
    explanation:'This dot pattern uses two edge-orientation stages. Watch each turn in the 3D walkthrough.',
    expected:'The combined sequence produces the yellow cross.',
    caution:'This long formula illustrates one exact starting orientation. Do not apply it until the cube matches the image.'
   }
  }
 },
 'yellow-face':{
  title:'Complete the yellow top face',subtitle:'Last layer · Orient corners',
  goal:'Point all four top corner yellow stickers upward while preserving the yellow cross. Corner permutation is not needed yet.',
  instructions:[
   'Count how many of the four U corners already show yellow: 0, 1 or 2. Exactly 3 is impossible on a legal cube.',
   'For one yellow corner, distinguish Sune and Anti-Sune by its position and the side stickers.',
   'For zero or two yellow corners, inspect the illustrated combination of two algorithms and its intermediate U turns.'
  ],
  check:'All nine top stickers show yellow; the first two layers remain solved.',
  cases:{
   sune:{
    title:'Sune — one yellow corner faces up',
    when:'Exactly one top corner faces yellow upward at UFL in this diagram.',
    hold:'Keep yellow up and put the upward-facing yellow corner at UFL (front-left), as in the case diagram.',
    explanation:'Use Sune to orient the last-layer corners.',
    expected:'All four yellow corners face up.'
   },
   'anti-sune':{
    title:'Anti-Sune — mirrored fish',
    when:'One top yellow corner is at URB in this example, mirrored from Sune.',
    hold:'Keep yellow up and rotate the entire cube until it matches the illustrated top and side colours.',
    explanation:'The mirrored orientation sequence for the opposite fish case.',
    expected:'All four yellow corners face up.'
   },
   'two-yellow-corners':{
    title:'Two yellow corners face up',
    when:'Exactly two of the four top corners already show yellow.',
    hold:'Match the illustrated pattern. This example combines Sune and Anti-Sune with a U adjustment.',
    explanation:'Apply Sune, adjust U, and apply Anti-Sune to solve this exact example.',
    expected:'All nine top stickers are yellow.'
   },
   'zero-yellow-corners':{
    title:'No yellow corners face up',
    when:'The top cross is yellow, but none of the four top corners show yellow.',
    hold:'Match the shown side stickers. This example consists of two Sune algorithms.',
    explanation:'Inspect the cube after the first Sune before executing the second.',
    expected:'All nine top stickers become yellow.',
    caution:'There is no single holding angle that works for every zero-corner pattern; match the example or inspect a different case.'
   }
  }
 },
 'yellow-corners':{
  title:'Permute the last-layer corners',subtitle:'Last layer · Position corners',
  goal:'Place each three-colour corner in the right location relative to the side centers, while keeping the entire top yellow.',
  instructions:[
   'A corner correctly oriented (yellow up) is not necessarily correctly positioned (matching its three centers).',
   'Check the two top corner stickers on each side. A matching pair is called headlights. Rotate the entire cube to hold the headlights at the back.',
   'If no side has headlights, use the Y-perm diagonal example, then check the corners again.'
  ],
  check:'The U face remains entirely yellow and all four corners are correctly positioned. Edges may remain unsolved.',
  cases:{
   'aa-corner-cycle':{
    title:'Headlights at the back — A-perm',
    when:'Two top corner stickers on one side match. In this case the headlights are at the back.',
    hold:'Keep the headlight pair on the B face; the UFL corner stays fixed in this algorithm.',
    explanation:'A-perm cycles three corners without undoing the yellow face.',
    expected:'All four top corners reach their correct positions and the lower layers remain solved.',
    caution:'The former U R U’ L’… sequence did not preserve the yellow top face and has been replaced.'
   },
   'diagonal-corners':{
    title:'No headlights — diagonal corner swap',
    when:'No side has a matching pair of top corner stickers. Two corners need a diagonal swap.',
    hold:'Keep yellow on top, white on bottom, and the front face aligned with the diagram.',
    explanation:'Y-perm swaps diagonal corners and may also permute some last-layer edges.',
    expected:'All top corners are correctly positioned. Continue to step 7 if edges are wrong.',
    caution:'“No headlights” does not mean “zero corners in the correct position”. Those are different checks.'
   }
  }
 },
 'yellow-edges':{
  title:'Permute the last-layer edges',subtitle:'Last layer · Complete the cube',
  goal:'Place all four last-layer edges so they match their side centers, without disturbing solved corners or the yellow face.',
  instructions:[
   'Find an edge whose side sticker matches its center. If exactly one is correct, hold it at the back (UB).',
   'If none is correct, examine the arrows: H swaps opposite pairs, Z swaps adjacent pairs.',
   'Select Ua, Ub, H or Z. The H and Z examples use two Ua cycles with U adjustments to avoid unsupported slice notation.'
  ],
  check:'All six faces are uniform; the Rubik cube is solved.',
  cases:{
   ua:{
    title:'Ua — three-edge cycle in one direction',
    when:'One edge is correct at the back (UB). The front, right and left edges form a cycle.',
    hold:'Hold the solved edge at the back (B), yellow on top and white on bottom.',
    explanation:'The other three top edges cycle; all top corners remain unchanged.',
    expected:'All four top edges match their centers and the cube is solved.'
   },
   ub:{
    title:'Ub — reverse three-edge cycle',
    when:'One edge is correct at the back (UB); the other three edges cycle in the opposite direction to Ua.',
    hold:'Keep the correct edge at B and compare the direction arrows with Ua.',
    explanation:'The inverse three-edge cycle of Ua.',
    expected:'All four top edges match their centers and the cube is solved.'
   },
   'h-edges':{
    title:'H-perm — two opposite edge swaps',
    when:'No edge is correct: UF swaps with UB, and UR swaps with UL (opposite pairs).',
    hold:'Keep yellow up; the arrows point front ↔ back and right ↔ left.',
    explanation:'Combine two Ua cycles, with an intermediate U adjustment. Uses only six face symbols.',
    expected:'Both opposite edge pairs are placed correctly and the cube is solved.',
    caution:'A shorter H-perm uses the middle-slice M notation, not yet supported in this 3D input.'
   },
   'z-edges':{
    title:'Z-perm — two adjacent edge swaps',
    when:'No edge is correct: UF swaps with UR, and UB swaps with UL (adjacent pairs).',
    hold:'Keep yellow up; watch the two adjacent exchange arrows.',
    explanation:'Two Ua cycles with an opposite U adjustment from the H-perm.',
    expected:'Both adjacent edge pairs are placed correctly and the cube is solved.',
    caution:'This longer formula avoids the M notation. Learn Ua/Ub first before trying H/Z.'
   }
  }
 }
};
export const EN_LESSONS:readonly LearnLesson[]=LEARN_LESSONS.map(lesson=>{
 const t=dictionary[lesson.id];
 if(!t)return lesson;
 return {...lesson,...t,cases:lesson.cases.map(c=>({...c,...t.cases[c.id]}))};
});
