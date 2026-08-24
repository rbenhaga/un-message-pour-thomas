import { env } from 'cloudflare:workers';
import { NextResponse } from 'next/server';

const allowedFonts = new Set(['plume', 'classique', 'simple']);
const allowedModes = new Set(['draw', 'text']);
const atelierKey = 'carnet-olive-4827';

async function ensureTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS birthday_messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      message TEXT NOT NULL,
      font TEXT NOT NULL,
      signature_mode TEXT NOT NULL,
      signature TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
}

export async function GET(request: Request) {
  if (request.headers.get('x-atelier-key') !== atelierKey) {
    return NextResponse.json({ error: 'Accès réservé' }, { status: 401 });
  }
  await ensureTable();
  const result = await env.DB.prepare(`SELECT id, name, message, font, signature_mode AS signatureMode, signature, created_at AS createdAt FROM birthday_messages ORDER BY created_at ASC`).all();
  return NextResponse.json(result.results);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const name = String(body.name ?? '').trim();
    const message = String(body.message ?? '').trim();
    const font = String(body.font ?? '');
    const signatureMode = String(body.signatureMode ?? '');
    const signature = String(body.signature ?? '').trim();
    const validDrawnSignature = signatureMode !== 'draw' || (signature.startsWith('data:image/png;base64,') && signature.length < 600_000);
    if (!name || name.length > 42 || !message || message.length > 320 || !allowedFonts.has(font) || !allowedModes.has(signatureMode) || !signature || signature.length > 600_000 || !validDrawnSignature) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }
    await ensureTable();
    await env.DB.prepare(`INSERT INTO birthday_messages (id, name, message, font, signature_mode, signature, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), name, message, font, signatureMode, signature, new Date().toISOString()).run();
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Impossible d’enregistrer le mot' }, { status: 500 });
  }
}
