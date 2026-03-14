import { useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";

// ─── Shared skin material ──────────────────────────────────────────────────────
const SKIN_COLOR = new THREE.Color("#b8c8dc");
const SKIN_EMISSIVE = new THREE.Color("#0d1525");

function useSkinMaterial() {
  return useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: SKIN_COLOR,
        emissive: SKIN_EMISSIVE,
        emissiveIntensity: 0.12,
        roughness: 0.68,
        metalness: 0.02,
      }),
    []
  );
}

// ─── Body segment helper ───────────────────────────────────────────────────────
interface SegmentProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  children: React.ReactNode;
  material: THREE.Material;
}
function Seg({ position, rotation, children, material }: SegmentProps) {
  return (
    <mesh position={position} rotation={rotation} material={material} castShadow>
      {children}
    </mesh>
  );
}

// ─── Procedural Human Body ────────────────────────────────────────────────────
function ProceduralBody({ material }: { material: THREE.Material }) {
  return (
    <group name="body">
      {/* Head */}
      <Seg position={[0, 1.82, 0]} material={material}>
        <sphereGeometry args={[0.185, 24, 16]} />
      </Seg>
      {/* Neck */}
      <Seg position={[0, 1.62, 0]} material={material}>
        <capsuleGeometry args={[0.062, 0.12, 4, 10]} />
      </Seg>
      {/* Clavicle / shoulder bridge */}
      <Seg position={[0, 1.52, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
        <capsuleGeometry args={[0.04, 0.68, 4, 8]} />
      </Seg>
      {/* Shoulder ball L */}
      <Seg position={[-0.42, 1.52, 0]} material={material}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </Seg>
      {/* Shoulder ball R */}
      <Seg position={[0.42, 1.52, 0]} material={material}>
        <sphereGeometry args={[0.1, 14, 10]} />
      </Seg>
      {/* Upper chest */}
      <Seg position={[0, 1.25, 0]} material={material}>
        <cylinderGeometry args={[0.29, 0.24, 0.55, 20]} />
      </Seg>
      {/* Lower torso / abdomen */}
      <Seg position={[0, 0.82, 0]} material={material}>
        <cylinderGeometry args={[0.24, 0.27, 0.52, 20]} />
      </Seg>
      {/* Pelvis */}
      <Seg position={[0, 0.48, 0]} material={material}>
        <cylinderGeometry args={[0.28, 0.26, 0.25, 20]} />
      </Seg>
      {/* Upper arm L */}
      <Seg position={[-0.56, 1.18, 0]} rotation={[0, 0, -0.28]} material={material}>
        <capsuleGeometry args={[0.074, 0.34, 4, 10]} />
      </Seg>
      {/* Upper arm R */}
      <Seg position={[0.56, 1.18, 0]} rotation={[0, 0, 0.28]} material={material}>
        <capsuleGeometry args={[0.074, 0.34, 4, 10]} />
      </Seg>
      {/* Forearm L */}
      <Seg position={[-0.64, 0.72, 0.03]} rotation={[0, 0, -0.16]} material={material}>
        <capsuleGeometry args={[0.054, 0.36, 4, 10]} />
      </Seg>
      {/* Forearm R */}
      <Seg position={[0.64, 0.72, 0.03]} rotation={[0, 0, 0.16]} material={material}>
        <capsuleGeometry args={[0.054, 0.36, 4, 10]} />
      </Seg>
      {/* Hand L */}
      <Seg position={[-0.67, 0.44, 0.03]} material={material}>
        <sphereGeometry args={[0.068, 12, 8]} />
      </Seg>
      {/* Hand R */}
      <Seg position={[0.67, 0.44, 0.03]} material={material}>
        <sphereGeometry args={[0.068, 12, 8]} />
      </Seg>
      {/* Thigh L */}
      <Seg position={[-0.165, 0.05, 0]} rotation={[0, 0, -0.05]} material={material}>
        <capsuleGeometry args={[0.112, 0.4, 4, 12]} />
      </Seg>
      {/* Thigh R */}
      <Seg position={[0.165, 0.05, 0]} rotation={[0, 0, 0.05]} material={material}>
        <capsuleGeometry args={[0.112, 0.4, 4, 12]} />
      </Seg>
      {/* Shin L */}
      <Seg position={[-0.162, -0.52, 0.02]} rotation={[0, 0, -0.02]} material={material}>
        <capsuleGeometry args={[0.074, 0.38, 4, 10]} />
      </Seg>
      {/* Shin R */}
      <Seg position={[0.162, -0.52, 0.02]} rotation={[0, 0, 0.02]} material={material}>
        <capsuleGeometry args={[0.074, 0.38, 4, 10]} />
      </Seg>
      {/* Ankle L */}
      <Seg position={[-0.162, -0.79, 0.02]} material={material}>
        <sphereGeometry args={[0.065, 10, 8]} />
      </Seg>
      {/* Ankle R */}
      <Seg position={[0.162, -0.79, 0.02]} material={material}>
        <sphereGeometry args={[0.065, 10, 8]} />
      </Seg>
      {/* Foot L */}
      <Seg position={[-0.162, -0.86, 0.06]} material={material}>
        <boxGeometry args={[0.14, 0.065, 0.22]} />
      </Seg>
      {/* Foot R */}
      <Seg position={[0.162, -0.86, 0.06]} material={material}>
        <boxGeometry args={[0.14, 0.065, 0.22]} />
      </Seg>
    </group>
  );
}

// ─── Organ overlay definitions ─────────────────────────────────────────────────
interface OrganOverlay {
  systemId: string;
  position: [number, number, number];
  scale: [number, number, number];
  opacity: number;
}

const ORGAN_OVERLAYS: OrganOverlay[] = [
  // Brain
  { systemId: "neuromuscular", position: [0, 1.83, 0.05], scale: [1.1, 1.0, 0.9], opacity: 0.5 },
  // Thyroid
  { systemId: "endocrine", position: [0, 1.50, 0.13], scale: [0.8, 0.4, 0.6], opacity: 0.6 },
  // Pituitary (small)
  { systemId: "endocrine", position: [0, 1.75, 0.06], scale: [0.3, 0.3, 0.3], opacity: 0.7 },
  // Adrenals L
  { systemId: "endocrine", position: [-0.1, 0.62, -0.04], scale: [0.4, 0.3, 0.35], opacity: 0.55 },
  // Adrenals R
  { systemId: "endocrine", position: [0.1, 0.62, -0.04], scale: [0.4, 0.3, 0.35], opacity: 0.55 },
  // Heart
  { systemId: "cardiovascular", position: [-0.13, 1.04, 0.12], scale: [0.7, 0.8, 0.65], opacity: 0.72 },
  // Lung L
  { systemId: "respiratory", position: [-0.17, 1.05, 0.04], scale: [0.65, 1.1, 0.5], opacity: 0.38 },
  // Lung R
  { systemId: "respiratory", position: [0.17, 1.05, 0.04], scale: [0.65, 1.1, 0.5], opacity: 0.38 },
  // Stomach
  { systemId: "digestive", position: [-0.1, 0.78, 0.1], scale: [0.8, 0.65, 0.55], opacity: 0.45 },
  // Liver
  { systemId: "digestive", position: [0.15, 0.82, 0.06], scale: [0.85, 0.6, 0.55], opacity: 0.4 },
  // Intestines (large blob)
  { systemId: "digestive", position: [0, 0.65, 0.06], scale: [1.1, 0.9, 0.55], opacity: 0.28 },
  // Kidney L
  { systemId: "urinary", position: [-0.12, 0.6, -0.08], scale: [0.5, 0.7, 0.4], opacity: 0.5 },
  // Kidney R
  { systemId: "urinary", position: [0.12, 0.6, -0.08], scale: [0.5, 0.7, 0.4], opacity: 0.5 },
  // Bladder
  { systemId: "urinary", position: [0, 0.3, 0.1], scale: [0.6, 0.55, 0.5], opacity: 0.45 },
  // Uterus/ovary L
  { systemId: "reproductive", position: [-0.1, 0.28, 0.08], scale: [0.45, 0.4, 0.4], opacity: 0.5 },
  // Uterus/ovary R
  { systemId: "reproductive", position: [0.1, 0.28, 0.08], scale: [0.45, 0.4, 0.4], opacity: 0.5 },
  // Spleen
  { systemId: "lymphatic", position: [-0.22, 0.72, -0.04], scale: [0.5, 0.55, 0.4], opacity: 0.42 },
  // Lymph node cluster upper L
  { systemId: "lymphatic", position: [-0.42, 1.45, 0.06], scale: [0.28, 0.28, 0.28], opacity: 0.55 },
  // Lymph node cluster upper R
  { systemId: "lymphatic", position: [0.42, 1.45, 0.06], scale: [0.28, 0.28, 0.28], opacity: 0.55 },
  // Lymph node cluster lower L
  { systemId: "lymphatic", position: [-0.2, 0.26, 0.08], scale: [0.25, 0.25, 0.25], opacity: 0.5 },
  // Lymph node cluster lower R
  { systemId: "lymphatic", position: [0.2, 0.26, 0.08], scale: [0.25, 0.25, 0.25], opacity: 0.5 },
];

function SystemOrgans({ activeSystems }: { activeSystems: Set<string> }) {
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.1, 10, 8), []);
  const matCache = useRef(new Map<string, THREE.MeshStandardMaterial>());

  const getMat = useCallback(
    (systemId: string, opacity: number) => {
      const key = `${systemId}_${opacity}`;
      if (!matCache.current.has(key)) {
        const sys = SYSTEM_MAP[systemId];
        const color = new THREE.Color(sys?.color || "#888");
        matCache.current.set(
          key,
          new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity,
            depthWrite: false,
          })
        );
      }
      return matCache.current.get(key)!;
    },
    []
  );

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

