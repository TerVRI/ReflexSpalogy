import { useRef, useMemo, useCallback, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";
import { AnatomyOverlays3D } from "./AnatomyOverlays3D";
import { RealisticOrganModels } from "./RealisticOrganModels";

type Gender = "female" | "male";

const MODEL_URLS: Record<Gender, string> = {
  female: import.meta.env.BASE_URL + "models/female.glb",
  male: import.meta.env.BASE_URL + "models/male.glb",
};

// ─── GLB model loader ──────────────────────────────────────────────────────────
function RealisticModel({ gender }: { activeSystems: Set<string>; gender: Gender }) {
  const { scene } = useGLTF(MODEL_URLS[gender]);
  const modelRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
        mat.color = new THREE.Color("#a8bcd4");
        mat.emissive = new THREE.Color("#1a2a42");
        mat.emissiveIntensity = 0.06;
        mat.roughness = 0.5;
        mat.metalness = 0.0;
        mat.transparent = true;
        mat.opacity = 0.85;
        mat.side = THREE.DoubleSide;
        mesh.material = mat;
      }
    });

    return clone;
  }, [scene]);

  // Auto-center and scale the model
  useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const targetHeight = 3.2;
    const scale = targetHeight / size.y;
    clonedScene.scale.setScalar(scale);

    const scaledCenter = center.clone().multiplyScalar(scale);
    clonedScene.position.set(
      -scaledCenter.x,
      -scaledCenter.y,
      -scaledCenter.z
    );
  }, [clonedScene]);

  return <primitive ref={modelRef} object={clonedScene} />;
}


// ─── Hotspot ─────────────────────────────────────────────────────────────────
function Hotspot({
  point, isHovered, isExplored, color,
  containerRef, onHover, onLeave, onSelect,
}: {
  point: ReflexPoint; isHovered: boolean; isExplored: boolean;
  color: string; glowColor?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHover: (p: ReflexPoint, pos: { x: number; y: number }) => void;
  onLeave: () => void; onSelect: (p: ReflexPoint) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  const pos3: [number, number, number] = useMemo(
    () => {
      if (point.position3D) {
        return [point.position3D.x, point.position3D.y, Math.max(point.position3D.z, 0.30)];
      }
      return [
        (point.position2D.x / 100 - 0.5) * 1.2,
        (1 - point.position2D.y / 100) * 3.0 - 0.7,
        0.35,
      ];
    },
    [point.position2D, point.position3D]
  );

  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isHovered) {
      mat.emissiveIntensity = 0.8 + Math.sin(clock.elapsedTime * 4) * 0.2;
      meshRef.current.scale.setScalar(1.5);
    } else {
      mat.emissiveIntensity = isExplored ? 0.4 : 0.3;
      meshRef.current.scale.setScalar(1.0);
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: threeColor, emissive: threeColor, emissiveIntensity: 0.3,
    roughness: 0.15, metalness: 0.4,
    depthTest: false,
    transparent: true,
    opacity: 0.95,
  }), [threeColor]);

  const handlePointerEnter = useCallback(
    (e: { clientX: number; clientY: number; stopPropagation: () => void }) => {
      e.stopPropagation();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      onHover(point, {
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [containerRef, onHover, point]
  );

  const whiteMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: "white", depthTest: false,
  }), []);

  return (
    <group position={pos3} renderOrder={10}>
      <mesh ref={meshRef} material={mat}
        renderOrder={10}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onSelect(point); }}
      >
        <sphereGeometry args={[0.06, 14, 10]} />
      </mesh>
      <mesh renderOrder={11} material={whiteMat}>
        <sphereGeometry args={[0.02, 8, 6]} />
      </mesh>
    </group>
  );
}

