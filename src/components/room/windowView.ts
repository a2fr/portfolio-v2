import * as THREE from "three";
import { matte } from "./deskSetup";

export type Season = "winter" | "spring" | "summer" | "autumn";

/** Meteorological seasons, northern hemisphere: winter is December to February, and so on. */
export function seasonOf(date: Date): Season {
  const month = date.getMonth(); // 0 = January
  if (month === 11 || month < 2) return "winter";
  if (month < 5) return "spring";
  if (month < 8) return "summer";
  return "autumn";
}

/**
 * The outdoors seen through the window in the right wall, in room coordinates (the room's back corner at the
 * origin, the right wall's outer face at z = -0.2). The room is seen from high up, so the window looks down onto
 * the ground behind the house: everything here is kept low and close enough that the walls hide it from the
 * room view, and it only shows through the glass.
 */
export function buildWindowView(season: Season): WindowView {
  switch (season) {
    case "winter":
      return buildWinter();
    case "spring":
      return buildSpring();
    case "summer":
      return buildSummer();
    case "autumn":
      return buildAutumn();
  }
}

/** A season's view, and how to move it along (falling snow, leaves...) when it has anything that moves. */
export type WindowView = { group: THREE.Group; animate?: (seconds: number) => void };

/** The room camera's direction, from the room towards the camera; rays through the window run against it. */
const VIEW_DIR = new THREE.Vector3(1, 0.78, 1).normalize();
/** Where the view ray through the window crosses the wall at the horizon's height, a quarter of the way up. */
const HORIZON_AT = new THREE.Vector3(1.0, 1.25, -0.2);
/**
 * The ground stops here (z), so rays through the upper part of the window pass over its edge: that edge is the
 * horizon, and those rays go on to the sky behind and below it, where the room still hides it from outside.
 */
const GROUND_EDGE = -1.72;
/** Moonlight: every colour outside is pulled down and towards blue, since the room itself is lit by day. */
const NIGHT = new THREE.Color(0.4, 0.47, 0.72);

/** Seeded random numbers, so a view comes out the same on every visit. */
function seeded(seed: number) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

/** The view is lit by the room's lights, but neither casts nor takes the walls' shadows. */
function unshadowed(group: THREE.Group) {
  group.traverse((object) => {
    object.castShadow = false;
    object.receiveShadow = false;
  });
}

/** Moonlit snow with drifts against the walls, a snowman, snowy pines on the skyline, and a starry night sky. */
function buildWinter(): WindowView {
  const group = new THREE.Group();
  const snow = matte("#f3f6fa", 1);

  group.add(new THREE.Mesh(groundGeometry((x, z) => groundHeight(x, z, SNOW_BANK)), snow));

  // Ray-depth into the view is -0.2 - z; across the window it is x - z - 0.2 (0.45 at its left edge, 1.55 at its right).
  const snowman = buildSnowman(snow);
  snowman.position.set(-0.45, 0, -1.4); // left pane, head against the sky
  snowman.rotation.y = Math.PI / 4; // faces the window
  snowman.scale.setScalar(0.85);
  group.add(snowman);

  for (const [x, z, height] of [
    [-1.05, -1.74, 0.95],
    [-0.25, -1.78, 0.7],
    [-0.05, -1.72, 0.5],
  ]) {
    const tree = buildPine(height, snow);
    tree.position.set(x, 0.05, z);
    tree.rotation.y = x * 2.3;
    group.add(tree);
  }

  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) materials.add(object.material);
  });
  for (const material of materials) (material as THREE.MeshStandardMaterial).color.multiply(NIGHT);

  group.add(skyCard(paintNightSky));
  const snowfall = buildSnowfall();
  group.add(snowfall.points);
  unshadowed(group);
  return { group, animate: snowfall.animate };
}

/**
 * Things drifting down between the wall and the sky, in a slab around the view ray through the window. Ones
 * behind the ground's ridge are hidden by it; ones that fall out of the bottom come back in at the top. Positions
 * are worked out on the CPU: a few hundred of them, nothing to it next to rendering the frame.
 */
function fallingSlab(count: number, seed: number, speed: [number, number], sway: [number, number]) {
  const right = new THREE.Vector3(1, 0, -1).normalize(); // screen right, as seen from the room camera
  const [aMin, aMax] = [-0.65, 0.65]; // across the window
  const [bMin, bMax] = [-0.7, 1.35]; // up, from the horizon ray
  const [sMin, sMax] = [0.9, 3.3]; // depth along the view, clear of the wall and in front of the sky
  const rand = seeded(seed);
  const items = Array.from({ length: count }, () => ({
    a: aMin + rand() * (aMax - aMin),
    b: rand(), // fraction of the fall, offset per item
    s: sMin + rand() * (sMax - sMin),
    speed: speed[0] + rand() * (speed[1] - speed[0]), // m/s
    sway: sway[0] + rand() * (sway[1] - sway[0]),
    phase: rand() * Math.PI * 2,
  }));
  const span = bMax - bMin;
  /** Where item `i` is after `seconds`. */
  const place = (i: number, seconds: number, out: THREE.Vector3) => {
    const item = items[i];
    const fall = (item.b * span + seconds * item.speed) % span;
    out
      .copy(HORIZON_AT)
      .addScaledVector(VIEW_DIR, -item.s)
      .addScaledVector(right, item.a + item.sway * Math.sin(seconds * 1.3 + item.phase));
    out.y += bMax - fall;
    return out;
  };
  return { items, place };
}

/** Soft round snowflakes, as points. */
function buildSnowfall(count = 320) {
  const slab = fallingSlab(count, 23, [0.16, 0.28], [0.02, 0.06]);
  const positions = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const dot = document.createElement("canvas");
  dot.width = dot.height = 32;
  const ctx = dot.getContext("2d")!;
  const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, "rgba(255, 255, 255, 1)");
  glow.addColorStop(0.5, "rgba(255, 255, 255, 0.8)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 32, 32);
  const map = new THREE.CanvasTexture(dot);

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({ color: "#dfe7f7", size: 0.036, map, transparent: true, depthWrite: false }),
  );
  points.frustumCulled = false; // the flakes move; their bounds are never recomputed

  const at = new THREE.Vector3();
  const animate = (seconds: number) => {
    for (let i = 0; i < count; i++) slab.place(i, seconds, at).toArray(positions, i * 3);
    geometry.attributes.position.needsUpdate = true;
  };
  animate(0);
  return { points, animate };
}

/**
 * Unlit painted sky on a card square to the view, just beyond the ground's edge. It is a little larger than the
 * window seen from the room (being further away, it looks smaller), and the walls still cover all of it.
 * `paint` gets the canvas with the horizon ray halfway down it. A view can lift its horizon (`horizonY`, where
 * that ray crosses the wall) to show more ground; its card is then made shorter (`height`) to stay hidden.
 */
function skyCard(
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  horizonY = HORIZON_AT.y,
  height = 2.9,
) {
  const width = 2.0;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = Math.round((512 * height) / width);
  paint(canvas.getContext("2d")!, canvas.width, canvas.height);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const card = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map, fog: false }));
  card.position.set(HORIZON_AT.x, horizonY, HORIZON_AT.z).addScaledVector(VIEW_DIR, -3.5);
  card.lookAt(card.position.clone().add(VIEW_DIR));
  return card;
}