// ─── Hotspot point ────────────────────────────────────────────────────────────
function Hotspot({
  point,
  isHovered,
  isExplored,
  color,
  glowColor,
  containerRef,
  onHover,
  onLeave,
  onSelect,
}: {
  point: ReflexPoint;
  isHovered: boolean;
  isExplored: boolean;
  color: string;
  glowColor: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHover: (p: ReflexPoint, pos: { x: number; y: number }) => void;
  onLeave: () => void;
  onSelect: (p: ReflexPoint) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  // Map 2D percentage to 3D world position
  const pos3: [number, number, number] = useMemo(
    () => [
      (point.position2D.x / 100 - 0.5) * 1.6,
      (1 - point.position2D.y / 100) * 3.72 - 1.0,
      0.22,
    ],
    [point.position2D]
  );

  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const glowCol = useMemo(() => new THREE.Color(glowColor), [glowColor]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isHovered) {
      const pulse = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.25;
      mat.emissiveIntensity = pulse;
      meshRef.current.scale.setScalar(1.35);
    } else {
      mat.emissiveIntensity = isExplored ? 0.2 : 0.08;
      meshRef.current.scale.setScalar(1.0);
    }
    if (ringRef.current) {
      ringRef.current.visible = isExplored && !isHovered;
    }
  });

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: threeColor,
        emissive: threeColor,
        emissiveIntensity: 0.1,
        roughness: 0.2,
        metalness: 0.3,
      }),
    [threeColor]
  );

  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: glowCol,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      }),
    [glowCol]
  );

  const handlePointerEnter = useCallback(
    (e: { clientX: number; clientY: number; stopPropagation: () => void }) => {
      e.stopPropagation();
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onHover(point, { x, y });
    },
    [containerRef, onHover, point]
  );

  return (
    <group position={pos3}>
      {/* Explored ring */}
      <mesh ref={ringRef} visible={false} material={ringMat}>
        <sphereGeometry args={[0.052, 10, 8]} />
      </mesh>
      {/* Main hotspot sphere */}
      <mesh
        ref={meshRef}
        material={mat}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onSelect(point); }}
      >
        <sphereGeometry args={[0.038, 14, 10]} />
      </mesh>
      {/* White inner dot */}
      <mesh>
        <sphereGeometry args={[0.014, 8, 6]} />
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

