import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { SYSTEM_MAP } from "../data/systems";

const MaterialCtx = { disableDepthTest: false };

function useSystemMaterial(systemId: string, opacity = 0.6) {
  const noDepth = MaterialCtx.disableDepthTest;
  return useMemo(() => {
    const sys = SYSTEM_MAP[systemId];
    const color = new THREE.Color(sys?.color || "#888");
    return new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: noDepth ? 0.5 : 0.35,
      transparent: true,
      opacity: noDepth ? Math.min(opacity + 0.15, 0.85) : opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: !noDepth,
    });
  }, [systemId, opacity, noDepth]);
}

function useWireMaterial(systemId: string, opacity = 0.5) {
  const noDepth = MaterialCtx.disableDepthTest;
  return useMemo(() => {
    const sys = SYSTEM_MAP[systemId];
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color(sys?.color || "#888"),
      wireframe: true,
      transparent: true,
      opacity: noDepth ? Math.min(opacity + 0.15, 0.75) : opacity,
      depthTest: !noDepth,
    });
  }, [systemId, opacity, noDepth]);
}

function tube(path: THREE.Vector3[], radius: number, segs = 32) {
  const curve = new THREE.CatmullRomCurve3(path);
  return new THREE.TubeGeometry(curve, segs, radius, 8, false);
}

function mirrorX(pts: THREE.Vector3[]): THREE.Vector3[] {
  return pts.map((p) => new THREE.Vector3(-p.x, p.y, p.z));
}

// ─── SKELETAL SYSTEM ────────────────────────────────────────────────────────────

function SkeletalSystem() {
  const boneMat = useSystemMaterial("skeletal", 0.65);
  const wireMat = useWireMaterial("skeletal", 0.45);

  const geoms = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];

    // Skull
    parts.push((() => { const g = new THREE.SphereGeometry(0.17, 16, 12); g.translate(0, 1.83, 0); return g; })());

    // Spine — 26 vertebrae from sacrum to C1
    for (let i = 0; i < 26; i++) {
      const y = 0.28 + i * 0.046;
      const w = 0.07 - i * 0.0008;
      const g = new THREE.BoxGeometry(w, 0.028, 0.055);
      g.translate(0, y, -0.04);
      parts.push(g);
    }

    // Sternum
    parts.push(tube([
      new THREE.Vector3(0, 1.48, 0.12), new THREE.Vector3(0, 1.32, 0.14),
      new THREE.Vector3(0, 1.14, 0.12), new THREE.Vector3(0, 0.96, 0.10),
    ], 0.022, 16));

    // Clavicles (thicker)
    parts.push(tube([
      new THREE.Vector3(0, 1.50, 0.10), new THREE.Vector3(-0.15, 1.52, 0.09), new THREE.Vector3(-0.30, 1.48, 0.04),
    ], 0.018, 12));
    parts.push(tube([
      new THREE.Vector3(0, 1.50, 0.10), new THREE.Vector3(0.15, 1.52, 0.09), new THREE.Vector3(0.30, 1.48, 0.04),
    ], 0.018, 12));

    // Scapulae
    for (const side of [-1, 1]) {
      parts.push(tube([
        new THREE.Vector3(side * 0.14, 1.48, -0.06), new THREE.Vector3(side * 0.22, 1.40, -0.08),
        new THREE.Vector3(side * 0.24, 1.28, -0.06), new THREE.Vector3(side * 0.18, 1.18, -0.05),
        new THREE.Vector3(side * 0.14, 1.22, -0.06),
      ], 0.020, 16));
    }

    // 12 rib pairs
    for (let i = 0; i < 12; i++) {
      const y = 0.92 + i * 0.05;
      const spread = 0.22 - i * 0.006;
      const curve = i < 7 ? 0.15 : 0.10;
      const rad = i < 7 ? 0.016 : 0.012;
      const path = [
        new THREE.Vector3(0, y, -0.02),
        new THREE.Vector3(spread * 0.4, y + 0.015, 0.04),
        new THREE.Vector3(spread * 0.8, y + 0.005, curve),
        new THREE.Vector3(spread, y - 0.01, curve - 0.02),
      ];
      parts.push(tube(path, rad, 14));
      parts.push(tube(mirrorX(path), rad, 14));
    }

    // Pelvis — thick bowl
    parts.push(tube([
      new THREE.Vector3(-0.22, 0.30, 0.05), new THREE.Vector3(-0.20, 0.18, 0.07),
      new THREE.Vector3(-0.10, 0.14, 0.06), new THREE.Vector3(0, 0.18, 0.05),
      new THREE.Vector3(0.10, 0.14, 0.06), new THREE.Vector3(0.20, 0.18, 0.07),
      new THREE.Vector3(0.22, 0.30, 0.05),
    ], 0.035, 24));
    // Iliac wings
    parts.push(tube([
      new THREE.Vector3(-0.22, 0.30, 0.05), new THREE.Vector3(-0.24, 0.36, 0.02),
      new THREE.Vector3(-0.20, 0.42, -0.02), new THREE.Vector3(-0.14, 0.44, -0.04),
    ], 0.025, 14));
    parts.push(tube([
      new THREE.Vector3(0.22, 0.30, 0.05), new THREE.Vector3(0.24, 0.36, 0.02),
      new THREE.Vector3(0.20, 0.42, -0.02), new THREE.Vector3(0.14, 0.44, -0.04),
    ], 0.025, 14));

    // Long bones — humerus (thicker)
    for (const s of [-1, 1]) {
      parts.push(tube([
        new THREE.Vector3(s * 0.32, 1.48, 0.02), new THREE.Vector3(s * 0.36, 1.22, 0.01),
        new THREE.Vector3(s * 0.40, 0.92, 0.0),
      ], 0.024, 14));
      // Radius/Ulna
      parts.push(tube([
        new THREE.Vector3(s * 0.40, 0.90, 0.01), new THREE.Vector3(s * 0.42, 0.62, 0.01),
        new THREE.Vector3(s * 0.44, 0.34, 0.01),
      ], 0.018, 12));
      // Femur
      parts.push(tube([
        new THREE.Vector3(s * 0.14, 0.22, 0.02), new THREE.Vector3(s * 0.14, -0.05, 0.01),
        new THREE.Vector3(s * 0.15, -0.36, 0.0),
      ], 0.028, 14));
      // Tibia/Fibula
      parts.push(tube([
        new THREE.Vector3(s * 0.15, -0.38, 0.01), new THREE.Vector3(s * 0.15, -0.58, 0.01),
        new THREE.Vector3(s * 0.15, -0.80, 0.01),
      ], 0.022, 12));
    }

    return parts;
  }, []);

  return (
    <group name="skeletal-system">
      <mesh geometry={geoms[0]} material={wireMat} />
      {geoms.slice(1).map((g, i) => <mesh key={i} geometry={g} material={boneMat} />)}
    </group>
  );
}

