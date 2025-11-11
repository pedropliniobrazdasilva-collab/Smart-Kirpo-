import React, { useState, useEffect } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task, Priority } from '../types';
import TaskItem from './TaskItem';
import TaskFormModal from './TaskFormModal';
import RoutineGeneratorModal from './RoutineGeneratorModal'; // Novo componente
import { PlusIcon, SparklesIcon } from './icons';
import fetchMotivationalQuote from '../services/geminiService';
import { useSettings } from '../hooks/useSettings';

interface TaskListScreenProps {
  tasksHook: ReturnType<typeof useTasks>;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ tasksHook }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = tasksHook;
  const { settings } = useSettings();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false); // Novo estado
  const [motivationalQuote, setMotivationalQuote] = useState('');

  useEffect(() => {
    if (settings.showMotivation) {
        const getQuote = async () => {
            const quote = await fetchMotivationalQuote();
            setMotivationalQuote(quote);
        };
        getQuote();
    }
  }, [settings.showMotivation]);

  const handleOpenModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };
  
  const handleAddRoutine = (routineTasks: Omit<Task, 'id' | 'completed' | 'createdAt'>[]) => {
    routineTasks.forEach(task => addTask(task));
    setIsRoutineModalOpen(false);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>) => {
    if (taskToEdit) {
      updateTask({ ...taskToEdit, ...taskData });
    } else {
      addTask(taskData);
    }
    handleCloseModal();
  };
  
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Sort by time first for incomplete tasks
    if (!a.completed && !b.completed) {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      if (a.time && b.time) {
        if (a.time !== b.time) {
          return a.time.localeCompare(b.time);
        }
      }
    }
    // Then sort by priority
    const priorityOrder = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });
  
  const incompleteTasks = sortedTasks.filter(t => !t.completed);
  const completedTasks = sortedTasks.filter(t => t.completed);

  return (
    <div className="space-y-4 animate-slide-in-up pb-24">
      {settings.showMotivation && motivationalQuote && (
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-md text-center italic text-gray-600 dark:text-gray-300">
          <p>"{motivationalQuote}"</p>
        </div>
      )}
      
      <div className="space-y-3">
        {incompleteTasks.length > 0 ? (
          incompleteTasks.map(task => (
            <TaskItem 
              key={task.id}
              task={task}
              onToggle={toggleTaskCompletion}
              onDelete={deleteTask}
              onEdit={() => handleOpenModal(task)}
            />
          ))
        ) : (
          <div className="text-center py-10 px-4 bg-white dark:bg-dark-surface rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">Tudo limpo! Adicione uma nova tarefa para começar.</p>
          </div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold my-4 text-gray-500 dark:text-gray-400">Concluídas</h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id}
                task={task}
                onToggle={toggleTaskCompletion}
                onDelete={deleteTask}
                onEdit={() => handleOpenModal(task)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 flex flex-col items-center gap-3 z-30">
        <button
          onClick={() => setIsRoutineModalOpen(true)}
          style={{ backgroundColor: 'var(--brand-color)'}}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Gerador de Rotinas"
        >
          <SparklesIcon className="w-7 h-7" />
        </button>
        <button
          onClick={() => handleOpenModal()}
          style={{ backgroundColor: 'var(--brand-color)'}}
          className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Adicionar nova tarefa"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>

      <TaskFormModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <RoutineGeneratorModal
        isOpen={isRoutineModalOpen}
        onClose={() => setIsRoutineModalOpen(false)}
        onAddRoutine={handleAddRoutine}
      />
    </div>
  );
};

export default TaskListScreen;