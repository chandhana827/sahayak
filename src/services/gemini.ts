import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Robust API key retrieval for Vite/Vercel environments
export const getApiKey = () => {
  try {
    // @ts-ignore
    const viteKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (viteKey && viteKey !== "Your_key") return viteKey;
    
    // @ts-ignore
    const processKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null;
    if (processKey && processKey !== "Your_key") return processKey;

    return "";
  } catch (e) {
    return "";
  }
};

export const MODELS = {
  PRO: "gemini-3.1-pro-preview",
  FLASH: "gemini-3-flash-preview",
  IMAGE: "gemini-2.5-flash-image",
  AUDIO: "gemini-2.5-flash-native-audio-preview-09-2025",
};

// Helper to get AI instance with fresh key
const getAI = () => {
  const key = getApiKey();
  if (!key) throw new Error("API Key not found. Please set VITE_GEMINI_API_KEY in your Vercel environment variables.");
  return new GoogleGenAI({ apiKey: key });
};

export async function generateLocalizedContent(prompt: string, language: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `You are an expert teacher in rural India. Generate content in ${language}. 
      Task: ${prompt}
      Ensure the content is culturally relevant, simple, and engaging for primary school children.`,
    });
    return response.text;
  } catch (error) {
    console.error("Localized Content Error:", error);
    throw error;
  }
}

export async function differentiateWorksheet(imageData: string, mimeType: string, grades: string[]) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: `Analyze this textbook page and create differentiated worksheets for the following grades: ${grades.join(", ")}. 
          For each grade, provide:
          1. Learning objectives
          2. 5 questions/activities appropriate for that level
          3. A simple teacher's guide.
          Format the output clearly using Markdown.` }
        ]
      },
    });
    return response.text;
  } catch (error) {
    console.error("Worksheet Differentiation Error:", error);
    throw error;
  }
}

export async function getSimpleExplanation(question: string, language: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Explain this to a 7-year-old in ${language}: "${question}". 
      Use a simple analogy related to daily life in rural India. Keep it brief and encouraging.`,
    });
    return response.text;
  } catch (error) {
    console.error("Explanation Error:", error);
    throw error;
  }
}

export async function analyzeReading(audioData: string, mimeType: string) {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: {
        parts: [
          { inlineData: { data: audioData, mimeType } },
          { text: `Analyze this student's reading recording. 
          1. Provide a fluency score (1-10).
          2. Identify 3-5 specific words they struggled with.
          3. Give 2 simple tips for the teacher to help this student improve.
          Format the output clearly using Markdown.` }
        ]
      },
    });
    return response.text;
  } catch (error: any) {
    console.error("Reading Analysis Error:", error);
    throw new Error(`Reading Analysis Error: ${error?.message || "Unknown error"}`);
  }
}

export async function generateWorksheetFromTopic(topic: string, grades: string[], language: string = "English") {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Create a comprehensive and simple worksheet for the topic: "${topic}" for the following grades: ${grades.join(", ")}. 
      The worksheet should be in ${language}.
      
      Structure the worksheet with these sections for each grade level:
      1. **Theory Questions**: Simple descriptive questions.
      2. **Multiple Choice Questions (MCQs)**: 5 questions with 4 options each.
      3. **Fill in the Blanks**: 5 sentences with blanks.
      4. **True or False**: 5 statements.
      
      Ensure the language is simple and appropriate for the specified grade levels. 
      Format the output clearly using Markdown with bold headings and structured lists.`,
    });
    return response.text;
  } catch (error: any) {
    console.error("Topic Worksheet Error:", error);
    throw new Error(`Worksheet Error: ${error?.message || "Unknown error"}`);
  }
}

export async function generateLessonPlan(topic: string, grades: string[], duration: string) {
  const ai = getAI();
  try {
    // Switching to FLASH for better reliability in production
    const response = await ai.models.generateContent({
      model: MODELS.FLASH,
      contents: `Create a weekly lesson plan for a multi-grade classroom (Grades: ${grades.join(", ")}).
      Topic: ${topic}
      Duration: ${duration}
      Include:
      - Daily activities that can be done together
      - Specific tasks for each grade level
      - Low-cost teaching aids required
      - Assessment ideas.
      Format as a structured table or clear list in Markdown.`,
    });
    return response.text;
  } catch (error: any) {
    console.error("Lesson Plan Error:", error);
    throw new Error(`Lesson Plan Error: ${error?.message || "Unknown error"}`);
  }
}
