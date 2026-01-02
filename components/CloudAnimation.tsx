
import React from 'react';

export const CloudAnimation: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-10 overflow-hidden w-full max-w-lg">
      <div className="relative w-64 h-32 mb-8">
        <style>
          {`
            @keyframes float {
              0% { transform: translateX(-150px); opacity: 0; }
              20% { opacity: 0.8; }
              80% { opacity: 0.8; }
              100% { transform: translateX(250px); opacity: 0; }
            }
            .cloud {
              fill: #e0f2fe;
              animation: float 15s linear infinite;
            }
            .cloud-2 {
              animation-delay: -5s;
              animation-duration: 18s;
            }
            .cloud-3 {
              animation-delay: -10s;
              animation-duration: 12s;
            }
          `}
        </style>
        <svg viewBox="0 0 100 60" className="cloud absolute top-0 left-0 w-32 h-auto">
          <path d="M10,40 Q10,25 25,25 Q30,10 45,15 Q60,10 70,25 Q85,25 85,40 Z" />
        </svg>
        <svg viewBox="0 0 100 60" className="cloud cloud-2 absolute top-12 left-10 w-24 h-auto">
          <path d="M10,40 Q10,25 25,25 Q30,10 45,15 Q60,10 70,25 Q85,25 85,40 Z" />
        </svg>
        <svg viewBox="0 0 100 60" className="cloud cloud-3 absolute -top-5 left-20 w-20 h-auto">
          <path d="M10,40 Q10,25 25,25 Q30,10 45,15 Q60,10 70,25 Q85,25 85,40 Z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sky-400 text-sm font-light tracking-widest animate-pulse">
          Формирование отчета может занять несколько минут...
        </p>
      </div>
    </div>
  );
};
