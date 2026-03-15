import { useMemo, Suspense } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { SYSTEM_MAP } from "../data/systems";

const BASE = import.meta.env.BASE_URL + "models/organs/";

type Gender = "female" | "male";

interface OrganDef {
  file: (g: Gender) => string;
  systems: string[];
  position: [number, number, number];
  scale: number;
  rotation?: [number, number, number];
}

/*
 * HuBMAP Visible Human models use mm coordinates.
 * Our body model is ~3.2 units tall. The VH female was 1712mm tall.
 * Base scale: 3.2 / 1712 ≈ 0.00187.  Positions are empirical offsets
 * applied AFTER the organ is auto-centered at origin.
 */
const ORGANS: OrganDef[] = [
  // ── Cardiovascular ──
  {
    file: (g) => g === "female" ? "VH_F_Heart.glb" : "VH_M_Heart.glb",
    systems: ["cardiovascular"],
    position: [-0.04, 1.15, 0.06],
    scale: 0.0022,
  },
  // ── Respiratory ──
  {
    file: (g) => g === "female" ? "VH_F_Lung.glb" : "VH_M_Lung.glb",
    systems: ["respiratory"],
    position: [0, 1.22, 0.02],
    scale: 0.0020,
  },
  // ── Digestive ──
  {
    file: (g) => g === "female" ? "VH_F_Liver.glb" : "VH_M_Liver.glb",
    systems: ["digestive"],
    position: [0.08, 0.96, 0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "VH_F_Small_Intestine.glb" : "VH_M_Small_Intestine.glb",
    systems: ["digestive"],
    position: [0, 0.65, 0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "SBU_F_Intestine_Large.glb" : "SBU_M_Intestine_Large.glb",
    systems: ["digestive"],
    position: [0, 0.72, 0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "VH_F_Pancreas.glb" : "VH_M_Pancreas.glb",
    systems: ["digestive", "endocrine"],
    position: [0, 0.88, 0.0],
    scale: 0.0020,
  },
  // ── Urinary ──
  {
    file: (g) => g === "female" ? "VH_F_Kidney_L.glb" : "VH_M_Kidney_L.glb",
    systems: ["urinary"],
    position: [-0.06, 0.78, -0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "VH_F_Kidney_R.glb" : "VH_M_Kidney_R.glb",
    systems: ["urinary"],
    position: [0.06, 0.78, -0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "VH_F_Urinary_Bladder.glb" : "VH_M_Urinary_Bladder.glb",
    systems: ["urinary"],
    position: [0, 0.36, 0.06],
    scale: 0.0020,
  },
  // ── Skeletal ──
  {
    file: (g) => g === "female" ? "VH_F_Pelvis.glb" : "VH_M_Pelvis.glb",
    systems: ["skeletal"],
    position: [0, 0.40, 0.0],
    scale: 0.0020,
  },
  // ── Lymphatic ──
  {
    file: (g) => g === "female" ? "VH_F_Spleen.glb" : "VH_M_Spleen.glb",
    systems: ["lymphatic"],
    position: [0.14, 0.92, -0.04],
    scale: 0.0020,
  },
  {
    file: (g) => g === "female" ? "VH_F_Thymus.glb" : "VH_M_Thymus.glb",
    systems: ["lymphatic", "endocrine"],
    position: [0, 1.38, 0.06],
    scale: 0.0020,
  },
  // ── Reproductive (female-only organs) ──
  {
    file: () => "VH_F_Uterus.glb",
    systems: ["reproductive"],
    position: [0, 0.34, 0.04],
    scale: 0.0020,
  },
  {
    file: () => "VH_F_Ovary_L.glb",
    systems: ["reproductive", "endocrine"],
    position: [-0.06, 0.32, 0.04],
    scale: 0.0020,
  },
  {
    file: () => "VH_F_Ovary_R.glb",
    systems: ["reproductive", "endocrine"],
    position: [0.06, 0.32, 0.04],
    scale: 0.0020,
  },
  {
    file: () => "VH_F_Fallopian_Tube_L.glb",
    systems: ["reproductive"],
    position: [-0.04, 0.36, 0.04],
    scale: 0.0020,
  },
  {
    file: () => "VH_F_Fallopian_Tube_R.glb",
    systems: ["reproductive"],
    position: [0.04, 0.36, 0.04],
    scale: 0.0020,
  },
];

function OrganModel({
  organ,
  gender,
  activeSystems,
}: {
  organ: OrganDef;
  gender: Gender;
  activeSystems: Set<string>;
}) {
  const filename = organ.file(gender);
  const url = BASE + filename;

  // Skip female-only reproductive organs for male
  if (gender === "male" && filename.includes("VH_F_")) {
    if (filename.includes("Uterus") || filename.includes("Ovary") || filename.includes("Fallopian")) {
      return null;
    }
  }

  const { scene } = useGLTF(url);

  const matchingSystems = organ.systems.filter((s) => activeSystems.has(s));
  const primarySystem = matchingSystems[0];
  const color = SYSTEM_MAP[primarySystem]?.color || "#888";

  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    clone.position.set(-center.x, -center.y, -center.z);

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = mat;
      }
    });

    return clone;
  }, [scene, color]);

  return (
    <group
      position={organ.position}
      scale={organ.scale}
      rotation={organ.rotation ? [organ.rotation[0], organ.rotation[1], organ.rotation[2]] : undefined}
    >
      <primitive object={cloned} />
    </group>
  );
}

interface RealisticOrganModelsProps {
  activeSystems: Set<string>;
  gender: Gender;
}

export function RealisticOrganModels({ activeSystems, gender }: RealisticOrganModelsProps) {
  const visibleOrgans = useMemo(
    () => ORGANS.filter((o) => o.systems.some((s) => activeSystems.has(s))),
    [activeSystems]
  );

  if (visibleOrgans.length === 0) return null;

  return (
    <group name="realistic-organ-models" renderOrder={5}>
      {visibleOrgans.map((organ, i) => (
        <Suspense key={`organ-${i}`} fallback={null}>
          <OrganModel organ={organ} gender={gender} activeSystems={activeSystems} />
        </Suspense>
      ))}
    </group>
  );
}
