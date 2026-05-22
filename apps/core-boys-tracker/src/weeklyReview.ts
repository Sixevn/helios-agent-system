import type { ContentEntry } from "./types";

type AssumptionFlag = "Data-backed" | "Assumption used";

export interface WeeklyReviewSection {
  title: string;
  recommendation: string;
  reason: string;
  assumptionFlag: AssumptionFlag;
  assumptionDetails: string;
}

export interface WeeklyReviewResult {
  generatedAt: string;
  startDate: string;
  endDate: string;
  totalWindowEntries: number;
  evidenceEntries: number;
  sections: WeeklyReviewSection[];
  markdown: string;
}

interface RankedBucket {
  key: string;
  count: number;
  averageViews: number | null;
  engagementTotal: number;
  engagementPerEntry: number;
  consistencyScore: number;
}

const DEFAULT_CLIP_CATEGORY = "Translated subtitle clips";
const DEFAULT_LANGUAGE = "Spanish";
const DEFAULT_COUNTRY = "Mexico";
const DEFAULT_PLATFORM = "TikTok";
const DEFAULT_CREATOR = "Jason";

function parseDateInput(value: string, endOfDay: boolean): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
}

function getEntryDate(entry: ContentEntry): Date | null {
  const raw = entry.updatedAt || entry.createdAt;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function inRange(entry: ContentEntry, startDate: Date, endDate: Date): boolean {
  const date = getEntryDate(entry);
  if (!date) return false;
  return date >= startDate && date <= endDate;
}

function sumEngagement(entry: ContentEntry): number {
  return (entry.likes ?? 0) + (entry.comments ?? 0) + (entry.saves ?? 0) + (entry.shares ?? 0);
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function buildRankedBuckets(
  entries: ContentEntry[],
  getKey: (entry: ContentEntry) => string
): RankedBucket[] {
  const grouped = new Map<string, ContentEntry[]>();
  for (const entry of entries) {
    const key = getKey(entry).trim();
    if (!key) continue;
    const existing = grouped.get(key) ?? [];
    existing.push(entry);
    grouped.set(key, existing);
  }

  const buckets: RankedBucket[] = [];
  for (const [key, groupEntries] of grouped) {
    const viewValues = groupEntries
      .map((entry) => entry.views)
      .filter((value): value is number => value !== undefined);
    const engagementTotal = groupEntries.reduce((sum, entry) => sum + sumEngagement(entry), 0);
    const count = groupEntries.length;

    buckets.push({
      key,
      count,
      averageViews: average(viewValues),
      engagementTotal,
      engagementPerEntry: count > 0 ? engagementTotal / count : 0,
      consistencyScore: count >= 2 ? 1 : 0
    });
  }

  return buckets.sort((a, b) => {
    const viewsA = a.averageViews ?? -1;
    const viewsB = b.averageViews ?? -1;
    if (viewsA !== viewsB) return viewsB - viewsA;
    if (a.engagementPerEntry !== b.engagementPerEntry) {
      return b.engagementPerEntry - a.engagementPerEntry;
    }
    if (a.consistencyScore !== b.consistencyScore) {
      return b.consistencyScore - a.consistencyScore;
    }
    return b.count - a.count;
  });
}

function buildWorstBucket(buckets: RankedBucket[]): RankedBucket | undefined {
  if (buckets.length < 2) return undefined;
  const sorted = [...buckets].sort((a, b) => {
    const viewsA = a.averageViews ?? -1;
    const viewsB = b.averageViews ?? -1;
    if (viewsA !== viewsB) return viewsA - viewsB;
    if (a.engagementPerEntry !== b.engagementPerEntry) {
      return a.engagementPerEntry - b.engagementPerEntry;
    }
    return a.count - b.count;
  });
  return sorted[0];
}

function mostFrequentValue(
  entries: ContentEntry[],
  getKey: (entry: ContentEntry) => string,
  fallback: string
): string {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const key = getKey(entry).trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if (counts.size === 0) return fallback;
  let winner = fallback;
  let bestCount = -1;
  for (const [key, count] of counts) {
    if (count > bestCount) {
      bestCount = count;
      winner = key;
    }
  }
  return winner;
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString();
}

function buildIdeas(
  clipCategory: string,
  language: string,
  country: string,
  creator: string,
  platform: string
): string[] {
  return [
    `${creator} ${clipCategory} highlight tailored for ${language} viewers in ${country}`,
    `${platform} fast-cut ${clipCategory} moment with bilingual subtitles`,
    `${creator} context clip that explains why the moment matters before the punchline`,
    `${language} audience reaction remix using the same core moment with a new hook`,
    `${clipCategory} template refresh test with a stronger comment bait ending`
  ];
}

function buildHooks(idea: string, language: string, country: string): string[] {
  return [
    `${country} fans needed this ${language} version immediately`,
    `You will understand this clip better in ${language}`,
    `Rate this moment before I translate the next one`
  ].map((hook) => `${hook} - ${idea}`);
}

function makeSection(
  title: string,
  recommendation: string,
  reason: string,
  assumptionFlag: AssumptionFlag,
  assumptionDetails: string
): WeeklyReviewSection {
  return { title, recommendation, reason, assumptionFlag, assumptionDetails };
}

function toNumberedList(items: string[]): string {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function buildMarkdown(result: WeeklyReviewResult): string {
  const lines: string[] = [];
  lines.push("# Core Boys Weekly Review");
  lines.push("");
  lines.push(`Window: ${result.startDate} to ${result.endDate}`);
  lines.push(
    `Evidence: ${result.evidenceEntries} posted/reviewed entries (${result.totalWindowEntries} total in window)`
  );
  lines.push("");

  result.sections.forEach((section, index) => {
    lines.push(`## ${index + 1}. ${section.title}`);
    lines.push(section.recommendation);
    lines.push("");
    lines.push(`Reason: ${section.reason}`);
    lines.push(`Assumption: ${section.assumptionFlag} - ${section.assumptionDetails}`);
    lines.push("");
  });

  return lines.join("\n");
}

export function generateWeeklyReview(
  entries: ContentEntry[],
  startDateValue: string,
  endDateValue: string
): WeeklyReviewResult {
  const startDate = parseDateInput(startDateValue, false);
  const endDate = parseDateInput(endDateValue, true);
  if (!startDate || !endDate) {
    throw new Error("Please select a valid review start and end date.");
  }
  if (startDate > endDate) {
    throw new Error("Review start date must be before or equal to end date.");
  }

  const windowEntries = entries.filter((entry) => inRange(entry, startDate, endDate));
  const postedReviewed = windowEntries.filter(
    (entry) => entry.status === "Posted" || entry.status === "Reviewed"
  );
  const evidenceEntries = postedReviewed.length > 0 ? postedReviewed : windowEntries;
  const fallbackEvidence = postedReviewed.length === 0;

  const clipBuckets = buildRankedBuckets(evidenceEntries, (entry) => entry.clipCategory);
  const topClip = clipBuckets[0];
  const worstClip = buildWorstBucket(clipBuckets);

  const angleBuckets = buildRankedBuckets(
    evidenceEntries,
    (entry) => `${entry.language} / ${entry.countryRegion}`
  );
  const topAngle = angleBuckets[0];

  const focusClip = topClip?.key ?? DEFAULT_CLIP_CATEGORY;
  const focusAngle = topAngle?.key ?? `${DEFAULT_LANGUAGE} / ${DEFAULT_COUNTRY}`;
  const [focusLanguage, focusCountry] = focusAngle.split(" / ");
  const focusCreator = mostFrequentValue(evidenceEntries, (entry) => entry.creator, DEFAULT_CREATOR);
  const focusPlatform = mostFrequentValue(
    evidenceEntries,
    (entry) => entry.platform,
    DEFAULT_PLATFORM
  );
  const ideas = buildIdeas(focusClip, focusLanguage, focusCountry, focusCreator, focusPlatform);

  const hookLines = ideas.map((idea, index) => {
    const hooks = buildHooks(idea, focusLanguage, focusCountry);
    const hookBlock = hooks.map((hook) => `- ${hook}`).join("\n");
    return `Idea ${index + 1}: ${idea}\n${hookBlock}`;
  });

  const topTemplate = mostFrequentValue(
    evidenceEntries.filter((entry) => entry.capcutTemplate.trim().length > 0),
    (entry) => entry.capcutTemplate,
    ""
  );

  const metricCandidates = [
    {
      label: "Views",
      values: evidenceEntries
        .map((entry) => entry.views)
        .filter((value): value is number => value !== undefined)
    },
    {
      label: "Likes",
      values: evidenceEntries
        .map((entry) => entry.likes)
        .filter((value): value is number => value !== undefined)
    },
    {
      label: "Comments",
      values: evidenceEntries
        .map((entry) => entry.comments)
        .filter((value): value is number => value !== undefined)
    },
    {
      label: "Saves",
      values: evidenceEntries
        .map((entry) => entry.saves)
        .filter((value): value is number => value !== undefined)
    },
    {
      label: "Shares",
      values: evidenceEntries
        .map((entry) => entry.shares)
        .filter((value): value is number => value !== undefined)
    }
  ];

  const metricRanking = metricCandidates
    .map((metric) => ({
      ...metric,
      coverage: evidenceEntries.length > 0 ? metric.values.length / evidenceEntries.length : 0,
      average: metric.values.length
        ? metric.values.reduce((sum, value) => sum + value, 0) / metric.values.length
        : 0
    }))
    .sort((a, b) => {
      if (a.coverage !== b.coverage) return b.coverage - a.coverage;
      return b.average - a.average;
    });
  const topMetric = metricRanking[0];
  const insufficientData =
    windowEntries.length === 0 || evidenceEntries.length === 0 || clipBuckets.length === 0;

  const sections: WeeklyReviewSection[] = [];

  if (topClip) {
    const viewsText =
      topClip.averageViews === null ? "views data is limited" : `${formatNumber(topClip.averageViews)} avg views`;
    sections.push(
      makeSection(
        "Best clip type to focus on this week",
        `Focus on ${topClip.key} clips this week.`,
        `${topClip.key} led the window with ${viewsText} and ${formatNumber(topClip.engagementTotal)} total engagement across ${topClip.count} entries.`,
        fallbackEvidence ? "Assumption used" : "Data-backed",
        fallbackEvidence
          ? "No posted/reviewed entries were available, so all statuses were used for evidence."
          : "Recommendation is based on posted/reviewed entries in the selected window."
      )
    );
  } else {
    sections.push(
      makeSection(
        "Best clip type to focus on this week",
        `Start with ${DEFAULT_CLIP_CATEGORY} clips this week.`,
        "Insufficient data in the selected week to rank clip categories.",
        "Assumption used",
        "No qualifying entries were found in the selected date range."
      )
    );
  }

  if (topAngle) {
    sections.push(
      makeSection(
        "Best language/country angle to test",
        `Test ${topAngle.key} as your primary language-country angle this week.`,
        `${topAngle.key} ranked highest for signal quality in the selected evidence set.`,
        fallbackEvidence ? "Assumption used" : "Data-backed",
        fallbackEvidence
          ? "Angle ranking used all statuses due to missing posted/reviewed evidence."
          : "Angle ranking is based on posted/reviewed evidence."
      )
    );
  } else {
    sections.push(
      makeSection(
        "Best language/country angle to test",
        `Test ${DEFAULT_LANGUAGE} / ${DEFAULT_COUNTRY} this week.`,
        "Insufficient language/country evidence was available in the selected week.",
        "Assumption used",
        "No qualifying entries were found for language/country ranking."
      )
    );
  }

  sections.push(
    makeSection(
      "Five content ideas",
      toNumberedList(ideas),
      `Ideas are based on the strongest category (${focusClip}), top angle (${focusAngle}), and dominant platform (${focusPlatform}) from the selected window.`,
      insufficientData ? "Assumption used" : "Data-backed",
      insufficientData
        ? "Idea list uses default direction because evidence volume is low."
        : "Idea list is adapted from current performance signals."
    )
  );

  sections.push(
    makeSection(
      "Three hooks per idea",
      hookLines.join("\n\n"),
      "Hooks are paired to each idea so you can execute immediately without extra drafting.",
      insufficientData ? "Assumption used" : "Data-backed",
      insufficientData
        ? "Hook set is template-driven due to limited weekly evidence."
        : "Hook language follows detected audience direction in the selected window."
    )
  );

  if (topTemplate) {
    const templateUseCount = evidenceEntries.filter((entry) => entry.capcutTemplate === topTemplate).length;
    sections.push(
      makeSection(
        "CapCut template to use",
        `Use "${topTemplate}" as the default template this week.`,
        `This template appears most often in the selected evidence set (${templateUseCount} entries).`,
        fallbackEvidence ? "Assumption used" : "Data-backed",
        fallbackEvidence
          ? "Template frequency used all statuses due to missing posted/reviewed evidence."
          : "Template recommendation is based on posted/reviewed evidence."
      )
    );
  } else {
    sections.push(
      makeSection(
        "CapCut template to use",
        "Use your quickest subtitle-first template and log its exact name after posting.",
        "No CapCut template names were logged in the selected evidence set.",
        "Assumption used",
        "Template recommendation is a fallback because template usage data is missing."
      )
    );
  }

  if (topMetric && topMetric.coverage > 0) {
    sections.push(
      makeSection(
        "KPI to watch most closely",
        `Watch ${topMetric.label} most closely this week.`,
        `${topMetric.label} had the best measurement coverage (${Math.round(topMetric.coverage * 100)}%) in the selected evidence set.`,
        fallbackEvidence ? "Assumption used" : "Data-backed",
        fallbackEvidence
          ? "KPI coverage used all statuses because posted/reviewed evidence was limited."
          : "KPI choice is based on posted/reviewed evidence coverage."
      )
    );
  } else {
    sections.push(
      makeSection(
        "KPI to watch most closely",
        "Watch Views most closely this week.",
        "No KPI metrics were logged in enough entries to rank a stronger candidate.",
        "Assumption used",
        "Views is the safest default until more KPI fields are populated."
      )
    );
  }

  if (worstClip) {
    sections.push(
      makeSection(
        "What to stop doing based on weak performance",
        `Stop prioritizing ${worstClip.key} clips this week until you refresh hook and template strategy for that category.`,
        `${worstClip.key} ranked weakest in the selected evidence set compared with other categories.`,
        fallbackEvidence ? "Assumption used" : "Data-backed",
        fallbackEvidence
          ? "Weak-category detection used all statuses due to missing posted/reviewed evidence."
          : "Weak-category detection is based on posted/reviewed evidence."
      )
    );
  } else {
    sections.push(
      makeSection(
        "What to stop doing based on weak performance",
        "Stop spreading effort across too many untested categories in the same week.",
        "There is not enough category diversity in this window to identify a clear weak performer.",
        "Assumption used",
        "A focused test week is recommended until more comparative data is available."
      )
    );
  }

  const result: WeeklyReviewResult = {
    generatedAt: new Date().toISOString(),
    startDate: startDateValue,
    endDate: endDateValue,
    totalWindowEntries: windowEntries.length,
    evidenceEntries: evidenceEntries.length,
    sections,
    markdown: ""
  };

  result.markdown = buildMarkdown(result);
  return result;
}
