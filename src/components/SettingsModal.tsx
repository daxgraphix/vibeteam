import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Sun, Zap, RotateCcw } from 'lucide-react';
import { Theme, Difficulty } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  difficulty: Difficulty;
  onChangeDifficulty: (difficulty: Difficulty) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  onReset, 
  theme, 
  onToggleTheme, 
  difficulty, 
  onChangeDifficulty 
}: SettingsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-display dark:text-white">Settings</h2>
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors dark:text-zinc-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <span className="font-bold dark:text-white">Dark Mode</span>
                  </div>
                  <button 
                    onClick={onToggleTheme}
                    className={`w-14 h-8 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-zinc-300'}`}
                  >
                    <motion.div 
                      animate={{ x: theme === 'dark' ? 24 : 4 }}
                      className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-1">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                      <Zap size={20} />
                    </div>
                    <span className="font-bold dark:text-white">Difficulty Level</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => onChangeDifficulty(level)}
                        className={`py-2 rounded-xl font-bold transition-all border ${
                          difficulty === level 
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : 'bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-indigo-500'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Data */}
                <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                      <RotateCcw size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold dark:text-white">Reset Data</span>
                      <span className="text-[10px] text-zinc-400 font-medium">Clear all teams, scores, and missions</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                        onReset();
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
                <p className="text-xs text-zinc-400 font-medium">VibeTeam Platform v1.2.0</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
