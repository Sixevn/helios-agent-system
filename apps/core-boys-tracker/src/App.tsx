import { FormEvent, useMemo, useState } from "react";
import {
  CLIP_CATEGORIES,
  CREATORS,
  EMPTY_FORM,
  LANGUAGES,
  PLATFORMS,
  STATUSES
} from "./constants";
import {
  loadEntries,
  saveCapcutTemplates,
  saveCheckpointOps,
  saveEntries
} from "./storage";
import type {
  CapcutTemplateEntry,
  BaselineLogEntry,
  CheckpointOpsState,
  ContentEntry,
  FormState,
  Status
} from "./types";
import { generateWeeklyReview } from "./weeklyReview";
import type { WeeklyReviewResult } from "./weeklyReview";
import CapcutTemplateTracker from "./CapcutTemplateTracker";
import KpiTrackerPanel from "./KpiTrackerPanel";
import CheckpointOpsPanel from "./CheckpointOpsPanel";
import WeeklyCheckpointSummaryPanel from "./WeeklyCheckpointSummaryPanel";
import { createDemoScenario, createEmptyCheckpointState } from "./demoScenario";

type FilterState = {
  creator: string;
  platform: string;
  status: "all" | Status;
};

type AgentId = "helios" | "atlas" | "orion" | "nova";
type LaneId = "nova" | "atlas" | "orion" | "helios";

interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  voiceLine: string;
}

const INITIAL_FILTERS: FilterState = {
  creator: "all",
  platform: "all",
  status: "all"
};

const AGENT_PROFILES: AgentProfile[] = [
  {
    id: "helios",
    name: "Helios",
    role: "Decision captain",
    voiceLine: "I arbitrate Keep, Improve, or Stop with clean evidence and steady intent."
  },
  {
    id: "atlas",
    name: "Atlas",
    role: "Signal steward",
    voiceLine: "I guard metric integrity and surface the trendline that matters right now."
  },
  {
    id: "orion",
    name: "Orion",
    role: "Experiment navigator",
    voiceLine: "I turn weekly learnings into tight next actions the team can execute quickly."
  },
  {
    id: "nova",
    name: "Nova",
    role: "Creative pulse",
    voiceLine: "I shape hooks, edits, and templates so every output feels intentional."
  }
];

const LANE_SIGNALS: Record<AgentId, Record<LaneId, string>> = {
  helios: {
    nova: "Prioritize concepts with measurable win conditions before pushing to queue.",
    atlas: "Track only metrics that change decisions this week: saves, completion, and negative rate.",
    orion: "Force one explicit next action from every review output.",
    helios: "Gate discipline first: evidence, sample, guardrails, then decision packet."
  },
  atlas: {
    nova: "Attach a testable hypothesis tag to each draft hook.",
    atlas: "Protect data quality and surface the strongest trendline quickly.",
    orion: "Summaries should separate signal from narrative without ambiguity.",
    helios: "Checkpoint values must be internally consistent before calling decision-ready."
  },
  orion: {
    nova: "Shape experiments as short loops with tight post-run feedback.",
    atlas: "Use trend shifts to choose the next experiment, not vanity spikes.",
    orion: "Convert lessons into execution steps the team can run tomorrow.",
    helios: "Decision blocks need owner, timing, and clear confidence rationale."
  },
  nova: {
    nova: "Lead with personality-first hooks, then tighten into repeatable templates.",
    atlas: "Let high-retention creative patterns inform the next creative swing.",
    orion: "Use storytelling rhythm to make reviews actionable and memorable.",
    helios: "Polish the packet so strategic decisions still feel human and clear."
  }
};

function parseMetric(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return undefined;
  return parsed;
}

function metricToFormValue(value: number | undefined): string {
  return value === undefined ? "" : String(value);
}

function requiresValue(value: string): boolean {
  return value.trim().length > 0;
}

function resolveCreatorValue(form: FormState): string {
  return form.creator === "Other" ? form.creatorCustom.trim() : form.creator.trim();
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDefaultReviewWindow(): { startDate: string; endDate: string } {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 6);
  return {
    startDate: formatDateInput(startDate),
    endDate: formatDateInput(endDate)
  };
}