// ─── CARDIOVASCULAR SYSTEM ──────────────────────────────────────────────────────

function CardiovascularSystem() {
  const mat = useSystemMaterial("cardiovascular", 0.7);
  const vesselMat = useSystemMaterial("cardiovascular", 0.5);
  const heartRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!heartRef.current) return;
    heartRef.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 4.5) * 0.06);
  });

  const geoms = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];

    // Heart
    const hL = new THREE.SphereGeometry(0.09, 14, 10); hL.translate(-0.03, 0, 0);
    const hR = new THREE.SphereGeometry(0.09, 14, 10); hR.translate(0.03, 0, 0);
    const hB = new THREE.ConeGeometry(0.10, 0.12, 12); hB.rotateZ(Math.PI); hB.translate(0, -0.07, 0);

    // Aortic arch + descending aorta
    parts.push(tube([
      new THREE.Vector3(-0.04, 1.20, 0.10), new THREE.Vector3(-0.02, 1.32, 0.08),
      new THREE.Vector3(0.04, 1.36, 0.06), new THREE.Vector3(0.02, 1.30, 0.04),
      new THREE.Vector3(0, 1.12, 0.01), new THREE.Vector3(0, 0.82, 0),
      new THREE.Vector3(0, 0.52, 0), new THREE.Vector3(0, 0.28, 0),
    ], 0.018, 28));

    // Carotids to head
    parts.push(tube([
      new THREE.Vector3(-0.03, 1.32, 0.06), new THREE.Vector3(-0.05, 1.48, 0.06),
      new THREE.Vector3(-0.04, 1.66, 0.04), new THREE.Vector3(-0.02, 1.78, 0.02),
    ], 0.010, 14));
    parts.push(tube([
      new THREE.Vector3(0.03, 1.32, 0.06), new THREE.Vector3(0.05, 1.48, 0.06),
      new THREE.Vector3(0.04, 1.66, 0.04), new THREE.Vector3(0.02, 1.78, 0.02),
    ], 0.010, 14));

    // Subclavians to arms
    for (const s of [-1, 1]) {
      parts.push(tube([
        new THREE.Vector3(s * 0.02, 1.34, 0.06), new THREE.Vector3(s * 0.12, 1.46, 0.06),
        new THREE.Vector3(s * 0.26, 1.44, 0.02), new THREE.Vector3(s * 0.36, 1.30, 0.02),
      ], 0.008, 12));
    }

    // Iliac arteries to legs
    for (const s of [-1, 1]) {
      parts.push(tube([
        new THREE.Vector3(0, 0.28, 0), new THREE.Vector3(s * 0.06, 0.20, 0.02),
        new THREE.Vector3(s * 0.12, 0.08, 0.02), new THREE.Vector3(s * 0.14, -0.15, 0.02),
        new THREE.Vector3(s * 0.15, -0.45, 0.02), new THREE.Vector3(s * 0.15, -0.70, 0.02),
      ], 0.010, 18));
    }

    return { hL, hR, hB, vessels: parts };
  }, []);

  return (
    <group name="cardiovascular-system">
      <group ref={heartRef} position={[-0.06, 1.14, 0.12]}>
        <mesh geometry={geoms.hL} material={mat} />
        <mesh geometry={geoms.hR} material={mat} />
        <mesh geometry={geoms.hB} material={mat} />
      </group>
      {geoms.vessels.map((g, i) => <mesh key={i} geometry={g} material={vesselMat} />)}
    </group>
  );
}