/** Deep blue night thinning to a glow on the horizon, a few hundred stars, and the moon in the top-right pane. */
function paintNightSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h / 2;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#050816");
  sky.addColorStop(0.55, "#0f1a3a");
  sky.addColorStop(0.9, "#2a3766");
  sky.addColorStop(1, "#46507e");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#46507e";
  ctx.fillRect(0, horizon, w, h - horizon); // behind the ground, in case an edge shows

  const rand = seeded(7);
  for (let i = 0; i < 380; i++) {
    const y = rand() ** 1.4 * horizon * 0.95; // thinning out towards the glow on the horizon
    const r = rand() < 0.08 ? 1.3 + rand() * 0.8 : 0.4 + rand() * 0.7;
    ctx.fillStyle = `hsla(${210 + rand() * 40} 80% 92% / ${0.45 + rand() * 0.55})`;
    ctx.beginPath();
    ctx.arc(rand() * w, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon, with a soft halo and a few faint maria.
  const [mx, my, mr] = [w * 0.64, h * 0.16, w * 0.04];
  const halo = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 5);
  halo.addColorStop(0, "rgba(220, 230, 255, 0.35)");
  halo.addColorStop(1, "rgba(220, 230, 255, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10);
  ctx.fillStyle = "#f4f1e4";
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(170, 170, 160, 0.35)";
  for (const [dx, dy, rr] of [
    [-0.3, -0.2, 0.3],
    [0.25, 0.1, 0.22],
    [-0.05, 0.35, 0.18],
  ]) {
    ctx.beginPath();
    ctx.arc(mx + dx * mr, my + dy * mr, rr * mr, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** How high snow banks up against the house; leaves only gather a little. */
const SNOW_BANK = 0.14;
const LEAF_BANK = 0.04;

/** Ground height at (x, z): gentle rolls, banked up against the walls, rising into a soft ridge at the horizon. */
function groundHeight(x: number, z: number, bank: number) {
  const toWall = Math.min(-0.2 - z, x < -0.2 ? -0.2 - x : Infinity);
  const roll = 0.025 * Math.sin(x * 2.1 + z * 0.7) + 0.02 * Math.sin(z * 3.3 - x * 1.4) + 0.012 * Math.sin(x * 7 + z * 5);
  const ridge = 0.05 * Math.exp(-(((z - GROUND_EDGE) / 0.3) ** 2)) * (1 + 0.5 * Math.sin(x * 4.3));
  return 0.03 + roll + ridge + bank * Math.exp(-toWall / 0.25);
}

/**
 * The ground behind the house as a grid, ending at the horizon. Cells far off to the side, which no ray through
 * the window reaches and which would peek out beside the room, are left out. With `colorAt`, it is vertex coloured;
 * a finer `step` gives small features in the height (puddle hollows) a smooth outline. `[zMin, zMax]` sets how far
 * back it runs, for a view with its own horizon.
 */
function groundGeometry(
  heightAt: (x: number, z: number) => number,
  colorAt?: (x: number, z: number) => THREE.Color,
  step = 0.05,
  [zMin, zMax] = [GROUND_EDGE, -0.2],
) {
  const [xMin, xMax] = [-3.4, 1.8];
  const cols = Math.round((xMax - xMin) / step);
  const rows = Math.round((zMax - zMin) / step);
  const positions: number[] = [];
  const colors: number[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const x = xMin + (c / cols) * (xMax - xMin);
      const z = zMin + (r / rows) * (zMax - zMin);
      positions.push(x, heightAt(x, z), z);
      if (colorAt) colors.push(...colorAt(x, z).toArray());
    }
  }
  const index: number[] = [];
  const at = (r: number, c: number) => r * (cols + 1) + c;
  const kept = (i: number) => positions[i * 3] - positions[i * 3 + 2] <= 2.5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const [a, b, d, e] = [at(r, c), at(r, c + 1), at(r + 1, c), at(r + 1, c + 1)];
      if (![a, b, d, e].every(kept)) continue;
      index.push(a, d, b, b, d, e);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (colorAt) geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** Three snowballs with coal eyes and buttons, a carrot nose, twig arms, a red scarf and a black hat. Faces +z. */
function buildSnowman(snow: THREE.Material) {
  const group = new THREE.Group();
  const coal = matte("#1d1d1f", 0.7);
  const sphere = (radius: number, y: number, material = snow, segments = 32) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments / 2), material);
    mesh.position.y = y;
    group.add(mesh);
    return mesh;
  };
  sphere(0.22, 0.19);
  const middle = 0.5;
  sphere(0.16, middle);
  const head = 0.725;
  sphere(0.115, head);

  for (const side of [-1, 1]) sphere(0.013, head + 0.03, coal, 12).position.set(side * 0.04, head + 0.03, 0.105);
  for (const dy of [0.07, 0, -0.07]) sphere(0.015, 0, coal, 12).position.set(0, middle + dy, Math.sqrt(0.16 ** 2 - dy ** 2));

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.1, 16), matte("#ec7a22", 0.6));
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, head, 0.115 + 0.04);
  group.add(nose);

  const twig = matte("#5a3d26", 0.9);
  for (const side of [-1, 1]) {
    const angle = side * (Math.PI / 2 - 0.5); // out to the side and a little up
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.009, 0.3, 8), twig);
    arm.rotation.z = -angle;
    arm.position.set(side * (0.14 + Math.cos(0.5) * 0.15), middle + 0.05 + Math.sin(0.5) * 0.15, 0);
    group.add(arm);
  }

  const wool = matte("#c2302f", 0.95);
  const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.028, 12, 32), wool);
  scarf.rotation.x = Math.PI / 2;
  scarf.position.y = head - 0.095;
  group.add(scarf);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.17, 0.02), wool);
  tail.position.set(0.06, head - 0.17, 0.135);
  tail.rotation.set(-0.35, 0, 0.15);
  group.add(tail);

  const felt = matte("#202024", 0.8);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 32), felt);
  brim.position.y = head + 0.095;
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.072, 0.11, 32), felt);
  crown.position.y = head + 0.15;
  group.add(brim, crown);
  return group;
}

/** A small pine: a trunk and three green tiers, each with snow sitting on its upper half. */
function buildPine(height: number, snow: THREE.Material) {
  const group = new THREE.Group();
  const trunkH = height * 0.16;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.03, height * 0.04, trunkH, 10), matte("#4a3424"));
  trunk.position.y = trunkH / 2;
  group.add(trunk);
  const needles = matte("#2d4a37", 0.85);
  const tiers = 3;
  for (let i = 0; i < tiers; i++) {
    const tierH = height * (0.42 - i * 0.06);
    const radius = height * (0.3 - i * 0.07);
    const apex = trunkH + height * (0.36 + i * 0.24);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(radius, tierH, 18), needles);
    cone.position.y = apex - tierH / 2;
    const capH = tierH * 0.55;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.57, capH, 18), snow);
    cap.position.y = apex - capH / 2 + 0.004;
    group.add(cone, cap);
  }
  return group;
}

/** Autumn foliage: reds, rusts, oranges, ambers and golds. */
const LEAF_COLORS = ["#c8321f", "#e04a22", "#ea6f24", "#f08a2a", "#f5a630", "#f7c23a", "#e9d14a", "#a8381e", "#8e4a1c"];
/** Fallen leaves: the same, browner on the whole, as they dry out. */
const FALLEN_COLORS = ["#c8321f", "#e04a22", "#ea6f24", "#f08a2a", "#f5a630", "#f7c23a", "#a8381e", "#8e4a1c", "#b0662a", "#7a3f1a"];
/**
 * A row of small trees along the skyline, each one colour: x, z, height. They sit by ray-depth (-0.2 - z, about
 * 1.3 to 1.5 m) and spread across the window (x - z - 0.2 runs 0.45 to 1.55 across it), clear of the leaf pile.
 */
