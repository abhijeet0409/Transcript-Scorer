export interface CriterionResult {
  score: number;
  maxScore: number;
  feedback: string[];
  details: Record<string, any>;
}

export interface ScoringResult {
  overallScore: number;
  criterionScores: Record<string, CriterionResult>;
  wordCount: number;
  sentenceCount: number;
  feedback: Record<string, string[]>;
}

export interface TranscriptRequest {
  transcript: string;
  durationSec?: number;
}
