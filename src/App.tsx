import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  User, 
  Trophy, 
  Play, 
  RotateCcw, 
  ChevronLeft,
  Gamepad2,
  Zap,
  Timer as TimerIcon,
  Brain,
  MessageSquare,
  Image as ImageIcon,
  PenTool,
  Hash,
  Sparkles,
  ChevronRight,
  Volume2,
  VolumeX,
  Flame,
  Check,
  X,
  ArrowRight,
  Target,
  Star,
  Award,
  Grid,
  Type,
  Search,
  Eye,
  Shuffle,
  Globe,
  MapPin,
  Music,
  BookOpen,
  Palmtree,
  Sword
} from 'lucide-react';
import { GameMode, Theme, Difficulty, Team, Player, Mission } from './types';
import { 
  LiveTicker, 
  SplashScreen, 
  FloatingText, 
  GameEndSummary, 
  Header, 
  GameCard,
  Leaderboard,
  MissionProgress
} from './components';
import { 
  GAMES,
  GAME_COLORS,
  INITIAL_MISSIONS,
  DAILY_CHALLENGES,
  VIBE_BOOSTERS,
  STORY_CHAPTERS,
  BOSS_BATTLES,
  TOURNAMENTS,
  LEADERBOARD_DATA
} from './constants';
import {
  TRIVIA_QUESTIONS, 
  EMOJI_PUZZLES, 
  WOULD_YOU_RATHER, 
  BRAIN_TEASERS,
  RAPID_FIRE_QUESTIONS,
  WORD_RELAY_PROMPTS,
  WORD_DIFFERENCE,
  WORD_READ_CHALLENGES,
  WORD_SCRAMBLE_WORDS,
  AFRICA_TRIVIA,
  TANZANIA_PLACES,
  EAST_AFRICA_CULTURE,
  SWAHILI_WORDS,
  WILDLIFE_SAFARI,
  shuffleArray
} from './data';

