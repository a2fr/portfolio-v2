import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The gaming setup on the desk: wide flat monitor, tower, round-key keyboard, mouse and desk pad.
 * Everything is built facing +Z (the side the user sits on), with X across the desk and the origin on the
 * desk top; the room turns the whole group to face into the room.
 */

export function matte(color: string, roughness = 0.9) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

export function box(
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  radius = 0,
) {
  const geometry = radius
    ? new RoundedBoxGeometry(size[0], size[1], size[2], 4, radius)
    : new THREE.BoxGeometry(size[0], size[1], size[2]);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Flat decal lying just above a surface; the offset keeps it from fighting the surface for depth. */
function decalMaterial<T extends THREE.Material>(material: T, level = 2) {
  material.polygonOffset = true;
  material.polygonOffsetFactor = -level;
  material.polygonOffsetUnits = -level;
  return material;
}

const SCREEN_IDLE = "#4a1048"; // display colour until its picture has loaded
// A 32-inch-tall panel, stretched wider than 16:9.
const SCREEN_WIDTH = 0.85;
const SCREEN_HEIGHT = 0.398;
function buildMonitor() {
  const group = new THREE.Group();
  const graphite = matte("#26282c", 0.6);
  const standBlack = matte("#1a1b1e", 0.5);
  const centreY = 0.38; // panel centre above the desk; the neck grows with it

  // Stand, as on the reference: a wide, flat bar for a foot, a slim black neck rising behind the panel,
  // and a small mount holding the panel's back.
  group.add(box([0.56, 0.012, 0.08], [0, 0.006, -0.02], standBlack, 0.004));
  group.add(box([0.04, centreY, 0.02], [0, centreY / 2, -0.04], standBlack, 0.004));
  group.add(box([0.1, 0.1, 0.018], [0, centreY, -0.024], graphite, 0.004));

  const panel = new THREE.Group();
  panel.position.set(0, centreY, 0);
  group.add(panel);

  const shellGeometry = new THREE.BoxGeometry(SCREEN_WIDTH + 0.014, SCREEN_HEIGHT + 0.014, 0.014).translate(0, 0, -0.007);
  const bezelGeometry = new THREE.PlaneGeometry(SCREEN_WIDTH + 0.008, SCREEN_HEIGHT + 0.008);
  const displayGeometry = new THREE.PlaneGeometry(SCREEN_WIDTH, SCREEN_HEIGHT);

  const shell = new THREE.Mesh(shellGeometry, graphite);
  shell.castShadow = true;
  shell.receiveShadow = true;
  const bezel = new THREE.Mesh(bezelGeometry, decalMaterial(new THREE.MeshBasicMaterial({ color: "#050506" }), 2));
  // Two pictures of the desktop: one laid out for the whole monitor, one for the page the zoom lands on.
  const display = new THREE.Mesh(displayGeometry, decalMaterial(new THREE.MeshBasicMaterial({ color: SCREEN_IDLE, toneMapped: false }), 4));
  const displayPage = new THREE.Mesh(
    displayGeometry,
    decalMaterial(new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false, transparent: true, opacity: 0, depthWrite: false }), 6),
  );
  displayPage.visible = false;
  displayPage.renderOrder = 1;
  panel.add(shell, bezel, display, displayPage);

  // Generous invisible volume so the monitor is easy to hit from the overview.
  const hit = new THREE.Mesh(new THREE.BoxGeometry(SCREEN_WIDTH + 0.1, centreY + SCREEN_HEIGHT / 2 + 0.06, 0.32), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(0, (centreY + SCREEN_HEIGHT / 2 + 0.06) / 2, 0.02);
  group.add(hit);

  return { group, display, displayPage, hit };
}

