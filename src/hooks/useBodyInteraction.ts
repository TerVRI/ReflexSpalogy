import { useState, useCallback } from "react";
import type { ReflexPoint } from "../data/points";
import type { BodySystem } from "../data/systems";

export interface HoverState {
  point: ReflexPoint | null;
  position: { x: number; y: number } | null;
}

export interface AppState {
  activeSystems: Set<string>;
  selectedPoint: ReflexPoint | null;
  hoveredPoint: ReflexPoint | null;
  hoverPosition: { x: number; y: number } | null;
  showDetailPanel: boolean;
  viewMode: "3d" | "2d";
  layerOpacity: number;
  quizMode: boolean;
  exploredPoints: Set<string>;
}

export function useBodyInteraction(systems: BodySystem[]) {
  const [state, setState] = useState<AppState>({
    activeSystems: new Set(systems.map((s) => s.id)),
    selectedPoint: null,
    hoveredPoint: null,
    hoverPosition: null,
    showDetailPanel: false,
    viewMode: (typeof window !== "undefined" && window.innerWidth < 768 ? "2d" : "3d") as "3d" | "2d",
    layerOpacity: 1,
    quizMode: false,
    exploredPoints: new Set(),
  });

  const toggleSystem = useCallback((systemId: string) => {
    setState((s) => {
      const next = new Set(s.activeSystems);
      if (next.has(systemId)) {
        if (next.size > 1) next.delete(systemId);
      } else {
        next.add(systemId);
      }
      return { ...s, activeSystems: next };
    });
  }, []);

  const selectOnlySystem = useCallback((systemId: string) => {
    setState((s) => ({ ...s, activeSystems: new Set([systemId]) }));
  }, []);

  const selectAllSystems = useCallback(() => {
    setState((s) => ({ ...s, activeSystems: new Set(systems.map((sys) => sys.id)) }));
  }, [systems]);

  const hoverPoint = useCallback((point: ReflexPoint | null, position?: { x: number; y: number }) => {
    setState((s) => ({
      ...s,
      hoveredPoint: point,
      hoverPosition: position || null,
    }));
  }, []);

  const selectPoint = useCallback((point: ReflexPoint | null) => {
    setState((s) => ({
      ...s,
      selectedPoint: point,
      showDetailPanel: point !== null,
      exploredPoints: point ? new Set([...s.exploredPoints, point.id]) : s.exploredPoints,
    }));
  }, []);

  const closePanel = useCallback(() => {
    setState((s) => ({ ...s, selectedPoint: null, showDetailPanel: false }));
  }, []);

  const setLayerOpacity = useCallback((opacity: number) => {
    setState((s) => ({ ...s, layerOpacity: opacity }));
  }, []);

  const setViewMode = useCallback((mode: "3d" | "2d") => {
    setState((s) => ({ ...s, viewMode: mode }));
  }, []);

  const toggleQuizMode = useCallback(() => {
    setState((s) => ({ ...s, quizMode: !s.quizMode }));
  }, []);

  const isPointVisible = useCallback(
    (point: ReflexPoint) => {
      return point.systemIds.some((id) => state.activeSystems.has(id));
    },
    [state.activeSystems]
  );

  return {
    ...state,
    toggleSystem,
    selectOnlySystem,
    selectAllSystems,
    hoverPoint,
    selectPoint,
    closePanel,
    setLayerOpacity,
    setViewMode,
    toggleQuizMode,
    isPointVisible,
  };
}
