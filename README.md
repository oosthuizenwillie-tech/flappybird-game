# Smiley Honey

A smiling bee flies through round garden rocks in this responsive, dependency-free
browser game drawn with Canvas. Catch regular flowers for 1 nectar point or golden Tupelo blossoms for 5 points.
Flowers appear in rock gaps; passing obstacles alone earns no points. Includes scoring,
local personal bests, keyboard/touch controls, pause, and automatic pause when hidden.

## Develop

Requires Node.js 18+ for tests and Python 3 for the development server.
No package installation or build is needed.

```sh
npm start
```

The server runs on port 8000. Use a browser to play. Press Space or Arrow Up,
click the game, or tap to flap. Press P or Escape to pause/resume.

```sh
npm test
```

Tests cover movement, collisions, flower collection, Tupelo bonuses, pipe spawning, and end-of-game state.
Best scores are stored only in your browser; storage restrictions do not block play.

For manual validation, start a flight, clear a pipe, collide, restart, and check
pause/resume and touch input. There are no external assets, credentials, or services.

Hornets arrive after a warning and pursue briefly. Bug spray emits a harmful cloud.
The bee has three hearts and brief immunity after a hazard hit; rock or boundary
collisions end the flight immediately.