// ─── Scene cursor manager ──────────────────────────────────────────────────────
function CursorManager({ hovered }: { hovered: boolean }) {
  const { gl } = useThree();
  gl.domElement.style.cursor = hovered ? "pointer" : "auto";
  return null;
}

// ─── Main 3D scene ─────────────────────────────────────────────────────────────
interface SceneProps {
  activeSystems: Set<string>;
  hoveredPoint: ReflexPoint | null;
  exploredPoints: Set<string>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onHoverPoint: (p: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (p: ReflexPoint) => void;
}

function Scene({ activeSystems, hoveredPoint, exploredPoints, containerRef, onHoverPoint, onSelectPoint }: SceneProps) {
  const skinMat = useSkinMaterial();

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
      {/* Lighting */}
      <ambientLight color="#4a6a90" intensity={0.9} />
      <directionalLight color="#e8f0ff" intensity={2.2} position={[3, 5, 3]} castShadow />
      <directionalLight color="#c8d8ff" intensity={0.5} position={[-3, 2, 2]} />
      <pointLight color="#2050a0" intensity={0.8} position={[0, 1, -3]} />
      <pointLight color="#ffffff" intensity={0.4} position={[0, -1, 2]} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2.2}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
        autoRotate={!hoveredPoint}
        autoRotateSpeed={0.5}
        makeDefault
      />