/** Black tower: rainbow light strip across the front, glass side with a glowing fan. */
function buildTower() {
  const group = new THREE.Group();
  const w = 0.21;
  const h = 0.45;
  const d = 0.42;
  group.add(box([w, h, d], [0, h / 2, 0], matte("#141518", 0.5), 0.012));

  // Front panel, glossier than the body.
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.02, h - 0.02), decalMaterial(matte("#08090b", 0.25), 2));
  front.position.set(0, h / 2, d / 2 + 0.0004);
  group.add(front);

  // Diagonal light strip, blue at the top through pink, red and yellow to cyan at the bottom.
  const from = new THREE.Vector2(-0.062, h - 0.012);
  const to = new THREE.Vector2(0.086, 0.012);
  const stripGeometry = new THREE.PlaneGeometry(0.007, from.distanceTo(to), 1, 5);
  const stops = ["#2aa8ff", "#7a4dff", "#ff2d9a", "#ff3b30", "#ffd60a", "#2dffd0"].map((hex) => new THREE.Color(hex));
  const colours: number[] = [];
  for (let row = 0; row < stops.length; row++) for (let side = 0; side < 2; side++) colours.push(stops[row].r, stops[row].g, stops[row].b);
  stripGeometry.setAttribute("color", new THREE.Float32BufferAttribute(colours, 3));
  const strip = new THREE.Mesh(stripGeometry, decalMaterial(new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }), 4));
  strip.position.set((from.x + to.x) / 2, (from.y + to.y) / 2, d / 2 + 0.0008);
  strip.rotation.z = Math.atan2(to.x - from.x, from.y - to.y);
  group.add(strip);

  // Glass side (towards the monitor), with the fan and a status light glowing behind it.
  const side = new THREE.Group();
  side.position.set(-w / 2 - 0.0004, 0, 0);
  side.rotation.y = -Math.PI / 2;
  group.add(side);
  const onGlass = (geometry: THREE.BufferGeometry, color: string, x: number, y: number, level: number, opacity = 1) => {
    const material = decalMaterial(new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: opacity < 1, opacity }), level);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    side.add(mesh);
  };
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(d - 0.05, h - 0.05), decalMaterial(matte("#0c0e12", 0.15), 2));
  glass.position.set(0, h / 2, 0);
  side.add(glass);
  // In the side's own frame, +x runs towards the front of the case.
  onGlass(new THREE.CircleGeometry(0.062, 24), "#1668e8", 0.11, 0.31, 4, 0.55);
  onGlass(new THREE.RingGeometry(0.03, 0.052, 24), "#3f9bff", 0.11, 0.31, 6);
  onGlass(new THREE.CircleGeometry(0.016, 16), "#0c0e12", 0.11, 0.31, 8);
  onGlass(new THREE.PlaneGeometry(0.07, 0.008), "#35d6ff", 0.02, 0.2, 4);

  return group;
}

/** Stadium centred on the origin: a circle for 1u keys, a pill for the wide ones. */
function stadium(width: number, height: number) {
  const radius = height / 2;
  const half = Math.max(0, width / 2 - radius);
  const path = new THREE.Shape();
  path.absarc(half, 0, radius, -Math.PI / 2, Math.PI / 2, false);
  path.absarc(-half, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
  path.closePath();
  return path;
}

/** Flat shape extruded upwards from y = 0 (shape +Y ends up pointing to the back). */
function extrudeUp(shape: THREE.Shape, depth: number, bevel = 0) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * bevel,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel * 0.8,
    bevelSegments: 3,
    curveSegments: 20,
  });
  return geometry.rotateX(-Math.PI / 2).translate(0, bevel, 0);
}

type KeyDef = { size: number; legend?: string; sub?: string };

/** 68-key 65% layout of the reference keyboard, 16 units a row: [legend, width in units]. */
const KEY_ROWS: KeyDef[][] = [
  [
    { size: 1, legend: "Esc" },
    ...["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="].map((n, i) => ({ size: 1, legend: n, sub: `F${i + 1}` })),
    { size: 2, legend: "⟵" },
    { size: 1, legend: "Del" },
  ],
  [
    { size: 1.5, legend: "Tab" },
    ..."QWERTYUIOP[]".split("").map((legend) => ({ size: 1, legend })),
    { size: 1.5, legend: "\\" },
    { size: 1, legend: "PgUp" },
  ],
  [
    { size: 1.75, legend: "CapsLk" },
    ..."ASDFGHJKL;'".split("").map((legend) => ({ size: 1, legend })),
    { size: 2.25, legend: "Enter" },
    { size: 1, legend: "PgDn" },
  ],
  [
    { size: 2.25, legend: "Shift" },
    ..."ZXCVBNM,./".split("").map((legend) => ({ size: 1, legend })),
    { size: 1.75, legend: "Shift" },
    { size: 1, legend: "↑" },
    { size: 1, legend: "End" },
  ],
  [
    { size: 1.25, legend: "Ctrl" },
    { size: 1.25, legend: "Win" },
    { size: 1.25, legend: "Alt" },
    { size: 6.25, legend: "—" },
    ...["Alt", "Fn", "Ctrl", "←", "↓", "→"].map((legend) => ({ size: 1, legend })),
  ],
];

