import type {
  BaselineLogEntry,
  CapcutTemplateEntry,
  CheckpointOpsState,
  ContentEntry
} from "./types";

interface DemoScenarioData {
  entries: ContentEntry[];
  templates: CapcutTemplateEntry[];
  baselineLogs: BaselineLogEntry[];
  checkpointState: CheckpointOpsState;
}

function isoDaysAgo(daysAgo: number, hour = 11): string {
  const value = new Date();
  value.setDate(value.getDate() - daysAgo);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
}

function dayStringDaysAgo(daysAgo: number): string {
  return isoDaysAgo(daysAgo).slice(0, 10);
}

function createEntry(
  id: string,
  daysAgo: number,
  data: Omit<ContentEntry, "id" | "createdAt" | "updatedAt">
): ContentEntry {
  return {
    id,
    ...data,
    createdAt: isoDaysAgo(daysAgo + 1, 10),
    updatedAt: isoDaysAgo(daysAgo, 15)
  };
}

function createTemplate(
  id: string,
  daysAgo: number,
  data: Omit<CapcutTemplateEntry, "id" | "createdAt" | "updatedAt">
): CapcutTemplateEntry {
  return {
    id,
    ...data,
    createdAt: isoDaysAgo(daysAgo + 2, 9),
    updatedAt: isoDaysAgo(daysAgo, 14)
  };
}

function createBaselineLog(
  id: string,
  daysAgo: number,
  metrics: Omit<BaselineLogEntry, "id" | "date" | "createdAt">
): BaselineLogEntry {
  return {
    id,
    date: dayStringDaysAgo(daysAgo),
    createdAt: isoDaysAgo(daysAgo, 8),
    ...metrics
  };
}

