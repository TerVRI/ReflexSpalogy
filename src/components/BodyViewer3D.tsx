import { useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { ReflexPoint } from "../data/points";
import { REFLEX_POINTS } from "../data/points";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { AnnotationTooltip } from "./AnnotationTooltip";

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

// ─── The body's vertical extent: feet ≈ -0.88, head top ≈ 1.95 ─────────────
// Center of mass Y ≈ 0.53.  Camera & controls target this Y.

// ─── Anatomical Procedural Body ────────────────────────────────────────────────
function HumanBody({ material }: { material: THREE.Material }) {
  const geoms = useMemo(() => {
    // -- Head: sphere (keep) --
    const head = new THREE.SphereGeometry(0.19, 28, 20);
    head.translate(0, 1.82, 0);

    // -- Neck: smooth tapered cylinder via lathe --
    const neck = lathe([
      [0.075, 1.60],
      [0.082, 1.65],
      [0.075, 1.70],
      [0.065, 1.73],
    ]);

    // -- Torso: the key shape — chest → waist → hips as one smooth lathe --
    const torso = lathe([
      [0.04, 1.58],  // top of shoulders (thin — meets neck)
      [0.28, 1.52],  // shoulder width
      [0.30, 1.40],  // upper chest
      [0.28, 1.25],  // mid chest
      [0.24, 1.10],  // lower chest / ribs
      [0.20, 0.98],  // waist
      [0.19, 0.90],  // narrow waist
      [0.22, 0.78],  // beginning of abdomen
      [0.26, 0.65],  // abdomen
      [0.29, 0.50],  // hip widening
      [0.30, 0.40],  // widest hips
      [0.28, 0.32],  // lower pelvis
      [0.20, 0.22],  // crotch taper
      [0.04, 0.16],  // inner thigh gap
    ], 36);

    // -- Upper arm (one side, mirrored) --
    const upperArm = lathe([
      [0.095, 0],
      [0.09, 0.05],
      [0.085, 0.12],
      [0.078, 0.22],
      [0.07, 0.30],
      [0.065, 0.36],
    ], 16);

    // -- Forearm --
    const forearm = lathe([
      [0.062, 0],
      [0.058, 0.04],
      [0.052, 0.12],
      [0.048, 0.22],
      [0.042, 0.30],
      [0.038, 0.36],
    ], 16);

    // -- Hand: flattened ellipsoid --
    const hand = new THREE.SphereGeometry(0.06, 12, 10);
    hand.scale(1.0, 1.3, 0.6);

    // -- Thigh --
    const thigh = lathe([
      [0.13, 0],
      [0.125, 0.06],
      [0.12, 0.14],
      [0.11, 0.24],
      [0.10, 0.32],
      [0.085, 0.42],
      [0.075, 0.48],
    ], 20);

    // -- Calf / shin --
    const calf = lathe([
      [0.075, 0],
      [0.072, 0.04],
      [0.065, 0.12],
      [0.058, 0.20],
      [0.052, 0.28],
      [0.048, 0.34],
      [0.050, 0.38],
    ], 16);

    // -- Foot: stretched box with rounded edges --
    const foot = new THREE.BoxGeometry(0.12, 0.06, 0.24, 4, 2, 4);

    return { head, neck, torso, upperArm, forearm, hand, thigh, calf, foot };
  }, []);

  return (
    <group name="body">
      {/* Head */}
      <mesh geometry={geoms.head} material={material} />
      {/* Ears */}
      <mesh position={[-0.19, 1.80, 0]} material={material}>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>
      <mesh position={[0.19, 1.80, 0]} material={material}>
        <sphereGeometry args={[0.04, 8, 6]} />
      </mesh>

      {/* Neck */}
      <mesh geometry={geoms.neck} material={material} />

      {/* Torso (single smooth lathe) */}
      <mesh geometry={geoms.torso} material={material} />

      {/* Shoulder caps */}
      <mesh position={[-0.34, 1.50, 0]} material={material}>
        <sphereGeometry args={[0.10, 14, 12]} />
      </mesh>
      <mesh position={[0.34, 1.50, 0]} material={material}>
        <sphereGeometry args={[0.10, 14, 12]} />
      </mesh>

      {/* Upper arms */}
      <mesh
        geometry={geoms.upperArm}
        material={material}
        position={[-0.44, 1.12, 0]}
        rotation={[0, 0, 0.12]}
      />
      <mesh
        geometry={geoms.upperArm}
        material={material}
        position={[0.44, 1.12, 0]}
        rotation={[0, 0, -0.12]}
      />

      {/* Elbow joints */}
      <mesh position={[-0.48, 0.78, 0]} material={material}>
        <sphereGeometry args={[0.058, 10, 8]} />
      </mesh>
      <mesh position={[0.48, 0.78, 0]} material={material}>
        <sphereGeometry args={[0.058, 10, 8]} />
      </mesh>

      {/* Forearms */}
      <mesh
        geometry={geoms.forearm}
        material={material}
        position={[-0.50, 0.42, 0.02]}
        rotation={[0, 0, 0.06]}
      />
      <mesh
        geometry={geoms.forearm}
        material={material}
        position={[0.50, 0.42, 0.02]}
        rotation={[0, 0, -0.06]}
      />

      {/* Wrist joints */}
      <mesh position={[-0.51, 0.08, 0.02]} material={material}>
        <sphereGeometry args={[0.038, 8, 6]} />
      </mesh>
      <mesh position={[0.51, 0.08, 0.02]} material={material}>
        <sphereGeometry args={[0.038, 8, 6]} />
      </mesh>

      {/* Hands */}
      <mesh
        geometry={geoms.hand}
        material={material}
        position={[-0.51, -0.02, 0.02]}
      />
      <mesh
        geometry={geoms.hand}
        material={material}
        position={[0.51, -0.02, 0.02]}
      />

      {/* Thighs */}
      <mesh
        geometry={geoms.thigh}
        material={material}
        position={[-0.14, -0.26, 0]}
        rotation={[0, 0, 0.03]}
      />
      <mesh
        geometry={geoms.thigh}
        material={material}
        position={[0.14, -0.26, 0]}
        rotation={[0, 0, -0.03]}
      />

      {/* Knee joints */}
      <mesh position={[-0.15, -0.52, 0.02]} material={material}>
        <sphereGeometry args={[0.072, 12, 10]} />
      </mesh>
      <mesh position={[0.15, -0.52, 0.02]} material={material}>
        <sphereGeometry args={[0.072, 12, 10]} />
      </mesh>

      {/* Calves */}
      <mesh
        geometry={geoms.calf}
        material={material}
        position={[-0.15, -0.88, 0.01]}
        rotation={[0, 0, 0.01]}
      />
      <mesh
        geometry={geoms.calf}
        material={material}
        position={[0.15, -0.88, 0.01]}
        rotation={[0, 0, -0.01]}
      />

      {/* Ankle joints */}
      <mesh position={[-0.15, -0.88, 0.02]} material={material}>
        <sphereGeometry args={[0.048, 10, 8]} />
      </mesh>
      <mesh position={[0.15, -0.88, 0.02]} material={material}>
        <sphereGeometry args={[0.048, 10, 8]} />
      </mesh>

      {/* Feet */}
      <mesh
        geometry={geoms.foot}
        material={material}
        position={[-0.15, -0.92, 0.06]}
      />
      <mesh
        geometry={geoms.foot}
        material={material}
        position={[0.15, -0.92, 0.06]}
      />

      {/* Face features — subtle depressions */}
      <mesh position={[-0.06, 1.84, 0.16]} material={material}>
        <sphereGeometry args={[0.028, 8, 6]} />
      </mesh>
      <mesh position={[0.06, 1.84, 0.16]} material={material}>
        <sphereGeometry args={[0.028, 8, 6]} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 1.79, 0.18]} material={material}>
        <sphereGeometry args={[0.022, 8, 6]} />
      </mesh>
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
  { systemId: "neuromuscular", position: [0, 1.83, 0.05], scale: [1.1, 1.0, 0.9], opacity: 0.45 },
  { systemId: "endocrine", position: [0, 1.55, 0.12], scale: [0.7, 0.35, 0.5], opacity: 0.55 },
  { systemId: "endocrine", position: [0, 1.75, 0.06], scale: [0.25, 0.25, 0.25], opacity: 0.65 },
  { systemId: "endocrine", position: [-0.08, 0.72, -0.02], scale: [0.35, 0.25, 0.3], opacity: 0.5 },
  { systemId: "endocrine", position: [0.08, 0.72, -0.02], scale: [0.35, 0.25, 0.3], opacity: 0.5 },
  { systemId: "cardiovascular", position: [-0.08, 1.12, 0.1], scale: [0.6, 0.7, 0.55], opacity: 0.65 },
  { systemId: "respiratory", position: [-0.14, 1.18, 0.04], scale: [0.5, 0.9, 0.4], opacity: 0.35 },
  { systemId: "respiratory", position: [0.14, 1.18, 0.04], scale: [0.5, 0.9, 0.4], opacity: 0.35 },
  { systemId: "digestive", position: [-0.06, 0.88, 0.08], scale: [0.6, 0.5, 0.45], opacity: 0.4 },
  { systemId: "digestive", position: [0.10, 0.92, 0.05], scale: [0.7, 0.5, 0.45], opacity: 0.35 },
  { systemId: "digestive", position: [0, 0.72, 0.05], scale: [0.9, 0.7, 0.45], opacity: 0.25 },
  { systemId: "urinary", position: [-0.10, 0.70, -0.06], scale: [0.4, 0.55, 0.35], opacity: 0.45 },
  { systemId: "urinary", position: [0.10, 0.70, -0.06], scale: [0.4, 0.55, 0.35], opacity: 0.45 },
  { systemId: "urinary", position: [0, 0.38, 0.08], scale: [0.5, 0.45, 0.4], opacity: 0.4 },
  { systemId: "reproductive", position: [-0.08, 0.34, 0.06], scale: [0.35, 0.3, 0.3], opacity: 0.45 },
  { systemId: "reproductive", position: [0.08, 0.34, 0.06], scale: [0.35, 0.3, 0.3], opacity: 0.45 },
  { systemId: "lymphatic", position: [-0.18, 0.82, -0.03], scale: [0.4, 0.45, 0.35], opacity: 0.38 },
  { systemId: "lymphatic", position: [-0.34, 1.48, 0.04], scale: [0.22, 0.22, 0.22], opacity: 0.5 },
  { systemId: "lymphatic", position: [0.34, 1.48, 0.04], scale: [0.22, 0.22, 0.22], opacity: 0.5 },
  { systemId: "lymphatic", position: [-0.16, 0.30, 0.06], scale: [0.2, 0.2, 0.2], opacity: 0.45 },
  { systemId: "lymphatic", position: [0.16, 0.30, 0.06], scale: [0.2, 0.2, 0.2], opacity: 0.45 },
];