const AUTUMN_TREES: { x: number; z: number; height: number; color: string }[] = [
  { x: -1.13, z: -1.68, height: 0.7, color: "#c8321f" },
  { x: -0.85, z: -1.6, height: 0.5, color: "#ea6f24" },
  { x: -0.8, z: -1.7, height: 0.62, color: "#f5a630" },
  { x: -0.51, z: -1.66, height: 0.55, color: "#a8381e" },
  { x: -0.25, z: -1.5, height: 0.42, color: "#f7c23a" },
  { x: -0.2, z: -1.7, height: 0.68, color: "#e04a22" },
  { x: 0.06, z: -1.64, height: 0.5, color: "#f08a2a" },
  { x: 0.18, z: -1.7, height: 0.6, color: "#e9b830" },
];
/** Rain: everything outside a little dimmer, greyer and cooler than in the room. */
const RAIN_LIGHT = new THREE.Color(0.72, 0.75, 0.82);
/** The mist the far woods fade into. */
const MIST = new THREE.Color("#b4b8bd");
/**
 * Puddles: x, z, mean radius. The window's sill hides the ground up to just in front of the trees, so they lie in
 * that thin visible strip among the trunks: one in the lower left pane, one at the foot of the lower right one.
 * Each is a shallow hollow in the ground with an uneven outline, holding flat water: the shore is wherever the
 * ground rises out of it, so it follows the ground's own bumps too.
 */
const PUDDLES = [
  { x: -0.72, z: -1.645, radius: 0.11, seed: 1.7 },
  { x: -0.37, z: -1.67, radius: 0.085, seed: 4.2 },
];
/** How deep the hollows go, and how far below the rim the water stands. */
const PUDDLE_DEPTH = 0.03;
const PUDDLE_FILL = 0.55;

/** Puddle `p`'s radius in direction `angle`: lobed and lopsided, and stretched across the view. */
function puddleReach(p: (typeof PUDDLES)[number], angle: number) {
  const lobes = 1 + 0.22 * Math.sin(2 * angle + p.seed) + 0.14 * Math.sin(3 * angle + p.seed * 2.3) + 0.08 * Math.sin(5 * angle + p.seed * 4.1);
  const across = 1 + 0.35 * Math.cos(2 * (angle + Math.PI / 4)); // longest along x = -z, screen left-right
  return p.radius * lobes * across;
}

/** How far into puddle `p` the point is: 0 at its centre, about 1 at its shore. */
function puddleDistance(p: (typeof PUDDLES)[number], x: number, z: number) {
  const dx = x - p.x;
  const dz = z - p.z;
  return Math.hypot(dx, dz) / puddleReach(p, Math.atan2(dz, dx));
}

/** Autumn ground: the usual rolls, with the puddles' hollows pressed into it. */
function autumnGround(x: number, z: number) {
  let dip = 0;
  for (const p of PUDDLES) dip += PUDDLE_DEPTH * (1 - THREE.MathUtils.smoothstep(puddleDistance(p, x, z), 0.55, 1.3));
  return groundHeight(x, z, LEAF_BANK) - dip;
}

/** Where puddle `p`'s water stands: part way down its hollow, measured from the ground at its centre. */
function puddleLevel(p: (typeof PUDDLES)[number]) {
  return groundHeight(p.x, p.z, LEAF_BANK) - PUDDLE_DEPTH * PUDDLE_FILL;
}
const LEAF_PILE = { x: 0.2, z: -1.45, radius: 0.2, height: 0.1 }; // lower right pane, clear of the puddles

/**
 * A rainy autumn afternoon: wet grass almost hidden under fallen leaves, gathered thickest under a row of small trees
 * each in its own red, orange or gold, a raked pile with its rake, puddles,
 * rain and a few leaves coming down, and a low grey sky over woods fading into mist.
 */
