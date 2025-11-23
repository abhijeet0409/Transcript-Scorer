/*
  # Transcript Scoring System Schema

  1. New Tables
    - `scoring_results`
      - `id` (uuid, primary key)
      - `transcript_text` (text)
      - `word_count` (integer)
      - `sentence_count` (integer)
      - `duration_sec` (integer, optional)
      - `overall_score` (numeric)
      - `criterion_scores` (jsonb) - stores detailed per-criterion scores
      - `feedback` (jsonb) - stores feedback for each criterion
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `scoring_results` table
    - Add policy for public insert (anyone can score transcripts)
    - Add policy for public read (anyone can view results)
*/

CREATE TABLE IF NOT EXISTS scoring_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_text text NOT NULL,
  word_count integer DEFAULT 0,
  sentence_count integer DEFAULT 0,
  duration_sec integer,
  overall_score numeric(5,2) DEFAULT 0,
  criterion_scores jsonb DEFAULT '{}'::jsonb,
  feedback jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scoring_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert scoring results"
  ON scoring_results
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can read scoring results"
  ON scoring_results
  FOR SELECT
  TO anon
  USING (true);