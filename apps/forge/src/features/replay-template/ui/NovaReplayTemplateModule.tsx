import { FormEvent, useMemo, useState } from "react";
import {
  buildEditorBrief,
  rankTemplates,
  validateSegments
} from "../services/recommendationEngine";
import { parseYouTubeVideoId } from "../services/videoId";
import {
  loadReplayTemplateStore,
  replaceVideoSegments,
  saveRecommendations,
  saveReplayTemplateStore,
  upsertVideoRecord
} from "../services/storage";
import type {
  ManualReplaySegment,
  RecommendationRecord,
  ReplayTemplateStore
} from "../types";

interface SegmentFormState {
  startSec: string;
  endSec: string;
  note: string;
}

const EMPTY_SEGMENT: SegmentFormState = {
  startSec: "",
  endSec: "",
  note: ""
};

function nowIso(): string {
  return new Date().toISOString();
}

function parseNumber(value: string): number | null {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export default function NovaReplayTemplateModule(): JSX.Element {
  const [store, setStore] = useState<ReplayTemplateStore>(() => loadReplayTemplateStore());
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDurationSec, setVideoDurationSec] = useState("60");
  const [segmentForm, setSegmentForm] = useState<SegmentFormState>(EMPTY_SEGMENT);
  const [segments, setSegments] = useState<ManualReplaySegment[]>([]);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [brief, setBrief] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const videoId = useMemo(() => parseYouTubeVideoId(videoUrl), [videoUrl]);
  const durationSec = parseNumber(videoDurationSec) ?? 0;

  const recentElapsed = useMemo(
    () => store.recommendations.slice(0, 10).map((item) => item.elapsedSeconds),
    [store.recommendations]
  );

  function updateAndPersist(next: ReplayTemplateStore): void {
    setStore(next);
    saveReplayTemplateStore(next);
  }

  function startFlowIfNeeded(): void {
    if (startedAt === null) setStartedAt(Date.now());
  }

  function addSegment(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");
    startFlowIfNeeded();

    if (!videoId) {
      setError("Paste a valid YouTube URL or 11-char video ID first.");
      return;
    }
    if (!durationSec || durationSec <= 0) {
      setError("Enter a valid video duration in seconds.");
      return;
    }

    const start = parseNumber(segmentForm.startSec);
    const end = parseNumber(segmentForm.endSec);
    if (start === null || end === null) {
      setError("Start and end timestamps are required.");
      return;
    }

    const candidate: ManualReplaySegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      videoId,
      startSec: start,
      endSec: end,
      note: segmentForm.note.trim(),
      createdAt: nowIso()
    };

    const nextSegments = [...segments, candidate].sort((a, b) => a.startSec - b.startSec);
    const validation = validateSegments(nextSegments, durationSec);
    if (validation.length) {
      setError(validation[0].message);
      return;
    }

    setSegments(nextSegments);
    setSegmentForm(EMPTY_SEGMENT);
  }

  function removeSegment(id: string): void {
    setSegments((previous) => previous.filter((item) => item.id !== id));
  }

  async function generateAndCopyBrief(): Promise<void> {
    setError("");
    setCopyStatus("");
    if (!videoId) {
      setError("Video URL/ID is required.");
      return;
    }
    if (!durationSec || durationSec <= 0) {
      setError("Duration must be greater than 0.");
      return;
    }
    if (segments.length < 3) {
      setError("Add at least 3 replay segments for a stable recommendation.");
      return;
    }

    const validation = validateSegments(segments, durationSec);
    if (validation.length) {
      setError(validation[0].message);
      return;
    }

    const ranked = rankTemplates(store.templates, segments, durationSec);
    const elapsed = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 1000)) : 0;
    setElapsedSeconds(elapsed);

    const briefText = buildEditorBrief(videoId, ranked, elapsed);
    setBrief(briefText);

    const videoRecord = {
      id: videoId,
      videoUrl,
      title: videoTitle.trim() || `Video ${videoId}`,
      durationSec,
      createdAt: nowIso()
    };

    const recommendationRows: RecommendationRecord[] = ranked.map((entry, index) => ({
      id: `rec-${Date.now()}-${index}`,
      videoId,
      templateId: entry.template.id,
      templateName: entry.template.templateName,
      rank: index + 1,
      totalScore: entry.totalScore,
      reasons: entry.reasons,
      cutSegments: entry.cutSegments,
      createdAt: nowIso(),
      elapsedSeconds: elapsed
    }));

    let nextStore = upsertVideoRecord(store, videoRecord);
    nextStore = replaceVideoSegments(nextStore, videoId, segments);
    nextStore = saveRecommendations(nextStore, videoId, recommendationRows);
    updateAndPersist(nextStore);

    try {
      await navigator.clipboard.writeText(briefText);
      setCopyStatus("Edit brief copied to clipboard.");
    } catch {
      setCopyStatus("Brief generated. Clipboard copy blocked in this browser.");
    }
  }

  return (
    <section className="analytics-dashboard replay-module">
      <header className="analytics-header">
        <div>
          <h1>Nova Replay-to-Template v1</h1>
          <p>
            Manual Most Replayed intake from YouTube UI. Atlas is architecture label only in v1;
            Forge runtime flow executes intake, scoring, and recommendation generation.
          </p>
        </div>
      </header>

      <div className="metric-grid replay-metrics">
        <article className="metric-card">
          <span>Median Time (URL to Copy Brief)</span>
          <strong>{median(recentElapsed)}s</strong>
        </article>
        <article className="metric-card">
          <span>Current Flow Time</span>
          <strong>{elapsedSeconds || "-"}</strong>
        </article>
        <article className="metric-card">
          <span>Target</span>
          <strong>{"<= 300s"}</strong>
        </article>
      </div>

      <section className="panel-grid">
        <article className="panel">
          <h2>1) Video Intake</h2>
          <label>
            YouTube URL or Video ID
            <input
              value={videoUrl}
              onChange={(event) => {
                setVideoUrl(event.target.value);
                startFlowIfNeeded();
              }}
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </label>
          <label>
            Video title (optional)
            <input
              value={videoTitle}
              onChange={(event) => setVideoTitle(event.target.value)}
              placeholder="Optional human-readable title"
            />
          </label>
          <label>
            Duration (seconds)
            <input
              value={videoDurationSec}
              onChange={(event) => setVideoDurationSec(event.target.value)}
              inputMode="numeric"
            />
          </label>
          <p className="status-line">Parsed video ID: {videoId ?? "Invalid / missing"}</p>
        </article>

        <article className="panel">
          <h2>2) Manual Most Replayed Segments</h2>
          <form className="form-grid" onSubmit={addSegment}>
            <label>
              Start sec
              <input
                value={segmentForm.startSec}
                onChange={(event) =>
                  setSegmentForm((prev) => ({ ...prev, startSec: event.target.value }))
                }
                inputMode="numeric"
              />
            </label>
            <label>
              End sec
              <input
                value={segmentForm.endSec}
                onChange={(event) =>
                  setSegmentForm((prev) => ({ ...prev, endSec: event.target.value }))
                }
                inputMode="numeric"
              />
            </label>
            <label className="full-width">
              Note (optional)
              <input
                value={segmentForm.note}
                onChange={(event) =>
                  setSegmentForm((prev) => ({ ...prev, note: event.target.value }))
                }
                placeholder="What happens in this replay spike?"
              />
            </label>
            <button type="submit" className="primary-button">
              Add Segment
            </button>
          </form>

          {segments.length ? (
            <ul className="segment-list">
              {segments.map((segment) => (
                <li key={segment.id}>
                  <span>
                    {segment.startSec}s-{segment.endSec}s {segment.note ? `- ${segment.note}` : ""}
                  </span>
                  <button type="button" onClick={() => removeSegment(segment.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="status-line">No segments added yet.</p>
          )}
        </article>
      </section>

      <section className="panel">
        <h2>3) Recommend Template + 4) Copy Brief</h2>
        <button type="button" className="primary-button" onClick={generateAndCopyBrief}>
          Generate & Copy Edit Brief
        </button>
        {error ? <p className="error-line">{error}</p> : null}
        {copyStatus ? <p className="status-line">{copyStatus}</p> : null}
        {brief ? <pre className="brief-output">{brief}</pre> : null}
      </section>
    </section>
  );
}
