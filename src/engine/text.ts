import type { GlossEntry } from '@/types';

/** Contracciones y variantes que tratamos como equivalentes al corregir. */
const EQUIVALENTS: Array<[RegExp, string]> = [
  [/\bi'm\b/g, 'i am'],
  [/\byou're\b/g, 'you are'],
  [/\bhe's\b/g, 'he is'],
  [/\bshe's\b/g, 'she is'],
  [/\bit's\b/g, 'it is'],
  [/\bwe're\b/g, 'we are'],
  [/\bthey're\b/g, 'they are'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bi've\b/g, 'i have'],
  [/\bi'd\b/g, 'i would'],
  [/\bi'll\b/g, 'i will'],
];

/**
 * Normaliza para comparar: minúsculas, sin acentos, sin puntuación,
 * espacios colapsados y contracciones expandidas.
 */
export function normalize(input: string): string {
  let out = input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .trim();

  for (const [pattern, replacement] of EQUIVALENTS) {
    out = out.replace(pattern, replacement);
  }

  return out
    .replace(/[.,!?;:"“”()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Como `normalize`, pero SIN expandir contracciones.
 * Imprescindible para las palabras prohibidas: si expandiéramos, prohibir
 * «I'm» marcaría también el «I am» correcto, que es justo lo que pedimos.
 */
export function normalizeLoose(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .replace(/[.,!?;:"“”()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function wordCount(input: string): number {
  const trimmed = input.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Distancia de edición, para distinguir un typo de un error real. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[b.length];
}

/** Tolerancia de typos proporcional a la longitud de la respuesta esperada. */
export function typoTolerance(expected: string): number {
  if (expected.length <= 4) return 1;
  if (expected.length <= 12) return 2;
  return 3;
}

export function containsPhrase(haystack: string, needle: string): boolean {
  return matches(haystack, normalize(needle));
}

/** Búsqueda sin expandir contracciones. El `haystack` debe venir de `normalizeLoose`. */
export function containsPhraseLoose(haystack: string, needle: string): boolean {
  return matches(haystack, normalizeLoose(needle));
}

function matches(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return new RegExp(`(^|\\s)${escapeRegExp(needle)}(\\s|$)`).test(haystack);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface GlossToken {
  text: string;
  gloss?: string;
}

/**
 * Parte un texto marcado con [corchetes] en tokens, resolviendo cada palabra
 * marcada contra el glosario del nodo.
 */
export function tokenizeGlossed(text: string, glossary: GlossEntry[] = []): GlossToken[] {
  const dict = new Map(glossary.map((g) => [g.en.toLowerCase(), g.es]));
  const tokens: GlossToken[] = [];
  const pattern = /\[([^\]]+)\]/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ text: text.slice(cursor, match.index) });
    }
    const word = match[1];
    tokens.push({ text: word, gloss: dict.get(word.toLowerCase()) ?? '—' });
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) tokens.push({ text: text.slice(cursor) });
  return tokens;
}

/** Quita los corchetes del glosario para usos donde no se renderiza (aria-label, etc.). */
export function stripGloss(text: string): string {
  return text.replace(/\[([^\]]+)\]/g, '$1');
}
