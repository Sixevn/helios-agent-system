import { describe, expect, it } from "vitest";
import { evaluateCheckpointGate } from "./checkpointGate";
import type { CheckpointOpsState } from "./types";

function createPassingCheckpointState(): CheckpointOpsState {
  return {
    windowStartDate: "2026-05-01",
    checkpointDate: "2026-05-07",
    baselineWindowDays: 7,
    currentSavesPerThousand: "18",
    currentCompletionRate: "42",
    currentNegativeFeedbackRate: "1.1",
    currentProductionMinutes: "26",
    srmStatus: "Pass",
    dataCompleteness: "Complete",
    guardrailBreaches: "0",
    checklistEvidenceCaptured: true,
    checklistSampleAdequate: true,
    checklistGuardrailsReviewed: true,
    checklistDecisionReady: true
  };
}

describe("evaluateCheckpointGate baseline hard-check", () => {
  it("returns Hold when baseline logs are 6", () => {
    const result = evaluateCheckpointGate(createPassingCheckpointState(), 6);

    expect(result.gateStatus).toBe("Hold");
    expect(result.baselineLogRequirementMet).toBe(false);
  });

  it("returns Decision-ready when baseline logs are 7 and all other checks pass", () => {
    const result = evaluateCheckpointGate(createPassingCheckpointState(), 7);

    expect(result.gateStatus).toBe("Decision-ready");
    expect(result.baselineLogRequirementMet).toBe(true);
    expect(result.blockers).toHaveLength(0);
  });

  it("returns Hold when SRM fails even with 7 baseline logs", () => {
    const result = evaluateCheckpointGate(
      { ...createPassingCheckpointState(), srmStatus: "Fail" },
      7
    );

    expect(result.gateStatus).toBe("Hold");
    expect(result.baselineLogRequirementMet).toBe(true);
    expect(result.srmMet).toBe(false);
    expect(result.blockers).toContain("SRM status must not be Fail.");
  });

  it("returns Hold when guardrail breaches are 2 even with 7 baseline logs", () => {
    const result = evaluateCheckpointGate(
      { ...createPassingCheckpointState(), guardrailBreaches: "2" },
      7
    );

    expect(result.gateStatus).toBe("Hold");
    expect(result.baselineLogRequirementMet).toBe(true);
    expect(result.guardrailMet).toBe(false);
    expect(result.blockers).toContain("Guardrail breaches must be 0 or 1.");
  });
});
