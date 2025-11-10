
import { GoogleGenAI } from "@google/genai";

const fetchMotivationalQuote = async (): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      return "Para ter um negócio de sucesso, alguém, algum dia, teve que tomar uma atitude de coragem. - Peter Drucker";
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Me dê uma frase motivacional curta e inspiradora em português para começar o dia bem. Apenas a frase, sem aspas ou introduções.",
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching motivational quote:", error);
    return "Acredite em você mesmo e em tudo que você é. Saiba que existe algo dentro de você que é maior que qualquer obstáculo.";
  }
};

export default fetchMotivationalQuote;
