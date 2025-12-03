import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLetterContent = async (topic: string): Promise<string> => {
  try {
    const ai = getClient();
    const prompt = `Write a short, emotional, handwritten-style letter (max 60 words) about: "${topic}". 
    The tone should be personal, warm, and nostalgic. 
    Do not include a greeting or signature if not necessary, just the body text. 
    Return ONLY the text content.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Error generating letter:", error);
    throw error;
  }
};