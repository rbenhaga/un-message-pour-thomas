'use client';

import { FormEvent, PointerEvent, useEffect, useRef, useState } from 'react';

const fonts = [
  { id: 'plume', label: 'Plume', sample: 'Un mot doux…' },
  { id: 'classique', label: 'Classique', sample: 'Un mot doux…' },
  { id: 'simple', label: 'Simple', sample: 'Un mot doux…' },
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
    ctx.strokeStyle = '#342e29';
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

  function stopDrawing() { drawingRef.current = false; }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (signatureMode === 'draw' && !hasInk) return;
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
        <div className="success-stamp" aria-hidden="true">♥</div>
        <p className="eyebrow">C’est dans l’enveloppe</p>
        <h1>Merci, {name.trim()}.</h1>
        <p>Ton mot est bien au chaud. Il rejoindra le carnet surprise de Thomas.</p>
        <button className="secondary-button" onClick={() => window.location.reload()}>Écrire un autre mot</button>
      </section></main>
    );
  }

  return (
    <main className="site-shell">
      <header className="hero">
        <a className="brand" href="#top" aria-label="Retour en haut">Pour Thomas <span>♥</span></a>
        <div className="step-pill">3 minutes · une petite surprise</div>
      </header>

      <section className="intro" id="top">
        <p className="eyebrow">Son carnet de départ</p>
        <h1>Glisse un petit mot<br /><em>dans sa valise.</em></h1>
        <p className="intro-copy">Thomas part bientôt en Erasmus. Écris-lui quelques mots qu’il pourra relire quand la maison lui manquera. Nous nous occupons de l’imprimer et de le glisser dans son carnet.</p>
        <div className="scroll-cue" aria-hidden="true"><span>↓</span> À toi d’écrire</div>
      </section>

      <form className="editor" onSubmit={submit}>
        <div className="form-panel">
          <div className="section-heading"><span>01</span><div><h2>Ton petit mot</h2><p>Quelques lignes suffisent, promis.</p></div></div>
          <label className="field-label" htmlFor="name">Ton prénom</label>
          <input id="name" className="text-input" maxLength={42} value={name} onChange={(e) => setName(e.target.value)} placeholder="Camille" required />
          <div className="label-row"><label className="field-label" htmlFor="message">Ton message</label><span>{message.length}/320</span></div>
          <textarea id="message" className={`message-input font-${font}`} maxLength={320} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Thomas, n’oublie jamais que…" required />

          <fieldset className="font-picker"><legend>Choisis ton écriture</legend><div className="font-options">
            {fonts.map((item) => (
              <label key={item.id} className={font === item.id ? 'selected' : ''}>
                <input type="radio" name="font" value={item.id} checked={font === item.id} onChange={() => setFont(item.id)} />
                <span className={`font-${item.id}`}>{item.sample}</span><small>{item.label}</small>
              </label>
            ))}
          </div></fieldset>

          <div className="section-heading signature-heading"><span>02</span><div><h2>Ta signature</h2><p>Au doigt, à la souris, ou tout simplement au clavier.</p></div></div>
          <div className="mode-switch" role="group" aria-label="Mode de signature">
            <button type="button" className={signatureMode === 'draw' ? 'active' : ''} onClick={() => setSignatureMode('draw')}>✎ Signer au doigt</button>
            <button type="button" className={signatureMode === 'text' ? 'active' : ''} onClick={() => setSignatureMode('text')}>Aa Écrire mon nom</button>
          </div>
          {signatureMode === 'draw' ? (
            <div className="signature-wrap"><canvas ref={canvasRef} aria-label="Zone pour dessiner ta signature" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} />
              {!hasInk && <span>Signe ici</span>}<button type="button" onClick={clearSignature}>Effacer</button></div>
          ) : (
            <input className="typed-signature" maxLength={54} value={typedSignature} onChange={(e) => setTypedSignature(e.target.value)} placeholder="Ta signature" required />
          )}

          <button className="submit-button" type="submit" disabled={status === 'sending'}><span>{status === 'sending' ? 'Envoi en cours…' : 'Glisser dans l’enveloppe'}</span><span aria-hidden="true">→</span></button>
          {status === 'error' && <p className="error-message" role="alert">Le mot n’est pas parti. Réessaie dans un instant.</p>}
          <p className="privacy-note">🔒 Ton mot restera une surprise jusqu’au jour J.</p>
        </div>

        <aside className="preview-panel" aria-label="Aperçu de la carte"><div className="preview-sticky">
          <p className="preview-label">Aperçu · taille réelle à l’impression</p>
          <article className="message-card"><div className="card-topline"><span>ARCHIVVM · MMXXVI</span><span>✦ POUR THOMAS ✦</span></div>
            <p className={`card-message font-${font}`}>{message || 'Ton petit mot apparaîtra ici, comme sur la carte imprimée…'}</p>
            <div className="card-signature"><span>{signatureMode === 'text' && typedSignature ? typedSignature : name || 'Ta signature'}</span></div>
            <div className="card-postmark"><small>ROMA</small><b>SPQR</b><small>MMXXVI</small></div>
          </article>
          <p className="preview-tip"><span>✦</span> Nous imprimerons chaque mot au format carte de visite.</p>
        </div></aside>
      </form>
      <footer><span>Fait avec beaucoup d’amour</span><span>pour Thomas · 2026</span></footer>
    </main>
  );
}
