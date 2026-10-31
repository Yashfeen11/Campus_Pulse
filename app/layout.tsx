import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Campus Pulse | Campus Event Intelligence',
  description:
    'An editorial, intelligent cue card deck for college notices, powered by Gemini AI with auto-expiration tracking.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${jakarta.variable} ${spaceGrotesk.variable} font-sans bg-[#FAF8F5] text-stone-900 antialiased min-h-screen selection:bg-orange-600 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