/** Typewriter-style 65% keyboard: black caps recessed in chrome rings, floating on clear switches. */
function buildKeyboard(textures: THREE.Texture[]) {
  const group = new THREE.Group();
  const unit = 0.01905;
  const columns = 16;
  const margin = 0.007;
  const caseWidth = columns * unit + 2 * margin;
  const caseDepth = KEY_ROWS.length * unit + 2 * margin;
  const caseHeight = 0.012;

  // Low black case with a matte top plate.
  group.add(box([caseWidth, caseHeight, caseDepth], [0, caseHeight / 2, 0], matte("#0d0e10", 0.55), 0.004));

  const keyHeight = 0.0174; // cap outline height; wide keys stretch sideways only
  const ring = 0.0013; // chrome ring width
  const switchTop = caseHeight + 0.0095;
  const ringHeight = 0.003; // a thin lip: the clear switch shows beneath it
  const capInset = 0.0007; // black top sits this far below the ring's lip
  const capTop = switchTop + ringHeight - capInset;

  const chrome = new THREE.MeshStandardMaterial({ color: "#f4f5f7", metalness: 1, roughness: 0.18 });
  const capMaterial = new THREE.MeshStandardMaterial({ color: "#0b0b0d", roughness: 0.4 });
  const clear = new THREE.MeshStandardMaterial({ color: "#eef6ff", roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.28, depthWrite: false });

  const rings: THREE.BufferGeometry[] = [];
  const caps: THREE.BufferGeometry[] = [];
  const switches: THREE.BufferGeometry[] = [];
  const keys: { x: number; z: number; width: number; def: KeyDef }[] = [];

  KEY_ROWS.forEach((row, r) => {
    const z = (r - (KEY_ROWS.length - 1) / 2) * unit;
    let cursor = -columns / 2;
    for (const def of row) {
      const x = (cursor + def.size / 2) * unit;
      const width = def.size * unit - (unit - keyHeight);
      keys.push({ x, z, width, def });

      const outer = stadium(width, keyHeight);
      outer.holes.push(stadium(width - 2 * ring, keyHeight - 2 * ring));
      rings.push(extrudeUp(outer, ringHeight, 0.0005).translate(x, switchTop, z));
      caps.push(extrudeUp(stadium(width - 2 * ring + 0.0004, keyHeight - 2 * ring + 0.0004), ringHeight - capInset).translate(x, switchTop, z));

      // Clear switch housing under every key, plus stabiliser housings under the long ones.
      const housing = (dx: number, w: number) =>
        switches.push(new THREE.BoxGeometry(w, switchTop - caseHeight, 0.0135).toNonIndexed().translate(x + dx, (switchTop + caseHeight) / 2, z));
      housing(0, 0.0135);
      switches.push(new THREE.BoxGeometry(0.0055, 0.004, 0.0055).toNonIndexed().translate(x, switchTop - 0.002, z)); // stem
      if (def.size >= 2) for (const side of [-1, 1]) housing((side * (width - 0.012)) / 2, 0.006);
      cursor += def.size;
    }
  });

  for (const [geometries, material, shadow] of [
    [rings, chrome, true],
    [caps, capMaterial, true],
    [switches, clear, false],
  ] as const) {
    const merged = mergeGeometries(geometries as THREE.BufferGeometry[]);
    geometries.forEach((geometry) => geometry.dispose());
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Legends: one transparent sheet just above the cap tops, printed light grey where each key sits.
  const canvas = document.createElement("canvas");
  // About 13 px per millimetre once scaled up: legends stay crisp right up against the keys.
  canvas.width = 4096;
  canvas.height = Math.round((4096 * caseDepth) / caseWidth);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const scale = canvas.width / caseWidth;
    const toCanvas = (x: number, z: number) => [(x + caseWidth / 2) * scale, (z + caseDepth / 2) * scale];
    ctx.fillStyle = "#cfd3d8";
    ctx.strokeStyle = "#cfd3d8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const font = (size: number) => `600 ${size * scale}px "Arial Rounded MT Bold", system-ui, sans-serif`;
    for (const { x, z, width, def } of keys) {
      const [cx, cy] = toCanvas(x, z);
      if (def.size >= 6) {
        // Space bar: a short bar in the middle.
        ctx.lineWidth = 0.0009 * scale;
        ctx.beginPath();
        ctx.moveTo(cx - 0.009 * scale, cy);
        ctx.lineTo(cx + 0.009 * scale, cy);
        ctx.stroke();
        continue;
      }
      const label = def.legend ?? "";
      if (def.sub) {
        ctx.font = font(0.0032);
        ctx.fillText(label, cx, cy - 0.0034 * scale);
        ctx.font = font(0.0036);
        ctx.fillText(def.sub, cx, cy + 0.0028 * scale);
        continue;
      }
      const size = label.length === 1 ? 0.0052 : label.length <= 3 ? 0.0037 : 0.0033;
      ctx.font = font(size);
      const room = width - 2 * ring - 0.004;
      const measured = ctx.measureText(label).width / scale;
      if (measured > room) ctx.font = font((size * room) / measured);
      ctx.fillText(label, cx, cy);
    }
  }
  const legends = new THREE.CanvasTexture(canvas);
  legends.colorSpace = THREE.SRGBColorSpace;
  textures.push(legends);
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(caseWidth, caseDepth).rotateX(-Math.PI / 2),
    decalMaterial(new THREE.MeshBasicMaterial({ map: legends, transparent: true, depthWrite: false }), 2),
  );
  sheet.position.y = capTop + 0.0001;
  group.add(sheet);

  // Typing angle: the back sits a little higher, the front edge rests on the pad.
  const tilt = 0.045;
  group.rotation.x = tilt;
  group.position.y = (caseDepth / 2) * Math.sin(tilt);
  const keyboard = new THREE.Group();
  keyboard.add(group);
  return { group: keyboard, chrome, size: { width: caseWidth, depth: caseDepth } };
}

