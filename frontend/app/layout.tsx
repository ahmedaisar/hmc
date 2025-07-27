import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Maldives Hotels - Luxury Resort Bookings',
    template: '%s | Maldives Hotels',
  },
  description: 'Discover and book luxury resorts in the Maldives. From overwater villas to beachfront suites, find your perfect tropical paradise.',
  keywords: [
    'Maldives',
    'hotels',
    'resorts',
    'luxury',
    'overwater villa',
    'beach resort',
    'tropical vacation',
    'booking',
    'honeymoon',
    'paradise',
  ],
  authors: [{ name: 'Maldives Hotels Team' }],
  creator: 'Maldives Hotels',
  publisher: 'Maldives Hotels',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Maldives Hotels - Luxury Resort Bookings',
    description: 'Discover and book luxury resorts in the Maldives. From overwater villas to beachfront suites, find your perfect tropical paradise.',
    siteName: 'Maldives Hotels',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Maldives Hotels - Luxury Resort Bookings',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maldives Hotels - Luxury Resort Bookings',
    description: 'Discover and book luxury resorts in the Maldives. From overwater villas to beachfront suites, find your perfect tropical paradise.',
    images: ['/images/twitter-image.jpg'],
    creator: '@maldiveshotels',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}