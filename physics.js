export const WIDTH = 480, HEIGHT = 640, FLOOR = 590;
export const BIRD_X = 120, RADIUS = 15, PIPE_WIDTH = 68, GAP = 170;
export function createGame() {
  return { y: 270, velocity: 0, pipes: [], elapsed: 0, nextPipe: .9, score: 0, flowers: [], collected: 0, tupelo: 0, pickups: [], alive: true, health: 3, invincible: 0, hazards: [], nextHazard: 5, hazardCount: 0, deathReason: '' };
}
export function flap(game) { if (game.alive) game.velocity = -340; }
export function step(game, dt, random = Math.random) {
  if (!game.alive) return;
  game.elapsed += dt;
  game.velocity += 1000 * dt;
  game.y += game.velocity * dt;
  game.nextPipe -= dt;
  if (game.nextPipe <= 0) {
    const top = 100 + random() * 210;
    game.pipes.push({ x: WIDTH + 10, top });
    game.flowers.push({ x: WIDTH + 10 + PIPE_WIDTH / 2, y: top + GAP / 2,
      type: random() < .25 ? 'tupelo' : 'flower' });
    game.nextPipe += 1.65;
  }
  for (const pipe of game.pipes) {
    pipe.x -= 165 * dt;
    // Two separate round boulders; collision follows their visible silhouette.
    for (const y of [pipe.top - 36, pipe.top + GAP + 36]) {
      if (Math.hypot(BIRD_X - pipe.x - PIPE_WIDTH / 2, game.y - y) < RADIUS + 36) {
        game.alive = false; game.deathReason = 'A rock ended your flight.';
      }
    }
  }
  game.pipes = game.pipes.filter(pipe => pipe.x + PIPE_WIDTH > -10);
  if (game.y - RADIUS <= 0 || game.y + RADIUS >= FLOOR) {
    game.alive = false; game.deathReason = 'You reached the edge of the garden.';
  }
  game.invincible = Math.max(0, game.invincible - dt);
  game.nextHazard -= dt;
  if (game.nextHazard <= 0) {
    const type = game.hazardCount++ % 2 === 0 ? 'hornet' : 'spray';
    game.hazards.push({ type, x: type === 'hornet' ? -45 : WIDTH + 40,
      y: type === 'hornet' ? game.y : 130 + random() * 310, age: 0 });
    game.nextHazard += 7;
  }
  for (const hazard of game.hazards) {
    hazard.age += dt;
    if (hazard.type === 'hornet') {
      if (hazard.age > 1) {
        hazard.x += 48 * dt;
        hazard.y += Math.max(-60 * dt, Math.min(60 * dt, game.y - hazard.y));
      }
    } else hazard.x -= 165 * dt;
    const active = hazard.age > 1;
    const hx = hazard.type === 'spray' ? hazard.x - 48 : hazard.x;
    const radius = hazard.type === 'spray' ? 38 : 18;
    if (game.alive && active && !game.invincible &&
        Math.hypot(BIRD_X - hx, game.y - hazard.y) < RADIUS + radius) {
      game.health--; game.invincible = 1.4;
      if (!game.health) { game.alive = false; game.deathReason = hazard.type === 'spray' ? 'Bug spray ended your flight.' : 'A hornet ended your flight.'; }
    }
  }
  game.hazards = game.hazards.filter(h => h.type === 'hornet' ? h.age < 5.5 : h.x > -100);
  for (const pickup of game.pickups) pickup.ttl -= dt;
  game.pickups = game.pickups.filter(pickup => pickup.ttl > 0);
  for (const flower of game.flowers) {
    flower.x -= 165 * dt;
    if (game.alive && Math.hypot(flower.x - BIRD_X, flower.y - game.y) <= RADIUS + 17) {
      const points = flower.type === 'tupelo' ? 5 : 1;
      game.score += points; game.collected++;
      if (flower.type === 'tupelo') game.tupelo++;
      flower.caught = true;
      game.pickups.push({ x: BIRD_X, y: game.y - 35, ttl: .8, points });
    }
  }
  game.flowers = game.flowers.filter(flower => !flower.caught && flower.x > -25);
}
