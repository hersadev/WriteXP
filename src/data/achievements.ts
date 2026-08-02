import type { Achievement } from '@/types';
import { heroLevelFor } from '@/engine/xp';

/**
 * Logros globales. Se comprueban tras cada capítulo terminado.
 * `check` sólo puede leer `Progress`: nada de estado de UI aquí.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-word',
    title: 'Primera palabra',
    description: 'Escribe tu primera respuesta correcta en inglés.',
    sigil: '✒️',
    xp: 20,
    check: (p) => p.stats.answersPerfect >= 1,
  },
  {
    id: 'first-chapter',
    title: 'El viaje empieza',
    description: 'Termina tu primer capítulo.',
    sigil: '📖',
    xp: 30,
    check: (p) => p.stats.chaptersCompleted >= 1,
  },
  {
    id: 'combo-5',
    title: 'Pluma afilada',
    description: 'Encadena 5 respuestas perfectas seguidas.',
    sigil: '🔥',
    xp: 50,
    check: (p) => p.stats.maxCombo >= 5,
  },
  {
    id: 'combo-12',
    title: 'Mano firme',
    description: 'Encadena 12 respuestas perfectas seguidas.',
    sigil: '⚡',
    xp: 120,
    check: (p) => p.stats.maxCombo >= 12,
  },
  {
    id: 'words-250',
    title: 'Aprendiz de cronista',
    description: 'Escribe 250 palabras en inglés en total.',
    sigil: '📜',
    xp: 60,
    check: (p) => p.stats.wordsWritten >= 250,
  },
  {
    id: 'words-1000',
    title: 'Cronista de Aeloria',
    description: 'Escribe 1.000 palabras en inglés en total.',
    sigil: '🏛️',
    xp: 150,
    check: (p) => p.stats.wordsWritten >= 1000,
  },
  {
    id: 'no-help',
    title: 'Sin red',
    description: 'Acierta 25 respuestas a la primera, sin pistas.',
    sigil: '🎯',
    xp: 100,
    check: (p) => p.stats.answersFirstTry >= 25,
  },
  {
    id: 'act-a1',
    title: 'Guardián de los nombres',
    description: 'Completa el Acto I (A1) al completo.',
    sigil: '🜁',
    xp: 150,
    check: (p) => p.stats.levelsCompleted.includes('A1'),
  },
  {
    id: 'act-a2',
    title: 'Testigo fiable',
    description: 'Completa el Acto II (A2) al completo.',
    sigil: '🜂',
    xp: 200,
    check: (p) => p.stats.levelsCompleted.includes('A2'),
  },
  {
    id: 'act-b1',
    title: 'Miembro del Gremio',
    description: 'Completa el Acto III (B1) al completo.',
    sigil: '🜃',
    xp: 300,
    check: (p) => p.stats.levelsCompleted.includes('B1'),
  },
  {
    id: 'act-b2',
    title: 'Voz del Consejo',
    description: 'Completa el Acto IV (B2) al completo.',
    sigil: '🜄',
    xp: 400,
    check: (p) => p.stats.levelsCompleted.includes('B2'),
  },
  {
    id: 'streak-3',
    title: 'Constancia',
    description: 'Escribe 3 días seguidos.',
    sigil: '🌙',
    xp: 40,
    check: (p) => p.stats.streakDays >= 3,
  },
  {
    id: 'streak-7',
    title: 'Disciplina de escriba',
    description: 'Escribe 7 días seguidos.',
    sigil: '☀️',
    xp: 120,
    check: (p) => p.stats.streakDays >= 7,
  },
  {
    id: 'hero-5',
    title: 'Narrador',
    description: 'Alcanza el nivel 5 de héroe.',
    sigil: '⭐',
    xp: 80,
    check: (p) => heroLevelFor(p.xp) >= 5,
  },
  {
    id: 'hero-10',
    title: 'Leyenda viva',
    description: 'Alcanza el nivel 10 de héroe.',
    sigil: '👑',
    xp: 250,
    check: (p) => heroLevelFor(p.xp) >= 10,
  },
  {
    id: 'perfectionist',
    title: 'Sin tachones',
    description: 'Termina un capítulo entero sin revelar ninguna respuesta.',
    sigil: '💎',
    xp: 90,
    hidden: true,
    check: (p) =>
      Object.values(p.chapters).some((chapter) => chapter.completed && chapter.bestAccuracy >= 0.999),
  },
];

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}
