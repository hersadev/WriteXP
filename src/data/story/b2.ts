import type { Chapter } from '@/types';

/**
 * ACTO IV — B2 · El Consejo de Aeloria
 * Registro formal, matiz y precisión. Aquí se puntúa el estilo, no sólo el acierto.
 */
export const B2_CHAPTERS: Chapter[] = [
  {
    id: 'b2-1',
    level: 'B2',
    order: 1,
    title: 'The Council Report',
    titleEs: 'El informe del Consejo',
    summary:
      'Te encargan el informe oficial sobre el archivo. Ochenta personas lo leerán buscando una sola palabra imprecisa para tumbarlo.',
    focus: ['Registro formal', 'Nominalización', 'Voz pasiva', 'Precisión léxica'],
    goals: [
      { id: 'b2-1-complete', kind: 'complete', label: 'Termina el capítulo', xp: 55 },
      { id: 'b2-1-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 50 },
      { id: 'b2-1-noreveal', kind: 'noReveal', label: 'Entrega el informe sin revelar soluciones', xp: 55 },
      { id: 'b2-1-words', kind: 'words', value: 200, label: 'Escribe 200 palabras en inglés', xp: 55 },
    ],
    nodes: [
      {
        id: 'b2-1-n1',
        kind: 'narrative',
        xp: 10,
        text: 'The Council chamber was built to make people feel small, and it [succeeds]. "We are not interested in your feelings about the archive," says the Chancellor. "We are interested in a document that cannot be [misquoted], [dismissed] or turned against us. Write that."',
        translation:
          'La sala del Consejo se construyó para que uno se sienta pequeño, y lo consigue. «No nos interesan tus sentimientos sobre el archivo», dice la Canciller. «Nos interesa un documento que no se pueda citar fuera de contexto, desestimar ni volver contra nosotros. Escribe eso.»',
        glossary: [
          { en: 'succeeds', es: 'lo consigue' },
          { en: 'misquoted', es: 'citado fuera de contexto' },
          { en: 'dismissed', es: 'desestimado' },
        ],
      },
      {
        id: 'b2-1-n2',
        kind: 'gapFill',
        xp: 18,
        prompt: 'Informal: "They decided to close it." → Formal: "The ___ to close it was taken by the Council."',
        promptEs:
          'Nominalización: convierte el verbo «decided» en el sustantivo correspondiente. Una palabra.',
        answers: ['decision'],
        hint: 'decide → dec_____',
        placeholder: 'sustantivo…',
      },
      {
        id: 'b2-1-n3',
        kind: 'gapFill',
        xp: 18,
        prompt: 'The evidence ___ ___ ___ by an independent committee before publication.',
        promptEs:
          'Pasiva con modal: «debe ser revisada». Escribe las tres palabras (must…).',
        answers: ['must be reviewed', 'should be reviewed', 'must be examined'],
        hint: 'modal + be + participio.',
        placeholder: 'tres palabras…',
      },
      {
        id: 'b2-1-n4',
        kind: 'readingCheck',
        xp: 25,
        passage:
          'Draft A: "The Guild messed up badly and everyone knows it." Draft B: "The Guild\'s handling of the incident has been widely criticised, and several of its procedures appear to require revision." Both drafts describe the same events.',
        prompt: 'Why is Draft B more useful in a formal report?',
        promptEs: '¿Por qué el borrador B funciona mejor en un informe formal?',
        options: [
          { id: 'a', text: 'Because it is longer.', feedback: 'La longitud por sí sola no aporta nada.' },
          { id: 'b', text: 'Because it hedges the claim and is harder to dismiss as an insult.', correct: true, feedback: 'Exacto: «has been widely criticised», «appear to require» son matices que blindan la afirmación.' },
          { id: 'c', text: 'Because it hides the criticism completely.', feedback: 'No la esconde: la formula de manera defendible.' },
        ],
      },
      {
        id: 'b2-1-n5',
        kind: 'writeSentence',
        xp: 30,
        prompt: 'Rewrite this line for the Council: "The Guild messed up badly and everyone knows it."',
        promptEs:
          'Reescribe la frase en registro formal: usa una pasiva y un atenuador («appears to», «is widely regarded as», «has been criticised»). Nada de coloquialismos.',
        rubric: {
          minWords: 14,
          requiredKeywords: [
            ['has been', 'have been', 'was', 'were', 'is widely', 'are widely'],
            ['appears to', 'appear to', 'seems to', 'widely', 'arguably', 'to some extent'],
          ],
          forbiddenWords: ['messed up', 'everyone knows', 'a lot of', 'stuff', 'bad'],
          checklist: [
            'Usa una construcción pasiva',
            'Introduce un atenuador («appears to», «widely», «arguably»)',
            'Elimina el registro coloquial',
          ],
          requireCapitalStart: true,
        },
        hint:
          "The Guild's handling of the incident has been widely criticised and several procedures appear to require revision.",
        model:
          "The Guild's handling of the incident has been widely criticised and several procedures appear to require revision.",
        placeholder: "The Guild's handling…",
        multiline: true,
      },
      {
        id: 'b2-1-n6',
        kind: 'writeFree',
        xp: 65,
        prompt: 'Write the executive summary of your report.',
        promptEs:
          'Redacta el resumen ejecutivo: mínimo 150 palabras. Contexto, hallazgos con voz pasiva, matices y una recomendación clara. Registro formal, sin contracciones.',
        rubric: {
          minWords: 150,
          maxWords: 320,
          requiredKeywords: [
            ['this report', 'the present report', 'the purpose of this report'],
            ['has been', 'have been', 'was found', 'were found', 'it was established'],
            ['furthermore', 'moreover', 'in addition'],
            ['it is recommended', 'we recommend', 'this report recommends'],
          ],
          forbiddenWords: ["don't", "doesn't", "it's", "can't", 'a lot of', 'stuff'],
          checklist: [
            'Presenta el documento («This report…»)',
            'Expón hallazgos en pasiva («was found», «has been…»)',
            'Añade información con «Furthermore» o «Moreover»',
            'Cierra con una recomendación explícita',
            'Sin contracciones ni coloquialismos',
          ],
          requireCapitalStart: true,
        },
        hint: 'This report examines… / It was established that… / Furthermore,… / It is recommended that…',
        model:
          'This report examines the security of the public archive of Lumen following the incident of the fourteenth of this month, and sets out the measures that the Council may wish to adopt. The investigation was carried out over eleven days and included interviews with nine witnesses.\n\nIt was established that the rear window had been left unrepaired since the previous winter, despite two written requests from the keeper of the archive. The iron key was found to be stored in an unlocked wooden box in the main room, a practice that has been in place for at least a decade. No document has been reported missing.\n\nFurthermore, the current register of visitors has been kept irregularly, which makes it impossible to determine who entered the building during the week before the incident. Several procedures therefore appear to require revision rather than replacement.\n\nIt is recommended that the window be repaired immediately, that the key be held in a locked cabinet under the responsibility of a named officer, and that the visitor register be completed daily. Closure of the archive is not considered proportionate to the risk identified.',
        placeholder: 'This report examines…',
        multiline: true,
      },
    ],
  },

  {
    id: 'b2-2',
    level: 'B2',
    order: 2,
    title: 'The Counter-Argument',
    titleEs: 'La réplica',
    summary:
      'La Canciller ha publicado una réplica demoledora a tu informe. Tienes una noche para responder sin perder la compostura ni el rigor.',
    focus: ['Concesión y refutación', 'Estilo indirecto', 'Cohesión'],
    goals: [
      { id: 'b2-2-complete', kind: 'complete', label: 'Termina el capítulo', xp: 55 },
      { id: 'b2-2-perfect', kind: 'perfect', value: 4, label: 'Acierta 4 respuestas a la primera', xp: 50 },
      { id: 'b2-2-combo', kind: 'combo', value: 4, label: 'Encadena 4 aciertos seguidos', xp: 45 },
      { id: 'b2-2-words', kind: 'words', value: 220, label: 'Escribe 220 palabras en inglés', xp: 60 },
    ],
    nodes: [
      {
        id: 'b2-2-n1',
        kind: 'narrative',
        xp: 10,
        text: 'The Chancellor\'s reply is printed on every wall by morning. It is [ruthless], well written and, in two places, [accurate]. Mira reads it twice. "Never refute what is true," she says. "[Concede] it, and then show why it does not [matter]."',
        translation:
          'La réplica de la Canciller amanece impresa en todas las paredes. Es despiadada, está bien escrita y, en dos puntos, es exacta. Mira la lee dos veces. «Nunca refutes lo que es cierto», dice. «Concédelo, y luego demuestra por qué no cambia nada.»',
        glossary: [
          { en: 'ruthless', es: 'despiadada' },
          { en: 'accurate', es: 'exacta, certera' },
          { en: 'Concede', es: 'concede, admite' },
          { en: 'matter', es: 'importar' },
        ],
      },
      {
        id: 'b2-2-n2',
        kind: 'gapFill',
        xp: 18,
        prompt: 'Direct: "I will publish the evidence." → Reported: She said that she ___ ___ the evidence.',
        promptEs:
          'Estilo indirecto: transforma «will publish». Escribe las dos palabras.',
        answers: ['would publish'],
        hint: 'will → w_____ en estilo indirecto.',
        placeholder: 'dos palabras…',
      },
      {
        id: 'b2-2-n3',
        kind: 'gapFill',
        xp: 18,
        prompt: '___ the Chancellor raises a valid point, her conclusion does not follow from it.',
        promptEs:
          'Conector de concesión al inicio de la frase (una palabra): «aunque / si bien».',
        answers: ['although', 'while', 'whilst', 'though'],
        hint: 'Empieza por A y tiene ocho letras.',
        placeholder: 'conector…',
      },
      {
        id: 'b2-2-n4',
        kind: 'writeSentence',
        xp: 30,
        prompt: 'Concede her strongest point, then neutralise it. One sentence.',
        promptEs:
          'Escribe una frase de concesión + refutación: admite su mejor argumento y explica por qué no invalida tu tesis. Usa «Although» o «While» y un contraste.',
        rubric: {
          minWords: 18,
          requiredKeywords: [
            ['although', 'while', 'whilst', 'admittedly', 'granted that'],
            ['nevertheless', 'nonetheless', 'this does not', 'it does not follow', 'even so'],
          ],
          forbiddenWords: ['she is wrong', 'stupid', 'nonsense'],
          checklist: [
            'Concede con «Although» / «While» / «Admittedly»',
            'Refuta con «Nevertheless» / «this does not…»',
            'Sin descalificaciones personales',
          ],
          requireCapitalStart: true,
        },
        hint:
          'Although the Chancellor is right that the archive lacks security, this does not justify closing it to the public.',
        model:
          'Although the Chancellor is right that the archive lacks security, this does not justify closing it to the public.',
        placeholder: 'Although…',
        multiline: true,
      },
      {
        id: 'b2-2-n5',
        kind: 'readingCheck',
        xp: 25,
        passage:
          'Chancellor: "The traveller claims the archive is safe. Yet in the last decade three documents have been lost, two of them irreplaceable. Anyone who ignores this record is not defending knowledge; they are gambling with it."',
        prompt: 'Which rhetorical move is the Chancellor using at the end?',
        promptEs: '¿Qué recurso retórico usa la Canciller al final?',
        options: [
          { id: 'a', text: 'She concedes the opposing point.', feedback: 'No concede nada: reformula la posición contraria en su contra.' },
          { id: 'b', text: 'She reframes the opponent\'s position as recklessness.', correct: true, feedback: 'Eso es: convierte «defender el conocimiento» en «jugárselo».' },
          { id: 'c', text: 'She asks for more evidence.', feedback: 'La evidencia la aporta ella; no la pide.' },
        ],
      },
      {
        id: 'b2-2-n6',
        kind: 'writeFree',
        xp: 70,
        prompt: 'Write the public reply. It will be printed beside hers.',
        promptEs:
          'Escribe la réplica pública: mínimo 170 palabras. Reformula su postura con estilo indirecto, concede lo cierto, refuta lo demás con datos y cierra con una propuesta. Tono civilizado.',
        rubric: {
          minWords: 170,
          maxWords: 400,
          requiredKeywords: [
            ['the chancellor argues', 'the chancellor claims', 'it has been argued', 'she argues', 'she claims'],
            ['admittedly', 'although', 'while', 'it is true that'],
            ['however', 'nevertheless', 'nonetheless'],
            ['the evidence suggests', 'the figures show', 'the record shows', 'in practice'],
            ['i would therefore propose', 'i therefore propose', 'it is therefore recommended', 'a better solution'],
          ],
          forbiddenWords: ["don't", "it's", 'stupid', 'ridiculous', 'nonsense'],
          checklist: [
            'Reformula su postura («The Chancellor argues that…»)',
            'Concede lo que es cierto («Admittedly», «It is true that»)',
            'Refuta con «However» / «Nevertheless»',
            'Apoya con datos («The evidence suggests…»)',
            'Cierra proponiendo una solución',
          ],
          requireCapitalStart: true,
        },
        hint: 'The Chancellor argues that… / Admittedly,… / However,… / The evidence suggests… / I would therefore propose…',
        model:
          'The Chancellor argues that the archive cannot be considered safe, and that anyone who defends free access is gambling with the memory of the city. The argument deserves a serious answer rather than an insult.\n\nAdmittedly, the figures she cites are correct. Three documents have been lost in the last decade, and two of them cannot be replaced. I do not intend to minimise that record, and I would not ask anyone to accept a system that has already failed twice.\n\nHowever, the conclusion does not follow from the evidence. Two of the three losses occurred in the private reading room of the Guild, which has been closed to the public since it was built. The evidence suggests that the danger has come from restricted access rather than from open access, and that the citizens who queue every morning are not the people who lost those pages.\n\nThere is also a cost that the reply does not mention. An archive that nobody may consult is indistinguishable, in practice, from an archive that has burned.\n\nI would therefore propose a middle course. Let the fragile originals be sealed and copied, let the copies circulate freely, and let a named officer answer publicly for every document that leaves the building. That protects the record without asking the city to trust a room that it may never enter.',
        placeholder: 'The Chancellor argues that…',
        multiline: true,
      },
    ],
  },

  {
    id: 'b2-3',
    level: 'B2',
    order: 3,
    title: 'The Final Draft',
    titleEs: 'El último borrador',
    summary:
      'La ciudad vota mañana. Lo último que se leerá antes de la votación es lo que escribas esta noche: un texto entero, tuyo, sin plantilla.',
    focus: ['Ensayo completo', 'Cohesión avanzada', 'Voz propia'],
    goals: [
      { id: 'b2-3-complete', kind: 'complete', label: 'Termina el capítulo', xp: 70 },
      { id: 'b2-3-perfect', kind: 'perfect', value: 3, label: 'Acierta 3 respuestas a la primera', xp: 55 },
      { id: 'b2-3-noreveal', kind: 'noReveal', label: 'Cierra la campaña sin revelar soluciones', xp: 70 },
      { id: 'b2-3-words', kind: 'words', value: 300, label: 'Escribe 300 palabras en inglés', xp: 80 },
    ],
    nodes: [
      {
        id: 'b2-3-n1',
        kind: 'narrative',
        xp: 10,
        text: 'It is two in the morning. Mira brings tea and does not speak. On the desk: an empty page, which in Aeloria is the most [dangerous] object there is. Whatever you write tonight, the city will read at dawn and [decide].',
        translation:
          'Son las dos de la madrugada. Mira trae té y no dice nada. En el escritorio: una página en blanco, que en Aeloria es el objeto más peligroso que existe. Lo que escribas esta noche, la ciudad lo leerá al amanecer y decidirá.',
        glossary: [
          { en: 'dangerous', es: 'peligroso' },
          { en: 'decide', es: 'decidirá' },
        ],
      },
      {
        id: 'b2-3-n2',
        kind: 'gapFill',
        xp: 18,
        prompt: 'Not only ___ the archive irreplaceable, but it is also the only public record of the war.',
        promptEs:
          'Inversión tras «Not only»: escribe el verbo que falta (una palabra).',
        answers: ['is'],
        hint: 'Tras «Not only» el orden se invierte: verbo antes del sujeto.',
        placeholder: 'verbo…',
      },
      {
        id: 'b2-3-n3',
        kind: 'gapFill',
        xp: 18,
        prompt: 'Had the Council listened earlier, the crisis ___ ___ ___ avoided.',
        promptEs:
          'Tercer condicional en pasiva. Escribe las tres palabras que faltan.',
        answers: ['could have been', 'would have been', 'might have been'],
        hint: 'modal + have + been + participio.',
        placeholder: 'tres palabras…',
      },
      {
        id: 'b2-3-n4',
        kind: 'writeSentence',
        xp: 35,
        prompt: 'Write the one sentence the city will remember tomorrow.',
        promptEs:
          'Escribe la frase de cierre de tu texto: máximo 25 palabras, sin conectores de manual, con una imagen o contraste que se recuerde.',
        rubric: {
          minWords: 8,
          maxWords: 25,
          forbiddenWords: ['in conclusion', 'to sum up', 'firstly', 'in my opinion'],
          checklist: [
            'Entre 8 y 25 palabras',
            'Sin muletillas de conclusión («In conclusion», «To sum up»)',
          ],
          requireCapitalStart: true,
        },
        hint: 'A city that locks away its own memory has already begun to forget itself.',
        model: 'A city that locks away its own memory has already begun to forget itself.',
        placeholder: 'Escribe tu frase…',
        multiline: true,
      },
      {
        id: 'b2-3-n5',
        kind: 'writeFree',
        xp: 90,
        prompt: 'Write the text the city will read at dawn.',
        promptEs:
          'Ensayo final: mínimo 250 palabras. Tesis clara, dos argumentos desarrollados con ejemplos, una objeción concedida y refutada, y un cierre propio. Registro formal pero con voz personal.',
        rubric: {
          minWords: 250,
          maxWords: 600,
          requiredKeywords: [
            ['this essay', 'the question', 'the debate', 'the issue'],
            ['for instance', 'for example', 'a case in point'],
            ['admittedly', 'it is true that', 'critics argue', 'some would argue'],
            ['however', 'nevertheless', 'nonetheless', 'and yet'],
            ['ultimately', 'in the end', 'what is at stake'],
          ],
          forbiddenWords: ["don't", "it's", "can't", 'a lot of', 'stuff', 'very very'],
          checklist: [
            'Plantea el asunto («The question is…», «This essay…»)',
            'Ejemplifica («For instance», «A case in point»)',
            'Concede una objeción («Admittedly», «Critics argue»)',
            'Refuta («However», «And yet»)',
            'Cierra con peso («Ultimately», «What is at stake…»)',
            'Registro formal: sin contracciones',
          ],
          requireCapitalStart: true,
        },
        hint: 'The question before the city is… / For instance,… / Admittedly,… / However,… / Ultimately,…',
        model:
          'The question before this city tomorrow is not whether the archive is safe. It is who may decide what a city is allowed to remember.\n\nEvery argument for closing the building rests on the same assumption: that memory is a possession, and that a possession must have a guardian. The assumption is comfortable and it is wrong. A record that only one institution may consult is not a record at all; it is a claim, and claims that nobody can check are the raw material of every convenient history ever written.\n\nFor instance, the tax rolls of the eastern district were sealed for twenty-two years by an earlier Council. When they were finally opened, four families discovered that the land they had farmed for three generations had never legally belonged to the mill. Nothing had been destroyed. The documents had simply been kept somewhere that ordinary people could not reach, which turned out to be almost as effective.\n\nAdmittedly, the risk is real. Paper tears, ink fades, and readers are careless. Three documents have been lost in the last decade and I have no intention of pretending otherwise. The city would be foolish to open a room full of unique manuscripts and hope for the best.\n\nHowever, there is a difference between protecting an object and hiding it. Fragile originals can be copied, sealed and guarded while the copies circulate in every school in the district. This is not an expensive solution. It is simply a less flattering one for the people who currently hold the only key.\n\nUltimately, what is at stake tomorrow is not a building. A city that locks away its own memory has already begun to forget itself, and it will not notice the moment when the forgetting is complete.',
        placeholder: 'The question before the city is…',
        multiline: true,
        success:
          'At dawn, people read. By noon, they vote. Whatever the result, the page is no longer empty, and the voice on it is yours.',
      },
      {
        id: 'b2-3-n6',
        kind: 'narrative',
        speaker: 'Mira',
        xp: 10,
        text: '"When I found you in the rain you could not name the sky. Tonight you wrote three hundred words that changed a vote. Your voice was never [stolen], traveller. It was only [unwritten]."',
        translation:
          '«Cuando te encontré bajo la lluvia no sabías nombrar el cielo. Esta noche has escrito trescientas palabras que han cambiado una votación. Tu voz nunca te fue robada, viajero. Sólo estaba sin escribir.»',
        glossary: [
          { en: 'stolen', es: 'robada' },
          { en: 'unwritten', es: 'sin escribir' },
        ],
      },
    ],
  },
];
