
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // Инициализация строго по инструкции через process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const responsesText = data.responses.map(r => {
    const q = QUESTIONS.find(quest => quest.id === r.questionId);
    return `Вопрос: ${q?.text} | Оценка: ${r.value}/5`;
  }).join("\n");

  const prompt = `
    Вы — ведущий эксперт в области детской коммуникации. 
    Проведите анализ профиля ребенка (${data.age} лет, ${data.gender}).
    
    Результаты теста:
    ${responsesText}
    
    Подготовьте подробное клиническое заключение на русском языке.
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
    if (!resultText) throw new Error("AI не вернул данных.");
    
    const result = JSON.parse(resultText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Если ошибка связана с ключом, это будет видно в консоли
    throw new Error(error.message || "Ошибка API. Убедитесь, что API_KEY в Vercel установлен корректно.");
  }
}
