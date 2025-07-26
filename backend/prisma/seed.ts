import { PrismaClient, UserRole, HotelCategory, RoomType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@maldiveshotels.com' },
    update: {},
    create: {
      email: 'admin@maldiveshotels.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.SUPER_ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  // Create hotel manager
  const managerPassword = await bcrypt.hash('manager123', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@sonevaresorts.com' },
    update: {},
    create: {
      email: 'manager@sonevaresorts.com',
      password: managerPassword,
      firstName: 'Resort',
      lastName: 'Manager',
      role: UserRole.HOTEL_MANAGER,
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample guest
  const guestPassword = await bcrypt.hash('guest123', 12);
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      password: guestPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: UserRole.GUEST,
      isVerified: true,
      isActive: true,
    },
  });

  // Create sample hotels
  const sonevaFushi = await prisma.hotel.upsert({
    where: { slug: 'soneva-fushi' },
    update: {},
    create: {
      name: 'Soneva Fushi',
      slug: 'soneva-fushi',
      description: 'Soneva Fushi inspires the imagination with 63 spacious beachfront villas, ranging in size from one to nine bedrooms, hidden among dense foliage within touching distance of a pristine beach. The villas are built from sustainable materials and designed to reflect the simple beauty of a castaway lifestyle.',
      shortDesc: 'Luxury eco-resort with overwater and beach villas in Baa Atoll',
      email: 'reservations@soneva.com',
      phone: '+960 660 0304',
      website: 'https://soneva.com/soneva-fushi',
      island: 'Kunfunadhoo',
      atoll: 'Baa Atoll',
      coordinates: { lat: 5.1167, lng: 73.0833 },
      category: HotelCategory.LUXURY_RESORT,
      starRating: 5,
      totalRooms: 63,
      checkInTime: '15:00',
      checkOutTime: '12:00',
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
      amenities: [
        { name: 'Private Beach', icon: 'beach', category: 'Beach' },
        { name: 'Spa', icon: 'spa', category: 'Wellness' },
        { name: 'Multiple Restaurants', icon: 'restaurant', category: 'Dining' },
        { name: 'Water Sports', icon: 'water-sports', category: 'Activities' },
        { name: 'Kids Club', icon: 'kids', category: 'Family' },
        { name: 'Observatory', icon: 'telescope', category: 'Unique' },
      ],
      facilities: [
        { name: 'Cinema Paradiso', description: 'Outdoor cinema under the stars' },
        { name: 'Six Senses Spa', description: 'Award-winning spa treatments' },
        { name: 'Observatory', description: 'Stargazing with professional telescope' },
      ],
      activities: [
        { name: 'Snorkeling', description: 'Explore vibrant coral reefs' },
        { name: 'Dolphin Watching', description: 'Encounter playful dolphins' },
        { name: 'Sunset Fishing', description: 'Traditional Maldivian fishing' },
      ],
      policies: {
        cancellation: 'Free cancellation up to 7 days before arrival',
        children: 'Children of all ages welcome',
        pets: 'Pets not allowed',
        smoking: 'Non-smoking property',
      },
      isActive: true,
      isApproved: true,
      managerId: manager.id,
      metaTitle: 'Soneva Fushi - Luxury Resort in Maldives | Book Now',
      metaDesc: 'Experience luxury at Soneva Fushi, an eco-friendly resort in Baa Atoll with overwater villas, pristine beaches, and world-class amenities.',
      keywords: ['maldives', 'luxury resort', 'overwater villa', 'baa atoll', 'eco resort'],
    },
  });

  const conradMaldives = await prisma.hotel.upsert({
    where: { slug: 'conrad-maldives-rangali-island' },
    update: {},
    create: {
      name: 'Conrad Maldives Rangali Island',
      slug: 'conrad-maldives-rangali-island',
      description: 'Conrad Maldives Rangali Island is a luxury resort featuring the world\'s first undersea restaurant, Ithaa. The resort spans two islands connected by a bridge, offering both beach and overwater accommodations with stunning ocean views.',
      shortDesc: 'Iconic luxury resort with underwater restaurant and dual-island experience',
      email: 'reservations@conradmaldives.com',
      phone: '+960 668 0629',
      website: 'https://conradmaldives.com',
      island: 'Rangali Island',
      atoll: 'South Ari Atoll',
      coordinates: { lat: 3.9333, lng: 72.8167 },
      category: HotelCategory.LUXURY_RESORT,
      starRating: 5,
      totalRooms: 150,
      checkInTime: '15:00',
      checkOutTime: '12:00',
      images: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
      ],
      amenities: [
        { name: 'Underwater Restaurant', icon: 'underwater', category: 'Dining' },
        { name: 'Overwater Spa', icon: 'spa', category: 'Wellness' },
        { name: 'Multiple Pools', icon: 'pool', category: 'Recreation' },
        { name: 'Water Sports Center', icon: 'water-sports', category: 'Activities' },
        { name: 'Kids Club', icon: 'kids', category: 'Family' },
        { name: 'Tennis Court', icon: 'tennis', category: 'Sports' },
      ],
      facilities: [
        { name: 'Ithaa Undersea Restaurant', description: 'World\'s first all-glass undersea restaurant' },
        { name: 'The Spa Retreat', description: 'Overwater spa with holistic treatments' },
        { name: 'Sunset Grill', description: 'Beachfront dining with sunset views' },
      ],
      activities: [
        { name: 'Diving', description: 'Explore world-class dive sites' },
        { name: 'Whale Shark Excursions', description: 'Swim with gentle giants' },
        { name: 'Seaplane Tours', description: 'Aerial views of the atolls' },
      ],
      policies: {
        cancellation: 'Free cancellation up to 14 days before arrival',
        children: 'Children of all ages welcome',
        pets: 'Pets not allowed',
        smoking: 'Designated smoking areas only',
      },
      isActive: true,
      isApproved: true,
      managerId: manager.id,
      metaTitle: 'Conrad Maldives Rangali Island - Underwater Restaurant Resort',
      metaDesc: 'Stay at Conrad Maldives featuring the world\'s first undersea restaurant. Luxury overwater and beach villas in South Ari Atoll.',
      keywords: ['conrad maldives', 'underwater restaurant', 'luxury resort', 'south ari atoll'],
    },
  });

  // Create room types for Soneva Fushi
  const sonevaRooms = [
    {
      name: 'Crusoe Villa',
      slug: 'crusoe-villa',
      description: 'Spacious beachfront villa with direct beach access, outdoor bathroom, and private terrace.',
      shortDesc: 'Beachfront villa with outdoor bathroom',
      type: RoomType.BEACH_VILLA,
      capacity: 3,
      bedType: 'King Bed',
      size: 410,
      view: 'Beach',
      basePrice: 2500,
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      ],
      amenities: [
        { name: 'Private Beach Access', icon: 'beach' },
        { name: 'Outdoor Bathroom', icon: 'bathroom' },
        { name: 'Air Conditioning', icon: 'ac' },
        { name: 'Mini Bar', icon: 'minibar' },
        { name: 'WiFi', icon: 'wifi' },
      ],
      totalUnits: 20,
    },
    {
      name: 'Crusoe Villa with Pool',
      slug: 'crusoe-villa-pool',
      description: 'Beachfront villa featuring a private pool, outdoor bathroom, and expansive deck area.',
      shortDesc: 'Beachfront villa with private pool',
      type: RoomType.BEACH_VILLA,
      capacity: 3,
      bedType: 'King Bed',
      size: 500,
      view: 'Beach',
      basePrice: 3200,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      ],
      amenities: [
        { name: 'Private Pool', icon: 'pool' },
        { name: 'Private Beach Access', icon: 'beach' },
        { name: 'Outdoor Bathroom', icon: 'bathroom' },
        { name: 'Butler Service', icon: 'butler' },
        { name: 'WiFi', icon: 'wifi' },
      ],
      totalUnits: 15,
    },
    {
      name: 'Water Retreat',
      slug: 'water-retreat',
      description: 'Overwater villa with glass floor panels, direct lagoon access, and water slide.',
      shortDesc: 'Overwater villa with water slide',
      type: RoomType.OVERWATER_VILLA,
      capacity: 4,
      bedType: 'King Bed',
      size: 410,
      view: 'Lagoon',
      basePrice: 4500,
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
      amenities: [
        { name: 'Water Slide', icon: 'slide' },
        { name: 'Glass Floor Panels', icon: 'glass' },
        { name: 'Direct Lagoon Access', icon: 'lagoon' },
        { name: 'Outdoor Bathroom', icon: 'bathroom' },
        { name: 'Butler Service', icon: 'butler' },
      ],
      totalUnits: 10,
    },
  ];

  for (const roomData of sonevaRooms) {
    await prisma.room.upsert({
      where: { hotelId_slug: { hotelId: sonevaFushi.id, slug: roomData.slug } },
      update: {},
      create: {
        ...roomData,
        hotelId: sonevaFushi.id,
      },
    });
  }

  // Create room types for Conrad Maldives
  const conradRooms = [
    {
      name: 'Beach Villa',
      slug: 'beach-villa',
      description: 'Elegant beachfront villa with private terrace and direct beach access.',
      shortDesc: 'Beachfront villa with private terrace',
      type: RoomType.BEACH_VILLA,
      capacity: 3,
      bedType: 'King Bed',
      size: 125,
      view: 'Beach',
      basePrice: 1800,
      images: [
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
      ],
      amenities: [
        { name: 'Private Beach Access', icon: 'beach' },
        { name: 'Private Terrace', icon: 'terrace' },
        { name: 'Air Conditioning', icon: 'ac' },
        { name: 'Mini Bar', icon: 'minibar' },
        { name: 'WiFi', icon: 'wifi' },
      ],
      totalUnits: 50,
    },
    {
      name: 'Water Villa',
      slug: 'water-villa',
      description: 'Overwater villa with glass floor panels and direct lagoon access.',
      shortDesc: 'Overwater villa with lagoon access',
      type: RoomType.OVERWATER_VILLA,
      capacity: 3,
      bedType: 'King Bed',
      size: 125,
      view: 'Lagoon',
      basePrice: 2800,
      images: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
      amenities: [
        { name: 'Glass Floor Panels', icon: 'glass' },
        { name: 'Direct Lagoon Access', icon: 'lagoon' },
        { name: 'Private Deck', icon: 'deck' },
        { name: 'Butler Service', icon: 'butler' },
        { name: 'WiFi', icon: 'wifi' },
      ],
      totalUnits: 50,
    },
    {
      name: 'Sunset Water Villa',
      slug: 'sunset-water-villa',
      description: 'Premium overwater villa with sunset views and private pool.',
      shortDesc: 'Overwater villa with sunset views and pool',
      type: RoomType.OVERWATER_VILLA,
      capacity: 4,
      bedType: 'King Bed',
      size: 175,
      view: 'Sunset',
      basePrice: 3500,
      images: [
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=800',
      ],
      amenities: [
        { name: 'Private Pool', icon: 'pool' },
        { name: 'Sunset Views', icon: 'sunset' },
        { name: 'Glass Floor Panels', icon: 'glass' },
        { name: 'Butler Service', icon: 'butler' },
        { name: 'Premium Amenities', icon: 'premium' },
      ],
      totalUnits: 25,
    },
  ];

  for (const roomData of conradRooms) {
    await prisma.room.upsert({
      where: { hotelId_slug: { hotelId: conradMaldives.id, slug: roomData.slug } },
      update: {},
      create: {
        ...roomData,
        hotelId: conradMaldives.id,
      },
    });
  }

  // Create sample availability data for the next 365 days
  const rooms = await prisma.room.findMany();
  const startDate = new Date();
  
  for (const room of rooms) {
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Vary availability and pricing based on season
      const isHighSeason = date.getMonth() >= 11 || date.getMonth() <= 2; // Dec-Feb
      const baseAvailability = Math.floor(room.totalUnits * 0.8); // 80% base availability
      const seasonalMultiplier = isHighSeason ? 1.5 : 1.0;
      
      await prisma.availability.upsert({
        where: {
          hotelId_roomId_date: {
            hotelId: room.hotelId,
            roomId: room.id,
            date: date,
          },
        },
        update: {},
        create: {
          hotelId: room.hotelId,
          roomId: room.id,
          date: date,
          available: Math.max(1, baseAvailability - Math.floor(Math.random() * 3)),
          price: Math.round(room.basePrice * seasonalMultiplier),
          currency: 'USD',
        },
      });
    }
  }

  // Create sample content
  await prisma.content.upsert({
    where: { slug: 'maldives-travel-guide' },
    update: {},
    create: {
      type: 'GUIDE',
      title: 'Ultimate Maldives Travel Guide',
      slug: 'maldives-travel-guide',
      content: '<h1>Welcome to the Maldives</h1><p>The Maldives is a tropical paradise consisting of 1,192 coral islands grouped into 26 atolls...</p>',
      excerpt: 'Everything you need to know about traveling to the Maldives',
      featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      metaTitle: 'Ultimate Maldives Travel Guide - Tips & Recommendations',
      metaDesc: 'Complete guide to traveling in the Maldives including best resorts, activities, and travel tips.',
      keywords: ['maldives', 'travel guide', 'vacation', 'tropical paradise'],
      isPublished: true,
      publishedAt: new Date(),
      language: 'en',
    },
  });

  // Create sample promotion
  await prisma.promotion.upsert({
    where: { code: 'EARLY2024' },
    update: {},
    create: {
      hotelId: sonevaFushi.id,
      title: 'Early Bird 2024',
      description: 'Book early and save 20% on your 2024 Maldives vacation',
      code: 'EARLY2024',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      usageLimit: 100,
      minAmount: 5000,
      minNights: 5,
      isActive: true,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Created:');
  console.log('- 3 users (admin, manager, guest)');
  console.log('- 2 hotels (Soneva Fushi, Conrad Maldives)');
  console.log('- 6 room types');
  console.log('- 365 days of availability data');
  console.log('- 1 travel guide');
  console.log('- 1 promotion');
  console.log('\n🔑 Login credentials:');
  console.log('Admin: admin@maldiveshotels.com / admin123');
  console.log('Manager: manager@sonevaresorts.com / manager123');
  console.log('Guest: guest@example.com / guest123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });