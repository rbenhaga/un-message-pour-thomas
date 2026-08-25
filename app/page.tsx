'use client';

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';

const fonts = [
  { id: 'plume', label: 'Plume', sample: 'Bonne route' },
  { id: 'classique', label: 'Classique', sample: 'Bonne route' },
  { id: 'simple', label: 'Simple', sample: 'Bonne route' },
] as const;

type FontId = (typeof fonts)[number]['id'];
type SignatureMode = 'draw' | 'text';

export default function Home() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [font, setFont] = useState<FontId>('plume');
  const [signatureMode, setSignatureMode] = useState<SignatureMode>('draw');
  const [typedSignature, setTypedSignature] = useState('');
  const [hasInk, setHasInk] = useState(false);
  const [signatureWarning, setSignatureWarning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#3f3529';
    ctx.lineWidth = 2.2;
  }, [signatureMode]);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    canvas.setPointerCapture(event.pointerId);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    drawingRef.current = true;
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const p = point(event);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  }

  function stopDrawing() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    setSignatureWarning(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (signatureMode === 'draw' && !hasInk) {
      setSignatureWarning(true);
      return;
    }
    if (signatureMode === 'text' && !typedSignature.trim()) return;
    setStatus('sending');
    try {
      const signature = signatureMode === 'draw'
        ? canvasRef.current?.toDataURL('image/png')
        : typedSignature.trim();
      const response = await fetch('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message, font, signatureMode, signature }),
      });
      if (!response.ok) throw new Error('send failed');
      setStatus('sent');
    } catch { setStatus('error'); }
  }

  if (status === 'sent') {
    return (
      <main className="success-page"><section className="success-card">
        <p className="eyebrow">Message reçu</p>
        <h1>Merci, {name.trim()}.</h1>
        <p>Ton mot sera imprimé avec les autres et remis à Thomas avant son départ.</p>
        <button className="secondary-button" onClick={() => window.location.reload()}>Écrire un autre mot</button>
      </section></main>
    );
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <span className="brand">Un message pour Thomas</span>
        <span className="topbar-year">320 caractères maximum</span>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">Départ en Erasmus · 2026</p>
        <h1>Écris un message pour Thomas</h1>
        <p className="intro-copy">
          Choisis une écriture, ajoute ta signature et nous nous chargeons de l&rsquo;impression.
        </p>
      </section>

      <form className="editor" onSubmit={submit}>
        <div className="form-panel">
          <div className="section-heading"><span>01</span><div><h2>Le message</h2><p>Quelques lignes suffisent.</p></div></div>
          <label className="field-label" htmlFor="name">Ton prénom</label>
          <input id="name" className="text-input" maxLength={42} value={name} onChange={(e) => setName(e.target.value)} placeholder="Camille" required />
          <div className="label-row"><label className="field-label" htmlFor="message">Ton message</label><span>{message.length}/320</span></div>
          <textarea id="message" className={`message-input font-${font}`} maxLength={320} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Écris ici" required />

          <fieldset className="font-picker"><legend>L&rsquo;écriture</legend><div className="font-options">
            {fonts.map((item) => (
              <label key={item.id} className={font === item.id ? 'selected' : ''}>
                <input type="radio" name="font" value={item.id} checked={font === item.id} onChange={() => setFont(item.id)} />
                <span className={`font-${item.id}`}>{item.sample}</span><small>{item.label}</small>
              </label>
            ))}
          </div></fieldset>

          <div className="section-heading signature-heading"><span>02</span><div><h2>La signature</h2><p>Au doigt, à la souris ou au clavier.</p></div></div>
          <div className="mode-switch" role="group" aria-label="Mode de signature">
            <button type="button" className={signatureMode === 'draw' ? 'active' : ''} onClick={() => setSignatureMode('draw')}>Signer à la main</button>
            <button type="button" className={signatureMode === 'text' ? 'active' : ''} onClick={() => setSignatureMode('text')}>Écrire mon nom</button>
          </div>
          {signatureMode === 'draw' ? (
            <div className="signature-wrap"><canvas ref={canvasRef} aria-label="Zone pour dessiner ta signature" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} />
              {!hasInk && <span>Signe ici</span>}<button type="button" onClick={clearSignature}>Effacer</button></div>
          ) : (
            <input className="typed-signature" maxLength={54} value={typedSignature} onChange={(e) => setTypedSignature(e.target.value)} placeholder="Ta signature" required />
          )}
          {signatureWarning && <p className="field-warning" role="alert">Ajoute ta signature avant d&rsquo;envoyer.</p>}

          <button className="submit-button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours' : 'Envoyer le message'}
          </button>
          {status === 'error' && <p className="error-message" role="alert">Le message n&rsquo;est pas parti. Réessaie dans un instant.</p>}
          <p className="privacy-note">Le message n&rsquo;est visible que par les organisateurs.</p>
        </div>

      </form>
      <footer><span>Un message pour Thomas</span><span>2026</span></footer>
    </main>
  );
}
