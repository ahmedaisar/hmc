'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Star, MapPin, Wifi, Car, Utensils } from 'lucide-react';
import { apiClient, ApiResponse } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Hotel } from '@/types';

export function FeaturedHotels() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['featured-hotels'],
    queryFn: () => apiClient.hotels.getAll({ limit: 6, sortBy: 'rating', sortOrder: 'desc' }),
  });

  if (isLoading) {
    return (
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Resorts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of luxury resorts
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-300" />
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-4 bg-gray-300 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !data?.data) {
    return (
      <section className="section bg-gray-50">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Resorts
          </h2>
          <p className="text-gray-600">Unable to load featured resorts at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section bg-gray-50">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Featured Resorts
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of luxury resorts offering the perfect blend 
            of comfort, elegance, and natural beauty
          </p>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {data.data.map((hotel: Hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift group"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={hotel.images?.[0] || '/images/hotel-placeholder.jpg'}
                  alt={hotel.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                    {hotel.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {hotel.averageRating || 5.0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hotel.island}, {hotel.atoll}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {hotel.name}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {hotel.shortDesc || hotel.description}
                </p>

                {/* Amenities */}
                <div className="flex items-center space-x-4 mb-4 text-gray-500">
                  <div className="flex items-center">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-xs">WiFi</span>
                  </div>
                  <div className="flex items-center">
                    <Utensils className="w-4 h-4 mr-1" />
                    <span className="text-xs">Restaurant</span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    <span className="text-xs">Transfer</span>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(hotel.startingPrice || 500)}
                    </div>
                    <div className="text-sm text-gray-500">per night</div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/hotels/${hotel.slug}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/hotels">
              View All Resorts
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}