import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Artifex - AI Art Critic & Studio',
  description: 'An interactive AI art critic and co-creator. Chat with AI art critics about your work, artistic movements, or creative ideas — and generate new artwork.',
  icons: {
    icon: [
      { url: '/logo/Artifex_Favicon.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    shortcut: '/favicon.ico',
    apple: '/logo/Artifex_Favicon.png',
  },
  openGraph: {
    title: 'Artifex - AI Art Critic & Studio',
    description: 'An interactive AI art critic and co-creator. Chat with AI art critics and generate artwork.',
    images: ['/logo/Artifex_Favicon.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artifex - AI Art Critic & Studio',
    description: 'An interactive AI art critic and co-creator.',
    images: ['/logo/Artifex_Favicon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