/**
 * Right-handed gaming mouse after the reference: a long shell, highest towards the back, the thumb rest
 * flaring out low on the left, metal-sided wheel, two shift buttons behind it, side buttons and grips.
 * Built with its nose towards -Z.
 */
const MOUSE_LENGTH = 0.131;

/** Shell shape along the mouse (u: 0 at the nose, 1 at the heel). */
const mouseShell = {
  height: (u: number) => 0.021 + 0.019 * Math.sin(Math.PI * Math.pow(u, 1.25)),
  right: (u: number) => 0.026 + 0.006 * THREE.MathUtils.smoothstep(u, 0.3, 0.85),
  left: (u: number) => 0.028 + 0.003 * THREE.MathUtils.smoothstep(u, 0.3, 0.8),
  /** Thumb rest: how far the lower left side sticks out. */
  flare: (u: number) => 0.015 * Math.pow(Math.max(0, Math.cos(((u - 0.66) / 0.3) * (Math.PI / 2))), 2),
  /** Rounds the nose and the heel off. */
  close: (u: number) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(2 * u - 1), 10)), 0.25),
};
const MOUSE_LIFT = 0.002; // the flat underside sits this far below the shell's equator

/** Point on the shell: u along it, theta around it (0 = right edge, PI/2 = top, PI = left edge). */
function mouseShellPoint(u: number, theta: number, target = new THREE.Vector3()) {
  const exponent = 2 / 2.8; // superellipse: a little boxier than an ellipse
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const px = Math.sign(c) * Math.pow(Math.abs(c), exponent);
  const py = Math.sign(s) * Math.pow(Math.abs(s), exponent);
  const close = mouseShell.close(u);
  let x = px >= 0 ? px * mouseShell.right(u) : px * mouseShell.left(u);
  if (px < 0) x -= mouseShell.flare(u) * Math.pow(1 - Math.max(py, 0), 4) * Math.pow(-px, 0.5);
  const y = py >= 0 ? py * mouseShell.height(u) : py * MOUSE_LIFT;
  return target.set(x * close, y * close + MOUSE_LIFT, -MOUSE_LENGTH / 2 + u * MOUSE_LENGTH);
}

/** Top of the shell along its centre line, and the slope there (radians, nose down). */
function mouseTop(u: number) {
  const a = mouseShellPoint(u - 0.005, Math.PI / 2);
  const b = mouseShellPoint(u + 0.005, Math.PI / 2);
  const point = mouseShellPoint(u, Math.PI / 2);
  return { point, slope: Math.atan2(b.y - a.y, b.z - a.z) };
}

