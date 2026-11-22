"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { type BarItem, type DesktopView, desktopImageSrc } from "./desktopArt";
import { buildChair } from "./chair";
import { buildDiploma, buildGraduationCap } from "./graduation";
import { buildPiano } from "./piano";
import { buildWindowView, seasonOf } from "./windowView";
import { PAPER_SIZE, buildPaper, buildPen } from "./deskPaper";
import { box, buildSetup, matte } from "./deskSetup";
import { PAD_FONTS } from "./padFonts";
import { A4_ASPECT, ResumePaper } from "./ResumePaper";
import { EducationTimeline } from "./EducationTimeline";
import { OWNER_NAME, UbuntuDesktop, formatClock } from "./UbuntuDesktop";

const ROOM = 4; // floor side, in metres
const WALL_HEIGHT = 2.8;
const WALL_THICKNESS = 0.2;
const SLAB = 0.15; // chessboard floor slab
const BASE = 0.3; // grey plinth under it
const FOV = 20;
const ZOOM_MS = 1700;

type Mode = "room" | "entering" | "inside" | "leaving";
/** What the camera dives into: the monitor, the CV lying on the desk, or the graduation cap on the shelf. */
type Focus = "screen" | "paper" | "diplomas";
/** Where the paper and pen lie, in the setup's frame (x along the desk, +z towards the chair). */
const PAPER_AT = { x: -1.22, z: 0.04, turn: 0.03 };
const PEN_AT = { x: -1.46, z: 0.03, turn: -0.12 };
/** The camera comes down onto the paper from a little in front, so the page reads upright. */
const PAPER_VIEW_TILT = 0.12;
/** Direction (around y, from +x towards +z) the camera comes at the graduation cap's side from. */
const CAP_VIEW_TURN = 0.45;
const ROOM_BUTTON = "rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-ink backdrop-blur hover:bg-white";

