import React, { useState, useEffect, useMemo, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import TaskListScreen from './components/TaskListScreen';
import DashboardScreen from './components/DashboardScreen';
import Header from './components/Header';
import SharedTaskListScreen from './components/SharedTaskListScreen';
import { useTasks } from './hooks/useTasks';
import { Task } from './types';

export type Screen = 'home' | 'tasks' | 'dashboard';
export type Theme = 'light' | 'dark';

const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
      {message}
    </div>
  );
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'dark';
  });
  
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const notifiedTasks = useRef(new Set<string>());

  const [screen, setScreen] = useState<Screen>('home');
  const tasksHook = useTasks();
  
  const [sharedTasks, setSharedTasks] = useState<Task[] | null>(null);
  const [isShareView, setIsShareView] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('shared');

    if (sharedData) {
      try {
        // Robust base64 to UTF-8 decoding
        const binaryString = atob(sharedData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedJson = new TextDecoder().decode(bytes);
        
        const tasks = JSON.parse(decodedJson);
        if (Array.isArray(tasks)) {
          setSharedTasks(tasks);
          setIsShareView(true);
        }
      } catch (error) {
        console.error("Failed to parse shared tasks:", error);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Notification scheduler effect
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      
      tasksHook.tasks.forEach(task => {
        if (task.reminder && task.time && !task.completed) {
          const [hours, minutes] = task.time.split(':').map(Number);
          const taskTime = new Date();
          taskTime.setHours(hours, minutes, 0, 0);

          const timeDiff = taskTime.getTime() - now.getTime();
          const minutesUntil = Math.ceil(timeDiff / (1000 * 60));

          // On-start notification (triggers from 0 to -1 minute to catch it)
          if (minutesUntil <= 0 && minutesUntil > -2) {
             const notificationKey = `start-${task.id}-${todayStr}`;
             if(!notifiedTasks.current.has(notificationKey)) {
                new Notification(`Hora da Tarefa: ${task.title}`, {
                  body: 'Sua tarefa está começando agora!',
                  icon: 'https://cdn-icons-png.flaticon.com/192/10831/10831283.png',
                  badge: 'https://cdn-icons-png.flaticon.com/192/10831/10831283.png',
                });
                notifiedTasks.current.add(notificationKey);
             }
          }

          // Pre-task notification (15 mins before)
          const approachingNotificationKey = `approaching-${task.id}-${todayStr}`;
          if (minutesUntil > 0 && minutesUntil <= 15 && !notifiedTasks.current.has(approachingNotificationKey)) {
             new Notification(`Tarefa Próxima: ${task.title}`, {
               body: `Sua tarefa começa em ${minutesUntil} minutos.`,
               icon: 'https://cdn-icons-png.flaticon.com/192/10831/10831283.png',
               badge: 'https://cdn-icons-png.flaticon.com/192/10831/10831283.png',
             });
             notifiedTasks.current.add(approachingNotificationKey);
          }
        }
      });

      // Clean up old notification keys at midnight
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedTasks.current.clear();
      }

    }, 60000); // Check every minute

    return () => clearInterval(interval);

  }, [tasksHook.tasks, notificationPermission]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };
  
  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleShare = async () => {
    if (tasksHook.tasks.length === 0) {
      alert("Adicione algumas tarefas antes de compartilhar!");
      return;
    }

    try {
        const tasksJson = JSON.stringify(tasksHook.tasks);
        
        // Robust UTF-8 to base64 encoding
        const utf8Bytes = new TextEncoder().encode(tasksJson);
        let binaryString = '';
        utf8Bytes.forEach((byte) => {
            binaryString += String.fromCharCode(byte);
        });
        const base64Tasks = btoa(binaryString);

        const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${base64Tasks}`;

        if (navigator.share) {
            await navigator.share({
                title: 'Minha Rotina Smart Kirpo',
                text: 'Confira minha rotina diária!',
                url: shareUrl,
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            showToast("Link copiado para a área de transferência!");
        }
    } catch (error) {
        console.error('Falha ao compartilhar/copiar:', error);
        alert("Não foi possível gerar o link de compartilhamento.");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        // Optional: Show a user-friendly message
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const handleStart = () => {
    toggleFullscreen();
    setScreen('tasks');
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onStart={handleStart} />;
      case 'tasks':
        return <TaskListScreen tasksHook={tasksHook} />;
      case 'dashboard':
        return <DashboardScreen tasks={tasksHook.tasks} />;
      default:
        return <HomeScreen onStart={handleStart} />;
    }
  };
  
  if (isShareView && sharedTasks) {
    return <SharedTaskListScreen tasks={sharedTasks} />;
  }


  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} text-gray-900 dark:text-gray-100 transition-colors duration-500`}>
      
      {screen !== 'home' && (
        <Header 
          activeScreen={screen} 
          setScreen={setScreen} 
          theme={theme}
          toggleTheme={toggleTheme}
          onShare={handleShare}
        />
      )}
      
      {screen !== 'home' && notificationPermission === 'default' && (
        <div className="bg-brand-orange/20 dark:bg-brand-light/20 text-brand-dark dark:text-brand-light p-3 text-center text-sm">
          Para receber lembretes de tarefas,{' '}
          <button onClick={requestNotificationPermission} className="font-bold underline hover:opacity-80">
            ative as notificações
          </button>.
        </div>
      )}
      
      <main className="p-4 md:p-6 relative z-10">
        {renderScreen()}
      </main>
      
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </div>
  );
};

export default App;