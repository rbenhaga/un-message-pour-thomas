import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Un mot pour Thomas',
  description: 'Écris un mot qui sera imprimé au format carte postale et réuni dans un carnet avant son départ en Erasmus.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
