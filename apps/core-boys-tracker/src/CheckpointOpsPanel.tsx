import { FormEvent, useMemo, useState } from "react";
import { loadCheckpointOps, saveCheckpointOps } from "./storage";
import type { BaselineLogEntry, CheckpointOpsState } from "./types";
import { evaluateCheckpointGate } from "./checkpointGate";

interface BaselineFormState {
  date: string;
  savesPerThousand: string;
  completionRate: string;
  negativeFeedbackRate: string;
  productionMinutes: string;
  notes: string;
}

interface CheckpointOpsPanelProps {
  totalEntries: number;
}

interface BaselineAverages {
  count: number;
  savesPerThousand: number | null;
  completionRate: number | null;
  negativeFeedbackRate: number | null;
  productionMinutes: number | null;
}

const EMPTY_BASELINE_FORM: BaselineFormState = {
  date: "",
  savesPerThousand: "",
  completionRate: "",
  negativeFeedbackRate: "",
  productionMinutes: "",
  notes: ""
};

function parseNonNegativeNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatMetric(value: number | null): string {
  if (value === null) return "-";
  return roundTwo(value).toLocaleString();
}

function formatDelta(value: number | null): string {
  if (value === null) return "N/A";
  const rounded = roundTwo(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function formatUplift(
  baselineValue: number | null,
  currentValue: number | null
): string {
  if (baselineValue === null || currentValue === null || baselineValue <= 0) return "N/A";
  const uplift = ((currentValue - baselineValue) / baselineValue) * 100;
  return `${formatDelta(uplift)}%`;
}

function getLastNDaysAverages(
  logs: BaselineLogEntry[],
  days: 7 | 14
): BaselineAverages {
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

function getInitialWindowStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return date.toISOString().slice(0, 10);
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function CheckpointOpsPanel({
  totalEntries
}: CheckpointOpsPanelProps): JSX.Element {
  const initial = useMemo(() => loadCheckpointOps(), []);
  const [baselineLogs, setBaselineLogs] = useState<BaselineLogEntry[]>(
    initial.baselineLogs
  );
  const [checkpointState, setCheckpointState] = useState<CheckpointOpsState>(() => {
    const loaded = initial.checkpointState;
    return {
      ...loaded,
      windowStartDate: loaded.windowStartDate || getInitialWindowStartDate(),
      checkpointDate: loaded.checkpointDate || getTodayDateString()
    };
  });
  const [baselineForm, setBaselineForm] =
    useState<BaselineFormState>(EMPTY_BASELINE_FORM);
  const [baselineError, setBaselineError] = useState("");
  const [statusMessage, setStatusMessage] = useState(initial.warningMessage);

  const baselineAverages = useMemo(
    () => getLastNDaysAverages(baselineLogs, checkpointState.baselineWindowDays),
    [baselineLogs, checkpointState.baselineWindowDays]
  );

  const currentMetrics = useMemo(
    () => ({
      savesPerThousand: parseNonNegativeNumber(checkpointState.currentSavesPerThousand),
      completionRate: parseNonNegativeNumber(checkpointState.currentCompletionRate),
      negativeFeedbackRate: parseNonNegativeNumber(
        checkpointState.currentNegativeFeedbackRate
      ),
      productionMinutes: parseNonNegativeNumber(checkpointState.currentProductionMinutes)
    }),
    [checkpointState]
  );

  const completionDelta =
    baselineAverages.completionRate === null ||
    currentMetrics.completionRate === null
      ? null
      : currentMetrics.completionRate - baselineAverages.completionRate;

  const negativeFeedbackDelta =
    baselineAverages.negativeFeedbackRate === null ||
    currentMetrics.negativeFeedbackRate === null
      ? null
      : currentMetrics.negativeFeedbackRate - baselineAverages.negativeFeedbackRate;

  const productionTimeDelta =
    baselineAverages.productionMinutes === null ||
    currentMetrics.productionMinutes === null
      ? null
      : currentMetrics.productionMinutes - baselineAverages.productionMinutes;

  const gateEvaluation = useMemo(
    () => evaluateCheckpointGate(checkpointState, baselineAverages.count),
    [checkpointState, baselineAverages.count]
  );
  const gateReady = gateEvaluation.gateReady;

  function persist(nextLogs: BaselineLogEntry[], nextCheckpoint: CheckpointOpsState): void {
    setBaselineLogs(nextLogs);
    setCheckpointState(nextCheckpoint);
    saveCheckpointOps(nextLogs, nextCheckpoint);
  }

  function updateCheckpoint<K extends keyof CheckpointOpsState>(
    field: K,
    value: CheckpointOpsState[K]
  ): void {
    setStatusMessage("");
    const next = { ...checkpointState, [field]: value };
    persist(baselineLogs, next);
  }

  function updateBaselineForm<K extends keyof BaselineFormState>(
    field: K,
    value: BaselineFormState[K]
  ): void {
    setBaselineError("");
    setBaselineForm((previous) => ({ ...previous, [field]: value }));
  }

  function addBaselineLog(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setBaselineError("");
    const saves = parseNonNegativeNumber(baselineForm.savesPerThousand);
    const completion = parseNonNegativeNumber(baselineForm.completionRate);
    const negative = parseNonNegativeNumber(baselineForm.negativeFeedbackRate);
    const production = parseNonNegativeNumber(baselineForm.productionMinutes);

    if (!baselineForm.date || saves === null || completion === null || negative === null || production === null) {
      setBaselineError("Date and all baseline metrics are required.");
      return;
    }

    const newLog: BaselineLogEntry = {
      id: `baseline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: baselineForm.date,
      savesPerThousand: saves,
      completionRate: completion,
      negativeFeedbackRate: negative,
      productionMinutes: production,
      notes: baselineForm.notes.trim(),
      createdAt: new Date().toISOString()
    };

    const nextLogs = [newLog, ...baselineLogs].sort((a, b) => b.date.localeCompare(a.date));
    persist(nextLogs, checkpointState);
    setBaselineForm(EMPTY_BASELINE_FORM);
    setStatusMessage("Baseline log saved.");
  }

  function removeBaselineLog(id: string): void {
    const confirmed = window.confirm("Delete this baseline log entry?");
    if (!confirmed) return;
    const nextLogs = baselineLogs.filter((entry) => entry.id !== id);
    persist(nextLogs, checkpointState);
    setStatusMessage("Baseline log removed.");
  }

  function clearBaselineLogs(): void {
    if (!baselineLogs.length) return;
    const confirmed = window.confirm("Clear all baseline logs?");
    if (!confirmed) return;
    persist([], checkpointState);
    setStatusMessage("All baseline logs cleared.");
  }

  return (
    <section className="panel checkpoint-panel">
      <div className="panel-header">
        <h2>Play Checkpoint Ops</h2>
        <span>{baselineLogs.length} baseline logs</span>
      </div>

      <p className="checkpoint-intro">
        Capture baseline and current metrics so Keep/Improve/Stop decisions are evidence-based.
      </p>

      <p
        className={`baseline-progress-badge ${
          gateEvaluation.baselineLogRequirementMet ? "is-ready" : "is-short"
        }`}
      >
        Baseline logs: {gateEvaluation.baselineLogCount}/{gateEvaluation.minimumBaselineLogs}
        {gateEvaluation.baselineLogRequirementMet ? " Ready" : " Need more"}
      </p>

      {statusMessage ? <p className="review-status">{statusMessage}</p> : null}

      <section className="checkpoint-section">
        <h3>Data Capture Checklist</h3>
        <p className="checkpoint-section-lead">
          Confirm evidence quality before interpreting KPI movement.
        </p>
        <div className="checklist-grid">
          <label>
            <input
              type="checkbox"
              checked={checkpointState.checklistEvidenceCaptured}
              onChange={(event) =>
                updateCheckpoint("checklistEvidenceCaptured", event.target.checked)
              }
            />
            Evidence links captured
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkpointState.checklistSampleAdequate}
              onChange={(event) =>
                updateCheckpoint("checklistSampleAdequate", event.target.checked)
              }
            />
            Sample size adequate
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkpointState.checklistGuardrailsReviewed}
              onChange={(event) =>
                updateCheckpoint("checklistGuardrailsReviewed", event.target.checked)
              }
            />
            Guardrails reviewed
          </label>
          <label>
            <input
              type="checkbox"
              checked={checkpointState.checklistDecisionReady}
              onChange={(event) =>
                updateCheckpoint("checklistDecisionReady", event.target.checked)
              }
            />
            Decision packet ready
          </label>
        </div>
      </section>

      <section className="checkpoint-section">
        <h3>Baseline Logger (7-14 day input pool)</h3>
        <p className="checkpoint-section-lead">
          Add daily observations to stabilize the window before a checkpoint call.
        </p>
        <form className="baseline-form" onSubmit={addBaselineLog}>
          <label>
            Date *
            <input
              type="date"
              value={baselineForm.date}
              onChange={(event) => updateBaselineForm("date", event.target.value)}
            />
          </label>

          <label>
            Saves / 1,000 impressions *
            <input
              inputMode="decimal"
              value={baselineForm.savesPerThousand}
              onChange={(event) =>
                updateBaselineForm("savesPerThousand", event.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Completion rate (%) *
            <input
              inputMode="decimal"
              value={baselineForm.completionRate}
              onChange={(event) =>
                updateBaselineForm("completionRate", event.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Negative feedback rate (%) *
            <input
              inputMode="decimal"
              value={baselineForm.negativeFeedbackRate}
              onChange={(event) =>
                updateBaselineForm("negativeFeedbackRate", event.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            Production time / asset (minutes) *
            <input
              inputMode="decimal"
              value={baselineForm.productionMinutes}
              onChange={(event) =>
                updateBaselineForm("productionMinutes", event.target.value)
              }
              placeholder="0"
            />
          </label>

          <label className="full-width">
            Notes
            <input
              value={baselineForm.notes}
              onChange={(event) => updateBaselineForm("notes", event.target.value)}
              placeholder="Optional context"
            />
          </label>

          {baselineError ? <p className="error full-width">{baselineError}</p> : null}
          <button type="submit" className="submit-button full-width">
            Save Baseline Log
          </button>
        </form>

        {baselineLogs.length === 0 ? (
          <div className="empty-state">
            <h3>No baseline logs yet</h3>
            <p>Log daily metrics for 7 to 14 days to unlock a stable baseline.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Saves/1,000</th>
                  <th>Completion %</th>
                  <th>Negative %</th>
                  <th>Production min</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {baselineLogs.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.savesPerThousand}</td>
                    <td>{entry.completionRate}</td>
                    <td>{entry.negativeFeedbackRate}</td>
                    <td>{entry.productionMinutes}</td>
                    <td>{entry.notes || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="row-button delete"
                        onClick={() => removeBaselineLog(entry.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="checkpoint-actions">
          <button type="button" className="clear-button" onClick={clearBaselineLogs}>
            Clear baseline logs
          </button>
          <span>
            Current content entries: <strong>{totalEntries}</strong>
          </span>
        </div>
      </section>

      <section className="checkpoint-section">
        <h3>Checkpoint Calculator</h3>
        <p className="checkpoint-section-lead">
          Compare current performance against baseline and verify every gate condition.
        </p>
        <div className="checkpoint-form-grid">
          <label>
            Window start date
            <input
              type="date"
              value={checkpointState.windowStartDate}
              onChange={(event) => updateCheckpoint("windowStartDate", event.target.value)}
            />
          </label>
          <label>
            Checkpoint date
            <input
              type="date"
              value={checkpointState.checkpointDate}
              onChange={(event) => updateCheckpoint("checkpointDate", event.target.value)}
            />
          </label>
          <label>
            Baseline window
            <select
              value={checkpointState.baselineWindowDays}
              onChange={(event) =>
                updateCheckpoint(
                  "baselineWindowDays",
                  Number(event.target.value) === 14 ? 14 : 7
                )
              }
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
            </select>
          </label>
          <label>
            SRM status
            <select
              value={checkpointState.srmStatus}
              onChange={(event) =>
                updateCheckpoint("srmStatus", event.target.value as CheckpointOpsState["srmStatus"])
              }
            >
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
              <option value="N/A">N/A</option>
            </select>
          </label>
          <label>
            Data completeness
            <select
              value={checkpointState.dataCompleteness}
              onChange={(event) =>
                updateCheckpoint(
                  "dataCompleteness",
                  event.target.value as CheckpointOpsState["dataCompleteness"]
                )
              }
            >
              <option value="Complete">Complete</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </label>
          <label>
            Guardrail breaches
            <select
              value={checkpointState.guardrailBreaches}
              onChange={(event) =>
                updateCheckpoint(
                  "guardrailBreaches",
                  event.target.value as CheckpointOpsState["guardrailBreaches"]
                )
              }
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>
        </div>

        <div className="checkpoint-form-grid">
          <label>
            Current saves / 1,000
            <input
              inputMode="decimal"
              value={checkpointState.currentSavesPerThousand}
              onChange={(event) =>
                updateCheckpoint("currentSavesPerThousand", event.target.value)
              }
              placeholder="0"
            />
          </label>
          <label>
            Current completion rate (%)
            <input
              inputMode="decimal"
              value={checkpointState.currentCompletionRate}
              onChange={(event) =>
                updateCheckpoint("currentCompletionRate", event.target.value)
              }
              placeholder="0"
            />
          </label>
          <label>
            Current negative feedback rate (%)
            <input
              inputMode="decimal"
              value={checkpointState.currentNegativeFeedbackRate}
              onChange={(event) =>
                updateCheckpoint("currentNegativeFeedbackRate", event.target.value)
              }
              placeholder="0"
            />
          </label>
          <label>
            Current production time (minutes)
            <input
              inputMode="decimal"
              value={checkpointState.currentProductionMinutes}
              onChange={(event) =>
                updateCheckpoint("currentProductionMinutes", event.target.value)
              }
              placeholder="0"
            />
          </label>
        </div>

        <div className="kpi-rollup-cards">
          <article className="kpi-rollup-card">
            <h3>Baseline Logs in Window</h3>
            <p>{baselineAverages.count}</p>
          </article>
          <article className="kpi-rollup-card">
            <h3>Baseline Saves / 1,000</h3>
            <p>{formatMetric(baselineAverages.savesPerThousand)}</p>
          </article>
          <article className="kpi-rollup-card">
            <h3>Current Saves / 1,000</h3>
            <p>{formatMetric(currentMetrics.savesPerThousand)}</p>
          </article>
          <article className="kpi-rollup-card">
            <h3>Primary Metric Uplift</h3>
            <p>{formatUplift(baselineAverages.savesPerThousand, currentMetrics.savesPerThousand)}</p>
          </article>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Baseline</th>
                <th>Current</th>
                <th>Delta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Completion rate (%)</td>
                <td>{formatMetric(baselineAverages.completionRate)}</td>
                <td>{formatMetric(currentMetrics.completionRate)}</td>
                <td>{formatDelta(completionDelta)} pp</td>
              </tr>
              <tr>
                <td>Negative feedback rate (%)</td>
                <td>{formatMetric(baselineAverages.negativeFeedbackRate)}</td>
                <td>{formatMetric(currentMetrics.negativeFeedbackRate)}</td>
                <td>{formatDelta(negativeFeedbackDelta)} pp</td>
              </tr>
              <tr>
                <td>Production time (minutes)</td>
                <td>{formatMetric(baselineAverages.productionMinutes)}</td>
                <td>{formatMetric(currentMetrics.productionMinutes)}</td>
                <td>{formatDelta(productionTimeDelta)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className={`checkpoint-gate ${gateReady ? "gate-pass" : "gate-hold"}`}>
          Gate Status:{" "}
          {gateReady
            ? "Decision-ready (eligible for Keep/Improve/Stop review)"
            : `Hold (${gateEvaluation.blockers.join(" ")})`}
        </p>
      </section>
    </section>
  );
}
