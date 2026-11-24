import * as THREE from "three";
import type { Lang } from "@/i18n/language";
import { matte } from "./deskSetup";

/** Cloth size of a flag at its normal size, in metres (3:2): oversized, like the piano, so it reads from the room view. */
const CLOTH_W = 0.13;
const CLOTH_H = 0.087;
const POLE_H = 0.24;
const BASE_R = 0.022;

const TEX_W = 360;
const TEX_H = 240;

/** Five-pointed star centred on (x, y), first point up. */
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 ? r * 0.4 : r;
    ctx.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
  }
  ctx.closePath();
  ctx.fill();
}

/** Each flag drawn with its hoist on the left, where the pole is. */
const PAINT: Record<Lang, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
  fr: (ctx, w, h) => {
    ["#0055a4", "#ffffff", "#ef4135"].forEach((colour, i) => {
      ctx.fillStyle = colour;
      ctx.fillRect((i * w) / 3, 0, w / 3 + 1, h);
    });
  },
  // England: St George's cross.
  en: (ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#ce1124";
    const bar = h / 5;
    ctx.fillRect(0, (h - bar) / 2, w, bar);
    ctx.fillRect((w - bar) / 2, 0, bar, h);
  },
  // Philippines: blue over red, a white triangle at the hoist with the golden sun and three stars.
  fil: (ctx, w, h) => {
    ctx.fillStyle = "#0038a8";
    ctx.fillRect(0, 0, w, h / 2);
    ctx.fillStyle = "#ce1126";
    ctx.fillRect(0, h / 2, w, h / 2);
    const apex = (h * Math.sqrt(3)) / 2;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(apex, h / 2);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fcd116";
    const sunX = apex / 3;
    const sunY = h / 2;
    const core = h * 0.085;
    for (let i = 0; i < 8; i++) {
      // Each of the eight rays is three thin flames.
      for (const spread of [-0.22, 0, 0.22]) {
        const angle = (i * Math.PI) / 4 + spread;
        const length = spread === 0 ? h * 0.2 : h * 0.16;
        const side = angle + Math.PI / 2;
        const half = h * 0.012;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(side) * half, sunY + Math.sin(side) * half);
        ctx.lineTo(sunX + Math.cos(angle) * length, sunY + Math.sin(angle) * length);
        ctx.lineTo(sunX - Math.cos(side) * half, sunY - Math.sin(side) * half);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.beginPath();
    ctx.arc(sunX, sunY, core, 0, Math.PI * 2);
    ctx.fill();
    const starR = h * 0.05;
    star(ctx, h * 0.075, h * 0.1, starR);
    star(ctx, h * 0.075, h * 0.9, starR);
    star(ctx, apex - h * 0.11, h / 2, starR);
  },
};

function flagTexture(lang: Lang) {
  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  const ctx = canvas.getContext("2d");
  if (ctx) PAINT[lang](ctx, TEX_W, TEX_H);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Cloth hanging from the pole with a soft wave that grows towards its free end. Left edge at x = 0. */
function clothGeometry() {
  const geometry = new THREE.PlaneGeometry(CLOTH_W, CLOTH_H, 24, 1);
  geometry.translate(CLOTH_W / 2, 0, 0);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const t = position.getX(i) / CLOTH_W;
    position.setZ(i, Math.sin(t * Math.PI * 1.6) * 0.0065 * (0.3 + t));
  }
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * One flag on its own: a thin pole with a gold finial and the cloth near the top, no base (it stands in the stand or
 * leans in the cup). Origin at the bottom of the pole; built facing +z, cloth to the +x of the pole.
 */
function buildFlag(lang: Lang) {
  const group = new THREE.Group();
  group.userData.lang = lang;
  const metal = matte("#c9b27a", 0.45);
  metal.metalness = 0.6;

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, POLE_H, 10), metal);
  pole.position.y = POLE_H / 2;
  group.add(pole);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.005, 14, 10), metal);
  finial.position.y = POLE_H + 0.002;
  group.add(finial);

  const texture = flagTexture(lang);
  const cloth = new THREE.Mesh(
    clothGeometry(),
    new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85, side: THREE.DoubleSide }),
  );
  cloth.position.set(0.0022, POLE_H - CLOTH_H / 2 - 0.003, 0);
  group.add(cloth);

  group.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
  });

  // Invisible block well around the cloth and the top of the pole, so a click near the flag takes it: the cloth
  // alone is only a few pixels wide from the room view. It rides with the flag when it moves.
  const PAD = 0.06;
  const bottom = 0.02;
  const top = POLE_H + PAD;
  const hitArea = new THREE.Mesh(
    new THREE.BoxGeometry(CLOTH_W + 2 * PAD, top - bottom, 0.08),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  hitArea.position.set(CLOTH_W / 2, (top + bottom) / 2, 0);
  hitArea.userData.hitArea = true;
  // Middle of the cloth: where the click areas overlap, the flag whose cloth is nearest the pointer takes the click.
  const centre = new THREE.Object3D();
  centre.position.set(CLOTH_W / 2, cloth.position.y, 0);
  group.add(centre);
  group.userData.centre = centre;
  group.add(hitArea);
  return { group, texture };
}

