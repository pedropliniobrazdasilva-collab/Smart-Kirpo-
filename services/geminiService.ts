import { GoogleGenAI } from "@google/genai";

const fallbackQuote = "Acredite em você mesmo e em tudo que você é. Saiba que existe algo dentro de você que é maior que qualquer obstáculo.";

const fetchMotivationalQuote = async (): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API key is missing. Returning a fallback quote.");
    return fallbackQuote;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Me dê uma frase motivacional curta e inspiradora em português para começar o dia bem. Apenas a frase, sem aspas ou introduções.",
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    return fallbackQuote;
  }
};

export default fetchMotivationalQuote;