// ─── RESPIRATORY SYSTEM ─────────────────────────────────────────────────────────

function RespiratorySystem() {
  const mat = useSystemMaterial("respiratory", 0.50);
  const airwayMat = useSystemMaterial("respiratory", 0.40);
  const breathRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!breathRef.current) return;
    const b = 1 + Math.sin(clock.elapsedTime * 1.5) * 0.04;
    breathRef.current.scale.set(b, b, b);
  });

  const geoms = useMemo(() => {
    // Left lung (2 lobes)
    const lungL1 = new THREE.SphereGeometry(0.10, 14, 10);
    lungL1.scale(1.1, 1.4, 0.85); lungL1.translate(-0.14, 1.28, 0.04);
    const lungL2 = new THREE.SphereGeometry(0.09, 14, 10);
    lungL2.scale(1.0, 1.2, 0.80); lungL2.translate(-0.14, 1.12, 0.05);

    // Right lung (3 lobes)
    const lungR1 = new THREE.SphereGeometry(0.11, 14, 10);
    lungR1.scale(1.1, 1.2, 0.85); lungR1.translate(0.14, 1.32, 0.04);
    const lungR2 = new THREE.SphereGeometry(0.10, 14, 10);
    lungR2.scale(1.0, 1.0, 0.80); lungR2.translate(0.14, 1.20, 0.05);
    const lungR3 = new THREE.SphereGeometry(0.09, 14, 10);
    lungR3.scale(0.95, 0.9, 0.75); lungR3.translate(0.14, 1.10, 0.05);

    const airways: THREE.BufferGeometry[] = [];
    // Trachea
    airways.push(tube([
      new THREE.Vector3(0, 1.62, 0.08), new THREE.Vector3(0, 1.52, 0.08), new THREE.Vector3(0, 1.42, 0.07),
    ], 0.020, 12));
    // Main bronchi
    airways.push(tube([
      new THREE.Vector3(0, 1.42, 0.07), new THREE.Vector3(-0.06, 1.38, 0.06), new THREE.Vector3(-0.12, 1.32, 0.05),
    ], 0.014, 10));
    airways.push(tube([
      new THREE.Vector3(0, 1.42, 0.07), new THREE.Vector3(0.06, 1.38, 0.06), new THREE.Vector3(0.12, 1.32, 0.05),
    ], 0.014, 10));
    // Secondary bronchi
    for (const s of [-1, 1]) {
      airways.push(tube([
        new THREE.Vector3(s * 0.12, 1.32, 0.05), new THREE.Vector3(s * 0.16, 1.28, 0.04),
        new THREE.Vector3(s * 0.18, 1.22, 0.04),
      ], 0.008, 8));
      airways.push(tube([
        new THREE.Vector3(s * 0.12, 1.32, 0.05), new THREE.Vector3(s * 0.14, 1.26, 0.06),
        new THREE.Vector3(s * 0.16, 1.18, 0.06),
      ], 0.008, 8));
    }

    // Diaphragm dome
    const diaphragm = new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4);
    diaphragm.rotateX(Math.PI); diaphragm.scale(1, 0.3, 0.8); diaphragm.translate(0, 1.00, 0.04);

    return { lungL1, lungL2, lungR1, lungR2, lungR3, airways, diaphragm };
  }, []);

  return (
    <group name="respiratory-system" ref={breathRef}>
      <mesh geometry={geoms.lungL1} material={mat} />
      <mesh geometry={geoms.lungL2} material={mat} />
      <mesh geometry={geoms.lungR1} material={mat} />
      <mesh geometry={geoms.lungR2} material={mat} />
      <mesh geometry={geoms.lungR3} material={mat} />
      <mesh geometry={geoms.diaphragm} material={mat} />
      {geoms.airways.map((g, i) => <mesh key={i} geometry={g} material={airwayMat} />)}
    </group>
  );
}