/** Seams, grips and light printed on the shell, laid out in (around, along) texture space. */
function mouseSkin() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // x: around the shell (0.25 = top centre, 0.5 = left edge), y: from the nose (0) to the heel (1).
    const X = (v: number) => v * size;
    const Y = (u: number) => u * size;

    ctx.fillStyle = "#eef0f2";
    ctx.fillRect(0, 0, size, size);

    const seam = "#a9adb4";
    const highlight = "#ffffff";

    // Wheel well and the split between the two main buttons.
    ctx.fillStyle = seam;
    ctx.beginPath();
    ctx.roundRect(X(0.232), Y(0.1), X(0.036), Y(0.22), 8);
    ctx.fill();
    ctx.fillRect(X(0.249), Y(0.01), 3, Y(0.45));

    // Rear edge of the buttons, sweeping back towards the sides.
    ctx.lineWidth = 4;
    ctx.strokeStyle = seam;
    ctx.beginPath();
    ctx.moveTo(X(0.05), Y(0.5));
    ctx.quadraticCurveTo(X(0.25), Y(0.39), X(0.42), Y(0.52));
    ctx.stroke();
    ctx.strokeStyle = highlight;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(X(0.05), Y(0.507));
    ctx.quadraticCurveTo(X(0.25), Y(0.397), X(0.42), Y(0.527));
    ctx.stroke();

    // Buttons: two beside the left click, two big thumb buttons and the sniper button on the left side.
    const button = (v0: number, u0: number, v1: number, u1: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.strokeStyle = seam;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(X(v0), Y(u0), X(v1 - v0), Y(u1 - u0), 10);
      ctx.fill();
      ctx.stroke();
    };
    button(0.365, 0.1, 0.405, 0.2, "#e6e8eb");
    button(0.365, 0.21, 0.405, 0.31, "#e6e8eb");
    button(0.445, 0.24, 0.5, 0.35, "#f7f8f9");
    button(0.445, 0.36, 0.5, 0.47, "#f7f8f9");
    button(0.47, 0.13, 0.52, 0.22, "#f7f8f9");

    // Rubber grips: fine diagonal ribs on the thumb rest and down the right flank.
    ctx.strokeStyle = "#cfd2d7";
    ctx.lineWidth = 2;
    const ribs = (v0: number, v1: number, u0: number, u1: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(X(v0), Y(u0), X(v1 - v0), Y(u1 - u0));
      ctx.clip();
      for (let y = Y(u0) - X(v1 - v0); y < Y(u1); y += 7) {
        ctx.beginPath();
        ctx.moveTo(X(v0), y);
        ctx.lineTo(X(v1), y + X(v1 - v0) * 0.6);
        ctx.stroke();
      }
      ctx.restore();
    };
    ribs(0.5, 0.68, 0.45, 0.97);
    ribs(0.93, 1, 0.35, 0.95);
    ribs(0, 0.07, 0.35, 0.95);

    // Status light at the nose, beside the wheel.
    ctx.fillStyle = "#3ee07a";
    ctx.beginPath();
    ctx.roundRect(X(0.268), Y(0.035), X(0.014), Y(0.03), 3);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildMouse(textures: THREE.Texture[]) {
  const group = new THREE.Group();

  // Shell: a grid of slices along the mouse, each a superellipse around it.
  const along = 90;
  const around = 72;
  const positions: number[] = [];
  const uvs: number[] = [];
  // Texture runs by distance round each slice, a quarter at a time, so the top centre is always at 0.25,
  // the left edge at 0.5, and printed shapes keep their proportions.
  const quarters = [0, around / 4, around / 2, around];
  const marks = [0, 0.25, 0.5, 1];
  const slice = Array.from({ length: around + 1 }, () => new THREE.Vector3());
  const travelled = new Array<number>(around + 1).fill(0);
  for (let i = 0; i <= along; i++) {
    const u = i / along;
    for (let j = 0; j <= around; j++) {
      mouseShellPoint(u, (j / around) * Math.PI * 2, slice[j]);
      travelled[j] = j === 0 ? 0 : travelled[j - 1] + slice[j].distanceTo(slice[j - 1]);
    }
    for (let j = 0; j <= around; j++) {
      const q = j <= quarters[1] ? 0 : j <= quarters[2] ? 1 : 2;
      const from = travelled[quarters[q]];
      const span = travelled[quarters[q + 1]] - from;
      const v = span > 1e-7 ? marks[q] + ((marks[q + 1] - marks[q]) * (travelled[j] - from)) / span : j / around;
      positions.push(slice[j].x, slice[j].y, slice[j].z);
      uvs.push(v, 1 - u);
    }
  }
  const indices: number[] = [];
  for (let i = 0; i < along; i++) {
    for (let j = 0; j < around; j++) {
      const a = i * (around + 1) + j;
      const b = a + around + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const shellGeometry = new THREE.BufferGeometry();
  shellGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  shellGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  shellGeometry.setIndex(indices);
  shellGeometry.computeVertexNormals();

  const skin = mouseSkin();
  textures.push(skin);
  const shell = new THREE.Mesh(shellGeometry, new THREE.MeshStandardMaterial({ map: skin, roughness: 0.55 }));
  shell.castShadow = true;
  shell.receiveShadow = true;
  group.add(shell);

  // Wheel: rubber tyre between two polished metal sides, standing proud of its well.
  const chrome = new THREE.MeshStandardMaterial({ color: "#d9dce1", metalness: 1, roughness: 0.25 });
  const wheelAt = mouseTop(0.21);
  const radius = 0.0105;
  const wheel = new THREE.Group();
  wheel.position.set(0, wheelAt.point.y - radius + 0.0045, wheelAt.point.z);
  const tyre = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.0052, 40).rotateZ(Math.PI / 2), matte("#2a2c30", 0.75));
  wheel.add(tyre);
  for (let k = 0; k < 24; k++) {
    // Tread ribs across the tyre.
    const angle = (k / 24) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.0053, 0.0011, 0.0011), matte("#1c1d20", 0.8));
    rib.position.set(0, Math.sin(angle) * radius, Math.cos(angle) * radius);
    rib.rotation.x = -angle;
    wheel.add(rib);
  }
  for (const side of [-1, 1]) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius - 0.0003, radius - 0.0003, 0.0009, 40).rotateZ(Math.PI / 2), chrome);
    disc.position.x = side * 0.0031;
    wheel.add(disc);
  }
  wheel.traverse((part) => (part.castShadow = true));
  group.add(wheel);

  // Two shift buttons stacked behind the wheel.
  const gloss = new THREE.MeshStandardMaterial({ color: "#f4f5f7", roughness: 0.3 });
  for (const u of [0.345, 0.385]) {
    const at = mouseTop(u);
    const key = box([0.0075, 0.0028, 0.0045], [0, 0, 0], gloss, 0.001);
    key.position.set(0, at.point.y + 0.0006, at.point.z);
    key.rotation.x = -at.slope;
    group.add(key);
  }

  return { group, chrome };
}

