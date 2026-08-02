import type { CEFRLevel, LevelDef } from '@/types';

/**
 * Los cuatro actos de la campaña. Cada acto es un nivel del MCER y sube
 * la exigencia de escritura: de la palabra suelta al texto argumentado.
 */
export const LEVELS: LevelDef[] = [
  {
    id: 'A1',
    act: 'Acto I',
    title: 'La Puerta de los Nombres',
    tagline: 'Nombrar el mundo',
    description:
      'Despiertas en Lumen sin recordar tu idioma. Aquí las cosas sólo existen si sabes nombrarlas. Aprendes a presentarte, describir lo que ves y sobrevivir con frases de tres palabras.',
    vocabFocus: ['Objetos cotidianos', 'Colores y números', 'Familia', 'La casa y el pueblo'],
    grammarFocus: ['verbo to be', 'a / an / the', 'Presente simple', 'Plurales'],
    recommendedHeroLevel: 1,
    accent: '#5ec4a8',
    sigil: '🜁',
  },
  {
    id: 'A2',
    act: 'Acto II',
    title: 'La Llave Perdida',
    tagline: 'Contar lo que pasó',
    description:
      'Alguien ha robado la llave del archivo. Para reconstruir la noche del robo tendrás que narrar en pasado, describir personas y hacer preguntas a media docena de testigos.',
    vocabFocus: ['Rutinas', 'Ropa y aspecto', 'Comida', 'Viajes y direcciones'],
    grammarFocus: ['Pasado simple', 'there was / there were', 'Comparativos', 'Preguntas con wh-'],
    recommendedHeroLevel: 3,
    accent: '#66a6ff',
    sigil: '🜂',
  },
  {
    id: 'B1',
    act: 'Acto III',
    title: 'El Gremio de las Palabras',
    tagline: 'Defender una idea',
    description:
      'Te admiten a prueba en el Gremio. Ya no basta con contar hechos: hay que opinar, justificar, enlazar ideas y escribir cartas que convenzan a gente que no está de tu lado.',
    vocabFocus: ['Trabajo y estudios', 'Tecnología', 'Medio ambiente', 'Emociones'],
    grammarFocus: ['Presente perfecto', 'Condicionales 1 y 2', 'Conectores', 'Voz pasiva básica'],
    recommendedHeroLevel: 6,
    accent: '#b98cff',
    sigil: '🜃',
  },
  {
    id: 'B2',
    act: 'Acto IV',
    title: 'El Consejo de Aeloria',
    tagline: 'Escribir con precisión',
    description:
      'El Consejo decide el futuro de la ciudad y tú redactas el informe. Registro formal, matices, concesión al adversario y ni una palabra de más: aquí se puntúa el estilo, no sólo el acierto.',
    vocabFocus: ['Política y sociedad', 'Ciencia', 'Cultura y arte', 'Colocaciones formales'],
    grammarFocus: ['Estilo indirecto', 'Condicional 3', 'Inversión', 'Cláusulas de relativo'],
    recommendedHeroLevel: 8,
    accent: '#ffb454',
    sigil: '🜄',
  },
];

export function levelById(id: CEFRLevel): LevelDef {
  const found = LEVELS.find((level) => level.id === id);
  if (!found) throw new Error(`Nivel desconocido: ${id}`);
  return found;
}
