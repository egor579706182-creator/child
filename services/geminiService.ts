
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // Инициализация строго по инструкции: используем переменную окружения напрямую.
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
    
    Результаты тестирования:
    ${responsesText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            impairmentLevel: { type: Type.STRING },
            clinicalInterpretation: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            prognosis: { type: Type.STRING },
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
    if (!resultText) throw new Error("AI не вернул данные. Проверьте лимиты вашего ключа.");
    
    const result = JSON.parse(resultText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Ошибка при генерации отчета");
  }
}
