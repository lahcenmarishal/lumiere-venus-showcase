import { createServerFn } from '@tanstack/react-start';
import { publicClient } from './public-client.server';
import { cached } from './server-cache';

export type Category = { slug: string; name: string; intro: string; image: string; sortOrder: number };
export type Testimonial = { id: string; image: string; caption: string };
export type SiteData = { categories: Category[]; testimonials: Testimonial[]; content: Partial<Record<ContentKey, string>> };
export type ContentKey = 'brand_since' | 'brand_clients' | 'brand_intro' | 'about_story' | 'about_vision' | 'contact_whatsapp' | 'contact_hours';

export const getSiteData = createServerFn({ method: 'GET' }).handler((): Promise<SiteData> => cached('site', 60_000, async (): Promise<SiteData> => {
  const c = publicClient();
  const [cats, tests, content] = await Promise.all([
    c.from('categories').select('*').eq('active', true).order('sort_order'),
    c.from('testimonials').select('id,image,caption').eq('published', true).order('sort_order').order('created_at'),
    c.from('site_content').select('key,value'),
  ]);
  if (cats.error) throw new Error('Impossible de charger le site.');
  return {
    categories: (cats.data ?? []).map(r => ({ slug: r.slug, name: r.name, intro: r.intro, image: r.image, sortOrder: r.sort_order })),
    testimonials: tests.data ?? [],
    content: Object.fromEntries((content.data ?? []).map(r => [r.key, r.value])) as SiteData['content'],
  };
}));