/** Chessboard floor: 8 x 8 squares of the chair's green and a lighter tint of it, each with faint streaky grain. */
function chessFloor() {
  const size = 1024; // the whole floor, no tiling
  const squares = 8; // 50 cm squares across the 4 m room
  const cell = size / squares;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  let seed = 13;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const woods = [
    { hue: 150, sat: 24, light: 48 }, // lighter chair green
    { hue: 150, sat: 31, light: 18 }, // the chair's back green (#1f3b2d)
  ];

  // Canvas bottom is the front-left edge of the room (z = ROOM), canvas right the front-right edge (x = ROOM).
  // a1 sits in the front corner (bottom-right of the canvas) and is dark, as on a real board.
  const shade = (row: number, col: number) => (row + col + 1) % 2;

  for (let row = 0; row < squares; row++) {
    for (let col = 0; col < squares; col++) {
      const wood = woods[shade(row, col)];
      const x = col * cell;
      const y = row * cell;
      const light = wood.light + (rand() - 0.5) * 3;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, cell, cell);
      ctx.clip();
      ctx.fillStyle = `hsl(${wood.hue} ${wood.sat}% ${light}%)`;
      ctx.fillRect(x, y, cell, cell);
      // Grain: many thin, gently wavy streaks across the square, a few wider darker bands.
      for (let g = 0; g < 70; g++) {
        const gy = y + rand() * cell;
        const wave = (rand() - 0.5) * 4;
        const band = rand() < 0.12;
        const shift = band ? -4 - rand() * 4 : (rand() - 0.6) * 6;
        ctx.strokeStyle = `hsla(${wood.hue - 4} ${wood.sat}% ${light + shift}% / ${band ? 0.35 : 0.2 + rand() * 0.3})`;
        ctx.lineWidth = band ? 2 + rand() * 3 : 0.5 + rand();
        const from = x - 4 + rand() * cell * 0.3;
        const to = x + cell * (0.6 + rand() * 0.5);
        ctx.beginPath();
        ctx.moveTo(from, gy);
        ctx.bezierCurveTo(from + (to - from) / 3, gy + wave, from + (2 * (to - from)) / 3, gy - wave, to, gy + wave / 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Notation drawn as on a printed board seen from White's side, White standing at the front-right edge:
  // ranks 1-8 in the top-left corner of the a-file squares (front-left edge, 1 at the front corner),
  // files a-h in the bottom-right corner of the rank-1 squares (front-right edge, a at the front corner).
  // Each label takes the other square's colour. The transform maps White's view (x: a -> h, y: 8 -> 1)
  // onto the canvas: White's left is the canvas bottom, the far rank 8 is the canvas left.
  const ink = (row: number, col: number) => {
    const other = woods[1 - shade(row, col)];
    return `hsl(${other.hue} ${other.sat}% ${other.light}%)`;
  };
  const pad = cell * 0.06;
  ctx.save();
  ctx.setTransform(0, -1, 1, 0, 0, size);
  ctx.font = `700 ${Math.round(cell * 0.36)}px system-ui, sans-serif`;
  for (let rank = 1; rank <= squares; rank++) {
    const boardRow = squares - rank; // 0 at rank 8
    ctx.fillStyle = ink(squares - 1, boardRow); // a-file: canvas bottom row; rank 8 at canvas left
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(String(rank), pad, boardRow * cell + pad);
  }
  for (let file = 0; file < squares; file++) {
    ctx.fillStyle = ink(squares - 1 - file, squares - 1); // rank 1: canvas right column; a at canvas bottom
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText("abcdefgh"[file], (file + 1) * cell - pad, size - pad);
  }
  ctx.restore();

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map, roughness: 0.45 });
}

/** Window in the right wall, towards its left end (the back corner), clear of the piano. */
const WINDOW = { x0: 0.45, x1: 1.55, y0: 0.95, y1: 2.3 };

/** The right wall (plane z = 0): one slab with the window opening cut through it. */
function buildRightWall(wall: THREE.Material, wallH: number, wallY: number) {
  const { x0, x1, y0, y1 } = WINDOW;
  const bottom = wallY - wallH / 2;
  const outline = new THREE.Shape().moveTo(0, bottom).lineTo(ROOM, bottom).lineTo(ROOM, bottom + wallH).lineTo(0, bottom + wallH);
  outline.holes.push(new THREE.Path().moveTo(x0, y0).lineTo(x0, y1).lineTo(x1, y1).lineTo(x1, y0));
  const geometry = new THREE.ExtrudeGeometry(outline, { depth: WALL_THICKNESS, bevelEnabled: false });
  geometry.translate(0, 0, -WALL_THICKNESS);
  const mesh = new THREE.Mesh(geometry, wall);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

/** How far each casement swings into the room when open, and how long the swing takes. */
const WINDOW_OPEN_ANGLE = THREE.MathUtils.degToRad(72);
/** The whole motion: the handles turn first (the first HANDLE_SHARE of it), then the sashes swing. */
const WINDOW_SWING_MS = 1400;
const HANDLE_SHARE = 0.3;

/**
 * Casement window set in the opening: a chocolate-brown frame lining the reveal and a fixed transom with two
 * small panes above it; below, two tall sashes hinged on the outer jambs that meet in the middle and swing
 * into the room. `setOpen(t)` poses them, from 0 (shut) to 1 (fully open). The faintly tinted glass lets the
 * sun through.
 */
function buildWindow() {
  const group = new THREE.Group();
  const { x0, x1, y0, y1 } = WINDOW;
  const frame = matte("#5a3825", 0.55);
  const brass = new THREE.MeshStandardMaterial({ color: "#c9a45c", roughness: 0.35, metalness: 0.3 });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#cfe3ea",
    roughness: 0.05,
    metalness: 0,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  // A sheet of glass neither casts nor catches shadow, so sunlight passes.
  const glass = (width: number, height: number, position: [number, number, number]) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glassMaterial);
    mesh.position.set(...position);
    return mesh;
  };

  const cx = (x0 + x1) / 2;
  const w = x1 - x0;
  const h = y1 - y0;
  const bar = 0.05; // frame section
  const depth = 0.07; // frame depth, set back halfway into the wall
  const z = -WALL_THICKNESS / 2;

  // Outer frame lining the opening.
  group.add(box([w, bar, depth], [cx, y1 - bar / 2, z], frame));
  group.add(box([w, bar, depth], [cx, y0 + bar / 2, z], frame));
  group.add(box([bar, h, depth], [x0 + bar / 2, (y0 + y1) / 2, z], frame));
  group.add(box([bar, h, depth], [x1 - bar / 2, (y0 + y1) / 2, z], frame));

  // Fixed transom, with a short mullion and glass above it.
  const transomY = y1 - h * 0.28;
  const slim = bar * 0.7;
  group.add(box([w - 2 * bar, slim, depth * 0.9], [cx, transomY, z], frame));
  const topH = y1 - bar - (transomY + slim / 2);
  group.add(box([slim, topH, depth * 0.9], [cx, transomY + slim / 2 + topH / 2, z], frame));
  group.add(glass(w - 2 * bar, topH, [cx, transomY + slim / 2 + topH / 2, z]));

  // The two opening sashes, each built in a pivot on its hinge line (the jamb's inner edge, room-side face).
  const sashBar = 0.035;
  const sashDepth = 0.05;
  const gap = 0.002; // so the closed sashes don't touch each other or the frame
  const sashW = cx - (x0 + bar) - gap;
  const bottom = y0 + bar + gap;
  const sashH = transomY - slim / 2 - gap - bottom;
  const hingeZ = z + sashDepth / 2;
  const sashes: { pivot: THREE.Group; lever: THREE.Group; side: 1 | -1 }[] = [];
  for (const side of [1, -1] as const) {
    // side 1: left sash, hinged at x0, reaching towards +x; side -1: the mirror image.
    const pivot = new THREE.Group();
    pivot.position.set(side === 1 ? x0 + bar : x1 - bar, bottom + sashH / 2, hingeZ);
    const mid = (side * sashW) / 2;
    const zc = -sashDepth / 2;
    pivot.add(box([sashW, sashBar, sashDepth], [mid, sashH / 2 - sashBar / 2, zc], frame));
    pivot.add(box([sashW, sashBar, sashDepth], [mid, -sashH / 2 + sashBar / 2, zc], frame));
    pivot.add(box([sashBar, sashH - 2 * sashBar, sashDepth], [side * (sashBar / 2), 0, zc], frame));
    pivot.add(box([sashBar, sashH - 2 * sashBar, sashDepth], [side * (sashW - sashBar / 2), 0, zc], frame));
    pivot.add(glass(sashW - 2 * sashBar, sashH - 2 * sashBar, [mid, 0, zc]));
    // Lever handle on each sash's meeting stile, room side: a fixed rosette and a lever turning on it,
    // hanging straight down when locked.
    const handleX = side * (sashW - sashBar / 2);
    const handleY = -sashH * 0.08;
    pivot.add(box([0.022, 0.04, 0.012], [handleX, handleY, 0.006], brass));
    const lever = new THREE.Group();
    lever.position.set(handleX, handleY, 0.02);
    lever.add(box([0.016, 0.11, 0.014], [0, -0.045, 0], brass));
    pivot.add(lever);
    group.add(pivot);
    sashes.push({ pivot, lever, side });
  }

  // Invisible pane across the opening on the room side, so the window still takes a click once it is open.
  const opening = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ visible: false }));
  opening.position.set(cx, (y0 + y1) / 2, 0);
  group.add(opening);

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  // Opening plays forwards (unlock, then swing in); closing plays it backwards (swing shut, then lock).
  const setOpen = (t: number) => {
    const turn = ease(THREE.MathUtils.clamp(t / HANDLE_SHARE, 0, 1));
    const e = ease(THREE.MathUtils.clamp((t - HANDLE_SHARE) / (1 - HANDLE_SHARE), 0, 1));
    for (const { pivot, lever, side } of sashes) {
      // A quarter turn, the lever swinging up towards the hinge side until it lies horizontal.
      lever.rotation.z = -side * (Math.PI / 2) * turn;
      // Left sash a little ahead of the right one when opening, as hands do.
      const lag = side === 1 ? e : THREE.MathUtils.clamp(e * 1.12 - 0.12, 0, 1);
      pivot.rotation.y = -side * WINDOW_OPEN_ANGLE * lag;
    }
  };
  return { group, setOpen };
}

