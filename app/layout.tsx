import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://un-mot-pour-thomas.rbenhaga.chatgpt.site'),
  title: 'Un mot pour Thomas',
  description: 'Écris un petit mot pour le carnet surprise de Thomas avant son départ en Erasmus.',
  openGraph: {
    title: 'Un mot pour Thomas',
    description: 'Glisse un petit mot dans sa valise.',
    images: [{ url: 'https://un-mot-pour-thomas.rbenhaga.chatgpt.site/og.png', width: 1731, height: 909, alt: 'Un mot pour Thomas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Un mot pour Thomas',
    description: 'Glisse un petit mot dans sa valise.',
    images: ['https://un-mot-pour-thomas.rbenhaga.chatgpt.site/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
