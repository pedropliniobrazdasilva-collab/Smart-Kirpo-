import React, { useMemo } from 'react';
import { RocketIcon } from './icons';

interface HomeScreenProps {
  onStart: () => void;
}

const StarryBackground: React.FC = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 5 + 5}s`,
      twinkles: Math.random() > 0.7,
    }));
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
      {stars.map(star => (
        <div
          key={star.id}
          className={`absolute bg-white rounded-full ${star.twinkles ? 'animate-twinkle' : ''}`}
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
            animationDuration: star.duration,
            opacity: star.twinkles ? 1 : Math.random() * 0.5 + 0.2,
          }}
        />
      ))}
    </div>
  );
};

const motivationalPhrase = "Domine seu dia com inteligência.";

const HomeScreen: React.FC<HomeScreenProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 text-white relative overflow-hidden animate-fade-in">
      <StarryBackground />

      <div className="relative z-10 flex flex-col items-center">
        <RocketIcon className="w-12 h-12 mb-4 text-[var(--brand-color)]" />
        <h1 className="text-6xl md:text-7xl font-bold text-white tracking-wider">
          Smart Kirpo
        </h1>
        
        <div className="h-16 mt-4 flex flex-col items-center justify-center">
            <div 
              className="overflow-hidden whitespace-nowrap border-r-4 border-r-[var(--brand-color)] text-lg text-gray-200 animate-typewriter"
            >
              {motivationalPhrase}
            </div>
        </div>

        <button
          onClick={onStart}
          style={{ 
             backgroundColor: 'var(--brand-color)',
             boxShadow: `0 4px 14px 0 rgba(var(--brand-color-rgb), 0.39)`
          }}
          className="mt-12 w-full max-w-xs mx-auto text-white font-bold py-4 px-8 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[var(--brand-color)]/50 hover:opacity-90"
        >
          Começar o Dia
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;