/** Two walls meeting in the back corner, on a chessboard floor slab and a grey plinth. */
function buildShell() {
  const group = new THREE.Group();
  const wall = matte("#f2efe8");
  const outer = ROOM + WALL_THICKNESS;
  const wallH = WALL_HEIGHT + SLAB;
  const wallY = WALL_HEIGHT / 2 - SLAB / 2;

  // Left wall (plane x = 0) and right wall (plane z = 0).
  group.add(box([WALL_THICKNESS, wallH, outer], [-WALL_THICKNESS / 2, wallY, outer / 2 - WALL_THICKNESS], wall));
  group.add(buildRightWall(wall, wallH, wallY));

  // Folded ribbon shelf on the left wall, its ramp over the monitor (world z ≈ 2.14).
  group.add(buildWallLedge(wall));

  // Chessboard on top only; the slab's sides are plain chair green so the squares don't smear down the edges.
  const edge = matte("#1f3b2d", 0.6);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(ROOM, SLAB, ROOM), [edge, edge, chessFloor(), edge, edge, edge]);
  floor.position.set(ROOM / 2, -SLAB / 2, ROOM / 2);
  floor.castShadow = floor.receiveShadow = true;
  group.add(floor);
  group.add(
    box([outer, BASE, outer], [outer / 2 - WALL_THICKNESS, -SLAB - BASE / 2, outer / 2 - WALL_THICKNESS], matte("#5b6066")),
  );
  return group;
}

/**
 * Wall shelf above the monitor shaped like a folded ribbon: a low flat run, a steep ramp, then a high flat run,
 * all one band of constant thickness with soft bends and softened edges, coming straight out of the wall.
 * The top line is drawn along the wall as (z, y); the band is that line offset downwards by its thickness.
 */
const LEDGE_PATH: [number, number][] = [
  [3.3, 1.66], // low run, towards the room's open end (long enough for the graduation display)
  [2.46, 1.66],
  [2.2, 2.04], // steep ramp up over the monitor
  [1.5, 2.04], // high run, towards the back corner
];

/**
 * Graduation cap and two rolled diplomas on the shelf's low run (top at y = 1.66, z ≈ 2.52 to 3.3).
 * Also returns the cap, whose side the camera dives into.
 */
function buildShelfDisplay() {
  const group = new THREE.Group();
  const shelfTop = LEDGE_PATH[0][1];

  const scale = 1.6;
  const cap = buildGraduationCap();
  cap.scale.setScalar(scale);
  cap.position.set(0.17, shelfTop, 2.74);
  cap.rotation.y = 0.35;
  group.add(cap);

  // Two rolls lying side by side, pointing out of the wall, one slightly askew.
  const radius = 0.019 * scale;
  for (const [z, turn, phase] of [
    [3.0, Math.PI / 2 - 0.04, 0.6],
    [3.08, Math.PI / 2 + 0.12, 2.9],
  ]) {
    const diploma = buildDiploma(0.2, 0.019, phase);
    diploma.scale.setScalar(scale); // the bow scales with the roll
    diploma.position.set(0.17, shelfTop + radius * 1.07, z); // rests on its flared ends
    diploma.rotation.y = turn;
    group.add(diploma);
  }

  // Invisible block around the cap and both rolls, so the gaps between them take a click too.
  const hitArea = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.52), new THREE.MeshBasicMaterial({ visible: false }));
  hitArea.position.set(0.18, shelfTop + 0.06, 2.87);
  group.add(hitArea);
  return { group, cap, capRadius: 0.07 * scale, capMidHeight: 0.0275 * scale };
}

