
// Fixed: Added missing React import to resolve namespace error
import React, { useState } from 'react';
import { QUESTIONS } from '../constants';
import { AssessmentData, Gender, AssessmentResponse } from '../types';
import { Button } from './Button';

interface AssessmentFormProps {
  onComplete: (data: AssessmentData) => void;
}

export const AssessmentForm: React.FC<AssessmentFormProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);

  const handleNext = () => {
    if (step === 0) {
      if (!age || isNaN(Number(age))) return alert("Введите возраст.");
      setStep(1);
    } else if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      onComplete({ age: Number(age), gender, responses });
    }
  };

  const handleSkip = () => {
    if (step > 0 && step <= QUESTIONS.length) {
      const currentId = QUESTIONS[step - 1].id;
      // Если ответ еще не выбран, ставим нейтральное значение (3)
      if (!responses.find(r => r.questionId === currentId)) {
        handleResponse(currentId, 3);
      }
      handleNext();
    }
  };

  const handlePrevious = () => setStep(Math.max(0, step - 1));

  const handleResponse = (questionId: number, value: number) => {
    setResponses(prev => {
      const existing = prev.filter(r => r.questionId !== questionId);
      return [...existing, { questionId, value }];
    });
  };

  if (step === 0) {
    return (
      <div className="max-w-sm mx-auto p-8 border border-gray-100 bg-white shadow-sm mt-10 rounded-xl">
        <h2 className="font-bold text-lg mb-6 text-gray-900">Данные ребенка</h2>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Возраст (полных лет)</label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded text-black bg-white focus:border-black outline-none transition-colors"
              placeholder="Напр. 4"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Пол</label>
            <div className="flex gap-2">
              {[Gender.MALE, Gender.FEMALE].map(g => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 p-3 text-sm border rounded transition-all ${gender === g ? 'bg-black text-white border-black' : 'bg-white border-gray-100 text-gray-500'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleNext} className="w-full py-4 mt-4">Начать тестирование</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = QUESTIONS[step - 1];
  const currentResponse = responses.find(r => r.questionId === currentQuestion.id)?.value;

  return (
    <div className="max-w-lg mx-auto p-8 border border-gray-100 bg-white shadow-sm mt-10 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Прогресс: {step} / {QUESTIONS.length}</div>
      </div>
      <h3 className="font-bold text-xl mb-8 text-gray-900 leading-snug">{currentQuestion.text}</h3>

      <div className="space-y-2 mb-8">
        {currentQuestion.options.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleResponse(currentQuestion.id, opt.value)}
            className={`w-full text-left p-4 text-sm border rounded-lg transition-all ${currentResponse === opt.value ? 'bg-gray-50 border-black font-bold ring-1 ring-black' : 'border-gray-50 text-gray-600 hover:border-gray-200'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={handlePrevious} className="flex-1">Назад</Button>
          <Button disabled={!currentResponse} onClick={handleNext} className="flex-[2]">
            {step === QUESTIONS.length ? 'Сформировать отчет' : 'Следующий вопрос'}
          </Button>
        </div>
        {!currentResponse && (
          <Button variant="outline" onClick={handleSkip} className="w-full text-gray-400 border-dashed border-gray-200 hover:text-gray-600 hover:bg-gray-50 text-xs py-2">
            Пропустить (не уверен / не наблюдалось)
          </Button>
        )}
      </div>
    </div>
  );
};
