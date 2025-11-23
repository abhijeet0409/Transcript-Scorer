import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TranscriptRequest {
  transcript: string;
  durationSec?: number;
}

interface CriterionResult {
  score: number;
  maxScore: number;
  feedback: string[];
  details: Record<string, any>;
}

interface ScoringResult {
  overallScore: number;
  criterionScores: Record<string, CriterionResult>;
  wordCount: number;
  sentenceCount: number;
  feedback: Record<string, string[]>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { transcript, durationSec }: TranscriptRequest = await req.json();

    if (!transcript || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Transcript text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = scoreTranscript(transcript, durationSec);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error scoring transcript:", error);
    return new Response(
      JSON.stringify({ error: "Failed to score transcript" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function scoreTranscript(transcript: string, durationSec?: number): ScoringResult {
  const words = transcript.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  const criterionScores: Record<string, CriterionResult> = {};

  criterionScores.salutation = scoreSalutation(transcript);
  criterionScores.contentStructure = scoreContentStructure(transcript, words);
  criterionScores.flow = scoreFlow(transcript);
  criterionScores.speechRate = scoreSpeechRate(wordCount, durationSec);
  criterionScores.grammar = scoreGrammar(transcript);
  criterionScores.vocabularyRichness = scoreVocabularyRichness(words);
  criterionScores.clarity = scoreClarity(words);
  criterionScores.engagement = scoreEngagement(transcript);

  const totalScore = Object.values(criterionScores).reduce(
    (sum, criterion) => sum + criterion.score,
    0
  );

  const feedback: Record<string, string[]> = {};
  Object.entries(criterionScores).forEach(([key, value]) => {
    feedback[key] = value.feedback;
  });

  return {
    overallScore: Math.round(totalScore * 100) / 100,
    criterionScores,
    wordCount,
    sentenceCount,
    feedback,
  };
}

function scoreSalutation(transcript: string): CriterionResult {
  const text = transcript.toLowerCase();
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 5;

  const excellentPhrases = ["i am excited", "feeling great", "excited to introduce"];
  const goodPhrases = ["good morning", "good afternoon", "good evening", "good day", "hello everyone"];
  const normalPhrases = ["hi", "hello"];

  if (excellentPhrases.some(phrase => text.includes(phrase))) {
    score = 5;
    feedback.push("Excellent salutation with enthusiasm detected!");
  } else if (goodPhrases.some(phrase => text.includes(phrase))) {
    score = 4;
    feedback.push("Good formal salutation found.");
  } else if (normalPhrases.some(phrase => text.includes(phrase))) {
    score = 2;
    feedback.push("Basic salutation present.");
  } else {
    score = 0;
    feedback.push("No clear salutation found. Consider starting with a greeting.");
  }

  return {
    score,
    maxScore,
    feedback,
    details: { type: score === 5 ? "excellent" : score >= 4 ? "good" : score >= 2 ? "normal" : "none" },
  };
}

function scoreContentStructure(transcript: string, words: string[]): CriterionResult {
  const text = transcript.toLowerCase();
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 30;

  const mustHaveKeywords = {
    name: ["name", "myself", "i am", "i'm"],
    age: ["age", "years old", "year old"],
    school: ["school", "class", "grade", "studying"],
    family: ["family", "parents", "mother", "father", "siblings"],
    hobbies: ["hobby", "hobbies", "enjoy", "like", "love", "interest", "free time", "play"],
  };

  const goodToHaveKeywords = {
    aboutFamily: ["family is", "people in my family", "live with"],
    origin: ["from", "born in", "live in"],
    ambition: ["want to", "goal", "dream", "ambition", "future"],
    uniqueFact: ["fun fact", "interesting", "special thing", "unique", "don't know about me"],
    strengths: ["good at", "strength", "achievement", "proud"],
  };

  Object.entries(mustHaveKeywords).forEach(([key, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      score += 4;
      feedback.push(`✓ ${key.charAt(0).toUpperCase() + key.slice(1)} mentioned`);
    } else {
      feedback.push(`✗ ${key.charAt(0).toUpperCase() + key.slice(1)} missing`);
    }
  });

  Object.entries(goodToHaveKeywords).forEach(([key, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      score += 2;
      feedback.push(`+ ${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} included`);
    }
  });

  return {
    score: Math.min(score, maxScore),
    maxScore,
    feedback,
    details: { foundMustHave: score >= 16, foundGoodToHave: score > 20 },
  };
}

function scoreFlow(transcript: string): CriterionResult {
  const text = transcript.toLowerCase();
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 10;

  const sections = [
    { name: "Salutation", keywords: ["hello", "hi", "good morning", "good afternoon", "good evening"] },
    { name: "Basic Details", keywords: ["name", "myself", "age", "class", "school"] },
    { name: "Additional Details", keywords: ["family", "hobby", "enjoy", "like", "fun fact"] },
    { name: "Closing", keywords: ["thank you", "thanks", "that's all"] },
  ];

  let lastMatchIndex = -1;
  let orderFollowed = true;

  sections.forEach((section) => {
    const matchIndex = section.keywords.findIndex(kw => text.includes(kw));
    if (matchIndex !== -1) {
      const position = text.indexOf(section.keywords[matchIndex]);
      if (position < lastMatchIndex) {
        orderFollowed = false;
      }
      lastMatchIndex = position;
    }
  });

  if (orderFollowed) {
    score = 10;
    feedback.push("Introduction follows logical order.");
  } else {
    score = 5;
    feedback.push("Introduction structure could be improved. Suggested order: Salutation → Basic Details → Additional Details → Closing");
  }

  return {
    score,
    maxScore,
    feedback,
    details: { orderFollowed },
  };
}

function scoreSpeechRate(wordCount: number, durationSec?: number): CriterionResult {
  const feedback: string[] = [];
  let score = 0;
  const maxScore = 10;

  if (!durationSec || durationSec === 0) {
    feedback.push("Duration not provided. Speech rate could not be calculated.");
    return {
      score: maxScore / 2,
      maxScore,
      feedback,
      details: { wpm: null },
    };
  }

  const wpm = Math.round((wordCount / durationSec) * 60);

  if (wpm >= 111 && wpm <= 140) {
    score = 10;
    feedback.push(`Ideal speech rate: ${wpm} WPM`);
  } else if (wpm >= 141 && wpm <= 160) {
    score = 8;
    feedback.push(`Slightly fast speech rate: ${wpm} WPM. Try to slow down a bit.`);
  } else if (wpm >= 81 && wpm <= 110) {
    score = 6;
    feedback.push(`Slightly slow speech rate: ${wpm} WPM. Try to speak a bit faster.`);
  } else if (wpm > 160) {
    score = 4;
    feedback.push(`Too fast: ${wpm} WPM. Slow down to improve clarity.`);
  } else {
    score = 2;
    feedback.push(`Too slow: ${wpm} WPM. Try to increase your pace.`);
  }

  return {
    score,
    maxScore,
    feedback,
    details: { wpm },
  };
}

function scoreGrammar(transcript: string): CriterionResult {
  const feedback: string[] = [];
  let errorCount = 0;
  const maxScore = 10;

  const commonErrors = [
    { pattern: /\bi is\b/gi, suggestion: "subject-verb agreement" },
    { pattern: /\bthey is\b/gi, suggestion: "subject-verb agreement" },
    { pattern: /\bdon't has\b/gi, suggestion: "auxiliary verb usage" },
    { pattern: /\bgoed\b/gi, suggestion: "past tense" },
    { pattern: /\bmore better\b/gi, suggestion: "double comparative" },
  ];

  commonErrors.forEach(error => {
    const matches = transcript.match(error.pattern);
    if (matches) {
      errorCount += matches.length;
    }
  });

  const words = transcript.split(/\s+/).length;
  const errorsPer100 = (errorCount / words) * 100;
  const grammarScore = 1 - Math.min(errorsPer100 / 10, 1);
  const score = Math.round(grammarScore * maxScore);

  if (score >= 9) {
    feedback.push("Excellent grammar with minimal errors.");
  } else if (score >= 7) {
    feedback.push(`Good grammar. ${errorCount} potential issue(s) detected.`);
  } else if (score >= 5) {
    feedback.push(`Fair grammar. ${errorCount} errors found. Review sentence structure.`);
  } else {
    feedback.push(`Multiple grammar issues detected (${errorCount}). Consider reviewing basic grammar rules.`);
  }

  return {
    score,
    maxScore,
    feedback,
    details: { errorCount, errorsPer100: Math.round(errorsPer100 * 10) / 10 },
  };
}

function scoreVocabularyRichness(words: string[]): CriterionResult {
  const feedback: string[] = [];
  const maxScore = 15;

  const cleanWords = words.map(w => w.replace(/[^a-z0-9]/g, '')).filter(w => w.length > 0);
  const uniqueWords = new Set(cleanWords);
  const ttr = uniqueWords.size / cleanWords.length;

  let score = 0;
  if (ttr >= 0.9) {
    score = 15;
    feedback.push(`Excellent vocabulary diversity (TTR: ${ttr.toFixed(2)})`);
  } else if (ttr >= 0.7) {
    score = 12;
    feedback.push(`Good vocabulary range (TTR: ${ttr.toFixed(2)})`);
  } else if (ttr >= 0.5) {
    score = 9;
    feedback.push(`Moderate vocabulary diversity (TTR: ${ttr.toFixed(2)})`);
  } else if (ttr >= 0.3) {
    score = 6;
    feedback.push(`Limited vocabulary range (TTR: ${ttr.toFixed(2)}). Try using more varied words.`);
  } else {
    score = 3;
    feedback.push(`Very repetitive vocabulary (TTR: ${ttr.toFixed(2)}). Work on expanding word choices.`);
  }

  return {
    score,
    maxScore,
    feedback,
    details: { ttr: Math.round(ttr * 100) / 100, uniqueWords: uniqueWords.size, totalWords: cleanWords.length },
  };
}

function scoreClarity(words: string[]): CriterionResult {
  const feedback: string[] = [];
  const maxScore = 15;

  const fillerWords = [
    "um", "uh", "like", "you know", "so", "actually", "basically",
    "right", "i mean", "well", "kinda", "sort of", "okay", "hmm", "ah"
  ];

  const text = words.join(' ');
  let fillerCount = 0;

  fillerWords.forEach(filler => {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = text.match(regex);
    if (matches) {
      fillerCount += matches.length;
    }
  });

  const fillerRate = (fillerCount / words.length) * 100;

  let score = 0;
  if (fillerRate < 0.3) {
    score = 15;
    feedback.push(`Excellent clarity with minimal filler words (${fillerRate.toFixed(1)}%)`);
  } else if (fillerRate < 0.5) {
    score = 12;
    feedback.push(`Good clarity (${fillerRate.toFixed(1)}% filler words)`);
  } else if (fillerRate < 0.7) {
    score = 9;
    feedback.push(`Moderate use of filler words (${fillerRate.toFixed(1)}%). Try to reduce them.`);
  } else if (fillerRate < 0.9) {
    score = 6;
    feedback.push(`Frequent filler words (${fillerRate.toFixed(1)}%). Practice speaking more deliberately.`);
  } else {
    score = 3;
    feedback.push(`Excessive filler words (${fillerRate.toFixed(1)}%). Focus on pausing instead of using fillers.`);
  }

  if (fillerCount > 0) {
    feedback.push(`Found ${fillerCount} filler word(s) in ${words.length} total words.`);
  }

  return {
    score,
    maxScore,
    feedback,
    details: { fillerCount, fillerRate: Math.round(fillerRate * 10) / 10 },
  };
}

function scoreEngagement(transcript: string): CriterionResult {
  const feedback: string[] = [];
  const maxScore = 15;

  const text = transcript.toLowerCase();

  const positiveWords = [
    "excited", "happy", "great", "wonderful", "amazing", "love", "enjoy",
    "favorite", "fun", "interesting", "thank", "grateful", "proud"
  ];

  const negativeWords = [
    "boring", "hate", "terrible", "awful", "bad", "dislike", "unfortunately"
  ];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}`, 'gi');
    const matches = text.match(regex);
    if (matches) positiveCount += matches.length;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}`, 'gi');
    const matches = text.match(regex);
    if (matches) negativeCount += matches.length;
  });

  const totalSentimentWords = positiveCount + negativeCount;
  const sentimentScore = totalSentimentWords > 0
    ? positiveCount / totalSentimentWords
    : 0.5;

  let score = 0;
  if (sentimentScore >= 0.9) {
    score = 15;
    feedback.push("Highly positive and engaging tone!");
  } else if (sentimentScore >= 0.7) {
    score = 12;
    feedback.push("Positive and enthusiastic delivery.");
  } else if (sentimentScore >= 0.5) {
    score = 9;
    feedback.push("Neutral tone. Consider adding more enthusiasm.");
  } else if (sentimentScore >= 0.3) {
    score = 6;
    feedback.push("Somewhat negative tone. Try to be more positive.");
  } else {
    score = 3;
    feedback.push("Negative tone detected. Focus on positive language.");
  }

  return {
    score,
    maxScore,
    feedback,
    details: {
      sentimentScore: Math.round(sentimentScore * 100) / 100,
      positiveWords: positiveCount,
      negativeWords: negativeCount,
    },
  };
}
