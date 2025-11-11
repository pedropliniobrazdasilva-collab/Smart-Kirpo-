import React from 'react';
import { Screen } from '../App';
import { Theme } from '../types';
import { SunIcon, MoonIcon, ChartBarIcon, ListBulletIcon, ShareIcon, Cog6ToothIcon } from './icons';

interface HeaderProps {
  activeScreen: Screen;
  setScreen: (screen: Screen) => void;
  theme: Theme;
  toggleTheme: () => void;
  onShare: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeScreen, setScreen, theme, toggleTheme, onShare }) => {
  
  const brandColor = 'var(--brand-color, #FF7A00)';

  const NavButton: React.FC<{ screen: Screen, label: string, children: React.ReactNode }> = ({ screen, label, children }) => (
    <button
      onClick={() => setScreen(screen)}
      aria-label={label}
      className={`p-2 rounded-full transition-colors duration-300 ${activeScreen === screen ? 'text-white' : 'hover:bg-gray-200 dark:hover:bg-dark-surface'}`}
      style={{ backgroundColor: activeScreen === screen ? brandColor : 'transparent' }}
    >
      {children}
    </button>
  );

  return (
    <header className="sticky top-0 z-20 bg-gray-100/80 dark:bg-dark-bg/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 animate-fade-in">
      <h1 className="text-xl font-bold" style={{ color: brandColor }}>Smart Kirpo</h1>
      <nav className="flex items-center space-x-1 md:space-x-2">
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
        <NavButton screen="settings" label="Configurações">
            <Cog6ToothIcon className="w-6 h-6" />
        </NavButton>
      </nav>
    </header>
  );
};

export default Header;
