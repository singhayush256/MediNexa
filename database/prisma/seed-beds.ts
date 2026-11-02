import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedFacilitiesAndBeds() {
  // 1. Find or create Organization
  let org = await prisma.organization.findFirst();
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'MediNexa Healthcare System',
        code: 'MEDINEXA-CORE',
        type: 'HOSPITAL',
        isActive: true,
      },
    });
  }

  const sampleFacilities = [
    {
      code: 'MEDINEXA-CENTRAL',
      name: 'MediNexa Central Super Specialty Hospital',
      address: '104 Medical Enclave, Health City, Ring Road',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110001',
      phone: '+1 (800) 555-0199',
      email: 'central@medinexa.health',
      latitude: 28.6139,
      longitude: 77.2090,
      facilityType: 'SUPER_SPECIALTY',
      rating: 4.9,
      bedStatus: {
        totalBeds: 250,
        occupiedBeds: 178,
        availableBeds: 72,
        icuBeds: 40,
        icuAvailable: 12,
        generalBeds: 160,
        generalAvailable: 48,
        emergencyBeds: 50,
        emergencyAvailable: 12,
        status: 'AVAILABLE', // Green
      },
    },
    {
      code: 'CITY-LIFE-TRAUMA',
      name: 'City Life Emergency & Trauma Centre',
      address: '45 Western Expressway, Sector 18',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110018',
      phone: '+1 (800) 555-0142',
      email: 'emergency@citylifecare.org',
      latitude: 28.6328,
      longitude: 77.2197,
      facilityType: 'TRAUMA_CENTER',
      rating: 4.7,
      bedStatus: {
        totalBeds: 120,
        occupiedBeds: 102,
        availableBeds: 18,
        icuBeds: 25,
        icuAvailable: 4,
        generalBeds: 65,
        generalAvailable: 10,
        emergencyBeds: 30,
        emergencyAvailable: 4,
        status: 'LIMITED', // Yellow
      },
    },
    {
      code: 'APEX-CHILDREN-HOSP',
      name: 'Apex Children & Multi-Specialty Hospital',
      address: '12 Greenfield Boulevard, Sector 4',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110004',
      phone: '+1 (800) 555-0188',
      email: 'care@apexhospital.org',
      latitude: 28.5890,
      longitude: 77.2340,
      facilityType: 'PEDIATRIC_GENERAL',
      rating: 4.8,
      bedStatus: {
        totalBeds: 95,
        occupiedBeds: 58,
        availableBeds: 37,
        icuBeds: 15,
        icuAvailable: 6,
        generalBeds: 60,
        generalAvailable: 25,
        emergencyBeds: 20,
        emergencyAvailable: 6,
        status: 'AVAILABLE', // Green
      },
    },
    {
      code: 'METRO-CRITICAL-CARE',
      name: 'Metro Heart & Critical Care Institute',
      address: '78 Tech Park Expressway, Sector 62',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110062',
      phone: '+1 (800) 555-0167',
      email: 'critical@metroheart.org',
      latitude: 28.6250,
      longitude: 77.2800,
      facilityType: 'CARDIAC_CRITICAL',
      rating: 4.6,
      bedStatus: {
        totalBeds: 180,
        occupiedBeds: 172,
        availableBeds: 8,
        icuBeds: 35,
        icuAvailable: 2,
        generalBeds: 115,
        generalAvailable: 5,
        emergencyBeds: 30,
        emergencyAvailable: 1,
        status: 'LIMITED', // Yellow
      },
    },
    {
      code: 'ST-JUDE-REGIONAL',
      name: 'St. Jude Regional Healthcare Center',
      address: '300 Harbor Way, South Bay District',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110045',
      phone: '+1 (800) 555-0133',
      email: 'info@stjudehealthcare.org',
      latitude: 28.5200,
      longitude: 77.1800,
      facilityType: 'REGIONAL_HOSPITAL',
      rating: 4.5,
      bedStatus: {
        totalBeds: 140,
        occupiedBeds: 140,
        availableBeds: 0,
        icuBeds: 20,
        icuAvailable: 0,
        generalBeds: 90,
        generalAvailable: 0,
        emergencyBeds: 30,
        emergencyAvailable: 0,
        status: 'FULL', // Red
      },
    },
    {
      code: 'GRACE-VALLEY-MED',
      name: 'Grace Valley Multi-Specialty Hospital',
      address: '90 Highland Avenue, North Ridge',
      city: 'Metro City',
      state: 'Capital Region',
      postalCode: '110085',
      phone: '+1 (800) 555-0155',
      email: 'contact@gracevalleyhealth.com',
      latitude: 28.7200,
      longitude: 77.1500,
      facilityType: 'GENERAL_HOSPITAL',
      rating: 4.7,
      bedStatus: {
        totalBeds: 210,
        occupiedBeds: 145,
        availableBeds: 65,
        icuBeds: 30,
        icuAvailable: 10,
        generalBeds: 140,
        generalAvailable: 45,
        emergencyBeds: 40,
        emergencyAvailable: 10,
        status: 'AVAILABLE', // Green
      },
    },
  ];

  for (const item of sampleFacilities) {
    const { bedStatus, ...facilityData } = item;
    const facility = await prisma.facility.upsert({
      where: { code: facilityData.code },
      update: {
        name: facilityData.name,
        address: facilityData.address,
        phone: facilityData.phone,
        latitude: facilityData.latitude,
        longitude: facilityData.longitude,
        rating: facilityData.rating,
      },
      create: {
        ...facilityData,
        organizationId: org.id,
      },
    });

    await prisma.hospitalBedStatus.upsert({
      where: { facilityId: facility.id },
      update: {
        hospitalName: facility.name,
        totalBeds: bedStatus.totalBeds,
        occupiedBeds: bedStatus.occupiedBeds,
        availableBeds: bedStatus.availableBeds,
        icuBeds: bedStatus.icuBeds,
        icuAvailable: bedStatus.icuAvailable,
        generalBeds: bedStatus.generalBeds,
        generalAvailable: bedStatus.generalAvailable,
        emergencyBeds: bedStatus.emergencyBeds,
        emergencyAvailable: bedStatus.emergencyAvailable,
        status: bedStatus.status,
        lastUpdated: new Date(),
      },
      create: {
        facilityId: facility.id,
        hospitalName: facility.name,
        ...bedStatus,
        lastUpdated: new Date(),
      },
    });
  }

  console.log('Facilities and Bed Status successfully seeded!');
}

seedFacilitiesAndBeds()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
