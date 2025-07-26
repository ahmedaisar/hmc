'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Thank you for subscribing! Check your email for exclusive deals.');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="section bg-gradient-to-br from-primary-600 via-maldives-blue to-maldives-turquoise">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <Mail className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Stay Updated with Exclusive Deals
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Subscribe to our newsletter and be the first to know about special offers, 
              new resort partnerships, and insider tips for your perfect Maldives getaway.
            </p>
          </div>

          {/* Newsletter Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                loading={isLoading}
                className="bg-white text-primary-600 hover:bg-gray-100 px-6 py-3 h-auto"
              >
                <Send className="w-5 h-5 mr-2" />
                Subscribe
              </Button>
            </div>
          </form>

          {/* Benefits */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-white/90">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Up to 30%</div>
              <div className="text-sm">Exclusive Discounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">Weekly</div>
              <div className="text-sm">Travel Inspiration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">First Access</div>
              <div className="text-sm">New Resort Launches</div>
            </div>
          </div>

          {/* Privacy Note */}
          <p className="mt-8 text-sm text-white/70">
            We respect your privacy. Unsubscribe at any time. 
            <br className="hidden sm:inline" />
            No spam, just amazing deals and travel inspiration.
          </p>
        </div>
      </div>
    </section>
  );
}