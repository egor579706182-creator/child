
import { GoogleGenAI } from "@google/genai";
import { AssessmentData, AnalysisResult } from "../types";
import { QUESTIONS } from "../constants";

export async function analyzeAssessment(data: AssessmentData): Promise<AnalysisResult> {
  /**
   * ПРАВИЛО: Ключ должен браться из process.env.API_KEY.
   * Если после добавления ключа в Vercel вы видите ошибку, 
   * ОБЯЗАТЕЛЬНО сделайте 'Redeploy' во вкладке Deployments.
   */
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
    throw new Error(
      "Ключ API не обнаружен в текущей сборке. \n\n" + 
      "ИНСТРУКЦИЯ: \n" +
      "1. Вы уже добавили API_KEY в Settings -> Environment Variables (судя по скриншоту).\n" +
      "2. Теперь перейдите во вкладку 'Deployments'.\n" +
      "3. Нажмите на последние три точки и выберите 'Redeploy'.\n" +
      "Это необходимо, чтобы Vercel передал ключ в код приложения."
    );
  }

  // Создаем экземпляр прямо перед вызовом, как требует инструкция
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
    Текст должен быть абсолютно чистым. Используйте только переносы строк и обычные списки.
    
    Данные ребенка:
    - Возраст: ${data.age} лет
    - Пол: ${data.gender}
    
    Результаты тестирования:
    ${responsesText}
    
    Сформируйте ответ СТРОГО в формате JSON:
    {
      "impairmentLevel": "Уровень (чистый текст)",
      "clinicalInterpretation": "Анализ (чистый текст)",
      "recommendations": ["Рекомендация 1", "..."],
      "prognosis": "Прогноз (чистый текст)",
      "scientificContext": {
        "english": "Summary EN",
        "russian": "Резюме RU",
        "german": "Zusammenfassung DE"
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
    if (error.message?.includes("entity was not found")) {
      throw new Error("Проблема с ключом или проектом в Google AI Studio. Пересоздайте ключ.");
    }
    throw new Error(`Ошибка AI: ${error.message || "Не удалось получить ответ"}`);
  }
}
