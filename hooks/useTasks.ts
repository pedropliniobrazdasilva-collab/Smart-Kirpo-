import { useState, useEffect, useCallback } from 'react';
import { Task, Priority } from '../types';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    let loadedTasks: Task[] = [];
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        loadedTasks = JSON.parse(storedTasks);
      }
    } catch (error)
      {
      console.error("Failed to load tasks from localStorage", error);
    }

    const lastVisit = localStorage.getItem('lastVisitDate');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastVisit !== today) {
        loadedTasks = loadedTasks.map(task => {
          const isRecurring = task.repeatDays && task.repeatDays.length > 0;
          if (isRecurring && task.completed) {
            return { ...task, completed: false, completedAt: undefined };
          }
          return task;
        });
        localStorage.setItem('lastVisitDate', today);
    }
    
    setTasks(loadedTasks);

  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks to localStorage", error);
    }
  }, [tasks]);

  const addTask = useCallback((taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  }, []);

  const updateTask = useCallback((updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { 
              ...task, 
              completed: !task.completed,
              completedAt: !task.completed ? new Date().toISOString() : undefined,
            }
          : task
      )
    );
  }, []);

  return { tasks, addTask, updateTask, deleteTask, toggleTaskCompletion };
};