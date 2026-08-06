# WriteXP

Aprende a escribir y leer en inglés jugando, del A1 al B2, dentro de una aventura RPG.

No hay tests de opción múltiple como mecánica principal: para avanzar en la historia hay que
teclear la respuesta en inglés. Cada frase correcta da XP, sube el nivel de héroe y abre el
siguiente capítulo.

```bash
npm install
npm run dev      # http://localhost:5173
```

Cuenta de prueba: `demo@writexp.app` / `demo1234` (o el botón "Entrar con la cuenta de prueba").

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`tsc -b && vite build`) |
| `npm run typecheck` | Solo comprobación de tipos |
| `npm run verify` | **Valida el contenido y simula una campaña entera** |

---

## La campaña

Cada nivel del MCER es un acto de la misma historia. En Aeloria las cosas sólo existen si sabes
escribir su nombre, así que la pluma es literalmente el arma del protagonista.

| Nivel | Acto | Qué se practica |
|---|---|---|
| **A1** | La Puerta de los Nombres | `to be`, artículos, presente simple, vocabulario básico. De la palabra suelta a la primera frase. |
| **A2** | La Llave Perdida | Pasado simple, descripciones, comparativos, preguntas `wh-`. Investigación de un robo. |
| **B1** | El Gremio de las Palabras | Opinión razonada, conectores, presente perfecto, condicionales, carta formal. |
| **B2** | El Consejo de Aeloria | Registro formal, pasiva, concesión y refutación, estilo indirecto, ensayo completo. |

Tres capítulos por acto, 83 nodos, ~5.400 XP para llegar al nivel 10 (*Leyenda de Aeloria*).

## Tipos de ejercicio

| Tipo | Corrección |
|---|---|
| `narrative` | Lectura. Palabras entre `[corchetes]` se tocan para ver la traducción. |
| `choice` | Bifurcación de la historia, sin opción incorrecta. |
| `readingCheck` | Comprensión lectora, con una opción correcta. |
| `writeWord` / `gapFill` | Comparación contra `answers`, con tolerancia a erratas. |
| `writeSentence` / `writeFree` | Evaluación por **rúbrica**: nº de palabras, recursos obligatorios, palabras prohibidas y reglas de estilo. |

El motor de corrección ([src/engine/grading.ts](src/engine/grading.ts)) devuelve tres notas:

- **perfect** — se avanza y se cobra la XP completa.
- **close** — errata detectada por distancia de edición, o rúbrica cumplida a medias. Se puede
  reintentar o seguir con XP reducida a partir del segundo intento.
- **wrong** — se reintenta; tras el primer fallo aparece la pista y tras el segundo la opción de
  rendirse y ver la solución modelo (20% de la XP).

La XP baja con cada intento (100% → 70% → 45%), así que se premia acertar a la primera sin dejar a
nadie bloqueado.

### Andamiaje: ejemplo, pista, segunda pista, solución

Cada ejercicio puede traer cuatro ayudas, de menos a más:

1. `example` — un ejemplo del **mismo patrón con otro contenido**, visible desde el principio y sin
   coste de XP. Nunca contiene la solución, y `npm run verify` lo comprueba.
2. `hint` — pista de estructura, se ofrece tras el primer fallo.
3. `hint2` — pista más explícita (a menudo un esqueleto con huecos), tras el segundo.
4. `model` — la solución, sólo al rendirse: 20% de la XP y adiós al objetivo de «sin revelar».

En **A1 y A2 el ejemplo y la segunda pista son obligatorios** (lo exige el verificador): quien
empieza no sabe aún qué forma tiene una respuesta buena, y enseñársela no es regalarle la suya. De
B1 en adelante son opcionales.

## Objetivos y logros

- **Objetivos** (por capítulo): terminarlo, acertar N a la primera, no revelar soluciones, escribir
  N palabras, encadenar una racha. Son metas ambiciosas, no requisitos: los pendientes se acumulan
  y se pueden conseguir repitiendo el capítulo.
- **Logros** (globales, 16): definidos en [src/data/achievements.ts](src/data/achievements.ts) como
  un predicado sobre el progreso. Añadir uno nuevo es añadir un objeto al array.

## Arquitectura

```
src/
  types.ts              Modelo de datos de toda la app
  engine/               Lógica pura, sin React ni DOM
    text.ts               Normalización, distancia de edición, glosario
    grading.ts            Corrección por respuestas y por rúbrica
    xp.ts                 Curva de niveles y títulos de héroe
    progress.ts           Progreso, objetivos, logros, desbloqueos
  data/
    levels.ts             Los cuatro actos
    achievements.ts       Logros
    story/                a1 · a2 · b1 · b2 — el contenido
  services/
    auth.ts               Interfaz AuthService + implementación local
    storage.ts            Persistencia del progreso por usuario
  state/                  AuthContext · GameContext
  components/             GlossText, HeroBar, avisos y tarjetas de nodo
  screens/                Login · Niveles · Capítulos · Escena · Logros
```

Dos reglas que conviene mantener:

1. **El contenido son datos.** Añadir un capítulo es escribir un objeto en `src/data/story/`, nunca
   tocar componentes. Si un capítulo nuevo necesita UI nueva, probablemente falte un tipo de nodo.
2. **`engine/` no importa React.** Todo lo que decide XP, notas o desbloqueos es una función pura,
   que es lo que permite simular la campaña entera desde la terminal.

## Verificación

`npm run verify` ejecuta dos scripts que comprueban el juego sin abrir el navegador:

- [scripts/verify-content.ts](scripts/verify-content.ts) — ids únicos, nodos corregibles, objetivos
  alcanzables y, sobre todo, que **la solución modelo de cada ejercicio aprueba su propia rúbrica**.
  Es lo que evita publicar una consigna imposible de cumplir. También vigila el andamiaje: que A1 y
  A2 traigan ejemplo y segunda pista, y que **copiar el ejemplo no apruebe** el ejercicio.
- [scripts/simulate-playthrough.ts](scripts/simulate-playthrough.ts) — juega los 12 capítulos
  respondiendo perfecto y comprueba XP, objetivos, curva de niveles y desbloqueos.

## Qué es prototipo y qué no

El **login y la persistencia son locales**: usuarios y progreso viven en `localStorage` de este
navegador, y las contraseñas usan un hash de juguete que no es seguridad real. Está aislado tras la
interfaz `AuthService` ([src/services/auth.ts](src/services/auth.ts)) precisamente para que
sustituirlo por Supabase, Firebase o un backend propio no obligue a tocar ninguna pantalla.

El motor, el contenido, la corrección y el sistema de progresión sí son definitivos.

## Siguientes pasos naturales

- Backend real de auth y progreso (sustituir `LocalAuthService` y `services/storage.ts`).
- Repaso espaciado: reaparición de los nodos fallados días después.
- Corrección con LLM para las redacciones libres de B1/B2, complementando la rúbrica con feedback
  sobre naturalidad y registro.
- Audio (TTS) sobre los textos narrativos para trabajar también la comprensión oral.
