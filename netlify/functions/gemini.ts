import { GoogleGenAI, FunctionDeclaration, Type, Content } from "@google/genai";
import type { Handler, HandlerEvent } from "@netlify/functions";

// Redefine enums/types to avoid complex relative paths in the serverless function environment.
enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
}

const addTaskFunctionDeclaration: FunctionDeclaration = {
  name: 'add_task_to_list',
  description: 'Adiciona uma nova tarefa à lista de tarefas do usuário.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'O título da tarefa.' },
      time: { type: Type.STRING, description: 'A hora para a tarefa no formato HH:mm. Opcional.' },
      priority: { type: Type.STRING, description: `A prioridade: '${Priority.Low}', '${Priority.Medium}', ou '${Priority.High}'.` },
      repeatDays: {
        type: Type.ARRAY,
        description: 'Uma lista de dias para repetir a tarefa (0=Domingo, 1=Segunda, etc.).',
        items: { type: Type.NUMBER }
      }
    },
    required: ['title', 'priority']
  }
};

const systemInstruction = `Você é o Kirpo, um assistente de IA amigável e proativo para o aplicativo de rotina diária 'Smart Kirpo'. Sua principal função é ajudar os usuários a organizar seu dia e criar tarefas.
- Seja conversador e prestativo.
- Formate suas respostas usando Markdown para melhor legibilidade. Use títulos (#), listas (- ou *), **negrito** e *itálico* para organizar a informação.
- Quando um usuário pedir para criar uma rotina ou uma lista de tarefas, primeiro descreva o propósito e os benefícios dessa rotina de forma encorajadora.
- Depois de descrever, pergunte explicitamente ao usuário se ele deseja adicionar as tarefas à sua lista.
- NUNCA adicione tarefas sem a confirmação do usuário.
- Use a função 'add_task_to_list' para adicionar CADA tarefa individualmente, somente após a confirmação.
- Após adicionar as tarefas com sucesso, confirme para o usuário que as tarefas foram adicionadas.
- Responda sempre em português do Brasil.`;

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
        const { history } = payload;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
                systemInstruction: { parts: [{ text: systemInstruction }] },
                tools: [{ functionDeclarations: [addTaskFunctionDeclaration] }],
            }
        });

        const result = {
          text: response.text,
          functionCalls: response.functionCalls,
          candidates: response.candidates,
        };
        
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(result),
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
