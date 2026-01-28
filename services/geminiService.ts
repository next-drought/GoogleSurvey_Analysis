
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyResponse } from "../types";

export const analyzeSurveyData = async (data: SurveyResponse[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Create a summary of the data to keep the prompt size reasonable
  const sampleData = data.slice(0, 50); // Analyze the first 50 responses
  const headers = Object.keys(data[0] || {});

  const prompt = `
    Analyze the following survey data results.
    Headers: ${headers.join(', ')}
    Data Sample (first 50 responses): ${JSON.stringify(sampleData)}

    Provide 3-4 professional insights including:
    1. A summary of the general sentiment.
    2. Key trends or patterns observed.
    3. Actionable recommendations based on the findings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              observation: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              type: { type: Type.STRING, description: 'One of: positive, neutral, negative, critical' }
            },
            required: ["title", "observation", "recommendation", "type"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
};
