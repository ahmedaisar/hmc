'use client';

import { useState } from 'react';
import { Search, Calendar, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchForm } from '@/components/forms/SearchForm';

export function HeroSection() {
  const [showSearchForm, setShowSearchForm] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Hero Text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
            Discover Paradise in the{' '}
            <span className="bg-gradient-to-r from-maldives-turquoise to-maldives-blue bg-clip-text text-transparent">
              Maldives
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up">
            Escape to luxury overwater villas, pristine beaches, and crystal-clear waters. 
            Your dream tropical vacation awaits.
          </p>

          {/* Search CTA */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {!showSearchForm ? (
              <Button
                size="lg"
                onClick={() => setShowSearchForm(true)}
                className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 h-auto"
              >
                <Search className="w-5 h-5 mr-2" />
                Find Your Perfect Resort
              </Button>
            ) : (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
                <SearchForm onClose={() => setShowSearchForm(false)} />
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-white/80">Luxury Resorts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">26</div>
              <div className="text-white/80">Atolls</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">1,192</div>
              <div className="text-white/80">Coral Islands</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99%</div>
              <div className="text-white/80">Guest Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
}