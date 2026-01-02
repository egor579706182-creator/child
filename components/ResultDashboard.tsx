
import React, { useRef, useState } from 'react';
import { AnalysisResult } from '../types';
import { Button } from './Button';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface ResultDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({ result, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    
    const opt = {
      margin: [15, 10, 15, 10], // верх, лево, низ, право
      filename: `CommuniScale_Report_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      // Генерируем PDF из элемента reportRef
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      // Если библиотека не сработала (например, в очень старом браузере), используем системную печать
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleBookConsultation = () => {
    // Вставьте сюда реальную ссылку на вашу форму или календарь
    window.open('https://example.com/booking', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 gap-4 print:hidden no-print">
        <h1 className="font-bold text-gray-300 text-[10px] uppercase tracking-[0.3em]">Профессиональный отчет</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF} 
            loading={isExporting}
            disabled={isExporting}
            className="text-[10px] uppercase py-2 px-4 min-w-[120px]"
          >
            {isExporting ? 'Создание...' : 'Скачать PDF'}
          </Button>
          <Button onClick={handleBookConsultation} className="text-[10px] uppercase py-2 px-4 bg-black text-white hover:bg-gray-800 transition-colors shadow-lg active:scale-95">
            Записаться на консультацию
          </Button>
          <Button variant="outline" onClick={onReset} className="text-[10px] uppercase py-2 px-4">Новый тест</Button>
        </div>
      </div>

      {/* Контейнер для экспорта в PDF */}
      <div ref={reportRef} className="space-y-12 py-8 px-4 bg-white rounded-xl">
        <header className="text-center space-y-4">
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Клиническое заключение</h2>
          <div className="inline-block px-6 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em]">
            {result.impairmentLevel}
          </div>
        </header>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Интерпретация профиля</h3>
          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{result.clinicalInterpretation}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Рекомендации специалиста</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="p-4 border border-gray-100 bg-gray-50/50 rounded-lg text-sm leading-relaxed text-gray-700"
                style={{ breakInside: 'avoid' }}
              >
                <span className="font-bold text-black mr-2">{i + 1}.</span>
                {rec}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-10 rounded-3xl" style={{ breakInside: 'avoid' }}>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">Прогноз развития</h3>
          <p className="text-xl font-light leading-relaxed">{result.prognosis}</p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100" style={{ breakInside: 'avoid' }}>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-blue-500 tracking-tighter">Scientific Context (EN)</span>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">{result.scientificContext.english}</p>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-red-500 tracking-tighter">Научный контекст (RU)</span>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">{result.scientificContext.russian}</p>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-orange-500 tracking-tighter">Wissenschaft (DE)</span>
            <p className="text-[11px] text-gray-500 leading-relaxed italic">{result.scientificContext.german}</p>
          </div>
        </section>

        {result.sources.length > 0 && (
          <footer className="pt-10 border-t border-gray-50">
            <div className="text-[9px] font-bold uppercase text-gray-300 mb-4 tracking-widest no-print">Цитируемые источники</div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {result.sources.map((s, i) => (
                <a 
                  key={i} 
                  href={s.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-gray-400 hover:text-black transition-colors underline decoration-gray-100 underline-offset-4"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </footer>
        )}
      </div>

      <style>
        {`
          @media print {
            body { background: white !important; padding: 0 !important; }
            .print\\:hidden, .no-print { display: none !important; }
            @page { margin: 1cm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .rounded-3xl { border-radius: 1rem !important; }
          }
        `}
      </style>
    </div>
  );
};