function buildAutumn(): WindowView {
  const group = new THREE.Group();
  const rand = seeded(41);

  // Ground: grass under a patchy carpet of leaf colour, heavier under the trees.
  const grass = [new THREE.Color("#6d8a3a"), new THREE.Color("#58742f"), new THREE.Color("#8a9a45")];
  const fallen = FALLEN_COLORS.map((color) => new THREE.Color(color));
  const underTrees = (x: number, z: number) =>
    Math.max(...AUTUMN_TREES.map((tree) => Math.exp(-((x - tree.x) ** 2 + (z - tree.z) ** 2) / (tree.height * 0.45) ** 2)));
  const mud = new THREE.Color("#4a3a2b");
  const ground = new THREE.Mesh(
    groundGeometry(
      autumnGround,
      (x, z) => {
        const patch = 0.5 + 0.25 * Math.sin(x * 9.1 + z * 4.3) + 0.25 * Math.sin(z * 11.7 - x * 6.2);
        const cover = Math.min(1, 0.35 + 0.65 * underTrees(x, z) + 0.3 * patch);
        const leaf = fallen[Math.floor(Math.abs(Math.sin(x * 37.1 + z * 91.7)) * fallen.length)];
        const color = grass[Math.floor(Math.abs(Math.sin(x * 13.3 - z * 7.9)) * grass.length)].clone().lerp(leaf, cover);
        // Bare, dark mud around and down into each puddle, fading out into the leaves.
        const near = Math.min(...PUDDLES.map((p) => puddleDistance(p, x, z)));
        return color.lerp(mud, 0.75 * (1 - THREE.MathUtils.smoothstep(near, 0.9, 1.6)));
      },
      0.02,
    ),
    new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.55 }), // wet
  );
  group.add(ground);

  for (const tree of AUTUMN_TREES) {
    const built = buildTwoGlobeTree(tree.height, tree.color, rand);
    built.position.set(tree.x, autumnGround(tree.x, tree.z) - 0.01, tree.z);
    built.rotation.y = Math.PI / 4 + (rand() - 0.5) * 0.4; // globes side by side as seen through the window
    group.add(built);
  }

  // Lots of single leaves lying on the ground, thickest under the trees, and heaped into the pile.
  const leafShape = leafGeometry();
  const lying = new THREE.InstancedMesh(leafShape, new THREE.MeshStandardMaterial({ roughness: 0.85, side: THREE.DoubleSide }), 1600);
  const place = new THREE.Object3D();
  const tint = new THREE.Color();
  let n = 0;
  while (n < 1150) {
    const x = -1.9 + rand() * 2.3;
    const z = GROUND_EDGE + rand() * (-0.25 - GROUND_EDGE);
    if (x - z > 2.5 || rand() > 0.25 + 0.75 * underTrees(x, z)) continue;
    if (PUDDLES.some((p) => puddleDistance(p, x, z) < 1.2)) continue; // floating ones are added with the water
    place.position.set(x, autumnGround(x, z) + 0.004, z);
    place.rotation.set(-Math.PI / 2 + (rand() - 0.5) * 0.5, (rand() - 0.5) * 0.5, rand() * Math.PI * 2, "YXZ");
    place.scale.setScalar(0.8 + rand() * 0.5);
    place.updateMatrix();
    lying.setMatrixAt(n, place.matrix);
    lying.setColorAt(n++, tint.set(FALLEN_COLORS[Math.floor(rand() * FALLEN_COLORS.length)]));
  }
  // The pile: a low dome of leaves, each laid on its surface at its own angle.
  const pile = LEAF_PILE;
  const pileBase = autumnGround(pile.x, pile.z);
  while (n < 1600) {
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand());
    const lift = pile.height * Math.sqrt(1 - r * r);
    place.position.set(pile.x + Math.cos(angle) * r * pile.radius, pileBase + lift, pile.z + Math.sin(angle) * r * pile.radius);
    place.rotation.set(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2);
    place.scale.setScalar(0.9 + rand() * 0.5);
    place.updateMatrix();
    lying.setMatrixAt(n, place.matrix);
    lying.setColorAt(n++, tint.set(FALLEN_COLORS[Math.floor(rand() * FALLEN_COLORS.length)]));
  }
  group.add(lying);
  // A solid core so the pile doesn't look see-through between its leaves.
  const core = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), matte("#b4521f", 1));
  core.scale.set(pile.radius * 0.92, pile.height * 0.9, pile.radius * 0.92);
  core.position.set(pile.x, pileBase, pile.z);
  group.add(core);

  const rake = buildRake();
  rake.position.set(pile.x + 0.24, pileBase, pile.z + 0.12);
  rake.rotation.y = Math.PI / 4 + 0.5;
  group.add(rake);

  // Water: one flat, glossy sheet per puddle at its level, cut a little wider than the shore so the hollow's rim
  // decides the outline. Pale, as it reflects the grey sky, with a few leaves floating on it.
  const water = new THREE.MeshStandardMaterial({ color: "#aab6c3", roughness: 0.05, metalness: 0.15 });
  for (const p of PUDDLES) {
    const outline = new THREE.Shape();
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const reach = puddleReach(p, angle) * 1.15;
      // Shape space (u, v) lies flat as (x, -z) once turned down onto the ground.
      if (i === 0) outline.moveTo(Math.cos(angle) * reach, -Math.sin(angle) * reach);
      else outline.lineTo(Math.cos(angle) * reach, -Math.sin(angle) * reach);
    }
    const sheet = new THREE.Mesh(new THREE.ShapeGeometry(outline), water);
    sheet.rotation.x = -Math.PI / 2;
    const level = puddleLevel(p);
    sheet.position.set(p.x, level, p.z);
    group.add(sheet);

    for (let i = 0; i < 3; i++) {
      const angle = rand() * Math.PI * 2;
      const out = puddleReach(p, angle) * rand() * 0.6;
      place.position.set(p.x + Math.cos(angle) * out, level + 0.001, p.z + Math.sin(angle) * out);
      place.rotation.set(-Math.PI / 2, 0, rand() * Math.PI * 2);
      place.scale.setScalar(0.9 + rand() * 0.3);
      place.updateMatrix();
      const floating = new THREE.Mesh(leafShape, new THREE.MeshStandardMaterial({ roughness: 0.4, side: THREE.DoubleSide }));
      floating.material.color.set(FALLEN_COLORS[Math.floor(rand() * FALLEN_COLORS.length)]);
      floating.applyMatrix4(place.matrix);
      group.add(floating);
    }
  }

  // Under rain: every surface outside dimmer and greyer.
  const materials = new Set<THREE.Material>();
  group.traverse((object) => {
    if (object instanceof THREE.Mesh) materials.add(object.material);
  });
  for (const material of materials) (material as THREE.MeshStandardMaterial).color.multiply(RAIN_LIGHT);

  group.add(skyCard(paintAutumnSky));
  const leaffall = buildLeafFall(leafShape, 30); // fewer: the rain brings them down rather than the wind
  (leaffall.leaves.material as THREE.MeshStandardMaterial).color.multiply(RAIN_LIGHT);
  const rain = buildRain();
  group.add(leaffall.leaves, rain.streaks);
  unshadowed(group);
  return {
    group,
    animate: (seconds) => {
      leaffall.animate(seconds);
      rain.animate(seconds);
    },
  };
}

/** A small pointed leaf, 5 cm long, lying in its own xy plane with its stalk at the origin. */
function leafGeometry() {
  const shape = new THREE.Shape()
    .moveTo(0, 0)
    .quadraticCurveTo(0.022, 0.016, 0, 0.05)
    .quadraticCurveTo(-0.022, 0.016, 0, 0);
  return new THREE.ShapeGeometry(shape, 4).translate(0, -0.022, 0);
}

/**
 * A small broadleaf tree in one colour: a plain, slightly leaning trunk running up into a big faceted globe of
 * leaves (or blossom), with a smaller globe tucked lower against its side.
 */
function buildTwoGlobeTree(height: number, color: string, rand: () => number) {
  const group = new THREE.Group();
  const side = rand() < 0.5 ? -1 : 1; // which side the small globe sits on
  const lean = new THREE.Group(); // the whole tree leans a touch away from the small globe
  lean.rotation.z = side * (0.05 + rand() * 0.05);
  group.add(lean);

  const trunkH = height * 0.66;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.035, height * 0.05, trunkH, 10), matte("#4b3427", 0.95));
  trunk.position.y = trunkH / 2;
  lean.add(trunk);

  const leaves = new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true });
  for (const globe of [
    { x: -side * height * 0.07, y: height * 0.8, r: height * (0.21 + rand() * 0.02) },
    { x: side * height * 0.17, y: height * 0.64, r: height * (0.13 + rand() * 0.02) },
  ]) {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(globe.r, 1), leaves);
    crown.position.set(globe.x, globe.y, (rand() - 0.5) * height * 0.06);
    crown.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    lean.add(crown);
  }
  return group;
}

/** A garden rake lying back against the pile: a wooden handle, and a green fan of tines at its foot. */
function buildRake() {
  const group = new THREE.Group();
  const length = 0.42;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, length, 8), matte("#b7864f", 0.7));
  handle.position.y = length / 2;
  const head = new THREE.Group();
  const green = matte("#2f7d4a", 0.6);
  for (let i = -4; i <= 4; i++) {
    const tine = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.09, 0.002), green);
    tine.position.set(Math.sin(i * 0.12) * 0.09, Math.cos(i * 0.12) * 0.09 - 0.045, 0);
    tine.rotation.z = -i * 0.12;
    head.add(tine);
  }
  head.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.006), green));
  head.rotation.x = Math.PI; // fans out below the handle's foot
  group.add(handle, head);
  group.rotation.z = 1.15; // leaning well back
  return group;
}

/** Leaves fluttering down, each tumbling about its own axis. */
function buildLeafFall(shape: THREE.BufferGeometry, count = 70) {
  const slab = fallingSlab(count, 59, [0.08, 0.16], [0.06, 0.14]);
  const rand = seeded(97);
  const spins = slab.items.map(() => ({
    axis: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
    rate: 1.5 + rand() * 2.5,
  }));
  const leaves = new THREE.InstancedMesh(shape, new THREE.MeshStandardMaterial({ roughness: 0.8, side: THREE.DoubleSide }), count);
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) leaves.setColorAt(i, tint.set(LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)]));
  leaves.frustumCulled = false; // they move; their bounds are never recomputed

  const at = new THREE.Vector3();
  const turn = new THREE.Quaternion();
  const size = new THREE.Vector3(1.3, 1.3, 1.3);
  const matrix = new THREE.Matrix4();
  const animate = (seconds: number) => {
    for (let i = 0; i < count; i++) {
      turn.setFromAxisAngle(spins[i].axis, seconds * spins[i].rate + slab.items[i].phase);
      leaves.setMatrixAt(i, matrix.compose(slab.place(i, seconds, at), turn, size));
    }
    leaves.instanceMatrix.needsUpdate = true;
  };
  animate(0);
  return { leaves, animate };
}

