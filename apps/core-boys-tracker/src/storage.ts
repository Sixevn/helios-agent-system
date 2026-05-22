import {
  CHECKPOINT_OPS_STORAGE_KEY,
  CAPCUT_TEMPLATE_STORAGE_KEY,
  STATUSES,
  STORAGE_KEY,
  STORAGE_VERSION
} from "./constants";
import type {
  BaselineLogEntry,
  CapcutTemplateEntry,
  CheckpointOpsState,
  ContentEntry,
  DataCompletenessStatus,
  SrmStatus,
  Status
} from "./types";

interface PersistedData {
  version: number;
  entries: ContentEntry[];
}

interface LegacyEntry {
  id?: unknown;
  creator?: unknown;
  clipCategory?: unknown;
  language?: unknown;
  country?: unknown;
  countryRegion?: unknown;
  platform?: unknown;
  hook?: unknown;
  caption?: unknown;
  capcutTemplate?: unknown;
  status?: unknown;
  views?: unknown;
  likes?: unknown;
  comments?: unknown;
  saves?: unknown;
  shares?: unknown;
  notes?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface LoadResult {
  entries: ContentEntry[];
  warningMessage: string;
}

interface CapcutTemplateLoadResult {
  templates: CapcutTemplateEntry[];
  warningMessage: string;
}

interface PersistedTemplateData {
  version: number;
  templates: CapcutTemplateEntry[];
}

interface PersistedCheckpointOpsData {
  version: number;
  baselineLogs: BaselineLogEntry[];
  checkpointState: CheckpointOpsState;
}

interface LegacyCapcutTemplateEntry {
  id?: unknown;
  templateName?: unknown;
  bestUseCase?: unknown;
  videoLength?: unknown;
  hookFormat?: unknown;
  subtitleFormat?: unknown;
  editingStyle?: unknown;
  bestPlatform?: unknown;
  bestLanguageTest?: unknown;
  notes?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface LegacyBaselineLogEntry {
  id?: unknown;
  date?: unknown;
  savesPerThousand?: unknown;
  completionRate?: unknown;
  negativeFeedbackRate?: unknown;
  productionMinutes?: unknown;
  notes?: unknown;
  createdAt?: unknown;
}

interface LegacyCheckpointOpsState {
  windowStartDate?: unknown;
  checkpointDate?: unknown;
  baselineWindowDays?: unknown;
  currentSavesPerThousand?: unknown;
  currentCompletionRate?: unknown;
  currentNegativeFeedbackRate?: unknown;
  currentProductionMinutes?: unknown;
  srmStatus?: unknown;
  dataCompleteness?: unknown;
  guardrailBreaches?: unknown;
  checklistEvidenceCaptured?: unknown;
  checklistSampleAdequate?: unknown;
  checklistGuardrailsReviewed?: unknown;
  checklistDecisionReady?: unknown;
}

interface CheckpointOpsLoadResult {
  baselineLogs: BaselineLogEntry[];
  checkpointState: CheckpointOpsState;
  warningMessage: string;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : undefined;
}

function asNonNegativeNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return null;
  return value;
}

function asStatus(value: unknown): Status {
  return typeof value === "string" && STATUSES.includes(value as Status)
    ? (value as Status)
    : "Idea";
}

function normalizeEntry(entry: LegacyEntry): ContentEntry | null {
  const id = asString(entry.id);
  const creator = asString(entry.creator).trim();
  const clipCategory = asString(entry.clipCategory).trim();
  const language = asString(entry.language).trim();
  const countryRegion = (asString(entry.countryRegion) || asString(entry.country)).trim();
  const platform = asString(entry.platform).trim();
  const hook = asString(entry.hook).trim();
  const status = asStatus(entry.status);

  if (!id || !creator || !clipCategory || !language || !countryRegion || !platform || !hook) {
    return null;
  }

  const createdAt = asString(entry.createdAt) || new Date().toISOString();
  const updatedAt = asString(entry.updatedAt) || createdAt;

  return {
    id,
    creator,
    clipCategory,
    language,
    countryRegion,
    platform,
    hook,
    caption: asString(entry.caption),
    capcutTemplate: asString(entry.capcutTemplate),
    status,
    views: asOptionalNumber(entry.views),
    likes: asOptionalNumber(entry.likes),
    comments: asOptionalNumber(entry.comments),
    saves: asOptionalNumber(entry.saves),
    shares: asOptionalNumber(entry.shares),
    notes: asString(entry.notes),
    createdAt,
    updatedAt
  };
}

export function loadEntries(): LoadResult {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { entries: [], warningMessage: "" };

  try {
    const parsed = JSON.parse(raw) as PersistedData | { entries?: LegacyEntry[] } | LegacyEntry[];
    const maybeEntries = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.entries)
        ? parsed.entries
        : [];
    const entries = maybeEntries
      .map((entry) => normalizeEntry(entry))
      .filter((entry): entry is ContentEntry => entry !== null);
    return { entries, warningMessage: "" };
  } catch {
    return {
      entries: [],
      warningMessage: "Stored data could not be read. Tracker was reset to an empty state."
    };
  }
}

