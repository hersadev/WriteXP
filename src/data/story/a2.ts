import type { Chapter } from '@/types';

/**
 * ACTO II — A2 · La Llave Perdida
 * Investigación en Blackmill: narrar en pasado, describir gente y preguntar.
 */
export const A2_CHAPTERS: Chapter[] = [
  {
    id: 'a2-1',
    level: 'A2',
    order: 1,
    title: 'The Night of the Theft',
    titleEs: 'La noche del robo',
    summary:
      'Llegas a Blackmill y reconstruyes lo que pasó la noche del robo. Todo lo que escribas tendrá que ir en pasado.',
    focus: ['Pasado simple', 'Verbos irregulares', 'there was / there were'],
    goals: [
      { id: 'a2-1-complete', kind: 'complete', label: 'Termina el capítulo', xp: 30 },
      { id: 'a2-1-perfect', kind: 'perfect', value: 5, label: 'Acierta 5 respuestas a la primera', xp: 35 },
      { id: 'a2-1-noreveal', kind: 'noReveal', label: 'Sin revelar ninguna solución', xp: 35 },
      { id: 'a2-1-words', kind: 'words', value: 60, label: 'Escribe 60 palabras en inglés', xp: 25 },
    ],
    nodes: [
      {
        id: 'a2-1-n1',
        kind: 'narrative',
        xp: 5,
        text: 'Blackmill smells of wet [wood] and smoke. Last night someone [broke] the window of the archive, [took] the iron key and [disappeared] before dawn. Nobody heard anything.',
        translation:
          'Blackmill huele a madera mojada y humo. Anoche alguien rompió la ventana del archivo, cogió la llave de hierro y desapareció antes del amanecer. Nadie oyó nada.',
        glossary: [
          { en: 'wood', es: 'madera' },
          { en: 'broke', es: 'rompió (break)' },
          { en: 'took', es: 'cogió (take)' },
          { en: 'disappeared', es: 'desapareció' },
        ],
      },
      {
        id: 'a2-1-n2',
        kind: 'gapFill',
        xp: 12,
        prompt: 'Someone ___ the window and ___ the key. (break / take)',
        promptEs:
          'Pon los dos verbos en pasado simple. Escríbelos separados por un espacio.',
        answers: ['broke took'],
        slots: [['broke'], ['took']],
        hint: 'Los dos son irregulares: break → br___, take → t___.',
        placeholder: 'broke took',
      },
      {
        id: 'a2-1-n3',
        kind: 'gapFill',
        xp: 12,
        prompt: '___ three candles on the table and ___ no light in the corridor.',
        promptEs:
          'Completa con «there was» o «there were» (en ese orden, separados por coma).',
        answers: ['there were, there was', 'there were there was'],
        slots: [['there were'], ['there was']],
        hint: 'Plural primero (three candles), singular después (no light).',
        placeholder: 'there were, there was',
      },
      {
        id: 'a2-1-n4',
        kind: 'writeSentence',
        speaker: 'Constable Hale',
        xp: 22,
        prompt: '"Write what you did last night. Everyone here is a suspect, traveller."',
        promptEs:
          'Cuenta qué hiciste anoche. Usa pasado simple y la expresión «last night».',
        rubric: {
          minWords: 8,
          requiredKeywords: [['last night'], ['i was', 'i went', 'i slept', 'i walked', 'i arrived', 'i stayed']],
          forbiddenWords: ['i go', 'i am walking'],
          checklist: ['Incluye «last night»', 'Usa un verbo en pasado («I went», «I was»…)'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Last night I arrived in Blackmill and I slept in the old inn.',
        model: 'Last night I arrived in Blackmill and I slept in the old inn.',
        placeholder: 'Last night I…',
        multiline: true,
      },
      {
        id: 'a2-1-n5',
        kind: 'readingCheck',
        xp: 18,
        passage:
          'The innkeeper closed the door at eleven. At midnight he heard a horse outside, but he did not get up. At two in the morning the rain started. When he opened the archive at seven, the window was broken and the key was gone.',
        prompt: 'What happened at midnight?',
        promptEs: 'Lee y elige la opción correcta.',
        options: [
          { id: 'a', text: 'The rain started.', feedback: 'La lluvia empezó a las dos, no a medianoche.' },
          { id: 'b', text: 'He heard a horse.', correct: true, feedback: 'Exacto: "At midnight he heard a horse".' },
          { id: 'c', text: 'He found the broken window.', feedback: 'Eso fue a las siete de la mañana.' },
        ],
      },
      {
        id: 'a2-1-n6',
        kind: 'writeSentence',
        xp: 22,
        prompt: 'Write one question you want to ask the innkeeper.',
        promptEs:
          'Escribe una pregunta en pasado para el posadero. Empieza por una palabra wh- (what, why, when, where, who) y termina con «?».',
        rubric: {
          minWords: 4,
          requiredKeywords: [['what', 'why', 'when', 'where', 'who', 'how']],
          checklist: ['Empieza con una palabra wh-', 'Termina con signo de interrogación'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Why did you not get up? / What did you hear?',
        model: 'What did you hear last night?',
        placeholder: 'Why did…',
      },
      {
        id: 'a2-1-n7',
        kind: 'writeFree',
        xp: 35,
        prompt: 'Write your first report for Mira. What happened in the archive last night?',
        promptEs:
          'Redacta el informe de los hechos en pasado: mínimo 40 palabras, con al menos dos conectores temporales (first, then, after that, finally).',
        rubric: {
          minWords: 40,
          requiredKeywords: [
            ['first', 'at first'],
            ['then', 'after that', 'later'],
            ['finally', 'in the end', 'at the end'],
          ],
          checklist: ['Usa «first»', 'Usa «then» o «after that»', 'Cierra con «finally» o «in the end»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Ordena los hechos: First, … Then, … Finally, …',
        model:
          'First, someone came to the archive after midnight and broke the small window at the back. Then the thief walked to the desk, opened the wooden box and took the iron key. After that, the rain started and covered the tracks in the mud. Finally, the stranger left the village on a horse before the sun came up.',
        placeholder: 'First, …',
        multiline: true,
      },
    ],
  },

  {
    id: 'a2-2',
    level: 'A2',
    order: 2,
    title: 'Six Witnesses',
    titleEs: 'Seis testigos',
    summary:
      'Seis personas vieron algo esa noche y ninguna coincide. Describe a los sospechosos y compáralos hasta encontrar la contradicción.',
    focus: ['Descripción física', 'Comparativos', 'Ropa y aspecto'],
    goals: [
      { id: 'a2-2-complete', kind: 'complete', label: 'Termina el capítulo', xp: 30 },
      { id: 'a2-2-perfect', kind: 'perfect', value: 5, label: 'Acierta 5 respuestas a la primera', xp: 35 },
      { id: 'a2-2-combo', kind: 'combo', value: 5, label: 'Encadena 5 aciertos seguidos', xp: 30 },
      { id: 'a2-2-words', kind: 'words', value: 70, label: 'Escribe 70 palabras en inglés', xp: 25 },
    ],
    nodes: [
      {
        id: 'a2-2-n1',
        kind: 'narrative',
        xp: 5,
        text: 'Six people saw a [stranger] that night. One says he was [tall] and [thin]. Another says she was short and wore a green [scarf]. Somebody is [lying].',
        translation:
          'Seis personas vieron a un desconocido esa noche. Uno dice que era alto y delgado. Otra dice que era baja y llevaba una bufanda verde. Alguien miente.',
        glossary: [
          { en: 'stranger', es: 'desconocido/a' },
          { en: 'tall', es: 'alto/a' },
          { en: 'thin', es: 'delgado/a' },
          { en: 'scarf', es: 'bufanda' },
          { en: 'lying', es: 'mintiendo' },
        ],
      },
      {
        id: 'a2-2-n2',
        kind: 'gapFill',
        xp: 12,
        prompt: 'The blacksmith is ___ than the baker. (tall)',
        promptEs: 'Escribe el comparativo de «tall». Sólo esa palabra.',
        answers: ['taller'],
        hint: 'Adjetivo corto + -er.',
        placeholder: 'comparativo…',
      },
      {
        id: 'a2-2-n3',
        kind: 'gapFill',
        xp: 12,
        prompt: 'This story is ___ than the first one. (interesting)',
        promptEs: 'Comparativo de «interesting». Escribe las dos palabras.',
        answers: ['more interesting'],
        hint: 'Adjetivo largo: no lleva -er, lleva otra palabra delante.',
        placeholder: 'more…',
      },
      {
        id: 'a2-2-n4',
        kind: 'writeSentence',
        speaker: 'Constable Hale',
        xp: 22,
        prompt: '"Describe the stranger you would look for. Height, hair, clothes."',
        promptEs:
          'Describe físicamente al sospechoso: altura, pelo y ropa. Usa «was» y «wore» o «had».',
        rubric: {
          minWords: 10,
          requiredKeywords: [
            ['was'],
            ['hair'],
            ['wore', 'had', 'was wearing'],
          ],
          checklist: ['Usa «was» para la descripción', 'Menciona el pelo («hair»)', 'Usa «wore», «had» o «was wearing» para la ropa'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'He was tall and had dark hair. He wore a long black coat.',
        model: 'He was tall and had dark hair. He wore a long black coat.',
        placeholder: 'He was…',
        multiline: true,
      },
      {
        id: 'a2-2-n5',
        kind: 'readingCheck',
        xp: 18,
        passage:
          'Witness 1: "The stranger was very tall, taller than the constable." Witness 2: "He was younger than me, maybe twenty." Witness 3: "She was short and quiet." Witness 4: "He wore a coat with no buttons." Witness 5: "He came on a white horse." Witness 6: "There was no horse. He walked."',
        prompt: 'Which two witnesses clearly contradict each other about the same detail?',
        promptEs: '¿Qué dos testigos se contradicen sobre el MISMO detalle?',
        options: [
          { id: 'a', text: 'Witness 1 and Witness 2.', feedback: 'Uno habla de altura y otro de edad: no es el mismo detalle.' },
          { id: 'b', text: 'Witness 5 and Witness 6.', correct: true, feedback: 'Uno dice que vino a caballo y el otro que vino andando.' },
          { id: 'c', text: 'Witness 3 and Witness 4.', feedback: 'Una habla de estatura y el otro del abrigo.' },
        ],
      },
      {
        id: 'a2-2-n6',
        kind: 'writeSentence',
        xp: 22,
        prompt: 'Compare two of the witnesses.',
        promptEs:
          'Compara a dos testigos en una frase. Usa un comparativo con «than» (more reliable than, taller than, older than…).',
        rubric: {
          minWords: 6,
          requiredKeywords: [['than']],
          checklist: ['Usa una comparación con «than»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Witness 5 is less reliable than witness 6.',
        model: 'Witness 5 is less reliable than witness 6.',
        placeholder: 'Witness … is … than …',
      },
      {
        id: 'a2-2-n7',
        kind: 'writeFree',
        xp: 35,
        prompt: 'Write the description that will be nailed to every door in Blackmill.',
        promptEs:
          'Escribe el cartel de búsqueda: mínimo 45 palabras describiendo a la persona buscada (aspecto, ropa, qué hizo y dónde se la vio).',
        rubric: {
          minWords: 45,
          requiredKeywords: [
            ['tall', 'short', 'young', 'old'],
            ['wore', 'was wearing', 'had'],
            ['last seen', 'someone saw', 'people saw', 'was seen'],
          ],
          checklist: [
            'Describe la altura o la edad',
            'Describe la ropa con «wore» / «was wearing»',
            'Di dónde se la vio por última vez',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Empieza por «Wanted…», describe con «was» y «wore», y cierra con «was last seen…».',
        model:
          'Wanted by the constable of Blackmill. The person we are looking for is a tall young man with dark hair and a thin face. He wore a long black coat with no buttons and heavy boots. He was last seen near the old bridge at midnight, walking towards the river. Anyone with information must speak to Constable Hale.',
        placeholder: 'WANTED. A…',
        multiline: true,
      },
    ],
  },

  {
    id: 'a2-3',
    level: 'A2',
    order: 3,
    title: 'The Road to the Mill',
    titleEs: 'El camino al molino',
    summary:
      'La pista lleva al molino abandonado. Nadie te acompaña, así que tendrás que pedir indicaciones y escribirlas tú mismo.',
    focus: ['Direcciones', 'Preposiciones de lugar', 'Futuro con going to'],
    goals: [
      { id: 'a2-3-complete', kind: 'complete', label: 'Termina el capítulo', xp: 35 },
      { id: 'a2-3-perfect', kind: 'perfect', value: 5, label: 'Acierta 5 respuestas a la primera', xp: 35 },
      { id: 'a2-3-noreveal', kind: 'noReveal', label: 'Llega al molino sin revelar soluciones', xp: 40 },
      { id: 'a2-3-words', kind: 'words', value: 75, label: 'Escribe 75 palabras en inglés', xp: 30 },
    ],
    nodes: [
      {
        id: 'a2-3-n1',
        kind: 'narrative',
        xp: 5,
        text: 'The old mill stands [behind] the hill, [across] the river, at the end of a road that no map shows. You must ask, and you must write down every [direction] correctly.',
        translation:
          'El viejo molino está detrás de la colina, al otro lado del río, al final de un camino que ningún mapa muestra. Tienes que preguntar, y anotar cada indicación correctamente.',
        glossary: [
          { en: 'behind', es: 'detrás de' },
          { en: 'across', es: 'al otro lado de' },
          { en: 'direction', es: 'indicación' },
        ],
      },
      {
        id: 'a2-3-n2',
        kind: 'gapFill',
        xp: 12,
        prompt: 'Go straight and turn ___ at the church. The mill is ___ the bridge.',
        promptEs:
          'Completa: primero una dirección (left/right) y luego una preposición que signifique «al otro lado de». Separadas por un espacio.',
        answers: ['left across', 'right across'],
        slots: [['left', 'right'], ['across']],
        hint: 'La segunda palabra aparece en el glosario del texto anterior.',
        placeholder: 'left across',
      },
      {
        id: 'a2-3-n3',
        kind: 'gapFill',
        xp: 12,
        prompt: 'I ___ walk to the mill tonight. (going to)',
        promptEs: 'Completa con el futuro «going to» para «I». Escribe las tres palabras.',
        answers: ['am going to'],
        hint: 'Verbo to be + going to.',
        placeholder: 'am going to',
      },
      {
        id: 'a2-3-n4',
        kind: 'writeSentence',
        speaker: 'Girl at the well',
        xp: 22,
        prompt: '"Ask me properly and I will tell you the way."',
        promptEs:
          'Pregunta educadamente cómo llegar al molino. Usa «how do I get to» o «could you tell me» y termina con «?».',
        rubric: {
          minWords: 6,
          requiredKeywords: [['how do i get to', 'could you tell me', 'how can i get to']],
          checklist: ['Usa una fórmula de pregunta educada', 'Termina con «?»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Excuse me, how do I get to the mill?',
        model: 'Excuse me, how do I get to the mill?',
        placeholder: 'Excuse me, how…',
      },
      {
        id: 'a2-3-n5',
        kind: 'readingCheck',
        xp: 18,
        passage:
          'Take the road behind the church. Do not cross the first bridge: it is broken. Walk along the river for twenty minutes until you see a dead tree. Turn right there. The mill is behind the hill, opposite an empty house.',
        prompt: 'What must you NOT do?',
        promptEs: '¿Qué NO debes hacer, según las indicaciones?',
        options: [
          { id: 'a', text: 'Walk along the river.', feedback: 'Eso sí hay que hacerlo, durante veinte minutos.' },
          { id: 'b', text: 'Cross the first bridge.', correct: true, feedback: 'Correcto: "Do not cross the first bridge: it is broken".' },
          { id: 'c', text: 'Turn right at the dead tree.', feedback: 'Eso es exactamente lo que pide el texto.' },
        ],
      },
      {
        id: 'a2-3-n6',
        kind: 'writeFree',
        xp: 40,
        prompt: 'Write the directions in your notebook, in your own words.',
        promptEs:
          'Reescribe las indicaciones con tus palabras: mínimo 50 palabras, con al menos dos preposiciones de lugar y una instrucción en imperativo.',
        rubric: {
          minWords: 50,
          requiredKeywords: [
            ['behind', 'opposite', 'along', 'across', 'next to', 'between'],
            ['turn', 'walk', 'take', 'go'],
            ['until', 'when', 'after'],
          ],
          checklist: [
            'Usa preposiciones de lugar (behind, along, opposite…)',
            'Usa imperativos (turn, walk, take, go)',
            'Enlaza pasos con «until», «when» o «after»',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Encadena pasos: Take… behind… / Walk along… until… / Turn right…',
        model:
          'Take the narrow road behind the church and leave the market on your left. Do not cross the first bridge, because it is broken and dangerous. Walk along the river for about twenty minutes until you see a dead tree with white branches. Turn right there and follow the path up the hill. The old mill is opposite an empty house with no roof.',
        placeholder: 'Take the road…',
        multiline: true,
      },
      {
        id: 'a2-3-n7',
        kind: 'choice',
        xp: 8,
        prompt: 'There is a light inside the mill. Somebody is awake.',
        promptEs: 'Elige cómo entrar. Las dos opciones continúan la historia.',
        options: [
          { id: 'knock', text: 'Knock on the door.', feedback: 'The light goes out. Then, slowly, the door opens.' },
          { id: 'window', text: 'Look through the window first.', feedback: 'Inside, a woman is copying pages by candlelight. She has the iron key around her neck.' },
        ],
      },
      {
        id: 'a2-3-n8',
        kind: 'narrative',
        speaker: 'The copyist',
        xp: 8,
        text: '"I did not steal the key. I [borrowed] it. There is a book in that archive that the Guild does not want anyone to [read]. Come with me to the city, and I will [prove] it."',
        translation:
          '«No robé la llave. La tomé prestada. Hay un libro en ese archivo que el Gremio no quiere que nadie lea. Ven conmigo a la ciudad y te lo demostraré.»',
        glossary: [
          { en: 'borrowed', es: 'tomé prestado' },
          { en: 'read', es: 'leer' },
          { en: 'prove', es: 'demostrar' },
        ],
      },
    ],
  },
];
