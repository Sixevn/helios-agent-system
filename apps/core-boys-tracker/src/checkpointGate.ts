import { MIN_BASELINE_LOGS_FOR_GATE } from "./constants";
import type { CheckpointOpsState } from "./types";

export interface CheckpointGateEvaluation {
  gateStatus: "Decision-ready" | "Hold";
  gateReady: boolean;
  checklistReady: boolean;
  baselineLogRequirementMet: boolean;
  baselineLogCount: number;
  minimumBaselineLogs: number;
  dataCompletenessMet: boolean;
  srmMet: boolean;
  guardrailMet: boolean;
  blockers: string[];
}

function getChecklistComplete(checkpointState: CheckpointOpsState): boolean {
  return (
    checkpointState.checklistEvidenceCaptured &&
    checkpointState.checklistSampleAdequate &&
    checkpointState.checklistGuardrailsReviewed &&
    checkpointState.checklistDecisionReady
  );
}

export function evaluateCheckpointGate(
  checkpointState: CheckpointOpsState,
  baselineLogCount: number
): CheckpointGateEvaluation {
  const checklistReady = getChecklistComplete(checkpointState);
  const baselineLogRequirementMet = baselineLogCount >= MIN_BASELINE_LOGS_FOR_GATE;
  const dataCompletenessMet = checkpointState.dataCompleteness === "Complete";
  const srmMet = checkpointState.srmStatus !== "Fail";
  const guardrailMet =
    checkpointState.guardrailBreaches === "0" || checkpointState.guardrailBreaches === "1";

  const blockers: string[] = [];
  if (!checklistReady) blockers.push("Checklist is incomplete.");
  if (!baselineLogRequirementMet) {
    blockers.push(
      `Baseline logs in window must be >= ${MIN_BASELINE_LOGS_FOR_GATE} (current: ${baselineLogCount}).`
    );
  }
  if (!dataCompletenessMet) blockers.push("Data completeness must be Complete.");
  if (!srmMet) blockers.push("SRM status must not be Fail.");
  if (!guardrailMet) blockers.push("Guardrail breaches must be 0 or 1.");

  const gateReady =
    checklistReady &&
    baselineLogRequirementMet &&
    dataCompletenessMet &&
    srmMet &&
    guardrailMet;

  return {
    gateStatus: gateReady ? "Decision-ready" : "Hold",
    gateReady,
    checklistReady,
    baselineLogRequirementMet,
    baselineLogCount,
    minimumBaselineLogs: MIN_BASELINE_LOGS_FOR_GATE,
    dataCompletenessMet,
    srmMet,
    guardrailMet,
    blockers
  };
}