// ─── DIGESTIVE SYSTEM ───────────────────────────────────────────────────────────

function DigestiveSystem() {
  const mat = useSystemMaterial("digestive", 0.55);
  const tubeMat = useSystemMaterial("digestive", 0.45);

  const geoms = useMemo(() => {
    const organParts: THREE.BufferGeometry[] = [];
    const tubeParts: THREE.BufferGeometry[] = [];

    // Esophagus
    tubeParts.push(tube([
      new THREE.Vector3(0, 1.60, 0.02), new THREE.Vector3(-0.02, 1.42, 0.04),
      new THREE.Vector3(-0.03, 1.22, 0.06), new THREE.Vector3(-0.04, 1.02, 0.08),
    ], 0.012, 16));

    // Stomach — larger
    const stomach = new THREE.SphereGeometry(0.10, 14, 10);
    stomach.scale(1.2, 1.5, 0.9); stomach.translate(-0.05, 0.92, 0.08);
    organParts.push(stomach);

    // Liver — larger, right side
    const liver = new THREE.SphereGeometry(0.14, 14, 10);
    liver.scale(1.5, 0.8, 0.7); liver.translate(0.10, 0.98, 0.06);
    organParts.push(liver);

    // Gallbladder
    const gb = new THREE.SphereGeometry(0.025, 8, 6);
    gb.scale(0.7, 1.5, 0.6); gb.translate(0.08, 0.90, 0.10);
    organParts.push(gb);

    // Small intestine coils
    const siPath: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 50;
      siPath.push(new THREE.Vector3(
        Math.sin(t * 14) * 0.09,
        0.52 + t * 0.28,
        Math.cos(t * 14) * 0.05 + 0.06,
      ));
    }
    tubeParts.push(tube(siPath, 0.016, 60));

    // Large intestine frame — ascending, transverse, descending, sigmoid
    tubeParts.push(tube([
      new THREE.Vector3(0.14, 0.46, 0.06), new THREE.Vector3(0.15, 0.56, 0.06),
      new THREE.Vector3(0.15, 0.66, 0.06), new THREE.Vector3(0.15, 0.78, 0.06),
      new THREE.Vector3(0.12, 0.84, 0.06), new THREE.Vector3(0.04, 0.86, 0.06),
      new THREE.Vector3(-0.04, 0.86, 0.06), new THREE.Vector3(-0.12, 0.84, 0.06),
      new THREE.Vector3(-0.15, 0.78, 0.06), new THREE.Vector3(-0.15, 0.66, 0.06),
      new THREE.Vector3(-0.15, 0.56, 0.06), new THREE.Vector3(-0.13, 0.48, 0.06),
      new THREE.Vector3(-0.08, 0.44, 0.06), new THREE.Vector3(0, 0.40, 0.08),
    ], 0.024, 36));

    return { organParts, tubeParts };
  }, []);

  return (
    <group name="digestive-system">
      {geoms.organParts.map((g, i) => <mesh key={`o${i}`} geometry={g} material={mat} />)}
      {geoms.tubeParts.map((g, i) => <mesh key={`t${i}`} geometry={g} material={tubeMat} />)}
    </group>
  );
}

// ─── NEUROMUSCULAR SYSTEM ───────────────────────────────────────────────────────

