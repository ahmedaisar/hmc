// Temporary file to test TypeScript types
import { apiClient, ApiResponse } from '@/lib/api';
import { Hotel } from '@/types';

// Test the API response type
async function testHotelsAPI() {
  const response = await apiClient.hotels.getAll({ limit: 6 });
  
  // This should work now - accessing data.data
  if (response.data) {
    const hotels: Hotel[] = response.data;
    hotels.forEach(hotel => {
      console.log(hotel.name, hotel.averageRating, hotel.startingPrice);
    });
  }
}

// Test the type structure
type HotelsResponse = ApiResponse<Hotel[]>;
const mockResponse: HotelsResponse = {
  data: [
    {
      id: '1',
      name: 'Test Hotel',
      slug: 'test-hotel',
      description: 'A test hotel',
      email: 'test@hotel.com',
      phone: '+1234567890',
      island: 'Test Island',
      atoll: 'Test Atoll',
      category: 'LUXURY_RESORT',
      starRating: 5,
      totalRooms: 100,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      images: ['image1.jpg'],
      amenities: [],
      isActive: true,
      isApproved: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      averageRating: 4.5,
      startingPrice: 500
    }
  ]
};

export { testHotelsAPI, mockResponse };