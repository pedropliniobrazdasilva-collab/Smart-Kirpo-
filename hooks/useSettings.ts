import { useState, useEffect, useCallback } from 'react';
import { Settings } from '../types';

const SETTINGS_KEY = 'smart-kirpo-settings';

const defaultSettings: Settings = {
  enableNotifications: true,
  autoIntervals: false,
  theme: 'dark',
  primaryColor: 'orange',
  fontSize: 'medium',
  layout: 'list',
  showStats: true,
  showAchievements: true,
  dailyGoals: '',
  usePin: false,
  pin: null,
  enableSounds: true,
  showMotivation: true,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        // Merge stored settings with defaults to ensure all keys are present
        const parsedSettings = JSON.parse(storedSettings);
        return { ...defaultSettings, ...parsedSettings };
      }
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [key]: value,
    }));
  }, []);

  return { settings, setSettings, updateSetting };
};