function NeuromuscularSystem() {
  const brainMat = useSystemMaterial("neuromuscular", 0.55);
  const nerveMat = useSystemMaterial("neuromuscular", 0.45);

  const geoms = useMemo(() => {
    const nerves: THREE.BufferGeometry[] = [];

    // Brain with sulci detail (bumpy)
    const brain = new THREE.SphereGeometry(0.16, 20, 16);
    brain.translate(0, 1.84, 0.02);

    // Cerebellum
    const cerebellum = new THREE.SphereGeometry(0.08, 12, 10);
    cerebellum.translate(0, 1.74, -0.06);

    // Spinal cord — thicker
    nerves.push(tube([
      new THREE.Vector3(0, 1.72, -0.02), new THREE.Vector3(0, 1.52, -0.03),
      new THREE.Vector3(0, 1.30, -0.04), new THREE.Vector3(0, 1.08, -0.04),
      new THREE.Vector3(0, 0.86, -0.04), new THREE.Vector3(0, 0.64, -0.04),
      new THREE.Vector3(0, 0.42, -0.03), new THREE.Vector3(0, 0.30, -0.02),
    ], 0.014, 28));

    // Cervical plexus (C1-C4) — neck nerves
    for (let i = 0; i < 4; i++) {
      const y = 1.60 - i * 0.04;
      for (const s of [-1, 1]) {
        nerves.push(tube([
          new THREE.Vector3(0, y, -0.03), new THREE.Vector3(s * 0.06, y - 0.01, 0),
          new THREE.Vector3(s * 0.10, y - 0.02, 0.02),
        ], 0.004, 8));
      }
    }

    // Brachial plexus (C5-T1) — arm nerves
    for (const s of [-1, 1]) {
      nerves.push(tube([
        new THREE.Vector3(0, 1.44, -0.03), new THREE.Vector3(s * 0.10, 1.44, 0),
        new THREE.Vector3(s * 0.22, 1.42, 0.02), new THREE.Vector3(s * 0.32, 1.36, 0.02),
        new THREE.Vector3(s * 0.38, 1.22, 0.02), new THREE.Vector3(s * 0.42, 1.00, 0.02),
        new THREE.Vector3(s * 0.44, 0.72, 0.02), new THREE.Vector3(s * 0.46, 0.40, 0.02),
      ], 0.007, 20));
      // Ulnar branch
      nerves.push(tube([
        new THREE.Vector3(s * 0.38, 1.22, 0.02), new THREE.Vector3(s * 0.40, 1.08, -0.02),
        new THREE.Vector3(s * 0.42, 0.88, -0.02), new THREE.Vector3(s * 0.44, 0.56, 0.0),
      ], 0.005, 14));
    }

    // Intercostal nerves (12 pairs)
    for (let i = 0; i < 12; i++) {
      const y = 1.40 - i * 0.045;
      for (const s of [-1, 1]) {
        nerves.push(tube([
          new THREE.Vector3(0, y, -0.04), new THREE.Vector3(s * 0.08, y, 0.0),
          new THREE.Vector3(s * 0.16, y - 0.01, 0.06),
        ], 0.003, 8));
      }
    }

    // Lumbar plexus
    for (let i = 0; i < 5; i++) {
      const y = 0.60 - i * 0.04;
      for (const s of [-1, 1]) {
        nerves.push(tube([
          new THREE.Vector3(0, y, -0.03), new THREE.Vector3(s * 0.06, y - 0.02, 0),
          new THREE.Vector3(s * 0.10, y - 0.03, 0.02),
        ], 0.004, 8));
      }
    }

    // Sciatic nerves — thick, full length
    for (const s of [-1, 1]) {
      nerves.push(tube([
        new THREE.Vector3(s * 0.04, 0.32, -0.04), new THREE.Vector3(s * 0.08, 0.20, -0.05),
        new THREE.Vector3(s * 0.12, 0.06, -0.05), new THREE.Vector3(s * 0.14, -0.12, -0.04),
        new THREE.Vector3(s * 0.15, -0.32, -0.03), new THREE.Vector3(s * 0.15, -0.52, -0.02),
        new THREE.Vector3(s * 0.15, -0.72, -0.01),
      ], 0.009, 20));
      // Tibial branch
      nerves.push(tube([
        new THREE.Vector3(s * 0.15, -0.36, -0.03), new THREE.Vector3(s * 0.15, -0.52, 0.02),
        new THREE.Vector3(s * 0.15, -0.72, 0.02),
      ], 0.006, 14));
    }

    // Femoral nerves
    for (const s of [-1, 1]) {
      nerves.push(tube([
        new THREE.Vector3(s * 0.06, 0.40, -0.02), new THREE.Vector3(s * 0.10, 0.28, 0.04),
        new THREE.Vector3(s * 0.13, 0.12, 0.06), new THREE.Vector3(s * 0.14, -0.06, 0.06),
        new THREE.Vector3(s * 0.14, -0.26, 0.04),
      ], 0.006, 14));
    }

    return { brain, cerebellum, nerves };
  }, []);

  return (
    <group name="neuromuscular-system">
      <mesh geometry={geoms.brain} material={brainMat} />
      <mesh geometry={geoms.cerebellum} material={brainMat} />
      {geoms.nerves.map((g, i) => <mesh key={i} geometry={g} material={nerveMat} />)}
    </group>
  );
}

// ─── ENDOCRINE SYSTEM ───────────────────────────────────────────────────────────

