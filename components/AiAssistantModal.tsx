import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Type, Chat, FunctionDeclaration, Part } from "@google/genai";
import { marked } from 'marked';
import { Priority, Task } from '../types';
import { XMarkIcon, SparklesIcon } from './icons';
import { useChatHistory, ChatMessage } from '../hooks/useChatHistory';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>) => void;
}

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose, addTask }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUnavailable, setIsUnavailable] = useState(false);
  const { chatHistory, setChatHistory } = useChatHistory();
  const chatRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const systemInstruction = `Você é o Kirpo, um assistente de IA amigável e proativo para o aplicativo de rotina diária 'Smart Kirpo'. Sua principal função é ajudar os usuários a organizar seu dia e criar tarefas.
- Seja conversador e prestativo.
- Formate suas respostas usando Markdown para melhor legibilidade. Use títulos (#), listas (- ou *), **negrito** e *itálico* para organizar a informação.
- Quando um usuário pedir para criar uma rotina ou uma lista de tarefas, primeiro descreva o propósito e os benefícios dessa rotina de forma encorajadora.
- Depois de descrever, pergunte explicitamente ao usuário se ele deseja adicionar as tarefas à sua lista e para quais dias da semana.
- NUNCA adicione tarefas sem a confirmação do usuário.
- Use a função 'add_task_to_list' para adicionar CADA tarefa individualmente, somente após a confirmação.
- Após adicionar as tarefas com sucesso, confirme para o usuário que as tarefas foram adicionadas.
- Responda sempre em português do Brasil.`;

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
      required: ['title', 'priority', 'repeatDays']
    }
  };
  
  const initializeChat = useCallback(() => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const historyForGenAI = chatHistory.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        chatRef.current = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: historyForGenAI,
          config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [addTaskFunctionDeclaration] }],
          }
        });

        if (chatHistory.length === 0) {
          setChatHistory([{ role: 'model', text: "Olá! Sou o Kirpo, seu assistente de rotina. Como posso te ajudar a organizar seu dia?" }]);
        }
        setError('');
    } catch (e) {
        console.error("Failed to initialize Gemini Chat", e);
        setError("Não foi possível iniciar o assistente. Tente novamente mais tarde.");
        setIsUnavailable(true);
    }
  }, [chatHistory, setChatHistory]);

  useEffect(() => {
    if (isOpen) {
      if (!process.env.API_KEY) {
        setIsUnavailable(true);
      } else {
        setIsUnavailable(false);
        initializeChat();
      }
    }
  }, [isOpen, initializeChat]);
  
  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!prompt.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsLoading(true);
    setError('');

    try {
        let response = await chatRef.current.sendMessage({ message: currentPrompt });
        
        while (response.functionCalls) {
            const functionCalls = response.functionCalls;
            const functionResponseParts: Part[] = [];

            for (const call of functionCalls) {
                if (call.name === 'add_task_to_list') {
                    const { title, time, priority, repeatDays } = call.args;

                    const priorityValue = Object.values(Priority).includes(priority as Priority) ? (priority as Priority) : Priority.Medium;

                    addTask({
                        title,
                        time: time || undefined,
                        priority: priorityValue,
                        repeatDays: repeatDays || [],
                        reminder: !!time,
                    });
                    
                    functionResponseParts.push({
                      functionResponse: {
                        name: call.name,
                        id: call.id,
                        response: { result: "ok, tarefa adicionada" }
                      }
                    });
                }
            }
            
            if (functionResponseParts.length > 0) {
              response = await chatRef.current.sendMessage({ message: functionResponseParts });
            } else {
              break;
            }
        }
        
        const modelResponse: ChatMessage = { role: 'model', text: response.text };
        setChatHistory(prev => [...prev, modelResponse]);

    } catch (e) {
        console.error("Error sending message to Gemini:", e);
        setError("Ocorreu um erro na comunicação com a IA. Tente novamente.");
        setChatHistory(prev => prev.filter(msg => msg !== userMessage));
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={handleClose}>
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-lg p-0 animate-slide-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-[var(--brand-color)]" />
            Assistente Kirpo
          </h2>
          <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
            {isUnavailable ? (
               <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                    <div 
                        className="text-sm chat-content"
                        dangerouslySetInnerHTML={{ __html: marked.parse("Sinto muito, mas o **assistente de IA não está disponível**. A chave da API do Google Gemini não foi configurada neste ambiente. Por favor, contate o administrador do site para ativá-lo.", { gfm: true, breaks: true }) as string }}
                    />
                </div>
            ) : (
                <>
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-[var(--brand-color)] text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 rounded-bl-none'}`}>
                                {msg.role === 'model' ? (
                                    <div 
                                        className="text-sm chat-content"
                                        dangerouslySetInnerHTML={{ __html: marked.parse(msg.text, { gfm: true, breaks: true }) as string }}
                                    />
                                ) : (
                                    <p className="text-sm">{msg.text}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 rounded-bl-none">
                                <p className="text-sm italic text-gray-500 dark:text-gray-400">Kirpo está digitando...</p>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                </>
            )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={isUnavailable ? "Assistente indisponível" : "Converse com o Kirpo..."}
                disabled={isLoading || isUnavailable}
                className="flex-grow bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] px-4 disabled:opacity-50"
                />
                <button
                type="submit"
                disabled={isLoading || !prompt.trim() || isUnavailable}
                className="py-2 px-4 bg-[var(--brand-color)] hover:opacity-90 text-white rounded-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Enviar
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;