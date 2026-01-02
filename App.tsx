
import React, { useState } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultDashboard } from './components/ResultDashboard';
import { CloudAnimation } from './components/CloudAnimation';
import { AssessmentData, AnalysisResult } from './types';
import { analyzeAssessment } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'loading' | 'result'>('form');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAssessmentComplete = async (data: AssessmentData) => {
    setView('loading');
    try {
      const result = await analyzeAssessment(data);
      setAnalysisResult(result);
      setView('result');
    } catch (error: any) {
      console.error("Application Error:", error);
      alert(`Ошибка: ${error.message || 'Не удалось получить ответ от системы'}`);
      setView('form');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-gray-100 selection:text-black">
      <div className="flex flex-col items-center pt-10 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-xs font-black uppercase tracking-[0.4em] text-gray-300">CommuniScale Pro</h1>
        </div>

        {view === 'form' && (
          <AssessmentForm onComplete={handleAssessmentComplete} />
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <CloudAnimation />
          </div>
        )}

        {view === 'result' && analysisResult && (
          <ResultDashboard result={analysisResult} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default App;
