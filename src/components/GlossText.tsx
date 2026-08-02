import { Fragment, useMemo, useState } from 'react';
import { stripGloss, tokenizeGlossed } from '@/engine/text';
import type { GlossEntry } from '@/types';

/**
 * Pinta un texto en inglés donde las palabras entre [corchetes] son
 * consultables: al tocarlas aparece la traducción al español.
 */
export function GlossText({ text, glossary }: { text: string; glossary?: GlossEntry[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const tokens = useMemo(() => tokenizeGlossed(text, glossary), [text, glossary]);

  return (
    <span aria-label={stripGloss(text)}>
      {tokens.map((token, index) =>
        token.gloss ? (
          <Fragment key={index}>
            <button
              type="button"
              className="gloss"
              data-open={open === index}
              title={token.gloss}
              onClick={() => setOpen(open === index ? null : index)}
            >
              {token.text}
            </button>
            {open === index && <span className="gloss-bubble">{token.gloss}</span>}
          </Fragment>
        ) : (
          <Fragment key={index}>{token.text}</Fragment>
        ),
      )}
    </span>
  );
}
