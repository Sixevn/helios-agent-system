import { describe, expect, it } from "vitest";
import { MIN_BASELINE_LOGS_FOR_GATE } from "./constants";
import { generateWeeklyCheckpointSummary } from "./weeklyCheckpointSummary";
import type { BaselineLogEntry, CheckpointOpsState } from "./types";

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createBaselineLogs(count: number): BaselineLogEntry[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return {
      id: `baseline-${index + 1}`,
      date: toLocalDateString(date),
      savesPerThousand: 12 + index,
      completionRate: 40 + index,
      negativeFeedbackRate: 1 + index * 0.1,
      productionMinutes: 25 + index,
      notes: "",
      createdAt: new Date().toISOString()
    };
  });
}

function createPassingCheckpointState(): CheckpointOpsState {
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

describe("generateWeeklyCheckpointSummary markdown gate output", () => {
  it("includes baseline hard-check and gate blockers when logs are below the minimum", () => {
    const summary = generateWeeklyCheckpointSummary(
      [],
      createBaselineLogs(6),
      createPassingCheckpointState(),
      {
        decision: "Improve",
        confidence: "Medium",
        reason: "Need more signal before committing a stable keep decision.",
        nextAction: "Continue one more window of logging.",
        owner: "Helios"
      }
    );

    expect(summary.gateStatus).toBe("Hold");
    expect(summary.markdown).toContain(
      `- Baseline log hard-check (>=${MIN_BASELINE_LOGS_FOR_GATE} in window): Not met (6)`
    );
    expect(summary.markdown).toContain(
      `- Gate blockers: Baseline logs in window must be >= ${MIN_BASELINE_LOGS_FOR_GATE} (current: 6).`
    );
  });
});

