
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
      // Если ключ не найден или API вернуло ошибку, выводим её пользователю
      const msg = error.message || "Произошла ошибка при анализе. Проверьте настройки API ключа в вашем окружении.";
      alert(`Ошибка анализа: ${msg}`);
      setView('form');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setView('form');
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex flex-col items-center pt-10 px-4 min-h-screen">
        <div className="mb-8 text-center no-print">
          <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">CommuniScale Pro</h1>
        </div>

        {view === 'form' && (
          <AssessmentForm onComplete={handleAssessmentComplete} />
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20 w-full flex-1">
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
