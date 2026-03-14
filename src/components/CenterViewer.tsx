import type { ReflexPoint } from "../data/points";
import { BodyViewer3D } from "./BodyViewer3D";
import { BodyViewer2D } from "./BodyViewer2D";

interface CenterViewerProps {
  activeSystems: Set<string>;
  layerOpacity: number;
  viewMode: "3d" | "2d";
  onSetViewMode: (mode: "3d" | "2d") => void;
  onHoverPoint: (point: ReflexPoint | null, pos?: { x: number; y: number }) => void;
  onSelectPoint: (point: ReflexPoint) => void;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  exploredPoints: Set<string>;
  layerOpacitySlider: React.ReactNode;
}

export function CenterViewer({
  activeSystems,
  layerOpacity,
  viewMode,
  onSetViewMode,
  onHoverPoint,
  onSelectPoint,
  hoveredPoint,
  hoverPosition,
  exploredPoints,
  layerOpacitySlider,
}: CenterViewerProps) {
  const sharedProps = {
    activeSystems,
    layerOpacity,
    onHoverPoint,
    onSelectPoint,
    hoveredPoint,
    hoverPosition,
    exploredPoints,
  };

  return (
    <div className="viewer-container">
      {/* Mode toggle */}
      <div className="viewer-mode-toggle">
        <button
          className={`mode-btn ${viewMode === "3d" ? "mode-btn--active" : ""}`}
          onClick={() => onSetViewMode("3d")}
        >
          ◈ 3D
        </button>
        <button
          className={`mode-btn ${viewMode === "2d" ? "mode-btn--active" : ""}`}
          onClick={() => onSetViewMode("2d")}
        >
          ⬜ 2D
        </button>
      </div>

      {viewMode === "3d" ? <BodyViewer3D {...sharedProps} /> : <BodyViewer2D {...sharedProps} />}

      {layerOpacitySlider}
    </div>
  );
}