function EndocrineSystem() {
  const mat = useSystemMaterial("endocrine", 0.65);

  const geoms = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];

    // Pituitary (larger)
    const p = new THREE.SphereGeometry(0.035, 10, 8); p.translate(0, 1.78, 0.05); parts.push(p);
    // Pineal
    const pi = new THREE.SphereGeometry(0.02, 8, 6); pi.translate(0, 1.86, -0.02); parts.push(pi);
    // Hypothalamus
    const hy = new THREE.SphereGeometry(0.03, 8, 6); hy.translate(0, 1.80, 0.02); parts.push(hy);

    // Thyroid — butterfly (larger lobes)
    for (const s of [-1, 1]) {
      const lobe = new THREE.SphereGeometry(0.04, 10, 8);
      lobe.scale(0.8, 1.6, 0.6); lobe.translate(s * 0.04, 1.65, 0.10); parts.push(lobe);
    }
    // Isthmus
    const isth = new THREE.BoxGeometry(0.06, 0.02, 0.02);
    isth.translate(0, 1.65, 0.10); parts.push(isth);

    // Adrenals — larger caps
    for (const s of [-1, 1]) {
      const a = new THREE.SphereGeometry(0.035, 8, 6);
      a.scale(1.5, 0.8, 1.0); a.translate(s * 0.10, 0.84, -0.02); parts.push(a);
    }

    // Pancreas — elongated
    const pan = new THREE.SphereGeometry(0.05, 12, 8);
    pan.scale(3.0, 0.6, 0.5); pan.translate(0, 0.88, 0.04); parts.push(pan);

    // Gonads (ovaries)
    for (const s of [-1, 1]) {
      const ov = new THREE.SphereGeometry(0.03, 10, 8);
      ov.scale(1.2, 0.8, 0.7); ov.translate(s * 0.08, 0.30, 0.06); parts.push(ov);
    }

    return parts;
  }, []);

  return (
    <group name="endocrine-system">
      {geoms.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
    </group>
  );
}

// ─── URINARY SYSTEM ─────────────────────────────────────────────────────────────

function UrinarySystem() {
  const mat = useSystemMaterial("urinary", 0.60);
  const tubeMat2 = useSystemMaterial("urinary", 0.45);

  const geoms = useMemo(() => {
    const organs: THREE.BufferGeometry[] = [];
    const tubes: THREE.BufferGeometry[] = [];

    // Kidneys — larger bean shapes
    for (const s of [-1, 1]) {
      const k = new THREE.SphereGeometry(0.07, 14, 10);
      k.scale(0.75, 1.3, 0.65); k.translate(s * 0.10, 0.76, -0.02); organs.push(k);
    }

    // Ureters
    for (const s of [-1, 1]) {
      tubes.push(tube([
        new THREE.Vector3(s * 0.10, 0.68, 0.0), new THREE.Vector3(s * 0.08, 0.56, 0.03),
        new THREE.Vector3(s * 0.05, 0.44, 0.06), new THREE.Vector3(s * 0.02, 0.36, 0.08),
      ], 0.008, 14));
    }

    // Bladder — larger
    const bl = new THREE.SphereGeometry(0.06, 14, 10);
    bl.scale(1.3, 1.0, 0.9); bl.translate(0, 0.34, 0.08); organs.push(bl);

    // Urethra
    tubes.push(tube([
      new THREE.Vector3(0, 0.30, 0.08), new THREE.Vector3(0, 0.24, 0.10),
      new THREE.Vector3(0, 0.18, 0.10),
    ], 0.006, 8));

    return { organs, tubes };
  }, []);

  return (
    <group name="urinary-system">
      {geoms.organs.map((g, i) => <mesh key={`o${i}`} geometry={g} material={mat} />)}
      {geoms.tubes.map((g, i) => <mesh key={`t${i}`} geometry={g} material={tubeMat2} />)}
    </group>
  );
}

// ─── REPRODUCTIVE SYSTEM ────────────────────────────────────────────────────────

function ReproductiveSystem() {
  const mat = useSystemMaterial("reproductive", 0.60);

  const geoms = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];

    // Uterus — pear shaped, larger
    const ut = new THREE.SphereGeometry(0.05, 14, 10);
    ut.scale(1.0, 1.5, 0.7); ut.translate(0, 0.34, 0.06); parts.push(ut);

    // Cervix
    const cx = new THREE.CylinderGeometry(0.02, 0.025, 0.04, 8);
    cx.translate(0, 0.28, 0.06); parts.push(cx);

    // Ovaries — larger
    for (const s of [-1, 1]) {
      const ov = new THREE.SphereGeometry(0.03, 10, 8);
      ov.scale(1.3, 0.9, 0.7); ov.translate(s * 0.09, 0.32, 0.06); parts.push(ov);
    }

    // Fallopian tubes — curved
    for (const s of [-1, 1]) {
      parts.push(tube([
        new THREE.Vector3(0, 0.38, 0.06), new THREE.Vector3(s * 0.03, 0.39, 0.06),
        new THREE.Vector3(s * 0.06, 0.38, 0.06), new THREE.Vector3(s * 0.08, 0.35, 0.06),
        new THREE.Vector3(s * 0.09, 0.32, 0.06),
      ], 0.006, 12));
    }

    return parts;
  }, []);

  return (
    <group name="reproductive-system">
      {geoms.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
    </group>
  );
}

// ─── LYMPHATIC SYSTEM ───────────────────────────────────────────────────────────

