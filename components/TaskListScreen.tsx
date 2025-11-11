import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task, Priority } from '../types';
import TaskItem from './TaskItem';
import TaskFormModal from './TaskFormModal';
import AiAssistantModal from './AiAssistantModal';
import { PlusIcon, SparklesIcon } from './icons';
import fetchMotivationalQuote from '../services/geminiService';
import { useSettings } from '../hooks/useSettings';

interface TaskListScreenProps {
  tasksHook: ReturnType<typeof useTasks>;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ tasksHook }) => {
  const { tasks, setTasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = tasksHook;
  const { settings } = useSettings();
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const dragTask = useRef<string | null>(null);
  const dragOverTask = useRef<string | null>(null);

  useEffect(() => {
    if (settings.showMotivation) {
        const getQuote = async () => {
            const quote = await fetchMotivationalQuote();
            setMotivationalQuote(quote);
        };
        getQuote();
    }
  }, [settings.showMotivation]);

  const handleOpenFormModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>) => {
    if (taskToEdit) {
      updateTask({ ...taskToEdit, ...taskData });
    } else {
      addTask(taskData);
    }
    handleCloseFormModal();
  };
  
  const handleDragSort = () => {
    if (dragTask.current === null || dragOverTask.current === null) return;
    
    const tasksClone = [...tasks];
    const draggedTask = tasksClone.find(t => t.id === dragTask.current);
    if (!draggedTask) return;

    // Remove the dragged task from its original position
    const filteredTasks = tasksClone.filter(t => t.id !== dragTask.current);

    // Find the index of the task we dragged over
    const dragOverIndex = filteredTasks.findIndex(t => t.id === dragOverTask.current);
    
    // Insert the dragged task at the new position
    filteredTasks.splice(dragOverIndex, 0, draggedTask);

    setTasks(filteredTasks);
    
    dragTask.current = null;
    dragOverTask.current = null;
  };
  
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // For incomplete tasks, if not manually sorted, sort by time and then priority
    if (!a.completed && !b.completed) {
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      if (a.time && b.time) {
        if (a.time !== b.time) {
          return a.time.localeCompare(b.time);
        }
      }
      const priorityOrder = { [Priority.High]: 0, [Priority.Medium]: 1, [Priority.Low]: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
    }
    return 0; // Keep original order if priorities are the same, or for completed tasks
  });
  
  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

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
              onEdit={() => handleOpenFormModal(task)}
              onDragStart={(e) => { dragTask.current = task.id; e.dataTransfer.effectAllowed = 'move'; }}
              onDragEnter={() => dragOverTask.current = task.id}
              onDragEnd={handleDragSort}
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
                onEdit={() => handleOpenFormModal(task)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-3">
        <button
          onClick={() => setIsAiModalOpen(true)}
          style={{ backgroundColor: 'var(--brand-color)'}}
          className="w-14 h-14 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all duration-300"
          aria-label="Assistente de IA Kirpo"
        >
          <SparklesIcon className="w-7 h-7" />
        </button>
        <button
          onClick={() => handleOpenFormModal()}
          style={{ backgroundColor: 'var(--brand-color)'}}
          className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Adicionar nova tarefa"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>

      <TaskFormModal 
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
      
      <AiAssistantModal 
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        addTask={addTask}
      />
      
    </div>
  );
};

export default TaskListScreen;