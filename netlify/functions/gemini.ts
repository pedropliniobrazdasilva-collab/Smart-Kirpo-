import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
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
    const { type, payload } = body;
    
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
    } else if (type === 'chat') {
        if (!payload || !payload.history) {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid chat payload." }) };
        }
        
        const addTaskFunctionDeclaration: FunctionDeclaration = {
            name: 'add_task_to_list',
            description: "Adiciona uma ou mais tarefas à lista de tarefas do usuário. Use para qualquer pedido que envolva criar uma nova tarefa, item de rotina ou lembrete.",
            parameters: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "O título ou nome da tarefa. Ex: 'Lavar a louça'."
                    },
                    time: {
                        type: Type.STRING,
                        description: "O horário para a tarefa no formato HH:mm. Ex: '09:30'."
                    },
                    priority: {
                        type: Type.STRING,
                        description: "A prioridade da tarefa. Valores possíveis: 'low', 'medium', 'high'. O padrão é 'medium'."
                    },
                    repeatDays: {
                        type: Type.ARRAY,
                        description: "Uma lista de números representando os dias da semana para repetir a tarefa, onde 0 é Domingo e 6 é Sábado. Ex: [1, 3, 5] para Segunda, Quarta e Sexta.",
                        items: { type: Type.INTEGER }
                    }
                },
                required: ["title"]
            }
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: payload.history,
            config: {
                tools: [{ functionDeclarations: [addTaskFunctionDeclaration] }],
                systemInstruction: "Você é Kirpo, um assistente de produtividade amigável e eficiente. Seu objetivo é ajudar o usuário a organizar sua rotina diária. Responda em português do Brasil. Seja conciso e direto. Quando o usuário pedir para criar uma tarefa, use a função `add_task_to_list`. Se o usuário pedir para criar múltiplas tarefas, chame a função `add_task_to_list` várias vezes, uma para cada tarefa. Não peça confirmação antes de adicionar tarefas, apenas adicione-as e informe que foram adicionadas."
            },
        });
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
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