/** A low, rainy overcast with streaks of distant rain, over coloured woods fading into grey mist. */
function paintAutumnSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h / 2;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#5d636d");
  sky.addColorStop(0.6, "#8a9099");
  sky.addColorStop(1, "#b9bcbf");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Low, heavy rain clouds: overlapping dark and paler billows, thickest overhead.
  const rand = seeded(19);
  for (let i = 0; i < 70; i++) {
    const y = rand() ** 1.6 * horizon * 0.85;
    const shade = 80 + Math.round((y / horizon) * 70 + rand() * 30);
    ctx.fillStyle = `rgba(${shade}, ${shade + 4}, ${shade + 10}, ${0.35 + rand() * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(rand() * w, y, (0.08 + rand() * 0.12) * w, (0.02 + rand() * 0.03) * h, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Rain far off, as faint slanted streaks over the whole sky.
  ctx.strokeStyle = "rgba(225, 232, 240, 0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const y = rand() * horizon;
    const length = 10 + rand() * 18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - length * 0.15, y + length);
    ctx.stroke();
  }

  // Below the horizon (where rays slip past the ground's edge at the sides): leaf-strewn fields.
  const field = ctx.createLinearGradient(0, horizon * 0.96, 0, h);
  field.addColorStop(0, "#a98663");
  field.addColorStop(1, "#8a5a36");
  ctx.fillStyle = field;
  ctx.fillRect(0, horizon * 0.96, w, h - horizon * 0.96);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = FALLEN_COLORS[Math.floor(rand() * FALLEN_COLORS.length)];
    ctx.fillRect(rand() * w, horizon + rand() * (h - horizon), 2 + rand() * 3, 1.5 + rand() * 2);
  }

  // Woods: rows of rounded crowns in autumn tones, hazier and smaller the further back.
  for (const [rowY, haze, rowSize] of [
    [0.465, 0.6, 0.022],
    [0.485, 0.42, 0.028],
    [0.51, 0.25, 0.034],
    [0.54, 0.12, 0.04],
  ]) {
    for (let x = -20; x < w + 20; x += 9 + rand() * 10) {
      const color = new THREE.Color(LEAF_COLORS[Math.floor(rand() * LEAF_COLORS.length)]).lerp(MIST, haze);
      ctx.fillStyle = `#${color.getHexString()}`;
      const r = (0.6 + rand() * 0.6) * rowSize * h;
      ctx.beginPath();
      ctx.arc(x, rowY * h + (rand() - 0.5) * 6, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Rain: short, pale, slightly slanted streaks falling fast. */
function buildRain(count = 260) {
  const slab = fallingSlab(count, 71, [2.6, 3.4], [0, 0]);
  const streak = new THREE.Vector3(-0.012, -0.09, 0.012); // top to bottom of a drop's streak
  const positions = new Float32Array(count * 6);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const streaks = new THREE.LineSegments(
    geometry,
    new THREE.LineBasicMaterial({ color: "#d6dee8", transparent: true, opacity: 0.55, depthWrite: false }),
  );
  streaks.frustumCulled = false; // they move; their bounds are never recomputed

  const at = new THREE.Vector3();
  const animate = (seconds: number) => {
    for (let i = 0; i < count; i++) {
      slab.place(i, seconds, at).toArray(positions, i * 6);
      at.add(streak).toArray(positions, i * 6 + 3);
    }
    geometry.attributes.position.needsUpdate = true;
  };
  animate(0);
  return { streaks, animate };
}

/** Spring trees along the skyline, spaced so the meadow shows between them: x, z, height, colour. */
const SPRING_TREES: { x: number; z: number; height: number; color: string }[] = [
  { x: -1.08, z: -1.68, height: 0.72, color: "#f2a3c0" }, // cherry blossom
  { x: -0.72, z: -1.7, height: 0.55, color: "#7cc35b" }, // fresh green
  { x: -0.38, z: -1.66, height: 0.66, color: "#f6eef2" }, // white blossom
  { x: -0.1, z: -1.7, height: 0.5, color: "#a8d86a" }, // light green
  { x: 0.18, z: -1.68, height: 0.7, color: "#e57aa6" }, // deep pink blossom
];
/** Meadow flowers: poppy red, buttercup yellow, pink, violet, white, orange, cornflower blue. */
const FLOWER_COLORS = ["#e2342b", "#f7d031", "#f27bb0", "#9b5de5", "#ffffff", "#f5862a", "#4f7fe0", "#ffe45c"];

/**
 * A sunny spring morning: a meadow thick with flowers in every colour, trees in blossom and fresh leaf, a bright
 * sky with the sun and a few clouds, and small birds flitting past the window.
 */
function buildSpring(): WindowView {
  const group = new THREE.Group();
  const rand = seeded(83);

  // Grass in a few greens, speckled with flower colour so the meadow reads as full even between the flowers.
  const greens = ["#5f9e3a", "#6fb043", "#4e8a32", "#83bd4c"].map((color) => new THREE.Color(color));
  const blooms = FLOWER_COLORS.map((color) => new THREE.Color(color));
  const springGround = (x: number, z: number) => groundHeight(x, z, 0.02);
  group.add(
    new THREE.Mesh(
      groundGeometry(
        springGround,
        (x, z) => {
          const green = greens[Math.floor(Math.abs(Math.sin(x * 13.3 - z * 7.9)) * greens.length)].clone();
          const speck = Math.abs(Math.sin(x * 51.7 + z * 83.1));
          return speck > 0.82 ? green.lerp(blooms[Math.floor(speck * 97) % blooms.length], 0.7) : green;
        },
        0.02,
      ),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 }),
    ),
  );

  for (const tree of SPRING_TREES) {
    const built = buildTwoGlobeTree(tree.height, tree.color, rand);
    built.position.set(tree.x, springGround(tree.x, tree.z) - 0.01, tree.z);
    built.rotation.y = Math.PI / 4 + (rand() - 0.5) * 0.4; // globes side by side as seen through the window
    group.add(built);
  }

  // Flowers: a green stem and a faceted bloom each, all drawn as two instanced meshes. They fill the strip of
  // ground the window shows, from just behind the sill back to the horizon.
  const count = 1900;
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.0022, 0.003, 1, 4).translate(0, 0.5, 0), matte("#3f7d2c"), count);
  const heads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshStandardMaterial({ roughness: 0.7, flatShading: true }), count);
  const place = new THREE.Object3D();
  const tint = new THREE.Color();
  for (let i = 0; i < count; i++) {
    let x = 0;
    let z = 0;
    do {
      x = -1.9 + rand() * 2.4;
      z = GROUND_EDGE + rand() * 0.42;
    } while (x - z > 2.5);
    const y = springGround(x, z);
    const tall = 0.03 + rand() * 0.04;
    place.position.set(x, y, z);
    place.rotation.set((rand() - 0.5) * 0.3, 0, (rand() - 0.5) * 0.3);
    place.scale.set(1, tall, 1);
    place.updateMatrix();
    stems.setMatrixAt(i, place.matrix);
    const r = 0.012 + rand() * 0.01;
    place.position.y = y + tall;
    place.scale.set(r, r * 0.55, r);
    place.updateMatrix();
    heads.setMatrixAt(i, place.matrix);
    heads.setColorAt(i, tint.set(FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)]));
  }
  group.add(stems, heads);

  group.add(skyCard(paintSpringSky));
  const birds = buildBirds();
  group.add(birds.group);
  unshadowed(group);
  return { group, animate: birds.animate };
}

