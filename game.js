import { createGame, flap, step, WIDTH, HEIGHT, FLOOR, BIRD_X, PIPE_WIDTH, GAP } from './physics.js';
const canvas = document.querySelector('#game'), ctx = canvas.getContext('2d');
const healthLabel = document.querySelector('#health');
const overlay = document.querySelector('#overlay'), pauseButton = document.querySelector('#pause');
let game = createGame(), mode = 'ready', best = 0, last = 0, sceneTime = 0;
try { best = Number(localStorage.getItem('smiley-flower-best')) || 0; } catch {}
document.querySelector('#best').textContent = best;
function announce(text) { document.querySelector('#announcement').textContent = text; }
function start() {
  game = createGame(); flap(game); mode = 'playing'; overlay.hidden = true;
  pauseButton.disabled = false; pauseButton.textContent = 'Pause';
  document.querySelector('#score').textContent = '0'; healthLabel.textContent = '♥ ♥ ♥'; healthLabel.setAttribute('aria-label', '3 hearts remaining'); canvas.focus(); announce('Flight started.');
}
function finish() {
  mode = 'over'; pauseButton.disabled = true;
  best = Math.max(best, game.score);
  try { localStorage.setItem('smiley-flower-best', String(best)); } catch {}
  document.querySelector('#best').textContent = best;
  document.querySelector('#title').textContent = 'Another sweet flight?';
  document.querySelector('#message').textContent = `${game.deathReason} You gathered ${game.collected} flowers, including ${game.tupelo} Tupelo. ${game.score} nectar points! Your best is ${best}.`;
  document.querySelector('#start').innerHTML = 'Buzz again <span>↗</span>';
  overlay.hidden = false; announce(`Game over. Score ${game.score}. Best ${best}.`);
}
function pause() {
  if (mode !== 'playing' && mode !== 'paused') return;
  mode = mode === 'playing' ? 'paused' : 'playing';
  pauseButton.textContent = mode === 'paused' ? 'Resume' : 'Pause';
  announce(mode === 'paused' ? 'Flight paused.' : 'Flight resumed.');
}
document.querySelector('#start').addEventListener('click', start);
canvas.addEventListener('pointerdown', event => { event.preventDefault(); if (mode === 'ready' || mode === 'over') start(); else if (mode === 'playing') flap(game); });
pauseButton.addEventListener('click', pause);
document.addEventListener('keydown', event => {
  if (event.target.closest('button, a, input, textarea, select')) return;
  if (['Space', 'ArrowUp'].includes(event.code)) { event.preventDefault(); if (event.repeat) return; if (mode === 'ready' || mode === 'over') start(); else if (mode === 'playing') flap(game); }
  if (event.code === 'KeyP' || event.code === 'Escape') pause();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') pause(); });
function rounded(x,y,w,h,r,color) { ctx.fillStyle=color; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }
function cloud(x,y,s) { ctx.fillStyle='#ffffff85'; ctx.beginPath(); ctx.ellipse(x,y,42*s,13*s,0,0,Math.PI*2); ctx.ellipse(x-12*s,y-10*s,19*s,20*s,0,0,Math.PI*2); ctx.ellipse(x+12*s,y-8*s,16*s,16*s,0,0,Math.PI*2); ctx.fill(); }
function drawRock(x,y) {
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#828d91';ctx.strokeStyle='#566568';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(0,0,36,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.fillStyle='#aab6b2';ctx.beginPath();ctx.moveTo(-28,-12);ctx.lineTo(-12,-29);ctx.lineTo(13,-25);ctx.lineTo(4,-6);ctx.lineTo(-14,3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#68777c';ctx.beginPath();ctx.moveTo(4,-6);ctx.lineTo(32,-9);ctx.lineTo(26,23);ctx.lineTo(4,32);ctx.lineTo(-14,3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#82a75a';ctx.beginPath();ctx.ellipse(-6,-27,20,6,-.1,0,Math.PI*2);ctx.fill();ctx.restore();
}
function drawHazard(hazard) {
  ctx.save();ctx.translate(hazard.x,hazard.y);
  if(hazard.type==='hornet') {
    ctx.fillStyle='#ffffffb0';for(const x of [-6,8]){ctx.beginPath();ctx.ellipse(x,-17,7,14,Math.sin(sceneTime*40)*.5,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#b64b28';ctx.beginPath();ctx.ellipse(0,0,21,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#392c32';ctx.fillRect(-10,-10,5,20);ctx.fillRect(2,-12,5,24);ctx.beginPath();ctx.arc(17,-2,9,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ffe1b7';ctx.beginPath();ctx.arc(20,-4,2,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#392c32';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(15,-9);ctx.lineTo(20,-20);ctx.moveTo(20,-9);ctx.lineTo(28,-17);ctx.stroke();
  } else {
    if(hazard.age>1){ctx.fillStyle='#af79c980';for(const [x,y,r] of [[-35,0,28],[-55,-15,24],[-60,15,25]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}
    rounded(-12,-24,24,48,5,'#b85175');rounded(-8,-33,16,10,2,'#53354b');
    ctx.fillStyle='#fff6df';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText('BUG',0,-2);ctx.fillText('SPRAY',0,10);
  }
  ctx.fillStyle='#743746';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(hazard.age<=1?'! WATCH OUT':hazard.type==='hornet'?'HORNET':'DODGE SPRAY',0,-43);ctx.restore();
}
function drawFlower(flower) {
  const special = flower.type === 'tupelo';
  ctx.save();ctx.translate(flower.x,flower.y);
  if(special){ctx.fillStyle='#fff5b7b0';ctx.beginPath();ctx.arc(0,0,27+Math.sin(sceneTime*4)*2,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#729044';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(0,25);ctx.stroke();
  ctx.fillStyle='#8ca456';ctx.beginPath();ctx.ellipse(5,18,7,3,-.5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=special?'#ffbc18':'#ec79a4';
  for(let i=0;i<(special?10:6);i++){
    const a=i*Math.PI*2/(special?10:6);ctx.beginPath();ctx.ellipse(Math.cos(a)*10,Math.sin(a)*10,special?7:8,special?4:6,a,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle=special?'#fff2a6':'#e6a426';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#65411d';ctx.font='bold 11px system-ui';ctx.textAlign='center';
  ctx.fillText(special?'TUPELO +5':'+1',0,-32);ctx.restore();
}
function draw() {
  const sky=ctx.createLinearGradient(0,0,0,HEIGHT); sky.addColorStop(0,'#8edcdd'); sky.addColorStop(1,'#fdf1bc'); ctx.fillStyle=sky; ctx.fillRect(0,0,WIDTH,HEIGHT);
  ctx.fillStyle='#ffd24b'; ctx.beginPath(); ctx.arc(389,90,34,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#82541e';for(const x of [379,398]){ctx.beginPath();ctx.arc(x,84,2.5,0,Math.PI*2);ctx.fill();}
  ctx.strokeStyle='#82541e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(389,89,12,.2,Math.PI-.2);ctx.stroke();
  ctx.save();ctx.fillStyle='#315952';ctx.font='bold 10px system-ui';ctx.textAlign='left';ctx.fillText('SMILEY HONEY · NECTAR QUEST',18,26);ctx.restore();
  for(let i=0;i<4;i++) cloud(((i*165+80-sceneTime*10)%660+660)%660-70,140+(i%2)*100,.85+i*.07);
  ctx.fillStyle='#7aba6eaa'; ctx.beginPath(); ctx.moveTo(0,FLOOR); for(let x=0;x<=WIDTH;x+=10)ctx.lineTo(x,510+Math.sin(x*.016)*25); ctx.lineTo(WIDTH,FLOOR);ctx.fill();
  for(const pipe of game.pipes) {
    drawRock(pipe.x+PIPE_WIDTH/2,pipe.top-36);
    drawRock(pipe.x+PIPE_WIDTH/2,pipe.top+GAP+36);
  }
  for(const hazard of game.hazards) drawHazard(hazard);
  if(mode==='playing' && game.hazards.some(h=>h.age<1.2)) {
    ctx.save();rounded(105,42,270,30,15,'#fff2df');ctx.fillStyle='#923d43';ctx.textAlign='center';ctx.font='bold 12px system-ui';
    ctx.fillText(game.hazards.at(-1).type==='hornet'?'Hornet incoming! Keep moving!':'Bug spray ahead! Dodge the cloud!',WIDTH/2,62);ctx.restore();
  }
  for(const flower of game.flowers) drawFlower(flower);
  for(const pickup of game.pickups){
    ctx.save();ctx.globalAlpha=Math.min(1,pickup.ttl*2);ctx.fillStyle='#754d15';ctx.textAlign='center';ctx.font='bold 22px system-ui';
    ctx.fillText(pickup.points===5?'Tupelo! +5':'+1',pickup.x,pickup.y-(.8-pickup.ttl)*35);ctx.restore();
  }
  ctx.fillStyle='#73aa55';ctx.fillRect(0,FLOOR,WIDTH,9);ctx.fillStyle='#f8df9a';ctx.fillRect(0,FLOOR+9,WIDTH,HEIGHT-FLOOR);
  for(let i=0;i<12;i++){
    const x=i*43+12;ctx.fillStyle=i%2?'#ed80a2':'#fff7da';
    for(let petal=0;petal<5;petal++){const a=petal*Math.PI*2/5;ctx.beginPath();ctx.arc(x+Math.cos(a)*5,FLOOR-8+Math.sin(a)*5,4,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#f7c132';ctx.beginPath();ctx.arc(x,FLOOR-8,3,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#dab263';for(let x=-30;x<WIDTH;x+=30)ctx.fillRect(x-(sceneTime*40%30),FLOOR+18,16,3);
  const y=mode==='ready'?270+Math.sin(sceneTime*3)*7:game.y;
  ctx.save();if(game.invincible>0)ctx.globalAlpha=Math.sin(sceneTime*30)>0?1:.4;ctx.translate(BIRD_X,y);ctx.rotate(mode==='ready'?0:Math.max(-.4,Math.min(1.2,game.velocity/650)));
  // Translucent wings flutter behind the striped body.
  const wing = Math.sin(sceneTime * 35) * .3;
  ctx.fillStyle='#ffffffcc';ctx.strokeStyle='#bc974b';ctx.lineWidth=1;
  for(const [x,angle] of [[-9,-.7-wing],[2,.4+wing]]) {
    ctx.beginPath();ctx.ellipse(x,-18,8,16,angle,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.fillStyle='#503516';ctx.beginPath();ctx.moveTo(-20,-3);ctx.lineTo(-28,1);ctx.lineTo(-20,6);ctx.fill();
  ctx.fillStyle='#f7c538';ctx.beginPath();ctx.ellipse(-4,1,20,15,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.beginPath();ctx.ellipse(-4,1,20,15,0,0,Math.PI*2);ctx.clip();
  ctx.fillStyle='#503516';ctx.fillRect(-17,-15,6,33);ctx.fillRect(-4,-15,6,33);ctx.restore();
  ctx.fillStyle='#ffd451';ctx.beginPath();ctx.arc(13,0,13,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#503516';ctx.lineWidth=2;ctx.lineCap='round';
  for(const x of [9,18]){ctx.beginPath();ctx.moveTo(x,-10);ctx.quadraticCurveTo(x-3,-20,x+1,-23);ctx.stroke();ctx.fillStyle='#503516';ctx.beginPath();ctx.arc(x+1,-23,2,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#503516';for(const x of [10,20]){ctx.beginPath();ctx.arc(x,-3,1.8,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#f29a68';for(const x of [6,24]){ctx.beginPath();ctx.arc(x,2,2.8,0,Math.PI*2);ctx.fill();}
  ctx.beginPath();ctx.arc(15,1,5,.15,Math.PI-.15);ctx.stroke();ctx.restore();
  if(mode==='paused'){ctx.fillStyle='#50351699';ctx.fillRect(0,0,WIDTH,HEIGHT);ctx.fillStyle='#fff';ctx.font='bold 30px system-ui';ctx.textAlign='center';ctx.fillText('Flight paused',WIDTH/2,300);ctx.font='16px system-ui';ctx.fillText('Press P or select Resume',WIDTH/2,335);}
}
function frame(time) {
  const dt = Math.min((time-last)/1000 || 0, .033); last=time;
  if(mode!=='paused')sceneTime+=dt;
  if(mode==='playing'){step(game,dt);document.querySelector('#score').textContent=game.score;healthLabel.textContent=Array.from({length:3},(_,i)=>i<game.health?'♥':'♡').join(' ');healthLabel.setAttribute('aria-label',`${game.health} hearts remaining`);if(!game.alive)finish();}
  draw(); requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
