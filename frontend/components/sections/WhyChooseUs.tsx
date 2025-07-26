'use client';

import { Shield, Award, Clock, Heart, Headphones, CreditCard } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Best Price Guarantee',
    description: 'We guarantee the lowest prices on all our resort bookings. Find a lower price elsewhere and we\'ll match it.',
  },
  {
    icon: Award,
    title: 'Handpicked Resorts',
    description: 'Every resort in our collection is carefully selected and inspected to ensure the highest standards of luxury and service.',
  },
  {
    icon: Clock,
    title: 'Instant Confirmation',
    description: 'Get immediate booking confirmation and peace of mind with our real-time availability system.',
  },
  {
    icon: Heart,
    title: 'Personalized Service',
    description: 'Our travel experts provide personalized recommendations and support to make your Maldives experience unforgettable.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer support to assist you before, during, and after your tropical getaway.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Your payment information is protected with bank-level security and multiple payment options available.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="section bg-white">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Maldives Hotels?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to making your Maldives vacation planning effortless and your 
            experience extraordinary. Here's what sets us apart.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center group hover:bg-gray-50 p-6 rounded-2xl transition-colors duration-300"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-20 bg-gradient-to-r from-primary-600 to-maldives-turquoise rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">Happy Guests</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Partner Resorts</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">99%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold mb-2">24/7</div>
              <div className="text-primary-100">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}