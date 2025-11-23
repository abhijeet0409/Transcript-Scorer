import { useState, useRef } from 'react';
import { FileText, Upload } from 'lucide-react';

interface TranscriptInputProps {
  onSubmit: (transcript: string, duration?: number) => void;
  isLoading: boolean;
}

export default function TranscriptInput({ onSubmit, isLoading }: TranscriptInputProps) {
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setTranscript(text);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      const durationNum = duration ? parseInt(duration) : undefined;
      onSubmit(transcript, durationNum);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Transcript Input</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="transcript" className="block text-sm font-semibold text-gray-700 mb-2">
                Paste or upload your transcript
              </label>
              <textarea
                id="transcript"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type or paste your self-introduction transcript here..."
                className="w-full h-48 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-700 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (seconds) - Optional
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 52"
                  min="1"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-700 placeholder-gray-400"
                />
              </div>

              <div className="flex-1 flex items-end">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload .txt file
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !transcript.trim()}
            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Scoring...
              </span>
            ) : (
              'Score Transcript'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
