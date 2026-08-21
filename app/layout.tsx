import type { Metadata, Viewport } from 'next';
import { buildFaviconUri } from '@/lib/build-favicon-uri';
import { getLogoSrc } from '@/lib/get-logo-src';
import { inter, FONT_CLASS_MAP } from '@/lib/fonts';
import { TemplateLayout } from '@/components/custom/template-layout';
import { LogoSrcProvider } from '@/components/custom/logo-src-provider';
import { TemplateI18nProvider } from '../lib/i18n/provider';
import '@/app/globals.css';
import './globals.css';
import './custom.css';

export function generateMetadata(): Metadata {
  const faviconUri = buildFaviconUri();
  return {
    metadataBase: new URL('https://tradeske.com'),
    title: process.env.NEXT_PUBLIC_DERIV_APP_NAME?.trim() || 'Deriv Digits Trading App',
    description: 'A white-label trading application powered by Deriv',
    openGraph: {
      images: ['/og-image.png'],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: ['/og-image.png'],
    },
    ...(faviconUri ? { icons: { icon: faviconUri } } : {}),
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const fontClass =
  FONT_CLASS_MAP[process.env.NEXT_PUBLIC_FONT_FAMILY ?? 'Inter'] ??
  inter.className;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const logoSrc = getLogoSrc();
  return (
    <html lang="en" className="min-h-full" suppressHydrationWarning>
      <body
        className={`${fontClass} min-h-dvh overflow-x-hidden bg-background`}
      >
        <TemplateI18nProvider>
          <TemplateLayout>
            <LogoSrcProvider logoSrc={logoSrc}>{children}</LogoSrcProvider>
          </TemplateLayout>
        </TemplateI18nProvider>
      </body>
    </html>
  );
}
