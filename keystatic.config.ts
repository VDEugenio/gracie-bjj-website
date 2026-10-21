/**
 * Keystatic admin schema. Mike edits everything here at /keystatic.
 *
 * The files Keystatic writes live in src/content/ and are read by Astro
 * content collections (src/content.config.ts). Keep the two schemas in sync:
 * every field here has a matching zod field there.
 *
 * Storage:
 *   local  - dev only, writes to the file system (default).
 *   cloud  - Keystatic Cloud, works in production. Mike edits without a GitHub account.
 * TODO(mike): once the Keystatic Cloud project exists, set KEYSTATIC_STORAGE=cloud and
 * PUBLIC_KEYSTATIC_CLOUD_PROJECT=team/project in .env (see .env.example).
 */
import { collection, config, fields, singleton } from '@keystatic/core';

const cloudProject = import.meta.env.PUBLIC_KEYSTATIC_CLOUD_PROJECT as string | undefined;
const storageKind = (import.meta.env.KEYSTATIC_STORAGE as string | undefined) === 'cloud' ? 'cloud' : 'local';

const DAYS = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
] as const;

const BELTS = [
  { label: 'Not set yet (shows "[Belt rank]")', value: 'unknown' },
  { label: 'White belt', value: 'white' },
  { label: 'Blue belt', value: 'blue' },
  { label: 'Purple belt', value: 'purple' },
  { label: 'Brown belt', value: 'brown' },
  { label: 'Black belt', value: 'black' },
  { label: 'Red belt', value: 'red' },
] as const;

/** Short text list, e.g. tags or specialties. */
const textList = (label: string, itemLabel: string, description?: string) =>
  fields.array(fields.text({ label: itemLabel, validation: { isRequired: true } }), {
    label,
    description,
    itemLabel: (props) => props.value,
  });

