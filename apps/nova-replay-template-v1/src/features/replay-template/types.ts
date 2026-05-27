export type SegmentType = "hook" | "context" | "payoff" | "pivot" | "cta";

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
  version: 1;
  videos: ReplayVideoRecord[];
  manualReplaySegments: ManualReplaySegment[];
  templates: TemplateRecord[];
  recommendations: RecommendationRecord[];
}