function CursorManager({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();
  gl.domElement.style.cursor = hovered ? "pointer" : "auto";
  return null;
}

// ─── Loading indicator ─────────────────────────────────────────────────────────
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y = clock.elapsedTime;
  });
  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[0.3, 0.05, 8, 24]} />
      <meshBasicMaterial color="#7c3aed" wireframe />
    </mesh>
  );
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function Scene({
  activeSystems, hoveredPoint, exploredPoints, containerRef, onHoverPoint, onSelectPoint, gender,
}: {
  activeSystems: Set<string>; hoveredPoint: ReflexPoint | null;
  exploredPoints: Set<string>; containerRef: React.RefObject<HTMLDivElement | null>;
  onHoverPoint: (p: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (p: ReflexPoint) => void;
  gender: Gender;
}) {
  const visiblePoints = useMemo(
    () => REFLEX_POINTS.filter((p) => p.systemIds.some((id) => activeSystems.has(id))),
    [activeSystems]
  );

  const getColor = (point: ReflexPoint) => {
    const id = point.systemIds.find((i) => activeSystems.has(i));
    return SYSTEM_MAP[id || point.systemIds[0]]?.color || "#888";
  };
  const getGlow = (point: ReflexPoint) => {
    const id = point.systemIds.find((i) => activeSystems.has(i));
    return SYSTEM_MAP[id || point.systemIds[0]]?.glowColor || "#aaa";
  };

  return (
    <>
      <ambientLight color="#5a7a9a" intensity={0.7} />
      <directionalLight color="#e8f0ff" intensity={2.0} position={[2, 4, 4]} />
      <directionalLight color="#c0d0e8" intensity={0.6} position={[-3, 2, 1]} />
      <pointLight color="#3060a0" intensity={0.6} position={[0, 0.5, -3]} />
      <hemisphereLight color="#b0c4de" groundColor="#1a1a3a" intensity={0.5} />

      <OrbitControls
        target={[0, 0, 0]}
        enablePan={false} enableZoom
        minDistance={1.5} maxDistance={12}
        minPolarAngle={Math.PI * 0.15} maxPolarAngle={Math.PI * 0.85}
        autoRotate={!hoveredPoint} autoRotateSpeed={0.4}
        makeDefault
      />

      <CursorManager hovered={!!hoveredPoint} />

      <Suspense fallback={<LoadingFallback />}>
        <RealisticModel activeSystems={activeSystems} gender={gender} />
      </Suspense>

      <AnatomyOverlays3D activeSystems={activeSystems} disableDepthTest />
      <RealisticOrganModels activeSystems={activeSystems} gender={gender} />

      {visiblePoints.map((point) => (
        <Hotspot
          key={point.id} point={point}
          isHovered={hoveredPoint?.id === point.id}
          isExplored={exploredPoints.has(point.id)}
          color={getColor(point)} glowColor={getGlow(point)}
          containerRef={containerRef}
          onHover={(p, pos) => onHoverPoint(p, pos)}
          onLeave={() => onHoverPoint(null)}
          onSelect={onSelectPoint}
        />
      ))}
    </>
  );
}

// ─── Exported component ────────────────────────────────────────────────────────
interface Props {
  activeSystems: Set<string>;
  layerOpacity: number;
  onHoverPoint: (point: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (point: ReflexPoint) => void;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  exploredPoints: Set<string>;
}

export function BodyViewerRealistic({
  activeSystems, layerOpacity, onHoverPoint, onSelectPoint,
  hoveredPoint, hoverPosition, exploredPoints,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [gender, setGender] = useState<Gender>("female");

  const systemColors = useMemo(
    () => BODY_SYSTEMS.filter((s) => activeSystems.has(s.id)).map((s) => s.color),
    [activeSystems]
  );

  if (loadError) {
    return (
      <div className="body-viewer body-viewer--realistic viewer-loading">
        <p>Failed to load 3D model. Try the standard 3D view instead.</p>
      </div>
    );
  }

  return (
    <div className="body-viewer body-viewer--3d" ref={containerRef} style={{ opacity: layerOpacity }}>
      <div className="body-viewer__controls">
        <div className="layer-opacity">
          <span>Realistic</span>
          <div className="opacity-dots">
            {systemColors.map((c, i) => (
              <span key={i} className="opacity-dot" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className="gender-toggle">
          <button
            className={`gender-btn ${gender === "female" ? "gender-btn--active" : ""}`}
            onClick={() => setGender("female")}
          >
            ♀ Female
          </button>
          <button
            className={`gender-btn ${gender === "male" ? "gender-btn--active" : ""}`}
            onClick={() => setGender("male")}
          >
            ♂ Male
          </button>
        </div>
        <span className="viewer-hint">Drag to rotate · Scroll to zoom</span>
      </div>

      <Canvas
        camera={{ position: [0, 0, 9.5], fov: 50, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
        dpr={[1, 2]}
        onCreated={() => setLoadError(false)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            activeSystems={activeSystems}
            hoveredPoint={hoveredPoint}
            exploredPoints={exploredPoints}
            containerRef={containerRef}
            onHoverPoint={onHoverPoint}
            onSelectPoint={onSelectPoint}
            gender={gender}
          />
        </Suspense>
      </Canvas>

      {hoveredPoint && hoverPosition && (
        <AnnotationTooltip point={hoveredPoint} position={hoverPosition} />
      )}

      <div className="body-viewer__legend">
        <span className="legend-item"><span className="legend-dot legend-dot--white" /> Unexplored</span>
        <span className="legend-item"><span className="legend-dot legend-dot--ring" /> Explored</span>
      </div>
    </div>
  );
}

useGLTF.preload(MODEL_URLS.female);
useGLTF.preload(MODEL_URLS.male);