/**
 * Small birds flying past just outside, parallel to the wall: each crosses from one side of the window to the
 * other, flapping in bursts and gliding, then is gone for a while (beyond the window's edges the walls hide it).
 */
function buildBirds() {
  const group = new THREE.Group();
  const rand = seeded(5);
  const [xFrom, xTo] = [-0.9, 2.2]; // well past the window either way, still behind the walls
  const flights = [
    { z: -0.55, y: 1.55, speed: 0.95, period: 7, delay: 0, dir: 1 },
    { z: -0.62, y: 1.68, speed: 1.0, period: 7, delay: 0.35, dir: 1 },
    { z: -0.85, y: 1.35, speed: 0.8, period: 11, delay: 3.5, dir: -1 },
    { z: -0.7, y: 1.8, speed: 1.15, period: 13, delay: 8, dir: -1 },
  ].map((flight) => {
    const bird = buildBird(rand() < 0.5 ? "#5a4636" : "#3d4452");
    group.add(bird.group);
    return { ...flight, ...bird, phase: rand() * 10 };
  });

  const animate = (seconds: number) => {
    for (const f of flights) {
      const t = (seconds + f.period - f.delay) % f.period; // seconds into this bird's cycle
      const travelled = t * f.speed;
      const across = xTo - xFrom;
      f.group.visible = travelled < across;
      if (!f.group.visible) continue;
      const x = f.dir > 0 ? xFrom + travelled : xTo - travelled;
      f.group.position.set(x, f.y + 0.05 * Math.sin(t * 2.4 + f.phase), f.z);
      f.group.rotation.y = f.dir > 0 ? 0 : Math.PI; // built flying along +x
      // Bursts of quick flaps, then a short glide with the wings held out.
      const flapping = Math.sin(t * 1.7 + f.phase) > -0.3;
      const beat = flapping ? Math.sin(t * 26 + f.phase) * 0.9 : 0.12;
      f.left.rotation.x = beat;
      f.right.rotation.x = -beat;
    }
  };
  animate(0);
  return { group, animate };
}

/** A little bird about 7 cm long: a rounded body and head, a beak, a tail, and two wings hinged at the body. */
function buildBird(color: string) {
  const group = new THREE.Group();
  const feathers = matte(color, 0.8);
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), feathers);
  body.scale.set(1.9, 1, 1);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), feathers);
  head.position.set(0.027, 0.008, 0);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.012, 6), matte("#e3a43a", 0.6));
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.042, 0.007, 0);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.003, 0.014), feathers);
  tail.position.set(-0.035, 0.004, 0);
  tail.rotation.z = 0.25;
  group.add(body, head, beak, tail);

  // Each wing a flat tapered blade, hinged along the body so it beats up and down about x.
  const blade = new THREE.Shape().moveTo(-0.012, 0).lineTo(0.014, 0).lineTo(0.002, 0.05).lineTo(-0.014, 0.04).lineTo(-0.012, 0);
  const wingGeometry = new THREE.ShapeGeometry(blade).rotateX(Math.PI / 2); // lies flat, reaching out along +z
  const wingMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8, side: THREE.DoubleSide });
  const left = new THREE.Group();
  left.add(new THREE.Mesh(wingGeometry, wingMaterial));
  left.position.set(0.002, 0.006, 0.008);
  const right = new THREE.Group();
  const rightBlade = new THREE.Mesh(wingGeometry, wingMaterial);
  rightBlade.scale.z = -1; // mirrored, reaching out along -z
  right.add(rightBlade);
  right.position.set(0.002, 0.006, -0.008);
  group.add(left, right);
  group.scale.setScalar(1.4); // a touch bigger than life, so they read from the room
  return { group, left, right };
}

