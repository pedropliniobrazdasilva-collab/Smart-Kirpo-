import React, { useState, useEffect } from 'react';
import { RocketIcon } from './icons';

interface PinLockScreenProps {
  correctPin: string;
  onUnlock: () => void;
}

const PinLockScreen: React.FC<PinLockScreenProps> = ({ correctPin, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === correctPin.length) {
      if (pin === correctPin) {
        onUnlock();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 800);
      }
    }
  }, [pin, correctPin, onUnlock]);

  const handleKeyClick = (key: string) => {
    if (pin.length < correctPin.length) {
      setPin(pin + key);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };
  
  const PinDots: React.FC<{ length: number; filled: number, hasError: boolean }> = ({ length, filled, hasError }) => (
    <div className={`flex justify-center gap-4 ${hasError ? 'animate-shake' : ''}`}>
        {Array.from({ length }).map((_, i) => (
            <div 
                key={i}
                className={`w-4 h-4 rounded-full transition-colors duration-200 ${i < filled ? 'bg-[var(--brand-color)]' : 'bg-gray-200 dark:bg-gray-600'} ${hasError ? '!bg-red-500' : ''}`}
            />
        ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 dark:bg-dark-bg z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center">
            <RocketIcon className="w-10 h-10 mb-4 text-[var(--brand-color)] mx-auto" />
            <h1 className="text-2xl font-bold">Smart Kirpo</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Digite seu PIN para continuar</p>
        </div>

        <div className="my-8">
            <PinDots length={correctPin.length} filled={pin.length} hasError={error} />
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(key => (
                <button key={key} onClick={() => handleKeyClick(key)} className="p-4 text-2xl font-semibold bg-white dark:bg-dark-surface rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
                    {key}
                </button>
            ))}
             <div />
             <button onClick={() => handleKeyClick('0')} className="p-4 text-2xl font-semibold bg-white dark:bg-dark-surface rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)]">
                0
             </button>
             <button onClick={handleDelete} className="p-4 text-xl font-semibold bg-white dark:bg-dark-surface rounded-full shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--brand-color)] flex items-center justify-center">
                ⌫
             </button>
        </div>
        
        <style>{`
            .animate-shake {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        `}</style>
    </div>
  );
};

export default PinLockScreen;