export function saveEntries(entries: ContentEntry[]): void {
  const payload: PersistedData = { version: STORAGE_VERSION, entries };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function normalizeCapcutTemplate(
  template: LegacyCapcutTemplateEntry
): CapcutTemplateEntry | null {
  const id = asString(template.id);
  const templateName = asString(template.templateName).trim();
  const bestUseCase = asString(template.bestUseCase).trim();
  const videoLength = asString(template.videoLength).trim();
  const hookFormat = asString(template.hookFormat).trim();
  const subtitleFormat = asString(template.subtitleFormat).trim();
  const editingStyle = asString(template.editingStyle).trim();
  const bestPlatform = asString(template.bestPlatform).trim();
  const bestLanguageTest = asString(template.bestLanguageTest).trim();

  if (
    !id ||
    !templateName ||
    !bestUseCase ||
    !videoLength ||
    !hookFormat ||
    !subtitleFormat ||
    !editingStyle ||
    !bestPlatform ||
    !bestLanguageTest
  ) {
    return null;
  }

  const createdAt = asString(template.createdAt) || new Date().toISOString();
  const updatedAt = asString(template.updatedAt) || createdAt;

  return {
    id,
    templateName,
    bestUseCase,
    videoLength,
    hookFormat,
    subtitleFormat,
    editingStyle,
    bestPlatform,
    bestLanguageTest,
    notes: asString(template.notes),
    createdAt,
    updatedAt
  };
}

export function loadCapcutTemplates(): CapcutTemplateLoadResult {
  const raw = localStorage.getItem(CAPCUT_TEMPLATE_STORAGE_KEY);
  if (!raw) return { templates: [], warningMessage: "" };

  try {
    const parsed = JSON.parse(raw) as
      | PersistedTemplateData
      | { templates?: LegacyCapcutTemplateEntry[] }
      | LegacyCapcutTemplateEntry[];

    const maybeTemplates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.templates)
        ? parsed.templates
        : [];

    const templates = maybeTemplates
      .map((template) => normalizeCapcutTemplate(template))
      .filter((template): template is CapcutTemplateEntry => template !== null);

    return { templates, warningMessage: "" };
  } catch {
    return {
      templates: [],
      warningMessage: "CapCut template data could not be read. Templates were reset to empty."
    };
  }
}

export function saveCapcutTemplates(templates: CapcutTemplateEntry[]): void {
  const payload: PersistedTemplateData = { version: STORAGE_VERSION, templates };
  localStorage.setItem(CAPCUT_TEMPLATE_STORAGE_KEY, JSON.stringify(payload));
}

function asSrmStatus(value: unknown): SrmStatus {
  if (value === "Pass" || value === "Fail" || value === "N/A") return value;
  return "N/A";
}

function asDataCompleteness(value: unknown): DataCompletenessStatus {
  if (value === "Complete" || value === "Incomplete") return value;
  return "Incomplete";
}

