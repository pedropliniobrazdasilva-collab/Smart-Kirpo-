import React from 'react';
import { Task, Priority } from '../types';
import { TrashIcon, PencilIcon, CheckIcon } from './icons';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  isReadOnly?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit, isReadOnly = false }) => {
  const priorityClasses: { [key in Priority]: string } = {
    [Priority.High]: 'border-red-500',
    [Priority.Medium]: 'border-yellow-500',
    [Priority.Low]: 'border-green-500',
  };
  
  const formatRepeatDays = (days?: number[]): string => {
      if (!days || days.length === 0) return '';
      if (days.length === 7) return 'Diariamente';
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      return days.sort((a,b) => a-b).map(d => dayNames[d]).join(', ');
  };


  return (
    <div
      className={`flex items-center p-3 bg-white dark:bg-dark-surface rounded-lg shadow-sm border-l-4 ${priorityClasses[task.priority]} transition-all duration-300 ${task.completed ? 'opacity-50' : ''}`}
    >
      <button
        onClick={() => !isReadOnly && onToggle(task.id)}
        disabled={isReadOnly}
        aria-label={task.completed ? 'Marcar como não concluída' : 'Marcar como concluída'}
        className={`w-7 h-7 min-w-[28px] rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${task.completed ? 'bg-[var(--brand-color)] border-[var(--brand-color)]' : 'border-gray-300 dark:border-gray-500'} ${isReadOnly ? 'cursor-not-allowed' : ''}`}
      >
        {task.completed && <CheckIcon className="w-4 h-4 text-white" />}
      </button>

      <div className="flex-grow">
        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </p>
        <div className="flex items-center space-x-2">
            {task.time && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{task.time}</span>
            )}
            {task.repeatDays && task.repeatDays.length > 0 && (
              <span className="text-xs text-[var(--brand-color)] font-semibold">
                {formatRepeatDays(task.repeatDays)}
              </span>
            )}
        </div>
      </div>

      {!isReadOnly && (
        <div className="flex items-center space-x-2 ml-2">
          <button onClick={() => onEdit(task)} aria-label="Editar tarefa" className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={() => onDelete(task.id)} aria-label="Excluir tarefa" className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
