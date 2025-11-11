import React, { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { XMarkIcon } from './icons';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>) => void;
  taskToEdit?: Task | null;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ isOpen, onClose, onSave, taskToEdit }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.Medium);
  const [reminder, setReminder] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setTime(taskToEdit.time || '');
      setPriority(taskToEdit.priority);
      setReminder(taskToEdit.reminder);
      setSelectedDays(taskToEdit.repeatDays || []);
    } else {
      setTitle('');
      setTime('');
      setPriority(Priority.Medium);
      setReminder(false);
      setSelectedDays([]);
    }
    setError('');
  }, [taskToEdit, isOpen]);

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prevDays =>
      prevDays.includes(dayIndex)
        ? prevDays.filter(d => d !== dayIndex)
        : [...prevDays, dayIndex].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O título é obrigatório.');
      return;
    }
    onSave({ 
        title, 
        time, 
        priority, 
        reminder, 
        repeatDays: selectedDays
    });
  };
  
  if (!isOpen) return null;

  const inputStyle = "mt-1 block w-full bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[var(--brand-color)] focus:border-[var(--brand-color)]";

  const priorityOptions = [
    { value: Priority.Low, label: 'Baixa' },
    { value: Priority.Medium, label: 'Média' },
    { value: Priority.High, label: 'Alta' },
  ];
  
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const weekDayTitles = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];


  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md p-6 animate-slide-in-up" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Título</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputStyle} />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horário (opcional)</label>
                <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className={inputStyle} />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prioridade</label>
                <select id="priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputStyle}>
                  {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Repetir nos dias</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Deixe em branco para uma tarefa única.</p>
              <div className="mt-2 grid grid-cols-7 gap-1 md:gap-2 text-center">
              {weekDays.map((day, index) => (
                  <button
                      key={index}
                      type="button"
                      title={weekDayTitles[index]}
                      onClick={() => handleDayToggle(index)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      selectedDays.includes(index)
                          ? 'bg-[var(--brand-color)] text-white'
                          : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                      {day}
                  </button>
              ))}
              </div>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="reminder" checked={reminder} onChange={e => setReminder(e.target.checked)} className="h-4 w-4 text-[var(--brand-color)] border-gray-300 rounded focus:ring-[var(--brand-color)]" />
            <label htmlFor="reminder" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">Lembrete</label>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md font-medium">Cancelar</button>
            <button type="submit" className="py-2 px-4 bg-[var(--brand-color)] hover:opacity-90 text-white rounded-md font-medium">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
