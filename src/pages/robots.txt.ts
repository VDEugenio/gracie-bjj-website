/**
 * robots.txt, built so the sitemap line follows SITE_URL.
 * The Keystatic admin and its API stay out of search results.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).href;
  const body = ['User-agent: *', 'Allow: /', 'Disallow: /keystatic', 'Disallow: /api/', '', `Sitemap: ${sitemap}`, ''].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
