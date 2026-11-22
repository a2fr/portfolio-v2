import * as THREE from "three";
import { matte } from "./deskSetup";

const CAP_BLACK = "#22262e";
const GOLD = "#e0a72e";
const PAPER = "#f1e6cf";
const PAPER_EDGE = "#d9c7a3";

function shadowed<T extends THREE.Object3D>(object: T) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
  });
  return object;
}

/**
 * Graduation cap resting on its skull cap: a dark square mortarboard, a top button and a gold tassel
 * whose cord runs to the board's front edge and hangs over it. Origin at the bottom centre of the skull cap.
 */
export function buildGraduationCap() {
  const group = new THREE.Group();
  const black = matte(CAP_BLACK, 0.75);
  const gold = matte(GOLD, 0.55);

  const skullHeight = 0.055;
  const skullMaterial = matte(CAP_BLACK, 0.75);
  skullMaterial.side = THREE.DoubleSide; // open cylinder: its inside shows under the board's overhang
  const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.075, skullHeight, 40, 1, true), skullMaterial);
  skull.position.y = skullHeight / 2;
  group.add(skull);

  const board = 0.17;
  const boardThickness = 0.007;
  const boardY = skullHeight + boardThickness / 2;
  const mortarboard = new THREE.Mesh(new THREE.BoxGeometry(board, boardThickness, board), black);
  mortarboard.position.y = boardY;
  group.add(mortarboard);

  const topY = skullHeight + boardThickness;
  const button = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.01, 0.006, 20), black);
  button.position.y = topY + 0.003;
  group.add(button);

  // Cord: from the button across the board to its front edge (+x), then straight down past it.
  const edge = board / 2;
  const hang = 0.022; // short enough that the tassel ends just above whatever the cap rests on
  const cordPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, topY + 0.004, 0),
    new THREE.Vector3(edge * 0.55, topY + 0.0025, 0.012),
    new THREE.Vector3(edge - 0.004, topY + 0.002, 0.018),
    new THREE.Vector3(edge + 0.006, topY - 0.01, 0.02),
    new THREE.Vector3(edge + 0.007, topY - hang, 0.02),
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(cordPath, 40, 0.0018, 8), gold));

  // Tassel: a knot, a short head, then a flared skirt of threads.
  const tasselX = edge + 0.007;
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 16, 12), gold);
  knot.position.set(tasselX, topY - hang, 0.02);
  group.add(knot);
  const skirtLength = 0.03;
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.009, skirtLength, 20), gold);
  skirt.position.set(tasselX, topY - hang - 0.003 - skirtLength / 2, 0.02);
  group.add(skirt);

  return shadowed(group);
}

/**
 * Rolled diploma lying on its side, axis along local z, origin at its centre. The paper is a real rolled sheet:
 * a loose spiral of thin paper (layers visible in the open ends, the sheet's free edge a small step on the
 * outside), flaring slightly at the ends and pinched in the middle by a wide gold satin ribbon: a band, two flat
 * loops along the roll, two V-cut tails down its sides, and a red wax seal pressed on top where they meet.
 * `phase` turns the spiral so two rolls side by side don't show their seam in the same place.
 */