const PAD = { width: 0.9, depth: 0.4, thickness: 0.003, corner: 0.02 };
const PAD_GOLD = "#d2ad5a";
const PAD_BLACK = "#0b0d0f"; // the room lights lift it to the near-black of the real pad

/** The pad print is designed on an 1800 x 800 grid (2 units per millimetre), traced from the reference pad. */
const DESIGN = { width: 1800, height: 800 };
const CREST_X = -10; // the trace is centred 10 units right of the pad's middle

/** Pen shared by the crest drawing: the same strokes build THREE shapes. */
type Pen = Pick<THREE.Shape, "moveTo" | "lineTo" | "quadraticCurveTo">;

/** Winged "T1" crest and its six stars, one shape per piece, in design units. */
function crestShapes(): THREE.Shape[] {
  const shapes: THREE.Shape[] = [];
  const piece = (draw: (pen: Pen) => void) => {
    const shape = new THREE.Shape();
    draw(shape);
    shapes.push(shape);
  };

  // T, with the top feather as its bar.
  piece((pen) => {
    pen.moveTo(702, 364);
    pen.lineTo(1057.5, 363);
    pen.quadraticCurveTo(1037, 386, 1000, 398);
    pen.lineTo(920, 509);
    pen.quadraticCurveTo(906, 518, 893, 492);
    pen.lineTo(955, 397);
    pen.lineTo(775, 397);
    pen.quadraticCurveTo(727, 392, 702, 364);
  });

  // Lower feathers, cut parallel to the stem, each shorter than the one above.
  const featherEnd = (y: number) => 945 - (y - 397) * 0.68;
  for (const [top, bottom, left, start] of [
    [404, 420.5, 766, 798],
    [428, 444.5, 801, 825],
    [452, 468, 836, 860],
  ]) {
    piece((pen) => {
      pen.moveTo(left, top);
      pen.lineTo(featherEnd(top), top);
      pen.lineTo(featherEnd(bottom), bottom);
      pen.lineTo(start, bottom);
      pen.quadraticCurveTo(left + 0.35 * (start - left), top + 0.85 * (bottom - top), left, top);
    });
  }

  // 1, with its little flag tucked against the T.
  piece((pen) => {
    pen.moveTo(1072.5, 363);
    pen.lineTo(1117.5, 363);
    pen.lineTo(1008, 510);
    pen.quadraticCurveTo(994, 519, 982, 491);
    pen.lineTo(1047.5, 396);
    pen.lineTo(1020, 394);
    pen.quadraticCurveTo(1053, 383, 1072.5, 363);
  });

  // Six stars above.
  for (let i = 0; i < 6; i++) {
    const cx = 712 + i * 78.6;
    piece((pen) => {
      for (let p = 0; p < 10; p++) {
        const radius = p % 2 ? 10.5 : 27;
        const angle = (p * Math.PI) / 5 - Math.PI / 2;
        const x = cx + radius * Math.cos(angle);
        const y = 316 + radius * Math.sin(angle);
        if (p === 0) pen.moveTo(x, y);
        else pen.lineTo(x, y);
      }
    });
  }
  return shapes;
}

/** The corner "T1" (no stars), traced on a 2000 x 790 grid with y running towards the seat. */
const LOGO_TRACE = { width: 1880, height: 744, left: 60, top: 23 };
const CORNER_LOGO = { width: 0.085, inset: 0.016 }; // metres

/** Corner logo pieces centred on the origin, `width` metres wide; shape +Y points to the back of the desk. */
function cornerLogoShapes(width: number): THREE.Shape[] {
  const s = width / LOGO_TRACE.width;
  const cx = LOGO_TRACE.left + LOGO_TRACE.width / 2;
  const cy = LOGO_TRACE.top + LOGO_TRACE.height / 2;
  const X = (x: number) => (x - cx) * s;
  const Y = (y: number) => -(y - cy) * s;
  const shapes: THREE.Shape[] = [];
  const piece = (points: [number, ...number[]][]) => {
    const shape = new THREE.Shape();
    const [first, ...rest] = points;
    shape.moveTo(X(first[0]), Y(first[1]));
    for (const p of rest) {
      if (p.length === 2) shape.lineTo(X(p[0]), Y(p[1]));
      else if (p.length === 4) shape.quadraticCurveTo(X(p[0]), Y(p[1]), X(p[2]), Y(p[3]));
      else shape.bezierCurveTo(X(p[0]), Y(p[1]), X(p[2]), Y(p[3]), X(p[4]), Y(p[5]));
    }
    shapes.push(shape);
  };

  // T: the top wing is its bar; the stem ends in a rounded heel.
  piece([
    [60, 23],
    [1633, 23],
    [1500, 160, 1381, 183],
    [980, 767],
    [905, 725, 835, 660, 895, 607],
    [1186, 183],
    [312, 183],
    [175, 165, 60, 23],
  ]);
  // Three lower feathers, each cut parallel to the stem.
  for (const [top, left, right, foot] of [
    [224, 337, 1110, 465],
    [344, 489, 1027, 617],
    [464, 642, 944, 767],
  ]) {
    piece([
      [left, top],
      [right, top],
      [right - 55, top + 80],
      [foot, top + 80],
      [foot - 75, top + 70, left, top],
    ]);
  }
  // 1, with its flag tucked under the T's wing.
  piece([
    [1745, 23],
    [1940, 23],
    [1428, 767],
    [1353, 725, 1283, 660, 1343, 607],
    [1634, 183],
    [1493, 183],
    [1630, 160, 1745, 23],
  ]);
  return shapes;
}

