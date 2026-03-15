import { useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";
import { AnatomyOverlays3D } from "./AnatomyOverlays3D";

// ─── Helper: smooth LatheGeometry from a 2D profile ────────────────────────────
function lathe(
  profile: [number, number][],
  segments = 32,
  closed = false
): THREE.LatheGeometry {
  const curve = new THREE.CatmullRomCurve3(
    profile.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    closed
  );
  const pts = curve.getPoints(48).map((p) => new THREE.Vector2(p.x, p.y));
  return new THREE.LatheGeometry(pts, segments);
}

// ─── Smooth skin material ──────────────────────────────────────────────────────
function useSkinMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#a8bcd0"),
        emissive: new THREE.Color("#1a2a40"),
        emissiveIntensity: 0.08,
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.15,
        clearcoatRoughness: 0.4,
      }),
    []
  );
}

// ─── Anatomical Procedural Body ────────────────────────────────────────────────
// All limb segments are sized and positioned so they CONNECT at joints.
// Convention: LatheGeometry y=0 is the DISTAL end (furthest from torso).
function HumanBody({ material }: { material: THREE.Material }) {
  const geoms = useMemo(() => {
    const head = new THREE.SphereGeometry(0.19, 28, 20);
    head.translate(0, 1.82, 0);

    const neck = lathe([
      [0.075, 1.58],
      [0.082, 1.64],
      [0.078, 1.70],
      [0.068, 1.74],
    ]);

    const torso = lathe([
      [0.04, 1.58],
      [0.28, 1.52],
      [0.30, 1.40],
      [0.28, 1.25],
      [0.24, 1.10],
      [0.20, 0.98],
      [0.19, 0.90],
      [0.22, 0.78],
      [0.26, 0.65],
      [0.29, 0.50],
      [0.30, 0.40],
      [0.28, 0.32],
      [0.20, 0.22],
      [0.04, 0.16],
    ], 36);

    // Upper arm: spans from shoulder (y=1.48) to elbow (y=0.86). Length=0.62
    const upperArm = lathe([
      [0.072, 0],       // elbow (distal)
      [0.076, 0.08],
      [0.084, 0.20],
      [0.092, 0.34],    // bicep peak
      [0.090, 0.46],
      [0.082, 0.56],
      [0.070, 0.62],    // shoulder junction (proximal)
    ], 18);

    // Forearm: spans from elbow (y=0.86) to wrist (y=0.30). Length=0.56
    const forearm = lathe([
      [0.044, 0],       // wrist (distal)
      [0.048, 0.06],
      [0.054, 0.16],
      [0.062, 0.30],    // forearm bulk
      [0.068, 0.42],
      [0.072, 0.52],
      [0.072, 0.56],    // elbow junction (matches upper arm elbow radius)
    ], 16);

    // Hand: flattened ellipsoid
    const hand = new THREE.SphereGeometry(0.04, 12, 10);
    hand.scale(0.9, 1.3, 0.5);

    // Thigh: spans from hip (y=0.22) to knee (y=-0.40). Length=0.62
    const thigh = lathe([
      [0.074, 0],       // knee (distal)
      [0.080, 0.08],
      [0.090, 0.18],
      [0.104, 0.32],    // mid-thigh
      [0.118, 0.44],
      [0.128, 0.54],
      [0.132, 0.62],    // hip junction (proximal)
    ], 20);

    // Calf: spans from knee (y=-0.40) to ankle (y=-0.84). Length=0.44
    const calf = lathe([
      [0.050, 0],       // ankle (distal)
      [0.050, 0.04],
      [0.056, 0.12],
      [0.066, 0.24],    // calf bulge
      [0.072, 0.36],
      [0.074, 0.42],
      [0.074, 0.44],    // knee junction (matches thigh knee radius)
    ], 16);

    const foot = new THREE.BoxGeometry(0.09, 0.04, 0.20, 4, 2, 4);

    return { head, neck, torso, upperArm, forearm, hand, thigh, calf, foot };
  }, []);

  return (
    <group name="body">
      {/* Head */}
      <mesh geometry={geoms.head} material={material} />
      <mesh position={[-0.19, 1.80, 0]} material={material}>
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>
      <mesh position={[0.19, 1.80, 0]} material={material}>
        <sphereGeometry args={[0.03, 8, 6]} />
      </mesh>

      {/* Neck */}
      <mesh geometry={geoms.neck} material={material} />

      {/* Torso */}
      <mesh geometry={geoms.torso} material={material} />

      {/* Shoulder caps */}
      <mesh position={[-0.34, 1.50, 0]} material={material}>
        <sphereGeometry args={[0.078, 14, 12]} />
      </mesh>
      <mesh position={[0.34, 1.50, 0]} material={material}>
        <sphereGeometry args={[0.078, 14, 12]} />
      </mesh>

      {/* Upper arms: position.y + 0.62 = 1.48 (shoulder), position.y = 0.86 (elbow) */}
      <mesh geometry={geoms.upperArm} material={material}
        position={[-0.38, 0.86, 0]} rotation={[0, 0, 0.06]} />
      <mesh geometry={geoms.upperArm} material={material}
        position={[0.38, 0.86, 0]} rotation={[0, 0, -0.06]} />

      {/* Forearms: position.y + 0.56 = 0.86 (elbow), position.y = 0.30 (wrist) */}
      <mesh geometry={geoms.forearm} material={material}
        position={[-0.42, 0.30, 0.01]} rotation={[0, 0, 0.03]} />
      <mesh geometry={geoms.forearm} material={material}
        position={[0.42, 0.30, 0.01]} rotation={[0, 0, -0.03]} />

      {/* Hands: just below wrist at y=0.30 */}
      <mesh geometry={geoms.hand} material={material}
        position={[-0.44, 0.22, 0.01]} />
      <mesh geometry={geoms.hand} material={material}
        position={[0.44, 0.22, 0.01]} />

      {/* Thighs: position.y + 0.62 = 0.22 (hip), position.y = -0.40 (knee) */}
      <mesh geometry={geoms.thigh} material={material}
        position={[-0.14, -0.40, 0]} rotation={[0, 0, 0.02]} />
      <mesh geometry={geoms.thigh} material={material}
        position={[0.14, -0.40, 0]} rotation={[0, 0, -0.02]} />

      {/* Calves: position.y + 0.44 = -0.40 (knee), position.y = -0.84 (ankle) */}
      <mesh geometry={geoms.calf} material={material}
        position={[-0.15, -0.84, 0.01]} />
      <mesh geometry={geoms.calf} material={material}
        position={[0.15, -0.84, 0.01]} />

      {/* Feet: at ankle level */}
      <mesh geometry={geoms.foot} material={material}
        position={[-0.15, -0.87, 0.06]} />
      <mesh geometry={geoms.foot} material={material}
        position={[0.15, -0.87, 0.06]} />

      {/* Face features */}
      <mesh position={[-0.06, 1.84, 0.16]} material={material}>
        <sphereGeometry args={[0.028, 8, 6]} />
      </mesh>
      <mesh position={[0.06, 1.84, 0.16]} material={material}>
        <sphereGeometry args={[0.028, 8, 6]} />
      </mesh>
      <mesh position={[0, 1.79, 0.18]} material={material}>
        <sphereGeometry args={[0.022, 8, 6]} />
      </mesh>
    </group>
  );
}


