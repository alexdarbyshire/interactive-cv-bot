import { Toaster } from 'sonner';
import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

import './globals.css';
import { SessionProvider } from 'next-auth/react';

export const metadata: Metadata = {
  metadataBase: new URL('https://chat.vercel.ai'),
  title: 'Interactive CV Bot - Terminal',
  description: 'Terminal-themed interactive CV chatbot using AI SDK.',
  icons: {
    icon: '/favicon.png',
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const firaCode = Fira_Code({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fira-code',
  weight: ['300', '400', '500', '600', '700'],
});

const TERMINAL_THEME_COLOR = '#1d2021';
const THEME_COLOR_SCRIPT = `\
(function() {
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', '${TERMINAL_THEME_COLOR}');
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${firaCode.variable} terminal-theme`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased font-mono">
        <ThemeProvider
          attribute="class"
          defaultTheme="terminal"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-fira-code), monospace',
              },
            }}
          />
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