export function buildDiploma(length = 0.2, radius = 0.019, phase = 0) {
  const group = new THREE.Group();
  const satin = new THREE.MeshStandardMaterial({
    color: SATIN,
    metalness: 0.3,
    roughness: 0.32,
    side: THREE.DoubleSide,
  });

  const paper = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.92, vertexColors: true });
  group.add(new THREE.Mesh(rolledSheet(length, radius, phase), paper));

  // Band around the pinched waist, one ribbon thick.
  const waist = radius * (1 - PINCH);
  const ribbonWidth = radius * 0.55;
  const band = new THREE.Mesh(new THREE.CylinderGeometry(waist + 0.0005, waist + 0.0005, ribbonWidth, 48, 1, true), satin);
  band.rotation.x = Math.PI / 2;
  group.add(band);

  const top = waist + 0.0009;
  const across = () => new THREE.Vector3(1, 0, 0); // loops lie in the y-z plane, their width across the roll
  // Tails lie on the roll: their width is perpendicular both to their direction and to the roll's surface.
  const onRoll = (p: THREE.Vector3, tangent: THREE.Vector3) =>
    new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(p.x, p.y, 0).normalize()).normalize();
  for (const side of [-1, 1]) {
    // Loop: a broad, flat loop going out along the roll from under the seal and back.
    const reach = radius * 1.35;
    const loop = new THREE.CatmullRomCurve3(
      [
        [0, top + 0.0004, side * 0.001],
        [0, top + 0.0042, side * reach * 0.45],
        [0, top + 0.0036, side * reach * 0.9],
        [0, top + 0.0012, side * reach],
        [0, top + 0.0003, side * reach * 0.6],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      true,
      "centripetal",
    );
    group.add(new THREE.Mesh(ribbonStrip(loop.getPoints(48), across, ribbonWidth * 0.95), satin));

    // Tail: from under the seal diagonally down the roll's side, its V-cut end lifting off the paper.
    const tail = Array.from({ length: 28 }, (_, i) => {
      const t = i / 27;
      const angle = t * 1.15;
      const r = top + 0.0006 + Math.max(0, t - 0.7) ** 2 * 0.02;
      return new THREE.Vector3(side * Math.sin(angle) * r, Math.cos(angle) * r, side * t * radius * 1.1);
    });
    group.add(new THREE.Mesh(ribbonStrip(tail, onRoll, ribbonWidth * 0.9, true), satin));
  }

  const seal = waxSeal(radius * 0.52);
  seal.position.y = top + 0.0028;
  seal.rotation.set(-0.06, 0.4, 0.05); // pressed by hand, not quite square
  group.add(seal);

  return shadowed(group);
}

const SATIN = "#f0bb3c";
const WAX = "#b42a24";

/** A blob of red wax pressed flat on top, facing +y: a wobbly rounded disc with a stamped rim and emblem. */
function waxSeal(radius: number) {
  const outline: THREE.Vector2[] = [];
  for (let i = 0; i < 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = radius * (1 + 0.05 * Math.sin(5 * a + 1) + 0.035 * Math.sin(9 * a + 2) + 0.02 * Math.sin(14 * a));
    outline.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
    depth: radius * 0.12,
    bevelEnabled: true,
    bevelThickness: radius * 0.14,
    bevelSize: radius * 0.14,
    bevelSegments: 5,
    curveSegments: 1,
  });
  // Map the stamp across the flat top only; the sides and rounded edge take the plain rim value.
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  const topZ = radius * (0.12 + 0.14);
  for (let i = 0; i < position.count; i++) {
    const onTop = position.getZ(i) > topZ - 1e-6;
    uv.setXY(i, onTop ? 0.5 + position.getX(i) / (radius * 2.3) : 0.01, onTop ? 0.5 + position.getY(i) / (radius * 2.3) : 0.01);
  }
  geometry.rotateX(-Math.PI / 2); // the stamped face up

  const material = new THREE.MeshStandardMaterial({
    color: WAX,
    roughness: 0.42,
    bumpMap: sealStamp(),
    bumpScale: 12,
  });
  return new THREE.Mesh(geometry, material);
}

let stampTexture: THREE.CanvasTexture | null = null;

