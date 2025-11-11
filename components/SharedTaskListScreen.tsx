import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { RocketIcon } from './icons';

interface SharedTaskListScreenProps {
  tasks: Task[];
}

const SharedTaskListScreen: React.FC<SharedTaskListScreenProps> = ({ tasks }) => {
  const sortedTasks = [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const goToMainApp = () => {
    window.location.href = window.location.origin + window.location.pathname;
  }

  // Shared screen will always use the default orange color
  const brandColor = '#FF7A00';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg text-gray-900 dark:text-gray-100 p-4 md:p-6 animate-fade-in" style={{'--brand-color': brandColor} as React.CSSProperties}>
        <header className="text-center mb-6">
            <div className="flex items-center justify-center gap-3">
                {/* FIX: Property 'style' does not exist on type 'IconProps'. Changed to use className to set color via CSS variable. */}
                <RocketIcon className="w-8 h-8 text-[var(--brand-color)]"/>
                <h1 className="text-3xl font-bold" style={{ color: brandColor }}>Smart Kirpo</h1>
            </div>
            <p className="text-lg mt-2 text-gray-600 dark:text-gray-400">Visualizando uma rotina compartilhada</p>
        </header>
        
        <main className="max-w-2xl mx-auto">
            <div className="space-y-3">
                {sortedTasks.length > 0 ? (
                sortedTasks.map(task => (
                    <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => {}}
                    onDelete={() => {}}
                    onEdit={() => {}}
                    isReadOnly={true}
                    />
                ))
                ) : (
                <div className="text-center py-10 px-4 bg-white dark:bg-dark-surface rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">Esta lista de tarefas está vazia.</p>
                </div>
                )}
            </div>

            <div className="mt-8 text-center">
                <button
                onClick={goToMainApp}
                className="text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300 focus:outline-none focus:ring-4"
                // FIX: Cast the style object to React.CSSProperties to allow custom CSS properties like '--tw-ring-color'.
                style={{ 
                    backgroundColor: brandColor,
                    boxShadow: `0 4px 14px 0 rgba(255, 122, 0, 0.39)`,
                    '--tw-ring-color': 'rgba(255, 153, 51, 0.5)'
                } as React.CSSProperties}
                >
                Crie sua própria rotina
                </button>
            </div>
        </main>
    </div>
  );
};

export default SharedTaskListScreen;
