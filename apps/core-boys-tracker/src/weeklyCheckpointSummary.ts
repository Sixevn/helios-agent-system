import type { BaselineLogEntry, CheckpointOpsState, ContentEntry } from "./types";
import { MIN_BASELINE_LOGS_FOR_GATE } from "./constants";
import { evaluateCheckpointGate } from "./checkpointGate";

export interface WeeklyDecisionInput {
  decision: "Keep" | "Improve" | "Stop";
  confidence: "Low" | "Medium" | "High";
  reason: string;
  nextAction: string;
  owner: string;
}

export interface WeeklyCheckpointSummaryResult {
  gateStatus: "Decision-ready" | "Hold";
  markdown: string;
}

interface BaselineAverages {
  count: number;
  savesPerThousand: number | null;
  completionRate: number | null;
  negativeFeedbackRate: number | null;
  productionMinutes: number | null;
}

interface CurrentMetrics {
  savesPerThousand: number | null;
  completionRate: number | null;
  negativeFeedbackRate: number | null;
  productionMinutes: number | null;
}

function parseNonNegativeNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function toMetricText(value: number | null): string {
  if (value === null) return "N/A";
  return String(roundTwo(value));
}

function toDeltaText(value: number | null): string {
  if (value === null) return "N/A";
  const rounded = roundTwo(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function toUpliftText(baselineValue: number | null, currentValue: number | null): string {
  if (baselineValue === null || currentValue === null || baselineValue <= 0) return "N/A";
  const uplift = ((currentValue - baselineValue) / baselineValue) * 100;
  return `${toDeltaText(uplift)}%`;
}

function getLastNDaysAverages(logs: BaselineLogEntry[], days: 7 | 14): BaselineAverages {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const selected = logs.filter((entry) => {
    const date = new Date(`${entry.date}T00:00:00`);
    if (Number.isNaN(date.getTime())) return false;
    return date >= start && date <= today;
  });

  if (selected.length === 0) {
    return {
      count: 0,
      savesPerThousand: null,
      completionRate: null,
      negativeFeedbackRate: null,
      productionMinutes: null
    };
  }

  const count = selected.length;
  const sums = selected.reduce(
    (accumulator, entry) => {
      return {
        savesPerThousand: accumulator.savesPerThousand + entry.savesPerThousand,
        completionRate: accumulator.completionRate + entry.completionRate,
        negativeFeedbackRate: accumulator.negativeFeedbackRate + entry.negativeFeedbackRate,
        productionMinutes: accumulator.productionMinutes + entry.productionMinutes
      };
    },
    {
      savesPerThousand: 0,
      completionRate: 0,
      negativeFeedbackRate: 0,
      productionMinutes: 0
    }
  );

  return {
    count,
    savesPerThousand: sums.savesPerThousand / count,
    completionRate: sums.completionRate / count,
    negativeFeedbackRate: sums.negativeFeedbackRate / count,
    productionMinutes: sums.productionMinutes / count
  };
}

function getCurrentMetrics(checkpointState: CheckpointOpsState): CurrentMetrics {
  return {
    savesPerThousand: parseNonNegativeNumber(checkpointState.currentSavesPerThousand),
    completionRate: parseNonNegativeNumber(checkpointState.currentCompletionRate),
    negativeFeedbackRate: parseNonNegativeNumber(checkpointState.currentNegativeFeedbackRate),
    productionMinutes: parseNonNegativeNumber(checkpointState.currentProductionMinutes)
  };
}

export function getCheckpointGateStatus(
  checkpointState: CheckpointOpsState,
  baselineLogCount: number
): "Decision-ready" | "Hold" {
  return evaluateCheckpointGate(checkpointState, baselineLogCount).gateStatus;
}

export function generateWeeklyCheckpointSummary(
  entries: ContentEntry[],
  baselineLogs: BaselineLogEntry[],
  checkpointState: CheckpointOpsState,
  decisionInput: WeeklyDecisionInput
): WeeklyCheckpointSummaryResult {
  const baselineAverages = getLastNDaysAverages(baselineLogs, checkpointState.baselineWindowDays);
  const current = getCurrentMetrics(checkpointState);
  const gateEvaluation = evaluateCheckpointGate(checkpointState, baselineAverages.count);
  const gateStatus = gateEvaluation.gateStatus;
  const baselineLogRequirementMet = gateEvaluation.baselineLogRequirementMet;

  const completionDelta =
    baselineAverages.completionRate === null || current.completionRate === null
      ? null
      : current.completionRate - baselineAverages.completionRate;
  const negativeDelta =
    baselineAverages.negativeFeedbackRate === null || current.negativeFeedbackRate === null
      ? null
      : current.negativeFeedbackRate - baselineAverages.negativeFeedbackRate;
  const productionDelta =
    baselineAverages.productionMinutes === null || current.productionMinutes === null
      ? null
      : current.productionMinutes - baselineAverages.productionMinutes;

  const totalEntries = entries.length;
  const readyToPost = entries.filter((entry) => entry.status === "Ready").length;
  const postedReviewed = entries.filter(
    (entry) => entry.status === "Posted" || entry.status === "Reviewed"
  ).length;
  const totalViews = entries.reduce((sum, entry) => sum + (entry.views ?? 0), 0);

  const markdown = [
    "# Weekly Checkpoint Summary",
    "",
    "## Week Window",
    `- Window start date: ${checkpointState.windowStartDate || "N/A"}`,
    `- Checkpoint date: ${checkpointState.checkpointDate || "N/A"}`,
    "",
    "## Data Readiness",
    `- SRM status: ${checkpointState.srmStatus}`,
    `- Data completeness: ${checkpointState.dataCompleteness}`,
    `- Guardrail breaches: ${checkpointState.guardrailBreaches}`,
    `- Baseline log hard-check (>=${MIN_BASELINE_LOGS_FOR_GATE} in window): ${baselineLogRequirementMet ? "Met" : "Not met"} (${baselineAverages.count})`,
    `- Checklist completion:`,
    `  - Evidence captured: ${checkpointState.checklistEvidenceCaptured ? "Yes" : "No"}`,
    `  - Sample adequate: ${checkpointState.checklistSampleAdequate ? "Yes" : "No"}`,
    `  - Guardrails reviewed: ${checkpointState.checklistGuardrailsReviewed ? "Yes" : "No"}`,
    `  - Decision packet ready: ${checkpointState.checklistDecisionReady ? "Yes" : "No"}`,
    `- Gate status: ${gateStatus}`,
    `- Gate blockers: ${gateEvaluation.blockers.length > 0 ? gateEvaluation.blockers.join(" ") : "None"}`,
    "",
    "## Baseline vs Current Metrics",
    `- Baseline window days: ${checkpointState.baselineWindowDays}`,
    `- Baseline logs in window: ${baselineAverages.count}`,
    `- Saves per 1,000: baseline ${toMetricText(baselineAverages.savesPerThousand)} | current ${toMetricText(current.savesPerThousand)} | uplift ${toUpliftText(baselineAverages.savesPerThousand, current.savesPerThousand)}`,
    `- Completion rate (%): baseline ${toMetricText(baselineAverages.completionRate)} | current ${toMetricText(current.completionRate)} | delta ${toDeltaText(completionDelta)} pp`,
    `- Negative feedback rate (%): baseline ${toMetricText(baselineAverages.negativeFeedbackRate)} | current ${toMetricText(current.negativeFeedbackRate)} | delta ${toDeltaText(negativeDelta)} pp`,
    `- Production time (minutes): baseline ${toMetricText(baselineAverages.productionMinutes)} | current ${toMetricText(current.productionMinutes)} | delta ${toDeltaText(productionDelta)}`,
    "",
    "## Tracker Context",
    `- Total entries: ${totalEntries}`,
    `- Ready to post: ${readyToPost}`,
    `- Posted/reviewed: ${postedReviewed}`,
    `- Total views: ${totalViews}`,
    "",
    "## Helios Decision Block",
    `- Decision: ${decisionInput.decision}`,
    `- Confidence: ${decisionInput.confidence}`,
    `- Reason: ${decisionInput.reason.trim() || "N/A"}`,
    `- Next action: ${decisionInput.nextAction.trim() || "N/A"}`,
    `- Owner: ${decisionInput.owner.trim() || "N/A"}`
  ].join("\n");

  return { gateStatus, markdown };
}