/** Rounded rectangle centred on the origin, in the XY plane. */
function roundedRect(width: number, height: number, radius: number) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

type PadFonts = { serif: string; script: string };
type Box2 = { x: number; y: number; width: number; height: number };

/** The two mottos, centred across the pad and set the same distance in from each end. Design units. */
function drawMottos(ctx: CanvasRenderingContext2D, fonts: PadFonts, which: "time" | "legacy") {
  const { width: W, height: H } = DESIGN;
  const margin = 66;
  ctx.fillStyle = PAD_GOLD;
  ctx.strokeStyle = PAD_GOLD;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  ctx.font = `100px ${fonts.serif}`;
  const size = (100 * 323) / ctx.measureText("Our Time").width;
  ctx.font = `${size}px ${fonts.serif}`;
  const baseline = H / 2 + ctx.measureText("O").actualBoundingBoxAscent / 2;

  if (which === "time") {
    ctx.fillText("Our Time", margin, baseline);
    return;
  }
  // "Our Legacy" opens on a swash capital; the rest is in the serif, at the same size as "Our Time".
  const rest = "ur Legacy";
  const restWidth = ctx.measureText(rest).width;
  ctx.font = `${size * 1.45}px ${fonts.script}`;
  const swashWidth = ctx.measureText("O").width;
  const start = W - margin - restWidth - swashWidth * 0.86;
  // The script is hairline thin; a stroke brings it up to the weight of the serif beside it.
  ctx.lineWidth = size * 0.035;
  ctx.lineJoin = "round";
  ctx.strokeText("O", start, baseline + size * 0.04);
  ctx.fillText("O", start, baseline + size * 0.04);
  ctx.font = `${size}px ${fonts.serif}`;
  ctx.fillText(rest, start + swashWidth * 0.86, baseline);
}

/** Areas of the print the mottos occupy, with room for ascenders, descenders and the swash. */
const MOTTO_AREAS: Record<"time" | "legacy", Box2> = {
  time: { x: 50, y: 330, width: 360, height: 130 },
  legacy: { x: 1300, y: 320, width: 460, height: 150 },
};
const MOTTO_PX_PER_UNIT = 8; // 16 px per millimetre on the pad

