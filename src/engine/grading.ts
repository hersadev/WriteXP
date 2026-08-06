import type { Grade, Rubric, WritingNode } from '@/types';
import {
  containsPhraseAny,
  containsPhraseLoose,
  editDistance,
  normalize,
  normalizeLoose,
  normalizeVariants,
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

  if (node.slots?.length) {
    return gradeAgainstSlots(node.slots, input, node.answers?.[0]);
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
  // Una contracción ambigua da varias lecturas de lo escrito y de la respuesta
  // esperada («he's got» / «he has got»): basta con que se crucen en una.
  const written = normalizeVariants(input);
  const notes: string[] = [];

  let bestDistance = Infinity;
  let closest = answers[0];
  let closestTarget = normalize(answers[0]);

  for (const answer of answers) {
    for (const target of normalizeVariants(answer)) {
      if (written.includes(target)) {
        notes.push(...styleNotes(input, rubric));
        const clean = notes.length === 0;
        return {
          grade: clean ? 'perfect' : 'close',
          ratio: clean ? 1 : 0.7,
          notes: clean ? ['¡Exacto!'] : notes,
          model: answers[0],
        };
      }
      for (const variant of written) {
        const distance = editDistance(variant, target);
        if (distance < bestDistance) {
          bestDistance = distance;
          closest = answer;
          closestTarget = target;
        }
      }
    }
  }

  if (bestDistance <= typoTolerance(closestTarget)) {
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

const ORDINALS = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto'];

function slotLabel(index: number): string {
  return ORDINALS[index] ? `${ORDINALS[index]} hueco` : `hueco ${index + 1}`;
}

function capitalize(value: string): string {
  return value[0].toUpperCase() + value.slice(1);
}

function tokenSize(value: string): number {
  return value.split(' ').filter(Boolean).length;
}

/**
 * Corrige hueco a hueco.
 *
 * Como todo se escribe en un único campo, hay que repartir lo tecleado entre los
 * huecos: para cada uno se busca la variante que encaje y se consumen sus
 * palabras; si no encaja ninguna, se consumen tantas como ocupa la respuesta
 * esperada. El reparto es exacto porque las variantes de un mismo hueco miden lo
 * mismo (`there were` / `there was`), cosa que verifica `npm run verify`.
 *
 * No se perdonan erratas: en un hueco lo que se examina es la forma exacta, y
 * «a» por «an» o «broken» por «broke» son justo el error que se evalúa. Cuando
 * la palabra se parece mucho a la esperada se dice que revise la ortografía,
 * pero el hueco sigue sin darse por bueno.
 */
function gradeAgainstSlots(slots: string[][], input: string, fallback?: string): GradeResult {
  // Cada lectura de las contracciones ambiguas reparte los tokens de otra
  // manera, así que se corrigen todas y se conserva la que más huecos acierta.
  return normalizeVariants(input)
    .map((variant) => gradeSlotsOnce(slots, variant, fallback))
    .reduce((best, result) => (result.ratio > best.ratio ? result : best));
}

/** Una pasada de corrección sobre una lectura ya normalizada. */
function gradeSlotsOnce(slots: string[][], normalized: string, fallback?: string): GradeResult {
  const tokens = normalized.split(' ').filter(Boolean);
  const checklist: Array<{ label: string; met: boolean }> = [];
  const notes: string[] = [];
  let cursor = 0;
  let met = 0;

  slots.forEach((variants, index) => {
    const label = slotLabel(index);
    const accepted = variants.map(normalize);
    // Las variantes largas se prueban primero: si una corta fuese principio de
    // otra larga, aceptarla dejaría descolocados los huecos siguientes.
    const byLength = [...accepted].sort((a, b) => tokenSize(b) - tokenSize(a));

    const hit = byLength.find(
      (variant) => tokens.slice(cursor, cursor + tokenSize(variant)).join(' ') === variant,
    );

    if (hit) {
      cursor += tokenSize(hit);
      met++;
      checklist.push({ label: `${capitalize(label)}: «${hit}»`, met: true });
      notes.push(`El ${label} está bien: «${hit}».`);
      return;
    }

    const written = tokens.slice(cursor, cursor + tokenSize(accepted[0])).join(' ');
    cursor += tokenSize(accepted[0]);

    if (!written) {
      checklist.push({ label: `${capitalize(label)}: sin respuesta`, met: false });
      notes.push(`Falta el ${label}.`);
      return;
    }

    checklist.push({ label: `${capitalize(label)}: «${written}»`, met: false });

    const closest = accepted.reduce((best, variant) =>
      editDistance(written, variant) < editDistance(written, best) ? variant : best,
    );
    const isTypo = editDistance(written, closest) <= typoTolerance(closest);

    notes.push(
      isTypo
        ? `El ${label} está casi: «${written}» se parece, pero no está bien escrito.`
        : `El ${label} no: «${written}» no encaja ahí.`,
    );
  });

  const leftover = tokens.slice(cursor).join(' ');
  if (leftover) {
    notes.push(`Sobra «${leftover}»: sólo hay ${slots.length} huecos que rellenar.`);
  }

  if (met === slots.length && !leftover) {
    return { grade: 'perfect', ratio: 1, notes: ['¡Exacto!'], model: fallback, checklist };
  }

  if (met === 0) {
    return { grade: 'wrong', ratio: 0, notes, model: fallback, checklist };
  }

  // Acertar la mitad no es acertar, pero tampoco es empezar de cero.
  return { grade: 'close', ratio: (met / slots.length) * 0.8, notes, model: fallback, checklist };
}

function gradeAgainstRubric(rubric: Rubric, input: string): GradeResult {
  const inputVariants = normalizeVariants(input);
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
    const met = group.some((variant) => containsPhraseAny(inputVariants, variant));
    const label = rubric.checklist?.[index] ?? `Usa: ${group.join(' / ')}`;
    checklist.push({ label, met });
    if (!met) notes.push(`Falta este recurso: ${label.toLowerCase()}.`);
  });

  if (rubric.requireQuestionMark) {
    checklist.push({ label: 'Termina con «?»', met: endsAsQuestion(input) });
  }

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

/** Cierra con «?», admitiendo comillas de cierre alrededor de la pregunta. */
function endsAsQuestion(input: string): boolean {
  return /\?["'”»]?$/.test(input.trim());
}

/** Reglas de forma que aplican a cualquier respuesta escrita. */
function styleNotes(input: string, rubric?: Rubric): string[] {
  const notes: string[] = [];
  const trimmed = input.trim();

  if (rubric?.requireCapitalStart && trimmed[0] !== trimmed[0]?.toUpperCase()) {
    notes.push('En inglés la frase empieza con mayúscula.');
  }

  if (rubric?.requireQuestionMark && !endsAsQuestion(input)) {
    notes.push('Es una pregunta: ciérrala con «?».');
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