export default config({
  storage:
    storageKind === 'cloud'
      ? { kind: 'cloud' }
      : { kind: 'local' },
  ...(storageKind === 'cloud' && cloudProject ? { cloud: { project: cloudProject } } : {}),

  ui: {
    brand: { name: 'Relson Gracie Charleston' },
    navigation: {
      Gym: ['settings', 'promo'],
      Classes: ['programs', 'schedule', 'pricing'],
      People: ['coaches'],
    },
  },

  singletons: {
    settings: singleton({
      label: 'Gym settings',
      path: 'src/content/settings',
      format: { data: 'yaml' },
      schema: {
        name: fields.text({ label: 'Gym name', validation: { isRequired: true } }),
        wordmark: fields.text({
          label: 'Header wordmark',
          description: 'The short name next to the badge on desktop, e.g. "Relson Gracie".',
          validation: { isRequired: true },
        }),
        wordmarkSub: fields.text({
          label: 'Header wordmark subline',
          description: 'e.g. "Charleston · No-Gi"',
        }),
        address: fields.object(
          {
            street: fields.text({ label: 'Street and suite', validation: { isRequired: true } }),
            city: fields.text({ label: 'City', validation: { isRequired: true } }),
            state: fields.text({ label: 'State', validation: { isRequired: true } }),
            zip: fields.text({ label: 'ZIP', validation: { isRequired: true } }),
            neighborhood: fields.text({ label: 'Neighborhood', description: 'e.g. "West Ashley"' }),
          },
          { label: 'Address' },
        ),
        phone: fields.text({
          label: 'Phone (as shown)',
          description: 'e.g. "(843) 377-5361". The tel: link is built from the digits.',
          validation: { isRequired: true },
        }),
        email: fields.text({ label: 'Email', description: 'Optional. Shown on the contact page when set.' }),
        formEmail: fields.text({
          label: 'Contact form email',
          description:
            'Where the contact page\'s "Send message" goes. It opens the visitor\'s email app addressed to this inbox. Not used once the Gymdesk lead form embed is set.',
        }),
        instagram: fields.url({ label: 'Instagram URL' }),
        facebook: fields.url({ label: 'Facebook URL' }),
        gymdesk: fields.object(
          {
            signupUrl: fields.url({
              label: 'Signup URL',
              description: 'Every "Start your free week" and "Sign up" link goes here.',
              validation: { isRequired: true },
            }),
            loginUrl: fields.url({ label: 'Member login URL' }),
            leadFormEmbed: fields.text({
              label: 'Lead form embed code',
              description: 'From Gymdesk > Website > Forms > Embed. Replaces the contact form when set.',
              multiline: true,
            }),
            bookingEmbed: fields.text({
              label: 'Booking widget embed code',
              description: 'From Gymdesk > Gym > Bookings > Settings.',
              multiline: true,
            }),
          },
          { label: 'Gymdesk' },
        ),
        mapEmbedUrl: fields.url({
          label: 'Google Maps embed URL',
          description: 'Optional. The "src" of the iframe from Google Maps > Share > Embed a map. Leave empty to build one from the address.',
        }),
        parkingNote: fields.text({
          label: 'Parking and entrance note',
          description: 'Where to park and which door to use for Suite 130. Shown on the home and contact pages.',
          multiline: true,
        }),
        scheduleNote: fields.text({
          label: 'Schedule note',
          description: 'Short line under the weekly schedule, e.g. "Closed Sunday. Open Mat is for members."',
        }),
        geo: fields.object(
          {
            lat: fields.number({ label: 'Latitude' }),
            lng: fields.number({ label: 'Longitude' }),
          },
          { label: 'Map coordinates', description: 'Used for the Google business markup. Optional.' },
        ),
      },
    }),

    promo: singleton({
      label: 'Promo banner',
      path: 'src/content/promo',
      format: { data: 'yaml' },
      schema: {
        enabled: fields.checkbox({ label: 'Show the banner', defaultValue: true }),
        tag: fields.text({ label: 'Tag', description: 'Small chip, e.g. "This month"' }),
        message: fields.text({
          label: 'Message',
          description: 'Text before an em dash (—) is shown bold, e.g. "First week free — any class, no gi required."',
          validation: { isRequired: true },
        }),
        linkLabel: fields.text({ label: 'Link label', description: 'e.g. "Claim it"' }),
        linkUrl: fields.url({ label: 'Link URL' }),
        expiresOn: fields.date({
          label: 'Expires on',
          description: 'The banner hides itself after this date. Leave empty for no expiry.',
        }),
      },
    }),
  },

  collections: {
    programs: collection({
      label: 'Programs',
      slugField: 'name',
      path: 'src/content/programs/*',
      format: { contentField: 'description' },
      columns: ['order', 'audience'],
      schema: {
        name: fields.slug({
          name: { label: 'Name', description: 'A proper noun, e.g. "Mixed Level Jiu Jitsu".', validation: { isRequired: true } },
        }),
        shortName: fields.text({
          label: 'Short name',
          description: 'For the marquee and link lists, e.g. "Mixed Level". Leave empty to use the full name.',
        }),
        order: fields.integer({ label: 'Order', description: '1 shows first.', validation: { isRequired: true } }),
        tags: textList('Tags', 'Tag', 'Not shown on the site. A "Beginners" tag puts the program first in lists and in the homepage "First time?" line. "Start here" is a separate switch below.'),
        startHere: fields.checkbox({
          label: 'Start here',
          description: 'Marks a beginner-friendly program: suggested to newcomers ("New? Start with …") and shown by the Beginners filter on the schedule. No tag appears on the site.',
          defaultValue: false,
        }),
        summary: fields.text({
          label: 'Summary',
          description: 'One or two sentences for cards and the programs page.',
          multiline: true,
          validation: { isRequired: true },
        }),
        description: fields.markdoc({
          label: 'Description',
          description: 'The intro paragraph on the program page, under "What you\'ll learn".',
          options: { heading: false, image: false, table: false, codeBlock: false, divider: false },
        }),
        learn: textList("What you'll learn", 'Item'),
        audience: fields.select({
          label: 'Audience',
          options: [
            { label: 'Adults', value: 'adults' },
            { label: 'Kids', value: 'kids' },
            { label: 'Adults and kids', value: 'all' },
          ],
          defaultValue: 'adults',
        }),
        who: fields.text({
          label: 'Who it is for',
          description: 'Short line for the "Who" fact on the program page, e.g. "Beginners, and any belt who wants sharper basics". Falls back to the audience.',
        }),
        image: fields.image({
          label: 'Photo',
          description: 'Black and white, portrait orientation. Shown on cards and the program page.',
          directory: 'src/assets/programs',
          publicPath: '/src/assets/programs/',
          validation: { isRequired: true },
        }),
        imageAlt: fields.text({
          label: 'Photo description',
          description: 'What is in the photo, for screen readers.',
          validation: { isRequired: true },
        }),
        imagePosition: fields.text({
          label: 'Photo focus point',
          description: 'Optional CSS object-position, e.g. "50% 35%" to keep faces in frame.',
        }),
      },
    }),

    schedule: collection({
      label: 'Weekly schedule',
      slugField: 'label',
      path: 'src/content/schedule/*',
      format: { data: 'yaml' },
      columns: ['day', 'start', 'program', 'instructor'],
      schema: {
        label: fields.slug({
          name: {
            label: 'Label',
            description: 'For the admin list only, e.g. "Monday 6:00 PM Fundamentals".',
            validation: { isRequired: true },
          },
        }),
        day: fields.select({ label: 'Day', options: DAYS, defaultValue: 'monday' }),
        start: fields.text({
          label: 'Start time',
          description: '24-hour "HH:MM", e.g. "18:00".',
          validation: {
            isRequired: true,
            pattern: { regex: /^([01]\d|2[0-3]):[0-5]\d$/, message: 'Use 24-hour HH:MM, e.g. 18:00' },
          },
        }),
        durationMin: fields.integer({ label: 'Length (minutes)', defaultValue: 60, validation: { isRequired: true, min: 15 } }),
        program: fields.relationship({ label: 'Program', collection: 'programs', validation: { isRequired: true } }),
        instructor: fields.relationship({
          label: 'Instructor',
          description: "Optional. The coach who teaches this class. Their card's \"Teaches\" line lists these classes.",
          collection: 'coaches',
        }),
      },
    }),

    coaches: collection({
      label: 'Coaches',
      slugField: 'name',
      path: 'src/content/coaches/*',
      format: { data: 'yaml' },
      columns: ['order', 'role', 'belt'],
      schema: {
        name: fields.slug({ name: { label: 'Name', validation: { isRequired: true } } }),
        role: fields.text({
          label: 'Role',
          description: 'e.g. "Head Instructor" or "Owner · Instructor". The first part is used on small cards.',
          validation: { isRequired: true },
        }),
        order: fields.integer({ label: 'Order', validation: { isRequired: true } }),
        belt: fields.select({ label: 'Belt', options: BELTS, defaultValue: 'unknown' }),
        beltNote: fields.text({ label: 'Belt note', description: 'e.g. "Grandmaster". Shown instead of the lineage when set.' }),
        lineage: fields.text({ label: 'Lineage', description: 'Who awarded the belt, e.g. "Relson Gracie".' }),
        specialties: textList('Specialties', 'Specialty', 'Short tags like "Competition", "Youth".'),
        bio: fields.text({ label: 'Bio', multiline: true, validation: { isRequired: true } }),
        teaches: fields.text({
          label: 'Teaches (no classes)',
          description:
            'Only shown when no class in the schedule lists this coach as instructor, e.g. "Seminars · privates". Otherwise the card lists their classes and times from the schedule.',
        }),
        teachesLabel: fields.text({
          label: 'Teaches label',
          description: 'Optional. Replaces the word "Teaches" on the card, e.g. "Status" for a coach who no longer teaches.',
        }),
        photo: fields.image({
          label: 'Portrait',
          description: '4:5 portrait, black and white. Leave empty until one is available.',
          directory: 'src/assets/coaches',
          publicPath: '/src/assets/coaches/',
        }),
        photoPosition: fields.text({
          label: 'Portrait focus point',
          description: 'Optional CSS object-position, e.g. "50% 0%" to keep the face in frame.',
        }),
        showOnHome: fields.checkbox({ label: 'Show on the home page', defaultValue: false }),
      },
    }),

    pricing: collection({
      label: 'Pricing',
      slugField: 'name',
      path: 'src/content/pricing/*',
      format: { data: 'yaml' },
      columns: ['order', 'price', 'period'],
      schema: {
        name: fields.slug({ name: { label: 'Plan name', validation: { isRequired: true } } }),
        price: fields.text({ label: 'Price', description: 'As shown, e.g. "$100" or "$0".', validation: { isRequired: true } }),
        period: fields.select({
          label: 'Period',
          options: [
            { label: 'Per month', value: 'month' },
            { label: 'Day pass', value: 'day-pass' },
            { label: '10-day pass', value: '10-pass' },
            { label: 'Free', value: 'free' },
          ],
          defaultValue: 'month',
        }),
        tag: fields.text({ label: 'Tag', description: 'Small chip on the card, e.g. "Adults".' }),
        features: textList('What is included', 'Line'),
        highlighted: fields.checkbox({ label: 'Highlight this plan', defaultValue: false }),
        ctaUrl: fields.url({ label: 'Button URL', description: 'Leave empty to use the Gymdesk signup link.' }),
        order: fields.integer({ label: 'Order', validation: { isRequired: true } }),
      },
    }),
  },
});