function SystemOrgans({ activeSystems }: { activeSystems: Set<string> }) {
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.1, 10, 8), []);
  const matCache = useRef(new Map<string, THREE.MeshStandardMaterial>());

  const getMat = useCallback((systemId: string, opacity: number) => {
    const key = `${systemId}_${opacity}`;
    if (!matCache.current.has(key)) {
      const sys = SYSTEM_MAP[systemId];
      const color = new THREE.Color(sys?.color || "#888");
      matCache.current.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          emissive: color,
          emissiveIntensity: 0.35,
          transparent: true,
          opacity,
          depthWrite: false,
        })
      );
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

  // Map 2D percentage positions to the new body's 3D coordinates
  const pos3: [number, number, number] = useMemo(
    () => [
      (point.position2D.x / 100 - 0.5) * 1.2,
      (1 - point.position2D.y / 100) * 3.0 - 0.7,
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

// ─── Ground plane (subtle shadow catcher) ─────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.96, 0]} receiveShadow>
      <circleGeometry args={[1.2, 48]} />
      <meshStandardMaterial
        color="#1a2040"
        transparent
        opacity={0.35}
        roughness={1}
      />
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
      {/* Lighting — three-point setup with soft fill */}
      <ambientLight color="#5a7a9a" intensity={0.7} />
      <directionalLight color="#e8f0ff" intensity={2.0} position={[2, 4, 4]} />
      <directionalLight color="#c0d0e8" intensity={0.6} position={[-3, 2, 1]} />
      <pointLight color="#3060a0" intensity={0.6} position={[0, 0.5, -3]} />
      <hemisphereLight color="#b0c4de" groundColor="#1a1a3a" intensity={0.5} />

      {/* Camera controls — target the body's center of mass */}
      <OrbitControls
        target={[0, 0.5, 0]}
        enablePan={false}
        enableZoom={true}
        minDistance={2.0}
        maxDistance={6}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.85}
        autoRotate={!hoveredPoint}
        autoRotateSpeed={0.4}
        makeDefault
      />

      <CursorManager hovered={!!hoveredPoint} />

      {/* Ground shadow catcher */}
      <Ground />

      {/* Human body */}
      <HumanBody material={skinMat} />

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
        camera={{ position: [0, 0.6, 3.4], fov: 42, near: 0.1, far: 50 }}
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
