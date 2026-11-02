import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveToTurn,faceFromDrag,generateScramble,undoPlayMove,parseSavedHistory} from '../src/lib/play.ts';
test('clockwise face turns map to the right world-space axis',()=>{
 for(const move of ['R','L','U','D','F','B']){
  const t=moveToTurn(move);assert.equal(t.angle,-t.layer*Math.PI/2);
  assert.equal(moveToTurn(move+"'").angle,-t.angle);
  assert.equal(Math.abs(moveToTurn(move+'2').angle),Math.PI);
 }
});
test('drag across a visible face selects same axis and inverse gesture reverses',()=>{
 // front face, top row: drag right -> U prime (positive y rotation)
 assert.equal(faceFromDrag({x:0,y:0,z:1},{x:1,y:1,z:1},{x:0.6,y:0,z:0}),"U'");
 assert.equal(faceFromDrag({x:0,y:0,z:1},{x:1,y:1,z:1},{x:-0.6,y:0,z:0}),'U');
 // right side middle row, drag up -> F prime (positive z rotation)
 assert.equal(faceFromDrag({x:1,y:0,z:0},{x:1,y:0,z:1},{x:0,y:0.6,z:0}),"F'");
 assert.equal(faceFromDrag({x:0,y:0,z:1},{x:0,y:0,z:1},{x:0.01,y:0,z:0}),null);
 assert.equal(faceFromDrag({x:0,y:0,z:1},{x:0,y:0,z:1},{x:0.6,y:0,z:0}),null);
});
test('scramble is supported notation and skips same-axis consecutive turns',()=>{
 const moves=generateScramble(100);assert.equal(moves.length,100);
 const axis=f=>'RL'.includes(f)?'x':'UD'.includes(f)?'y':'z';
 for(let i=1;i<moves.length;i++)assert.notEqual(axis(moves[i][0]),axis(moves[i-1][0]));
 assert.equal(undoPlayMove(['R','U']),"U'");
});
test('saved game history rejects malformed data',()=>{
 assert.deepEqual(parseSavedHistory(['R',"U'",'F2']),['R',"U'",'F2']);
 assert.deepEqual(parseSavedHistory(['X']),[]);
 assert.deepEqual(parseSavedHistory({hello:1}),[]);
});
