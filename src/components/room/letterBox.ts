import * as THREE from "three";
import { box, matte } from "./deskSetup";

/** The dark inside the box: the colour of its slot, and of the page the contact form opens on. */
export const LETTER_BOX_DARK = "#0c1d13";
export const LETTER_BOX_GREEN = "#2f8f55";

/** A cream envelope outline, embossed on the box's door. */
function envelopeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  ctx.strokeStyle = "#f3ead0";
  ctx.lineWidth = 10;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeRect(14, 14, 228, 132);
  ctx.beginPath();
  ctx.moveTo(14, 18);
  ctx.lineTo(128, 96);
  ctx.lineTo(242, 18);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Green wall letter box, built against a wall at x = 0 and sticking out along +x (z runs along the wall):
 * a body under an overhanging lid, the slot the camera dives into, and a small door with an envelope and a lock.
 */
export function buildLetterBox() {
  const group = new THREE.Group();
  const width = 0.4;
  const height = 0.3;
  const depth = 0.13;
  const green = matte(LETTER_BOX_GREEN, 0.5);
  const shade = matte("#236e41", 0.5);
  const brass = matte("#d2ad55", 0.4);

  group.add(box([depth, height, width], [depth / 2, 0, 0], green, 0.012));
  group.add(box([depth + 0.03, 0.022, width + 0.03], [(depth + 0.03) / 2, height / 2 + 0.004, 0], shade, 0.008));

  // Slot: a raised surround, and the dark opening itself, unlit so it is exactly the form's background.
  const slotY = 0.065;
  group.add(box([0.008, 0.06, 0.32], [depth + 0.002, slotY, 0], shade, 0.002));
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.002, 0.03, 0.28),
    new THREE.MeshBasicMaterial({ color: LETTER_BOX_DARK }),
  );
  slot.position.set(depth + 0.0065, slotY, 0);
  group.add(slot);

  // Door under the slot, with the envelope on it and its lock on the corner side.
  const doorY = -0.065;
  group.add(box([0.006, 0.13, 0.32], [depth + 0.001, doorY, 0], shade, 0.002));
  const texture = envelopeTexture();
  const envelope = new THREE.Mesh(
    new THREE.PlaneGeometry(0.112, 0.07),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
  );
  envelope.rotation.y = Math.PI / 2; // faces the room
  envelope.position.set(depth + 0.0046, doorY, 0.02);
  group.add(envelope);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.006, 20), brass);
  lock.rotation.z = Math.PI / 2;
  lock.position.set(depth + 0.006, doorY, -0.125);
  group.add(lock);

  return { group, slot, texture };
}
