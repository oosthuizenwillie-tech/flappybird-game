import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, flap, step, FLOOR } from './physics.js';
test('flapping moves the bird up and gravity pulls it down', () => {
  const game=createGame(); flap(game); step(game,.1); assert.ok(game.y<270);
  step(game,.5); assert.ok(game.velocity>0);
});
test('hitting floor or ceiling ends a flight', () => {
  for(const y of [5,FLOOR-5]){const game=createGame();game.y=y;step(game,.001);assert.equal(game.alive,false);}
});
test('a rock gap permits passage without awarding flower points', () => {
  const game=createGame();game.y=270;game.pipes=[{x:70,top:180,scored:false}];
  step(game,.001);assert.equal(game.alive,true);
  game.pipes[0].x=30;step(game,.001);assert.equal(game.score,0);
  step(game,.001);assert.equal(game.score,0);
});
test('colliding with either rock ends flight', () => {
  for(const y of [144,386]){const game=createGame();game.y=y;game.pipes=[{x:86,top:180,scored:false}];step(game,.001);assert.equal(game.alive,false);}
});
test('pipes spawn and old pipes are removed', () => {
  const game=createGame();game.nextPipe=0;step(game,.01,()=>.5);assert.equal(game.pipes.length,1);assert.equal(game.pipes[0].top,205);
  game.pipes[0].x=-100;step(game,.01);assert.equal(game.pipes.length,0);
});
test('a finished flight cannot move or score', () => {
  const game=createGame();game.alive=false;const before=structuredClone(game);flap(game);step(game,1);assert.deepEqual(game,before);
});

test('regular flowers score once and Tupelo awards five points', () => {
  for (const [type,points] of [['flower',1],['tupelo',5]]) {
    const game=createGame();game.flowers=[{x:120,y:270,type}];
    step(game,.001);assert.equal(game.score,points);assert.equal(game.collected,1);
    assert.equal(game.tupelo,type==='tupelo'?1:0);assert.equal(game.flowers.length,0);
    step(game,.001);assert.equal(game.score,points);
  }
});
test('missing a flower earns no points and removes it after it leaves', () => {
  const game=createGame();game.flowers=[{x:120,y:400,type:'flower'}];
  step(game,.001);assert.equal(game.score,0);assert.equal(game.flowers.length,1);
  game.flowers[0].x=-30;step(game,.001);assert.equal(game.flowers.length,0);
});
test('flowers spawn safely inside gaps, including Tupelo', () => {
  for(const value of [.1,.5]) {
    const game=createGame();game.nextPipe=0;step(game,.01,()=>value);
    assert.equal(game.flowers[0].y,game.pipes[0].top+85);
    assert.equal(game.flowers[0].type,value<.25?'tupelo':'flower');
  }
});
test('a fatal collision cannot award a flower pickup', () => {
  const game=createGame();game.y=585;game.flowers=[{x:120,y:585,type:'tupelo'}];
  step(game,.001);assert.equal(game.alive,false);assert.equal(game.score,0);
});

test('empty space beside round rocks is safe', () => {
  const game=createGame();game.y=50;game.pipes=[{x:86,top:180}];step(game,.001);
  assert.equal(game.alive,true);
});
test('hornets warn before pursuing and damage only once during immunity', () => {
  const game=createGame();game.hazards=[{type:'hornet',x:120,y:270,age:0}];
  step(game,.001);assert.equal(game.health,3);
  game.hazards[0].age=1.1;step(game,.001);assert.equal(game.health,2);
  step(game,.001);assert.equal(game.health,2);
});
test('active spray harms bee; three hits end flight', () => {
  const game=createGame();game.hazards=[{type:'spray',x:168,y:270,age:1.1}];
  for(let i=0;i<3;i++){game.invincible=0;step(game,.001);}
  assert.equal(game.health,0);assert.equal(game.alive,false);assert.match(game.deathReason,/spray/);
});
test('hazards alternate and expire rather than chase forever', () => {
  const game=createGame();game.nextHazard=0;step(game,.001);assert.equal(game.hazards[0].type,'hornet');
  game.nextHazard=0;step(game,.001);assert.equal(game.hazards[1].type,'spray');
  game.hazards[0].age=6;game.hazards[1].x=-150;step(game,.001);assert.equal(game.hazards.length,0);
});
test('restart restores health and clears threats', () => {
  const game=createGame();assert.equal(game.health,3);assert.deepEqual(game.hazards,[]);assert.equal(game.invincible,0);
});
