import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/service/Settings", () => ({ Settings: {} }));
vi.mock("../tools/entityDetailsManager", () => ({ DetailsManager: class {} }));

import { Entity } from "./StageEntity";
import type { Section } from "../entity/Section";

describe("section locking", () => {
  it("uses current lock states through nested parents without rebuilding the stage", () => {
    const outer = Object.assign(Object.create(Entity.prototype), { parentSection: null, locked: false }) as Section;
    const inner = Object.assign(Object.create(Entity.prototype), { parentSection: outer, locked: false }) as Section;
    const child = Object.assign(Object.create(Entity.prototype), { parentSection: inner }) as Entity;
    expect(child.nearestLockedAncestorSection).toBeNull();
    outer.locked = true;
    expect(child.nearestLockedAncestorSection).toBe(outer);
    inner.locked = true;
    expect(child.nearestLockedAncestorSection).toBe(inner);
    inner.locked = false;
    expect(child.nearestLockedAncestorSection).toBe(outer);
    outer.locked = false;
    expect(child.nearestLockedAncestorSection).toBeNull();
    child.parentSection = null;
    inner.locked = true;
    expect(child.nearestLockedAncestorSection).toBeNull();
  });
});
