
import { GoogleGenAI } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // Безопасное получение ключа
  const apiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("API_KEY не найден. Пожалуйста, добавьте переменную окружения API_KEY в настройках Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const responsesText = data.responses.map(r => {
    const q = QUESTIONS.find(quest => quest.id === r.questionId);
    return `Вопрос: ${q?.text} | Оценка: ${r.value}/5`;
  }).join("\n");

  const prompt = `
    Вы — ведущий мировой эксперт в области детской коммуникации и логопедии. 
    Проведите глубокий клинический анализ профиля ребенка.
    
    ВАЖНОЕ ПРАВИЛО ФОРМАТИРОВАНИЯ: 
    В ответе КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать любые символы форматирования Markdown, особенно двойные звездочки '**'. 
    Текст должен быть абсолютно чистым, без спецсимволов. Используйте только переносы строк и списки.
    
    Данные ребенка:
    - Возраст: ${data.age} лет
    - Пол: ${data.gender}
    
    Результаты тестирования:
    ${responsesText}
    
    Сформируйте ответ СТРОГО в формате JSON:
    {
      "impairmentLevel": "Уровень (чистый текст)",
      "clinicalInterpretation": "Анализ (чистый текст без **)",
      "recommendations": ["Рекомендация 1 (чистый текст)", "..."],
      "prognosis": "Прогноз (чистый текст без **)",
      "scientificContext": {
        "english": "Summary (no **)",
        "russian": "Резюме (без **)",
        "german": "Zusammenfassung (ohne **)"
      }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error(`Ошибка AI: ${error.message || "Не удалось получить ответ"}`);
  }
}
