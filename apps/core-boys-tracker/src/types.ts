export type Status = "Idea" | "Editing" | "Ready" | "Posted" | "Reviewed";

export interface ContentEntry {
  id: string;
  creator: string;
  clipCategory: string;
  language: string;
  countryRegion: string;
  platform: string;
  hook: string;
  caption: string;
  capcutTemplate: string;
  status: Status;
  views?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FormState {
  creator: string;
  creatorCustom: string;
  clipCategory: string;
  language: string;
  countryRegion: string;
  platform: string;
  hook: string;
  caption: string;
  capcutTemplate: string;
  status: Status;
  views: string;
  likes: string;
  comments: string;
  saves: string;
  shares: string;
  notes: string;
}

export interface CapcutTemplateEntry {
  id: string;
  templateName: string;
  bestUseCase: string;
  videoLength: string;
  hookFormat: string;
  subtitleFormat: string;
  editingStyle: string;
  bestPlatform: string;
  bestLanguageTest: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CapcutTemplateFormState {
  templateName: string;
  bestUseCase: string;
  videoLength: string;
  hookFormat: string;
  subtitleFormat: string;
  editingStyle: string;
  bestPlatform: string;
  bestLanguageTest: string;
  notes: string;
}

export type SrmStatus = "Pass" | "Fail" | "N/A";
export type DataCompletenessStatus = "Complete" | "Incomplete";

export interface BaselineLogEntry {
  id: string;
  date: string;
  savesPerThousand: number;
  completionRate: number;
  negativeFeedbackRate: number;
  productionMinutes: number;
  notes: string;
  createdAt: string;
}

export interface CheckpointOpsState {
  windowStartDate: string;
  checkpointDate: string;
  baselineWindowDays: 7 | 14;
  currentSavesPerThousand: string;
  currentCompletionRate: string;
  currentNegativeFeedbackRate: string;
  currentProductionMinutes: string;
  srmStatus: SrmStatus;
  dataCompleteness: DataCompletenessStatus;
  guardrailBreaches: "0" | "1" | "2" | "3";
  checklistEvidenceCaptured: boolean;
  checklistSampleAdequate: boolean;
  checklistGuardrailsReviewed: boolean;
  checklistDecisionReady: boolean;
}
