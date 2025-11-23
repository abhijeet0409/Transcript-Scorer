import { useState } from 'react';
import { Award, Sparkles } from 'lucide-react';
import TranscriptInput from './components/TranscriptInput';
import ScoringResults from './components/ScoringResults';
import { scoreTranscript } from './services/scoringService';
import { ScoringResult } from './types/scoring';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (transcript: string, duration?: number) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const scoringResult = await scoreTranscript(transcript, duration);
      setResult(scoringResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scoring the transcript');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      <div className="relative z-10">
        <header className="py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg transform rotate-12">
                <Award className="w-10 h-10 text-white transform -rotate-12" />
              </div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Transcript Scorer
              </h1>
              <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              AI-powered transcript analysis using rule-based, NLP, and semantic scoring techniques
            </p>
          </div>
        </header>

        <main className="px-4 pb-16 space-y-12">
          <TranscriptInput onSubmit={handleSubmit} isLoading={isLoading} />

          {error && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
              </div>
            </div>
          )}

          {result && <ScoringResults result={result} />}
        </main>

        <footer className="text-center py-8 text-gray-500 text-sm">
          <p>Powered by advanced scoring algorithms • Rule-based + NLP + Semantic Analysis</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