function buildPad(textures: THREE.Texture[], fonts: PadFonts, onRepaint: () => void) {
  const group = new THREE.Group();
  const { width, depth, thickness, corner } = PAD;
  const unit = width / DESIGN.width; // metres per design unit
  const top = thickness + 0.0002;

  // Rubber slab with a gold stitched rim; it lies flat, its shape's +Y pointing to the back of the desk.
  const slabGeometry = new THREE.ExtrudeGeometry(roundedRect(width, depth, corner), { depth: thickness, bevelEnabled: false, curveSegments: 10 }).rotateX(-Math.PI / 2);
  const slab = new THREE.Mesh(slabGeometry, [matte(PAD_BLACK, 0.95), matte("#a98838", 0.7)]);
  slab.receiveShadow = true;
  group.add(slab);

  // Everything gold except the lettering is real geometry, so it stays sharp at any distance.
  const gold = decalMaterial(matte(PAD_GOLD, 0.85), 2);
  const flat = (shapes: THREE.Shape[], segments = 12) => {
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shapes, segments).rotateX(-Math.PI / 2), gold);
    mesh.position.y = top;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Stitched edge: a 2.5 mm band all round.
  const edge = roundedRect(width, depth, corner);
  edge.holes.push(roundedRect(width - 0.005, depth - 0.005, corner - 0.0025));
  flat([edge]);

  // Five rules across the pad, interrupted by the crest.
  const rule = (x: number, from: number, to: number) => {
    const shape = new THREE.Shape();
    const half = 1.5;
    shape.moveTo(x - half, from);
    shape.lineTo(x + half, from);
    shape.lineTo(x + half, to);
    shape.lineTo(x - half, to);
    return shape;
  };
  const rules = [-73, -25, 0, 25, 73].flatMap((offset) => [rule(DESIGN.width / 2 + offset, 0, 262), rule(DESIGN.width / 2 + offset, 538, DESIGN.height)]);

  // Design units (y running towards the seat) to pad metres (shape +Y towards the back).
  const toPad = (shapes: THREE.Shape[], shiftX = 0) => {
    const mesh = flat(shapes, 16);
    mesh.geometry.translate(-(DESIGN.width / 2) + shiftX, 0, DESIGN.height / 2).scale(unit, 1, unit);
    // rotateX(-PI/2) sent design +y to -z; the design's y runs towards the seat, so flip it back,
    // and reverse the triangles so they still face up.
    mesh.geometry.scale(1, 1, -1);
    const index = mesh.geometry.index;
    if (index) {
      for (let i = 0; i < index.count; i += 3) {
        const second = index.getX(i + 1);
        index.setX(i + 1, index.getX(i + 2));
        index.setX(i + 2, second);
      }
    }
    return mesh;
  };
  toPad(rules);
  toPad(crestShapes(), CREST_X);

  // Plain winged "T1" in the bottom-right corner, clear of the mouse.
  const logo = flat(cornerLogoShapes(CORNER_LOGO.width), 16);
  logo.position.set(width / 2 - CORNER_LOGO.inset - CORNER_LOGO.width / 2, top, depth / 2 - CORNER_LOGO.inset - (CORNER_LOGO.width * LOGO_TRACE.height) / LOGO_TRACE.width / 2);

  // Mottos: each a small, dense texture of its own, laid on the pad where it belongs.
  const mottos = (Object.keys(MOTTO_AREAS) as ("time" | "legacy")[]).map((which) => {
    const area = MOTTO_AREAS[which];
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(area.width * MOTTO_PX_PER_UNIT);
    canvas.height = Math.round(area.height * MOTTO_PX_PER_UNIT);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.push(texture);
    const material = decalMaterial(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, transparent: true, depthWrite: false }), 4);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(area.width * unit, area.height * unit).rotateX(-Math.PI / 2), material);
    mesh.position.set((area.x + area.width / 2 - DESIGN.width / 2) * unit, top + 0.0001, (area.y + area.height / 2 - DESIGN.height / 2) * unit);
    mesh.receiveShadow = true;
    group.add(mesh);
    return { which, area, canvas, texture };
  });
  const paintMottos = () => {
    for (const { which, area, canvas, texture } of mottos) {
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(MOTTO_PX_PER_UNIT, 0, 0, MOTTO_PX_PER_UNIT, -area.x * MOTTO_PX_PER_UNIT, -area.y * MOTTO_PX_PER_UNIT);
      drawMottos(ctx, fonts, which);
      texture.needsUpdate = true;
    }
  };
  paintMottos();

  // The typefaces arrive after the first paint; repaint with them once they are in.
  if (typeof document !== "undefined" && document.fonts) {
    Promise.all([document.fonts.load(`100px ${fonts.serif}`), document.fonts.load(`100px ${fonts.script}`, "O")])
      .then(() => {
        paintMottos();
        onRepaint();
      })
      .catch(() => {});
  }

  return { group, thickness };
}

/**
 * Places on the pad, in its own frame (X along it, Z towards the seat): the keyboard on the left,
 * a little towards the seat, the mouse on the centre line in the right half.
 */
const KEYBOARD_ON_PAD = { x: -0.155, z: 0.04 };
/** The keyboard is drawn larger than life so it reads from the room view. */
const KEYBOARD_SCALE = 1.45;
const MOUSE_ON_PAD = { x: 0.305, z: 0 };
const MOUSE_SCALE = 0.9;

export function buildSetup({ padFonts, onRepaint }: { padFonts: { serif: string; script: string }; onRepaint: () => void }) {
  const group = new THREE.Group();
  const textures: THREE.Texture[] = []; // owned here; materials do not dispose their maps

  const monitor = buildMonitor();
  monitor.group.position.set(-0.14, 0, -0.2);
  group.add(monitor.group);

  const tower = buildTower();
  tower.position.set(0.68, 0, -0.12);
  group.add(tower);

  const pad = buildPad(textures, padFonts, onRepaint);
  pad.group.position.set(-0.14, 0, 0.17);
  group.add(pad.group);

  const keyboard = buildKeyboard(textures);
  keyboard.group.scale.setScalar(KEYBOARD_SCALE);
  keyboard.group.position.set(pad.group.position.x + KEYBOARD_ON_PAD.x, pad.thickness, pad.group.position.z + KEYBOARD_ON_PAD.z);
  group.add(keyboard.group);

  const mouse = buildMouse(textures);
  mouse.group.scale.setScalar(MOUSE_SCALE);
  mouse.group.position.set(pad.group.position.x + MOUSE_ON_PAD.x, pad.thickness, pad.group.position.z + MOUSE_ON_PAD.z);
  mouse.group.rotation.y = 0.1;
  group.add(mouse.group);

  return {
    group,
    display: monitor.display,
    displayPage: monitor.displayPage,
    displaySize: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
    hit: monitor.hit,
    textures,
    /** Polished metal that needs an environment map to look like chrome. */
    chrome: [keyboard.chrome, mouse.chrome],
  };
}
