'use client';

import { FormEvent, useState } from 'react';
import { CardBack, CardFront, type CardFont } from '../components/card';

type Message = {
  id: string;
  name: string;
  message: string;
  font: CardFont;
  signatureMode: 'draw' | 'text';
  signature: string;
  createdAt: string;
};

type Slot = Message | null;
const cardsPerSheet = 8;

function createSheets(messages: Message[]) {
  const sheets: Slot[][] = [];
  for (let index = 0; index < messages.length; index += cardsPerSheet) {
    const sheet: Slot[] = messages.slice(index, index + cardsPerSheet);
    while (sheet.length < cardsPerSheet) sheet.push(null);
    sheets.push(sheet);
  }
  return sheets;
}

function mirrorColumns(front: Slot[]) {
  const back: Slot[] = [];
  for (let index = 0; index < front.length; index += 2) {
    back.push(front[index + 1], front[index]);
  }
  return back;
}

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

  function downloadMessages() {
    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `messages-thomas-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!authorized) {
    return <main className="atelier-login"><form onSubmit={openAtelier}>
      <p className="eyebrow">Accès organisateur</p>
      <h1>Atelier d&rsquo;impression</h1>
      <p>Entre le mot de passe pour consulter et imprimer les messages.</p>
      <label htmlFor="atelier-key">Mot de passe</label>
      <input id="atelier-key" type="password" value={key} onChange={(event) => setKey(event.target.value)} autoComplete="current-password" required />
      <button type="submit" disabled={loading}>{loading ? 'Ouverture' : 'Ouvrir l’atelier'}</button>
      {error && <strong role="alert">Mot de passe incorrect.</strong>}
    </form></main>;
  }

  const sheets = createSheets(messages);

  return <main className="atelier-page">
    <header className="atelier-header">
      <div><p className="eyebrow">Atelier d&rsquo;impression</p><h1>Les planches</h1><p>{messages.length} message{messages.length > 1 ? 's' : ''} à imprimer</p></div>
      <div className="atelier-actions">
        <button className="secondary" onClick={downloadMessages} disabled={!messages.length}>Télécharger les messages</button>
        <button onClick={() => window.print()} disabled={!messages.length}>Imprimer recto verso</button>
      </div>
    </header>

    <aside className="print-instructions">
      <strong>Réglages d&rsquo;impression</strong>
      <span>A4 portrait, recto verso, retourner sur le bord long, échelle 100 %, marges par défaut.</span>
      <span>Chaque feuille contient 8 cartes de 85 x 55 mm. Les versos sont déjà inversés pour l&rsquo;alignement. Papier crème de 160 à 200 g conseillé.</span>
    </aside>

    {messages.length === 0 ? <section className="empty-state"><h2>Aucun message pour le moment.</h2></section> :
      <div className="print-workspace">{sheets.map((frontSlots, sheetIndex) => {
        const backSlots = mirrorColumns(frontSlots);
        return <section className="sheet-pair" key={sheetIndex}>
          <p className="sheet-label">Feuille {sheetIndex + 1}, rectos</p>
          <div className="duplex-sheet front-sheet">{frontSlots.map((item, slotIndex) =>
            <div className={`print-slot ${item ? '' : 'empty'}`} key={`front-${slotIndex}`}>
              {item && <CardFront message={item.message} font={item.font} name={item.name} signature={{ mode: item.signatureMode, value: item.signature }} />}
            </div>)}</div>
          <p className="sheet-label">Feuille {sheetIndex + 1}, versos inversés</p>
          <div className="duplex-sheet back-sheet">{backSlots.map((item, slotIndex) =>
            <div className={`print-slot ${item ? '' : 'empty'}`} key={`back-${slotIndex}`}>
              {item && <CardBack />}
            </div>)}</div>
        </section>;
      })}</div>}
  </main>;
}