/** A bright spring sky: deep blue overhead to pale at the horizon, the sun with a glow, a few fluffy clouds, and fresh green woods with blossom. */
function paintSpringSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h / 2;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#3d8fe0");
  sky.addColorStop(0.6, "#7fbdf0");
  sky.addColorStop(1, "#d8eefa");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // The sun in the small top-left pane, with a wide warm glow.
  const [sx, sy, sr] = [w * 0.36, h * 0.15, w * 0.045];
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 7);
  glow.addColorStop(0, "rgba(255, 248, 210, 0.9)");
  glow.addColorStop(0.3, "rgba(255, 240, 190, 0.35)");
  glow.addColorStop(1, "rgba(255, 240, 190, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - sr * 7, sy - sr * 7, sr * 14, sr * 14);
  ctx.fillStyle = "#fffbe8";
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();

  const rand = seeded(29);
  for (const [cx, cy, size] of [
    [0.68, 0.14, 1],
    [0.3, 0.3, 0.7],
    [0.8, 0.34, 0.55],
  ]) {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + rand() * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(
        (cx + (rand() - 0.5) * 0.18 * size) * w,
        (cy + (rand() - 0.6) * 0.03 * size) * h,
        (0.04 + rand() * 0.04) * size * w,
        (0.02 + rand() * 0.018) * size * h,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // Below the horizon, where rays slip past the ground's edge: a meadow speckled with flowers.
  ctx.fillStyle = "#79b54a";
  ctx.fillRect(0, horizon * 0.96, w, h - horizon * 0.96);
  for (let i = 0; i < 900; i++) {
    ctx.fillStyle = FLOWER_COLORS[Math.floor(rand() * FLOWER_COLORS.length)];
    ctx.fillRect(rand() * w, horizon + rand() * (h - horizon), 2 + rand() * 2, 2 + rand() * 2);
  }

  // Woods: rows of rounded crowns in fresh greens with some blossom, hazier and smaller the further back.
  const woods = ["#5c9c3c", "#7cc35b", "#4f8a34", "#a8d86a", "#f2a3c0", "#f6eef2", "#6aa845"];
  const haze = new THREE.Color("#d8eefa");
  for (const [rowY, mist, rowSize] of [
    [0.465, 0.55, 0.022],
    [0.485, 0.38, 0.028],
    [0.51, 0.22, 0.034],
    [0.54, 0.1, 0.04],
  ]) {
    for (let x = -20; x < w + 20; x += 9 + rand() * 10) {
      const color = new THREE.Color(woods[Math.floor(rand() * woods.length)]).lerp(haze, mist);
      ctx.fillStyle = `#${color.getHexString()}`;
      const r = (0.6 + rand() * 0.6) * rowSize * h;
      ctx.beginPath();
      ctx.arc(x, rowY * h + (rand() - 0.5) * 6, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Summer lifts its horizon (where the sea meets the sky) higher up the window, so the beach and the sea get more of
 * it. The view ray through that height reaches sea level at SEA_EDGE, where the sea mesh hands over to the card.
 */
const SUMMER_HORIZON_Y = 1.6;
const SEA_EDGE = -0.2 - SUMMER_HORIZON_Y / 0.774; // the view ray drops 0.774 m per metre back in z
/** The waterline wanders a little along the beach (z at x). */
const shoreAt = (x: number) => -1.84 + 0.035 * Math.sin(x * 3.1) + 0.015 * Math.sin(x * 8.3 + 1);
/** Sand: rising gently from the waterline towards the house, dipping under the sea beyond it. */
const sandHeight = (x: number, z: number) =>
  0.06 * Math.tanh((z - shoreAt(x)) / 0.35) + 0.004 * Math.sin(x * 11 + z * 7) + 0.003 * Math.sin(x * 23 - z * 17);
/**
 * The sea as a grid laid along the view: rows run across the window (constant x - z) and end exactly on the
 * horizon line (x + z = constant, where the horizon ray meets sea level), which is level on screen, so the sea
 * meets the card's painted horizon without a step. It reaches back under the beach, where the sand covers it.
 */
function buildSea() {
  const horizonV = HORIZON_AT.x + 0.2 + 2 * SEA_EDGE; // x + z where the horizon ray meets the sea
  const [uMin, uMax, vMin, vMax] = [-0.4, 2.45, horizonV, -1.2]; // u = x - z, v = x + z
  const step = 0.04;
  const cols = Math.round((uMax - uMin) / step);
  const rows = Math.round((vMax - vMin) / step);
  const shallow = new THREE.Color("#5fd6d2");
  const mid = new THREE.Color("#25a6cc");
  const deep = new THREE.Color("#1c6fb8");
  const positions: number[] = [];
  const colors: number[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const u = uMin + (c / cols) * (uMax - uMin);
      const v = vMin + (r / rows) * (vMax - vMin);
      const [x, z] = [(u + v) / 2, (v - u) / 2];
      positions.push(x, 0, z);
      const out = shoreAt(x) - z; // metres offshore
      const color = out < 0.15 ? shallow.clone().lerp(mid, Math.max(0, out) / 0.15) : mid.clone().lerp(deep, Math.min(1, (out - 0.15) / 0.25));
      colors.push(color.r, color.g, color.b);
    }
  }
  const index: number[] = [];
  const at = (r: number, c: number) => r * (cols + 1) + c;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) index.push(at(r, c), at(r + 1, c), at(r, c + 1), at(r, c + 1), at(r + 1, c), at(r + 1, c + 1));
  }
  const geometry = new THREE.BufferGeometry();
  const position = new THREE.Float32BufferAttribute(positions, 3);
  const color = new THREE.Float32BufferAttribute(colors, 3);
  geometry.setAttribute("position", position);
  geometry.setAttribute("color", color);
  geometry.setIndex(index);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
  mesh.frustumCulled = false; // the surface moves; its bounds are never recomputed

  // Waves: bands of lighter water rolling in towards the beach, cresting white, with the water rising and falling a
  // little so it washes up and back down the sand. They die out offshore, so the far sea still meets the card.
  const base = Float32Array.from(colors);
  const vertices = (rows + 1) * (cols + 1);
  const offshore = new Float32Array(vertices);
  const across = new Float32Array(vertices);
  for (let i = 0; i < vertices; i++) {
    offshore[i] = shoreAt(positions[i * 3]) - positions[i * 3 + 2];
    across[i] = positions[i * 3] - positions[i * 3 + 2];
  }
  const animate = (seconds: number) => {
    const swash = 0.004 * Math.sin(seconds * 0.9);
    for (let i = 0; i < vertices; i++) {
      const out = offshore[i];
      const fade = 1 - THREE.MathUtils.smoothstep(out, 0.08, 0.42);
      if (fade <= 0) continue;
      const wave = Math.sin(out * 42 + seconds * 1.8 + 0.8 * Math.sin(across[i] * 6.5));
      position.setY(i, (0.0025 * wave + swash) * fade);
      const crest = Math.max(0, wave - 0.75) * 4 * fade * 0.35; // white tops
      const shade = 1 + 0.1 * wave * fade;
      for (let k = 0; k < 3; k++) color.array[i * 3 + k] = Math.min(1, base[i * 3 + k] * shade + crest);
    }
    position.needsUpdate = true;
    color.needsUpdate = true;
  };
  animate(0);
  return { mesh, animate };
}

/** Beach umbrella canopy colours, round the segments in turn: blue and white. */
const UMBRELLA_COLORS = ["#1f5fbf", "#ffffff", "#1f5fbf", "#ffffff", "#1f5fbf", "#ffffff", "#1f5fbf", "#ffffff"];

/**
 * A blazing summer day at the beach: pale sand down to a turquoise sea, shells scattered about, a striped umbrella
 * planted in the sand, and a little sailboat far offshore under a bright sky.
 */
function buildSummer(): WindowView {
  const group = new THREE.Group();
  const rand = seeded(13);

  const dry = [new THREE.Color("#f3dca8"), new THREE.Color("#eed39a"), new THREE.Color("#f6e3b6")];
  const wet = new THREE.Color("#cfae78");
  const foam = new THREE.Color("#ffffff");
  group.add(
    new THREE.Mesh(
      groundGeometry(
        sandHeight,
        (x, z) => {
          const above = z - shoreAt(x); // metres up the beach from the waterline
          const color = dry[Math.floor(Math.abs(Math.sin(x * 29.3 + z * 41.7)) * dry.length)].clone();
          color.lerp(wet, 1 - THREE.MathUtils.smoothstep(above, 0.02, 0.12)); // darker where the waves reach
          return color.lerp(foam, Math.max(0, 1 - Math.abs(above - 0.012) / 0.012) * 0.9); // a line of foam
        },
        0.02,
        [-1.98, -0.2],
      ),
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }),
    ),
  );

  // The sea: flat, unlit like the sky card it runs into, turquoise in the shallows deepening to blue offshore.
  const sea = buildSea();
  group.add(sea.mesh);

  // Umbrella in the lower left pane, shells across the sand.
  const umbrella = buildUmbrella();
  umbrella.position.set(-0.7, sandHeight(-0.7, -1.6), -1.6);
  umbrella.rotation.set(0.12, 0, -0.1); // planted a little askew
  umbrella.scale.setScalar(0.7);
  group.add(umbrella);

  const shellColors = ["#fbe9d7", "#f6c9b8", "#f2b48c", "#fff6ea", "#e8a6a0", "#f0d4a4"];
  for (let i = 0; i < 16; i++) {
    let x = 0;
    let z = 0;
    do {
      z = -1.47 - rand() * 0.33;
      x = 0.25 + rand() * 1.4 + 0.2 + z; // across the window: x - z - 0.2 from 0.25 to 1.65
    } while (z < shoreAt(x) + 0.03); // on the sand
    const shell = rand() < 0.75 ? buildScallop(shellColors[Math.floor(rand() * shellColors.length)]) : buildConch();
    shell.position.set(x, sandHeight(x, z), z);
    shell.rotation.y = rand() * Math.PI * 2;
    shell.scale.setScalar(0.9 + rand() * 0.6);
    group.add(shell);
  }

  const boat = buildSailboat();
  // Far offshore, just short of the horizon line (x + z = -3.34) in the right pane. The camera is far off, so
  // distance alone hardly shrinks it: it is scaled down too, to read as a boat in the distance.
  boat.position.set(-0.86, 0, -2.38);
  boat.scale.setScalar(0.55);
  boat.rotation.y = Math.PI / 4; // side on to the window
  group.add(boat);

  group.add(skyCard(paintSummerSky, SUMMER_HORIZON_Y, 2.2));
  unshadowed(group);
  return {
    group,
    animate: (seconds) => {
      sea.animate(seconds);
      // The boat rides the swell: a gentle bob and roll, staying where it is.
      boat.position.y = 0.003 * Math.sin(seconds * 1.3);
      boat.rotation.x = 0.04 * Math.sin(seconds * 1.1 + 0.5);
    },
  };
}

/** A beach umbrella: a white pole and a shallow canopy of blue and white panels, 26 cm across and 30 cm tall before scaling. */
function buildUmbrella() {
  const group = new THREE.Group();
  const height = 0.3;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, height, 8), matte("#f4f4f0", 0.5));
  pole.position.y = height / 2;
  const panels = UMBRELLA_COLORS.length;
  const canopy = new THREE.ConeGeometry(0.13, 0.05, panels, 1, true).toNonIndexed();
  // Colour each panel from the direction of its triangles' middle.
  const position = canopy.getAttribute("position");
  const colors: number[] = [];
  const tint = new THREE.Color();
  for (let i = 0; i < position.count; i += 3) {
    const x = (position.getX(i) + position.getX(i + 1) + position.getX(i + 2)) / 3;
    const z = (position.getZ(i) + position.getZ(i + 1) + position.getZ(i + 2)) / 3;
    const angle = (Math.atan2(z, x) + Math.PI * 2) % (Math.PI * 2);
    tint.set(UMBRELLA_COLORS[Math.floor((angle / (Math.PI * 2)) * panels) % panels]);
    for (let k = 0; k < 3; k++) colors.push(tint.r, tint.g, tint.b);
  }
  canopy.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  canopy.computeVertexNormals();
  const top = new THREE.Mesh(canopy, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: THREE.DoubleSide, flatShading: true }));
  top.position.y = height - 0.02;
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.007, 8, 6), matte("#f4f4f0", 0.5));
  tip.position.y = height + 0.012;
  group.add(pole, top, tip);
  return group;
}