function buildWallLedge(material: THREE.Material) {
  const thickness = 0.035;
  const depth = 0.34; // out of the wall, deep enough for the graduation cap
  const bend = 0.06; // radius-ish of the soft bends
  const edge = 0.008; // rounded edge size

  // Top line with each inner corner replaced by a short quadratic curve.
  const top: THREE.Vector2[] = [];
  const at = (i: number) => new THREE.Vector2(LEDGE_PATH[i][0], LEDGE_PATH[i][1]);
  top.push(at(0));
  for (let i = 1; i < LEDGE_PATH.length - 1; i++) {
    const corner = at(i);
    const before = corner.clone().add(at(i - 1).sub(corner).setLength(bend));
    const after = corner.clone().add(at(i + 1).sub(corner).setLength(bend));
    const curve = new THREE.QuadraticBezierCurve(before, corner, after);
    top.push(...curve.getPoints(10));
  }
  top.push(at(LEDGE_PATH.length - 1));

  // Offset each point perpendicular to the line (mitred), on the underside.
  const bottom = top.map((point, i) => {
    const prev = top[Math.max(i - 1, 0)];
    const next = top[Math.min(i + 1, top.length - 1)];
    const tangent = next.clone().sub(prev).normalize();
    const normal = new THREE.Vector2(tangent.y, -tangent.x); // points down for a line running towards -z
    if (normal.y > 0) normal.negate();
    return point.clone().addScaledVector(normal, thickness);
  });

  // Shape x is -z so that turning the extrusion to +x keeps the shelf in place.
  const outline = [...top, ...[...bottom].reverse()].map((p) => new THREE.Vector2(-p.x, p.y));
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(outline), {
    depth: depth - edge,
    bevelEnabled: true,
    bevelThickness: edge,
    bevelSize: edge,
    bevelSegments: 3,
  });
  geometry.rotateY(Math.PI / 2); // extrusion now runs out of the wall along +x
  geometry.translate(-0.01, 0, 0); // back face tucked just inside the wall

  const shelf = new THREE.Group();
  const band = new THREE.Mesh(geometry, material);
  band.castShadow = band.receiveShadow = true;
  shelf.add(band);

  // Concave fillets in the corners where the band meets the wall, along its top and its underside.
  const coveMaterial = (material as THREE.MeshStandardMaterial).clone();
  coveMaterial.side = THREE.DoubleSide;
  coveMaterial.vertexColors = true;
  for (const fillet of [wallFillet(top, 1, edge), wallFillet(bottom, -1, edge)]) {
    const mesh = new THREE.Mesh(fillet, coveMaterial);
    mesh.receiveShadow = true; // the band casts the shelf's shadow; a cove casting too speckles itself (shadow acne)
    shelf.add(mesh);
  }
  return shelf;
}

/**
 * A quarter-round cove of `FILLET_RADIUS` filling the corner between the wall (x = 0) and one face of the shelf band.
 * `line` is that face drawn along the wall as (z, y), `side` is +1 for the top face and -1 for the underside,
 * and `surface` is how far the real face sits beyond `line` (the band's rounded edge).
 */
const FILLET_RADIUS = 0.03;
const FILLET_SEGMENTS = 8;

// Scene lighting, shared with the coves so they can be shaded against it.
const SKY = new THREE.Color("#ffffff");
const GROUND = new THREE.Color("#c9dbe4");
const SKY_INTENSITY = 1.5;
const SUN = new THREE.Color("#fff6e6");
const SUN_INTENSITY = 2.2;
const SUN_OFFSET = new THREE.Vector3(8, 9, 1.5); // from the room centre
const SUN_DIRECTION = SUN_OFFSET.clone().normalize();

/** Diffuse light reaching a surface facing `normal`, from the hemisphere light and (when `lit`) the sun. */
function incoming(normal: THREE.Vector3, lit: boolean) {
  const light = SKY.clone().lerp(GROUND, 0.5 - normal.y / 2).multiplyScalar(SKY_INTENSITY);
  if (lit) light.add(SUN.clone().multiplyScalar(SUN_INTENSITY * Math.max(0, normal.dot(SUN_DIRECTION))));
  return light;
}