export function createEmptyCheckpointState(): CheckpointOpsState {
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

export function createDemoScenario(): DemoScenarioData {
  const templates: CapcutTemplateEntry[] = [
    createTemplate("demo-template-01", 12, {
      templateName: "Chaos Cold Open + Snap Zoom",
      bestUseCase: "Explosive rage moments that need an immediate pattern interrupt.",
      videoLength: "12 to 24 seconds",
      hookFormat: "3-word interruption + all-caps reaction text in first second",
      subtitleFormat: "Big center subtitles with two-color emphasis on punch words",
      editingStyle: "Fast cuts, 105% zoom pulses, hard beat match on reactions",
      bestPlatform: "TikTok",
      bestLanguageTest: "English",
      notes: "Use when the first two seconds are visually loud."
    }),
    createTemplate("demo-template-02", 10, {
      templateName: "Story Thread Overlay",
      bestUseCase: "Longer context clips that need narrative compression.",
      videoLength: "25 to 40 seconds",
      hookFormat: "\"You missed this\" opener + context line",
      subtitleFormat: "Lower-third subtitles with chapter emoji markers",
      editingStyle: "Moderate pacing, pop-in context cards, recap end card",
      bestPlatform: "YouTube Shorts",
      bestLanguageTest: "Spanish",
      notes: "Pairs well with clips that have a before/after reveal."
    }),
    createTemplate("demo-template-03", 8, {
      templateName: "Banter Split Screen",
      bestUseCase: "Group argument/comedy moments with multiple speakers.",
      videoLength: "16 to 32 seconds",
      hookFormat: "Question hook + fast subtitle quote",
      subtitleFormat: "Dual-speaker color coding in alternating rows",
      editingStyle: "Split-screen reactions and rapid speaker jump cuts",
      bestPlatform: "Instagram Reels",
      bestLanguageTest: "Portuguese",
      notes: "Best when reactions are as strong as the primary speaker."
    }),
    createTemplate("demo-template-04", 6, {
      templateName: "Meme Caption Ladder",
      bestUseCase: "Reaction clips where humor increases line by line.",
      videoLength: "10 to 18 seconds",
      hookFormat: "Meme premise + payoff tease",
      subtitleFormat: "Top caption ladder with progressive punchline build",
      editingStyle: "Minimal cuts, text-led pacing, strong end freeze",
      bestPlatform: "Facebook Reels",
      bestLanguageTest: "French",
      notes: "Keep visuals simple so text rhythm carries the edit."
    }),
    createTemplate("demo-template-05", 4, {
      templateName: "Translation Momentum Cut",
      bestUseCase: "Clips where translated subtitle clarity drives retention.",
      videoLength: "20 to 35 seconds",
      hookFormat: "Promise of translated context + emotional quote",
      subtitleFormat: "Dual-line translation subtitles with cue highlights",
      editingStyle: "Context bumpers, low-motion cuts, readability-first framing",
      bestPlatform: "TikTok",
      bestLanguageTest: "Arabic",
      notes: "Avoid visual clutter; translation legibility wins."
    }),
    createTemplate("demo-template-06", 2, {
      templateName: "IRL Scene Pulse",
      bestUseCase: "Just chatting/IRL clips that need pace and emotional beats.",
      videoLength: "18 to 30 seconds",
      hookFormat: "Scene surprise + \"watch the end\" nudge",
      subtitleFormat: "Mixed-size emphasis subtitles at eye line",
      editingStyle: "Ambient B-roll inserts and subtle speed ramps",
      bestPlatform: "Instagram Reels",
      bestLanguageTest: "German",
      notes: "Strong when environment details are part of the joke."
    })
  ];

  const entries: ContentEntry[] = [
    createEntry("demo-entry-01", 13, {
      creator: "Jason",
      clipCategory: "Chaos/rage clips",
      language: "English",
      countryRegion: "United States",
      platform: "TikTok",
      hook: "He said one line and the whole lobby tilted",
      caption: "Chaos arc starts in second two.",
      capcutTemplate: "Chaos Cold Open + Snap Zoom",
      status: "Posted",
      views: 24100,
      likes: 2400,
      comments: 310,
      saves: 590,
      shares: 210,
      notes: "High rewatch behavior in first 24h."
    }),
    createEntry("demo-entry-02", 12, {
      creator: "Stable Ronaldo",
      clipCategory: "Comedy/group banter clips",
      language: "Portuguese",
      countryRegion: "Brazil",
      platform: "Instagram Reels",
      hook: "No one expected this comeback in the call",
      caption: "Split-screen reactions carried this.",
      capcutTemplate: "Banter Split Screen",
      status: "Reviewed",
      views: 18940,
      likes: 1801,
      comments: 245,
      saves: 402,
      shares: 133,
      notes: "Translation subtitle timing improved watch-through."
    }),
    createEntry("demo-entry-03", 11, {
      creator: "Lacy",
      clipCategory: "Story/context clips",
      language: "Spanish",
      countryRegion: "Mexico",
      platform: "YouTube Shorts",
      hook: "Context you needed before this clip went viral",
      caption: "Story-first framing with clean arc.",
      capcutTemplate: "Story Thread Overlay",
      status: "Posted",
      views: 20550,
      likes: 2120,
      comments: 188,
      saves: 441,
      shares: 165,
      notes: "Best performance from chapter overlay format."
    }),
    createEntry("demo-entry-04", 10, {
      creator: "Silky",
      clipCategory: "Meme/reaction edits",
      language: "French",
      countryRegion: "France",
      platform: "Facebook Reels",
      hook: "This meme escalates every second",
      caption: "Caption ladder made payoff clear.",
      capcutTemplate: "Meme Caption Ladder",
      status: "Reviewed",
      views: 13240,
      likes: 1112,
      comments: 96,
      saves: 278,
      shares: 104,
      notes: "Lower comments but stable save-rate."
    }),
    createEntry("demo-entry-05", 9, {
      creator: "Adapt",
      clipCategory: "Translated subtitle clips",
      language: "Arabic",
      countryRegion: "UAE",
      platform: "TikTok",
      hook: "Translated line that changed the clip meaning",
      caption: "Readability-first subtitle pass.",
      capcutTemplate: "Translation Momentum Cut",
      status: "Posted",
      views: 27430,
      likes: 2910,
      comments: 318,
      saves: 702,
      shares: 246,
      notes: "Strong saves/1k and repeat views."
    }),
    createEntry("demo-entry-06", 8, {
      creator: "Marlon",
      clipCategory: "Just chatting/IRL clips",
      language: "German",
      countryRegion: "Germany",
      platform: "Instagram Reels",
      hook: "IRL moment that flips in the last 3 seconds",
      caption: "Scene pulse pacing with ambient inserts.",
      capcutTemplate: "IRL Scene Pulse",
      status: "Reviewed",
      views: 16010,
      likes: 1494,
      comments: 133,
      saves: 334,
      shares: 121,
      notes: "Ending beat drives completion."
    }),
    createEntry("demo-entry-07", 7, {
      creator: "Jason",
      clipCategory: "Gaming clips",
      language: "English",
      countryRegion: "United States",
      platform: "YouTube Shorts",
      hook: "One decision turned the whole game",
      caption: "Potential week opener for batch two.",
      capcutTemplate: "Story Thread Overlay",
      status: "Ready",
      views: 9200,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      notes: "Scheduled for Friday release."
    }),
    createEntry("demo-entry-08", 6, {
      creator: "Stable Ronaldo",
      clipCategory: "Comedy/group banter clips",
      language: "English",
      countryRegion: "United States",
      platform: "TikTok",
      hook: "The line everyone quoted in chat",
      caption: "",
      capcutTemplate: "Banter Split Screen",
      status: "Editing",
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      notes: "Need hook variant test before posting."
    }),
    createEntry("demo-entry-09", 5, {
      creator: "Lacy",
      clipCategory: "Story/context clips",
      language: "Spanish",
      countryRegion: "Spain",
      platform: "Instagram Reels",
      hook: "What happened before this stream blow-up",
      caption: "Narrative compression pass v2.",
      capcutTemplate: "Story Thread Overlay",
      status: "Ready",
      views: 0,
      likes: 0,
      comments: 0,
      saves: 0,
      shares: 0,
      notes: "Ready after subtitle QA."
    }),
    createEntry("demo-entry-10", 4, {
      creator: "Silky",
      clipCategory: "Meme/reaction edits",
      language: "French",
      countryRegion: "Canada",
      platform: "Facebook Reels",
      hook: "Reaction face says everything",
      caption: "",
      capcutTemplate: "Meme Caption Ladder",
      status: "Idea",
      notes: "Need cleaner source clip before edit."
    }),
    createEntry("demo-entry-11", 3, {
      creator: "Adapt",
      clipCategory: "Translated subtitle clips",
      language: "Arabic",
      countryRegion: "Saudi Arabia",
      platform: "TikTok",
      hook: "Most misunderstood line from this VOD",
      caption: "Translation-first packaging.",
      capcutTemplate: "Translation Momentum Cut",
      status: "Editing",
      notes: "Testing two subtitle density variants."
    }),
    createEntry("demo-entry-12", 2, {
      creator: "Marlon",
      clipCategory: "Just chatting/IRL clips",
      language: "German",
      countryRegion: "Austria",
      platform: "Instagram Reels",
      hook: "Quiet setup, loud ending",
      caption: "Keeping this one short for retention.",
      capcutTemplate: "IRL Scene Pulse",
      status: "Ready",
      notes: "Queued behind current release."
    }),
    createEntry("demo-entry-13", 1, {
      creator: "Jason",
      clipCategory: "Chaos/rage clips",
      language: "English",
      countryRegion: "United Kingdom",
      platform: "TikTok",
      hook: "Clip that made the squad lose it",
      caption: "",
      capcutTemplate: "Chaos Cold Open + Snap Zoom",
      status: "Editing",
      notes: "Need alternate cold open frame."
    }),
    createEntry("demo-entry-14", 0, {
      creator: "Stable Ronaldo",
      clipCategory: "Gaming clips",
      language: "Portuguese",
      countryRegion: "Portugal",
      platform: "YouTube Shorts",
      hook: "Final 10 seconds changed everything",
      caption: "Drafting now for tomorrow post.",
      capcutTemplate: "Story Thread Overlay",
      status: "Idea",
      notes: "Waiting on final trim decision."
    })
  ];

  const baselineLogs: BaselineLogEntry[] = [
    createBaselineLog("demo-baseline-01", 9, {
      savesPerThousand: 46,
      completionRate: 61,
      negativeFeedbackRate: 4.9,
      productionMinutes: 39,
      notes: "Baseline start"
    }),
    createBaselineLog("demo-baseline-02", 8, {
      savesPerThousand: 47,
      completionRate: 60,
      negativeFeedbackRate: 5.1,
      productionMinutes: 37,
      notes: "Control day"
    }),
    createBaselineLog("demo-baseline-03", 7, {
      savesPerThousand: 48,
      completionRate: 62,
      negativeFeedbackRate: 4.8,
      productionMinutes: 36,
      notes: "Hook iteration A"
    }),
    createBaselineLog("demo-baseline-04", 6, {
      savesPerThousand: 49,
      completionRate: 63,
      negativeFeedbackRate: 4.7,
      productionMinutes: 35,
      notes: "Template cleanup"
    }),
    createBaselineLog("demo-baseline-05", 5, {
      savesPerThousand: 50,
      completionRate: 64,
      negativeFeedbackRate: 4.6,
      productionMinutes: 34,
      notes: "Translation pass"
    }),
    createBaselineLog("demo-baseline-06", 4, {
      savesPerThousand: 52,
      completionRate: 65,
      negativeFeedbackRate: 4.4,
      productionMinutes: 33,
      notes: "Retention improved"
    }),
    createBaselineLog("demo-baseline-07", 3, {
      savesPerThousand: 53,
      completionRate: 66,
      negativeFeedbackRate: 4.2,
      productionMinutes: 32,
      notes: "Stronger opener"
    }),
    createBaselineLog("demo-baseline-08", 2, {
      savesPerThousand: 54,
      completionRate: 67,
      negativeFeedbackRate: 4,
      productionMinutes: 32,
      notes: "Guardrails clean"
    }),
    createBaselineLog("demo-baseline-09", 1, {
      savesPerThousand: 55,
      completionRate: 67.5,
      negativeFeedbackRate: 3.9,
      productionMinutes: 31,
      notes: "Stable trend"
    }),
    createBaselineLog("demo-baseline-10", 0, {
      savesPerThousand: 56,
      completionRate: 68,
      negativeFeedbackRate: 3.8,
      productionMinutes: 31,
      notes: "Latest baseline"
    })
  ];

  const checkpointState: CheckpointOpsState = {
    windowStartDate: dayStringDaysAgo(6),
    checkpointDate: dayStringDaysAgo(0),
    baselineWindowDays: 7,
    currentSavesPerThousand: "59",
    currentCompletionRate: "70",
    currentNegativeFeedbackRate: "3.6",
    currentProductionMinutes: "30",
    srmStatus: "Pass",
    dataCompleteness: "Complete",
    guardrailBreaches: "1",
    checklistEvidenceCaptured: true,
    checklistSampleAdequate: true,
    checklistGuardrailsReviewed: true,
    checklistDecisionReady: true
  };

  return {
    entries,
    templates,
    baselineLogs,
    checkpointState
  };
}
