import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedHotels } from '@/components/sections/FeaturedHotels';
import { WhyChooseUs } from '@/components/sections/WhyChooseUs';
import { Testimonials } from '@/components/sections/Testimonials';
import { Newsletter } from '@/components/sections/Newsletter';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Luxury Maldives Resort Bookings - Paradise Awaits',
  description: 'Book your dream vacation in the Maldives. Discover luxury overwater villas, pristine beaches, and world-class resorts. Best prices guaranteed.',
  openGraph: {
    title: 'Luxury Maldives Resort Bookings - Paradise Awaits',
    description: 'Book your dream vacation in the Maldives. Discover luxury overwater villas, pristine beaches, and world-class resorts. Best prices guaranteed.',
    images: ['/images/maldives-hero.jpg'],
  },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedHotels />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
