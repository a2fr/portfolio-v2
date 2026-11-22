import * as THREE from "three";

/** Paper and pen are drawn larger than life so they read from the room view, like the keyboard. */
const SCALE = 1.6;
/** A4 in metres, at that scale. */
export const PAPER_SIZE = { width: 0.21 * SCALE, height: 0.297 * SCALE };

/** A printed-looking CV page: a header and grey lines, readable as a document from across the room. */
function paperTexture(name: string) {
  const w = 1024;
  const h = Math.round((w * PAPER_SIZE.height) / PAPER_SIZE.width);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#fbfaf6";
    ctx.fillRect(0, 0, w, h);
    const margin = 90;

    ctx.fillStyle = "#15201b";
    ctx.font = "600 68px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(name, margin, 170);
    ctx.fillStyle = "#55635c";
    ctx.font = "34px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("Curriculum vitae", margin, 225);
    ctx.fillStyle = "#15201b";
    ctx.fillRect(margin, 262, w - margin * 2, 4);

    // Sections: a dark heading bar, then lines of grey "text" of uneven length.
    let y = 330;
    const sections = [5, 4, 6, 3];
    sections.forEach((lines, s) => {
      ctx.fillStyle = "#2b3530";
      ctx.fillRect(margin, y, 220 + (s % 2) * 60, 26);
      y += 62;
      for (let i = 0; i < lines; i++) {
        const length = 0.55 + (((i * 37 + s * 11) % 40) / 100);
        ctx.fillStyle = "#b9c0bc";
        ctx.fillRect(margin, y, (w - margin * 2) * length, 14);
        y += 36;
      }
      y += 44;
    });
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A sheet lying flat, its top towards -z (the wall). The returned mesh is also the click target. */
export function buildPaper(name: string) {
  const texture = paperTexture(name);
  const geometry = new THREE.PlaneGeometry(PAPER_SIZE.width, PAPER_SIZE.height).rotateX(-Math.PI / 2);
  const sheet = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ map: texture, roughness: 0.95 }));
  sheet.position.y = 0.0006; // just above the desk top
  sheet.receiveShadow = true;
  return { sheet, texture };
}

/**
 * A stylus ball pen lying on its side along z, tip towards -z: black stylus dome and gold collar at
 * the back, chrome cap and wire clip, matte rust-orange barrel, three chrome rings, chrome cone tip.
 */
export function buildPen() {
  const group = new THREE.Group();
  const length = 0.14;
  const radius = 0.0055; // widest point of the barrel; the axis sits this high above the desk
  // Positions come from the reference drawing: 0 is the back end, 1 the writing tip.
  const at = (t: number) => length / 2 - t * length;

  const barrel = new THREE.MeshStandardMaterial({ color: "#c9532e", roughness: 0.75 });
  const chrome = new THREE.MeshStandardMaterial({ color: "#e4e7ea", roughness: 0.28, metalness: 0.55 }); // half metal so it reads silver from above
  const gold = new THREE.MeshStandardMaterial({ color: "#d39a3a", roughness: 0.35, metalness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: "#1b1b1d", roughness: 0.9 });

  /** A section of the pen between two points, its radius going from `rBack` to `rFront`. */
  const segment = (from: number, to: number, rBack: number, rFront: number, material: THREE.Material) => {
    const geometry = new THREE.CylinderGeometry(rBack, rFront, at(from) - at(to), 24);
    geometry.rotateX(Math.PI / 2); // cylinder top (+y) now points to the back (+z)
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, radius, (at(from) + at(to)) / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };

  // Stylus: a rubber dome on a short stem.
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.0033, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), rubber);
  dome.position.set(0, radius, at(0.03));
  dome.castShadow = true;
  group.add(dome);
  segment(0.03, 0.045, 0.0033, 0.0033, rubber);
  // Gold collar with two thin chrome lines.
  segment(0.045, 0.1, 0.0037, 0.0038, gold);
  segment(0.055, 0.062, 0.00385, 0.00385, chrome);
  segment(0.082, 0.089, 0.00385, 0.00385, chrome);
  // Chrome cap, flaring slightly into the barrel.
  segment(0.1, 0.185, 0.0049, 0.0054, chrome);
  // Matte barrel, tapering a touch towards the tip.
  segment(0.185, 0.83, radius, 0.005, barrel);
  // Three chrome rings near the front.
  for (const t of [0.72, 0.745, 0.77]) segment(t, t + 0.009, 0.00525, 0.00522, chrome);
  // Chrome cone and the refill tip.
  segment(0.83, 0.955, 0.005, 0.0013, chrome);
  segment(0.955, 1, 0.0009, 0.0003, chrome);

  // Wire clip: a riser off the chrome cap, then a long flat blade over the barrel.
  const clipLift = radius + 0.0018;
  const riser = new THREE.Mesh(new THREE.BoxGeometry(0.0026, 0.0022, at(0.12) - at(0.165)), chrome);
  riser.position.set(0, radius + 0.0049 + 0.0011, (at(0.12) + at(0.165)) / 2);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.0026, 0.0011, at(0.13) - at(0.43)), chrome);
  blade.position.set(0, radius + clipLift, (at(0.13) + at(0.43)) / 2);
  blade.rotation.x = -0.02; // the free end leans in towards the barrel
  for (const part of [riser, blade]) {
    part.castShadow = true;
    group.add(part);
  }

  // The clip rolls the pen onto its side a little.
  group.rotation.z = 0.35;
  group.position.y = radius * 0.06;
  // Wrapped so callers can turn and place it freely; the scale keeps it level on the desk.
  const pen = new THREE.Group();
  pen.add(group);
  pen.scale.setScalar(SCALE);
  return pen;
}
