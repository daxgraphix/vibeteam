import { motion } from 'motion/react';
import { Gamepad2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-zinc-900 flex flex-col items-center justify-center text-white p-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(79,70,229,0.4)]"
        >
          <Gamepad2 size={48} />
        </motion.div>
        <h1 className="text-6xl font-black mb-4 tracking-tighter font-display">VIBETEAM</h1>
        <p className="text-zinc-400 text-xl font-medium mb-12">The Ultimate Meeting Engagement Platform</p>
        
        <button
          onClick={onComplete}
          className="bg-white text-zinc-900 px-12 py-4 rounded-2xl font-black text-xl shadow-xl hover:bg-indigo-50 transition-colors cursor-pointer w-full max-w-xs"
        >
          LET'S VIBE
        </button>
      </motion.div>
      
      <div className="absolute bottom-12 text-zinc-600 font-bold text-sm tracking-widest uppercase">
        Powered by CS Studio
      </div>
    </div>
  );
}
