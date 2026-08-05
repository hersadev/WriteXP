import type { Grade, Rubric, WritingNode } from '@/types';
import {
  containsPhrase,
  containsPhraseLoose,
  levenshtein,
  normalize,
  normalizeLoose,
  typoTolerance,
  wordCount,
} from './text';

export interface GradeResult {
  grade: Grade;
  /** Multiplicador de XP antes de aplicar penalización por intentos. */
  ratio: number;
  /** Mensajes en español que explican qué ha fallado o qué ha ido bien. */
  notes: string[];
  /** Respuesta modelo, para mostrarla cuando el usuario se rinde. */
  model?: string;
  /** Estado de cada requisito de la rúbrica, para pintar el checklist. */
  checklist?: Array<{ label: string; met: boolean }>;
}

/**
 * Corrige la respuesta escrita de un nodo.
 * Si el nodo tiene `answers` se compara contra ellas (con tolerancia a typos);
 * si no, se evalúa contra la rúbrica.
 */
export function gradeWriting(node: WritingNode, raw: string): GradeResult {
  const input = raw.trim();

  if (!input) {
    return { grade: 'wrong', ratio: 0, notes: ['Escribe algo antes de enviar.'] };
  }

  if (node.answers?.length) {
    return gradeAgainstAnswers(node.answers, input, node.rubric);
  }

  if (node.rubric) {
    return gradeAgainstRubric(node.rubric, input);
  }

  // Sin criterio definido: cualquier texto no vacío vale.
  return { grade: 'perfect', ratio: 1, notes: ['¡Bien!'] };
}

function gradeAgainstAnswers(answers: string[], input: string, rubric?: Rubric): GradeResult {
  const normalizedInput = normalize(input);
  const notes: string[] = [];

  let bestDistance = Infinity;
  let closest = answers[0];

  for (const answer of answers) {
    const target = normalize(answer);
    if (normalizedInput === target) {
      notes.push(...styleNotes(input, rubric));
      const clean = notes.length === 0;
      return {
        grade: clean ? 'perfect' : 'close',
        ratio: clean ? 1 : 0.7,
        notes: clean ? ['¡Exacto!'] : notes,
        model: answers[0],
      };
    }
    const distance = levenshtein(normalizedInput, target);
    if (distance < bestDistance) {
      bestDistance = distance;
      closest = answer;
    }
  }

  if (bestDistance <= typoTolerance(normalize(closest))) {
    return {
      grade: 'close',
      ratio: 0.6,
      notes: [
        `Casi. Hay una errata: se escribe «${closest}».`,
        'Fíjate en la ortografía y vuelve a intentarlo.',
      ],
      model: closest,
    };
  }

  return {
    grade: 'wrong',
    ratio: 0,
    notes: ['No es eso todavía. Lee la pista y prueba otra vez.'],
    model: closest,
  };
}

function gradeAgainstRubric(rubric: Rubric, input: string): GradeResult {
  const normalizedInput = normalize(input);
  const words = wordCount(input);
  const checklist: Array<{ label: string; met: boolean }> = [];
  const notes: string[] = [];

  if (rubric.minWords !== undefined) {
    const met = words >= rubric.minWords;
    checklist.push({ label: `Al menos ${rubric.minWords} palabras`, met });
    if (!met) notes.push(`Te faltan palabras: llevas ${words} de ${rubric.minWords}.`);
  }

  if (rubric.maxWords !== undefined && words > rubric.maxWords) {
    checklist.push({ label: `Como mucho ${rubric.maxWords} palabras`, met: false });
    notes.push(`Demasiado largo: ${words} palabras, el máximo es ${rubric.maxWords}. Sintetiza.`);
  }

  rubric.requiredKeywords?.forEach((group, index) => {
    const met = group.some((variant) => containsPhrase(normalizedInput, variant));
    const label = rubric.checklist?.[index] ?? `Usa: ${group.join(' / ')}`;
    checklist.push({ label, met });
    if (!met) notes.push(`Falta este recurso: ${label.toLowerCase()}.`);
  });

  // Las prohibidas se buscan sin expandir contracciones (ver `normalizeLoose`).
  const looseInput = normalizeLoose(input);
  const banned = rubric.forbiddenWords?.filter((word) => containsPhraseLoose(looseInput, word)) ?? [];
  if (banned.length) {
    checklist.push({ label: `Evita: ${rubric.forbiddenWords!.join(', ')}`, met: false });
    notes.push(`Evita «${banned.join('», «')}»: busca una alternativa más precisa.`);
  }

  // Un texto de relleno puede cumplir el recuento y las keywords sin decir nada,
  // así que se descarta antes de puntuar.
  const nonsense = nonsenseNotes(input);
  if (nonsense.length) {
    checklist.push({ label: 'Un texto con sentido, no relleno', met: false });
    return {
      grade: 'wrong',
      ratio: 0,
      // Dos motivos bastan: con cuatro el aviso se vuelve una pared de texto.
      notes: [...nonsense.slice(0, 2), 'Contar palabras no basta: la frase tiene que decir algo.'],
      checklist,
    };
  }

  notes.push(...styleNotes(input, rubric));

  const total = checklist.length || 1;
  const met = checklist.filter((item) => item.met).length;
  const ratio = met / total;

  if (ratio === 1 && notes.length === 0) {
    return {
      grade: 'perfect',
      ratio: 1,
      notes: ['Cumples todos los requisitos. Buen texto.'],
      checklist,
    };
  }

  if (ratio >= 0.6) {
    return { grade: 'close', ratio: ratio * 0.8, notes, checklist };
  }

  return { grade: 'wrong', ratio: 0, notes, checklist };
}

