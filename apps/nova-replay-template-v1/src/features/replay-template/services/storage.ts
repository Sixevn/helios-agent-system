import type {
  ChannelKey,
  ChannelRecord,
  ManualReplaySegment,
  RecommendationRecord,
  ReplayTemplateStore,
  ReplayVideoRecord,
  TemplateRecord
} from "../types";

const STORAGE_KEY = "nova_replay_template_v1";
// v1 only: localStorage runtime store. Migrate to SQLite schema contract in schema.sqlite.sql.

function nowIso(): string {
  return new Date().toISOString();
}

function createDefaultChannels(): ChannelRecord[] {
  const timestamp = nowIso();
  return [
    {
      id: "core-boys",
      name: "Core Boys",
      youtubeHandle: "@createownruneverything",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "soccer",
      name: "Soccer",
      youtubeHandle: "@soccer",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "gta6",
      name: "GTA 6",
      youtubeHandle: "@RockstarGames",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}

function createDefaultTemplates(): TemplateRecord[] {
  const timestamp = nowIso();
  return [
    {
      id: "tpl-rapid-opener",
      templateName: "Rapid Opener Punch",
      version: "1.0",
      platform: "YouTube Shorts",
      simplicity: 5,
      hookStyle: "Immediate claim",
      ctaStyle: "Comment bait",
      blueprint: [
        { slot: "hook", targetStartPct: 0, targetEndPct: 15, weight: 1.2 },
        { slot: "context", targetStartPct: 15, targetEndPct: 35, weight: 1.0 },
        { slot: "payoff", targetStartPct: 35, targetEndPct: 68, weight: 1.1 },
        { slot: "pivot", targetStartPct: 68, targetEndPct: 85, weight: 0.9 },
        { slot: "cta", targetStartPct: 85, targetEndPct: 100, weight: 1.0 }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "tpl-story-loop",
      templateName: "Story Loop Escalation",
      version: "1.3",
      platform: "YouTube Shorts",
      simplicity: 3,
      hookStyle: "Problem hook",
      ctaStyle: "Save + follow",
      blueprint: [
        { slot: "hook", targetStartPct: 0, targetEndPct: 12, weight: 1.1 },
        { slot: "context", targetStartPct: 12, targetEndPct: 42, weight: 1.0 },
        { slot: "payoff", targetStartPct: 42, targetEndPct: 75, weight: 1.25 },
        { slot: "pivot", targetStartPct: 75, targetEndPct: 90, weight: 0.95 },
        { slot: "cta", targetStartPct: 90, targetEndPct: 100, weight: 1.0 }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "tpl-proof-stack",
      templateName: "Proof Stack Cutdown",
      version: "2.1",
      platform: "YouTube Shorts",
      simplicity: 4,
      hookStyle: "Data-led hook",
      ctaStyle: "Share prompt",
      blueprint: [
        { slot: "hook", targetStartPct: 0, targetEndPct: 10, weight: 1.15 },
        { slot: "context", targetStartPct: 10, targetEndPct: 30, weight: 0.95 },
        { slot: "payoff", targetStartPct: 30, targetEndPct: 70, weight: 1.25 },
        { slot: "pivot", targetStartPct: 70, targetEndPct: 88, weight: 0.9 },
        { slot: "cta", targetStartPct: 88, targetEndPct: 100, weight: 1.0 }
      ],
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ];
}

function emptyStore(): ReplayTemplateStore {
  return {
    version: 2,
    channels: createDefaultChannels(),
    videos: [],
    manualReplaySegments: [],
    templates: createDefaultTemplates(),
    recommendations: []
  };
}

interface LegacyReplayTemplateStoreV1 {
  version: 1;
  videos?: Array<{
    id: string;
    videoUrl: string;
    title: string;
    durationSec: number;
    createdAt: string;
  }>;
  manualReplaySegments?: ManualReplaySegment[];
  templates?: TemplateRecord[];
  recommendations?: RecommendationRecord[];
}

function withDefaults(partial: Partial<ReplayTemplateStore>): ReplayTemplateStore {
  return {
    version: 2,
    channels: partial.channels?.length ? partial.channels : createDefaultChannels(),
    videos: partial.videos ?? [],
    manualReplaySegments: partial.manualReplaySegments ?? [],
    templates: partial.templates?.length ? partial.templates : createDefaultTemplates(),
    recommendations: partial.recommendations ?? []
  };
}

function migrateV1ToV2(input: LegacyReplayTemplateStoreV1): ReplayTemplateStore {
  const defaultChannelId: ChannelKey = "core-boys";
  const migratedVideos = (input.videos ?? []).map((video) => ({
    ...video,
    channelId: defaultChannelId
  }));
  return withDefaults({
    videos: migratedVideos,
    manualReplaySegments: input.manualReplaySegments ?? [],
    templates: input.templates ?? [],
    recommendations: input.recommendations ?? []
  });
}

export function loadReplayTemplateStore(): ReplayTemplateStore {
  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (!raw) return emptyStore();

  try {
    const parsed = JSON.parse(raw) as ReplayTemplateStore | LegacyReplayTemplateStoreV1;
    if (parsed?.version === 2) return withDefaults(parsed);
    if (parsed?.version === 1) return migrateV1ToV2(parsed);
    return emptyStore();
  } catch {
    return emptyStore();
  }
}

export function saveReplayTemplateStore(store: ReplayTemplateStore): void {
  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function upsertVideoRecord(
  store: ReplayTemplateStore,
  video: ReplayVideoRecord
): ReplayTemplateStore {
  const filtered = store.videos.filter((item) => item.id !== video.id);
  return {
    ...store,
    videos: [video, ...filtered]
  };
}

export function replaceVideoSegments(
  store: ReplayTemplateStore,
  videoId: string,
  segments: ManualReplaySegment[]
): ReplayTemplateStore {
  return {
    ...store,
    manualReplaySegments: [
      ...store.manualReplaySegments.filter((item) => item.videoId !== videoId),
      ...segments
    ]
  };
}

export function saveRecommendations(
  store: ReplayTemplateStore,
  videoId: string,
  items: RecommendationRecord[]
): ReplayTemplateStore {
  return {
    ...store,
    recommendations: [
      ...store.recommendations.filter((item) => item.videoId !== videoId),
      ...items
    ]
  };
}

