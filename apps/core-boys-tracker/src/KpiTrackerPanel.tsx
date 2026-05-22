import { useMemo, useState } from "react";
import { LANGUAGES, PLATFORMS } from "./constants";
import type { ContentEntry } from "./types";

type KpiFilterState = {
  platform: string;
  language: string;
  startDate: string;
  endDate: string;
};

interface TemplateRollup {
  templateName: string;
  entryCount: number;
  postedReviewedCount: number;
  totalViews: number;
  averageViews: number | null;
  totalEngagement: number;
}

const INITIAL_FILTERS: KpiFilterState = {
  platform: "all",
  language: "all",
  startDate: "",
  endDate: ""
};

function parseDateInput(value: string, endOfDay: boolean): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  return date;
}

function getEntryDate(entry: ContentEntry): Date | null {
  const raw = entry.updatedAt || entry.createdAt;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDisplayNumber(value: number): string {
  return value.toLocaleString();
}

function toAverageDisplay(value: number | null): string {
  if (value === null) return "-";
  return Math.round(value).toLocaleString();
}

function toTemplateKey(templateName: string): string {
  return templateName.trim() || "No Template";
}

interface KpiTrackerPanelProps {
  entries: ContentEntry[];
}

export default function KpiTrackerPanel({ entries }: KpiTrackerPanelProps): JSX.Element {
  const [filters, setFilters] = useState<KpiFilterState>(INITIAL_FILTERS);

  const platformOptions = useMemo(() => {
    const optionSet = new Set<string>(PLATFORMS);
    for (const entry of entries) optionSet.add(entry.platform);
    return [...optionSet];
  }, [entries]);

  const languageOptions = useMemo(() => {
    const optionSet = new Set<string>(LANGUAGES);
    for (const entry of entries) optionSet.add(entry.language);
    return [...optionSet];
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const startDate = parseDateInput(filters.startDate, false);
    const endDate = parseDateInput(filters.endDate, true);

    return entries.filter((entry) => {
      const platformMatch = filters.platform === "all" || entry.platform === filters.platform;
      const languageMatch = filters.language === "all" || entry.language === filters.language;
      if (!platformMatch || !languageMatch) return false;

      const entryDate = getEntryDate(entry);
      if (!entryDate) return false;
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    });
  }, [entries, filters]);

  const rollups = useMemo(() => {
    const grouped = new Map<string, ContentEntry[]>();
    for (const entry of filteredEntries) {
      const templateKey = toTemplateKey(entry.capcutTemplate);
      const existing = grouped.get(templateKey) ?? [];
      existing.push(entry);
      grouped.set(templateKey, existing);
    }

    const computed: TemplateRollup[] = [];

    for (const [templateName, groupEntries] of grouped) {
      const entryCount = groupEntries.length;
      const postedReviewedCount = groupEntries.filter(
        (entry) => entry.status === "Posted" || entry.status === "Reviewed"
      ).length;
      const totalViews = groupEntries.reduce((sum, entry) => sum + (entry.views ?? 0), 0);
      const viewsWithValues = groupEntries
        .map((entry) => entry.views)
        .filter((value): value is number => value !== undefined);
      const averageViews =
        viewsWithValues.length > 0
          ? viewsWithValues.reduce((sum, value) => sum + value, 0) / viewsWithValues.length
          : null;
      const totalEngagement = groupEntries.reduce(
        (sum, entry) =>
          sum + (entry.likes ?? 0) + (entry.comments ?? 0) + (entry.saves ?? 0) + (entry.shares ?? 0),
        0
      );

      computed.push({
        templateName,
        entryCount,
        postedReviewedCount,
        totalViews,
        averageViews,
        totalEngagement
      });
    }

    return computed.sort((a, b) => {
      if (a.totalViews !== b.totalViews) return b.totalViews - a.totalViews;
      if (a.totalEngagement !== b.totalEngagement) return b.totalEngagement - a.totalEngagement;
      return b.entryCount - a.entryCount;
    });
  }, [filteredEntries]);

  const summary = useMemo(() => {
    const totalTemplates = rollups.length;
    const totalEntries = filteredEntries.length;
    const totalViews = rollups.reduce((sum, rollup) => sum + rollup.totalViews, 0);
    const totalEngagement = rollups.reduce((sum, rollup) => sum + rollup.totalEngagement, 0);
    return { totalTemplates, totalEntries, totalViews, totalEngagement };
  }, [rollups, filteredEntries]);

  function clearFilters(): void {
    setFilters(INITIAL_FILTERS);
  }

  const showInitialEmpty = entries.length === 0;
  const showFilteredEmpty = entries.length > 0 && filteredEntries.length === 0;

  return (
    <section className="panel kpi-enhancement-panel">
      <div className="panel-header">
        <h2>KPI Tracker (Template Rollups)</h2>
        <span>{rollups.length} templates</span>
      </div>

      <div className="kpi-filter-grid">
        <label>
          Platform
          <select
            value={filters.platform}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, platform: event.target.value }))
            }
          >
            <option value="all">All platforms</option>
            {platformOptions.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </select>
        </label>

        <label>
          Language
          <select
            value={filters.language}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, language: event.target.value }))
            }
          >
            <option value="all">All languages</option>
            {languageOptions.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </label>

        <label>
          Start date
          <input
            type="date"
            value={filters.startDate}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, startDate: event.target.value }))
            }
          />
        </label>

        <label>
          End date
          <input
            type="date"
            value={filters.endDate}
            onChange={(event) =>
              setFilters((previous) => ({ ...previous, endDate: event.target.value }))
            }
          />
        </label>

        <button type="button" className="clear-button" onClick={clearFilters}>
          Clear filters
        </button>
      </div>

      {showInitialEmpty ? (
        <div className="empty-state">
          <h3>No KPI data yet</h3>
          <p>Add content entries first to generate template-level KPI rollups.</p>
        </div>
      ) : null}

      {showFilteredEmpty ? (
        <div className="empty-state">
          <h3>No entries match these KPI filters</h3>
          <p>Try adjusting platform, language, or date range filters.</p>
        </div>
      ) : null}

      {rollups.length > 0 ? (
        <>
          <section className="kpi-rollup-cards" aria-label="Template KPI summary">
            <article className="kpi-rollup-card">
              <h3>Templates</h3>
              <p>{toDisplayNumber(summary.totalTemplates)}</p>
            </article>
            <article className="kpi-rollup-card">
              <h3>Entries</h3>
              <p>{toDisplayNumber(summary.totalEntries)}</p>
            </article>
            <article className="kpi-rollup-card">
              <h3>Total Views</h3>
              <p>{toDisplayNumber(summary.totalViews)}</p>
            </article>
            <article className="kpi-rollup-card">
              <h3>Total Engagement</h3>
              <p>{toDisplayNumber(summary.totalEngagement)}</p>
            </article>
          </section>

          <div className="table-wrap desktop-table kpi-rollup-desktop">
            <table className="kpi-rollup-table">
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Entries</th>
                  <th>Posted/Reviewed</th>
                  <th>Total Views</th>
                  <th>Avg Views</th>
                  <th>Total Engagement</th>
                </tr>
              </thead>
              <tbody>
                {rollups.map((rollup) => (
                  <tr key={rollup.templateName}>
                    <td>{rollup.templateName}</td>
                    <td>{toDisplayNumber(rollup.entryCount)}</td>
                    <td>{toDisplayNumber(rollup.postedReviewedCount)}</td>
                    <td>{toDisplayNumber(rollup.totalViews)}</td>
                    <td>{toAverageDisplay(rollup.averageViews)}</td>
                    <td>{toDisplayNumber(rollup.totalEngagement)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="kpi-mobile-cards">
            {rollups.map((rollup) => (
              <article key={`${rollup.templateName}-card`} className="entry-card">
                <h3>{rollup.templateName}</h3>
                <p>
                  <strong>Entries:</strong> {toDisplayNumber(rollup.entryCount)}
                </p>
                <p>
                  <strong>Posted/Reviewed:</strong> {toDisplayNumber(rollup.postedReviewedCount)}
                </p>
                <p>
                  <strong>Total Views:</strong> {toDisplayNumber(rollup.totalViews)}
                </p>
                <p>
                  <strong>Avg Views:</strong> {toAverageDisplay(rollup.averageViews)}
                </p>
                <p>
                  <strong>Total Engagement:</strong> {toDisplayNumber(rollup.totalEngagement)}
                </p>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
