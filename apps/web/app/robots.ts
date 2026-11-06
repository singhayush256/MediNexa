import { MetadataRoute } from 'next';
import { OFFICIAL_PRODUCTION_FRONTEND_URL } from '@/lib/domain-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/admin/', '/portal/admin/', '/api/'],
    },
    sitemap: `${OFFICIAL_PRODUCTION_FRONTEND_URL}/sitemap.xml`,
  };
}

