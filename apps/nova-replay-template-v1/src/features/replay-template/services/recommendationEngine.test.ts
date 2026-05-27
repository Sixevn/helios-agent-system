import { describe, expect, it } from "vitest";
import { rankTemplates, validateSegments } from "./recommendationEngine";
import type { ManualReplaySegment, TemplateRecord } from "../types";

const templates: TemplateRecord[] = [
  {
    id: "a",
    templateName: "Hook-heavy",
    version: "1.0",
    platform: "YouTube Shorts",
    simplicity: 5,
    hookStyle: "Immediate",
    ctaStyle: "Comment",
    blueprint: [
      { slot: "hook", targetStartPct: 0, targetEndPct: 15, weight: 1.3 },
      { slot: "context", targetStartPct: 15, targetEndPct: 35, weight: 1.0 },
      { slot: "payoff", targetStartPct: 35, targetEndPct: 70, weight: 1.1 },
      { slot: "pivot", targetStartPct: 70, targetEndPct: 88, weight: 0.9 },
      { slot: "cta", targetStartPct: 88, targetEndPct: 100, weight: 1.0 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "b",
    templateName: "Late-payoff",
    version: "1.0",
    platform: "YouTube Shorts",
    simplicity: 2,
    hookStyle: "Slow start",
    ctaStyle: "Save",
    blueprint: [
      { slot: "hook", targetStartPct: 0, targetEndPct: 8, weight: 0.8 },
      { slot: "context", targetStartPct: 8, targetEndPct: 45, weight: 1.0 },
      { slot: "payoff", targetStartPct: 45, targetEndPct: 82, weight: 1.2 },
      { slot: "pivot", targetStartPct: 82, targetEndPct: 94, weight: 0.9 },
      { slot: "cta", targetStartPct: 94, targetEndPct: 100, weight: 0.9 }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const segments: ManualReplaySegment[] = [
  { id: "1", videoId: "x", startSec: 2, endSec: 8, note: "", createdAt: "" },
  { id: "2", videoId: "x", startSec: 25, endSec: 34, note: "", createdAt: "" },
  { id: "3", videoId: "x", startSec: 46, endSec: 57, note: "", createdAt: "" }
];

describe("validateSegments", () => {
  it("detects overlap and range violations", () => {
    const invalid: ManualReplaySegment[] = [
      { id: "1", videoId: "x", startSec: 0, endSec: 1, note: "", createdAt: "" },
      { id: "2", videoId: "x", startSec: 0.5, endSec: 3, note: "", createdAt: "" }
    ];
    const errors = validateSegments(invalid, 60);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe("rankTemplates", () => {
  it("ranks deterministic top recommendation", () => {
    const ranked = rankTemplates(templates, segments, 60);
    expect(ranked).toHaveLength(2);
    expect(ranked[0].template.id).toBe("a");
    expect(ranked[0].cutSegments[0].segmentType).toBe("hook");
  });
});

