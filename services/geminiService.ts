
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const processTextToSections = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `ژمێریارەکا نڤیسینێ یە. ئەڤێ نڤیسینێ وەکی بابەت (Sections) لێک بدە دناڤ JSON دا کو هەر بابەتەک ناڤنیشانەک و ناڤەرۆکەکا تێروەسەل هەبیت: \n\n ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["id", "title", "content"]
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"sections": []}');
};

export const generateExplanatoryImage = async (prompt: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create a high-quality educational illustration for: ${prompt}. Professional, clear, and modern.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const chatWithAI = async (question: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: question,
    config: {
      systemInstruction: "Tu مامۆستایەکی زیرەکی، بە زمانێ کوردی (بادینی) بەرسڤا قوتابی بدە ب شێوازەکێ زانستی و کورت."
    }
  });
  return response.text;
};