/** Weighted round base with a short socket the flag of the current language stands in. Origin at its bottom. */
const STAND_H = 0.022; // where the pole's foot rests, inside the socket
function buildStand() {
  const group = new THREE.Group();
  const wood = matte("#2c2420", 0.6);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(BASE_R * 0.85, BASE_R * 1.1, 0.009, 28), wood);
  base.position.y = 0.0045;
  group.add(base);
  const metal = matte("#c9b27a", 0.45);
  metal.metalness = 0.6;
  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0055, 0.018, 14), metal);
  socket.position.y = 0.009 + 0.009;
  group.add(socket);
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) child.castShadow = child.receiveShadow = true;
  });
  return group;
}

const CUP_H = 0.12;
const CUP_TOP_R = 0.042;
const CUP_BOTTOM_R = 0.035;
const CUP_FLOOR = 0.006; // the cup's floor, where the poles' feet rest

/**
 * Reusable plastic cup ("ecocup") in one dark green: rolled rim and a stacking ring near the foot.
 * Origin at the bottom centre.
 */
function buildCup() {
  const group = new THREE.Group();
  // Wall profile from the floor's centre out, up to the rolled rim; the lathe gives the inside and outside at once.
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(CUP_BOTTOM_R - 0.002, 0),
    new THREE.Vector2(CUP_BOTTOM_R, 0.002),
    new THREE.Vector2(CUP_BOTTOM_R + 0.0005, 0.012),
    new THREE.Vector2(CUP_BOTTOM_R + 0.0025, 0.014), // stacking ring
    new THREE.Vector2(CUP_BOTTOM_R + 0.0025 + 0.0003, 0.017),
    new THREE.Vector2(CUP_TOP_R - 0.0005, CUP_H - 0.002),
    new THREE.Vector2(CUP_TOP_R + 0.0012, CUP_H - 0.0005), // rolled rim
    new THREE.Vector2(CUP_TOP_R + 0.0008, CUP_H + 0.001),
    new THREE.Vector2(CUP_TOP_R - 0.0012, CUP_H),
  ];
  // Plain plastic in the dark green of the chair's back and the floor.
  const plastic = matte("#1f3b2d", 0.5);
  plastic.side = THREE.DoubleSide;
  const wall = new THREE.Mesh(new THREE.LatheGeometry(profile, 48), plastic);
  wall.castShadow = wall.receiveShadow = true;
  group.add(wall);
  return { group };
}

/** Where a flag rests: on the stand, or leaning in the cup to the viewer's left or right. */
export type FlagSlot = "stand" | "left" | "right";

/** How far the cup's flags lean, in radians from upright. */
const LEAN = 0.5;
/** Turned to face the room's usual viewpoint, so the cloth flies to the viewer's right. */
const FACE = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4);

/**
 * The flag stand on the viewer's left of the top shelf and the cup on their right, at `cupAt` from the stand.
 * Returns where a flag sits in each slot (position and orientation in the group's frame), and the flags themselves;
 * each flag's group carries its language in `userData.lang`, for picking.
 */
export function buildFlagCorner(cupAt: { x: number; z: number }) {
  const group = new THREE.Group();
  const stand = buildStand();
  group.add(stand);
  const cup = buildCup();
  cup.group.position.set(cupAt.x, 0, cupAt.z);
  group.add(cup.group);

  // Along the cup, the viewer's right is the flag's local +x after facing: world (cos, 0, -sin) of 45 degrees.
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(FACE);
  const towardViewer = new THREE.Vector3(0, 0, 1).applyQuaternion(FACE);
  // Leaning `angle` about the viewing axis; `mirrored` first turns the flag half round its pole, so the cloth flies
  // the other way and the two cup flags are each other's mirror image.
  const lean = (angle: number, mirrored = false) =>
    FACE.clone()
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle))
      .multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), mirrored ? Math.PI : 0));
  // The two poles cross in the cup: each foot sits on the side opposite to where its flag leans.
  const foot = (side: 1 | -1) =>
    cup.group.position
      .clone()
      .addScaledVector(right, -side * 0.028)
      .addScaledVector(towardViewer, side * 0.008)
      .setY(CUP_FLOOR);
  const slots: Record<FlagSlot, { position: THREE.Vector3; quaternion: THREE.Quaternion }> = {
    stand: { position: new THREE.Vector3(0, STAND_H, 0), quaternion: FACE.clone() },
    right: { position: foot(1), quaternion: lean(-LEAN) },
    left: { position: foot(-1), quaternion: lean(LEAN, true) },
  };

  const flags = {} as Record<Lang, THREE.Group>;
  const textures: THREE.Texture[] = [];
  for (const lang of ["fr", "en", "fil"] as const) {
    const flag = buildFlag(lang);
    group.add(flag.group);
    flags[lang] = flag.group;
    textures.push(flag.texture);
  }
  return { group, flags, slots, textures };
}