/**
 * Palabras de función: se repiten en cualquier texto correcto, así que no
 * cuentan como vocabulario acaparado.
 */
const FUNCTION_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'at', 'for', 'with', 'from', 'by',
  'as', 'that', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it',
  'its', 'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their', 'not',
  'no', 'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should',
  'may', 'might', 'must', 'if', 'than', 'then', 'so', 'because', 'there', 'what', 'when', 'who',
]);

/** Interjecciones sin vocal que sí son inglés. */
const VOWELLESS_WORDS = new Set(['shh', 'hmm', 'mhm', 'psst', 'tsk', 'brr', 'grr', 'nth']);

/**
 * Detecta el texto que cumple la rúbrica «por fuera» pero no comunica nada:
 * la misma palabra repetida, vocabulario mínimo o cadenas impronunciables.
 * Sin esto, «Zzz word word word word word word word word word.» sacaba la nota
 * máxima en b2-3-n4 sólo por tener entre 8 y 25 palabras.
 */
function nonsenseNotes(input: string): string[] {
  const words = normalizeLoose(input).split(' ').filter(Boolean);
  if (words.length < 3) return [];

  const notes: string[] = [];

  // 1. La misma palabra tres veces seguidas.
  let run = 1;
  for (let i = 1; i < words.length; i++) {
    run = words[i] === words[i - 1] ? run + 1 : 1;
    if (run >= 3) {
      notes.push(`Repites «${words[i]}» varias veces seguidas: eso no es una frase.`);
      break;
    }
  }

  // 2. Vocabulario pobre. Sólo en textos cortos: en un ensayo largo la
  //    repetición de palabras comunes es normal y la mide la regla 3.
  const distinct = new Set(words);
  if (words.length >= 6 && words.length <= 40 && distinct.size / words.length < 0.5) {
    const cuantas = distinct.size === 1 ? 'una sola palabra distinta' : `sólo ${distinct.size} palabras distintas`;
    notes.push(`Usas ${cuantas} en un texto de ${words.length}. Escribe una frase de verdad.`);
  }

  // 3. Una única palabra con contenido acapara el texto.
  const counts = new Map<string, number>();
  for (const word of words) {
    if (FUNCTION_WORDS.has(word)) continue;
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  for (const [word, count] of counts) {
    if (count >= 4 && count / words.length >= 0.2) {
      notes.push(`«${word}» aparece ${count} veces: varía el vocabulario.`);
      break;
    }
  }

  // 4. Cadenas impronunciables: sin vocal o con la misma letra tres veces.
  const gibberish = words.filter(isGibberish);
  if (gibberish.length >= 2 || gibberish.length / words.length >= 0.1) {
    notes.push(`Esto no son palabras: «${[...new Set(gibberish)].join('», «')}».`);
  }

  return notes;
}

function isGibberish(word: string): boolean {
  if (word.length < 3 || !/^[a-z]+$/.test(word)) return false;
  if (VOWELLESS_WORDS.has(word)) return false;
  return !/[aeiouy]/.test(word) || /(.)\1{2,}/.test(word);
}

/** Reglas de forma que aplican a cualquier respuesta escrita. */
function styleNotes(input: string, rubric?: Rubric): string[] {
  const notes: string[] = [];
  const trimmed = input.trim();

  if (rubric?.requireCapitalStart && trimmed[0] !== trimmed[0]?.toUpperCase()) {
    notes.push('En inglés la frase empieza con mayúscula.');
  }

  if (rubric?.requireFinalPunctuation && !/[.!?]$/.test(trimmed)) {
    notes.push('Cierra la frase con un punto o un signo de interrogación.');
  }

  if (/\bi\b/.test(trimmed) && !/\bI\b/.test(trimmed)) {
    notes.push('El pronombre «I» va siempre en mayúscula.');
  }

  return notes;
}

/**
 * XP final del nodo: la respuesta perfecta a la primera vale el 100%,
 * y cada intento o ayuda extra descuenta.
 */
export function computeXp(base: number, result: GradeResult, attempts: number, revealed: boolean): number {
  if (revealed) return Math.round(base * 0.2);
  const attemptPenalty = attempts === 1 ? 1 : attempts === 2 ? 0.7 : 0.45;
  return Math.max(0, Math.round(base * result.ratio * attemptPenalty));
}
