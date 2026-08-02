import type { Chapter } from '@/types';

/**
 * ACTO I — A1 · La Puerta de los Nombres
 * En Lumen las cosas sólo existen si sabes escribir su nombre.
 * Del vocabulario suelto a la primera frase completa.
 */
export const A1_CHAPTERS: Chapter[] = [
  {
    id: 'a1-1',
    level: 'A1',
    order: 1,
    title: 'The Grey Morning',
    titleEs: 'La mañana gris',
    summary:
      'Despiertas en un pueblo bajo la lluvia sin saber quién eres. Una mujer de abrigo rojo te tiende una pluma y un cuaderno.',
    focus: ['verbo to be', 'Objetos cotidianos', 'Presentarse'],
    goals: [
      { id: 'a1-1-complete', kind: 'complete', label: 'Termina el capítulo', xp: 20 },
      { id: 'a1-1-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 25 },
      { id: 'a1-1-noreveal', kind: 'noReveal', label: 'Sin revelar ninguna solución', xp: 25 },
      { id: 'a1-1-words', kind: 'words', value: 8, label: 'Escribe 8 palabras en inglés', xp: 15 },
    ],
    nodes: [
      {
        id: 'a1-1-n1',
        kind: 'narrative',
        xp: 5,
        text: 'You open your eyes. The [sky] is [grey] and it is [raining]. A small [village] sleeps under the water. A woman in a red [coat] looks at you.',
        translation:
          'Abres los ojos. El cielo está gris y está lloviendo. Un pueblo pequeño duerme bajo el agua. Una mujer con un abrigo rojo te mira.',
        glossary: [
          { en: 'sky', es: 'cielo' },
          { en: 'grey', es: 'gris' },
          { en: 'raining', es: 'lloviendo' },
          { en: 'village', es: 'pueblo' },
          { en: 'coat', es: 'abrigo' },
        ],
      },
      {
        id: 'a1-1-n2',
        kind: 'narrative',
        speaker: 'Mira',
        xp: 5,
        text: '"[Welcome] to Lumen. Here a thing is [real] only if you can [write] its name. You cannot speak yet. But you can write."',
        translation:
          '«Bienvenido a Lumen. Aquí una cosa es real sólo si sabes escribir su nombre. Todavía no puedes hablar. Pero puedes escribir.»',
        glossary: [
          { en: 'Welcome', es: 'bienvenido/a' },
          { en: 'real', es: 'real, de verdad' },
          { en: 'write', es: 'escribir' },
        ],
      },
      {
        id: 'a1-1-n3',
        kind: 'writeWord',
        speaker: 'Mira',
        xp: 10,
        prompt: 'She points up. Write the name of what you see.',
        promptEs: 'Señala hacia arriba. Escribe «cielo» en inglés.',
        answers: ['sky', 'the sky'],
        hint: 'Tres letras. Empieza por s.',
        placeholder: 'una palabra…',
        success: 'The clouds open a little. A thin light falls on the street.',
      },
      {
        id: 'a1-1-n4',
        kind: 'writeWord',
        speaker: 'Mira',
        xp: 10,
        prompt: 'She points at the building behind her. Write its name.',
        promptEs: 'Señala el edificio donde vive. Escribe «casa» en inglés.',
        answers: ['house', 'a house', 'the house'],
        hint: 'h _ _ _ e',
        placeholder: 'una palabra…',
        success: 'A wooden door appears where there was only a wall.',
      },
      {
        id: 'a1-1-n5',
        kind: 'gapFill',
        speaker: 'Mira',
        xp: 10,
        prompt: 'My name ___ Mira. I ___ the keeper of the library.',
        promptEs:
          'Completa con el verbo to be. Escribe las dos palabras separadas por un espacio (ej: "are am").',
        answers: ['is am'],
        hint: 'Tercera persona del singular, y luego la forma de "I".',
        placeholder: 'is am',
      },
      {
        id: 'a1-1-n6',
        kind: 'writeSentence',
        speaker: 'Mira',
        xp: 20,
        prompt: '"And you? Write your name for me."',
        promptEs:
          'Preséntate por escrito. Usa «My name is…» o «I am…» y añade tu nombre.',
        rubric: {
          minWords: 3,
          requiredKeywords: [['my name is', 'i am']],
          checklist: ['Empieza con «My name is…» o «I am…»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Estructura: My name is + tu nombre + punto final.',
        model: 'My name is Alex.',
        placeholder: 'My name is…',
        success: 'The letters glow on the paper. For a second, the rain stops above you.',
      },
      {
        id: 'a1-1-n7',
        kind: 'readingCheck',
        xp: 15,
        passage:
          'Mira lives in a small house near the river. She has two cats and one old dog. Every morning she opens the library of Lumen at seven.',
        prompt: 'How many animals does Mira have?',
        promptEs: 'Lee el texto y responde.',
        options: [
          { id: 'a', text: 'Two animals.', feedback: 'Cuenta otra vez: hay gatos y también un perro.' },
          { id: 'b', text: 'Three animals.', correct: true, feedback: 'Exacto: two cats + one dog.' },
          { id: 'c', text: 'One animal.', feedback: '«Two cats» ya son dos por sí solos.' },
        ],
      },
      {
        id: 'a1-1-n8',
        kind: 'choice',
        speaker: 'Mira',
        xp: 5,
        prompt: '"The library or the river. Where do we go first?"',
        promptEs: 'Elige. Las dos opciones continúan la historia.',
        options: [
          { id: 'library', text: 'The library, please.', feedback: 'Mira smiles. "Good. Words live there."' },
          { id: 'river', text: 'The river first.', feedback: 'Mira nods slowly. "The river remembers things."' },
        ],
      },
    ],
  },

  {
    id: 'a1-2',
    level: 'A1',
    order: 2,
    title: 'The Market of Small Things',
    titleEs: 'El mercado de las cosas pequeñas',
    summary:
      'En el mercado de Lumen se paga con palabras. Necesitas pan, una manzana y un cuaderno nuevo, y sólo puedes pedirlos escribiéndolos bien.',
    focus: ['Números y colores', 'a / an', 'Plurales', 'Comida'],
    goals: [
      { id: 'a1-2-complete', kind: 'complete', label: 'Termina el capítulo', xp: 20 },
      { id: 'a1-2-perfect', kind: 'perfect', value: 5, label: 'Acierta 5 respuestas a la primera', xp: 30 },
      { id: 'a1-2-combo', kind: 'combo', value: 4, label: 'Encadena 4 aciertos seguidos', xp: 25 },
      { id: 'a1-2-words', kind: 'words', value: 18, label: 'Escribe 18 palabras en inglés', xp: 15 },
    ],
    nodes: [
      {
        id: 'a1-2-n1',
        kind: 'narrative',
        xp: 5,
        text: 'The [market] is loud. There are [apples], [bread] and old [books] on the tables. Nobody uses [money] here: you pay with the right word.',
        translation:
          'El mercado es ruidoso. Hay manzanas, pan y libros viejos en las mesas. Aquí nadie usa dinero: pagas con la palabra correcta.',
        glossary: [
          { en: 'market', es: 'mercado' },
          { en: 'apples', es: 'manzanas' },
          { en: 'bread', es: 'pan' },
          { en: 'books', es: 'libros' },
          { en: 'money', es: 'dinero' },
        ],
      },
      {
        id: 'a1-2-n2',
        kind: 'gapFill',
        speaker: 'Baker',
        xp: 10,
        prompt: 'I want ___ apple and ___ notebook.',
        promptEs:
          'Completa con «a» o «an». Escribe las dos palabras separadas por un espacio.',
        answers: ['an a'],
        hint: '«an» va delante de sonido vocálico.',
        placeholder: 'an a',
      },
      {
        id: 'a1-2-n3',
        kind: 'writeWord',
        speaker: 'Baker',
        xp: 10,
        prompt: 'The baker holds up seven loaves. Write the number in letters.',
        promptEs: 'Escribe el número 7 con letras, en inglés.',
        answers: ['seven'],
        hint: 'Empieza por s y acaba en -en.',
        placeholder: 'un número…',
      },
      {
        id: 'a1-2-n4',
        kind: 'writeWord',
        xp: 10,
        prompt: 'One apple, two ___. Write the plural.',
        promptEs: 'Escribe el plural de «apple».',
        answers: ['apples'],
        hint: 'Casi todos los plurales regulares acaban en -s.',
        placeholder: 'plural…',
      },
      {
        id: 'a1-2-n5',
        kind: 'writeSentence',
        speaker: 'Baker',
        xp: 20,
        prompt: '"So? What do you want, quiet one?"',
        promptEs:
          'Pide dos cosas al panadero. Usa «I want» y menciona «bread» y «apple» (o «apples»).',
        rubric: {
          minWords: 4,
          requiredKeywords: [['i want', 'i would like'], ['bread'], ['apple', 'apples']],
          checklist: ['Usa «I want» o «I would like»', 'Menciona «bread»', 'Menciona «apple/apples»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Ejemplo de estructura: I want bread and two apples.',
        model: 'I want bread and two apples.',
        placeholder: 'I want…',
        success: 'The baker laughs and puts the bread in your bag. It is warm.',
      },
      {
        id: 'a1-2-n6',
        kind: 'readingCheck',
        xp: 15,
        passage:
          'The bookseller is an old man with a blue hat. He sells maps, notebooks and pens. He does not sell food. His shop closes at six in the evening.',
        prompt: 'What can you buy from the bookseller?',
        promptEs: 'Lee y elige la respuesta correcta.',
        options: [
          { id: 'a', text: 'Bread and apples.', feedback: 'El texto dice que NO vende comida.' },
          { id: 'b', text: 'Maps and notebooks.', correct: true, feedback: 'Sí: maps, notebooks and pens.' },
          { id: 'c', text: 'Hats and coats.', feedback: 'El sombrero azul lo lleva él, no lo vende.' },
        ],
      },
      {
        id: 'a1-2-n7',
        kind: 'writeSentence',
        xp: 20,
        prompt: 'Describe the bookseller in one sentence.',
        promptEs:
          'Describe al librero en una frase: es viejo y lleva un sombrero azul. Usa «He is» y el color.',
        rubric: {
          minWords: 5,
          requiredKeywords: [['he is', "he's"], ['old'], ['blue']],
          checklist: ['Usa «He is»', 'Di que es «old»', 'Menciona el color «blue»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'He is an old man with a blue hat.',
        model: 'He is an old man with a blue hat.',
        placeholder: 'He is…',
      },
      {
        id: 'a1-2-n8',
        kind: 'narrative',
        speaker: 'Mira',
        xp: 5,
        text: '"You wrote four true things today. In Lumen that is a [fortune]. Tomorrow we go to the [gate]."',
        translation:
          '«Hoy has escrito cuatro cosas verdaderas. En Lumen eso es una fortuna. Mañana vamos a la puerta.»',
        glossary: [
          { en: 'fortune', es: 'fortuna' },
          { en: 'gate', es: 'puerta, portón' },
        ],
      },
    ],
  },

  {
    id: 'a1-3',
    level: 'A1',
    order: 3,
    title: 'The Gate of Names',
    titleEs: 'La Puerta de los Nombres',
    summary:
      'La puerta que cierra Lumen sólo se abre a quien sepa describirse a sí mismo. Presente simple, familia y las primeras preguntas.',
    focus: ['Presente simple', 'Familia', 'Preguntas con do/does'],
    goals: [
      { id: 'a1-3-complete', kind: 'complete', label: 'Termina el capítulo', xp: 25 },
      { id: 'a1-3-perfect', kind: 'perfect', value: 5, label: 'Acierta 5 respuestas a la primera', xp: 30 },
      { id: 'a1-3-noreveal', kind: 'noReveal', label: 'Cruza la puerta sin revelar soluciones', xp: 35 },
      { id: 'a1-3-words', kind: 'words', value: 45, label: 'Escribe 45 palabras en inglés', xp: 20 },
    ],
    nodes: [
      {
        id: 'a1-3-n1',
        kind: 'narrative',
        xp: 5,
        text: 'The [gate] is made of black stone. There are no [locks] and no [guards]. On the stone somebody wrote: "Tell me who you are."',
        translation:
          'La puerta es de piedra negra. No hay cerraduras ni guardias. En la piedra alguien escribió: «Dime quién eres.»',
        glossary: [
          { en: 'gate', es: 'puerta, portón' },
          { en: 'locks', es: 'cerraduras' },
          { en: 'guards', es: 'guardias' },
        ],
      },
      {
        id: 'a1-3-n2',
        kind: 'gapFill',
        xp: 10,
        prompt: 'She ___ in the library. (work)',
        promptEs: 'Conjuga «work» en presente simple para «she». Escribe sólo el verbo.',
        answers: ['works'],
        hint: 'Con he/she/it el verbo lleva -s.',
        placeholder: 'verbo…',
      },
      {
        id: 'a1-3-n3',
        kind: 'gapFill',
        xp: 10,
        prompt: '___ you live in Lumen?',
        promptEs: 'Completa la pregunta con el auxiliar correcto. Una sola palabra.',
        answers: ['do'],
        hint: 'Con «you» el auxiliar del presente simple es…',
        placeholder: 'auxiliar…',
      },
      {
        id: 'a1-3-n4',
        kind: 'writeSentence',
        xp: 20,
        prompt: 'The gate waits. Write where you live.',
        promptEs: 'Escribe dónde vives. Usa «I live in» y el nombre de tu ciudad.',
        rubric: {
          minWords: 4,
          requiredKeywords: [['i live in']],
          checklist: ['Usa «I live in…»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'I live in + ciudad.',
        model: 'I live in Lumen.',
        placeholder: 'I live in…',
      },
      {
        id: 'a1-3-n5',
        kind: 'writeSentence',
        xp: 20,
        prompt: 'The gate waits. Write about your family.',
        promptEs:
          'Habla de tu familia en una frase. Usa «I have» y una palabra de familia (brother, sister, mother, father…).',
        rubric: {
          minWords: 4,
          requiredKeywords: [
            ['i have'],
            ['brother', 'brothers', 'sister', 'sisters', 'mother', 'father', 'parents', 'family'],
          ],
          checklist: ['Usa «I have»', 'Menciona a alguien de tu familia'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'I have one sister and two brothers.',
        model: 'I have one sister and two brothers.',
        placeholder: 'I have…',
      },
      {
        id: 'a1-3-n6',
        kind: 'readingCheck',
        xp: 15,
        passage:
          'Mira does not open the gate. She never opens it. She says the gate opens only for people who write the truth about themselves. Many travellers write beautiful lies and the stone stays closed.',
        prompt: 'Why does the gate stay closed for many travellers?',
        promptEs: 'Lee con atención y elige.',
        options: [
          { id: 'a', text: 'Because Mira does not help them.', feedback: 'Mira nunca la abre, pero no es esa la razón.' },
          { id: 'b', text: 'Because they write things that are not true.', correct: true, feedback: 'Eso: "beautiful lies".' },
          { id: 'c', text: 'Because they write too slowly.', feedback: 'El texto no habla de velocidad.' },
        ],
      },
      {
        id: 'a1-3-n7',
        kind: 'writeFree',
        xp: 35,
        prompt: 'Write three true sentences about yourself. The gate is listening.',
        promptEs:
          'Escribe tres frases verdaderas sobre ti (nombre, dónde vives, qué te gusta). Mínimo 20 palabras, en presente simple.',
        rubric: {
          minWords: 20,
          requiredKeywords: [['my name is', 'i am'], ['i live', 'i work', 'i study'], ['i like', 'i love']],
          checklist: [
            'Preséntate: «My name is…» o «I am…»',
            'Di dónde vives, trabajas o estudias',
            'Di algo que te gusta: «I like…»',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Estructura: My name is… / I live in… / I like…',
        model:
          'My name is Ana and I am from Spain. I live in Madrid with my sister. I work in a small hospital near the park. I like old books and long walks in the rain.',
        placeholder: 'My name is…',
        multiline: true,
        success: 'The black stone splits open without a sound. Behind it, a road, and very far away, a city on fire with lamps.',
      },
      {
        id: 'a1-3-n8',
        kind: 'narrative',
        speaker: 'Mira',
        xp: 5,
        text: '"That road goes to [Blackmill]. Somebody there stole the key of my [archive]. If you want your [voice] back, find it."',
        translation:
          '«Ese camino va a Blackmill. Alguien de allí robó la llave de mi archivo. Si quieres recuperar tu voz, encuéntrala.»',
        glossary: [
          { en: 'Blackmill', es: 'Molino Negro (nombre del pueblo)' },
          { en: 'archive', es: 'archivo' },
          { en: 'voice', es: 'voz' },
        ],
      },
    ],
  },
];
