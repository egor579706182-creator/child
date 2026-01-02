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
      margin: [5, 5, 5, 5], 
      filename: `Report_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all' }
    };

    try {
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleBookConsultation = () => {
    window.open('https://example.com/booking', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 print:p-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-2 gap-2 print:hidden no-print">
        <h1 className="font-bold text-gray-300 text-[9px] uppercase tracking-[0.3em]">Report Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadPDF} 
            loading={isExporting}
            disabled={isExporting}
            className="text-[9px] uppercase py-1.5 px-3 min-w-[100px]"
          >
            {isExporting ? 'Создание...' : 'Скачать PDF'}
          </Button>
          <Button onClick={handleBookConsultation} className="text-[9px] uppercase py-1.5 px-3 bg-black text-white hover:bg-gray-800">
            Консультация
          </Button>
          <Button variant="outline" onClick={onReset} className="text-[9px] uppercase py-1.5 px-3">Новый тест</Button>
        </div>
      </div>

      {/* Компактный контейнер для А4 */}
      <div ref={reportRef} className="space-y-4 py-4 px-6 bg-white rounded-lg border border-gray-50 shadow-sm print:border-0 print:shadow-none">
        <header className="text-center space-y-2">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Клиническое заключение</h2>
          <div className="inline-block px-4 py-0.5 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em]">
            {result.impairmentLevel}
          </div>
        </header>

        <section className="space-y-1">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-1">Интерпретация профиля</h3>
          <p className="text-gray-800 text-sm leading-snug whitespace-pre-wrap">{result.clinicalInterpretation}</p>
        </section>

        <section className="space-y-1">
          <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 border-b pb-1">Рекомендации</h3>
          <div className="grid grid-cols-2 gap-2">
            {result.recommendations.map((rec, i) => (
              <div 
                key={i} 
                className="p-2 border border-gray-100 bg-gray-50/30 rounded text-[11px] leading-tight text-gray-700"
              >
                <span className="font-bold text-black mr-1">{i + 1}.</span>
                {rec}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-4 rounded-xl" style={{ breakInside: 'avoid' }}>
          <h3 className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">Прогноз развития</h3>
          <p className="text-sm font-light leading-snug">{result.prognosis}</p>
        </section>

        <section className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100" style={{ breakInside: 'avoid' }}>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase text-blue-500 tracking-tighter">Scientific (EN)</span>
            <p className="text-[9px] text-gray-500 leading-tight italic">{result.scientificContext.english}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase text-red-500 tracking-tighter">Наука (RU)</span>
            <p className="text-[9px] text-gray-500 leading-tight italic">{result.scientificContext.russian}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black uppercase text-orange-500 tracking-tighter">Wissenschaft (DE)</span>
            <p className="text-[9px] text-gray-500 leading-tight italic">{result.scientificContext.german}</p>
          </div>
        </section>

        {result.sources.length > 0 && (
          <footer className="pt-2 border-t border-gray-50 flex items-center justify-between">
            <div className="text-[8px] font-bold uppercase text-gray-300 tracking-widest">Источники:</div>
            <div className="flex flex-wrap gap-x-3 text-[8px]">
              {result.sources.slice(0, 3).map((s, i) => (
                <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">{s.title}</a>
              ))}
            </div>
          </footer>
        )}
      </div>

      <style>
        {`
          @media print {
            body { background: white !important; }
            .print\\:hidden, .no-print { display: none !important; }
            @page { size: A4; margin: 5mm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          }
        `}
      </style>
    </div>
  );
};