import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  completeChapter as completeChapterEngine,
  createEmptyProgress,
  registerAnswer,
  saveCheckpoint,
  touchStreak,
  type AnswerRecord,
  type ChapterOutcome,
  type RunStats,
} from '@/engine/progress';
import { heroLevelInfo, type HeroLevelInfo } from '@/engine/xp';
import { loadProgress, resetProgress, saveProgress } from '@/services/storage';
import type { CEFRLevel, Chapter, Progress } from '@/types';
import { useAuth } from './AuthContext';

interface GameContextValue {
  progress: Progress;
  hero: HeroLevelInfo;
  /** Logros recién desbloqueados pendientes de mostrar como aviso. */
  pendingAchievements: string[];
  dismissAchievement: (id: string) => void;
  chooseLevel: (level: CEFRLevel) => void;
  forceUnlock: (level: CEFRLevel) => void;
  commitAnswer: (run: RunStats, record: AnswerRecord) => RunStats;
  checkpoint: (chapterId: string, nodeIndex: number) => void;
  finishChapter: (chapter: Chapter, run: RunStats) => ChapterOutcome;
  resetAll: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(createEmptyProgress);
  const [pendingAchievements, setPendingAchievements] = useState<string[]>([]);
  // Espejo síncrono del progreso: las acciones encadenadas dentro de un mismo
  // render no pueden esperar al re-render para leer el valor actualizado.
  const latest = useRef(progress);

  const apply = useCallback(
    (next: Progress) => {
      latest.current = next;
      setProgress(next);
      if (user) saveProgress(user.id, next);
    },
    [user],
  );

  useEffect(() => {
    if (!user) {
      const empty = createEmptyProgress();
      latest.current = empty;
      setProgress(empty);
      return;
    }
    const loaded = touchStreak(loadProgress(user.id));
    latest.current = loaded;
    setProgress(loaded);
    saveProgress(user.id, loaded);
  }, [user]);

  const chooseLevel = useCallback(
    (level: CEFRLevel) => apply({ ...latest.current, currentLevel: level }),
    [apply],
  );

  const forceUnlock = useCallback(
    (level: CEFRLevel) => {
      const current = latest.current;
      if (current.overrideUnlocked.includes(level)) return;
      apply({ ...current, overrideUnlocked: [...current.overrideUnlocked, level] });
    },
    [apply],
  );

  const commitAnswer = useCallback(
    (run: RunStats, record: AnswerRecord): RunStats => {
      const result = registerAnswer(latest.current, run, record);
      apply(result.progress);
      return result.run;
    },
    [apply],
  );

  const checkpoint = useCallback(
    (chapterId: string, nodeIndex: number) => apply(saveCheckpoint(latest.current, chapterId, nodeIndex)),
    [apply],
  );

  const finishChapter = useCallback(
    (chapter: Chapter, run: RunStats): ChapterOutcome => {
      const outcome = completeChapterEngine(latest.current, chapter, run);
      apply(outcome.progress);
      if (outcome.newAchievements.length) {
        setPendingAchievements((queue) => [...queue, ...outcome.newAchievements]);
      }
      return outcome;
    },
    [apply],
  );

  const dismissAchievement = useCallback((id: string) => {
    setPendingAchievements((queue) => queue.filter((item) => item !== id));
  }, []);

  const resetAll = useCallback(() => {
    if (user) resetProgress(user.id);
    const empty = createEmptyProgress();
    latest.current = empty;
    setProgress(empty);
    setPendingAchievements([]);
  }, [user]);

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      hero: heroLevelInfo(progress.xp),
      pendingAchievements,
      dismissAchievement,
      chooseLevel,
      forceUnlock,
      commitAnswer,
      checkpoint,
      finishChapter,
      resetAll,
    }),
    [
      progress,
      pendingAchievements,
      dismissAchievement,
      chooseLevel,
      forceUnlock,
      commitAnswer,
      checkpoint,
      finishChapter,
      resetAll,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de <GameProvider>');
  return context;
}
