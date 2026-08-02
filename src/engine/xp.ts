/**
 * Curva de progresión del héroe: cada nivel cuesta 90 XP más que el anterior.
 * Está calibrada para que la campaña completa (~5.400 XP) termine justo en el
 * nivel 10, el último título. Lo comprueba `npm run verify`.
 */

const BASE_COST = 150;
const INCREMENT = 90;

/** XP acumulada necesaria para alcanzar `level` (nivel 1 = 0 XP). */
export function xpToReach(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) total += BASE_COST + (i - 1) * INCREMENT;
  return total;
}

export function heroLevelFor(xp: number): number {
  let level = 1;
  while (xp >= xpToReach(level + 1)) level++;
  return level;
}

export interface HeroLevelInfo {
  level: number;
  /** XP dentro del nivel actual. */
  current: number;
  /** XP que cuesta el nivel actual completo. */
  needed: number;
  /** 0..1 */
  ratio: number;
  title: string;
}

const TITLES = [
  'Aprendiz de escriba',
  'Escriba novato',
  'Copista',
  'Cronista',
  'Narrador',
  'Escriba mayor',
  'Guardián de las palabras',
  'Maestro del verbo',
  'Archimago de la pluma',
  'Leyenda de Aeloria',
];

export function heroTitle(level: number): string {
  return TITLES[Math.min(level - 1, TITLES.length - 1)] ?? TITLES[0];
}

export function heroLevelInfo(xp: number): HeroLevelInfo {
  const level = heroLevelFor(xp);
  const floor = xpToReach(level);
  const ceiling = xpToReach(level + 1);
  const needed = ceiling - floor;
  const current = xp - floor;

  return {
    level,
    current,
    needed,
    ratio: needed > 0 ? current / needed : 1,
    title: heroTitle(level),
  };
}
