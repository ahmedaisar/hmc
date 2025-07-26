'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format, addDays } from 'date-fns';

interface SearchFormProps {
  onClose?: () => void;
  compact?: boolean;
}

export function SearchForm({ onClose, compact = false }: SearchFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    destination: '',
    checkIn: format(new Date(), 'yyyy-MM-dd'),
    checkOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const destinations = [
    'All Destinations',
    'North Malé Atoll',
    'South Malé Atoll',
    'Baa Atoll',
    'Ari Atoll',
    'Lhaviyani Atoll',
    'Noonu Atoll',
    'Raa Atoll',
    'Dhaalu Atoll',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchParams = new URLSearchParams({
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      adults: formData.adults.toString(),
      children: formData.children.toString(),
      rooms: formData.rooms.toString(),
      ...(formData.destination && formData.destination !== 'All Destinations' && {
        atoll: formData.destination,
      }),
    });

    router.push(`/hotels?${searchParams.toString()}`);
    onClose?.();
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <div className="flex-1 min-w-0">
          <input
            type="date"
            value={formData.checkIn}
            onChange={(e) => updateFormData('checkIn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="date"
            value={formData.checkOut}
            onChange={(e) => updateFormData('checkOut', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min={formData.checkIn}
          />
        </div>
        <Button type="submit" size="sm">
          <Search className="w-4 h-4" />
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Find Your Perfect Resort</h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Destination */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <MapPin className="w-4 h-4 mr-2" />
            Destination
          </label>
          <select
            value={formData.destination}
            onChange={(e) => updateFormData('destination', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {destinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </div>

        {/* Check-in */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Check-in
          </label>
          <input
            type="date"
            value={formData.checkIn}
            onChange={(e) => updateFormData('checkIn', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min={format(new Date(), 'yyyy-MM-dd')}
          />
        </div>

        {/* Check-out */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4 mr-2" />
            Check-out
          </label>
          <input
            type="date"
            value={formData.checkOut}
            onChange={(e) => updateFormData('checkOut', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min={formData.checkIn}
          />
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 mr-2" />
            Adults
          </label>
          <select
            value={formData.adults}
            onChange={(e) => updateFormData('adults', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} Adult{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 mr-2" />
            Children
          </label>
          <select
            value={formData.children}
            onChange={(e) => updateFormData('children', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {[0, 1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Child' : 'Children'}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-700">
            <Users className="w-4 h-4 mr-2" />
            Rooms
          </label>
          <select
            value={formData.rooms}
            onChange={(e) => updateFormData('rooms', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>
                {num} Room{num > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" size="lg" className="px-8">
          <Search className="w-5 h-5 mr-2" />
          Search Resorts
        </Button>
      </div>
    </form>
  );
}