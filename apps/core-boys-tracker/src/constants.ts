import type { FormState, Status } from "./types";

export const STORAGE_KEY = "core_boys_tracker_v1";
export const STORAGE_VERSION = 1;
export const CAPCUT_TEMPLATE_STORAGE_KEY = "core_boys_capcut_templates_v1";
export const CHECKPOINT_OPS_STORAGE_KEY = "core_boys_checkpoint_ops_v1";
export const MIN_BASELINE_LOGS_FOR_GATE = 7;

export const CREATORS = [
  "Jason",
  "Stable Ronaldo",
  "Lacy",
  "Silky",
  "Adapt",
  "Marlon",
  "Other"
] as const;

export const CLIP_CATEGORIES = [
  "Chaos/rage clips",
  "Comedy/group banter clips",
  "Gaming clips",
  "Just chatting/IRL clips",
  "Story/context clips",
  "Meme/reaction edits",
  "Translated subtitle clips"
] as const;

export const LANGUAGES = [
  "Spanish",
  "Portuguese",
  "French",
  "German",
  "Arabic",
  "English",
  "Other"
] as const;

export const PLATFORMS = ["TikTok", "Instagram Reels", "YouTube Shorts", "Facebook Reels"] as const;

export const STATUSES: Status[] = ["Idea", "Editing", "Ready", "Posted", "Reviewed"];

export const EMPTY_FORM: FormState = {
  creator: "",
  creatorCustom: "",
  clipCategory: "",
  language: "",
  countryRegion: "",
  platform: "",
  hook: "",
  caption: "",
  capcutTemplate: "",
  status: "Idea",
  views: "",
  likes: "",
  comments: "",
  saves: "",
  shares: "",
  notes: ""
};
