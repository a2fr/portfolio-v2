import * as THREE from "three";
import { box, matte } from "./deskSetup";

/**
 * Executive office chair from the reference photo: cream upholstery, a tall back that flares at the
 * shoulders over a dark green shell, a separate headrest, chrome loop arms with green sleeves, and a
 * polished five-star base on black casters. Built facing +Z (the seat's front), origin on the floor.
 */

const CREAM = "#e9e3d7";
const GREEN = "#1f3b2d";
const BLACK = "#16171a";

function soft(mesh: THREE.Mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** Rounded rectangle with a separate corner radius for the front (+y) and back (-y) edges. */
function cushionShape(width: number, depth: number, front: number, back: number) {
  const w = width / 2;
  const d = depth / 2;
  const s = new THREE.Shape();
  s.moveTo(-w + back, -d);
  s.lineTo(w - back, -d);
  s.quadraticCurveTo(w, -d, w, -d + back);
  s.lineTo(w, d - front);
  s.quadraticCurveTo(w, d, w - front, d);
  s.lineTo(-w + front, d);
  s.quadraticCurveTo(-w, d, -w, d - front);
  s.lineTo(-w, -d + back);
  s.quadraticCurveTo(-w, -d, -w + back, -d);
  return s;
}

/** The back's outline: narrow at the lumbar, flaring to the shoulders, rounded across the top. */
function backShape(scale = 1) {
  const s = new THREE.Shape();
  const p = (x: number, y: number) => [x * scale, y * scale] as const;
  s.moveTo(...p(-0.19, 0));
  s.lineTo(...p(0.19, 0));
  s.bezierCurveTo(...p(0.21, 0.18), ...p(0.25, 0.36), ...p(0.25, 0.5));
  s.bezierCurveTo(...p(0.25, 0.6), ...p(0.22, 0.64), ...p(0.12, 0.64));
  s.lineTo(...p(-0.12, 0.64));
  s.bezierCurveTo(...p(-0.22, 0.64), ...p(-0.25, 0.6), ...p(-0.25, 0.5));
  s.bezierCurveTo(...p(-0.25, 0.36), ...p(-0.21, 0.18), ...p(-0.19, 0));
  return s;
}

function tube(points: [number, number, number][], radius: number, material: THREE.Material) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  return soft(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 12, false), material));
}

export function buildChair() {
  const group = new THREE.Group();
  const cream = matte(CREAM, 0.85);
  const green = matte(GREEN, 0.55);
  const black = matte(BLACK, 0.5);
  const chrome = new THREE.MeshStandardMaterial({ color: "#d9dadc", metalness: 1, roughness: 0.18 });

  // Seat: a thick, soft cushion on a dark pan.
  const seatBottom = 0.44;
  const seatGeometry = new THREE.ExtrudeGeometry(cushionShape(0.5, 0.48, 0.2, 0.1), {
    depth: 0.03,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 5,
    curveSegments: 16,
  });
  seatGeometry.rotateX(-Math.PI / 2);
  seatGeometry.translate(0, seatBottom + 0.03, 0.02);
  group.add(soft(new THREE.Mesh(seatGeometry, cream)));
  group.add(box([0.44, 0.02, 0.4], [0, seatBottom - 0.005, 0], black, 0.008));

  // Back: cream cushion on a slightly larger green shell, leaning back, with the headrest above.
  const back = new THREE.Group();
  back.position.set(0, 0.5, -0.24);
  back.rotation.x = -0.14;
  group.add(back);
  const backGeometry = new THREE.ExtrudeGeometry(backShape(), {
    depth: 0.04,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 5,
    curveSegments: 20,
  });
  back.add(soft(new THREE.Mesh(backGeometry, cream)));
  const shellGeometry = new THREE.ExtrudeGeometry(backShape(1.04), { depth: 0.02, bevelEnabled: false, curveSegments: 20 });
  shellGeometry.translate(0, -0.01, -0.045);
  back.add(soft(new THREE.Mesh(shellGeometry, green)));
  // Green neck rising from the shell to carry the headrest.
  back.add(box([0.26, 0.16, 0.025], [0, 0.7, -0.035], green, 0.01));
  back.add(box([0.36, 0.16, 0.09], [0, 0.82, 0.01], cream, 0.04));

  // Arms: a chrome loop from the back down to the seat side, a cream pad along the top and a green sleeve
  // on the front drop, as on the reference.
  for (const side of [-1, 1]) {
    const x = side * 0.27;
    group.add(
      tube(
        [
          [x, 0.56, -0.24],
          [x, 0.65, -0.17],
          [side * 0.285, 0.69, -0.02],
          [side * 0.285, 0.68, 0.12],
          [side * 0.28, 0.62, 0.19],
          [x, 0.54, 0.18],
          [side * 0.24, 0.5, 0.12],
        ],
        0.011,
        chrome,
      ),
    );
    group.add(
      tube(
        [
          [side * 0.29, 0.665, -0.15],
          [side * 0.3, 0.7, -0.02],
          [side * 0.3, 0.69, 0.11],
          [side * 0.293, 0.645, 0.18],
        ],
        0.02,
        cream,
      ),
    );
    group.add(
      tube(
        [
          [side * 0.283, 0.615, 0.192],
          [side * 0.278, 0.57, 0.188],
          [side * 0.27, 0.53, 0.172],
        ],
        0.019,
        green,
      ),
    );
  }

  // Tilt mechanism, height lever and gas lift.
  group.add(box([0.2, 0.05, 0.22], [0, seatBottom - 0.04, 0], black, 0.01));
  const lever = box([0.16, 0.014, 0.022], [0.14, seatBottom - 0.04, 0.06], black, 0.006);
  lever.rotation.y = -0.25;
  group.add(lever);
  const lift = soft(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 0.32, 20), black));
  lift.position.y = 0.09 + 0.16;
  group.add(lift);

  // Five-star base: polished spokes from a chrome hub, each ending on a twin-wheel caster.
  const hub = soft(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.05, 24), chrome));
  hub.position.y = 0.095;
  group.add(hub);
  const reach = 0.33;
  const wheelGeometry = new THREE.CylinderGeometry(0.032, 0.032, 0.014, 20);
  const capGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.034, 16);
  for (let i = 0; i < 5; i++) {
    const arm = new THREE.Group();
    arm.rotation.y = (i / 5) * Math.PI * 2 + Math.PI / 2;
    group.add(arm);
    const spoke = box([reach, 0.03, 0.045], [reach / 2, 0.088, 0], chrome, 0.012);
    spoke.rotation.z = -0.06;
    arm.add(spoke);
    arm.add(box([0.03, 0.03, 0.03], [reach - 0.01, 0.07, 0], chrome, 0.008));

    const caster = new THREE.Group();
    caster.position.set(reach - 0.01, 0.032, 0);
    arm.add(caster);
    for (const offset of [-0.012, 0.012]) {
      const wheel = soft(new THREE.Mesh(wheelGeometry, black));
      wheel.rotation.x = Math.PI / 2;
      wheel.position.z = offset;
      caster.add(wheel);
    }
    const cap = soft(new THREE.Mesh(capGeometry, chrome));
    cap.rotation.x = Math.PI / 2;
    caster.add(cap);
  }

  return { group, chrome: [chrome] };
}
