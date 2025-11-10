import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { Task } from '../types';
import TaskItem from './TaskItem';
import TaskFormModal from './TaskFormModal';
import { PlusIcon } from './icons';

interface TaskListScreenProps {
  tasksHook: ReturnType<typeof useTasks>;
}

const TaskListScreen: React.FC<TaskListScreenProps> = ({ tasksHook }) => {
  const { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion } = tasksHook;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleOpenModal = (task?: Task) => {
    setEditingTask(task || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>) => {
    if (editingTask) {
      updateTask({ ...editingTask, ...taskData });
    } else {
      addTask(taskData as Omit<Task, 'id' | 'completed' | 'createdAt'>);
    }
    handleCloseModal();
  };

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks]);

  return (
    <div className="animate-slide-in-up">
      <h2 className="text-2xl font-bold mb-4">Minhas Tarefas</h2>
      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
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
            <p className="text-gray-500 dark:text-gray-400">Você não tem tarefas ainda.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Clique no botão '+' para adicionar sua primeira tarefa!</p>
          </div>
        )}
      </div>

      <button
        onClick={() => handleOpenModal()}
        aria-label="Adicionar nova tarefa"
        className="fixed bottom-6 right-6 bg-brand-orange hover:bg-brand-light text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-all duration-300"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={editingTask}
      />
    </div>
  );
};

export default TaskListScreen;
