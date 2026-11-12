import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kedai Kyuti (kedaikyuti.my.id) — JASDOR KOPI KENANGAN',
  description: 'Kedai Kyuti (kedaikyuti.my.id) - Jasa Titip Order (Jasdor) Kopi Kenangan Murah. Diskon 50% + fee hemat, stok real-time, pesan via WhatsApp.',
  icons: {
    icon: '/assets/img/logo/kyuti.jpeg',
    apple: '/assets/img/logo/kyuti.jpeg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;1,700&family=Quicksand:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/assets/css/style.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
