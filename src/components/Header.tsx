import { useState } from 'react';
import { Gamepad2, Settings, Zap } from 'lucide-react';
import { Theme, Difficulty } from '../types';
import { SettingsModal } from './SettingsModal';

interface HeaderProps {
  onReset: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

export function Header({ 
  onReset, 
  theme, 
  onToggleTheme, 
  difficulty, 
  onChangeDifficulty 
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className={`flex items-center justify-between p-6 border-b transition-colors ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Gamepad2 size={24} />
          </div>
          <h1 className={`text-2xl font-bold tracking-tight font-display ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>VibeTeam</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
            <Zap size={14} className="text-amber-500" />
            {difficulty}
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-xl transition-all ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onReset={onReset}
        theme={theme}
        onToggleTheme={onToggleTheme}
        difficulty={difficulty}
        onChangeDifficulty={onChangeDifficulty}
      />
    </>
  );
}