function wallFillet(line: THREE.Vector2[], side: 1 | -1, surface: number) {
  const r = FILLET_RADIUS;
  // Run the cove out to the band's rounded ends, which stick out past the line by `surface`.
  const points = line.map((p) => p.clone());
  points[0].add(points[0].clone().sub(points[1]).setLength(surface));
  const last = points.length - 1;
  points[last].add(points[last].clone().sub(points[last - 1]).setLength(surface));

  // Outward normal of the face at each point.
  const normals = points.map((_, i) => {
    const tangent = points[Math.min(i + 1, last)].clone().sub(points[Math.max(i - 1, 0)]).normalize();
    const normal = new THREE.Vector2(-tangent.y, tangent.x);
    return Math.sign(normal.y) === side ? normal : normal.negate();
  });

  // Profile of the cove: from the wall, `r` off the face, round to the face, `r` out of the wall.
  const profile = Array.from({ length: FILLET_SEGMENTS + 1 }, (_, j) => {
    const angle = Math.PI + (j / FILLET_SEGMENTS) * (Math.PI / 2);
    return { x: r + r * Math.cos(angle), off: r + r * Math.sin(angle) };
  });
  const place = (i: number, x: number, off: number) => {
    const p = points[i].clone().addScaledVector(normals[i], surface + off);
    return [x, p.y, p.x];
  };

  // The sun sits about 45 degrees between the wall and the shelf top, so the middle of the top cove faces it almost
  // head on and would glow brighter than both. Tint each vertex so the cove's brightness runs evenly from the wall's
  // to the face's instead. The underside cove and the wall under it are in the shelf's shadow: no sun there.
  const lit = side === 1;
  const wallNormal = new THREE.Vector3(1, 0, 0);
  const atWall = incoming(wallNormal, lit);
  const tint = (i: number, j: number) => {
    const t = j / FILLET_SEGMENTS;
    const angle = Math.PI + t * (Math.PI / 2);
    const face = new THREE.Vector3(0, normals[i].y, normals[i].x);
    const own = incoming(wallNormal.clone().multiplyScalar(-Math.cos(angle)).addScaledVector(face, -Math.sin(angle)), lit);
    const target = atWall.clone().lerp(incoming(face, lit), t);
    return [target.r / own.r, target.g / own.g, target.b / own.b];
  };

  const positions: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  const row = profile.length;
  points.forEach((_, i) =>
    profile.forEach(({ x, off }, j) => {
      positions.push(...place(i, x, off));
      colors.push(...tint(i, j));
    }),
  );
  for (let i = 0; i < last; i++) {
    for (let j = 0; j < row - 1; j++) {
      const a = i * row + j;
      const b = a + row;
      index.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // Close both ends with a flat fan from the corner, flush with the band's ends.
  for (const i of [0, last]) {
    const corner = positions.length / 3;
    positions.push(...place(i, 0, 0));
    colors.push(1, 1, 1);
    for (let j = 0; j < row - 1; j++) index.push(corner, i * row + j, i * row + j + 1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/** A steel bar from `from` to `to`, both [z, y] in the desk's side plane at `x`. */
function beam(x: number, from: [number, number], to: [number, number], width: number, thickness: number, material: THREE.Material) {
  const dz = to[0] - from[0];
  const dy = to[1] - from[1];
  const mesh = box([width, thickness, Math.hypot(dz, dy)], [x, (from[1] + to[1]) / 2, (from[0] + to[0]) / 2], material);
  mesh.rotation.x = Math.atan2(-dy, dz);
  return mesh;
}

/**
 * Dark grey gaming desk on two Z legs: rounded top with a shallow cut-out along the back edge, each leg a
 * floor foot, a slanted upright from the front of the foot to the back of the top, a rail under the top
 * and a brace between them. Built in the setup's frame: x along the desk, +z towards the front.
 */
function buildDesk() {
  const group = new THREE.Group();
  const height = 0.75;
  const depth = 0.8;
  const top = 0.025;
  // Along x: the tower end stays where it was, the other end reaches the room's left corner.
  const towerEnd = 0.9;
  const cornerEnd = -(ROOM - 2 - 0.02); // the desk group sits 2 m from the back wall
  const length = towerEnd - cornerEnd;
  const centre = (towerEnd + cornerEnd) / 2;
  const corner = 0.05;
  const steel = matte("#2b2d30", 0.55);

  // Top outline in (x, -z), so rotating it flat puts +v at the back.
  const hl = length / 2;
  const hd = depth / 2;
  const notch = 0.03;
  const notchHalf = length * 0.225;
  const slope = 0.06;
  const outline = new THREE.Shape();
  outline.moveTo(-hl + corner, -hd);
  outline.lineTo(hl - corner, -hd);
  outline.quadraticCurveTo(hl, -hd, hl, -hd + corner);
  outline.lineTo(hl, hd - corner);
  outline.quadraticCurveTo(hl, hd, hl - corner, hd);
  outline.lineTo(notchHalf + slope, hd);
  outline.lineTo(notchHalf, hd - notch);
  outline.lineTo(-notchHalf, hd - notch);
  outline.lineTo(-notchHalf - slope, hd);
  outline.lineTo(-hl + corner, hd);
  outline.quadraticCurveTo(-hl, hd, -hl, hd - corner);
  outline.lineTo(-hl, -hd + corner);
  outline.quadraticCurveTo(-hl, -hd, -hl + corner, -hd);

  const bevel = 0.004;
  const slab = new THREE.ExtrudeGeometry(outline, {
    depth: top - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  });
  slab.rotateX(-Math.PI / 2);
  slab.translate(centre, height - top + bevel, 0);
  const slabMesh = new THREE.Mesh(slab, matte("#3b3d41", 0.6));
  slabMesh.castShadow = true;
  slabMesh.receiveShadow = true;
  group.add(slabMesh);

  // Z legs: one under each end and one in the middle to carry the long span.
  const glide = 0.012;
  const footH = 0.035;
  const under = height - top;
  const glideGeometry = new THREE.CylinderGeometry(0.018, 0.018, glide, 16);
  for (const side of [-1, 0, 1]) {
    const x = centre + side * (hl - 0.14);
    group.add(box([0.05, footH, 0.72], [x, glide + footH / 2, 0], steel));
    for (const z of [-0.33, 0.33]) {
      const pad = new THREE.Mesh(glideGeometry, steel);
      pad.position.set(x, glide / 2, z);
      group.add(pad);
    }
    const base: [number, number] = [0.3, glide + footH];
    const head: [number, number] = [-0.24, under];
    group.add(beam(x, base, head, 0.045, 0.06, steel));
    group.add(box([0.045, 0.03, 0.4], [x, under - 0.015, -0.1], steel));
    // Brace from partway up the upright to the front end of the rail.
    const t = 0.7;
    const mid: [number, number] = [base[0] + (head[0] - base[0]) * t, base[1] + (head[1] - base[1]) * t];
    group.add(beam(x, mid, [0.08, under - 0.02], 0.04, 0.025, steel));
  }
  return { group, height };
}

export function Bedroom() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("room");
  const [focus, setFocus] = useState<Focus>("screen");
  const [hover, setHover] = useState(false);
  const controlsRef = useRef<{ enter: (which: Focus) => void; leave: () => void; toggleWindow: () => void } | null>(
    null,
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.autoUpdate = false; // nothing that casts a shadow moves: redrawn only on real changes
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.02, 80);

    scene.add(new THREE.HemisphereLight(SKY, GROUND, SKY_INTENSITY));
    const sun = new THREE.DirectionalLight(SUN, SUN_INTENSITY);
    sun.position.set(ROOM / 2, 0, ROOM / 2).add(SUN_OFFSET);
    sun.target.position.set(ROOM / 2, 0, ROOM / 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -7;
    sun.shadow.camera.right = 7;
    sun.shadow.camera.top = 7;
    sun.shadow.camera.bottom = -7;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    sun.shadow.radius = 6;
    scene.add(sun, sun.target);

    // Catches the room's shadow on the page background.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.ShadowMaterial({ opacity: 0.16 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -SLAB - BASE;
    ground.receiveShadow = true;
    scene.add(ground);

    scene.add(buildShell());
    const shelf = buildShelfDisplay();
    scene.add(shelf.group);
    const casement = buildWindow();
    scene.add(casement.group);
    // What the window looks out on follows the season; it may move (falling snow).
    const outside = buildWindowView(seasonOf(new Date()));
    scene.add(outside.group);

    const desk = buildDesk();
    desk.group.position.set(0.44, 0, 2);
    desk.group.rotation.y = Math.PI / 2; // same frame as the setup
    scene.add(desk.group);

    const setup = buildSetup({ padFonts: PAD_FONTS, onRepaint: () => (dirty = true) });
    for (const texture of setup.textures) texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // Chrome only reads as chrome with something to reflect; the rest of the room keeps its flat lighting.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const reflections = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    for (const material of setup.chrome) material.envMap = reflections;
    setup.group.position.set(0.44, desk.height, 2);
    setup.group.rotation.y = Math.PI / 2; // screen faces into the room
    scene.add(setup.group);

    // Office chair pulled out in front of the monitor, turned a little towards the room.
    const chair = buildChair();
    for (const material of chair.chrome) material.envMap = reflections;
    chair.group.position.set(1.42, 0, 2.08);
    chair.group.rotation.y = -Math.PI / 2 + 0.45;
    scene.add(chair.group);

    // Full-size stage piano against the right wall, towards its open end; built facing +z, so the keys face the room.
    const piano = buildPiano({ onRepaint: () => (dirty = true) });
    for (const material of piano.chrome) material.envMap = reflections;
    for (const texture of piano.textures) texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    piano.group.scale.setScalar(1.5); // oversized on purpose so it reads from the room view
    piano.group.position.set(2.85, 0, 0.27);
    scene.add(piano.group);

    // The CV on the empty end of the desk, with a pen beside it.
    const paper = buildPaper(OWNER_NAME);
    paper.sheet.position.x = PAPER_AT.x;
    paper.sheet.position.z = PAPER_AT.z;
    paper.sheet.rotation.y = PAPER_AT.turn;
    setup.group.add(paper.sheet);
    const pen = buildPen();
    pen.position.x = PEN_AT.x;
    pen.position.z = PEN_AT.z;
    pen.rotation.y = PEN_AT.turn;
    setup.group.add(pen);
    scene.updateMatrixWorld(true);

    // The monitor shows the desktop the zoom lands on. Two pictures of it are kept: one laid out across the
    // whole panel, for the room, and one laid out for the page, which takes over during the dive.
    let disposed = false;
    let screenRequest = 0;
    const texH = 1024;
    const texW = Math.round((texH * setup.displaySize.width) / setup.displaySize.height);
    const PANEL_PAGE_HEIGHT = 520; // CSS pixels the panel's own layout pretends to be tall

    // Status indicators are copied from the page's own top bar, so both show the same thing in the same place.
    const readBarItems = (): BarItem[] =>
      Array.from(host.parentElement?.querySelectorAll<HTMLElement>("[data-bar-item]") ?? [], (el) => {
        const place = { x: el.offsetLeft, y: el.offsetTop, width: el.offsetWidth, height: el.offsetHeight };
        const icon = el.querySelector("svg");
        return icon
          ? { ...place, svg: icon.innerHTML }
          : { ...place, text: el.textContent ?? "", weight: getComputedStyle(el).fontWeight };
      });

    const paintLayer = (layer: THREE.Mesh, view: DesktopView, items: BarItem[], request: number) => {
      const image = new Image();
      image.onload = () => {
        if (disposed || request !== screenRequest) return;
        const canvas = document.createElement("canvas");
        canvas.width = texW;
        canvas.height = texH;
        canvas.getContext("2d")?.drawImage(image, 0, 0, texW, texH);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const material = layer.material as THREE.MeshBasicMaterial;
        material.map?.dispose();
        material.map = texture;
        material.color.set("#ffffff");
        material.needsUpdate = true;
        dirty = true;
      };
      image.src = desktopImageSrc(texW, texH, view, OWNER_NAME, formatClock(new Date()), items);
    };

    const paintScreen = () => {
      const pageWidth = host.clientWidth;
      const pageHeight = host.clientHeight;
      if (!pageWidth || !pageHeight) return;
      const request = ++screenRequest;
      const items = readBarItems();

      // Whole panel: same bar, with the indicators pushed out to the panel's right edge.
      const panelScale = texH / PANEL_PAGE_HEIGHT;
      const shift = texW / panelScale - pageWidth;
      paintLayer(
        setup.display,
        { x: 0, y: 0, width: texW, height: texH, scale: panelScale },
        items.map((item) => ({ ...item, x: item.x + shift })),
        request,
      );

      // The final camera pose crops the display to the page's shape; lay the desktop out in that crop.
      const pageAspect = pageWidth / pageHeight;
      const width = Math.min(texW, texH * pageAspect);
      const height = width / pageAspect;
      paintLayer(setup.displayPage, { x: (texW - width) / 2, y: (texH - height) / 2, width, height, scale: height / pageHeight }, items, request);
    };

    // Camera poses: the whole room, and nose-to-screen on the monitor.
    const roomCentre = new THREE.Vector3(ROOM / 2 - 0.1, WALL_HEIGHT / 2 - 0.3, ROOM / 2 - 0.1);
    const roomRadius = 3.4;
    const viewDir = new THREE.Vector3(1, 0.78, 1).normalize();
    const screenCentre = setup.display.getWorldPosition(new THREE.Vector3());
    const screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(setup.display.getWorldQuaternion(new THREE.Quaternion()));

    const paperCentre = paper.sheet.getWorldPosition(new THREE.Vector3());
    const paperView = new THREE.Vector3(Math.sin(PAPER_VIEW_TILT), Math.cos(PAPER_VIEW_TILT), 0); // +x is the chair side

    // The cap is approached side-on, at the height of its skull cap, from the room and a little towards the
    // open end so the tassel (on the cap's +x edge) stays out of the way; the dive ends with its black side
    // filling the view, and the education timeline takes over on the same black.
    const capCentre = shelf.cap.getWorldPosition(new THREE.Vector3());
    capCentre.y += shelf.capMidHeight;
    const capSide = new THREE.Vector3(Math.cos(CAP_VIEW_TURN), 0, Math.sin(CAP_VIEW_TURN));

    const far = { position: new THREE.Vector3() };
    const near = {
      screen: new THREE.Vector3(),
      paper: new THREE.Vector3(),
      diplomas: capCentre.clone().addScaledVector(capSide, shelf.capRadius + 0.035),
    };
    const centres: Record<Focus, THREE.Vector3> = { screen: screenCentre, paper: paperCentre, diplomas: capCentre };
    const aim = new THREE.Vector3();

    const computePoses = () => {
      const aspect = camera.aspect;
      const halfV = THREE.MathUtils.degToRad(FOV / 2);
      const halfH = Math.atan(Math.tan(halfV) * aspect);

      far.position.copy(roomCentre).addScaledVector(viewDir, (roomRadius / Math.sin(Math.min(halfV, halfH))) * 1.02);
      // Close enough that the display just covers the viewport: the crop the desktop picture is laid out for.
      const fill = Math.min(
        setup.displaySize.height / (2 * Math.tan(halfV)),
        setup.displaySize.width / (2 * Math.tan(halfV) * aspect),
      );
      near.screen.copy(screenCentre).addScaledVector(screenNormal, fill);

      // Close enough that the sheet is as tall on screen as the A4 page the overlay then shows.
      const pageHeight = Math.min(0.92, (0.92 * aspect) / A4_ASPECT); // fraction of the viewport height
      near.paper.copy(paperCentre).addScaledVector(paperView, PAPER_SIZE.height / (2 * Math.tan(halfV) * pageHeight));
    };

    // 0 = room, 1 = at the focus.
    let focusOn: Focus = "screen";
    let progress = 0;
    let target = 0;
    let dirty = true;
    let last = performance.now();
    let frame = 0;
    // 0 = shut, 1 = wide open.
    let windowAt = 0;
    let windowTarget = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const applyCamera = () => {
      const e = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      // Geometric travel: the distance shrinks ~40x, so equal steps would rush the end.
      // The cap's side ends a few centimetres away: a much longer way down, so a steeper curve.
      const k = focusOn === "diplomas" ? 300 : 40;
      const remaining = (Math.pow(k, 1 - e) - 1) / (k - 1);
      const onScreen = focusOn === "screen";
      camera.position.copy(near[focusOn]).lerp(far.position, remaining);
      // Aim at the focus early, so it stays centred for the whole dive.
      camera.lookAt(aim.copy(roomCentre).lerp(centres[focusOn], Math.min(1, e * 3)));

      // On the way in, the panel's picture becomes the page's, so the dive ends on the page itself.
      const pageLayer = setup.displayPage.material as THREE.MeshBasicMaterial;
      pageLayer.opacity = onScreen ? THREE.MathUtils.smoothstep(e, 0.4, 0.6) : 0;
      setup.displayPage.visible = pageLayer.opacity > 0 && pageLayer.map !== null;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      computePoses();
      paintScreen();
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    // Repaint when the bar changes: the minute, the battery, the network, the language.
    const barObserver = new MutationObserver(paintScreen);
    const bar = host.parentElement?.querySelector("[data-desktop-bar]");
    if (bar) barObserver.observe(bar, { subtree: true, childList: true, characterData: true, attributes: true });

    // The outdoors is redrawn a little over 20 times a second, and only while the room is on screen and seen
    // from outside; between real changes those frames skip the shadow pass.
    const OUTSIDE_FRAME_MS = 1000 / 24;
    let outsideAt = 0;
    let inView = true;
    const visibility = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    visibility.observe(host);

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = now - last;
      last = now;
      if (dirty) renderer.shadowMap.needsUpdate = true;
      if (outside.animate && !reduceMotion && inView && progress < 1 && now - outsideAt >= OUTSIDE_FRAME_MS) {
        outsideAt = now;
        outside.animate(now / 1000);
        dirty = true;
      }
      if (progress !== target) {
        const step = reduceMotion ? 1 : dt / ZOOM_MS;
        progress = target > progress ? Math.min(target, progress + step) : Math.max(target, progress - step);
        dirty = true;
        if (progress === target) setMode(target === 1 ? "inside" : "room");
      }
      if (windowAt !== windowTarget) {
        const step = reduceMotion ? 1 : dt / WINDOW_SWING_MS;
        windowAt = windowTarget > windowAt ? Math.min(windowTarget, windowAt + step) : Math.max(windowTarget, windowAt - step);
        casement.setOpen(windowAt);
        dirty = true;
      }
      if (!dirty) return;
      dirty = false;
      applyCamera();
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(tick);

    controlsRef.current = {
      enter: (which) => {
        if (target === 1) return;
        // Coming back from one focus, the other has to wait until the camera is in the room again.
        if (progress > 0 && which !== focusOn) return;
        focusOn = which;
        setFocus(which);
        target = 1;
        setHover(false);
        setMode("entering");
      },
      leave: () => {
        if (target === 0) return;
        target = 0;
        setMode("leaving");
      },
      toggleWindow: () => {
        windowTarget = windowTarget === 1 ? 0 : 1;
      },
    };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const targets: [THREE.Object3D, Focus][] = [
      [setup.hit, "screen"],
      [paper.sheet, "paper"],
    ];
    // Any part of the cap or of either diploma.
    const groups: [THREE.Object3D, Focus | "window"][] = [
      [shelf.group, "diplomas"],
      [casement.group, "window"],
    ];
    // What is under the pointer: the monitor, the paper, the cap and diplomas, or any part of the window.
    const pick = (event: PointerEvent | MouseEvent): Focus | "window" | null => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const candidates = [...targets.map(([object]) => object), ...groups.map(([object]) => object)];
      const hit = raycaster.intersectObjects(candidates, true)[0];
      if (!hit) return null;
      const focus = targets.find(([object]) => object === hit.object)?.[1];
      if (focus) return focus;
      for (let object: THREE.Object3D | null = hit.object; object; object = object.parent) {
        const group = groups.find(([candidate]) => candidate === object);
        if (group) return group[1];
      }
      return null;
    };
    const onMove = (event: PointerEvent) => setHover(target === 0 && progress === 0 && pick(event) !== null);
    const onClick = (event: MouseEvent) => {
      const which = target === 0 ? pick(event) : null;
      if (which === "window") {
        if (progress === 0) controlsRef.current?.toggleWindow();
      }
      else if (which) controlsRef.current?.enter(which);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") controlsRef.current?.leave();
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    return () => {
      disposed = true;
      setup.textures.forEach((texture) => texture.dispose());
      paper.texture.dispose();
      reflections.dispose();
      for (const layer of [setup.display, setup.displayPage]) (layer.material as THREE.MeshBasicMaterial).map?.dispose();
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      barObserver.disconnect();
      window.removeEventListener("keydown", onKey);
      controlsRef.current = null;
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          (Array.isArray(object.material) ? object.material : [object.material]).forEach((m) => m.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const leave = useCallback(() => controlsRef.current?.leave(), []);
  const enterScreen = useCallback(() => controlsRef.current?.enter("screen"), []);
  const enterPaper = useCallback(() => controlsRef.current?.enter("paper"), []);
  const enterDiplomas = useCallback(() => controlsRef.current?.enter("diplomas"), []);
  const inScreen = mode === "inside" && focus === "screen";
  const inPaper = mode === "inside" && focus === "paper";
  const inDiplomas = mode === "inside" && focus === "diplomas";

  return (
    <div className="room fixed inset-0 z-40 overflow-hidden">
      <div ref={hostRef} className="absolute inset-0" style={{ cursor: hover ? "pointer" : "default" }} />

      {/* Keyboard and screen-reader routes to the same actions as clicking the monitor or the paper. */}
      <div
        className={`absolute inset-x-4 bottom-8 flex flex-wrap justify-center gap-2 transition-opacity duration-300 ${
          mode === "room" ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <button type="button" onClick={enterScreen} disabled={mode !== "room"} className={ROOM_BUTTON}>
          Click the screen to open it
        </button>
        <button type="button" onClick={enterPaper} disabled={mode !== "room"} className={ROOM_BUTTON}>
          Click the paper to read my resume
        </button>
        <button type="button" onClick={enterDiplomas} disabled={mode !== "room"} className={ROOM_BUTTON}>
          Click the diplomas to see my education
        </button>
      </div>

      <div
        aria-hidden={!inScreen}
        className={`absolute inset-0 transition-opacity duration-300 ${inScreen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <UbuntuDesktop active={inScreen} onLeave={leave} />
      </div>

      <div
        aria-hidden={!inPaper}
        className={`absolute inset-0 transition-opacity duration-300 ${inPaper ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <ResumePaper active={inPaper} onLeave={leave} />
      </div>

      <div
        aria-hidden={!inDiplomas}
        className={`absolute inset-0 transition-opacity duration-500 ${inDiplomas ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <EducationTimeline active={inDiplomas} onLeave={leave} />
      </div>
    </div>
  );
}
