import type {
  CutRecommendationSegment,
  ManualReplaySegment,
  RankedRecommendation,
  SegmentBlueprintSlot,
  SegmentType,
  TemplateRecord
} from "../types";

export interface ValidationError {
  index: number;
  message: string;
}

function roundTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function validateSegments(
  segments: Pick<ManualReplaySegment, "startSec" | "endSec">[],
  durationSec: number
): ValidationError[] {
  const errors: ValidationError[] = [];

  segments.forEach((segment, index) => {
    if (segment.startSec < 0 || segment.endSec < 0) {
      errors.push({ index, message: "Timestamps must be non-negative." });
    }
    if (segment.endSec <= segment.startSec) {
      errors.push({ index, message: "End must be greater than start." });
    }
    if (segment.endSec > durationSec) {
      errors.push({ index, message: "End exceeds video duration." });
    }
    if (segment.endSec - segment.startSec < 2) {
      errors.push({ index, message: "Segment must be at least 2 seconds." });
    }
  });

  for (let i = 0; i < segments.length; i += 1) {
    for (let j = i + 1; j < segments.length; j += 1) {
      if (
        overlap(
          segments[i].startSec,
          segments[i].endSec,
          segments[j].startSec,
          segments[j].endSec
        )
      ) {
        errors.push({ index: j, message: "Segments must not overlap." });
      }
    }
  }

  return errors;
}

function slotScore(
  segment: ManualReplaySegment,
  slot: SegmentBlueprintSlot,
  durationSec: number
): number {
  const segmentMidPct = ((segment.startSec + segment.endSec) / 2 / durationSec) * 100;
  const slotMidPct = (slot.targetStartPct + slot.targetEndPct) / 2;
  const distance = Math.abs(segmentMidPct - slotMidPct);
  return Math.max(0, 1 - distance / 100) * slot.weight;
}

function bestSlotForSegment(
  segment: ManualReplaySegment,
  blueprint: SegmentBlueprintSlot[],
  durationSec: number
): SegmentBlueprintSlot {
  let best = blueprint[0];
  let bestScore = -1;

  blueprint.forEach((slot) => {
    const score = slotScore(segment, slot, durationSec);
    if (score > bestScore) {
      bestScore = score;
      best = slot;
    }
  });

  return best;
}

function labelReason(segmentType: SegmentType, segment: ManualReplaySegment): string {
  const duration = roundTwo(segment.endSec - segment.startSec);
  return `${segmentType} mapped from replay segment ${segment.startSec}s-${segment.endSec}s (${duration}s)`;
}

function buildCutSegments(
  segments: ManualReplaySegment[],
  template: TemplateRecord,
  durationSec: number
): CutRecommendationSegment[] {
  return segments
    .map((segment) => {
      const slot = bestSlotForSegment(segment, template.blueprint, durationSec);
      const confidence = Math.min(100, Math.max(40, Math.round(slotScore(segment, slot, durationSec) * 100)));
      return {
        segmentType: slot.slot,
        startSec: segment.startSec,
        endSec: segment.endSec,
        confidence,
        reason: labelReason(slot.slot, segment)
      };
    })
    .sort((a, b) => a.startSec - b.startSec);
}

function totalTemplateScore(
  template: TemplateRecord,
  segments: ManualReplaySegment[],
  durationSec: number
): number {
  if (!segments.length) return 0;

  const fitTotal = segments.reduce((sum, segment) => {
    const slot = bestSlotForSegment(segment, template.blueprint, durationSec);
    return sum + slotScore(segment, slot, durationSec);
  }, 0);

  const fitAvg = fitTotal / segments.length;
  const timingFit = Math.min(1, fitAvg / 1.25);
  const simplicityBoost = template.simplicity / 5;
  const penalty = Math.max(0, (segments.length - 6) * 0.03);
  const rawScore = timingFit * 0.75 + simplicityBoost * 0.25 - penalty;
  return roundTwo(Math.max(0, rawScore) * 100);
}

export function rankTemplates(
  templates: TemplateRecord[],
  segments: ManualReplaySegment[],
  durationSec: number
): RankedRecommendation[] {
  return templates
    .map((template) => {
      const totalScore = totalTemplateScore(template, segments, durationSec);
      const cutSegments = buildCutSegments(segments, template, durationSec);
      const reasons = [
        `Timing fit score: ${totalScore}`,
        `Template simplicity: ${template.simplicity}/5`,
        `Primary mapped slot: ${cutSegments[0]?.segmentType ?? "n/a"}`
      ];
      return { template, totalScore, reasons, cutSegments };
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 3);
}

export function buildEditorBrief(
  videoId: string,
  ranked: RankedRecommendation[],
  elapsedSeconds: number
): string {
  const best = ranked[0];
  if (!best) return "No recommendation available.";

  const segmentLines = best.cutSegments
    .map(
      (segment, index) =>
        `${index + 1}. ${segment.segmentType.toUpperCase()} ${segment.startSec}s-${segment.endSec}s (${segment.confidence}%): ${segment.reason}`
    )
    .join("\n");

  const alternateLines = ranked
    .slice(1)
    .map((entry, index) => `${index + 2}. ${entry.template.templateName} (${entry.totalScore})`)
    .join("\n");

  return [
    `# Nova Replay-to-Template Brief`,
    ``,
    `- Atlas role (v1): architecture label only; Forge runtime flow.`,
    `- Video ID: ${videoId}`,
    `- Recommended template: ${best.template.templateName} v${best.template.version}`,
    `- Score: ${best.totalScore}`,
    `- Elapsed (URL paste -> copy brief): ${elapsedSeconds}s`,
    ``,
    `## Recommended Cut Segments`,
    segmentLines,
    ``,
    `## Alternate Templates`,
    alternateLines || "None",
    ``,
    `## Rationale`,
    ...best.reasons.map((reason) => `- ${reason}`)
  ].join("\n");
}

