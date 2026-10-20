/**
 * Astro content collections over the files Keystatic manages in src/content/.
 * Mirrors keystatic.config.ts field for field. Pages read content through
 * getCollection/getEntry (see src/lib/content.ts), never through the file system.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
export const BELT_KEYS = ['unknown', 'white', 'blue', 'purple', 'brown', 'black', 'red'] as const;
export const AUDIENCES = ['adults', 'kids', 'all'] as const;
export const PERIODS = ['month', 'day-pass', '10-pass', 'free'] as const;

const optionalText = z.string().trim().optional().transform((v) => (v ? v : undefined));
const optionalUrl = z.url().optional().or(z.literal('').transform(() => undefined));

const settings = defineCollection({
  loader: glob({ pattern: 'settings.yaml', base: './src/content' }),
  schema: z.object({
    name: z.string(),
    wordmark: z.string(),
    wordmarkSub: optionalText,
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zip: z.string(),
      neighborhood: optionalText,
    }),
    phone: z.string(),
    email: optionalText,
    instagram: optionalUrl,
    facebook: optionalUrl,
    gymdesk: z.object({
      signupUrl: z.url(),
      loginUrl: optionalUrl,
      leadFormEmbed: optionalText,
      bookingEmbed: optionalText,
    }),
    mapEmbedUrl: optionalUrl,
    parkingNote: optionalText,
    scheduleNote: optionalText,
    geo: z
      .object({ lat: z.number().nullable().optional(), lng: z.number().nullable().optional() })
      .optional(),
  }),
});

const promo = defineCollection({
  loader: glob({ pattern: 'promo.yaml', base: './src/content' }),
  schema: z.object({
    enabled: z.boolean().default(true),
    tag: optionalText,
    message: z.string(),
    linkLabel: optionalText,
    linkUrl: optionalUrl,
    expiresOn: z.coerce.date().nullable().optional(),
  }),
});

const programs = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/programs' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      shortName: optionalText,
      order: z.number().int(),
      tags: z.array(z.string()).default([]),
      startHere: z.boolean().default(false),
      summary: z.string(),
      learn: z.array(z.string()).default([]),
      audience: z.enum(AUDIENCES).default('adults'),
      who: optionalText,
      image: image(),
      imageAlt: z.string(),
      imagePosition: optionalText,
    }),
});

const schedule = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/schedule' }),
  schema: z.object({
    label: z.string(),
    day: z.enum(DAY_KEYS),
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM'),
    durationMin: z.number().int().positive().default(60),
    program: reference('programs'),
  }),
});

const coaches = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/coaches' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      order: z.number().int(),
      belt: z.enum(BELT_KEYS).default('unknown'),
      beltNote: optionalText,
      lineage: optionalText,
      specialties: z.array(z.string()).default([]),
      bio: z.string(),
      teaches: z.string(),
      teachesLabel: optionalText,
      photo: image().nullable().optional(),
      photoPosition: optionalText,
      showOnHome: z.boolean().default(false),
    }),
});

const pricing = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/pricing' }),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    period: z.enum(PERIODS).default('month'),
    tag: optionalText,
    features: z.array(z.string()).default([]),
    highlighted: z.boolean().default(false),
    ctaUrl: optionalUrl,
    order: z.number().int(),
  }),
});

export const collections = { settings, promo, programs, schedule, coaches, pricing };