/** Height map of the stamp: a raised rim, a sunken field and a raised rosette in it. */
function sealStamp() {
  if (stampTexture) return stampTexture;
  const size = 256;
  const c = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.filter = "blur(2px)";
  ctx.fillStyle = "#a0a0a0"; // rim
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#505050"; // pressed field
  ctx.beginPath();
  ctx.arc(c, c, size * 0.34, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a8a8a"; // fine inner ring
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(c, c, size * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#9a9a9a"; // rosette: petals, leaves and a centre
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(a) * size * 0.1, c + Math.sin(a) * size * 0.1, size * 0.07, size * 0.04, a, 0, Math.PI * 2);
    ctx.fill();
    const b = a + Math.PI / 6;
    ctx.beginPath();
    ctx.ellipse(c + Math.cos(b) * size * 0.21, c + Math.sin(b) * size * 0.21, size * 0.035, size * 0.015, b, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#b0b0b0";
  ctx.beginPath();
  ctx.arc(c, c, size * 0.045, 0, Math.PI * 2);
  ctx.fill();
  stampTexture = new THREE.CanvasTexture(canvas);
  return stampTexture;
}

const PINCH = 0.09; // how much the ribbon squeezes the roll's waist
const FLARE = 0.07; // how much the roll loosens at its ends

/** A loose spiral of paper extruded along z, its radius shaped along the length (flared ends, pinched waist). */
function rolledSheet(length: number, radius: number, phase: number) {
  const turns = 3.6;
  const inner = radius * 0.42;
  const thickness = radius * 0.045;
  const sweep = turns * Math.PI * 2;
  const samples = Math.round(turns * 48);
  const spiralRadius = (t: number) => {
    const free = Math.max(0, t - 0.97) / 0.03; // the sheet's last few degrees lift slightly off the roll
    return inner + (radius - inner) * t + free * free * thickness * 1.5;
  };
  const point = (t: number, r: number) => {
    const angle = phase + t * sweep;
    return new THREE.Vector2(Math.cos(angle) * r, Math.sin(angle) * r);
  };
  const outline: THREE.Vector2[] = [];
  for (let i = 0; i <= samples; i++) outline.push(point(i / samples, spiralRadius(i / samples)));
  for (let i = samples; i >= 0; i--) outline.push(point(i / samples, spiralRadius(i / samples) - thickness));

  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
    depth: length,
    steps: 48,
    bevelEnabled: false,
  });
  geometry.translate(0, 0, -length / 2);

  // Shape the roll along its length, and shade the inner layers darker (less light reaches inside the roll).
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const colors = new Float32Array(position.count * 3);
  const paper = new THREE.Color(PAPER);
  const shadow = new THREE.Color(PAPER_EDGE);
  const color = new THREE.Color();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const u = position.getZ(i) / length; // -0.5 .. 0.5
    const end = Math.max(0, Math.abs(u) * 2 - 0.75) / 0.25;
    const scale = 1 + FLARE * end * end - PINCH * Math.exp(-((u / 0.06) ** 4)) // flat under the band, easing out either side;
    position.setXY(i, x * scale, y * scale);

    // Smooth the faceted sides: point each side normal straight out from (or into) the roll's axis.
    // Caps (normal along z) and the sheet's thin edges (normal along the spiral) keep theirs.
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const r = Math.hypot(x, y);
    const facing = (nx * x + ny * y) / r;
    if (Math.abs(normal.getZ(i)) < 0.5 && Math.abs(facing) > 0.5) {
      const sign = Math.sign(facing);
      normal.setXYZ(i, (sign * x) / r, (sign * y) / r, 0);
    }

    const depth = (Math.hypot(x, y) - inner) / (radius - inner); // 0 at the core, 1 outside
    color.copy(shadow).lerp(paper, 0.35 + 0.65 * Math.min(1, Math.max(0, depth) ** 0.7));
    color.toArray(colors, i * 3);
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/**
 * A flat, double-sided strip of ribbon following `points`, `width` wide along `side(point, tangent)`.
 * With `notch`, its end is cut in a V: the two edges run on past the centre line.
 */
function ribbonStrip(
  points: THREE.Vector3[],
  side: (point: THREE.Vector3, tangent: THREE.Vector3) => THREE.Vector3,
  width: number,
  notch = false,
) {
  const vertices: number[] = [];
  const index: number[] = [];
  const last = points.length - 1;
  points.forEach((p, i) => {
    const tangent = points[Math.min(i + 1, last)].clone().sub(points[Math.max(i - 1, 0)]).normalize();
    const half = side(p, tangent).setLength(width / 2);
    vertices.push(p.x - half.x, p.y - half.y, p.z - half.z, p.x + half.x, p.y + half.y, p.z + half.z);
    if (i > 0) {
      const a = (i - 1) * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    if (notch && i === last) {
      // Two points beyond the end edges, and the end's centre as the V's inner corner.
      const reach = tangent.clone().multiplyScalar(width * 0.55);
      const base = vertices.length / 3;
      vertices.push(p.x - half.x + reach.x, p.y - half.y + reach.y, p.z - half.z + reach.z);
      vertices.push(p.x + half.x + reach.x, p.y + half.y + reach.y, p.z + half.z + reach.z);
      vertices.push(p.x, p.y, p.z);
      const l = last * 2;
      index.push(l, base, base + 2, base + 2, base + 1, l + 1);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}
