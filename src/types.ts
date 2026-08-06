/**
 * Modelo de datos de WriteXP.
 * Todo el contenido (historia, ejercicios, logros) se describe con estos tipos,
 * de forma que añadir un capítulo nuevo sea sólo escribir datos, nunca UI.
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

/** Palabra del glosario que se puede marcar en el texto con [corchetes]. */
export interface GlossEntry {
  en: string;
  es: string;
}

export type NodeKind =
  | 'narrative' // sólo lectura: avanza la historia
  | 'choice' // decisión de la historia (no hay opción incorrecta)
  | 'readingCheck' // comprensión lectora: hay una opción correcta
  | 'writeWord' // traducir una palabra suelta (A1/A2)
  | 'gapFill' // completar un hueco dentro de una frase
  | 'writeSentence' // escribir una frase completa
  | 'writeFree'; // redacción libre evaluada por rúbrica

export interface BaseNode {
  id: string;
  kind: NodeKind;
  /** Quién habla (se pinta como etiqueta de personaje). */
  speaker?: string;
  /** XP máxima del nodo, a primer intento. */
  xp: number;
}

export interface NarrativeNode extends BaseNode {
  kind: 'narrative';
  /** Texto en inglés. Las palabras entre [corchetes] se enlazan al glosario. */
  text: string;
  /** Traducción de apoyo, oculta tras un botón. */
  translation?: string;
  glossary?: GlossEntry[];
}

export interface ChoiceOption {
  id: string;
  text: string;
  /** Sólo en readingCheck. En 'choice' todas las opciones son válidas. */
  correct?: boolean;
  /** Reacción de la historia al elegir esta opción. */
  feedback?: string;
}

export interface ChoiceNode extends BaseNode {
  kind: 'choice' | 'readingCheck';
  prompt: string;
  promptEs?: string;
  /** Texto de lectura sobre el que se pregunta. */
  passage?: string;
  glossary?: GlossEntry[];
  options: ChoiceOption[];
}

/** Rúbrica para redacciones libres, donde no existe "la" respuesta correcta. */
export interface Rubric {
  minWords?: number;
  maxWords?: number;
  /**
   * Cada grupo es un requisito: basta con que aparezca UNA de las variantes.
   * Ej: [['because', 'so that'], ['yesterday', 'last night']]
   */
  requiredKeywords?: string[][];
  /** Muletillas o calcos del español que queremos desterrar. */
  forbiddenWords?: string[];
  /** Etiquetas legibles de cada requisito, en español, para el checklist. */
  checklist?: string[];
  requireCapitalStart?: boolean;
  requireFinalPunctuation?: boolean;
}

export interface WritingNode extends BaseNode {
  kind: 'writeWord' | 'gapFill' | 'writeSentence' | 'writeFree';
  /** Consigna en inglés (o la frase con ___ en gapFill). */
  prompt: string;
  /** Consigna en español: lo que el usuario tiene que expresar. */
  promptEs?: string;
  glossary?: GlossEntry[];
  /** Respuestas aceptadas. Si existe, manda sobre la rúbrica. */
  answers?: string[];
  /**
   * Sólo en ejercicios con más de un hueco: variantes aceptadas en CADA hueco,
   * en orden. Permite corregirlos uno a uno y decir cuál está bien y cuál no,
   * en vez de suspender la frase entera.
   *
   * Ej: 'Someone ___ the window and ___ the key.' → [['broke'], ['took']]
   *
   * Manda sobre `answers`, que se conserva como la solución que se enseña al
   * rendirse. `npm run verify` comprueba que ambos digan lo mismo.
   */
  slots?: string[][];
  rubric?: Rubric;
  placeholder?: string;
  /**
   * Ejemplo resuelto del MISMO patrón pero con otro contenido, visible desde el
   * primer momento y sin coste de XP: en A1 y A2 el jugador aún no sabe qué
   * forma tiene una respuesta buena, y enseñársela no es regalarle la suya.
   *
   * Nunca puede contener la solución: `npm run verify` comprueba que no incluya
   * ninguna respuesta aceptada y que, en las rúbricas de varios requisitos,
   * copiarlo tal cual no apruebe.
   */
  example?: string;
  /** Pista que se ofrece tras el primer fallo: puede ser un esqueleto. */
  hint?: string;
  /**
   * Segunda pista, más explícita que `hint`, para el jugador que sigue atascado
   * tras el segundo fallo. La alternativa era rendirse, que cuesta el 80% de la
   * XP y tumba el objetivo de «sin revelar soluciones».
   */
  hint2?: string;
  /**
   * Texto ejemplar completo que se muestra al rendirse. Obligatorio en las
   * redacciones libres: la pista es un andamiaje, esto es una respuesta real
   * que aprueba la rúbrica (lo verifica `npm run verify`).
   */
  model?: string;
  /** Cómo sigue la historia cuando acierta. */
  success?: string;
  multiline?: boolean;
}

