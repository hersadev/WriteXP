import type { CEFRLevel, Chapter } from '@/types';
import { A1_CHAPTERS } from './a1';
import { A2_CHAPTERS } from './a2';
import { B1_CHAPTERS } from './b1';
import { B2_CHAPTERS } from './b2';

export const CHAPTERS: Chapter[] = [...A1_CHAPTERS, ...A2_CHAPTERS, ...B1_CHAPTERS, ...B2_CHAPTERS];

export function chaptersByLevel(level: CEFRLevel): Chapter[] {
  return CHAPTERS.filter((chapter) => chapter.level === level).sort((a, b) => a.order - b.order);
}

export function chapterById(id: string): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.id === id);
}

/** XP máxima teórica de un capítulo: todos los nodos + todos los objetivos. */
export function chapterMaxXp(chapter: Chapter): number {
  const nodes = chapter.nodes.reduce((sum, node) => sum + node.xp, 0);
  const goals = chapter.goals.reduce((sum, goal) => sum + goal.xp, 0);
  return nodes + goals;
}
