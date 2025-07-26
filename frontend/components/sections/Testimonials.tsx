'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const testimonials = [
  {
    id: 1,
    name: 'Sarah & Michael Johnson',
    location: 'New York, USA',
    rating: 5,
    text: 'Our honeymoon at Soneva Fushi was absolutely magical. The overwater villa was stunning, and the service was impeccable. The booking process through Maldives Hotels was seamless and stress-free.',
    resort: 'Soneva Fushi',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Emma Thompson',
    location: 'London, UK',
    rating: 5,
    text: 'I\'ve traveled to many tropical destinations, but the Maldives exceeded all expectations. The crystal-clear waters, pristine beaches, and luxury accommodations made this trip unforgettable.',
    resort: 'Conrad Maldives Rangali Island',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'David & Lisa Chen',
    location: 'Singapore',
    rating: 5,
    text: 'The underwater restaurant experience was once-in-a-lifetime! Every detail was perfect, from the seaplane transfer to the spa treatments. We\'re already planning our next visit.',
    resort: 'Conrad Maldives Rangali Island',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Maria Rodriguez',
    location: 'Madrid, Spain',
    rating: 5,
    text: 'Solo travel to the Maldives was the best decision I ever made. The resort staff made me feel so welcome, and the snorkeling was incredible. Thank you for helping me find the perfect resort!',
    resort: 'Soneva Fushi',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="section bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our guests have to say about 
            their unforgettable Maldives experiences.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 text-primary-100">
              <Quote className="w-16 h-16" />
            </div>

            {/* Testimonial Content */}
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonials[currentIndex].rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              <blockquote className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-8">
                "{testimonials[currentIndex].text}"
              </blockquote>

              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-gray-600">
                    {testimonials[currentIndex].location}
                  </div>
                  <div className="text-primary-600 text-sm font-medium">
                    Stayed at {testimonials[currentIndex].resort}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrevious}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-primary-600'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">2,500+</div>
            <div className="text-gray-600">Reviews</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">98%</div>
            <div className="text-gray-600">Would Recommend</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">5 Years</div>
            <div className="text-gray-600">Trusted Service</div>
          </div>
        </div>
      </div>
    </section>
  );
}