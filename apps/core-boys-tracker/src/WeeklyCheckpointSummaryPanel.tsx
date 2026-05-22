import { useState } from "react";
import { MIN_BASELINE_LOGS_FOR_GATE } from "./constants";
import { loadCheckpointOps } from "./storage";
import type { ContentEntry } from "./types";
import {
  generateWeeklyCheckpointSummary,
  type WeeklyCheckpointSummaryResult
} from "./weeklyCheckpointSummary";

interface WeeklyCheckpointSummaryPanelProps {
  entries: ContentEntry[];
}

type DecisionChoice = "Keep" | "Improve" | "Stop";
type ConfidenceChoice = "Low" | "Medium" | "High";

export default function WeeklyCheckpointSummaryPanel({
  entries
}: WeeklyCheckpointSummaryPanelProps): JSX.Element {
  const [baselineLogCount, setBaselineLogCount] = useState<number>(() => {
    return loadCheckpointOps().baselineLogs.length;
  });
  const [decision, setDecision] = useState<DecisionChoice>("Improve");
  const [confidence, setConfidence] = useState<ConfidenceChoice>("Medium");
  const [reason, setReason] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [owner, setOwner] = useState("Helios");
  const [result, setResult] = useState<WeeklyCheckpointSummaryResult | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const baselineLogRequirementMet = baselineLogCount >= MIN_BASELINE_LOGS_FOR_GATE;

  function generateSummary(): void {
    setError("");
    setCopyStatus("");
    const checkpoint = loadCheckpointOps();
    setBaselineLogCount(checkpoint.baselineLogs.length);
    if (checkpoint.warningMessage) {
      setError(checkpoint.warningMessage);
      return;
    }

    try {
      const summary = generateWeeklyCheckpointSummary(
        entries,
        checkpoint.baselineLogs,
        checkpoint.checkpointState,
        {
          decision,
          confidence,
          reason,
          nextAction,
          owner
        }
      );
      setResult(summary);
    } catch {
      setError("Unable to generate checkpoint summary from local data.");
    }
  }

  async function copyMarkdown(): Promise<void> {
    if (!result) return;
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopyStatus("Checkpoint summary copied as markdown.");
    } catch {
      setCopyStatus("Copy failed in this browser. You can copy from the panel manually.");
    }
  }

  return (
    <section className="panel weekly-checkpoint-summary-panel">
      <div className="panel-header">
        <h2>Weekly Checkpoint Summary</h2>
        <div className="panel-header-meta">
          <span>Local automation output</span>
          <p
            className={`baseline-progress-badge ${
              baselineLogRequirementMet ? "is-ready" : "is-short"
            }`}
          >
            Baseline logs: {baselineLogCount}/{MIN_BASELINE_LOGS_FOR_GATE}
            {baselineLogRequirementMet ? " Ready" : " Need more"}
          </p>
        </div>
      </div>

      <p className="checkpoint-intro summary-intro">
        Convert this week&apos;s signals into a clear Keep/Improve/Stop call with confidence,
        context, and one concrete next action.
      </p>

      <div className="checkpoint-summary-form">
        <label>
          Decision
          <select value={decision} onChange={(event) => setDecision(event.target.value as DecisionChoice)}>
            <option value="Keep">Keep</option>
            <option value="Improve">Improve</option>
            <option value="Stop">Stop</option>
          </select>
        </label>

        <label>
          Confidence
          <select
            value={confidence}
            onChange={(event) => setConfidence(event.target.value as ConfidenceChoice)}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          Owner
          <input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Helios" />
        </label>

        <label className="full-width">
          Reason
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            placeholder="Why this decision now"
          />
        </label>

        <label className="full-width">
          Next action
          <textarea
            value={nextAction}
            onChange={(event) => setNextAction(event.target.value)}
            rows={3}
            placeholder="Single next action for the next window"
          />
        </label>
      </div>

      <div className="checkpoint-summary-actions">
        <button type="button" className="submit-button" onClick={generateSummary}>
          Generate Checkpoint Summary
        </button>
        {result ? (
          <button type="button" className="clear-button" onClick={copyMarkdown}>
            Copy Markdown
          </button>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}
      {copyStatus ? <p className="review-status">{copyStatus}</p> : null}

      {!result ? (
        <div className="empty-state">
          <h3>No checkpoint summary generated yet.</h3>
          <p>Generate a summary after your checkpoint data is updated.</p>
        </div>
      ) : (
        <div className="summary-output">
          <p className={`checkpoint-gate ${result.gateStatus === "Decision-ready" ? "gate-pass" : "gate-hold"}`}>
            Gate Status: {result.gateStatus}
          </p>
          <pre className="summary-markdown">{result.markdown}</pre>
        </div>
      )}
    </section>
  );
}
