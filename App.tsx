
import React, { useState, useEffect } from 'react';
import { AssessmentForm } from './components/AssessmentForm';
import { ResultDashboard } from './components/ResultDashboard';
import { CloudAnimation } from './components/CloudAnimation';
import { AssessmentData, AnalysisResult } from './types';
import { analyzeAssessment } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<'check' | 'setup' | 'form' | 'loading' | 'result'>('check');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const validateEnvironment = async () => {
      // 1. Проверяем наличие ключа в системных переменных (Vercel)
      const hasEnvKey = process.env.API_KEY && process.env.API_KEY !== 'undefined';
      
      if (hasEnvKey) {
        setView('form');
        return;
      }

      // 2. Если мы в AI Studio, пробуем системный метод
      // @ts-ignore
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        // @ts-ignore
        const hasStudioKey = await window.aistudio.hasSelectedApiKey();
        setView(hasStudioKey ? 'form' : 'setup');
      } else {
        // 3. Если ключа нет нигде (локально или на Vercel без ENV)
        setView('setup');
      }
    };
    validateEnvironment();
  }, []);

  const handleConnectKey = async () => {
    // @ts-ignore
    if (window.aistudio && window.aistudio.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setView('form');
    } else {
      alert("Для работы на Vercel: добавьте переменную API_KEY в настройках проекта Vercel и перезапустите билд.");
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
      alert(error.message || "Произошла ошибка при анализе данных");
      setView('form');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setView('form');
  };

  if (view === 'check') return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex flex-col items-center pt-10 px-4 min-h-screen">
        <div className="mb-8 text-center no-print">
          <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">CommuniScale Pro</h1>
        </div>

        {view === 'setup' && (
          <div className="flex flex-col items-center justify-center py-20 max-w-sm w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Ключ не настроен</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                На Vercel необходимо добавить <b>API_KEY</b> в Environment Variables. <br/>В AI Studio нажмите кнопку ниже.
              </p>
            </div>
            
            <Button onClick={handleConnectKey} className="w-full py-4 bg-black">
              Настроить доступ
            </Button>
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
