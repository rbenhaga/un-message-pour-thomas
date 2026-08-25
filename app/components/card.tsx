export type CardFont = 'plume' | 'classique' | 'simple';

export type CardSignature =
  | { mode: 'draw'; value: string }
  | { mode: 'text'; value: string };

function messageBucket(message: string) {
  if (message.length > 240) return 'xlong';
  if (message.length > 140) return 'long';
  return 'base';
}

/* Cachet d'encre monochrome, commun à tous les versos. */
export function Postmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <g transform="rotate(-8 50 50)">
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth="0.65" />
        <defs>
          <path id="pm-solo" d="M50 50 m -23.5 0 a 23.5 23.5 0 1 1 47 0" />
        </defs>
        <text className="postmark-arc">
          <textPath href="#pm-solo" startOffset="50%" textAnchor="middle">ERASMUS</textPath>
        </text>
        <text x="50" y="51" textAnchor="middle" className="postmark-monogram">T</text>
        <text x="50" y="67" textAnchor="middle" className="postmark-year">2026</text>
      </g>
    </svg>
  );
}

export function CardFront({
  message,
  font,
  name,
  signature,
}: {
  message: string;
  font: CardFont;
  name: string;
  signature: CardSignature;
}) {
  return (
    <article className="pcard pcard-front">
      <div className="pcard-frame">
        <span className="pcard-folio" aria-hidden="true">2026</span>
        <p className={`pcard-message font-${font} len-${messageBucket(message)}`}>{message}</p>
        <div className="pcard-sign-row">
          <span className="pcard-name">{name}</span>
          {signature.mode === 'draw' ? (
            // La signature est une image locale en data URL, destinée à l'impression.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="pcard-sign-img" src={signature.value} alt={`Signature de ${name}`} />
          ) : (
            <span className="pcard-sign-text">{signature.value}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function CardBack() {
  return (
    <article className="pcard pcard-back">
      <div className="pcard-frame back-frame"><Postmark className="pcard-back-stamp" /></div>
    </article>
  );
}