function LymphaticSystem() {
  const mat = useSystemMaterial("lymphatic", 0.55);
  const vesselMat = useSystemMaterial("lymphatic", 0.35);

  const geoms = useMemo(() => {
    const organs: THREE.BufferGeometry[] = [];
    const vessels: THREE.BufferGeometry[] = [];

    // Spleen — larger
    const sp = new THREE.SphereGeometry(0.06, 14, 10);
    sp.scale(1.0, 1.5, 0.7); sp.translate(0.16, 0.96, -0.02); organs.push(sp);

    // Thymus
    const th = new THREE.SphereGeometry(0.04, 10, 8);
    th.scale(1.0, 1.3, 0.6); th.translate(0, 1.40, 0.08); organs.push(th);

    // Tonsils
    for (const s of [-1, 1]) {
      const t = new THREE.SphereGeometry(0.015, 8, 6);
      t.translate(s * 0.04, 1.70, 0.06); organs.push(t);
    }

    // Lymph node clusters (larger, more prominent)
    const nodePositions: [number, number, number][] = [
      [-0.26, 1.48, 0.04], [0.26, 1.48, 0.04],   // axillary
      [-0.07, 1.60, 0.08], [0.07, 1.60, 0.08],    // cervical
      [-0.12, 0.26, 0.06], [0.12, 0.26, 0.06],    // inguinal
      [0, 0.70, 0.02], [0, 0.56, 0.02],            // abdominal
      [-0.06, 1.10, 0.04], [0.06, 1.10, 0.04],     // mediastinal
    ];
    for (const [x, y, z] of nodePositions) {
      const n = new THREE.SphereGeometry(0.022, 8, 6);
      n.translate(x, y, z); organs.push(n);
    }

    // Thoracic duct (major)
    vessels.push(tube([
      new THREE.Vector3(0, 0.46, -0.02), new THREE.Vector3(0, 0.66, -0.02),
      new THREE.Vector3(0, 0.86, -0.01), new THREE.Vector3(0, 1.06, 0.0),
      new THREE.Vector3(-0.02, 1.26, 0.02), new THREE.Vector3(-0.04, 1.46, 0.04),
      new THREE.Vector3(-0.05, 1.56, 0.06),
    ], 0.008, 24));

    // Lymph vessel network
    for (const s of [-1, 1]) {
      vessels.push(tube([
        new THREE.Vector3(s * 0.07, 1.60, 0.08), new THREE.Vector3(s * 0.18, 1.52, 0.04),
        new THREE.Vector3(s * 0.22, 1.38, 0.02), new THREE.Vector3(s * 0.18, 1.14, 0.02),
        new THREE.Vector3(s * 0.14, 0.86, 0.04), new THREE.Vector3(s * 0.12, 0.56, 0.04),
        new THREE.Vector3(s * 0.12, 0.26, 0.06),
      ], 0.005, 24));
      // Leg vessels
      vessels.push(tube([
        new THREE.Vector3(s * 0.12, 0.26, 0.06), new THREE.Vector3(s * 0.14, 0.10, 0.04),
        new THREE.Vector3(s * 0.15, -0.10, 0.04), new THREE.Vector3(s * 0.15, -0.40, 0.02),
      ], 0.004, 14));
    }

    return { organs, vessels };
  }, []);

  return (
    <group name="lymphatic-system">
      {geoms.organs.map((g, i) => <mesh key={`o${i}`} geometry={g} material={mat} />)}
      {geoms.vessels.map((g, i) => <mesh key={`v${i}`} geometry={g} material={vesselMat} />)}
    </group>
  );
}

// ─── MUSCULAR SYSTEM ────────────────────────────────────────────────────────────

