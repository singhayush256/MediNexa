import { MetadataRoute } from 'next';
import { OFFICIAL_PRODUCTION_FRONTEND_URL } from '@/lib/domain-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = OFFICIAL_PRODUCTION_FRONTEND_URL;
  const routes = [
    '',
    '/login',
    '/register',
    '/patient-portal',
    '/doctor-portal',
    '/hospital-portal',
    '/staff-portal',
    '/super-admin-portal',
    '/bed-booking',
    '/emergency-ambulance',
    '/portal/appointments',
    '/portal/billing',
    '/portal/medications',
    '/portal/reports',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}