function App() {
  // Core State
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [theme, setTheme] = useState<Theme>('dark');
  const [showSplash, setShowSplash] = useState(true);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'SETUP' | 'GAME' | 'LEADERBOARD'>('DASHBOARD');
  
  // Game State
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [dailyChallenge, setDailyChallenge] = useState<string | null>(null);
  const [lastMissionCompleted, setLastMissionCompleted] = useState<Mission | null>(null);
  
  // Session State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showStoryMode, setShowStoryMode] = useState(true);
  const [showBossBattles, setShowBossBattles] = useState(true);
  const [showTournaments, setShowTournaments] = useState(true);
  
  // Store shuffled questions in state to prevent re-shuffling on each render
  const [shuffledQuestions, setShuffledQuestions] = useState<ReturnType<typeof getShuffledQuestions> | null>(null);
  
  // Tug of War State
  const [tugPosition, setTugPosition] = useState(50);
  const [tugDirection, setTugDirection] = useState(0);
  
  // Setup State
  const [teamCount, setTeamCount] = useState(2);
  const [playerCount, setPlayerCount] = useState(4);
  const [teamNames, setTeamNames] = useState<string[]>(['Team Alpha', 'Team Beta']);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player']);

  // Constants
  const BASE_POINTS = 10;
  
  // Get total questions for current game
  const getTotalQuestions = (): number => {
    if (!activeGame) return 10;
    const shuffled = getShuffledQuestions();
    switch (activeGame) {
      case 'trivia': return shuffled.trivia.length;
      case 'emoji-guess': return shuffled.emoji.length;
      case 'would-you-rather': return shuffled.wouldYouRather.length;
      case 'brain-teasers': return shuffled.brainTeasers.length;
      case 'rapid-fire': return shuffled.rapidFire.length;
      case 'word-relay': return shuffled.wordRelay.length;
      case 'word-scramble': return shuffled.wordScramble.length;
      case 'word-difference': return shuffled.wordDifference.length;
      case 'word-read': return shuffled.wordRead.length;
      case 'africa-trivia': return shuffled.africaTrivia.length;
      case 'tanzania-places': return shuffled.tanzaniaPlaces.length;
      case 'east-africa-culture': return shuffled.eastAfricaCulture.length;
      case 'swahili-words': return shuffled.swahiliWords.length;
      case 'wildlife-safari': return shuffled.wildlifeSafari.length;
      default: return 10;
    }
  };
  
  // Word scramble words
  const WORD_SCRAMBLE_WORDS = [
    { scrambled: 'TPIZZA', answer: 'PIZZA' },
    { scrambled: 'GORCGE', answer: 'GORGE' },
    { scrambled: 'TIHGRS', answer: 'TIGERS' },
    { scrambled: 'OXRPE', answer: 'OPERA' },
    { scrambled: 'MNOOON', answer: 'MOON' },
    { scrambled: 'CIGAM', answer: 'MAGIC' },
    { scrambled: 'SRPING', answer: 'SPRING' },
    { scrambled: 'BLAZE', answer: 'BLAZE' },
    { scrambled: 'VIOLET', answer: 'VIOLET' },
    { scrambled: 'PLANET', answer: 'PLANET' },
  ];
  
  // Time limits per game - All games are freestyle (no timer)
  const getTimeLimit = (gameId: string): number => {
    const limits: Record<string, number> = {
      'trivia': 0,
      'rapid-fire': 0,
      'brain-teasers': 0,
      'emoji-guess': 0,
      'word-relay': 0,
      'would-you-rather': 0,
      'tug-of-war': 0,
      'number-crunch': 0,
      'memory-match': 0,
      'word-scramble': 0,
      'word-difference': 0,
      'word-read': 0,
      'story-mode': 0,
      'boss-battle': 0,
      'tournament': 0
    };
    return limits[gameId] || 0;
  };

  // Get current answer - using shuffled questions for consistency
  const getCurrentAnswer = (): string => {
    if (!activeGame) return '';
    const shuffled = getShuffledQuestions();
    switch (activeGame) {
      case 'trivia':
        return shuffled.trivia[currentQuestion % shuffled.trivia.length]?.answer || '';
      case 'rapid-fire':
        return shuffled.rapidFire[currentQuestion % shuffled.rapidFire.length]?.answer || '';
      case 'brain-teasers':
        return shuffled.brainTeasers[currentQuestion % shuffled.brainTeasers.length]?.answer || '';
      case 'word-scramble':
        return shuffled.wordScramble[currentQuestion % shuffled.wordScramble.length]?.answer || '';
      case 'word-difference':
        return shuffled.wordDifference[currentQuestion % shuffled.wordDifference.length]?.difference || '';
      case 'word-read':
        return shuffled.wordRead[currentQuestion % shuffled.wordRead.length]?.correctWord || '';
      case 'africa-trivia':
        return shuffled.africaTrivia[currentQuestion % shuffled.africaTrivia.length]?.answer || '';
      case 'tanzania-places':
        return shuffled.tanzaniaPlaces[currentQuestion % shuffled.tanzaniaPlaces.length]?.answer || '';
      case 'east-africa-culture':
        return shuffled.eastAfricaCulture[currentQuestion % shuffled.eastAfricaCulture.length]?.answer || '';
      case 'swahili-words':
        return shuffled.swahiliWords[currentQuestion % shuffled.swahiliWords.length]?.answer || '';
      case 'wildlife-safari':
        return shuffled.wildlifeSafari[currentQuestion % shuffled.wildlifeSafari.length]?.answer || '';
      case 'story-mode':
        const allStory = [...shuffled.trivia, ...shuffled.africaTrivia, ...shuffled.swahiliWords, ...shuffled.wildlifeSafari];
        return allStory[currentQuestion % allStory.length]?.answer || '';
      case 'boss-battle':
        const bossQs = [...shuffled.brainTeasers, ...shuffled.trivia];
        return bossQs[currentQuestion % bossQs.length]?.answer || '';
      case 'tournament':
        return shuffled.rapidFire[currentQuestion % shuffled.rapidFire.length]?.answer || '';
      default:
        return '';
    }
  };

  // Get shuffled questions - initializes once when game starts
  const getShuffledQuestions = useCallback(() => {
    if (!shuffledQuestions) {
      const shuffled = {
        trivia: shuffleArray([...TRIVIA_QUESTIONS]),
        emoji: shuffleArray([...EMOJI_PUZZLES]),
        wouldYouRather: shuffleArray([...WOULD_YOU_RATHER]),
        brainTeasers: shuffleArray([...BRAIN_TEASERS]),
        rapidFire: shuffleArray([...RAPID_FIRE_QUESTIONS]),
        wordRelay: shuffleArray([...WORD_RELAY_PROMPTS]),
        wordDifference: shuffleArray([...WORD_DIFFERENCE]),
        wordRead: shuffleArray([...WORD_READ_CHALLENGES]),
        wordScramble: shuffleArray([...WORD_SCRAMBLE_WORDS]),
        africaTrivia: shuffleArray([...AFRICA_TRIVIA]),
        tanzaniaPlaces: shuffleArray([...TANZANIA_PLACES]),
        eastAfricaCulture: shuffleArray([...EAST_AFRICA_CULTURE]),
        swahiliWords: shuffleArray([...SWAHILI_WORDS]),
        wildlifeSafari: shuffleArray([...WILDLIFE_SAFARI]),
      };
      setShuffledQuestions(shuffled);
      return shuffled;
    }
    return shuffledQuestions;
  }, [shuffledQuestions]);

  // Get current question data
  const getQuestionData = (): unknown => {
    if (!activeGame) return null;
    const shuffled = getShuffledQuestions();
    switch (activeGame) {
      case 'trivia':
        return shuffled.trivia[currentQuestion % shuffled.trivia.length];
      case 'emoji-guess':
        return shuffled.emoji[currentQuestion % shuffled.emoji.length];
      case 'would-you-rather':
        return shuffled.wouldYouRather[currentQuestion % shuffled.wouldYouRather.length];
      case 'brain-teasers':
        return shuffled.brainTeasers[currentQuestion % shuffled.brainTeasers.length];
      case 'rapid-fire':
        return shuffled.rapidFire[currentQuestion % shuffled.rapidFire.length];
      case 'word-relay':
        return shuffled.wordRelay[currentQuestion % shuffled.wordRelay.length];
      case 'word-scramble':
        return shuffled.wordScramble[currentQuestion % shuffled.wordScramble.length];
      case 'word-difference':
        return shuffled.wordDifference[currentQuestion % shuffled.wordDifference.length];
      case 'word-read':
        return shuffled.wordRead[currentQuestion % shuffled.wordRead.length];
      case 'africa-trivia':
        return shuffled.africaTrivia[currentQuestion % shuffled.africaTrivia.length];
      case 'tanzania-places':
        return shuffled.tanzaniaPlaces[currentQuestion % shuffled.tanzaniaPlaces.length];
      case 'east-africa-culture':
        return shuffled.eastAfricaCulture[currentQuestion % shuffled.eastAfricaCulture.length];
      case 'swahili-words':
        return shuffled.swahiliWords[currentQuestion % shuffled.swahiliWords.length];
      case 'wildlife-safari':
        return shuffled.wildlifeSafari[currentQuestion % shuffled.wildlifeSafari.length];
      case 'story-mode':
        // Story mode uses mixed questions from all categories - use stored shuffled version
        const allStory = [...(shuffled?.trivia || []), ...(shuffled?.africaTrivia || []), ...(shuffled?.swahiliWords || []), ...(shuffled?.wildlifeSafari || [])];
        if (allStory.length === 0) {
          return { id: 'fallback', question: 'Welcome to Story Adventure! Click any answer to start!', options: ['Start', 'Begin', 'Go', 'Play'], answer: 'Start' };
        }
        return allStory[currentQuestion % allStory.length];
      case 'boss-battle':
        // Boss battles use harder brain teasers and trivia - use stored shuffled version
        const bossQuestions = [...(shuffled?.brainTeasers || []), ...(shuffled?.trivia || [])];
        if (bossQuestions.length === 0) {
          return { riddle: 'Welcome to Boss Battle! Are you ready?', answer: 'Yes' };
        }
        return bossQuestions[currentQuestion % bossQuestions.length];
      case 'tournament':
        // Tournament uses rapid fire for fast-paced competition - use stored shuffled version
        const rapidQs = shuffled?.rapidFire || [];
        if (rapidQs.length === 0) {
          return { id: 'rf_fallback', question: 'Welcome to the Tournament! Are you ready?', answer: 'Yes' };
        }
        return rapidQs[currentQuestion % rapidQs.length];
      default:
        return null;
    }
  };

  // Calculate score with enhanced algorithm
  const calculatePoints = useCallback((correct: boolean): number => {
    if (!correct) return 0;
    
    // Base points per game type
    const gameBasePoints: Record<string, number> = {
      'trivia': 15,
      'rapid-fire': 10,
      'brain-teasers': 20,
      'emoji-guess': 25,
      'word-relay': 12,
      'would-you-rather': 10,
      'tug-of-war': 15,
      'number-crunch': 15,
      'memory-match': 20,
      'word-scramble': 18,
      'word-difference': 15,
      'word-read': 12,
      'africa-trivia': 20,
      'tanzania-places': 18,
      'east-africa-culture': 15,
      'swahili-words': 12,
      'wildlife-safari': 18
    };
    
    let points = gameBasePoints[activeGame || 'trivia'] || BASE_POINTS;
    
    // Difficulty multiplier
    const diffMultiplier = { 'EASY': 1, 'MEDIUM': 1.5, 'HARD': 2 }[difficulty];
    points *= diffMultiplier;
    
    // Combo system - exponential bonus for consecutive correct answers
    // 1st: 1x, 2nd: 1.5x, 3rd: 2x, 4th: 2.5x, 5th+: 3x
    const comboMultiplier = Math.min(1 + (streak * 0.5), 3);
    points = Math.floor(points * comboMultiplier);
    
    // Perfect round bonus - extra points for 5+ streak
    if (streak >= 5) {
      points += 25; // Bonus for maintaining streak
    }
    
    // First answer bonus (quick start)
    if (currentQuestion === 0 && correct) {
      points += 10;
    }
    
    // Late-game pressure bonus
    if (currentQuestion >= 7 && correct) {
      points += 5;
    }
    
    return points;
  }, [difficulty, activeGame, streak, currentQuestion]);

  // Get difficulty level based on game progress
  const getCurrentDifficulty = useCallback((): 'EASY' | 'MEDIUM' | 'HARD' => {
    // Progress through the game increases difficulty
    const progress = currentQuestion / getTotalQuestions();
    if (progress < 0.3) return 'EASY';
    if (progress < 0.7) return 'MEDIUM';
    return 'HARD';
  }, [currentQuestion]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Generate daily challenge
  const generateDailyChallenge = useCallback(() => {
    const challenge = DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)];
    setDailyChallenge(challenge);
  }, []);

  // Complete mission
  const completeMission = useCallback((missionId: string) => {
    setMissions(prev => prev.map(m => {
      if (m.id === missionId && !m.completed) {
        const newCurrent = m.current + 1;
        const isCompleted = newCurrent >= m.target;
        if (isCompleted) {
          setLastMissionCompleted({ ...m, current: newCurrent, completed: true });
        }
        return { ...m, current: newCurrent, completed: isCompleted };
      }
      return m;
    }));
  }, []);

  // Timer effect - DISABLED for freestyle play
  useEffect(() => {
    // Timer is disabled - all games are freestyle
    // No automatic advancing
    return;
  }, [gameStarted, activeGame, timeLeft]);

  // Tug of war animation
  useEffect(() => {
    if (activeGame !== 'tug-of-war' || !gameStarted) return;
    const interval = setInterval(() => {
      setTugPosition(prev => {
        const newPos = prev + (Math.random() - 0.5) * 5 + tugDirection * 2;
        return Math.max(0, Math.min(100, newPos));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [activeGame, gameStarted, tugDirection]);

  const handleTimeUp = () => {
    setShowResult(true);
    setStreak(0);
    // No auto-advance - user must manually click Next
    // User can see the answer and then click Next or Back
  };

  const nextQuestion = () => {
    setCurrentQuestion(prev => prev + 1);
    setTimeLeft(getTimeLimit(activeGame || 'trivia'));
    setSelectedAnswer(null);
    setShowResult(false);
    setTugPosition(50);
  };

  // Fuzzy matching algorithm for answer validation
  // Allows for minor typos and case-insensitive matching
  const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normalizedUser = normalize(userAnswer);
    const normalizedCorrect = normalize(correctAnswer);
    
    // Exact match after normalization
    if (normalizedUser === normalizedCorrect) return true;
    
    // Allow if answer contains the key part (for short answers)
    if (normalizedCorrect.length <= 4 && normalizedUser.includes(normalizedCorrect)) return true;
    
    // Levenshtein distance for fuzzy matching (allow 1 error for longer words)
    const maxDistance = Math.floor(normalizedCorrect.length * 0.2); // 20% tolerance
    const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
    return distance <= Math.max(1, maxDistance);
  };

  // Calculate Levenshtein distance between two strings
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];
    for (let i = 0; i <= str1.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str2.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= str1.length; i++) {
      for (let j = 1; j <= str2.length; j++) {
        if (str1[i-1] === str2[j-1]) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1,
            matrix[i][j-1] + 1,
            matrix[i-1][j] + 1
          );
        }
      }
    }
    return matrix[str1.length][str2.length];
  };

  const handleAnswer = (answer: string) => {
    if (showResult || !activeGame) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);
    
    // Only score if it's an actual answer, not a 'show' or 'skip' action
    if (answer !== 'show' && answer !== 'skip') {
      const correctAnswer = getCurrentAnswer();
      const isCorrect = checkAnswer(answer, correctAnswer);
      
      if (isCorrect) {
        const points = calculatePoints(true);
        const winnerId = mode === 'TEAM' 
          ? teams[0]?.id 
          : players[0]?.id;
        
        if (winnerId) {
          setScores(prev => ({ ...prev, [winnerId]: (prev[winnerId] || 0) + points }));
        }
        
        setStreak(prev => prev + 1);
        
        // Complete missions
        if (activeGame === 'trivia') completeMission('m1');
        if (activeGame === 'rapid-fire') completeMission('m7');
        if (activeGame === 'emoji-guess') completeMission('m4');
        if (activeGame === 'brain-teasers') completeMission('m6');
        if (activeGame === 'word-relay') completeMission('m5');
        if (activeGame === 'would-you-rather') completeMission('m9');
        if (activeGame === 'word-scramble') completeMission('m11');
        if (activeGame === 'word-difference') completeMission('m12');
        if (activeGame === 'word-read') completeMission('m13');
        if (activeGame === 'africa-trivia') completeMission('m16');
        if (activeGame === 'tanzania-places') completeMission('m17');
        if (activeGame === 'east-africa-culture') completeMission('m18');
        if (activeGame === 'swahili-words') completeMission('m19');
        if (activeGame === 'wildlife-safari') completeMission('m20');
        if (streak >= 4) completeMission('m10');
      } else {
        setStreak(0);
      }
    }
    
    // No auto-advance - user must manually click Next to continue
  };

  // Simple function to just show the answer without scoring
  const revealAnswer = () => {
    console.log('Revealing answer, showResult:', !showResult);
    setShowResult(true);
  };

  const startGame = (gameId: string) => {
    console.log('Starting game:', gameId);
    
    // For special modes, ensure we have a valid game id
    const validGameId = ['trivia', 'rapid-fire', 'brain-teasers', 'emoji-guess', 
      'would-you-rather', 'word-relay', 'word-scramble', 'word-difference', 'word-read',
      'africa-trivia', 'tanzania-places', 'east-africa-culture', 'swahili-words', 'wildlife-safari',
      'story-mode', 'boss-battle', 'tournament'].includes(gameId) ? gameId : 'trivia';
    
    setActiveGame(validGameId);
    setGameStarted(true);
    setCurrentQuestion(0);
    setTimeLeft(getTimeLimit(validGameId));
    setScores({});
    setSelectedAnswer(null);
    setShowResult(false);
    setStreak(0);
    setTugPosition(50);
    setView('GAME');
  };

  const endGame = () => {
    setGameStarted(false);
  };

  const backToDashboard = () => {
    setView('DASHBOARD');
    setActiveGame(null);
    setGameStarted(false);
  };

  const setupTeams = () => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
    const newTeams = teamNames.map((name, i) => ({
      id: `team-${i}`,
      name,
      score: 0,
      color: colors[i % colors.length],
      xp: 0,
      level: 1,
      wins: 0,
      streak: 0
    }));
    setTeams(newTeams);
    setMode('TEAM');
    setView('DASHBOARD');
    generateDailyChallenge();
  };

  const setupPlayers = () => {
    const avatars = ['🦊', '🐼', '🦁', '🐯', '🐨', '🐰'];
    const newPlayers = playerNames.map((name, i) => ({
      id: `player-${i}`,
      name,
      score: 0,
      xp: 0,
      level: 1,
      wins: 0,
      streak: 0,
      avatar: avatars[i % avatars.length]
    }));
    setPlayers(newPlayers);
    setMode('INDIVIDUAL');
    setView('DASHBOARD');
    generateDailyChallenge();
  };

  const playAgain = () => {
    if (activeGame) startGame(activeGame);
  };

  const resetGame = () => {
    setTeams([]);
    setPlayers([]);
    setScores({});
    setMissions(INITIAL_MISSIONS);
    setActiveGame(null);
    setMode(null);
    setView('DASHBOARD');
    setShuffledQuestions(null);
  };

  // Hide mission notification
  useEffect(() => {
    if (lastMissionCompleted) {
      const timer = setTimeout(() => setLastMissionCompleted(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [lastMissionCompleted]);

  // Save state to localStorage
  useEffect(() => {
    const state = { difficulty, theme, teams, players, missions, mode };
    localStorage.setItem('vibeteam_state', JSON.stringify(state));
  }, [difficulty, theme, teams, players, missions, mode]);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem('vibeteam_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.teams) setTeams(parsed.teams);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.missions) setMissions(parsed.missions);
        if (parsed.mode) setMode(parsed.mode);
      } catch (e) {
        console.error('Failed to load state:', e);
      }
    }
  }, []);

  // Render splash
  if (showSplash) {
    return <SplashScreen onComplete={() => { setShowSplash(false); setShowModeSelect(true); }} />;
  }
  
  // Mode Selection Screen
  if (showModeSelect) {
    return (
      <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-zinc-950' : 'bg-gradient-to-br from-indigo-100 via-white to-purple-100'}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className={`text-5xl md:text-6xl font-black mb-4 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              Choose Your <span className="text-indigo-500">Vibe</span>
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
              How do you want to play?
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* Solo Mode */}
            <motion.button
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                setMode('INDIVIDUAL');
                setView('DASHBOARD');
                setShowModeSelect(false);
              }}
              className={`p-8 rounded-3xl transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-indigo-50'} shadow-xl border-2 border-indigo-500/20`}
            >
              <User size={64} className="text-pink-500 mx-auto mb-4" />
              <h2 className={`text-3xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Solo</h2>
              <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Challenge yourself! Answer questions and climb the leaderboard.
              </p>
            </motion.button>
            
            {/* Group Mode */}
            <motion.button
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              onClick={() => {
                setMode('TEAM');
                setView('DASHBOARD');
                setShowModeSelect(false);
              }}
              className={`p-8 rounded-3xl transition-all hover:scale-105 ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-violet-50'} shadow-xl border-2 border-violet-500/20`}
            >
              <Users size={64} className="text-violet-500 mx-auto mb-4" />
              <h2 className={`text-3xl font-black mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Group</h2>
              <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Team up with friends! Compete together in challenges.
              </p>
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Render game
  if (view === 'GAME' && activeGame) {
    const questionData = getQuestionData();
    const timeLimit = getTimeLimit(activeGame);
    const gameColor = GAME_COLORS[activeGame as keyof typeof GAME_COLORS] || 'bg-indigo-500';
    
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <Header 
          onReset={resetGame}
          theme={theme}
          onToggleTheme={toggleTheme}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
        />
        
        <div className="max-w-4xl mx-auto p-6">
          {!gameStarted ? (
            <GameEndSummary 
              gameId={activeGame}
              mode={mode || 'INDIVIDUAL'}
              teams={teams}
              players={players}
              scores={scores}
              onPlayAgain={playAgain}
              onBack={backToDashboard}
            />
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={backToDashboard} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex items-center gap-3">
                  {streak > 0 && (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                      <Flame size={16} />
                      <span className="font-black text-sm">{streak}</span>
                    </div>
                  )}
                  
                  {timeLimit > 0 && (
                    <div className={`px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 ${
                      timeLeft <= 10 ? 'bg-red-500 text-white animate-pulse' : theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      <TimerIcon size={16} />
                      {timeLeft}s
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-xl font-black text-sm ${theme === 'dark' ? 'bg-zinc-800 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    Q{currentQuestion + 1}/{getTotalQuestions()}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      if (currentQuestion > 0) {
                        setCurrentQuestion(currentQuestion - 1);
                        setShowResult(false);
                        setSelectedAnswer(null);
                      }
                    }} 
                    disabled={currentQuestion === 0}
                    className={`p-3 rounded-xl ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                    title="Previous Question"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={() => {
                      setActiveGame(null);
                      setGameStarted(false);
                    }} 
                    className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800 text-red-400 hover:bg-zinc-700' : 'bg-zinc-100 text-red-500 hover:bg-zinc-200'}`}
                    title="Exit Game"
                  >
                    <X size={24} />
                  </button>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className={`p-6 rounded-[2rem] mb-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} shadow-xl border ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'}`}>
                {/* Game Title */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${gameColor} text-white`}>
                    {GAMES.find(g => g.id === activeGame)?.title || activeGame}
                  </span>
                  {mode === 'TEAM' ? <Users size={16} className="text-violet-500" /> : <User size={16} className="text-pink-500" />}
                </div>

                {/* Trivia - Flashcard Style */}
                {activeGame === 'trivia' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Brain size={24} className="text-indigo-500" />
                      <span className="text-indigo-500 font-black text-sm uppercase">Trivia Challenge</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xl hover:bg-indigo-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-indigo-500 text-white rounded-2xl font-black text-xl hover:bg-indigo-600 transition-colors w-full"
                        >
                          Next Question →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Emoji Guess - Flashcard Style */}
                {activeGame === 'emoji-guess' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <ImageIcon size={24} className="text-pink-500" />
                      <span className="text-pink-500 font-black text-sm uppercase">Emoji Puzzle</span>
                    </div>
                    <div className={`p-12 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl flex items-center justify-center`}>
                      <div className="text-8xl">{(questionData as { emojis: string }).emojis}</div>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-pink-500 text-white rounded-2xl font-black text-xl hover:bg-pink-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-pink-500/20 rounded-2xl">
                          <p className="text-pink-500 font-black text-2xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-pink-500 text-white rounded-2xl font-black text-xl hover:bg-pink-600 transition-colors w-full"
                        >
                          Next Puzzle →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Rapid Fire - Flashcard Style */}
                {activeGame === 'rapid-fire' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Zap size={24} className="text-emerald-500" />
                      <span className="text-emerald-500 font-black text-sm uppercase">Quick Question</span>
                    </div>
                    <div className={`p-12 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-4xl font-black text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl hover:bg-emerald-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-3xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xl hover:bg-emerald-600 transition-colors w-full"
                        >
                          Next Question →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Brain Teasers - Flashcard Style */}
                {activeGame === 'brain-teasers' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Sparkles size={24} className="text-amber-500" />
                      <span className="text-amber-500 font-black text-sm uppercase">Brain Teaser</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center italic ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        "{(questionData as { riddle: string }).riddle}"
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors"
                      >
                        Reveal Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-amber-500/20 rounded-2xl">
                          <p className="text-amber-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors w-full"
                        >
                          Next Riddle →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Word Difference - Flashcard style with manual controls */}
                {activeGame === 'word-difference' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Search size={24} className="text-teal-500" />
                      <span className="text-teal-500 font-black text-sm uppercase">Word Difference</span>
                    </div>
                    <div className="flex items-center justify-center gap-8 mb-6">
                      <div className={`text-4xl font-black p-6 rounded-2xl ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                        {(questionData as { word1: string }).word1}
                      </div>
                      <span className="text-2xl font-black text-zinc-400">vs</span>
                      <div className={`text-4xl font-black p-6 rounded-2xl ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-900'}`}>
                        {(questionData as { word2: string }).word2}
                      </div>
                    </div>
                    
                    {/* Manual controls */}
                    <div className="flex gap-4 justify-center flex-wrap">
                      <button 
                        onClick={() => {
                          if (currentQuestion > 0) {
                            setCurrentQuestion(currentQuestion - 1);
                            setShowResult(false);
                            setSelectedAnswer('');
                          }
                        }}
                        disabled={currentQuestion === 0}
                        className={`px-6 py-3 rounded-2xl font-black text-lg ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''} ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                      >
                        ← Back
                      </button>
                      <button 
                        onClick={revealAnswer}
                        className="px-8 py-3 bg-teal-500 text-white rounded-2xl font-black text-lg hover:bg-teal-600 transition-colors"
                      >
                        Show Answer
                      </button>
                      <button 
                        onClick={() => handleAnswer('skip')}
                        className={`px-6 py-3 rounded-2xl font-black text-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'}`}
                      >
                        Skip
                      </button>
                    </div>

                    {/* Show answer when user clicks Show Answer */}
                    {showResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-teal-500/20 rounded-2xl"
                      >
                        <p className="text-teal-500 font-black text-xl text-center">
                          {(questionData as { difference: string }).difference}
                        </p>
                        <div className="flex gap-4 justify-center mt-4">
                          <button 
                            onClick={() => {
                              setShowResult(false);
                              nextQuestion();
                            }}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-colors"
                          >
                            Next →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Word Read - Flashcard Style */}
                {activeGame === 'word-read' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Eye size={24} className="text-rose-500" />
                      <span className="text-rose-500 font-black text-sm uppercase">Read the Word</span>
                    </div>
                    
                    {!showResult ? (
                      <>
                        <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                          <p className={`text-xs font-bold uppercase tracking-widest text-center mb-6 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            Which word is spelled correctly?
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            {(questionData as { words: string[] }).words.map((word, index) => (
                              <div
                                key={index}
                                className={`p-6 rounded-2xl font-black text-2xl text-center ${theme === 'dark' ? 'bg-zinc-700 text-white' : 'bg-zinc-100 text-zinc-900'}`}
                              >
                                {word}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={revealAnswer}
                          className="px-12 py-4 bg-rose-500 text-white rounded-2xl font-black text-xl hover:bg-rose-600 transition-colors w-full"
                        >
                          Show Answer
                        </button>
                      </>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}
                      >
                        <p className={`text-xs font-bold uppercase tracking-widest text-center mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          The correct spelling is:
                        </p>
                        <h2 className="text-5xl font-black text-center text-rose-500">
                          {(questionData as { correctWord: string }).correctWord}
                        </h2>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="mt-6 px-12 py-4 bg-rose-500 text-white rounded-2xl font-black text-xl hover:bg-rose-600 transition-colors w-full"
                        >
                          Next Word →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Africa Trivia - Flashcard Style */}
                {activeGame === 'africa-trivia' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Globe size={24} className="text-amber-500" />
                      <span className="text-amber-500 font-black text-sm uppercase">Africa Trivia</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors w-full"
                        >
                          Next Question →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Tanzania Places - Flashcard Style */}
                {activeGame === 'tanzania-places' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <MapPin size={24} className="text-red-500" />
                      <span className="text-red-500 font-black text-sm uppercase">Tanzania Places</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-colors w-full"
                        >
                          Next Place →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* East Africa Culture - Flashcard Style */}
                {activeGame === 'east-africa-culture' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Music size={24} className="text-purple-500" />
                      <span className="text-purple-500 font-black text-sm uppercase">East Africa Culture</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-purple-500 text-white rounded-2xl font-black text-xl hover:bg-purple-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-purple-500 text-white rounded-2xl font-black text-xl hover:bg-purple-600 transition-colors w-full"
                        >
                          Next Question →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Swahili Words - Flashcard Style */}
                {activeGame === 'swahili-words' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <BookOpen size={24} className="text-cyan-500" />
                      <span className="text-cyan-500 font-black text-sm uppercase">Swahili Words</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-cyan-500 text-white rounded-2xl font-black text-xl hover:bg-cyan-600 transition-colors"
                      >
                        Show Meaning
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-cyan-500 text-white rounded-2xl font-black text-xl hover:bg-cyan-600 transition-colors w-full"
                        >
                          Next Word →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Wildlife Safari - Flashcard Style */}
                {activeGame === 'wildlife-safari' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Palmtree size={24} className="text-lime-500" />
                      <span className="text-lime-500 font-black text-sm uppercase">Wildlife Safari</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={revealAnswer}
                        className="px-12 py-4 bg-lime-500 text-white rounded-2xl font-black text-xl hover:bg-lime-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as { answer: string }).answer}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-lime-500 text-white rounded-2xl font-black text-xl hover:bg-lime-600 transition-colors w-full"
                        >
                          Next Animal →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Story Adventure - Flashcard Style */}
                {activeGame === 'story-mode' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <BookOpen size={24} className="text-amber-500" />
                      <span className="text-amber-500 font-black text-sm uppercase">Story Adventure</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {String((questionData as any)?.question || (questionData as any)?.riddle || 'Loading...')}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={() => {
                          setShowResult(true);
                        }}
                        className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            THE ANSWER IS: {(questionData as any)?.answer || (questionData as any)?.riddle || 'N/A'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors w-full"
                        >
                          Next Chapter →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Boss Battle - Flashcard Style */}
                {activeGame === 'boss-battle' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Sword size={24} className="text-red-500" />
                      <span className="text-red-500 font-black text-sm uppercase">Boss Battle</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { riddle?: string, question?: string }).riddle || (questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={() => setShowResult(true)}
                        className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as any)?.answer || (questionData as any)?.riddle || 'Answer'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-red-500 text-white rounded-2xl font-black text-xl hover:bg-red-600 transition-colors w-full"
                        >
                          Attack Again! →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Tournament - Flashcard Style */}
                {activeGame === 'tournament' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Trophy size={24} className="text-violet-500" />
                      <span className="text-violet-500 font-black text-sm uppercase">Tournament</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { question: string }).question}
                      </h2>
                    </div>
                    
                    {!showResult ? (
                      <button 
                        onClick={() => setShowResult(true)}
                        className="px-12 py-4 bg-violet-500 text-white rounded-2xl font-black text-xl hover:bg-violet-600 transition-colors"
                      >
                        Show Answer
                      </button>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-6 bg-emerald-500/20 rounded-2xl">
                          <p className="text-emerald-500 font-black text-xl text-center">
                            {(questionData as any)?.answer || (questionData as any)?.riddle || 'Answer'}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowResult(false);
                            nextQuestion();
                          }}
                          className="px-12 py-4 bg-violet-500 text-white rounded-2xl font-black text-xl hover:bg-violet-600 transition-colors w-full"
                        >
                          Next Round →
                        </button>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Would You Rather - Flashcard Style */}
                {activeGame === 'would-you-rather' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <MessageSquare size={24} className="text-violet-500" />
                      <span className="text-violet-500 font-black text-sm uppercase">Would You Rather</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-2xl font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        Would you rather...
                      </h2>
                      <div className="mt-6 space-y-4">
                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-700' : 'bg-violet-100'}`}>
                          <p className={`text-lg font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            {(questionData as { optionA: string }).optionA}
                          </p>
                        </div>
                        <div className="text-center text-violet-500 font-black text-xl">VS</div>
                        <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-zinc-700' : 'bg-violet-100'}`}>
                          <p className={`text-lg font-bold text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            {(questionData as { optionB: string }).optionB}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowResult(false);
                        nextQuestion();
                      }}
                      className="px-12 py-4 bg-violet-500 text-white rounded-2xl font-black text-xl hover:bg-violet-600 transition-colors w-full"
                    >
                      Next Scenario →
                    </button>
                  </>
                )}

                {/* Tug of War - Interactive Display */}
                {activeGame === 'tug-of-war' && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Users size={24} className="text-red-500" />
                      <span className="text-red-500 font-black text-sm uppercase">Tug of War</span>
                    </div>
                    <div className={`p-8 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <h2 className={`text-xl font-bold text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        Pull the rope to your side!
                      </h2>
                      <div className="relative h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full mb-6">
                        <motion.div 
                          animate={{ x: `${tugPosition - 50}%` }}
                          className="absolute top-1/2 left-1/2 w-24 h-24 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
                        >
                          <Users size={36} className="text-white" />
                        </motion.div>
                      </div>
                      <div className="flex justify-center gap-4">
                        <button onClick={() => setTugDirection(-1)} className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black text-lg hover:bg-red-600 transition-colors">
                          ⬅️ PULL!
                        </button>
                        <button onClick={() => setTugDirection(1)} className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black text-lg hover:bg-blue-600 transition-colors">
                          PULL! ➡️
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Word Relay - Flashcard Style */}
                {activeGame === 'word-relay' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <PenTool size={24} className="text-cyan-500" />
                      <span className="text-cyan-500 font-black text-sm uppercase">Word Relay</span>
                    </div>
                    <div className={`p-12 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <p className={`text-xs font-bold uppercase tracking-widest text-center mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Build a chain with related words
                      </p>
                      <h2 className={`text-5xl font-black text-center ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {String(questionData)}
                      </h2>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowResult(false);
                        nextQuestion();
                      }}
                      className="px-12 py-4 bg-cyan-500 text-white rounded-2xl font-black text-xl hover:bg-cyan-600 transition-colors w-full"
                    >
                      Next Word →
                    </button>
                  </>
                )}

                {/* Word Scramble - Flashcard Style */}
                {activeGame === 'word-scramble' && questionData && (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Shuffle size={24} className="text-amber-500" />
                      <span className="text-amber-500 font-black text-sm uppercase">Word Scramble</span>
                    </div>
                    <div className={`p-12 rounded-3xl mb-6 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-white'} shadow-xl`}>
                      <p className={`text-xs font-bold uppercase tracking-widest text-center mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Unscramble the word
                      </p>
                      <h2 className={`text-5xl font-black text-center mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        {(questionData as { scrambled: string }).scrambled}
                      </h2>
                      
                      {!showResult ? (
                        <button 
                          onClick={revealAnswer}
                          className="px-8 py-3 bg-amber-500 text-white rounded-2xl font-black text-lg hover:bg-amber-600 transition-colors w-full"
                        >
                          Reveal Answer
                        </button>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 bg-amber-500/20 rounded-xl">
                            <p className="text-amber-500 font-black text-3xl text-center">
                              {(questionData as { answer: string }).answer}
                            </p>
                            {(questionData as { hint?: string }).hint && (
                              <p className={`text-sm text-center mt-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                💡 {(questionData as { hint: string }).hint}
                              </p>
                            )}
                          </div>
                          <button 
                            onClick={() => {
                              setShowResult(false);
                              nextQuestion();
                            }}
                            className="px-12 py-4 bg-amber-500 text-white rounded-2xl font-black text-xl hover:bg-amber-600 transition-colors w-full"
                          >
                            Next Word →
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Score Display */}
              <div className={`flex items-center justify-center gap-8 p-6 rounded-2xl ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'}`}>
                {mode === 'TEAM' ? teams.map(team => (
                  <div key={team.id} className="text-center">
                    <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{team.name}</p>
                    <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{scores[team.id] || 0}</p>
                  </div>
                )) : players.map(player => (
                  <div key={player.id} className="text-center">
                    <p className={`text-sm font-bold mb-1 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{player.name}</p>
                    <p className={`text-3xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{scores[player.id] || 0}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        <AnimatePresence>
          {lastMissionCompleted && (
            <FloatingText 
              text={`${lastMissionCompleted.title} Complete! +${lastMissionCompleted.reward}`}
              onComplete={() => {}}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Render setup
  if (view === 'SETUP') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
        <Header 
          onReset={resetGame}
          theme={theme}
          onToggleTheme={toggleTheme}
          difficulty={difficulty}
          onChangeDifficulty={setDifficulty}
        />
        
        <div className="max-w-2xl mx-auto p-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 rounded-[2rem] ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} shadow-xl border ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-100'}`}
          >
            <button onClick={() => setView('DASHBOARD')} className={`flex items-center gap-2 mb-6 font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <ChevronLeft size={20} /> Back
            </button>
            
            <h2 className={`text-3xl font-black mb-8 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
              {mode === 'TEAM' ? 'Setup Teams' : 'Setup Players'}
            </h2>
            
            <div className="space-y-6">
              {mode === 'TEAM' ? (
                <>
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Number of Teams</label>
                    <div className="flex gap-2">
                      {[2, 3, 4].map(num => (
                        <button
                          key={num}
                          onClick={() => { setTeamCount(num); setTeamNames(Array(num).fill(0).map((_, i) => `Team ${String.fromCharCode(65 + i)}`)); }}
                          className={`px-6 py-3 rounded-xl font-bold ${teamCount === num ? 'bg-indigo-600 text-white' : theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-600'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className={`block text-sm font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Team Names</label>
                    {teamNames.map((name, i) => (
                      <input
                        key={i}
                        type="text"
                        value={name}
                        onChange={(e) => { const newNames = [...teamNames]; newNames[i] = e.target.value; setTeamNames(newNames); }}
                        className={`w-full p-4 rounded-xl font-bold ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-100 text-zinc-900 border-zinc-200'} border-2 focus:outline-none`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Solo/Individual Mode - Single Player Name */}
                  <div className="space-y-3">
                    <label className={`block text-sm font-bold ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Your Name</label>
                    <input
                      type="text"
                      value={playerNames[0] || ''}
                      onChange={(e) => setPlayerNames([e.target.value])}
                      placeholder="Enter your name"
                      className={`w-full p-4 rounded-xl font-bold ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-100 text-zinc-900 border-zinc-200'} border-2 focus:outline-none`}
                    />
                  </div>
                </>
              )}
              <button onClick={mode === 'TEAM' ? setupTeams : setupPlayers} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xl">
                Start Game
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Render dashboard
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'}`}>
      <LiveTicker theme={theme} />
      <Header 
        onReset={resetGame}
        theme={theme}
        onToggleTheme={toggleTheme}
        difficulty={difficulty}
        onChangeDifficulty={setDifficulty}
      />
      
      <main className="max-w-6xl mx-auto p-6">
        {/* Mode Selection */}
        {!mode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className={`text-xs font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Select Mode</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => { setMode('TEAM'); setView('SETUP'); }}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-indigo-500' : 'bg-white border-zinc-100 hover:border-indigo-500'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
                    <Users size={28} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Team Mode</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Compete in teams</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setMode('INDIVIDUAL'); setView('SETUP'); }}
                className={`p-6 rounded-2xl border-2 transition-all text-left ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-indigo-500' : 'bg-white border-zinc-100 hover:border-indigo-500'}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center text-pink-600">
                    <User size={28} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Individual</h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>Solo challenge</p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Current Setup */}
        {mode && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>
                {mode === 'TEAM' ? 'Teams' : 'Players'} Setup
              </h2>
              <button onClick={() => { setMode(null); setTeams([]); setPlayers([]); }} className="text-xs font-bold text-indigo-500">Change Mode</button>
            </div>
            <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {mode === 'TEAM' ? <Users className="text-indigo-500" size={24} /> : <User className="text-pink-500" size={24} />}
                  <div>
                    <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {mode === 'TEAM' ? teams.map(t => t.name).join(' vs ') : players.map(p => p.name).join(', ')}
                    </p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      {mode === 'TEAM' ? `${teams.length} Teams` : `${players.length} Players`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setView('SETUP')} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl">
                  <RotateCcw size={20} className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Daily Challenge */}
        {dailyChallenge && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <h2 className={`text-xs font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Daily Challenge</h2>
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              <div className="flex items-center gap-3">
                <Zap size={24} className="text-amber-500" />
                <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{dailyChallenge}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Access - Special Modes */}
        <div className="mb-12">
          <h2 className={`text-xs font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Special Modes - Click to Play!</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Story Adventure */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => startGame('story-mode')}
              className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-br from-amber-900/30 to-zinc-900 border-amber-500/30 hover:border-amber-500' : 'bg-gradient-to-br from-amber-50 to-white border-amber-200 hover:border-amber-500'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">📖</span>
                <div>
                  <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-amber-400' : 'text-amber-600'}`}>Story Adventure</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{STORY_CHAPTERS.length} Chapters</p>
                </div>
              </div>
              <div className={`mt-3 px-3 py-1.5 rounded-lg text-center text-sm font-bold ${theme === 'dark' ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white'}`}>PLAY NOW</div>
            </motion.button>

            {/* Boss Battles */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => startGame('boss-battle')}
              className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-br from-red-900/30 to-zinc-900 border-red-500/30 hover:border-red-500' : 'bg-gradient-to-br from-red-50 to-white border-red-200 hover:border-red-500'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">⚔️</span>
                <div>
                  <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>Boss Battles</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{BOSS_BATTLES.length} Bosses</p>
                </div>
              </div>
              <div className={`mt-3 px-3 py-1.5 rounded-lg text-center text-sm font-bold ${theme === 'dark' ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>FIGHT NOW</div>
            </motion.button>

            {/* Tournaments */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => startGame('tournament')}
              className={`p-6 rounded-2xl border-2 transition-all text-left hover:scale-105 ${theme === 'dark' ? 'bg-gradient-to-br from-violet-900/30 to-zinc-900 border-violet-500/30 hover:border-violet-500' : 'bg-gradient-to-br from-violet-50 to-white border-violet-200 hover:border-violet-500'}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏆</span>
                <div>
                  <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-violet-400' : 'text-violet-600'}`}>Tournaments</h3>
                  <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{TOURNAMENTS.length} Active</p>
                </div>
              </div>
              <div className={`mt-3 px-3 py-1.5 rounded-lg text-center text-sm font-bold ${theme === 'dark' ? 'bg-violet-600 text-white' : 'bg-violet-500 text-white'}`}>JOIN NOW</div>
            </motion.button>
          </div>
        </div>

        {/* Games */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Choose a Game</h2>
            <button onClick={() => setShowLeaderboard(!showLeaderboard)} className={`text-xs font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} hover:text-indigo-500`}>
              <Trophy size={16} /> Leaderboard
            </button>
          </div>
          
          <AnimatePresence>
            {showLeaderboard && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
                <Leaderboard theme={theme} onClose={() => setShowLeaderboard(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {GAMES.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => startGame(game.id)}
                index={index}
                theme={theme}
                isPopular={game.id === 'trivia' || game.id === 'rapid-fire'}
                isNew={game.id === 'memory-match' || game.id === 'word-scramble' || game.id === 'word-difference' || game.id === 'word-read'}
              />
            ))}
          </div>
        </div>

        {/* Story Adventure Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Story Adventure</h2>
            <button onClick={() => setShowStoryMode(!showStoryMode)} className={`text-xs font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} hover:text-amber-500`}>
              <BookOpen size={16} /> {showStoryMode ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showStoryMode && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {STORY_CHAPTERS.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    chapter.isUnlocked 
                      ? theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-amber-500' : 'bg-white border-zinc-100 hover:border-amber-500'
                      : 'opacity-50 cursor-not-allowed'
                  } border`}
                  onClick={() => chapter.isUnlocked && startGame('story-mode')}
                >
                  <div className="text-4xl mb-3">{chapter.title.split(' ')[0]}</div>
                  <h3 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{chapter.title.split(' ').slice(1).join(' ')}</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{chapter.description}</p>
                  {chapter.isCompleted && (
                    <div className="mt-3 px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full">Completed</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Boss Battles Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Boss Battles</h2>
            <button onClick={() => setShowBossBattles(!showBossBattles)} className={`text-xs font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} hover:text-red-500`}>
              <Sword size={16} /> {showBossBattles ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showBossBattles && (
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
              {BOSS_BATTLES.map((boss, index) => (
                <motion.div
                  key={boss.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl text-center cursor-pointer transition-all ${
                    !boss.isDefeated
                      ? theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-red-500' : 'bg-white border-zinc-100 hover:border-red-500'
                      : 'bg-emerald-500/20 border-emerald-500/50'
                  } border`}
                  onClick={() => !boss.isDefeated && startGame('boss-battle')}
                >
                  <div className="text-5xl mb-3">{boss.avatar}</div>
                  <h3 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{boss.name}</h3>
                  <p className={`text-xs mb-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{boss.difficulty}</p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>{boss.description}</p>
                  {boss.isDefeated && (
                    <div className="mt-3 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">Defeated!</div>
                  )}
                  {!boss.isDefeated && (
                    <div className="mt-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">Challenge!</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tournaments Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Tournaments</h2>
            <button onClick={() => setShowTournaments(!showTournaments)} className={`text-xs font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'} hover:text-violet-500`}>
              <Trophy size={16} /> {showTournaments ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showTournaments && (
            <div className="grid md:grid-cols-3 gap-4">
              {TOURNAMENTS.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${
                    theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'
                  } border`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Trophy size={20} className="text-violet-500" />
                    <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{tournament.name}</h3>
                  </div>
                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{tournament.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tournament.games.map(gameId => (
                      <span key={gameId} className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                        {GAMES.find(g => g.id === gameId)?.title || gameId}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      <span className="font-bold text-violet-500">{tournament.currentParticipants}</span>/{tournament.maxParticipants} players
                    </div>
                    <button 
                      className={`px-4 py-2 rounded-xl font-bold text-sm ${
                        tournament.status === 'REGISTRATION'
                          ? 'bg-violet-500 text-white hover:bg-violet-600'
                          : theme === 'dark' ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                      }`}
                      disabled={tournament.status !== 'REGISTRATION'}
                    >
                      {tournament.status === 'REGISTRATION' ? 'Join' : tournament.status}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Missions */}
        <div className="mb-12">
          <h2 className={`text-xs font-black uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Your Missions</h2>
          <MissionProgress missions={missions} theme={theme} />
        </div>

        {/* Boosters */}
        <div>
          <h2 className={`text-xs font-black uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Vibe Boosters</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {VIBE_BOOSTERS.map((booster, index) => (
              <motion.div
                key={booster.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-2xl text-center ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100'} border`}
              >
                <div className="text-3xl mb-2">{booster.icon}</div>
                <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{booster.name}</p>
                <p className={`text-xs ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>{booster.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {lastMissionCompleted && (
          <FloatingText text={`${lastMissionCompleted.title} Complete! +${lastMissionCompleted.reward}`} onComplete={() => {}} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