function asGuardrailBreaches(value: unknown): "0" | "1" | "2" | "3" {
  if (value === "0" || value === "1" || value === "2" || value === "3") return value;
  return "0";
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function normalizeBaselineLog(entry: LegacyBaselineLogEntry): BaselineLogEntry | null {
  const id = asString(entry.id);
  const date = asString(entry.date);
  const savesPerThousand = asNonNegativeNumber(entry.savesPerThousand);
  const completionRate = asNonNegativeNumber(entry.completionRate);
  const negativeFeedbackRate = asNonNegativeNumber(entry.negativeFeedbackRate);
  const productionMinutes = asNonNegativeNumber(entry.productionMinutes);

  if (
    !id ||
    !date ||
    savesPerThousand === null ||
    completionRate === null ||
    negativeFeedbackRate === null ||
    productionMinutes === null
  ) {
    return null;
  }

  return {
    id,
    date,
    savesPerThousand,
    completionRate,
    negativeFeedbackRate,
    productionMinutes,
    notes: asString(entry.notes),
    createdAt: asString(entry.createdAt) || new Date().toISOString()
  };
}

function getDefaultCheckpointState(): CheckpointOpsState {
  return {
    windowStartDate: "",
    checkpointDate: "",
    baselineWindowDays: 7,
    currentSavesPerThousand: "",
    currentCompletionRate: "",
    currentNegativeFeedbackRate: "",
    currentProductionMinutes: "",
    srmStatus: "N/A",
    dataCompleteness: "Incomplete",
    guardrailBreaches: "0",
    checklistEvidenceCaptured: false,
    checklistSampleAdequate: false,
    checklistGuardrailsReviewed: false,
    checklistDecisionReady: false
  };
}

function normalizeCheckpointState(
  state: LegacyCheckpointOpsState | undefined
): CheckpointOpsState {
  if (!state) return getDefaultCheckpointState();
  return {
    windowStartDate: asString(state.windowStartDate),
    checkpointDate: asString(state.checkpointDate),
    baselineWindowDays: state.baselineWindowDays === 14 ? 14 : 7,
    currentSavesPerThousand: asString(state.currentSavesPerThousand),
    currentCompletionRate: asString(state.currentCompletionRate),
    currentNegativeFeedbackRate: asString(state.currentNegativeFeedbackRate),
    currentProductionMinutes: asString(state.currentProductionMinutes),
    srmStatus: asSrmStatus(state.srmStatus),
    dataCompleteness: asDataCompleteness(state.dataCompleteness),
    guardrailBreaches: asGuardrailBreaches(state.guardrailBreaches),
    checklistEvidenceCaptured: asBoolean(state.checklistEvidenceCaptured),
    checklistSampleAdequate: asBoolean(state.checklistSampleAdequate),
    checklistGuardrailsReviewed: asBoolean(state.checklistGuardrailsReviewed),
    checklistDecisionReady: asBoolean(state.checklistDecisionReady)
  };
}

export function loadCheckpointOps(): CheckpointOpsLoadResult {
  const raw = localStorage.getItem(CHECKPOINT_OPS_STORAGE_KEY);
  if (!raw) {
    return {
      baselineLogs: [],
      checkpointState: getDefaultCheckpointState(),
      warningMessage: ""
    };
  }

  try {
    const parsed = JSON.parse(raw) as
      | PersistedCheckpointOpsData
      | { baselineLogs?: LegacyBaselineLogEntry[]; checkpointState?: LegacyCheckpointOpsState };

    const logsRaw = Array.isArray(parsed.baselineLogs) ? parsed.baselineLogs : [];
    const baselineLogs = logsRaw
      .map((entry) => normalizeBaselineLog(entry))
      .filter((entry): entry is BaselineLogEntry => entry !== null)
      .sort((a, b) => b.date.localeCompare(a.date));
    const checkpointState = normalizeCheckpointState(parsed.checkpointState);
    return { baselineLogs, checkpointState, warningMessage: "" };
  } catch {
    return {
      baselineLogs: [],
      checkpointState: getDefaultCheckpointState(),
      warningMessage:
        "Checkpoint data could not be read. Baseline log and checkpoint state were reset."
    };
  }
}

export function saveCheckpointOps(
  baselineLogs: BaselineLogEntry[],
  checkpointState: CheckpointOpsState
): void {
  const payload: PersistedCheckpointOpsData = {
    version: STORAGE_VERSION,
    baselineLogs,
    checkpointState
  };
  localStorage.setItem(CHECKPOINT_OPS_STORAGE_KEY, JSON.stringify(payload));
}
