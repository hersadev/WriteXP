import type { Chapter } from '@/types';

/**
 * ACTO III — B1 · El Gremio de las Palabras
 * Ya no basta con narrar hechos: hay que opinar, justificar y enlazar ideas.
 */
export const B1_CHAPTERS: Chapter[] = [
  {
    id: 'b1-1',
    level: 'B1',
    order: 1,
    title: 'The Guild Trial',
    titleEs: 'La prueba del Gremio',
    summary:
      'El Gremio sólo admite a quien sepa defender una idea por escrito. Tu examen de ingreso es una opinión razonada, y hay tres maestros esperando para desmontarla.',
    focus: ['Opinión razonada', 'Conectores', 'Presente perfecto'],
    goals: [
      { id: 'b1-1-complete', kind: 'complete', label: 'Termina el capítulo', xp: 40 },
      { id: 'b1-1-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 40 },
      { id: 'b1-1-noreveal', kind: 'noReveal', label: 'Aprueba sin revelar soluciones', xp: 45 },
      { id: 'b1-1-words', kind: 'words', value: 120, label: 'Escribe 120 palabras en inglés', xp: 35 },
    ],
    nodes: [
      {
        id: 'b1-1-n1',
        kind: 'narrative',
        xp: 8,
        text: 'The Guild hall is colder than the street. Three masters sit behind a long table. "We have read [thousands] of applications," says the first one. "Most of them were [honest]. Almost none were [convincing]. Being right is not enough here: you have to [argue]."',
        translation:
          'La sala del Gremio está más fría que la calle. Tres maestros se sientan tras una mesa larga. «Hemos leído miles de solicitudes», dice el primero. «Casi todas eran honestas. Casi ninguna, convincente. Aquí no basta con tener razón: hay que argumentar.»',
        glossary: [
          { en: 'thousands', es: 'miles' },
          { en: 'honest', es: 'honesto/a, sincero/a' },
          { en: 'convincing', es: 'convincente' },
          { en: 'argue', es: 'argumentar' },
        ],
      },
      {
        id: 'b1-1-n2',
        kind: 'gapFill',
        xp: 15,
        prompt: 'I ___ ___ in this city for six years. (live)',
        promptEs:
          'Presente perfecto de «live» con «I». Escribe las dos palabras (auxiliar + participio).',
        answers: ['have lived'],
        hint: 'have/has + participio.',
        placeholder: 'have lived',
      },
      {
        id: 'b1-1-n3',
        kind: 'gapFill',
        xp: 15,
        prompt: 'The rule is unfair. ___, most members still defend it.',
        promptEs:
          'Conector de contraste que puede ir al inicio de la frase seguido de coma: «sin embargo».',
        answers: ['however', 'nevertheless'],
        hint: 'Empieza por H y tiene siete letras.',
        placeholder: 'conector…',
      },
      {
        id: 'b1-1-n4',
        kind: 'readingCheck',
        xp: 20,
        passage:
          'Master Orin argues that the archive should stay closed. He admits that citizens have a right to information, but he believes that some books are dangerous in untrained hands. He has proposed a compromise: open the archive, but only to people who have completed the Guild training.',
        prompt: 'What is Master Orin\'s actual position?',
        promptEs: 'Lee el párrafo y elige la interpretación correcta.',
        options: [
          { id: 'a', text: 'He is completely against opening the archive.', feedback: 'Ha propuesto una solución intermedia, así que no está en contra del todo.' },
          { id: 'b', text: 'He accepts opening it, but with conditions.', correct: true, feedback: 'Eso es: admite el derecho y propone un "compromise".' },
          { id: 'c', text: 'He thinks anyone should read any book.', feedback: 'Justo lo contrario: teme los libros en manos no formadas.' },
        ],
      },
      {
        id: 'b1-1-n5',
        kind: 'writeSentence',
        speaker: 'Master Orin',
        xp: 25,
        prompt: '"State your opinion about the archive. One sentence. Justify it."',
        promptEs:
          'Da tu opinión sobre si el archivo debe abrirse, y justifícala en la misma frase con «because».',
        rubric: {
          minWords: 12,
          requiredKeywords: [
            ['i think', 'i believe', 'in my opinion', 'i would argue'],
            ['because', 'since', 'as'],
          ],
          forbiddenWords: ['is very good', 'is very bad'],
          checklist: ['Introduce la opinión («I think», «In my opinion»…)', 'Justifícala con «because» o «since»'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'In my opinion the archive should be open because knowledge belongs to everyone.',
        model: 'In my opinion the archive should be open because knowledge belongs to everyone.',
        placeholder: 'In my opinion…',
        multiline: true,
      },
      {
        id: 'b1-1-n6',
        kind: 'writeFree',
        xp: 50,
        prompt: 'Write your entrance argument. The masters are reading over your shoulder.',
        promptEs:
          'Escribe tu argumentación de ingreso: mínimo 90 palabras. Presenta tu postura, da una razón, admite una objeción y cierra con una conclusión.',
        rubric: {
          minWords: 90,
          requiredKeywords: [
            ['firstly', 'first of all', 'to begin with'],
            ['however', 'although', 'even though', 'on the other hand'],
            ['for example', 'for instance'],
            ['in conclusion', 'to sum up', 'overall'],
          ],
          checklist: [
            'Abre con «Firstly» o «To begin with»',
            'Introduce una objeción con «However» o «Although»',
            'Da un ejemplo con «For example»',
            'Cierra con «In conclusion» o «To sum up»',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Firstly, … For example, … However, some people claim that … In conclusion, …',
        model:
          'Firstly, I believe that the archive of Lumen should remain open to every citizen, and not only to members of the Guild. Knowledge that is kept behind a locked door stops being knowledge and becomes property. For example, the maps of the old river were hidden for thirty years, and during that time two villages were built in places that flood every spring. However, I accept that some documents are fragile and that a crowd of careless readers could destroy them in a single afternoon. That is a practical problem, not a reason to close the building. In conclusion, the Guild should protect the paper and share the words.',
        placeholder: 'Firstly, …',
        multiline: true,
        success:
          'The masters do not applaud. But Orin writes your name on a card and slides it across the table. You are in, on probation.',
      },
    ],
  },

  {
    id: 'b1-2',
    level: 'B1',
    order: 2,
    title: 'The Letter',
    titleEs: 'La carta',
    summary:
      'El archivo se cierra dentro de una semana. La única forma de pararlo es una carta al Consejo, y tú eres quien la escribe.',
    focus: ['Registro formal', 'Carta estructurada', 'Voz pasiva'],
    goals: [
      { id: 'b1-2-complete', kind: 'complete', label: 'Termina el capítulo', xp: 40 },
      { id: 'b1-2-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 40 },
      { id: 'b1-2-combo', kind: 'combo', value: 4, label: 'Encadena 4 aciertos seguidos', xp: 35 },
      { id: 'b1-2-words', kind: 'words', value: 140, label: 'Escribe 140 palabras en inglés', xp: 40 },
    ],
    nodes: [
      {
        id: 'b1-2-n1',
        kind: 'narrative',
        xp: 8,
        text: 'The copyist has been [arrested]. The archive will be [sealed] on Friday. "A letter," Mira says, "is the slowest weapon in the world. It is also the only one they cannot [ignore] without leaving a [record]."',
        translation:
          'La copista ha sido detenida. El archivo será sellado el viernes. «Una carta», dice Mira, «es el arma más lenta del mundo. También es la única que no pueden ignorar sin dejar constancia.»',
        glossary: [
          { en: 'arrested', es: 'detenida' },
          { en: 'sealed', es: 'sellado' },
          { en: 'ignore', es: 'ignorar' },
          { en: 'record', es: 'registro, constancia' },
        ],
      },
      {
        id: 'b1-2-n2',
        kind: 'gapFill',
        xp: 15,
        prompt: 'The archive ___ ___ next Friday. (seal — voz pasiva, futuro)',
        promptEs:
          'Pasiva en futuro: escribe las tres palabras que faltan («will…»).',
        answers: ['will be sealed'],
        hint: 'will + be + participio.',
        placeholder: 'will be sealed',
      },
      {
        id: 'b1-2-n3',
        kind: 'gapFill',
        xp: 15,
        prompt: 'I am writing ___ ___ ___ the decision to close the archive.',
        promptEs:
          'Fórmula formal para «en relación con / con respecto a». Tres palabras que empiezan por "with".',
        answers: ['with regard to', 'with respect to'],
        hint: 'with r_____ to',
        placeholder: 'with regard to',
      },
      {
        id: 'b1-2-n4',
        kind: 'readingCheck',
        xp: 20,
        passage:
          'Dear Sir or Madam, I am writing to express my concern about the closure of the public archive. I understand that the Council is worried about security. Nevertheless, I would like to suggest an alternative which protects both the documents and the right of citizens to consult them. I look forward to hearing from you. Yours faithfully, …',
        prompt: 'Which feature makes this letter formal?',
        promptEs: '¿Qué rasgo hace formal esta carta?',
        options: [
          { id: 'a', text: 'It uses contractions and short sentences.', feedback: 'No hay ni una contracción: eso es justo lo contrario.' },
          { id: 'b', text: 'It uses fixed formulas and no contractions.', correct: true, feedback: 'Sí: "I am writing to…", "Yours faithfully", sin contracciones.' },
          { id: 'c', text: 'It attacks the Council directly.', feedback: 'Al revés: reconoce la preocupación del Consejo antes de rebatir.' },
        ],
      },
      {
        id: 'b1-2-n5',
        kind: 'writeSentence',
        xp: 25,
        prompt: 'Write the opening line of your letter.',
        promptEs:
          'Escribe la primera frase de la carta: di por qué escribes. Usa «I am writing to…» y evita contracciones.',
        rubric: {
          minWords: 10,
          requiredKeywords: [['i am writing to']],
          forbiddenWords: ["i'm", "don't", "can't", 'hi', 'hey'],
          checklist: ['Usa «I am writing to…»', 'Sin contracciones ni saludos informales'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'I am writing to express my concern about the closure of the public archive.',
        model: 'I am writing to express my concern about the closure of the public archive.',
        placeholder: 'I am writing to…',
        multiline: true,
      },
      {
        id: 'b1-2-n6',
        kind: 'writeFree',
        xp: 55,
        prompt: 'Write the letter to the Council. It leaves at dawn.',
        promptEs:
          'Redacta la carta completa: mínimo 110 palabras, con apertura formal, motivo, una concesión al Consejo, una propuesta alternativa y cierre formal.',
        rubric: {
          minWords: 110,
          requiredKeywords: [
            ['dear sir or madam', 'dear members', 'dear council'],
            ['i am writing to'],
            ['i understand that', 'i appreciate that', 'i am aware that'],
            ['i would like to suggest', 'i would propose', 'i would recommend'],
            ['yours faithfully', 'yours sincerely'],
          ],
          forbiddenWords: ["i'm", "don't", "can't", "it's", 'hey'],
          checklist: [
            'Encabezado formal («Dear Sir or Madam»)',
            'Motivo: «I am writing to…»',
            'Concesión: «I understand that…»',
            'Propuesta: «I would like to suggest…»',
            'Despedida: «Yours faithfully»',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'Dear Sir or Madam, / I am writing to… / I understand that… / I would like to suggest… / Yours faithfully,',
        model:
          'Dear Sir or Madam, I am writing to express my concern about the decision to close the public archive of Lumen at the end of this week. I understand that the Council is worried about the security of the documents, and I agree that the recent theft was a serious failure. Nevertheless, closing the building punishes the readers instead of the thief. I would like to suggest a different solution. The most fragile manuscripts could be moved to a locked room, while the rest of the collection stays available to any citizen who registers at the door. This would protect the papers without taking away a right that this city has defended for two hundred years. I look forward to hearing from you. Yours faithfully, a citizen of Lumen.',
        placeholder: 'Dear Sir or Madam,',
        multiline: true,
      },
    ],
  },

  {
    id: 'b1-3',
    level: 'B1',
    order: 3,
    title: 'Two Futures',
    titleEs: 'Dos futuros',
    summary:
      'El Consejo te da a elegir entre dos versiones del informe. Cada una abre un futuro distinto para la ciudad, y tienes que escribir las consecuencias de ambas.',
    focus: ['Condicionales 1 y 2', 'Consecuencias', 'Hipótesis'],
    goals: [
      { id: 'b1-3-complete', kind: 'complete', label: 'Termina el capítulo', xp: 45 },
      { id: 'b1-3-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 40 },
      { id: 'b1-3-noreveal', kind: 'noReveal', label: 'Decide sin revelar soluciones', xp: 45 },
      { id: 'b1-3-words', kind: 'words', value: 150, label: 'Escribe 150 palabras en inglés', xp: 45 },
    ],
    nodes: [
      {
        id: 'b1-3-n1',
        kind: 'narrative',
        xp: 8,
        text: 'Two documents on the table. One [protects] the Guild and buries the copyist. The other tells the [truth] and turns half the city against you. "Whatever you write," Orin says, "will become what [happened]."',
        translation:
          'Dos documentos sobre la mesa. Uno protege al Gremio y entierra a la copista. El otro cuenta la verdad y pone a media ciudad en tu contra. «Escribas lo que escribas», dice Orin, «se convertirá en lo que ocurrió.»',
        glossary: [
          { en: 'protects', es: 'protege' },
          { en: 'truth', es: 'verdad' },
          { en: 'happened', es: 'ocurrió' },
        ],
      },
      {
        id: 'b1-3-n2',
        kind: 'gapFill',
        xp: 15,
        prompt: 'If the Council reads this, they ___ ___ the archive. (close)',
        promptEs:
          'Primer condicional: escribe las dos palabras que faltan.',
        answers: ['will close'],
        hint: 'If + presente, … will + infinitivo.',
        placeholder: 'will close',
      },
      {
        id: 'b1-3-n3',
        kind: 'gapFill',
        xp: 15,
        prompt: 'If I ___ you, I ___ tell the truth. (be / would)',
        promptEs:
          'Segundo condicional. Escribe las dos palabras separadas por un espacio.',
        answers: ['were would', 'was would'],
        hint: 'La forma culta del segundo condicional usa "were" para todas las personas.',
        placeholder: 'were would',
      },
      {
        id: 'b1-3-n4',
        kind: 'writeSentence',
        xp: 25,
        prompt: 'Write the consequence of publishing the truth.',
        promptEs:
          'Escribe qué pasará si publicas la verdad. Usa el primer condicional (if + presente, will + infinitivo).',
        rubric: {
          minWords: 10,
          requiredKeywords: [['if'], ['will', 'is going to']],
          checklist: ['Empieza con «If…»', 'Usa «will» en la consecuencia'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'If we publish the report, the Guild will lose its authority over the archive.',
        model: 'If we publish the report, the Guild will lose its authority over the archive.',
        placeholder: 'If we publish…',
        multiline: true,
      },
      {
        id: 'b1-3-n5',
        kind: 'writeSentence',
        xp: 25,
        prompt: 'Now imagine you were a member of the Council. What would you do?',
        promptEs:
          'Hipótesis: qué harías si fueras miembro del Consejo. Usa el segundo condicional (if + pasado, would + infinitivo).',
        rubric: {
          minWords: 10,
          requiredKeywords: [['if i were', 'if i was'], ['would']],
          checklist: ['Empieza con «If I were…»', 'Usa «would» en la consecuencia'],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'If I were a member of the Council, I would open the archive to everyone.',
        model: 'If I were a member of the Council, I would open the archive to everyone.',
        placeholder: 'If I were…',
        multiline: true,
      },
      {
        id: 'b1-3-n6',
        kind: 'choice',
        xp: 10,
        prompt: 'Which report do you sign?',
        promptEs: 'Elige. Las dos opciones continúan la historia, con distinto tono.',
        options: [
          { id: 'truth', text: 'The one with the truth.', feedback: 'Orin closes his eyes for a long moment. "Then we will both need a very good lawyer."' },
          { id: 'guild', text: 'The one that protects the Guild.', feedback: 'Orin signs beneath your name. "You have chosen the safe road. It is longer than it looks."' },
        ],
      },
      {
        id: 'b1-3-n7',
        kind: 'writeFree',
        xp: 60,
        prompt: 'Justify your decision. This page will be read for a hundred years.',
        promptEs:
          'Justifica tu decisión: mínimo 120 palabras. Explica las consecuencias reales (condicional 1), la alternativa que descartaste (condicional 2) y cierra con tu postura.',
        rubric: {
          minWords: 120,
          requiredKeywords: [
            ['if'],
            ['will', 'is going to'],
            ['would'],
            ['on the other hand', 'however', 'although', 'even though'],
            ['in conclusion', 'to sum up', 'overall', 'in the end'],
          ],
          checklist: [
            'Plantea una condición con «If…»',
            'Consecuencia real con «will»',
            'Alternativa hipotética con «would»',
            'Contrasta con «However» / «On the other hand»',
            'Cierra con «In conclusion» o similar',
          ],
          requireCapitalStart: true,
          requireFinalPunctuation: true,
        },
        hint: 'If we publish…, the Guild will… However, if I were…, I would… In conclusion, …',
        model:
          'I have decided to sign the report that tells the truth about the archive, and I want to explain why. If the Council reads this document, it will learn that the key was never stolen for profit, and that a copyist risked her freedom to protect a book. The Guild will lose some of its authority, and I will probably lose the place that I was given last month. However, a false report would follow this city for a hundred years. If I were only thinking about my own safety, I would sign the other version tonight and sleep very well. The problem is that somebody would read it in fifty years and believe it. In conclusion, I prefer to be uncomfortable now rather than dishonest forever.',
        placeholder: 'I have decided to…',
        multiline: true,
        success:
          'Your report leaves the Guild at midnight. Three days later, the Council of Aeloria sends for you by name.',
      },
    ],
  },
];
