export type SegmentType = "hook" | "context" | "payoff" | "pivot" | "cta";
export type ChannelKey = "core-boys" | "soccer" | "gta6";

export interface ChannelRecord {
  id: ChannelKey;
  name: string;
  youtubeHandle: string;
  createdAt: string;
  updatedAt: string;
}

export interface ManualReplaySegment {
  id: string;
  videoId: string;
  startSec: number;
  endSec: number;
  note: string;
  createdAt: string;
}

export interface ReplayVideoRecord {
  id: string;
  channelId: ChannelKey;
  videoUrl: string;
  title: string;
  durationSec: number;
  createdAt: string;
}

export interface SegmentBlueprintSlot {
  slot: SegmentType;
  targetStartPct: number;
  targetEndPct: number;
  weight: number;
}

export interface TemplateRecord {
  id: string;
  templateName: string;
  version: string;
  platform: string;
  simplicity: number;
  hookStyle: string;
  ctaStyle: string;
  blueprint: SegmentBlueprintSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface CutRecommendationSegment {
  segmentType: SegmentType;
  startSec: number;
  endSec: number;
  confidence: number;
  reason: string;
}

export interface RecommendationRecord {
  id: string;
  videoId: string;
  templateId: string;
  templateName: string;
  rank: number;
  totalScore: number;
  reasons: string[];
  cutSegments: CutRecommendationSegment[];
  createdAt: string;
  elapsedSeconds: number;
}

export interface RankedRecommendation {
  template: TemplateRecord;
  totalScore: number;
  reasons: string[];
  cutSegments: CutRecommendationSegment[];
}

export interface ReplayTemplateStore {
  version: 2;
  channels: ChannelRecord[];
  videos: ReplayVideoRecord[];
  manualReplaySegments: ManualReplaySegment[];
  templates: TemplateRecord[];
  recommendations: RecommendationRecord[];
}