// ─── Helper: get 3D position from a reflex point ──────────────────────────────
function getPoint3D(point: ReflexPoint): [number, number, number] {
  if (point.position3D) {
    return [point.position3D.x, point.position3D.y, point.position3D.z];
  }
  return [
    (point.position2D.x / 100 - 0.5) * 1.2,
    (1 - point.position2D.y / 100) * 3.0 - 0.7,
    0.22,
  ];
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

  const pos3 = useMemo(() => getPoint3D(point), [point]);

  const threeColor = useMemo(() => new THREE.Color(color), [color]);
  const glowCol = useMemo(() => new THREE.Color(glowColor), [glowColor]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isHovered) {
      const pulse = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.25;
      mat.emissiveIntensity = pulse;
      meshRef.current.scale.setScalar(1.4);
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
      <mesh ref={ringRef} visible={false} material={ringMat}>
        <sphereGeometry args={[0.052, 10, 8]} />
      </mesh>
      <mesh
        ref={meshRef}
        material={mat}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={() => onLeave()}
        onClick={(e) => { e.stopPropagation(); onSelect(point); }}
      >
        <sphereGeometry args={[0.036, 14, 10]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.013, 8, 6]} />
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

// ─── Ground plane ──────────────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.94, 0]} receiveShadow>
      <circleGeometry args={[1.2, 48]} />
      <meshStandardMaterial color="#1a2040" transparent opacity={0.35} roughness={1} />
    </mesh>
  );
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
      <ambientLight color="#5a7a9a" intensity={0.7} />
      <directionalLight color="#e8f0ff" intensity={2.0} position={[2, 4, 4]} />
      <directionalLight color="#c0d0e8" intensity={0.6} position={[-3, 2, 1]} />
      <pointLight color="#3060a0" intensity={0.6} position={[0, 0.5, -3]} />
      <hemisphereLight color="#b0c4de" groundColor="#1a1a3a" intensity={0.5} />

      <OrbitControls
        target={[0, 0.45, 0]}
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={7}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        autoRotate={!hoveredPoint}
        autoRotateSpeed={0.4}
        makeDefault
      />

      <CursorManager hovered={!!hoveredPoint} />
      <Ground />
      <HumanBody material={skinMat} />
      <AnatomyOverlays3D activeSystems={activeSystems} />

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
        camera={{ position: [0, 0.5, 4.0], fov: 45, near: 0.1, far: 50 }}
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
