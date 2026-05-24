import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { LocalBusinessJsonLd } from '@/components/shared/LocalBusinessJsonLd'
import { Providers } from '@/components/shared/Providers'
import './globals.css'
import { siteConfig } from '@/config/site'

const inter = Inter({
  subsets:  ['latin'],
  variable: '--font-inter',
  display:  'swap',
})

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  weight:   ['400', '700', '800'],
  display:  'swap',
})

const jetbrains = JetBrains_Mono({
  subsets:  ['latin'],
  variable: '--font-jetbrains',
  weight:   ['400', '600'],
  display:  'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default:  siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords:    siteConfig.keywords,
  authors:     [{ name: siteConfig.name }],
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         siteConfig.url,
    title:       siteConfig.name,
    description: siteConfig.description,
    siteName:    siteConfig.name,
    images: [{ url: '/og/default.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       siteConfig.name,
    description: siteConfig.description,
    images:      ['/og/default.jpg'],
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor:    '#1A6B3C',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{ className: 'font-sans' }}
            richColors
          />
        </Providers>
      </body>
    </html>
  )
}
