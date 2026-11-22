import * as THREE from "three";
import { box, matte } from "./deskSetup";

/**
 * Black 88-key stage piano from the reference photo: a slim body with rounded ends, a row of small buttons
 * across the left of the top panel, a wide clear music rest with an arched top standing in a slot at the back,
 * on a black table stand: two upright side frames inset from the piano's ends, slotted plates under the body,
 * diagonal braces, square rubber feet and a chrome rail telescoping into a black square tube.
 * An open book of Für Elise (a straightened photo) stands on the rest.
 * Built facing +Z (the player's side), keyboard along X, origin centred on the floor.
 */

const WHITE_KEYS = 52; // A0 to C8
const BLACK_AFTER = new Set([0, 1, 3, 4, 5]); // black key follows these white keys in each C-to-B octave

function rod(from: THREE.Vector3, to: THREE.Vector3, radius: number, material: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), 12), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Square-section steel tube between two points. */
function bar(from: THREE.Vector3, to: THREE.Vector3, size: number, material: THREE.Material) {
  const mesh = box([size, from.distanceTo(to), size], [0, 0, 0], material, size * 0.2);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  return mesh;
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Rounded rectangle centred on (cx, cy), drawn into `path`. */
function roundedRect<T extends THREE.Path>(path: T, width: number, height: number, r: number, cx = 0, cy = 0) {
  const [l, rt, b, t] = [cx - width / 2, cx + width / 2, cy - height / 2, cy + height / 2];
  path.moveTo(l + r, b);
  path.lineTo(rt - r, b);
  path.quadraticCurveTo(rt, b, rt, b + r);
  path.lineTo(rt, t - r);
  path.quadraticCurveTo(rt, t, rt - r, t);
  path.lineTo(l + r, t);
  path.quadraticCurveTo(l, t, l, t - r);
  path.lineTo(l, b + r);
  path.quadraticCurveTo(l, b, l + r, b);
  return path;
}

/** The rest's outline: straight foot, sides flaring slightly outwards, a gently arched top, small round corners. */
function restShape(bottom: number, top: number, height: number, arch: number, corner: number) {
  const s = new THREE.Shape();
  const edge = height - arch; // top corners sit a little lower than the middle of the arch
  s.moveTo(-bottom / 2, 0);
  s.lineTo(bottom / 2, 0);
  s.lineTo(top / 2, edge - corner);
  s.quadraticCurveTo(top / 2, edge, top / 2 - corner, edge + corner * 0.15);
  s.quadraticCurveTo(0, height + arch, -top / 2 + corner, edge + corner * 0.15);
  s.quadraticCurveTo(-top / 2, edge, -top / 2, edge - corner);
  s.closePath();
  return s;
}

/** The stand's top bracket: a flat plate with two long rounded slots through it, lying in the XZ plane. */
function plateGeometry(width: number, depth: number, thickness: number) {
  const shape = roundedRect(new THREE.Shape(), width, depth, 0.012);
  for (const y of [-depth * 0.22, depth * 0.22]) {
    shape.holes.push(roundedRect(new THREE.Path(), width * 0.5, depth * 0.14, depth * 0.06, 0, y));
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 10 });
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Flat-lying straightened photo of the open Für Elise book (both pages, spine at the centre). */
const SCORE_SRC = "/room/fur-elise.webp";
const SCORE_SPINE = 0.497; // the spine's position across the photo

export function buildPiano({ length = 1.34, onRepaint }: { length?: number; onRepaint?: () => void } = {}) {
  const group = new THREE.Group();
  const black = matte("#121315", 0.5);
  const strip = matte("#0c0d0e", 0.7);
  const frame = matte("#151618", 0.45);
  const ivory = matte("#f4f1ea", 0.45);
  const ebony = matte("#0b0b0c", 0.3);
  const felt = matte("#b0302b", 0.95);
  const rubber = matte("#0a0a0a", 0.95);
  const label = matte("#8d8f94", 0.6);
  const chrome = new THREE.MeshStandardMaterial({ color: "#7d8085", metalness: 0.6, roughness: 0.45 });

  const standTop = 0.64;
  const depth = 0.3;
  const height = 0.13;
  const keyDepth = 0.15;
  const keybed = 0.048; // body under the keys; its front is the black rail below them
  const base = standTop;
  const front = depth / 2;
  const backDepth = depth - keyDepth;
  const panelFront = -depth / 2 + backDepth;
  const cheek = 0.04; // the body's rounded ends either side of the keys

  // Body: the keybed slab, the top panel behind the keys, and the rounded ends; all one black shell.
  group.add(box([length, keybed, depth], [0, base + keybed / 2, 0], black, 0.02));
  group.add(box([length, height, backDepth], [0, base + height / 2, -depth / 2 + backDepth / 2], black, 0.022));
  for (const side of [-1, 1]) {
    group.add(box([cheek, height * 0.86, depth], [side * (length / 2 - cheek / 2), base + (height * 0.86) / 2, 0], black, 0.035));
  }
  const span = length - 2 * cheek - 0.006;
  // The panel's lip over the back of the keys, with the red felt line just under it.
  group.add(box([span, 0.028, 0.022], [0, base + height - 0.014, panelFront + 0.009], black, 0.006));
  group.add(box([span, 0.01, 0.005], [0, base + keybed + 0.025, panelFront + 0.004], felt));
  // Slot for the music rest along the back of the top panel.
  group.add(box([length * 0.96, 0.002, 0.03], [0, base + height + 0.001, -depth / 2 + 0.03], strip));

  // Control strip: little buttons in groups across the left half, printed labels, a badge in the middle.
  const button = matte("#2c2e32", 0.55);
  const buttonsY = base + height + 0.002;
  const buttonsZ = panelFront - 0.03;
  const groups = [
    [-0.43, 2],
    [-0.39, 3],
    [-0.33, 2],
    [-0.27, 2],
    [-0.19, 2],
    [-0.13, 9],
  ] as const;
  for (const [start, count] of groups) {
    for (let i = 0; i < count; i++) {
      group.add(box([0.011, 0.004, 0.006], [length * start + i * 0.02, buttonsY, buttonsZ], button));
    }
  }
  const labels = [
    [-0.4, 0.06],
    [-0.3, 0.05],
    [-0.22, 0.04],
    [0.32, 0.05],
    [0.42, 0.04],
  ] as const;
  for (const [x, w] of labels) {
    group.add(box([length * w, 0.001, 0.003], [length * x, base + height + 0.0005, buttonsZ - 0.012], label));
  }
  group.add(box([0.05, 0.001, 0.008], [0, base + height + 0.0005, buttonsZ], matte("#d6d6d6", 0.4)));

  // Keys.
  const pitch = span / WHITE_KEYS;
  const keyTop = base + keybed + 0.02;
  const whiteGeo = new THREE.BoxGeometry(pitch * 0.93, 0.02, keyDepth - 0.004);
  const blackGeo = new THREE.BoxGeometry(pitch * 0.56, 0.017, keyDepth * 0.62);
  const startX = -span / 2 + pitch / 2;
  for (let i = 0; i < WHITE_KEYS; i++) {
    const key = new THREE.Mesh(whiteGeo, ivory);
    key.position.set(startX + i * pitch, keyTop - 0.01, front - keyDepth / 2 - 0.002);
    key.receiveShadow = true;
    group.add(key);
    // A0 is followed by A#0; from C1 on the C-to-B pattern repeats. The last key (C8) has none.
    const inOctave = (i - 2 + 7) % 7; // 0 = C
    if (i === 0 || (i >= 2 && i < WHITE_KEYS - 1 && BLACK_AFTER.has(inOctave))) {
      const sharp = new THREE.Mesh(blackGeo, ebony);
      sharp.position.set(startX + (i + 0.5) * pitch, keyTop + 0.0085, panelFront + (keyDepth * 0.62) / 2);
      sharp.castShadow = true;
      group.add(sharp);
    }
  }

  // Music rest: a wide clear sheet with an arched top, standing in the back slot and leaning slightly back.
  const acrylic = new THREE.MeshPhysicalMaterial({
    color: "#f1e6dc",
    roughness: 0.05,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const rest = new THREE.Group();
  rest.position.set(0, base + height, -depth / 2 + 0.03);
  rest.rotation.x = -0.12;
  const restWidth = length * 0.5;
  const restGeometry = new THREE.ExtrudeGeometry(restShape(restWidth * 0.9, restWidth, 0.2, 0.012, 0.025), {
    depth: 0.005,
    bevelEnabled: false,
    curveSegments: 16,
  });
  rest.add(new THREE.Mesh(restGeometry, acrylic));
  // Its clear foot along the slot, with a small tab at each end.
  rest.add(box([restWidth * 0.9, 0.012, 0.03], [0, 0.006, 0.006], acrylic));
  for (const side of [-1, 1]) rest.add(box([0.04, 0.006, 0.04], [side * restWidth * 0.46, 0.003, 0.01], acrylic));

  // The open score on the ledge, leaning on the rest: two pages folded slightly towards the player at the spine.
  const score = new THREE.TextureLoader().load(SCORE_SRC, () => onRepaint?.());
  score.colorSpace = THREE.SRGBColorSpace;
  const bookW = 0.46;
  const bookH = bookW / 1.48;
  const paper = matte("#efeae0", 0.9);
  for (const side of [-1, 1]) {
    const pageW = bookW * (side < 0 ? SCORE_SPINE : 1 - SCORE_SPINE);
    const pivot = new THREE.Group();
    pivot.position.set(0, 0.012 + bookH / 2, 0.012);
    pivot.rotation.y = -side * 0.1;
    const geometry = new THREE.PlaneGeometry(pageW, bookH);
    const uv = geometry.getAttribute("uv");
    for (let i = 0; i < uv.count; i++) {
      const u = uv.getX(i);
      uv.setX(i, side < 0 ? u * SCORE_SPINE : SCORE_SPINE + u * (1 - SCORE_SPINE));
    }
    // Unlit-looking paper: no shadow on the page itself, so the shadow map can't streak across the print.
    const page = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: score, roughness: 1 }));
    page.position.set((side * pageW) / 2, 0, 0.004);
    pivot.add(page);
    // The page block behind it, so the book has a little thickness.
    const block = box([pageW, bookH, 0.003], [(side * pageW) / 2, 0, 0.001], paper);
    block.receiveShadow = false;
    pivot.add(block);
    rest.add(pivot);
  }
  group.add(rest);

  // Stand: two upright side frames, inset from the piano's ends.
  const sideX = length / 2 - 0.2;
  const tube = 0.03;
  const legFront = depth / 2 - 0.01;
  const legBack = -depth / 2 + 0.03;
  const plateY = standTop - 0.012;
  const railTop = plateY - 0.03;
  // The rail between the frames runs along the front, level with the front legs, just under the keyboard.
  const railY = railTop - 0.035;
  const railZ = legFront;
  const plate = plateGeometry(0.15, depth + 0.02, 0.012);
  for (const side of [-1, 1]) {
    const x = side * sideX;
    // Slotted plate under the body, reaching inwards from the frame.
    const top = new THREE.Mesh(plate, frame);
    top.position.set(x - side * 0.05, plateY, 0);
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);
    // Top rail front to back, two straight legs, and a brace from the front leg up to the back of the rail.
    group.add(bar(v(x, railTop, legBack - 0.02), v(x, railTop, legFront + 0.02), tube, frame));
    // Legs stay put at the top and splay outwards towards the floor.
    const footX = x + side * 0.07;
    const frontFoot = v(footX, 0.05, legFront + 0.01);
    group.add(bar(v(x, railTop, legFront), frontFoot, tube, frame));
    group.add(bar(v(x, railTop, legBack), v(footX, 0.05, legBack), tube, frame));
    const braceFoot = v(x, railTop, legFront).lerp(frontFoot, 0.58);
    group.add(bar(braceFoot, v(x, railTop - 0.01, legBack + 0.06), tube * 0.75, frame));
    // Bolt heads where the rail meets the legs.
    for (const z of [legFront, legBack]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.006, 10), label);
      bolt.rotation.z = Math.PI / 2;
      bolt.position.set(x + side * (tube / 2 + 0.002), railTop, z);
      group.add(bolt);
    }
    // Square rubber feet.
    for (const z of [legFront + 0.01, legBack]) group.add(box([0.042, 0.06, 0.042], [footX, 0.03, z], rubber, 0.006));
    // Sleeve on the frame that the rail plugs into.
    group.add(box([0.06, 0.05, 0.045], [side * (sideX - 0.04), railY, railZ], frame, 0.005));
  }
  // Telescoping rail along the front, just under the keyboard: a grey chrome rod sliding into a black
  // square tube, with a lock knob underneath.
  const join = 0.02;
  group.add(rod(v(-sideX + 0.06, railY, railZ), v(join + 0.01, railY, railZ), 0.011, chrome));
  group.add(bar(v(join, railY, railZ), v(sideX - 0.04, railY, railZ), 0.032, frame));
  group.add(rod(v(join + 0.03, railY - 0.014, railZ), v(join + 0.03, railY - 0.04, railZ), 0.004, frame));
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.006, 0.014, 12), frame);
  knob.position.set(join + 0.03, railY - 0.045, railZ);
  group.add(knob);

  // Sustain pedal on the floor under the piano, under the player's right foot (a small black box pedal with
  // a ribbed, slightly raised-at-the-back top).
  const pedal = new THREE.Group();
  pedal.position.set(0.12, 0, 0.06);
  pedal.rotation.y = -0.08;
  pedal.add(box([0.078, 0.016, 0.104], [0, 0.008, 0], rubber, 0.004));
  const tread = new THREE.Group();
  tread.position.set(0, 0.016, 0.05);
  tread.rotation.x = 0.13; // hinged at the front, raised at the back
  tread.add(box([0.074, 0.01, 0.1], [0, 0.005, -0.05], black, 0.006));
  for (let i = 0; i < 12; i++) tread.add(box([0.062, 0.002, 0.003], [0, 0.0105, -0.012 - i * 0.0068], strip));
  pedal.add(tread);
  // Cable strain relief at the back.
  const relief = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.005, 0.014, 10), rubber);
  relief.rotation.x = Math.PI / 2;
  relief.position.set(0, 0.012, -0.058);
  pedal.add(relief);
  group.add(pedal);

  pedal.updateMatrix();
  const cableStart = new THREE.Vector3(0, 0.012, -0.064).applyMatrix4(pedal.matrix);

  // Cable: plugged into a jack under the middle of the body, it hangs straight down, bends smoothly onto the
  // floor and lies there with plenty of slack in loose, uneven curves (crossing over itself once) before
  // running into the back of the pedal. Hand-placed points, then resampled with every point kept at least
  // one radius above the floor, so the floor part rests on it without sinking in.
  const cableRadius = 0.0028;
  const floor = cableRadius;
  const jackX = 0;
  const jackZ = -0.08;
  const over = floor + cableRadius * 2; // where the cable lies on top of itself
  const guide = new THREE.CatmullRomCurve3(
    [
      // Hanging from the plug, swaying very slightly as it drops.
      v(jackX, base - 0.02, jackZ),
      v(jackX + 0.001, base - 0.08, jackZ + 0.001),
      v(jackX + 0.006, 0.42, jackZ + 0.004),
      v(jackX + 0.013, 0.24, jackZ + 0.01),
      v(jackX + 0.02, 0.1, jackZ + 0.02),
      // The bend onto the floor.
      v(jackX + 0.024, 0.035, jackZ + 0.028),
      v(jackX + 0.021, 0.011, jackZ + 0.038),
      v(jackX + 0.01, floor, jackZ + 0.052),
      // Slack on the floor: a wide sweep to the left, back towards the wall, then a turn that lies across the
      // first run, a bulge towards the player and a last S-bend into the pedal.
      v(-0.03, floor, -0.004),
      v(-0.075, floor, 0.006),
      v(-0.118, floor, -0.006),
      v(-0.148, floor, -0.042),
      v(-0.137, floor, -0.088),
      v(-0.1, floor, -0.108),
      v(-0.068, floor, -0.084),
      v(-0.058, floor, -0.038),
      v(-0.057, floor, -0.016),
      v(-0.0555, floor + cableRadius * 0.9, -0.006),
      v(-0.054, over, 0.0025),
      v(-0.052, floor + cableRadius * 0.9, 0.011),
      v(-0.049, floor, 0.02),
      v(-0.036, floor, 0.048),
      v(-0.005, floor, 0.07),
      v(0.034, floor, 0.064),
      v(0.058, floor, 0.032),
      v(0.062, floor, -0.006),
      v(0.078, floor, -0.042),
      v(0.106, floor, -0.05),
      v(cableStart.x + 0.004, floor, cableStart.z - 0.026),
      v(cableStart.x + 0.001, cableStart.y * 0.6, cableStart.z - 0.008),
      cableStart,
    ],
    false,
    "centripetal",
  );
  const samples = guide.getSpacedPoints(420).map((p) => {
    p.y = Math.max(p.y, floor);
    return p;
  });
  const cablePath = new THREE.CatmullRomCurve3(samples, false, "centripetal");
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cablePath, 600, cableRadius, 10), rubber);
  cable.castShadow = true;
  cable.receiveShadow = true;
  group.add(cable);
  // Jack plug under the body: black barrel pointing down and a thin chrome collar where it enters.
  const plug = new THREE.Mesh(new THREE.CylinderGeometry(0.0055, 0.0065, 0.018, 12), rubber);
  plug.position.set(jackX, base - 0.011, jackZ);
  group.add(plug);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, 0.003, 12), chrome);
  collar.position.set(jackX, base - 0.0015, jackZ);
  group.add(collar);

  return { group, chrome: [chrome], textures: [score] };
}
