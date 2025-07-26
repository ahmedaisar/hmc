'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const footerLinks = {
  destinations: [
    { name: 'North Malé Atoll', href: '/destinations/north-male-atoll' },
    { name: 'South Malé Atoll', href: '/destinations/south-male-atoll' },
    { name: 'Baa Atoll', href: '/destinations/baa-atoll' },
    { name: 'Ari Atoll', href: '/destinations/ari-atoll' },
    { name: 'Lhaviyani Atoll', href: '/destinations/lhaviyani-atoll' },
  ],
  experiences: [
    { name: 'Overwater Villas', href: '/experiences/overwater-villas' },
    { name: 'Diving & Snorkeling', href: '/experiences/diving-snorkeling' },
    { name: 'Spa & Wellness', href: '/experiences/spa-wellness' },
    { name: 'Water Sports', href: '/experiences/water-sports' },
    { name: 'Fine Dining', href: '/experiences/fine-dining' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Blog', href: '/blog' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Booking Terms', href: '/terms/booking' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cancellation Policy', href: '/cancellation' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/maldiveshotels', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/maldiveshotels', icon: Twitter },
  { name: 'Instagram', href: 'https://instagram.com/maldiveshotels', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/maldiveshotels', icon: Youtube },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Logo className="text-white mb-6" />
            <p className="text-gray-300 mb-6 max-w-md">
              Your gateway to paradise. Discover luxury resorts, pristine beaches, 
              and unforgettable experiences in the beautiful Maldives.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 text-primary-400" />
                <span>+960 330 0500</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 text-primary-400" />
                <span>hello@maldiveshotels.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 text-primary-400" />
                <span>Malé, Republic of Maldives</span>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Destinations</h3>
            <ul className="space-y-3">
              {footerLinks.destinations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Experiences */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Experiences</h3>
            <ul className="space-y-3">
              {footerLinks.experiences.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-lg font-semibold mb-2">Stay Connected</h3>
              <p className="text-gray-300 text-sm">
                Follow us for travel inspiration and exclusive offers
              </p>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-full flex items-center justify-center transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              © 2024 Maldives Hotels. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}