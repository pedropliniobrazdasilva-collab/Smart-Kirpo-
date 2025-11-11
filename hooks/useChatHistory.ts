import { useState, useEffect } from 'react';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const CHAT_HISTORY_KEY = 'smart-kirpo-chat-history';

export const useChatHistory = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (storedHistory) {
        return JSON.parse(storedHistory);
      }
    } catch (error) {
      console.error("Failed to load chat history from localStorage", error);
    }
    return []; // Return empty array if nothing is stored or on error
  });

  useEffect(() => {
    try {
      // Don't save if it's just the initial message
      if (chatHistory.length > 1 || (chatHistory.length === 1 && chatHistory[0].role !== 'model')) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
      }
    } catch (error)      {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [chatHistory]);

  return { chatHistory, setChatHistory };
};
