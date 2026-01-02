import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // Каскадный поиск ключа: 
  // 1. Стандартный process.env (если подставлен сборщиком)
  // 2. Vite-специфичный import.meta.env
  // 3. Глобальный объект window (для некоторых платформ)
  let apiKey = (process.env.API_KEY) || 
               (import.meta as any).env?.VITE_API_KEY ||
               (import.meta as any).env?.API_KEY ||
               (window as any).process?.env?.API_KEY ||
               (window as any).process?.env?.VITE_API_KEY;

  // Если ключ не найден в переменных, пробуем вызвать системный диалог выбора (если среда поддерживает)
  const aistudio = (window as any).aistudio;
  if (!apiKey && aistudio) {
    try {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await aistudio.openSelectKey();
      }
      // После выбора ключа среда должна обновить process.env.API_KEY
      apiKey = (process.env.API_KEY) || (window as any).process?.env?.API_KEY;
    } catch (e) {
      console.warn("AI Studio API key selection failed:", e);
    }
  }

  // Если ключ все еще пуст, выбрасываем информативную ошибку
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error(
      "API_KEY не найден. \n\n" +
      "Техническая деталь: Браузерная среда не получила переменную из Vercel. \n" +
      "Попробуйте переименовать переменную в Vercel в 'VITE_API_KEY' и сделать Redeploy."
    );
  }

  // Инициализируем SDK
  const ai = new GoogleGenAI({ apiKey });
  
  const responsesText = data.responses.map(r => {
    const q = QUESTIONS.find(quest => quest.id === r.questionId);
    return `Вопрос: ${q?.text} | Оценка: ${r.value}/5`;
  }).join("\n");

  const prompt = `
    Вы — ведущий мировой эксперт в области детской коммуникации. 
    Проведите анализ профиля ребенка (${data.age} лет, ${data.gender}).
    Результаты теста:
    ${responsesText}
    Подготовьте подробное экспертное заключение на русском языке.
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
    if (!resultText) throw new Error("AI вернул пустой ответ.");
    
    const result = JSON.parse(resultText);
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    // Если ошибка связана с отсутствием сущности, пробуем перевыбрать ключ
    if (error.message?.includes("Requested entity was not found") && aistudio) {
      await aistudio.openSelectKey();
    }
    console.error("Gemini API Error:", error);
    throw error;
  }
}