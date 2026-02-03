import { GoogleGenAI } from "@google/genai";
import { SalesRecord, Language } from "../types";

export const generateInsights = async (data: SalesRecord[], lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare a summarized text version of the data for the prompt
  const dataString = data.map(r => 
    `- ${r.source}: ${r.revenue} KZT revenue, ${r.leads} leads, ${r.efficiency}% conv.`
  ).join('\n');

  const langInstruction = lang === 'ru' ? 'in Russian' : 'in English';

  const prompt = `
    You are a senior data analyst. Analyze the following sales channel performance data:
    
    ${dataString}

    Provide a concise, strategic analysis ${langInstruction} (Markdown format).
    1. Identify the top performing channel (Cash Cow).
    2. Identify the most efficient channel (High ROI potential).
    3. Identify an underperforming channel that needs attention.
    4. Provide 3 specific actionable recommendations to increase total revenue.
    
    Keep the tone professional, modern, and business-oriented. Use bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};