export type StoryNode = NarrativeNode | ChoiceNode | WritingNode;

export type GoalKind = 'complete' | 'perfect' | 'noReveal' | 'words' | 'combo';

export interface ChapterGoal {
  id: string;
  kind: GoalKind;
  /** Umbral: nº de aciertos perfectos, palabras escritas, racha... */
  value?: number;
  label: string;
  xp: number;
}

export interface Chapter {
  id: string;
  level: CEFRLevel;
  order: number;
  title: string;
  titleEs: string;
  /** Sinopsis en español, se ve en el mapa de capítulos. */
  summary: string;
  /** Contenido lingüístico que se practica aquí. */
  focus: string[];
  nodes: StoryNode[];
  goals: ChapterGoal[];
}

export interface LevelDef {
  id: CEFRLevel;
  act: string;
  title: string;
  tagline: string;
  description: string;
  vocabFocus: string[];
  grammarFocus: string[];
  /** Nivel de héroe recomendado para entrar sin saltarse nada. */
  recommendedHeroLevel: number;
  accent: string;
  sigil: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  sigil: string;
  xp: number;
  /** Secreto: no se describe hasta desbloquearlo. */
  hidden?: boolean;
  check: (p: Progress) => boolean;
}

/** Resultado de un nodo concreto, persistido. */
export interface NodeResult {
  grade: Grade;
  attempts: number;
  revealed: boolean;
  xpEarned: number;
}

export type Grade = 'perfect' | 'close' | 'wrong';

/**
 * Estadísticas de una partida a un capítulo. Se persisten junto al checkpoint:
 * si sólo se guardase el nodo en el que se quedó, al reanudar arrancarían a cero
 * y los objetivos del capítulo (palabras, aciertos, racha) serían inalcanzables.
 */
export interface RunStats {
  answered: number;
  perfect: number;
  firstTry: number;
  reveals: number;
  hints: number;
  words: number;
  combo: number;
  maxCombo: number;
  xp: number;
}

export interface ChapterProgress {
  /** Índice del nodo en el que se quedó (permite reanudar). */
  nodeIndex: number;
  completed: boolean;
  goalsMet: string[];
  bestAccuracy: number;
  runs: number;
  /**
   * Partida en curso. Ausente si el capítulo no se ha empezado, si ya se cerró
   * o si el guardado es anterior a que esto se persistiera.
   */
  run?: RunStats;
}

export interface Stats {
  wordsWritten: number;
  answersTotal: number;
  answersPerfect: number;
  answersFirstTry: number;
  hintsUsed: number;
  reveals: number;
  chaptersCompleted: number;
  currentCombo: number;
  maxCombo: number;
  streakDays: number;
  lastPlayedISO: string | null;
  levelsCompleted: CEFRLevel[];
}

export interface Progress {
  currentLevel: CEFRLevel | null;
  xp: number;
  /** Niveles desbloqueados a mano por el usuario ("entrar de todos modos"). */
  overrideUnlocked: CEFRLevel[];
  chapters: Record<string, ChapterProgress>;
  nodes: Record<string, NodeResult>;
  stats: Stats;
  achievements: Record<string, string>; // id -> fecha ISO de desbloqueo
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}
