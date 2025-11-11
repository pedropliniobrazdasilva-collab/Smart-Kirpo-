import React from 'react';
import { Task, Priority } from '../types';
import { XMarkIcon, SparklesIcon, SunIcon, BriefcaseIcon, AcademicCapIcon, MoonIcon } from './icons';

type RoutineTask = Omit<Task, 'id' | 'completed' | 'createdAt' | 'completedAt'>;

interface Routine {
  id: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  tasks: RoutineTask[];
}

const routines: Routine[] = [
  {
    id: 'morning',
    title: 'Manhã Produtiva',
    description: 'Comece seu dia com energia e foco.',
    icon: SunIcon,
    tasks: [
      { title: 'Arrume a cama', time: '07:00', priority: Priority.Low, reminder: true, repeatDays: [] },
      { title: 'Meditar por 10 minutos', time: '07:10', priority: Priority.Medium, reminder: true, repeatDays: [] },
      { title: 'Tomar café da manhã', time: '07:30', priority: Priority.Medium, reminder: true, repeatDays: [] },
      { title: 'Revisar metas do dia', time: '08:00', priority: Priority.High, reminder: true, repeatDays: [] },
    ],
  },
  {
    id: 'work',
    title: 'Foco no Trabalho',
    description: 'Organize suas tarefas para um dia de trabalho eficiente.',
    icon: BriefcaseIcon,
    tasks: [
      { title: 'Verificar e responder e-mails importantes', time: '09:00', priority: Priority.High, reminder: true, repeatDays: [] },
      { title: 'Bloco de trabalho focado 1', time: '09:30', priority: Priority.High, reminder: true, repeatDays: [] },
      { title: 'Pausa de 15 minutos', time: '11:00', priority: Priority.Low, reminder: true, repeatDays: [] },
      { title: 'Reunião de alinhamento', time: '14:00', priority: Priority.Medium, reminder: true, repeatDays: [] },
      { title: 'Planejar tarefas do próximo dia', time: '17:30', priority: Priority.Medium, reminder: true, repeatDays: [] },
    ],
  },
  {
    id: 'study',
    title: 'Sessão de Estudos',
    description: 'Uma rotina para maximizar seu aprendizado.',
    icon: AcademicCapIcon,
    tasks: [
      { title: 'Revisar anotações da aula anterior', time: '18:00', priority: Priority.Medium, reminder: true, repeatDays: [] },
      { title: 'Estudar novo tópico (Pomodoro 25min)', time: '18:30', priority: Priority.High, reminder: true, repeatDays: [] },
      { title: 'Pausa de 5 minutos', time: '18:55', priority: Priority.Low, reminder: true, repeatDays: [] },
      { title: 'Fazer exercícios práticos', time: '19:00', priority: Priority.High, reminder: true, repeatDays: [] },
      { title: 'Resumir o que foi aprendido', time: '19:45', priority: Priority.Medium, reminder: true, repeatDays: [] },
    ],
  },
  {
    id: 'evening',
    title: 'Relaxamento Noturno',
    description: 'Desconecte-se e prepare-se para uma boa noite de sono.',
    icon: MoonIcon,
    tasks: [
      { title: 'Organizar o dia seguinte', time: '21:00', priority: Priority.Medium, reminder: true, repeatDays: [] },
      { title: 'Desligar telas (celular, TV)', time: '21:30', priority: Priority.High, reminder: true, repeatDays: [] },
      { title: 'Ler um livro por 20 minutos', time: '21:40', priority: Priority.Low, reminder: true, repeatDays: [] },
      { title: 'Meditação ou alongamento leve', time: '22:00', priority: Priority.Low, reminder: true, repeatDays: [] },
    ],
  },
];


interface RoutineGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRoutine: (tasks: RoutineTask[]) => void;
}

const RoutineGeneratorModal: React.FC<RoutineGeneratorModalProps> = ({ isOpen, onClose, onAddRoutine }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-lg p-0 animate-slide-in-up flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-[var(--brand-color)]" />
            Gerador de Rotinas
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow p-4 space-y-3 overflow-y-auto">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selecione uma rotina pré-definida para adicionar à sua lista de tarefas.</p>
            {routines.map((routine) => (
                <button 
                    key={routine.id}
                    onClick={() => onAddRoutine(routine.tasks)}
                    className="w-full text-left flex items-center gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]"
                >
                    <div className="flex-shrink-0 bg-[var(--brand-color)]/20 text-[var(--brand-color)] p-3 rounded-full">
                        <routine.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{routine.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{routine.description}</p>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default RoutineGeneratorModal;