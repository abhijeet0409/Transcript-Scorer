import { TranscriptRequest, ScoringResult } from '../types/scoring';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function scoreTranscript(
  transcript: string,
  durationSec?: number
): Promise<ScoringResult> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/score-transcript`;

  const headers = {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const body: TranscriptRequest = {
    transcript,
    durationSec,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to score transcript' }));
    throw new Error(error.error || 'Failed to score transcript');
  }

  return await response.json();
}
