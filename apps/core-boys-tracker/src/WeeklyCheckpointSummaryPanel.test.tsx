import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MIN_BASELINE_LOGS_FOR_GATE } from "./constants";
import WeeklyCheckpointSummaryPanel from "./WeeklyCheckpointSummaryPanel";
import type { BaselineLogEntry, CheckpointOpsState } from "./types";

const { mockLoadCheckpointOps } = vi.hoisted(() => ({
  mockLoadCheckpointOps: vi.fn()
}));

vi.mock("./storage", () => ({
  loadCheckpointOps: mockLoadCheckpointOps
}));

function createCheckpointState(): CheckpointOpsState {
  return {
    windowStartDate: "2026-05-01",
    checkpointDate: "2026-05-07",
    baselineWindowDays: 7,
    currentSavesPerThousand: "18",
    currentCompletionRate: "44",
    currentNegativeFeedbackRate: "1.2",
    currentProductionMinutes: "24",
    srmStatus: "Pass",
    dataCompleteness: "Complete",
    guardrailBreaches: "0",
    checklistEvidenceCaptured: true,
    checklistSampleAdequate: true,
    checklistGuardrailsReviewed: true,
    checklistDecisionReady: true
  };
}

function createBaselineLogs(count: number): BaselineLogEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `baseline-${index + 1}`,
    date: `2026-05-${String(index + 1).padStart(2, "0")}`,
    savesPerThousand: 10 + index,
    completionRate: 40 + index,
    negativeFeedbackRate: 1 + index * 0.1,
    productionMinutes: 25 + index,
    notes: "",
    createdAt: "2026-05-01T00:00:00.000Z"
  }));
}

afterEach(() => {
  mockLoadCheckpointOps.mockReset();
});

describe("WeeklyCheckpointSummaryPanel baseline status chip", () => {
  it("shows 'Need more' when baseline logs are below the minimum", () => {
    const belowMinimum = MIN_BASELINE_LOGS_FOR_GATE - 1;
    mockLoadCheckpointOps.mockReturnValue({
      baselineLogs: createBaselineLogs(belowMinimum),
      checkpointState: createCheckpointState(),
      warningMessage: ""
    });

    const html = renderToStaticMarkup(<WeeklyCheckpointSummaryPanel entries={[]} />);

    expect(html).toContain(`Baseline logs: ${belowMinimum}/${MIN_BASELINE_LOGS_FOR_GATE}`);
    expect(html).toContain("Need more");
  });

  it("shows 'Ready' when baseline logs meet the minimum", () => {
    mockLoadCheckpointOps.mockReturnValue({
      baselineLogs: createBaselineLogs(MIN_BASELINE_LOGS_FOR_GATE),
      checkpointState: createCheckpointState(),
      warningMessage: ""
    });

    const html = renderToStaticMarkup(<WeeklyCheckpointSummaryPanel entries={[]} />);

    expect(html).toContain(
      `Baseline logs: ${MIN_BASELINE_LOGS_FOR_GATE}/${MIN_BASELINE_LOGS_FOR_GATE}`
    );
    expect(html).toContain("Ready");
  });
});

