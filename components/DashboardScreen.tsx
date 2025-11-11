import React from 'react';
import { Task } from '../types';

interface DashboardScreenProps {
  tasks: Task[];
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ tasks }) => {
  const completedTasks = tasks.filter(task => task.completed);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const getTasksCompletedPerDay = () => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const counts = Array(7).fill(0);
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));

    completedTasks.forEach(task => {
        if(task.completedAt) {
            const completedDate = new Date(task.completedAt);
            if (completedDate >= weekStart) {
                counts[completedDate.getDay()]++;
            }
        }
    });
    return { labels: days, data: counts };
  };

  const chartData = getTasksCompletedPerDay();
  const maxTasks = Math.max(...chartData.data, 1);

  const StatCard: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
      <span className="text-3xl font-bold text-[var(--brand-color)]">{value}</span>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-slide-in-up">
      <h2 className="text-2xl font-bold">Painel de Produtividade</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Tarefas Totais" value={tasks.length} />
        <StatCard title="Concluídas" value={completedTasks.length} />
        <StatCard title="Produtividade" value={`${completionRate}%`} />
      </div>
      
      <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-md">
        <h3 className="font-bold mb-4">Tarefas concluídas esta semana</h3>
        <div className="flex justify-between items-end h-48 space-x-2">
            {chartData.labels.map((label, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full h-full flex items-end">
                        <div 
                            className="w-full bg-[var(--brand-color)] rounded-t-md hover:opacity-80 transition-opacity"
                            style={{ height: `${(chartData.data[index] / maxTasks) * 100}%` }}
                            title={`${chartData.data[index]} tarefas`}
                        ></div>
                    </div>
                    <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">{label}</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
