'use client';

import { FormEvent, useState } from 'react';

type Message = { id: string; name: string; message: string; font: 'plume' | 'classique' | 'simple'; signatureMode: 'draw' | 'text'; signature: string; createdAt: string };

export default function AtelierPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [key, setKey] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function openAtelier(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const response = await fetch('/api/messages', { headers: { 'x-atelier-key': key } });
      if (!response.ok) throw new Error('forbidden');
      setMessages(await response.json());
      setAuthorized(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  if (!authorized) {
    return <main className="atelier-login"><form onSubmit={openAtelier}>
      <span className="login-envelope" aria-hidden="true">✉</span>
      <p className="eyebrow">L’atelier secret</p>
      <h1>Mot de passe,<br />s’il vous plaît.</h1>
      <p>Les petits mots sont bien gardés jusqu’au jour J.</p>
      <label htmlFor="atelier-key">Mot de passe de l’atelier</label>
      <input id="atelier-key" type="password" value={key} onChange={(e) => setKey(e.target.value)} autoComplete="current-password" required />
      <button type="submit" disabled={loading}>{loading ? 'Ouverture…' : 'Ouvrir les enveloppes'}</button>
      {error && <strong role="alert">Ce mot de passe n’ouvre pas l’atelier.</strong>}
    </form></main>;
  }

  return (
    <main className="atelier-page">
      <header className="atelier-header"><div><p className="eyebrow">L’atelier secret</p><h1>Les mots pour Thomas</h1><p>{messages.length} mot{messages.length > 1 ? 's' : ''} récolté{messages.length > 1 ? 's' : ''}</p></div>
        <button onClick={() => window.print()} disabled={!messages.length}>Imprimer la planche</button></header>
      {messages.length === 0 ? <section className="empty-state"><span>✉</span><h2>La première enveloppe attend son mot.</h2><p>Partage la page principale aux proches de Thomas.</p></section> : (
        <section className="print-sheet">{messages.map((item) => <article className="print-card" key={item.id}>
          <div className="print-topline"><span>ARCHIVVM · MMXXVI</span><span>✦ POUR THOMAS ✦</span></div><p className={`print-message font-${item.font}`}>{item.message}</p>
          <div className="print-seal" aria-hidden="true"><small>ROMA</small><b>SPQR</b><small>MMXXVI</small></div>
          <div className="print-bottom"><span className="print-name">{item.name}</span>{item.signatureMode === 'draw' ? <img src={item.signature} alt={`Signature de ${item.name}`} /> : <span className="print-signature">{item.signature}</span>}</div>
        </article>)}</section>
      )}
    </main>
  );
}
