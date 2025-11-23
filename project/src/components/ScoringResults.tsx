import { CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { ScoringResult } from '../types/scoring';

interface ScoringResultsProps {
  result: ScoringResult;
}

const criteriaLabels: Record<string, string> = {
  salutation: 'Salutation Level',
  contentStructure: 'Content & Structure',
  flow: 'Flow & Organization',
  speechRate: 'Speech Rate',
  grammar: 'Grammar',
  vocabularyRichness: 'Vocabulary Richness',
  clarity: 'Clarity',
  engagement: 'Engagement',
};

export default function ScoringResults({ result }: ScoringResultsProps) {
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-blue-50 border-blue-200';
    if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getOverallScoreColor = () => {
    const percentage = result.overallScore;
    if (percentage >= 80) return 'from-green-500 to-green-600';
    if (percentage >= 60) return 'from-blue-500 to-blue-600';
    if (percentage >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getFeedbackIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (percentage >= 60) return <AlertCircle className="w-5 h-5 text-blue-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn">
      <div className={`bg-gradient-to-br ${getOverallScoreColor()} rounded-2xl shadow-2xl p-8 text-white transform transition-all hover:scale-105`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Overall Score</h2>
            <p className="text-white/90 text-lg">
              {result.wordCount} words • {result.sentenceCount} sentences
            </p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-black">{result.overallScore}</div>
            <div className="text-xl font-semibold opacity-90">/ 100</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(result.criterionScores).map(([key, criterion]) => {
          const percentage = (criterion.score / criterion.maxScore) * 100;

          return (
            <div
              key={key}
              className={`bg-white rounded-xl shadow-lg border-2 ${getScoreBgColor(criterion.score, criterion.maxScore)} p-6 transform transition-all hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getFeedbackIcon(criterion.score, criterion.maxScore)}
                  <h3 className="font-bold text-lg text-gray-800">
                    {criteriaLabels[key] || key}
                  </h3>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getScoreColor(criterion.score, criterion.maxScore)}`}>
                    {criterion.score}
                  </div>
                  <div className="text-sm text-gray-500">/ {criterion.maxScore}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${
                      percentage >= 80 ? 'bg-green-500' :
                      percentage >= 60 ? 'bg-blue-500' :
                      percentage >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm font-semibold text-gray-600">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {criterion.feedback.map((feedback, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-white/60 rounded-lg p-2"
                  >
                    <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <span>{feedback}</span>
                  </div>
                ))}
              </div>

              {Object.keys(criterion.details).length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1">
                    {Object.entries(criterion.details).map(([detailKey, detailValue]) => (
                      <div key={detailKey} className="flex justify-between">
                        <span className="font-medium capitalize">
                          {detailKey.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-semibold">
                          {typeof detailValue === 'boolean'
                            ? (detailValue ? '✓' : '✗')
                            : detailValue}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
