import React from 'react';
import { Screen, Theme } from '../App';
import { SunIcon, MoonIcon, ChartBarIcon, ListBulletIcon, ShareIcon } from './icons';

interface HeaderProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
  theme: Theme;
  toggleTheme: () => void;
  onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeScreen, setScreen, theme, toggleTheme, onShare }) => {
  const NavButton: React.FC<{ screen: Screen, label: string, children: React.ReactNode }> = ({ screen, label, children }) => (
    <button
      onClick={() => setScreen(screen)}
      aria-label={label}
      className={`p-2 rounded-full transition-colors duration-300 ${activeScreen === screen ? 'bg-brand-orange text-white' : 'hover:bg-gray-200 dark:hover:bg-dark-surface'}`}
    >
      {children}
    </button>
  );

  return (
    <header className="sticky top-0 z-10 bg-gray-100/80 dark:bg-dark-bg/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 animate-fade-in">
      <h1 className="text-xl font-bold text-brand-orange">Smart Kirpo</h1>
      <nav className="flex items-center space-x-2">
        <NavButton screen="tasks" label="Ver tarefas">
          <ListBulletIcon className="w-6 h-6" />
        </NavButton>
        <NavButton screen="dashboard" label="Ver painel">
          <ChartBarIcon className="w-6 h-6" />
        </NavButton>
        {activeScreen === 'tasks' && (
          <button
            onClick={onShare}
            aria-label="Compartilhar tarefas"
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors duration-300"
          >
            <ShareIcon className="w-6 h-6" />
          </button>
        )}
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-surface transition-colors duration-300"
        >
          {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
        </button>
      </nav>
    </header>
  );
};

export default Header;