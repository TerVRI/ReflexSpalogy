import { describe, it, expect } from "vitest";
import { BODY_SYSTEMS, SYSTEM_MAP } from "../data/systems";
import { REFLEX_POINTS } from "../data/points";

describe("Body Systems data", () => {
  it("has exactly 10 body systems", () => {
    expect(BODY_SYSTEMS).toHaveLength(10);
  });

  it("each system has required fields", () => {
    for (const sys of BODY_SYSTEMS) {
      expect(sys.id).toBeTruthy();
      expect(sys.name).toBeTruthy();
      expect(sys.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(sys.description).toBeTruthy();
    }
  });

  it("SYSTEM_MAP has entries for all systems", () => {
    for (const sys of BODY_SYSTEMS) {
      expect(SYSTEM_MAP[sys.id]).toBeDefined();
      expect(SYSTEM_MAP[sys.id].name).toBe(sys.name);
    }
  });

  it("system IDs are unique", () => {
    const ids = BODY_SYSTEMS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Reflex Points data", () => {
  it("has at least 15 reflex points", () => {
    expect(REFLEX_POINTS.length).toBeGreaterThanOrEqual(15);
  });

  it("each point has required fields", () => {
    for (const pt of REFLEX_POINTS) {
      expect(pt.id).toBeTruthy();
      expect(pt.name).toBeTruthy();
      expect(pt.systemIds.length).toBeGreaterThan(0);
      expect(pt.position2D).toBeDefined();
      expect(pt.position2D.x).toBeGreaterThanOrEqual(0);
      expect(pt.position2D.x).toBeLessThanOrEqual(100);
      expect(pt.position2D.y).toBeGreaterThanOrEqual(0);
      expect(pt.position2D.y).toBeLessThanOrEqual(100);
      expect(pt.biology).toBeDefined();
      expect(pt.biology.role).toBeTruthy();
      expect(pt.biology.detail).toBeTruthy();
      expect(pt.audioScript).toBeTruthy();
    }
  });

  it("point IDs are unique", () => {
    const ids = REFLEX_POINTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all point systemIds reference valid systems", () => {
    const validIds = new Set(BODY_SYSTEMS.map((s) => s.id));
    for (const pt of REFLEX_POINTS) {
      for (const sid of pt.systemIds) {
        expect(validIds.has(sid)).toBe(true);
      }
    }
  });

  it("points with position3D have valid coordinates", () => {
    const with3D = REFLEX_POINTS.filter((p) => p.position3D);
    expect(with3D.length).toBeGreaterThan(0);
    for (const pt of with3D) {
      expect(typeof pt.position3D!.x).toBe("number");
      expect(typeof pt.position3D!.y).toBe("number");
      expect(typeof pt.position3D!.z).toBe("number");
    }
  });

  it("every system has at least one reflex point", () => {
    for (const sys of BODY_SYSTEMS) {
      const pts = REFLEX_POINTS.filter((p) => p.systemIds.includes(sys.id));
      expect(pts.length).toBeGreaterThan(0);
    }
  });
});