function MuscularSystem() {
  const mat = useSystemMaterial("muscular", 0.45);

  const geoms = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];

    // Trapezius (upper back/neck)
    for (const s of [-1, 1]) {
      const trap = new THREE.SphereGeometry(0.08, 10, 8);
      trap.scale(1.0, 1.6, 0.4); trap.translate(s * 0.08, 1.52, -0.02); parts.push(trap);
    }

    // Pectoralis major
    for (const s of [-1, 1]) {
      const pec = new THREE.SphereGeometry(0.09, 12, 10);
      pec.scale(1.3, 0.9, 0.35); pec.translate(s * 0.10, 1.32, 0.13); parts.push(pec);
    }

    // Deltoids
    for (const s of [-1, 1]) {
      const delt = new THREE.SphereGeometry(0.065, 10, 8);
      delt.scale(1.0, 1.3, 0.85); delt.translate(s * 0.30, 1.44, 0.02); parts.push(delt);
    }

    // Biceps
    for (const s of [-1, 1]) {
      const bi = new THREE.SphereGeometry(0.045, 10, 8);
      bi.scale(0.8, 2.0, 0.7); bi.translate(s * 0.38, 1.16, 0.06); parts.push(bi);
    }

    // Triceps
    for (const s of [-1, 1]) {
      const tri = new THREE.SphereGeometry(0.04, 10, 8);
      tri.scale(0.8, 1.8, 0.7); tri.translate(s * 0.38, 1.16, -0.04); parts.push(tri);
    }

    // Forearm muscles
    for (const s of [-1, 1]) {
      const fa = new THREE.SphereGeometry(0.035, 10, 8);
      fa.scale(0.7, 2.0, 0.6); fa.translate(s * 0.42, 0.74, 0.02); parts.push(fa);
    }

    // Latissimus dorsi
    for (const s of [-1, 1]) {
      const lat = new THREE.SphereGeometry(0.10, 10, 8);
      lat.scale(0.9, 1.5, 0.3); lat.translate(s * 0.14, 1.10, -0.06); parts.push(lat);
    }

    // Rectus abdominis (6-pack blocks)
    for (let row = 0; row < 4; row++) {
      for (const s of [-1, 1]) {
        const ab = new THREE.BoxGeometry(0.065, 0.055, 0.03);
        ab.translate(s * 0.05, 0.70 + row * 0.07, 0.14); parts.push(ab);
      }
    }

    // Obliques
    for (const s of [-1, 1]) {
      const obl = new THREE.SphereGeometry(0.06, 10, 8);
      obl.scale(0.6, 1.8, 0.4); obl.translate(s * 0.16, 0.78, 0.08); parts.push(obl);
    }

    // Gluteus maximus
    for (const s of [-1, 1]) {
      const glute = new THREE.SphereGeometry(0.08, 10, 8);
      glute.scale(1.0, 1.2, 0.7); glute.translate(s * 0.10, 0.18, -0.06); parts.push(glute);
    }

    // Quadriceps (4 heads each leg)
    for (const s of [-1, 1]) {
      const rf = new THREE.SphereGeometry(0.05, 10, 8);
      rf.scale(0.7, 2.4, 0.6); rf.translate(s * 0.14, -0.08, 0.08); parts.push(rf);
      const vl = new THREE.SphereGeometry(0.04, 10, 8);
      vl.scale(0.6, 2.2, 0.5); vl.translate(s * 0.18, -0.08, 0.04); parts.push(vl);
      const vm = new THREE.SphereGeometry(0.04, 10, 8);
      vm.scale(0.6, 2.0, 0.5); vm.translate(s * 0.10, -0.08, 0.04); parts.push(vm);
    }

    // Hamstrings
    for (const s of [-1, 1]) {
      const ham = new THREE.SphereGeometry(0.05, 10, 8);
      ham.scale(0.7, 2.2, 0.5); ham.translate(s * 0.14, -0.08, -0.04); parts.push(ham);
    }

    // Calves (gastrocnemius)
    for (const s of [-1, 1]) {
      const calf = new THREE.SphereGeometry(0.045, 10, 8);
      calf.scale(0.7, 1.8, 0.7); calf.translate(s * 0.15, -0.55, 0.04); parts.push(calf);
      const sol = new THREE.SphereGeometry(0.035, 10, 8);
      sol.scale(0.6, 1.5, 0.6); sol.translate(s * 0.15, -0.55, -0.02); parts.push(sol);
    }

    return parts;
  }, []);

  return (
    <group name="muscular-system">
      {geoms.map((g, i) => <mesh key={i} geometry={g} material={mat} />)}
    </group>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────────

interface AnatomyOverlaysProps {
  activeSystems: Set<string>;
  disableDepthTest?: boolean;
}

export function AnatomyOverlays3D({ activeSystems, disableDepthTest = false }: AnatomyOverlaysProps) {
  MaterialCtx.disableDepthTest = disableDepthTest;
  return (
    <group name="anatomy-overlays" renderOrder={disableDepthTest ? 10 : 0}>
      {activeSystems.has("skeletal") && <SkeletalSystem />}
      {activeSystems.has("muscular") && <MuscularSystem />}
      {activeSystems.has("neuromuscular") && <NeuromuscularSystem />}
      {activeSystems.has("endocrine") && <EndocrineSystem />}
      {activeSystems.has("cardiovascular") && <CardiovascularSystem />}
      {activeSystems.has("lymphatic") && <LymphaticSystem />}
      {activeSystems.has("respiratory") && <RespiratorySystem />}
      {activeSystems.has("digestive") && <DigestiveSystem />}
      {activeSystems.has("urinary") && <UrinarySystem />}
      {activeSystems.has("reproductive") && <ReproductiveSystem />}
    </group>
  );
}
