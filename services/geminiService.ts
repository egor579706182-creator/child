import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // Инициализация строго через process.env.API_KEY согласно системным требованиям.
  // Окружение (Vercel/Vite) должно обеспечить подстановку этого значения при сборке.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const responsesText = data.responses.map(r => {
    const q = QUESTIONS.find(quest => quest.id === r.questionId);
    return `Вопрос: ${q?.text} | Оценка: ${r.value}/5`;
  }).join("\n");

  const prompt = `
    Вы — ведущий мировой эксперт в области детской коммуникации и логопедии. 
    Проведите глубокий клинический анализ профиля ребенка.
    
    Данные ребенка:
    - Возраст: ${data.age} лет
    - Пол: ${data.gender}
    
    Результаты тестирования (шкала 1-5, где 1 - минимальное проявление/отсутствие, 5 - норма/максимум):
    ${responsesText}
    
    Сформулируйте подробное заключение на русском языке. Используйте профессиональную терминологию.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            impairmentLevel: { 
              type: Type.STRING,
              description: "Краткий уровень нарушения (например, 'Норма', 'Легкая задержка', 'Умеренное нарушение')."
            },
            clinicalInterpretation: { 
              type: Type.STRING, 
              description: "Подробный разбор профиля коммуникации."
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Список практических рекомендаций."
            },
            prognosis: { 
              type: Type.STRING,
              description: "Клинический прогноз."
            },
            scientificContext: {
              type: Type.OBJECT,
              properties: {
                english: { type: Type.STRING },
                russian: { type: Type.STRING },
                german: { type: Type.STRING }
              }
            }
          },
          required: ["impairmentLevel", "clinicalInterpretation", "recommendations", "prognosis", "scientificContext"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AI не вернул текстовое содержимое.");
    
    const result = JSON.parse(resultText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Научный источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    // Пробрасываем ошибку выше для обработки в UI
    throw error;
  }
}