/** A scallop shell lying on the sand: a low ribbed fan, about 2.5 cm across. */
function buildScallop(color: string) {
  const group = new THREE.Group();
  const fan = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 4, 0, Math.PI, 0, Math.PI / 2), matte(color, 0.6));
  fan.scale.set(1, 0.45, 1); // a flat dome, open side down
  fan.rotation.y = Math.PI / 2;
  const hinge = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.003, 0.004), matte(color, 0.6));
  hinge.position.set(0, 0.0015, 0.001);
  group.add(fan, hinge);
  return group;
}

/** A small spiral sea snail shell on its side. */
function buildConch() {
  const shell = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.024, 8), matte("#f1c9a5", 0.5));
  shell.rotation.z = Math.PI / 2;
  shell.position.y = 0.005;
  const group = new THREE.Group();
  group.add(shell);
  return group;
}

/**
 * A simple cartoon sailboat, built along +x (bow to +x): a red hull flaring out to an orange gunwale band, a dark
 * mast, and one big sail bellying out from it, light blue with a deeper blue band along its foot.
 */
function buildSailboat() {
  const group = new THREE.Group();
  const [length, height, beam] = [0.24, 0.05, 0.05];
  // Hull: side profile flaring from a short keel line to a long deck line; red below, an orange band on top.
  const sideAt = (y: number) => ({
    stern: -length / 2 + 0.025 * (1 - y / height), // stern leans out a little
    bow: length / 2 - 0.045 * (1 - y / height), // bow rakes out more
  });
  const slice = (y0: number, y1: number, color: string) => {
    const [a, b] = [sideAt(y0), sideAt(y1)];
    const profile = new THREE.Shape().moveTo(a.stern, y0).lineTo(a.bow, y0).lineTo(b.bow, y1).lineTo(b.stern, y1).lineTo(a.stern, y0);
    return new THREE.Mesh(
      new THREE.ExtrudeGeometry(profile, { depth: beam, bevelEnabled: false }).translate(0, 0, -beam / 2),
      matte(color, 0.6),
    );
  };
  const band = height * 0.68;
  group.add(slice(-0.012, band, "#ef4f58"), slice(band, height, "#f8a12c"));

  const ink = matte("#2b2b33", 0.7);
  const mastX = -0.04;
  const mastH = 0.25;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, mastH, 6), ink);
  mast.position.set(mastX, height + mastH / 2, 0);
  group.add(mast);

  // Sail, drawn in the mast's plane from its foot: straight up the mast, a full curve out to the clew, then the
  // foot back to the mast. A line parallel to the foot splits off the darker band.
  const [sailH, sailW] = [0.22, 0.14];
  const foot = (x: number) => 0.04 * (x / sailW); // the foot rises towards the clew
  const bandTop = (x: number) => foot(x) + 0.035;
  const curve: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    // Quadratic from the head (0, sailH) to the clew (sailW, foot(sailW)), bellied out to the right.
    const [cx, cy] = [sailW * 0.95, sailH * 0.75];
    const x = 2 * (1 - t) * t * cx + t * t * sailW;
    const y = (1 - t) * (1 - t) * sailH + 2 * (1 - t) * t * cy + t * t * foot(sailW);
    curve.push(new THREE.Vector2(x, y));
  }
  const split = curve.findIndex((p) => p.y < bandTop(p.x));
  const [p0, p1] = [curve[split - 1], curve[split]];
  const f = (p0.y - bandTop(p0.x)) / (p0.y - bandTop(p0.x) - (p1.y - bandTop(p1.x)));
  const meet = p0.clone().lerp(p1, f);
  const upper = new THREE.Shape([new THREE.Vector2(0, sailH), ...curve.slice(1, split), meet, new THREE.Vector2(0, bandTop(0))]);
  const lower = new THREE.Shape([new THREE.Vector2(0, bandTop(0)), meet, ...curve.slice(split), new THREE.Vector2(0, foot(0))]);
  const sailAt = (shape: THREE.Shape, color: string) => {
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color, roughness: 0.7, side: THREE.DoubleSide }));
    mesh.position.set(mastX + 0.004, height + 0.012, 0);
    return mesh;
  };
  group.add(sailAt(upper, "#6fd3e6"), sailAt(lower, "#2fb4d6"));
  return group;
}

/** A blazing summer sky over the open sea: deep blue to pale at the horizon, a big sun, a few small clouds. */
function paintSummerSky(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const horizon = h / 2;
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, "#1677d9");
  sky.addColorStop(0.6, "#56aef0");
  sky.addColorStop(1, "#cbeaff");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon);

  // The sun, high in the top-right pane, with a big bright halo.
  const [sx, sy, sr] = [w * 0.66, h * 0.2, w * 0.05];
  const glow = ctx.createRadialGradient(sx, sy, sr * 0.6, sx, sy, sr * 8);
  glow.addColorStop(0, "rgba(255, 251, 222, 1)");
  glow.addColorStop(0.25, "rgba(255, 247, 205, 0.55)");
  glow.addColorStop(1, "rgba(255, 247, 205, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(sx - sr * 8, sy - sr * 8, sr * 16, sr * 16);
  ctx.fillStyle = "#fff9d6";
  ctx.beginPath();
  ctx.arc(sx, sy, sr, 0, Math.PI * 2);
  ctx.fill();

  const rand = seeded(61);
  for (const [cx, cy, size] of [
    [0.24, 0.16, 0.7],
    [0.42, 0.38, 0.45],
  ]) {
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.75 + rand() * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(
        (cx + (rand() - 0.5) * 0.16 * size) * w,
        (cy + (rand() - 0.6) * 0.03 * size) * h,
        (0.04 + rand() * 0.04) * size * w,
        (0.018 + rand() * 0.016) * size * h,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  // The open sea below the horizon, matching the sea mesh's far edge, with a few glints under the sun.
  ctx.fillStyle = "#1c6fb8";
  ctx.fillRect(0, horizon, w, h - horizon);
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
  for (let i = 0; i < 60; i++) {
    ctx.fillRect(sx - w * 0.15 + rand() * w * 0.3, horizon + 2 + rand() * h * 0.05, 3 + rand() * 6, 1);
  }
}
