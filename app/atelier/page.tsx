'use client';

import { useEffect, useState } from 'react';

type Message = { id: string; name: string; message: string; font: 'plume' | 'classique' | 'simple'; signatureMode: 'draw' | 'text'; signature: string; createdAt: string };

export default function AtelierPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch('/api/messages').then((response) => response.json()).then(setMessages).finally(() => setLoading(false)); }, []);
  return (
    <main className="atelier-page">
      <header className="atelier-header"><div><p className="eyebrow">L’atelier secret</p><h1>Les mots pour Thomas</h1><p>{loading ? 'Ouverture des enveloppes…' : `${messages.length} mot${messages.length > 1 ? 's' : ''} récolté${messages.length > 1 ? 's' : ''}`}</p></div>
        <button onClick={() => window.print()} disabled={!messages.length}>Imprimer la planche</button></header>
      {!loading && messages.length === 0 ? <section className="empty-state"><span>✉</span><h2>La première enveloppe attend son mot.</h2><p>Partage la page principale aux proches de Thomas.</p></section> : (
        <section className="print-sheet">{messages.map((item) => <article className="print-card" key={item.id}>
          <div className="print-topline"><span>POUR THOMAS</span><span>♥</span></div><p className={`print-message font-${item.font}`}>{item.message}</p>
          <div className="print-bottom"><span className="print-name">{item.name}</span>{item.signatureMode === 'draw' ? <img src={item.signature} alt={`Signature de ${item.name}`} /> : <span className="print-signature">{item.signature}</span>}</div>
        </article>)}</section>
      )}
    </main>
  );
}
