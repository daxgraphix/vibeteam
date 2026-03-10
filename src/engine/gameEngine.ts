import { Difficulty, GameMode, Team, Player, Mission } from '../types';

// ============================================
// SCORING ALGORITHMS
// ============================================

/**
 * Calculate score based on multiple factors
 * @param basePoints - Base points for correct answer
 * @param timeLeft - Time remaining when answered
 * @param difficulty - Game difficulty level
 * @param streak - Current streak count
 * @param booster - Active booster multiplier
 * @returns Final calculated score
 */
export function calculateScore(
  basePoints: number,
  timeLeft: number,
  difficulty: Difficulty,
  streak: number = 0,
  booster: number = 1
): number {
  // Time bonus: More points for faster answers
  const timeBonus = Math.floor(timeLeft * 0.5);
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    'EASY': 1,
    'MEDIUM': 1.5,
    'HARD': 2
  }[difficulty];
  
  // Streak bonus: Exponential bonus for consecutive correct answers
  const streakBonus = streak > 0 ? Math.min(1 + (streak * 0.1), 3) : 1;
  
  // Calculate final score
  const score = Math.floor(
    (basePoints + timeBonus) * 
    difficultyMultiplier * 
    streakBonus * 
    booster
  );
  
  return score;
}

/**
 * Calculate XP earned from a game
 * @param score - Game score
 * @param accuracy - Percentage of correct answers
 * @param difficulty - Game difficulty
 * @returns XP to be awarded
 */
export function calculateXP(
  score: number,
  accuracy: number,
  difficulty: Difficulty
): number {
  const baseXP = Math.floor(score / 10);
  const accuracyBonus = Math.floor(accuracy * 0.5);
  const difficultyBonus = difficulty === 'HARD' ? 1.5 : difficulty === 'MEDIUM' ? 1.2 : 1;
  
  return Math.floor((baseXP + accuracyBonus) * difficultyBonus);
}

/**
 * Calculate level from total XP
 * @param totalXP - Total accumulated XP
 * @returns Current level
 */
export function calculateLevel(totalXP: number): number {
  // Each level requires progressively more XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
  let level = 1;
  let xpRequired = 0;
  
  while (totalXP >= xpRequired) {
    level++;
    xpRequired += level * 100;
  }
  
  return level - 1;
}

/**
 * Calculate XP needed for next level
 * @param currentLevel - Current player level
 * @ to reach next levelreturns XP required
 */
export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

// ============================================
// DIFFICULTY SCALING
// ============================================

/**
 * Get time limit based on difficulty
 * @param gameType - Type of game
 * @param difficulty - Difficulty level
 * @returns Time limit in seconds
 */
export function getTimeLimit(gameType: string, difficulty: Difficulty): number {
  const baseTimes: Record<string, number> = {
    'trivia': 30,
    'rapid-fire': 60,
    'brain-teasers': 45,
    'emoji-guess': 30,
    'word-relay': 20,
    'number-crunch': 45,
  };
  
  const baseTime = baseTimes[gameType] || 30;
  
  // Adjust for difficulty
  const multipliers = {
    'EASY': 1.5,
    'MEDIUM': 1,
    'HARD': 0.7
  };
  
  return Math.floor(baseTime * multipliers[difficulty]);
}

/**
 * Get question difficulty based on game difficulty
 * @param difficulty - Overall game difficulty
 * @returns Difficulty level for questions
 */
export function getQuestionDifficulty(difficulty: Difficulty): 'easy' | 'medium' | 'hard' {
  const mapping: Record<Difficulty, 'easy' | 'medium' | 'hard'> = {
    'EASY': 'easy',
    'MEDIUM': 'medium',
    'HARD': 'hard'
  };
  return mapping[difficulty];
}

// ============================================
// WIN/LOSE CONDITIONS
// ============================================

/**
 * Determine game winner
 * @param teams - Array of teams
 * @param players - Array of players
 * @param scores - Score record
 * @param mode - Game mode
 * @returns Winner ID or null for tie
 */
export function determineWinner(
  teams: Team[],
  players: Player[],
  scores: Record<string, number>,
  mode: GameMode
): string | null {
  const entities = mode === 'TEAM' ? teams : players;
  
  if (entities.length === 0) return null;
  
  let maxScore = -1;
  let winners: string[] = [];
  
  entities.forEach(entity => {
    const score = scores[entity.id] || 0;
    if (score > maxScore) {
      maxScore = score;
      winners = [entity.id];
    } else if (score === maxScore) {
      winners.push(entity.id);
    }
  });
  
  // Return null if tie
  return winners.length === 1 ? winners[0] : null;
}

/**
 * Check if minimum participation threshold is met
 * @param scores - Score record
 * @param minimumAnswers - Minimum correct answers required
 * @returns Boolean indicating if game is valid
 */
export function isGameValid(
  scores: Record<string, number>,
  minimumAnswers: number = 1
): boolean {
  const totalAnswers = Object.values(scores).reduce((a, b) => a + b, 0);
  return totalAnswers >= minimumAnswers;
}

/**
 * Calculate accuracy percentage
 * @param correct - Number of correct answers
 * @param total - Total number of questions
 * @returns Accuracy as percentage (0-100)
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

// ============================================
// MISSION TRACKING
// ============================================

/**
 * Check and update mission progress
 * @param missions - Current missions
 * @param gameType - Type of game played
 * @param score - Points earned in game
 * @param isCorrect - Whether answer was correct
 * @returns Updated missions
 */