      <CursorManager hovered={!!hoveredPoint} />

      {/* Body */}
      <ProceduralBody material={skinMat} />

      {/* System organ overlays */}
      <SystemOrgans activeSystems={activeSystems} />

      {/* Hotspot markers */}
      {visiblePoints.map((point) => (
        <Hotspot
          key={point.id}
          point={point}
          isHovered={hoveredPoint?.id === point.id}
          isExplored={exploredPoints.has(point.id)}
          color={getColor(point)}
          glowColor={getGlow(point)}
          containerRef={containerRef}
          onHover={(p, pos) => onHoverPoint(p, pos)}
          onLeave={() => onHoverPoint(null)}
          onSelect={onSelectPoint}
        />
      ))}
    </>
  );
}

// ─── Exported BodyViewer3D ─────────────────────────────────────────────────────
interface BodyViewer3DProps {
  activeSystems: Set<string>;
  layerOpacity: number;
  onHoverPoint: (point: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (point: ReflexPoint) => void;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  exploredPoints: Set<string>;
}

export function BodyViewer3D({
  activeSystems,
  layerOpacity,
  onHoverPoint,
  onSelectPoint,
  hoveredPoint,
  hoverPosition,
  exploredPoints,
}: BodyViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const systemColors = useMemo(
    () => BODY_SYSTEMS.filter((s) => activeSystems.has(s.id)).map((s) => s.color),
    [activeSystems]
  );

  return (
    <div className="body-viewer body-viewer--3d" ref={containerRef} style={{ opacity: layerOpacity }}>
      <div className="body-viewer__controls">
        <div className="layer-opacity">
          <span>Active systems</span>
          <div className="opacity-dots">
            {systemColors.map((c, i) => (
              <span key={i} className="opacity-dot" style={{ background: c }} />
            ))}
          </div>
        </div>
        <span className="viewer-hint">Drag to rotate · Scroll to zoom</span>
      </div>

      <Canvas
        camera={{ position: [0, 0.5, 3.8], fov: 44, near: 0.1, far: 50 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
        shadows={false}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
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

      {/* HTML tooltip overlay */}
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
