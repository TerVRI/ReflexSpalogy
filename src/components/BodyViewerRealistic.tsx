import { useRef, useMemo, useCallback, Suspense, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";

const MODEL_URL = import.meta.env.BASE_URL + "models/female.glb";

// ─── GLB model loader ──────────────────────────────────────────────────────────
function RealisticModel(_props: { activeSystems: Set<string> }) {
  const { scene } = useGLTF(MODEL_URL);
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
        mat.opacity = 0.92;
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

    const targetHeight = 2.8;
    const scale = targetHeight / size.y;
    clonedScene.scale.setScalar(scale);

    clonedScene.position.set(
      -center.x * scale,
      -center.y * scale + targetHeight / 2 - 0.38,
      -center.z * scale
    );
  }, [clonedScene]);

  return <primitive ref={modelRef} object={clonedScene} />;
}

// ─── System organ overlays (same positions as 3D viewer) ───────────────────────
const ORGAN_OVERLAYS = [
  { systemId: "neuromuscular", position: [0, 1.83, 0.05] as [number, number, number], scale: [1.1, 1.0, 0.9] as [number, number, number], opacity: 0.4 },
  { systemId: "endocrine", position: [0, 1.55, 0.12] as [number, number, number], scale: [0.7, 0.35, 0.5] as [number, number, number], opacity: 0.5 },
  { systemId: "cardiovascular", position: [-0.06, 1.12, 0.08] as [number, number, number], scale: [0.5, 0.6, 0.45] as [number, number, number], opacity: 0.55 },
  { systemId: "respiratory", position: [-0.10, 1.18, 0.03] as [number, number, number], scale: [0.4, 0.8, 0.35] as [number, number, number], opacity: 0.3 },
  { systemId: "respiratory", position: [0.10, 1.18, 0.03] as [number, number, number], scale: [0.4, 0.8, 0.35] as [number, number, number], opacity: 0.3 },
  { systemId: "digestive", position: [-0.04, 0.88, 0.07] as [number, number, number], scale: [0.5, 0.4, 0.4] as [number, number, number], opacity: 0.35 },
  { systemId: "digestive", position: [0.08, 0.92, 0.04] as [number, number, number], scale: [0.6, 0.4, 0.4] as [number, number, number], opacity: 0.3 },
  { systemId: "digestive", position: [0, 0.72, 0.04] as [number, number, number], scale: [0.7, 0.6, 0.4] as [number, number, number], opacity: 0.22 },
  { systemId: "urinary", position: [-0.08, 0.70, -0.05] as [number, number, number], scale: [0.35, 0.45, 0.3] as [number, number, number], opacity: 0.4 },
  { systemId: "urinary", position: [0.08, 0.70, -0.05] as [number, number, number], scale: [0.35, 0.45, 0.3] as [number, number, number], opacity: 0.4 },
  { systemId: "urinary", position: [0, 0.38, 0.07] as [number, number, number], scale: [0.4, 0.38, 0.35] as [number, number, number], opacity: 0.35 },
  { systemId: "reproductive", position: [-0.06, 0.34, 0.05] as [number, number, number], scale: [0.3, 0.25, 0.25] as [number, number, number], opacity: 0.4 },
  { systemId: "reproductive", position: [0.06, 0.34, 0.05] as [number, number, number], scale: [0.3, 0.25, 0.25] as [number, number, number], opacity: 0.4 },
  { systemId: "lymphatic", position: [-0.15, 0.82, -0.02] as [number, number, number], scale: [0.35, 0.4, 0.3] as [number, number, number], opacity: 0.32 },
  { systemId: "lymphatic", position: [-0.28, 1.48, 0.03] as [number, number, number], scale: [0.18, 0.18, 0.18] as [number, number, number], opacity: 0.45 },
  { systemId: "lymphatic", position: [0.28, 1.48, 0.03] as [number, number, number], scale: [0.18, 0.18, 0.18] as [number, number, number], opacity: 0.45 },
];

function SystemOrgans({ activeSystems }: { activeSystems: Set<string> }) {
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.1, 10, 8), []);
  const matCache = useRef(new Map<string, THREE.MeshStandardMaterial>());

  const getMat = useCallback((systemId: string, opacity: number) => {
    const key = `${systemId}_${opacity}`;
    if (!matCache.current.has(key)) {
      const sys = SYSTEM_MAP[systemId];
      const color = new THREE.Color(sys?.color || "#888");
      matCache.current.set(key, new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity,
        depthWrite: false,
      }));
    }
    return matCache.current.get(key)!;
  }, []);

  return (
    <>
      {ORGAN_OVERLAYS.filter((o) => activeSystems.has(o.systemId)).map((o, i) => (
        <mesh
          key={`organ_${i}`}
          geometry={sphereGeom}
          material={getMat(o.systemId, o.opacity)}
          position={o.position}
          scale={o.scale}
        />
      ))}
    </>
  );
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
    () => [
      (point.position2D.x / 100 - 0.5) * 1.2,
      (1 - point.position2D.y / 100) * 3.0 - 0.7,
      0.22,
    ],
    [point.position2D]
  );

  const threeColor = useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isHovered) {
      mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.25;
      meshRef.current.scale.setScalar(1.4);
    } else {
      mat.emissiveIntensity = isExplored ? 0.2 : 0.08;
      meshRef.current.scale.setScalar(1.0);
    }
  });

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: threeColor, emissive: threeColor, emissiveIntensity: 0.1,
    roughness: 0.2, metalness: 0.3,
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

  return (
    <group position={pos3}>
      <mesh ref={meshRef} material={mat}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onSelect(point); }}
      >
        <sphereGeometry args={[0.036, 14, 10]} />
      </mesh>
      <mesh><sphereGeometry args={[0.013, 8, 6]} /><meshBasicMaterial color="white" /></mesh>
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
  activeSystems, hoveredPoint, exploredPoints, containerRef, onHoverPoint, onSelectPoint,
}: {
  activeSystems: Set<string>; hoveredPoint: ReflexPoint | null;
  exploredPoints: Set<string>; containerRef: React.RefObject<HTMLDivElement | null>;
  onHoverPoint: (p: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (p: ReflexPoint) => void;
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
        target={[0, 0.5, 0]}
        enablePan={false} enableZoom
        minDistance={2.0} maxDistance={6}
        minPolarAngle={Math.PI * 0.15} maxPolarAngle={Math.PI * 0.85}
        autoRotate={!hoveredPoint} autoRotateSpeed={0.4}
        makeDefault
      />

      <CursorManager hovered={!!hoveredPoint} />

      <Suspense fallback={<LoadingFallback />}>
        <RealisticModel activeSystems={activeSystems} />
      </Suspense>

      <SystemOrgans activeSystems={activeSystems} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.96, 0]}>
        <circleGeometry args={[1.2, 48]} />
        <meshStandardMaterial color="#1a2040" transparent opacity={0.35} roughness={1} />
      </mesh>

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
          <span>Realistic model</span>
          <div className="opacity-dots">
            {systemColors.map((c, i) => (
              <span key={i} className="opacity-dot" style={{ background: c }} />
            ))}
          </div>
        </div>
        <span className="viewer-hint">Drag to rotate · Scroll to zoom</span>
      </div>

      <Canvas
        camera={{ position: [0, 0.6, 3.4], fov: 42, near: 0.1, far: 50 }}
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
