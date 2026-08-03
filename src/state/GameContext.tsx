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
import { heroLevelFor, heroLevelInfo, heroTitle, type HeroLevelInfo } from '@/engine/xp';
import { loadProgress, resetProgress, saveProgress } from '@/services/storage';
import type { CEFRLevel, Chapter, Progress } from '@/types';
import { useAuth } from './AuthContext';

/** Ascenso de rango pendiente de celebrar. */
export interface LevelUpEvent {
  level: number;
  title: string;
  /** Identificador de la subida: reinicia las animaciones aunque se repita el nivel. */
  id: number;
}

interface GameContextValue {
  progress: Progress;
  hero: HeroLevelInfo;
  /** Logros recién desbloqueados pendientes de mostrar como aviso. */
  pendingAchievements: string[];
  dismissAchievement: (id: string) => void;
  /** Subida de nivel recién ocurrida, o null si no hay nada que celebrar. */
  levelUp: LevelUpEvent | null;
  dismissLevelUp: () => void;
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
  const [levelUp, setLevelUp] = useState<LevelUpEvent | null>(null);
  const levelUpSeq = useRef(0);
  // Espejo síncrono del progreso: las acciones encadenadas dentro de un mismo
  // render no pueden esperar al re-render para leer el valor actualizado.
  const latest = useRef(progress);

  // Toda la XP pasa por aquí, así que es el único sitio donde hace falta vigilar
  // la subida de nivel: da igual si llega por un nodo suelto, por los objetivos
  // del capítulo o por un logro. Cargar la partida guardada no pasa por `apply`,
  // de modo que entrar en la app nunca dispara una celebración falsa.
  const apply = useCallback(
    (next: Progress) => {
      const before = heroLevelFor(latest.current.xp);
      const after = heroLevelFor(next.xp);
      latest.current = next;
      setProgress(next);
      if (user) saveProgress(user.id, next);
      if (after > before) {
        levelUpSeq.current += 1;
        setLevelUp({ level: after, title: heroTitle(after), id: levelUpSeq.current });
      }
    },
    [user],
  );

  useEffect(() => {
    setLevelUp(null);
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

  const dismissLevelUp = useCallback(() => setLevelUp(null), []);

  const resetAll = useCallback(() => {
    if (user) resetProgress(user.id);
    const empty = createEmptyProgress();
    latest.current = empty;
    setProgress(empty);
    setPendingAchievements([]);
    setLevelUp(null);
  }, [user]);

  const value = useMemo<GameContextValue>(
    () => ({
      progress,
      hero: heroLevelInfo(progress.xp),
      pendingAchievements,
      dismissAchievement,
      levelUp,
      dismissLevelUp,
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
      levelUp,
      dismissLevelUp,
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
