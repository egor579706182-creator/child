
import React, { useState, useEffect } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultDashboard } from './components/ResultDashboard';
import { CloudAnimation } from './components/CloudAnimation';
import { AssessmentData, AnalysisResult } from './types';
import { analyzeAssessment } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<'setup' | 'form' | 'loading' | 'result'>('loading');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          setView('form');
        } else {
          setView('setup');
        }
      } else {
        // Если мы не в среде AI Studio, пробуем сразу форму
        setView('form');
      }
    };
    checkApiKey();
  }, []);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Согласно инструкции, после вызова окна сразу переходим к приложению
      setView('form');
    }
  };

  const handleAssessmentComplete = async (data: AssessmentData) => {
    setView('loading');
    try {
      const result = await analyzeAssessment(data);
      setAnalysisResult(result);
      setView('result');
    } catch (error: any) {
      console.error("Application Error:", error);
      const msg = error.message || '';
      if (msg.includes('Requested entity was not found') || msg.includes('API key')) {
        alert("Ошибка ключа. Пожалуйста, выберите ключ заново.");
        setView('setup');
      } else {
        alert(`Ошибка: ${msg}`);
        setView('form');
      }
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

        {view === 'setup' && (
          <div className="flex flex-col items-center justify-center py-20 max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 11-7.743-5.743L11 3.257l-2 2-6 6V15a2 2 0 002 2h7l1 1 1-1h3a2 2 0 002-2V9a2 2 0 012-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Активация AI-модуля</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Для работы диагностической модели Gemini 3 Pro необходимо подключить ваш API ключ из платного проекта Google Cloud.
              </p>
            </div>
            
            <Button onClick={handleConnectKey} className="w-full py-4 text-sm uppercase tracking-widest font-bold bg-indigo-600 hover:bg-indigo-700">
              Подключить API Ключ
            </Button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="text-[10px] text-gray-400 hover:text-indigo-600 underline transition-colors"
            >
              Документация по биллингу и ключам
            </a>
          </div>
        )}

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
