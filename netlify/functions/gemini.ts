import { GoogleGenAI } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "API key is not configured." }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { type } = body;
    
    const ai = new GoogleGenAI({ apiKey });

    if (type === 'quote') {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: "Me dê uma frase motivacional curta e inspiradora em português para começar o dia bem. Apenas a frase, sem aspas ou introduções." }] }],
        });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: response.text }),
        };
    } else {
        return { statusCode: 400, body: JSON.stringify({ error: "Invalid request type." }) };
    }

  } catch (error) {
    console.error("Error in Netlify function:", error);
    return { 
        statusCode: 500, 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: error instanceof Error ? error.message : "An unknown server error occurred." })
    };
  }
};

export { handler };