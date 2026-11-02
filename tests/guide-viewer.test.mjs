import {test} from 'node:test';
import assert from 'node:assert/strict';
import Cube from 'cubejs';
import {viewerSetupMoves} from '../src/lib/guideViewer.ts';
import {invertMoves,SOLVED} from '../src/lib/cube.ts';

test('guide 3D reconstructs every confirmed physical state from solver moves',()=>{
 const solution=['R',"U'",'F2','D','B2',"L'",'U2'];
 const initial=new Cube();initial.move(invertMoves(solution).join(' '));
 for(let confirmed=0;confirmed<=solution.length;confirmed++){
  const expected=new Cube();expected.move(invertMoves(solution).join(' '));expected.move(solution.slice(0,confirmed).join(' '));
  const rendered=new Cube();rendered.move(viewerSetupMoves(solution,confirmed,'manual').join(' '));
  assert.equal(rendered.asString(),expected.asString(),`mismatch at move ${confirmed}`);
 }
 const solved=new Cube();solved.move(viewerSetupMoves(solution,solution.length,'manual').join(' '));
 assert.equal(solved.asString(),SOLVED);
});
test('automatic 3D always begins with scrambled state, not physical progress',()=>{
 const moves=['R','U',"R'",'F2'];
 const origin=new Cube();origin.move(invertMoves(moves).join(' '));
 for(const confirmed of [0,1,2,moves.length]){
  const c=new Cube();c.move(viewerSetupMoves(moves,confirmed,'auto').join(' '));
  assert.equal(c.asString(),origin.asString());
 }
});
test('invalid viewer indices are rejected',()=>{
 assert.throws(()=>viewerSetupMoves(['R'],2,'manual'),/Invalid/);
 assert.throws(()=>viewerSetupMoves(['R'],-1,'auto'),/Invalid/);
 assert.throws(()=>viewerSetupMoves(['R'],0.5,'manual'),/Invalid/);
});