export function updateMissionProgress(
  missions: Mission[],
  gameType: string,
  score: number,
  isCorrect: boolean
): Mission[] {
  return missions.map(mission => {
    if (mission.completed) return mission;
    
    let shouldUpdate = false;
    
    switch (mission.id) {
      case 'm1': // Trivia Master
        shouldUpdate = gameType === 'trivia' && isCorrect;
        break;
      case 'm2': // Speed Demon
        shouldUpdate = gameType === 'rapid-fire' && isCorrect;
        break;
      case 'm4': // Emoji Expert
        shouldUpdate = gameType === 'emoji-guess' && isCorrect;
        break;
      case 'm5': // Word Wizard
        shouldUpdate = gameType === 'word-relay' && isCorrect;
        break;
      case 'm6': // Brainiac
        shouldUpdate = gameType === 'brain-teasers' && isCorrect;
        break;
      case 'm7': // Rapid Fire King
        shouldUpdate = gameType === 'rapid-fire';
        break;
      case 'm9': // Would You Rather
        shouldUpdate = gameType === 'would-you-rather';
        break;
    }
    
    if (shouldUpdate) {
      const newCurrent = mission.current + 1;
      const isCompleted = newCurrent >= mission.target;
      
      return {
        ...mission,
        current: newCurrent,
        completed: isCompleted
      };
    }
    
    return mission;
  });
}

/**
 * Get total reward from completed missions
 * @param missions - Array of missions
 * @returns Total XP reward
 */
export function calculateMissionRewards(missions: Mission[]): number {
  return missions
    .filter(m => m.completed)
    .reduce((total, m) => total + m.reward, 0);
}

// ============================================
// GAME SESSION MANAGEMENT
// ============================================

/**
 * Initialize a new game session
 * @param gameId - ID of the game
 * @param mode - Game mode (TEAM or INDIVIDUAL)
 * @returns Initial session state
 */
export function createGameSession(gameId: string, mode: GameMode) {
  return {
    gameId,
    mode,
    startTime: new Date(),
    endTime: null,
    score: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    questionsAnswered: 0,
    totalTime: 0,
    boostersUsed: [] as string[],
    isActive: true
  };
}

/**
 * Process an answer and update session
 * @param session - Current game session
 * @param isCorrect - Whether answer was correct
 * @param timeSpent - Time spent on answer
 * @param score - Score earned
 * @returns Updated session
 */
export function processAnswer(
  session: GameSession,
  isCorrect: boolean,
  timeSpent: number,
  score: number
): GameSession {
  return {
    ...session,
    score: session.score + score,
    correct: session.correct + (isCorrect ? 1 : 0),
    wrong: session.wrong + (isCorrect ? 0 : 1),
    streak: isCorrect ? session.streak + 1 : 0,
    maxStreak: isCorrect ? Math.max(session.maxStreak, session.streak + 1) : session.maxStreak,
    questionsAnswered: session.questionsAnswered + 1,
    totalTime: session.totalTime + timeSpent
  };
}

/**
 * End a game session
 * @param session - Current game session
 * @returns Finalized session
 */
export function endGameSession(session: GameSession): GameSession {
  return {
    ...session,
    endTime: new Date(),
    isActive: false
  };
}

/**
 * Get game session statistics
 * @param session - Completed game session
 * @returns Statistics object
 */
export function getSessionStats(session: GameSession) {
  const duration = session.endTime 
    ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000
    : 0;
    
  return {
    duration: Math.round(duration),
    accuracy: calculateAccuracy(session.correct, session.questionsAnswered),
    avgTimePerQuestion: session.questionsAnswered > 0 
      ? Math.round(session.totalTime / session.questionsAnswered) 
      : 0,
    pointsPerQuestion: session.questionsAnswered > 0 
      ? Math.round(session.score / session.questionsAnswered) 
      : 0,
    maxStreak: session.maxStreak
  };
}

// ============================================
// LEADERBOARD ALGORITHMS
// ============================================

/**
 * Sort entities by score
 * @param teams - Array of teams
 * @param players - Array of players
 * @param scores - Score record
 * @param mode - Game mode
 * @returns Sorted array of {id, name, score}
 */
export function getRankedList(
  teams: Team[],
  players: Player[],
  scores: Record<string, number>,
  mode: GameMode
): Array<{ id: string; name: string; score: number }> {
  const entities = mode === 'TEAM' ? teams : players;
  
  return entities
    .map(entity => ({
      id: entity.id,
      name: entity.name,
      score: scores[entity.id] || 0
    }))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate rank change
 * @param currentRank - Current position
 * @param previousRank - Previous position
 * @returns Rank change (positive = improvement)
 */
export function calculateRankChange(currentRank: number, previousRank: number): number {
  return previousRank - currentRank;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns Shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random items from array
 * @param array - Source array
 * @param count - Number of items to get
 * @returns Random selection
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

/**
 * Format time in seconds to readable string
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

/**
 * Generate unique ID
 * @returns Unique identifier
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface GameSession {
  gameId: string;
  mode: GameMode;
  startTime: Date;
  endTime: Date | null;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
  maxStreak: number;
  questionsAnswered: number;
  totalTime: number;
  boostersUsed: string[];
  isActive: boolean;
}

export interface GameStats {
  duration: number;
  accuracy: number;
  avgTimePerQuestion: number;
  pointsPerQuestion: number;
  maxStreak: number;
}
