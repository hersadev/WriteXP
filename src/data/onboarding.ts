import type { GlossEntry, WritingNode } from '@/types';

/**
 * Contenido de la introducción.
 *
 * Vive aquí y no dentro de la pantalla por la misma regla que el resto del
 * juego: el contenido son datos. Y no vive en `story/` porque no es campaña —no
 * tiene capítulo, no da XP y no entra en la cola de repaso—, aunque se corrige
 * con el mismo motor y se pinta con la misma tarjeta que un ejercicio de verdad.
 * Enseñar cómo se juega con una maqueta que no corrige sería enseñar otra cosa.
 */

/**
 * El ejercicio de prueba. `xp: 0` no es un descuido: la introducción no paga,
 * y la tarjeta esconde el marcador cuando no hay nada en juego. Regalar XP aquí
 * descuadraría la curva de niveles, que está calibrada al contenido real.
 */
export const INTRO_NODE: WritingNode = {
  id: 'intro-taster',
  kind: 'writeSentence',
  speaker: 'Mira',
  xp: 0,
  prompt: 'Mira sets a loaf down and waits. In Aeloria nothing is real until someone writes where it is.',
  promptEs: 'Escribe en inglés: «el pan está en la mesa».',
  answers: [
    'the bread is on the table',
    "the bread's on the table",
    'bread is on the table',
  ],
  example:
    'El mismo molde con otro contenido: «el gato está en la silla» → "The cat is on the chair." Sujeto, verbo, y dónde está.',
  hint: 'Empieza por «The», sigue con el verbo to be y termina diciendo dónde. «Mesa» es table.',
  hint2: 'The b____ is on the t____.',
  model: 'The bread is on the table.',
  placeholder: 'una frase corta, empezando por «The…»',
  success: 'The loaf turns solid on the wood. The room smells of warm bread.',
};

/** Texto de muestra para enseñar el glosario: las palabras entre [corchetes] se tocan. */
export const INTRO_PASSAGE =
  'The [rain] stops. Mira opens a heavy [book] and puts a [quill] in your hand. "Every word you write," she says, "is a door."';

export const INTRO_GLOSSARY: GlossEntry[] = [
  { en: 'rain', es: 'lluvia' },
  { en: 'book', es: 'libro' },
  { en: 'quill', es: 'pluma (de escribir)' },
];

export const INTRO_TRANSLATION =
  'La lluvia para. Mira abre un libro pesado y te pone una pluma en la mano. «Cada palabra que escribes», dice, «es una puerta.»';
