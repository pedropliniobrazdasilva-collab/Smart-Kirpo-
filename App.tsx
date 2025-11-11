import React, { useState, useEffect, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import TaskListScreen from './components/TaskListScreen';
import DashboardScreen from './components/DashboardScreen';
import SettingsScreen from './components/SettingsScreen';
import Header from './components/Header';
import PinLockScreen from './components/PinLockScreen';
import { useTasks } from './hooks/useTasks';
import { useSettings } from './hooks/useSettings';
import { Task } from './types';

export type Screen = 'home' | 'tasks' | 'dashboard' | 'settings';

const App: React.FC = () => {
  const { settings, updateSetting, setSettings } = useSettings();
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const notifiedTasks = useRef(new Set<string>());

  const [screen, setScreen] = useState<Screen>('home');
  const [isLocked, setIsLocked] = useState(false);
  
  const tasksHook = useTasks();
  
  useEffect(() => {
    // Check for lock screen on initial load
    if (settings.usePin && settings.pin) {
      setIsLocked(true);
    }
  }, []); // Run only once on mount

  useEffect(() => {
    const root = window.document.documentElement;
    // Theme
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // Font Size
    root.classList.remove('text-sm', 'text-base', 'text-lg');
    const fontSizeMap = { small: 'text-sm', medium: 'text-base', large: 'text-lg' };
    root.classList.add(fontSizeMap[settings.fontSize]);

    // Primary Color
    const colorMap = {
        orange: '#FF7A00',
        blue: '#3B82F6',
        green: '#22C55E',
    };
    root.style.setProperty('--brand-color', colorMap[settings.primaryColor]);

  }, [settings.theme, settings.fontSize, settings.primaryColor]);

  // Notification scheduler effect
  useEffect(() => {
    if (notificationPermission !== 'granted' || !settings.enableNotifications) return;

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

      if (now.getHours() === 0 && now.getMinutes() === 0) {
        notifiedTasks.current.clear();
      }

    }, 60000);

    return () => clearInterval(interval);

  }, [tasksHook.tasks, notificationPermission, settings.enableNotifications]);
  
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      updateSetting('enableNotifications', true);
    }
  };
  
  const handleStart = () => {
    setScreen('tasks');
  }

  const handleUnlock = () => {
    setIsLocked(false);
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onStart={handleStart} />;
      case 'tasks':
        return <TaskListScreen tasksHook={tasksHook} />;
      case 'dashboard':
        return <DashboardScreen tasks={tasksHook.tasks} />;
      case 'settings':
        return <SettingsScreen settings={settings} updateSetting={updateSetting} tasksHook={tasksHook} setSettings={setSettings}/>;
      default:
        return <HomeScreen onStart={handleStart} />;
    }
  };
  
  const mainContent = (
      <>
          {screen !== 'home' && (
            <Header 
              activeScreen={screen} 
              setScreen={setScreen} 
              theme={settings.theme}
              toggleTheme={() => updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light')}
            />
          )}
          
          {screen !== 'home' && notificationPermission === 'default' && (
            <div className="bg-[var(--brand-color)]/20 text-[var(--brand-color)] p-3 text-center text-sm">
              Para receber lembretes de tarefas,{' '}
              <button onClick={requestNotificationPermission} className="font-bold underline hover:opacity-80">
                ative as notificações
              </button>.
            </div>
          )}
          
          <main className="p-4 md:p-6 relative z-10">
            {renderScreen()}
          </main>
      </>
  );

  return (
    <div className={`relative min-h-screen ${settings.theme === 'dark' ? 'bg-dark-bg' : 'bg-gray-100'} text-gray-900 dark:text-gray-100 transition-colors duration-500`}>
      {isLocked ? (
        <PinLockScreen correctPin={settings.pin!} onUnlock={handleUnlock} />
      ) : mainContent}
    </div>
  );
};

export default App;