export default function App(): JSX.Element {
  const initialLoad = useMemo(() => loadEntries(), []);
  const defaultReviewWindow = useMemo(() => createDefaultReviewWindow(), []);
  const [entries, setEntries] = useState<ContentEntry[]>(initialLoad.entries);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [storageWarning] = useState(initialLoad.warningMessage);
  const [reviewStartDate, setReviewStartDate] = useState(defaultReviewWindow.startDate);
  const [reviewEndDate, setReviewEndDate] = useState(defaultReviewWindow.endDate);
  const [reviewResult, setReviewResult] = useState<WeeklyReviewResult | null>(null);
  const [reviewError, setReviewError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>("helios");
  const [workspaceStatus, setWorkspaceStatus] = useState("");
  const [dataRevision, setDataRevision] = useState(0);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return sortedEntries.filter((entry) => {
      const creatorMatch = filters.creator === "all" || entry.creator === filters.creator;
      const platformMatch = filters.platform === "all" || entry.platform === filters.platform;
      const statusMatch = filters.status === "all" || entry.status === filters.status;
      return creatorMatch && platformMatch && statusMatch;
    });
  }, [sortedEntries, filters]);

  const creatorOptions = useMemo(() => {
    const set = new Set<string>(CREATORS);
    for (const entry of entries) set.add(entry.creator);
    return [...set];
  }, [entries]);

  const kpis = useMemo(() => {
    const totalEntries = entries.length;
    const readyToPost = entries.filter((entry) => entry.status === "Ready").length;
    const postedEntries = entries.filter(
      (entry) => entry.status === "Posted" || entry.status === "Reviewed"
    ).length;
    const totalViews = entries.reduce((sum, entry) => sum + (entry.views ?? 0), 0);
    return { totalEntries, readyToPost, postedEntries, totalViews };
  }, [entries]);

  const activeAgent =
    AGENT_PROFILES.find((agent) => agent.id === activeAgentId) ?? AGENT_PROFILES[0];

  function getLaneSignal(lane: LaneId): string {
    return LANE_SIGNALS[activeAgentId][lane];
  }

  function applyDemoScenario(): void {
    const confirmed = window.confirm(
      "Load demo scenario data across tracker, templates, and checkpoint panels? This will replace current local data."
    );
    if (!confirmed) return;

    const demo = createDemoScenario();
    persist(demo.entries);
    saveCapcutTemplates(demo.templates);
    saveCheckpointOps(demo.baselineLogs, demo.checkpointState);
    setDataRevision((previous) => previous + 1);
    setWorkspaceStatus(
      `Demo scenario loaded: ${demo.entries.length} content entries, ${demo.templates.length} templates, ${demo.baselineLogs.length} baseline logs.`
    );
    setFilters(INITIAL_FILTERS);
    setReviewResult(null);
    setReviewError("");
    setCopyStatus("");
    resetFormState();
  }

  function resetWorkspaceData(): void {
    const confirmed = window.confirm(
      "Reset tracker, template, and checkpoint data to empty local state?"
    );
    if (!confirmed) return;

    const emptyTemplates: CapcutTemplateEntry[] = [];
    const emptyBaselineLogs: BaselineLogEntry[] = [];
    const emptyCheckpointState: CheckpointOpsState = createEmptyCheckpointState();
    persist([]);
    saveCapcutTemplates(emptyTemplates);
    saveCheckpointOps(emptyBaselineLogs, emptyCheckpointState);
    setDataRevision((previous) => previous + 1);
    setWorkspaceStatus("Workspace reset to empty local state.");
    setFilters(INITIAL_FILTERS);
    setReviewResult(null);
    setReviewError("");
    setCopyStatus("");
    resetFormState();
  }

  function persist(nextEntries: ContentEntry[]): void {
    setEntries(nextEntries);
    saveEntries(nextEntries);
  }

  function handleFieldChange<K extends keyof FormState>(field: K, value: FormState[K]): void {
    setErrorMessage("");
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetFormState(): void {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function validateForm(): boolean {
    const creatorValue = resolveCreatorValue(form);
    const requiredFields = [
      creatorValue,
      form.clipCategory,
      form.language,
      form.countryRegion,
      form.platform,
      form.hook,
      form.status
    ];

    if (form.creator === "Other" && !requiresValue(form.creatorCustom)) {
      setErrorMessage("Please add a creator name when Other is selected.");
      return false;
    }

    if (!requiredFields.every(requiresValue)) {
      setErrorMessage("Please fill in all required fields before saving.");
      return false;
    }

    if (form.hook.trim().length > 180) {
      setErrorMessage("Hook must be 180 characters or fewer.");
      return false;
    }

    if (form.caption.trim().length > 500) {
      setErrorMessage("Caption must be 500 characters or fewer.");
      return false;
    }

    if (form.notes.trim().length > 1000) {
      setErrorMessage("Notes must be 1000 characters or fewer.");
      return false;
    }

    const metricInputs = [form.views, form.likes, form.comments, form.saves, form.shares];
    const hasInvalidMetric = metricInputs.some(
      (input) => input.trim() && parseMetric(input) === undefined
    );
    if (hasInvalidMetric) {
      setErrorMessage("Views, likes, comments, saves, and shares must be whole numbers.");
      return false;
    }

    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const now = new Date().toISOString();
    const creatorValue = resolveCreatorValue(form);

    if (editingId) {
      const existing = entries.find((entry) => entry.id === editingId);
      if (!existing) {
        setErrorMessage("The selected entry could not be found.");
        setIsSubmitting(false);
        return;
      }

      const updated: ContentEntry = {
        ...existing,
        creator: creatorValue,
        clipCategory: form.clipCategory.trim(),
        language: form.language.trim(),
        countryRegion: form.countryRegion.trim(),
        platform: form.platform.trim(),
        hook: form.hook.trim(),
        caption: form.caption.trim(),
        capcutTemplate: form.capcutTemplate.trim(),
        status: form.status,
        views: parseMetric(form.views),
        likes: parseMetric(form.likes),
        comments: parseMetric(form.comments),
        saves: parseMetric(form.saves),
        shares: parseMetric(form.shares),
        notes: form.notes.trim(),
        updatedAt: now
      };

      const nextEntries = entries.map((entry) => (entry.id === editingId ? updated : entry));
      persist(nextEntries);
      resetFormState();
      setIsSubmitting(false);
      return;
    }

    const created: ContentEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      creator: creatorValue,
      clipCategory: form.clipCategory.trim(),
      language: form.language.trim(),
      countryRegion: form.countryRegion.trim(),
      platform: form.platform.trim(),
      hook: form.hook.trim(),
      caption: form.caption.trim(),
      capcutTemplate: form.capcutTemplate.trim(),
      status: form.status,
      views: parseMetric(form.views),
      likes: parseMetric(form.likes),
      comments: parseMetric(form.comments),
      saves: parseMetric(form.saves),
      shares: parseMetric(form.shares),
      notes: form.notes.trim(),
      createdAt: now,
      updatedAt: now
    };

    persist([created, ...entries]);
    resetFormState();
    setIsSubmitting(false);
  }

  function startEdit(entry: ContentEntry): void {
    const creatorInPresetList = CREATORS.includes(entry.creator as (typeof CREATORS)[number]);
    const creatorSelection = creatorInPresetList ? entry.creator : "Other";
    const creatorCustomValue = creatorInPresetList ? "" : entry.creator;

    setEditingId(entry.id);
    setErrorMessage("");
    setForm({
      creator: creatorSelection,
      creatorCustom: creatorCustomValue,
      clipCategory: entry.clipCategory,
      language: entry.language,
      countryRegion: entry.countryRegion,
      platform: entry.platform,
      hook: entry.hook,
      caption: entry.caption,
      capcutTemplate: entry.capcutTemplate,
      status: entry.status,
      views: metricToFormValue(entry.views),
      likes: metricToFormValue(entry.likes),
      comments: metricToFormValue(entry.comments),
      saves: metricToFormValue(entry.saves),
      shares: metricToFormValue(entry.shares),
      notes: entry.notes
    });
  }

  function clearFilters(): void {
    setFilters(INITIAL_FILTERS);
  }

  function removeEntry(id: string): void {
    const shouldDelete = window.confirm("Delete this content entry?");
    if (!shouldDelete) return;
    persist(entries.filter((entry) => entry.id !== id));
    if (editingId === id) resetFormState();
  }

  function handleGenerateReview(): void {
    setReviewError("");
    setCopyStatus("");
    if (!reviewStartDate || !reviewEndDate) {
      setReviewError("Please choose both review start and end dates.");
      return;
    }
    if (reviewStartDate > reviewEndDate) {
      setReviewError("Review start date must be before or equal to end date.");
      return;
    }

    try {
      const nextReview = generateWeeklyReview(entries, reviewStartDate, reviewEndDate);
      setReviewResult(nextReview);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to generate weekly review.";
      setReviewError(message);
    }
  }

  async function copyReviewMarkdown(): Promise<void> {
    if (!reviewResult) return;
    setCopyStatus("");
    try {
      await navigator.clipboard.writeText(reviewResult.markdown);
      setCopyStatus("Weekly review copied as markdown.");
    } catch {
      setCopyStatus("Copy failed in this browser. You can copy from the panel manually.");
    }
  }

  const showFilteredEmpty = entries.length > 0 && filteredEntries.length === 0;
  const showInitialEmpty = entries.length === 0;

  return (
    <div className="page" data-agent={activeAgent.id}>
      <header className="header family-header">
        <p className="brand-kicker">Knova Family OS</p>
        <h1>Core Boys Command Deck</h1>
        <p className="header-summary">
          Four agents, one family. Shared DNA from Knova, distinct voices in each decision layer.
        </p>

        <div className="agent-selector" role="tablist" aria-label="Choose active agent mood">
          {AGENT_PROFILES.map((agent) => (
            <button
              key={agent.id}
              type="button"
              role="tab"
              aria-selected={activeAgent.id === agent.id}
              className={`agent-pill ${activeAgent.id === agent.id ? "is-active" : ""}`}
              onClick={() => setActiveAgentId(agent.id)}
            >
              <span className="agent-pill-name">{agent.name}</span>
              <span className="agent-pill-role">{agent.role}</span>
            </button>
          ))}
        </div>

        <div className="agent-voice">
          <p className="agent-voice-label">Active Voice</p>
          <h2>{activeAgent.name}</h2>
          <p>{activeAgent.voiceLine}</p>
        </div>

        <div className="header-actions">
          <div className="header-action-buttons">
            <button type="button" className="submit-button" onClick={applyDemoScenario}>
              Load Demo Scenario
            </button>
            <button type="button" className="clear-button" onClick={resetWorkspaceData}>
              Reset Data
            </button>
          </div>
          <p className="header-action-note">
            Use demo mode to test layout density, KPI rollups, and checkpoint readiness under real load.
          </p>
          {workspaceStatus ? <p className="workspace-status">{workspaceStatus}</p> : null}
        </div>
      </header>

      <section className="kpi-grid" aria-label="KPI summary">
        <article className="kpi-card">
          <h2>Total Entries</h2>
          <p>{kpis.totalEntries}</p>
        </article>
        <article className="kpi-card">
          <h2>Ready to Post</h2>
          <p>{kpis.readyToPost}</p>
        </article>
        <article className="kpi-card">
          <h2>Posted Entries</h2>
          <p>{kpis.postedEntries}</p>
        </article>
        <article className="kpi-card">
          <h2>Total Views</h2>
          <p>{kpis.totalViews.toLocaleString()}</p>
        </article>
      </section>

      {storageWarning ? <p className="warning">{storageWarning}</p> : null}

      <main className="dashboard">
        <section className={`agent-lane ${activeAgentId === "nova" ? "is-focused" : ""}`} data-lane-agent="nova">
          <div className="lane-label">
            <div className="lane-heading">
              <p className="lane-owner">Nova Lane</p>
              <p className="lane-purpose">Creative intake and idea shaping</p>
            </div>
            <p className="lane-signal">{getLaneSignal("nova")}</p>
          </div>
          <section className="panel">
          <h2>{editingId ? "Edit Content Idea" : "Add Content Idea"}</h2>
          <form className="entry-form" onSubmit={handleSubmit}>
            <label>
              Creator *
              <select
                value={form.creator}
                onChange={(event) => {
                  const nextCreator = event.target.value;
                  setForm((previous) => ({
                    ...previous,
                    creator: nextCreator,
                    creatorCustom: nextCreator === "Other" ? previous.creatorCustom : ""
                  }));
                }}
              >
                <option value="">Select creator</option>
                {creatorOptions.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </label>

            {form.creator === "Other" ? (
              <label>
                Creator name *
                <input
                  value={form.creatorCustom}
                  onChange={(event) => handleFieldChange("creatorCustom", event.target.value)}
                  placeholder="Enter creator name"
                />
              </label>
            ) : null}

            <label>
              Clip category *
              <select
                value={form.clipCategory}
                onChange={(event) => handleFieldChange("clipCategory", event.target.value)}
              >
                <option value="">Select category</option>
                {CLIP_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Language *
              <select
                value={form.language}
                onChange={(event) => handleFieldChange("language", event.target.value)}
              >
                <option value="">Select language</option>
                {LANGUAGES.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Country/Region *
              <input
                value={form.countryRegion}
                onChange={(event) => handleFieldChange("countryRegion", event.target.value)}
                placeholder="e.g. Germany"
              />
            </label>

            <label>
              Platform *
              <select
                value={form.platform}
                onChange={(event) => handleFieldChange("platform", event.target.value)}
              >
                <option value="">Select platform</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status *
              <select
                value={form.status}
                onChange={(event) => handleFieldChange("status", event.target.value as Status)}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <label className="full-width">
              Hook *
              <textarea
                value={form.hook}
                onChange={(event) => handleFieldChange("hook", event.target.value)}
                placeholder="Write the hook idea"
                rows={2}
              />
            </label>

            <label className="full-width">
              Caption
              <textarea
                value={form.caption}
                onChange={(event) => handleFieldChange("caption", event.target.value)}
                placeholder="Optional caption draft"
                rows={2}
              />
            </label>

            <label>
              CapCut template
              <input
                value={form.capcutTemplate}
                onChange={(event) => handleFieldChange("capcutTemplate", event.target.value)}
                placeholder="Template name"
              />
            </label>

            <label>
              Views
              <input
                value={form.views}
                onChange={(event) => handleFieldChange("views", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>

            <label>
              Likes
              <input
                value={form.likes}
                onChange={(event) => handleFieldChange("likes", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>

            <label>
              Comments
              <input
                value={form.comments}
                onChange={(event) => handleFieldChange("comments", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>

            <label>
              Saves
              <input
                value={form.saves}
                onChange={(event) => handleFieldChange("saves", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>

            <label>
              Shares
              <input
                value={form.shares}
                onChange={(event) => handleFieldChange("shares", event.target.value)}
                inputMode="numeric"
                placeholder="0"
              />
            </label>

            <label className="full-width">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => handleFieldChange("notes", event.target.value)}
                placeholder="Optional notes"
                rows={3}
              />
            </label>

            {errorMessage ? <p className="error">{errorMessage}</p> : null}

            <div className="form-actions full-width">
              <button type="submit" className="submit-button" disabled={isSubmitting}>
                {editingId ? "Save Changes" : "Save Content Idea"}
              </button>
              {editingId ? (
                <button type="button" className="cancel-button" onClick={resetFormState}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>
        </section>
        </section>

        <section className={`agent-lane ${activeAgentId === "atlas" ? "is-focused" : ""}`} data-lane-agent="atlas">
          <div className="lane-label">
            <div className="lane-heading">
              <p className="lane-owner">Atlas Lane</p>
              <p className="lane-purpose">Filtering, visibility, and performance tracking</p>
            </div>
            <p className="lane-signal">{getLaneSignal("atlas")}</p>
          </div>
          <section className="panel">
          <div className="panel-header">
            <h2>Content Ideas</h2>
            <span>{filteredEntries.length} shown</span>
          </div>

          <div className="filters">
            <label>
              Creator
              <select
                value={filters.creator}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, creator: event.target.value }))
                }
              >
                <option value="all">All creators</option>
                {creatorOptions.map((creator) => (
                  <option key={creator} value={creator}>
                    {creator}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Platform
              <select
                value={filters.platform}
                onChange={(event) =>
                  setFilters((previous) => ({ ...previous, platform: event.target.value }))
                }
              >
                <option value="all">All platforms</option>
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters((previous) => ({
                    ...previous,
                    status: event.target.value as FilterState["status"]
                  }))
                }
              >
                <option value="all">All statuses</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>

            <button type="button" className="clear-button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>

          {showInitialEmpty ? (
            <div className="empty-state">
              <h3>No content entries yet</h3>
              <p>Add your first content idea to start tracking creators, categories, and KPIs.</p>
            </div>
          ) : null}

          {showFilteredEmpty ? (
            <div className="empty-state">
              <h3>No entries match these filters</h3>
              <p>Try changing creator, platform, or status filters.</p>
            </div>
          ) : null}

          {filteredEntries.length > 0 ? (
            <>
              <div className="table-wrap desktop-table">
                <table>
                  <thead>
                    <tr>
                      <th>Creator</th>
                      <th>Clip category</th>
                      <th>Language</th>
                      <th>Country/Region</th>
                      <th>Platform</th>
                      <th>Status</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Comments</th>
                      <th>Saves</th>
                      <th>Shares</th>
                      <th>Hook</th>
                      <th>Caption</th>
                      <th>CapCut template</th>
                      <th>Notes</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.creator}</td>
                        <td>{entry.clipCategory}</td>
                        <td>{entry.language}</td>
                        <td>{entry.countryRegion}</td>
                        <td>{entry.platform}</td>
                        <td>{entry.status}</td>
                        <td>{entry.views ?? "-"}</td>
                        <td>{entry.likes ?? "-"}</td>
                        <td>{entry.comments ?? "-"}</td>
                        <td>{entry.saves ?? "-"}</td>
                        <td>{entry.shares ?? "-"}</td>
                        <td>{entry.hook}</td>
                        <td>{entry.caption || "-"}</td>
                        <td>{entry.capcutTemplate || "-"}</td>
                        <td>{entry.notes || "-"}</td>
                        <td>{formatUpdatedAt(entry.updatedAt)}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              type="button"
                              className="row-button edit"
                              onClick={() => startEdit(entry)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="row-button delete"
                              onClick={() => removeEntry(entry.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {filteredEntries.map((entry) => (
                  <article key={`${entry.id}-card`} className="entry-card">
                    <h3>{entry.creator}</h3>
                    <p>
                      <strong>Category:</strong> {entry.clipCategory}
                    </p>
                    <p>
                      <strong>Platform:</strong> {entry.platform}
                    </p>
                    <p>
                      <strong>Language:</strong> {entry.language}
                    </p>
                    <p>
                      <strong>Country/Region:</strong> {entry.countryRegion}
                    </p>
                    <p>
                      <strong>Status:</strong> {entry.status}
                    </p>
                    <p>
                      <strong>Hook:</strong> {entry.hook}
                    </p>
                    <p>
                      <strong>Views:</strong> {entry.views ?? "-"} | <strong>Likes:</strong>{" "}
                      {entry.likes ?? "-"}
                    </p>
                    <p>
                      <strong>Comments:</strong> {entry.comments ?? "-"} | <strong>Saves:</strong>{" "}
                      {entry.saves ?? "-"} | <strong>Shares:</strong> {entry.shares ?? "-"}
                    </p>
                    <p>
                      <strong>Updated:</strong> {formatUpdatedAt(entry.updatedAt)}
                    </p>
                    <div className="row-actions">
                      <button type="button" className="row-button edit" onClick={() => startEdit(entry)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="row-button delete"
                        onClick={() => removeEntry(entry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
        </section>
      </main>

      <section className={`agent-lane ${activeAgentId === "orion" ? "is-focused" : ""}`} data-lane-agent="orion">
        <div className="lane-label">
          <div className="lane-heading">
            <p className="lane-owner">Orion Lane</p>
            <p className="lane-purpose">Weekly synthesis and action framing</p>
          </div>
          <p className="lane-signal">{getLaneSignal("orion")}</p>
        </div>
        <section className="panel review-panel">
        <div className="panel-header">
          <h2>Weekly Review Generator</h2>
          <span>Uses local tracker data only</span>
        </div>

        <div className="review-controls">
          <label>
            Week start
            <input
              type="date"
              value={reviewStartDate}
              onChange={(event) => setReviewStartDate(event.target.value)}
            />
          </label>
          <label>
            Week end
            <input type="date" value={reviewEndDate} onChange={(event) => setReviewEndDate(event.target.value)} />
          </label>
          <button type="button" className="submit-button review-generate" onClick={handleGenerateReview}>
            Generate Weekly Review
          </button>
        </div>

        {reviewError ? <p className="error">{reviewError}</p> : null}
        {copyStatus ? <p className="review-status">{copyStatus}</p> : null}

        {!reviewResult ? (
          <div className="empty-state">
            <h3>No weekly review generated yet</h3>
            <p>Select a week range and generate your seven-part review output.</p>
          </div>
        ) : (
          <div className="review-output">
            <div className="review-summary">
              <p>
                <strong>Window:</strong> {reviewResult.startDate} to {reviewResult.endDate}
              </p>
              <p>
                <strong>Evidence:</strong> {reviewResult.evidenceEntries} posted/reviewed entries (
                {reviewResult.totalWindowEntries} total in window)
              </p>
              <button type="button" className="clear-button" onClick={copyReviewMarkdown}>
                Copy Markdown
              </button>
            </div>

            {reviewResult.sections.map((section, index) => (
              <article key={section.title} className="review-section">
                <h3>
                  {index + 1}. {section.title}
                </h3>
                <p className="review-text">
                  <strong>Recommendation:</strong> {"\n"}
                  {section.recommendation}
                </p>
                <p className="review-text">
                  <strong>Reason:</strong> {"\n"}
                  {section.reason}
                </p>
                <p className="review-text">
                  <strong>Assumption:</strong> {section.assumptionFlag} - {section.assumptionDetails}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
      </section>

      <section className={`agent-lane ${activeAgentId === "atlas" ? "is-focused" : ""}`} data-lane-agent="atlas">
        <div className="lane-label">
          <div className="lane-heading">
            <p className="lane-owner">Atlas Lane</p>
            <p className="lane-purpose">Template-level KPI intelligence</p>
          </div>
          <p className="lane-signal">{getLaneSignal("atlas")}</p>
        </div>
        <KpiTrackerPanel key={`kpi-${dataRevision}`} entries={entries} />
      </section>

      <section className={`agent-lane ${activeAgentId === "helios" ? "is-focused" : ""}`} data-lane-agent="helios">
        <div className="lane-label">
          <div className="lane-heading">
            <p className="lane-owner">Helios Lane</p>
            <p className="lane-purpose">Checkpoint governance and gate discipline</p>
          </div>
          <p className="lane-signal">{getLaneSignal("helios")}</p>
        </div>
        <CheckpointOpsPanel key={`checkpoint-${dataRevision}`} totalEntries={entries.length} />
      </section>

      <section className={`agent-lane ${activeAgentId === "helios" ? "is-focused" : ""}`} data-lane-agent="helios">
        <div className="lane-label">
          <div className="lane-heading">
            <p className="lane-owner">Helios Lane</p>
            <p className="lane-purpose">Decision packet generation for team handoffs</p>
          </div>
          <p className="lane-signal">{getLaneSignal("helios")}</p>
        </div>
        <WeeklyCheckpointSummaryPanel key={`summary-${dataRevision}`} entries={entries} />
      </section>

      <section className={`agent-lane ${activeAgentId === "nova" ? "is-focused" : ""}`} data-lane-agent="nova">
        <div className="lane-label">
          <div className="lane-heading">
            <p className="lane-owner">Nova Lane</p>
            <p className="lane-purpose">Repeatable template craftsmanship</p>
          </div>
          <p className="lane-signal">{getLaneSignal("nova")}</p>
        </div>
        <CapcutTemplateTracker key={`templates-${dataRevision}`} />
      </section>
    </div>
  );
}
