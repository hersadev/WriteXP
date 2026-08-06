import type { GlossEntry } from '@/types';

/** Contracciones con una única lectura posible. */
const EQUIVALENTS: Array<[RegExp, string]> = [
  [/\bi'm\b/g, 'i am'],
  [/\b(you|we|they)'re\b/g, '$1 are'],
  [/\b(i|you|we|they)'ve\b/g, '$1 have'],
  [/\b(i|you|he|she|it|we|they|there|that|who)'ll\b/g, '$1 will'],
  [/\blet's\b/g, 'let us'],
  [/\bdon't\b/g, 'do not'],
  [/\bdoesn't\b/g, 'does not'],
  [/\bdidn't\b/g, 'did not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\bisn't\b/g, 'is not'],
  [/\baren't\b/g, 'are not'],
  [/\bwasn't\b/g, 'was not'],
  [/\bweren't\b/g, 'were not'],
  [/\bhaven't\b/g, 'have not'],
  [/\bhasn't\b/g, 'has not'],
  [/\bhadn't\b/g, 'had not'],
  [/\bwouldn't\b/g, 'would not'],
  [/\bshouldn't\b/g, 'should not'],
  [/\bcouldn't\b/g, 'could not'],
  [/\bmustn't\b/g, 'must not'],
  [/\bmightn't\b/g, 'might not'],
  [/\bneedn't\b/g, 'need not'],
];

/**
 * Contracciones con dos lecturas: «he's» es «he is» o «he has», y «he'd» es
 * «he would» o «he had». Quedarse con una sola marcaría como errata la mitad
 * de las respuestas correctas, así que se generan ambas y se compara contra
 * todas.
 *
 * La lista de sujetos es cerrada a propósito: con un `(\w+)'s` genérico el
 * posesivo («the Guild's handling») se expandiría a «the guild is handling».
 */
const AMBIGUOUS: Array<[RegExp, string[]]> = [
  [/\b(he|she|it|that|this|there|here|who|what|where|when|why|how)'s\b/g, ['$1 is', '$1 has']],
  [/\b(i|you|he|she|it|we|they|that|there|who)'d\b/g, ['$1 would', '$1 had']],
];

function stripAccents(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘`´]/g, "'")
    .trim();
}

function stripPunctuation(input: string): string {
  return input
    .replace(/[.,!?;:"“”()\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Todas las lecturas normalizadas de un texto: una por cada combinación de
 * contracciones ambiguas, cuatro como mucho. La primera es la lectura por
 * defecto, la que devuelve `normalize`.
 */
export function normalizeVariants(input: string): string[] {
  let base = stripAccents(input);

  for (const [pattern, replacement] of EQUIVALENTS) {
    base = base.replace(pattern, replacement);
  }

  let variants = [base];
  for (const [pattern, readings] of AMBIGUOUS) {
    // Si el patrón no aparece, las dos lecturas salen idénticas y el Set las
    // vuelve a juntar: no hace falta comprobarlo antes.
    variants = [...new Set(variants.flatMap((v) => readings.map((r) => v.replace(pattern, r))))];
  }

  return [...new Set(variants.map(stripPunctuation))];
}

/**
 * Normaliza para comparar: minúsculas, sin acentos, sin puntuación,
 * espacios colapsados y contracciones expandidas. Ante una contracción
 * ambigua se queda con la primera lectura; para tenerlas todas en cuenta al
 * corregir está `normalizeVariants`.
 */
export function normalize(input: string): string {
  return normalizeVariants(input)[0];
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

/**
 * Distancia de edición, para distinguir un typo de un error real.
 * Cuenta también la transposición como una sola edición (Damerau): «sevne»
 * por «seven» son dos teclas bailadas, no dos fallos.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prevPrev = new Array<number>(b.length + 1);
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  let curr = new Array<number>(b.length + 1);

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, prevPrev[j - 2] + 1);
      }
      curr[j] = best;
    }
    [prevPrev, prev, curr] = [prev, curr, prevPrev];
  }

  return prev[b.length];
}

/**
 * Tolerancia de typos proporcional a la longitud de la respuesta esperada.
 *
 * En las respuestas cortas no hay margen: a «sky» le basta una letra para
 * convertirse en «sly», «spy» o «shy», y a «do» para volverse «go» o «no».
 * Son palabras distintas —justo lo que el ejercicio evalúa—, así que por
 * debajo de cinco caracteres se exige la forma exacta.
 */
export function typoTolerance(expected: string): number {
  return Math.min(3, Math.floor(expected.length / 5));
}

export function containsPhrase(haystack: string, needle: string): boolean {
  return matches(haystack, normalize(needle));
}

/**
 * Como `containsPhrase`, pero cruzando todas las lecturas de las dos partes:
 * así «he's» encuentra tanto «he is» como «he has». Los `haystacks` deben
 * venir de `normalizeVariants`.
 */
export function containsPhraseAny(haystacks: string[], needle: string): boolean {
  const needles = normalizeVariants(needle);
  return haystacks.some((haystack) => needles.some((n) => matches(haystack, n)));
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
