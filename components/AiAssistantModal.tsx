import React, { useState, useEffect, useRef } from 'react';
import type { Part, Content } from "@google/genai";
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
  const { chatHistory, setChatHistory } = useChatHistory();
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (chatHistory.length === 0) {
        setChatHistory([{ role: 'model', text: "Olá! Sou o Kirpo, seu assistente de rotina. Como posso te ajudar a organizar seu dia?" }]);
      }
    }
  }, [isOpen, chatHistory.length, setChatHistory]);
  
  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading, error]);

  const callGeminiProxy = async (history: Content[]) => {
    const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', payload: { history } }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Proxy request failed');
    }
    return response.json();
  };

  const handleSendMessage = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: prompt };
    setChatHistory(prev => [...prev, userMessage]);
    
    setPrompt('');
    setIsLoading(true);
    setError('');

    try {
        const convertHistoryForApi = (history: ChatMessage[]): Content[] => {
            return history.map(msg => ({
                role: msg.role as 'user' | 'model',
                parts: [{ text: msg.text }]
            }));
        };
        
        let historyForApi = convertHistoryForApi([...chatHistory, userMessage]);

        let response = await callGeminiProxy(historyForApi);
        
        while (response.functionCalls && response.functionCalls.length > 0) {
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
                historyForApi.push({ role: 'model', parts: response.candidates[0].content.parts });
                historyForApi.push({ role: 'user', parts: functionResponseParts });
                response = await callGeminiProxy(historyForApi);
            } else {
              break;
            }
        }
        
        const modelResponse: ChatMessage = { role: 'model', text: response.text };
        setChatHistory(prev => [...prev, modelResponse]);

    } catch (e) {
        console.error("Error sending message to Gemini via proxy:", e);
        if (e instanceof Error && e.message.includes("API key is not configured")) {
             setError("Desculpe, o assistente de IA não está disponível no momento.");
        } else {
             setError("Ocorreu um erro na comunicação com a IA. Tente novamente.");
        }
        setChatHistory(prev => prev.slice(0, -1)); // Remove the user's message that failed
    } finally {
        setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const isEffectivelyUnavailable = error.includes("não está disponível");

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
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={isEffectivelyUnavailable ? "Assistente indisponível" : "Converse com o Kirpo..."}
                disabled={isLoading || isEffectivelyUnavailable}
                className="flex-grow bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-full shadow-sm focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)] px-4 disabled:opacity-50"
                />
                <button
                type="submit"
                disabled={isLoading || !prompt.trim() || isEffectivelyUnavailable}
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
