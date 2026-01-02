
import { GoogleGenAI, Type } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  // ПРАВИЛО: Ключ должен браться из process.env.API_KEY.
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error("API key is missing or invalid. Please check the environment configuration.");
  }

  // Создаем экземпляр прямо перед вызовом
  const ai = new GoogleGenAI({ apiKey });
  
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
    // Fixed: Using responseSchema as the recommended way to handle structured output
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

    // Access the text property directly as it returns the string output
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI");
    
    const result = JSON.parse(resultText);
    
    // Extracting URLs from groundingChunks as required when using googleSearch
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      uri: chunk.web?.uri || "",
      title: chunk.web?.title || "Источник"
    })).filter((s: any) => s.uri) || [];

    return { ...result, sources };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    if (error.message?.includes("entity was not found")) {
      throw new Error("API entity error. Please re-check the key in Google AI Studio.");
    }
    throw new Error(`Ошибка AI: ${error.message || "Не удалось получить ответ"}`);
  }
}
