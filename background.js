// Trippy parallax background.
//
// Layers are drawn back to front. Each one scrolls on its own over time and
// also shifts a little when the player moves, by its own `depth`: far layers
// barely move, near layers move a lot. That difference is the parallax.

const Background = (() => {
  // Slow everything way down for people who ask for less motion.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SPEED = reduceMotion ? 0.15 : 1;

  // How far each layer has scrolled, in pixels: time drift plus player offset.
  const scrollFor = (depth, t, playerX) => depth * (t * 60 * SPEED + playerX * 0.6);

  // Sky: a gradient whose colours keep rolling around the colour wheel.
  function drawSky(ctx, w, h, t) {
    const hue = (t * 25 * SPEED) % 360;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, `hsl(${hue}, 90%, 55%)`);
    g.addColorStop(0.5, `hsl(${hue + 60}, 90%, 60%)`);
    g.addColorStop(1, `hsl(${hue + 140}, 90%, 55%)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  // Far away: a slowly spinning sunburst of coloured rays.
  function drawSunburst(ctx, w, h, t, playerX) {
    const cx = w * 0.5 - scrollFor(0.05, 0, playerX);
    const cy = h * 0.42;
    const rays = 24;
    const radius = Math.hypot(w, h);
    const spin = t * 0.25 * SPEED;
    ctx.save();
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < rays; i++) {
      const a0 = spin + (i / rays) * Math.PI * 2;
      const a1 = a0 + Math.PI / rays;
      ctx.fillStyle = `hsl(${(i * 40 + t * 80 * SPEED) % 360}, 100%, 65%)`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Pulsing rings around the centre of the sunburst.
    ctx.save();
    ctx.lineWidth = 6;
    for (let i = 0; i < 8; i++) {
      const r = ((i * 60 + t * 50 * SPEED) % 480) + 10;
      ctx.globalAlpha = 0.5 * (1 - r / 490);
      ctx.strokeStyle = `hsl(${(i * 45 - t * 90 * SPEED) % 360}, 100%, 70%)`;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Wobbly hills. Built from sine waves, so they repeat forever as they scroll.
  const hills = [
    { depth: 0.15, base: 0.55, amp: 70, freq: 0.006, hue: 280, alpha: 0.75 },
    { depth: 0.35, base: 0.66, amp: 55, freq: 0.009, hue: 200, alpha: 0.8 },
    { depth: 0.7, base: 0.76, amp: 40, freq: 0.013, hue: 120, alpha: 0.85 },
  ];

  function drawHills(ctx, w, h, t, playerX, layer, index) {
    const offset = scrollFor(layer.depth, t, playerX);
    const wobble = t * (1 + index * 0.5) * SPEED;
    const hue = (layer.hue + t * 40 * SPEED) % 360;
    const g = ctx.createLinearGradient(0, h * (layer.base - 0.15), 0, h);
    g.addColorStop(0, `hsla(${hue}, 100%, 60%, ${layer.alpha})`);
    g.addColorStop(1, `hsla(${hue + 90}, 100%, 35%, ${layer.alpha})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const u = (x + offset) * layer.freq;
      const y =
        h * layer.base -
        Math.sin(u) * layer.amp -
        Math.sin(u * 2.3 + wobble) * layer.amp * 0.35 -
        Math.sin(u * 0.5 - wobble * 0.7) * layer.amp * 0.5;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  }

  // Close up: glowing bubbles that bob along and wrap around the screen.
  const bubbles = Array.from({ length: 18 }, (_, i) => ({
    x: Math.random() * 1000,
    y: 40 + Math.random() * 300,
    r: 8 + Math.random() * 22,
    depth: 0.4 + Math.random() * 0.8,
    phase: Math.random() * Math.PI * 2,
    hue: i * 20,
  }));

  function drawBubbles(ctx, w, h, t, playerX) {
    const span = w + 100; // wrap a little off-screen so bubbles don't pop in
    ctx.save();
    for (const b of bubbles) {
      const x = ((((b.x - scrollFor(b.depth, t, playerX)) % span) + span) % span) - 50;
      const y = b.y + Math.sin(t * 1.5 * SPEED + b.phase) * 20;
      const r = b.r * (1 + 0.2 * Math.sin(t * 3 * SPEED + b.phase));
      const hue = (b.hue + t * 120 * SPEED) % 360;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${hue}, 100%, 85%, 0.9)`);
      g.addColorStop(0.6, `hsla(${hue + 60}, 100%, 60%, 0.5)`);
      g.addColorStop(1, `hsla(${hue + 120}, 100%, 50%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw the whole background. `t` is seconds since the game started.
  function draw(ctx, w, h, t, playerX) {
    drawSky(ctx, w, h, t);
    drawSunburst(ctx, w, h, t, playerX);
    hills.forEach((layer, i) => drawHills(ctx, w, h, t, playerX, layer, i));
    drawBubbles(ctx, w, h, t, playerX);
  }

  return { draw };
})();
