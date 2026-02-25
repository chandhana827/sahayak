import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const MODELS = {
  PRO: "gemini-3.1-pro-preview",
  FLASH: "gemini-3-flash-preview",
  IMAGE: "gemini-2.5-flash-image",
  AUDIO: "gemini-2.5-flash-native-audio-preview-09-2025",
};

export async function generateLocalizedContent(prompt: string, language: string) {
  const response = await genAI.models.generateContent({
    model: MODELS.FLASH,
    contents: `You are an expert teacher in rural India. Generate content in ${language}. 
    Task: ${prompt}
    Ensure the content is culturally relevant, simple, and engaging for primary school children.`,
  });
  return response.text;
}

export async function differentiateWorksheet(imageData: string, mimeType: string, grades: string[]) {
  const response = await genAI.models.generateContent({
    model: MODELS.PRO,
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
}

export async function getSimpleExplanation(question: string, language: string) {
  const response = await genAI.models.generateContent({
    model: MODELS.FLASH,
    contents: `Explain this to a 7-year-old in ${language}: "${question}". 
    Use a simple analogy related to daily life in rural India. Keep it brief and encouraging.`,
  });
  return response.text;
}

export async function generateVisualAid(description: string) {
  const response = await genAI.models.generateContent({
    model: MODELS.IMAGE,
    contents: {
      parts: [{ text: `A simple, clear line drawing or diagram of: ${description}. 
      The drawing should be easy for a teacher to replicate on a blackboard with white chalk. 
      Minimal detail, high contrast, educational focus.` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateWorksheetFromTopic(topic: string, grades: string[], language: string = "English") {
  const response = await genAI.models.generateContent({
    model: MODELS.PRO,
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
}

export async function generateLessonPlan(topic: string, grades: string[], duration: string) {
  const response = await genAI.models.generateContent({
    model: MODELS.PRO,
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
}
