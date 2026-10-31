// Your Turn Now — a platformer built one turn at a time.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Physics (units are pixels and seconds)
const GRAVITY = 2000;
const MOVE_SPEED = 300;
const JUMP_SPEED = 750;

// Level: a single flat floor
const ground = { x: 0, y: HEIGHT - 80, w: WIDTH, h: 80 };

// Player: just a square
const player = {
  x: 100,
  y: ground.y - 40,
  size: 40,
  vx: 0,
  vy: 0,
  onGround: true,
};

// Input
const keys = new Set();
const JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];
let jumpQueued = false; // remembers quick taps that start and end between frames
window.addEventListener("keydown", (e) => {
  keys.add(e.code);
  if (JUMP_KEYS.includes(e.code) && !e.repeat) jumpQueued = true;
  if (["Space", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
});
window.addEventListener("keyup", (e) => keys.delete(e.code));

const left = () => keys.has("ArrowLeft") || keys.has("KeyA");
const right = () => keys.has("ArrowRight") || keys.has("KeyD");

function update(dt) {
  player.vx = (right() ? MOVE_SPEED : 0) - (left() ? MOVE_SPEED : 0);

  if (jumpQueued && player.onGround) {
    player.vy = -JUMP_SPEED;
    player.onGround = false;
  }
  jumpQueued = false;

  player.vy += GRAVITY * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // Land on the floor
  if (player.y + player.size >= ground.y) {
    player.y = ground.y - player.size;
    player.vy = 0;
    player.onGround = true;
  }

  // Stay inside the screen horizontally
  player.x = Math.max(0, Math.min(WIDTH - player.size, player.x));
}

function draw(t) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  Background.draw(ctx, WIDTH, HEIGHT, t, player.x);

  ctx.fillStyle = "#4a7c3a";
  ctx.fillRect(ground.x, ground.y, ground.w, ground.h);

  ctx.fillStyle = "#e8504a";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1 / 30); // clamp to avoid big jumps after tab switches
  last = now;
  update(dt);
  draw(now / 1000);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
