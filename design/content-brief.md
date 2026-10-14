# Gracie Charleston Website: Content Brief

Source of truth for the new site's facts and copy. When this file and the mockups disagree on facts (address, prices, links, schedule, bios), this file wins. For visuals, the mockups in `design/mockups/` win.

Last updated: 2026-10-13

---

## Business details

| Field | Value |
|---|---|
| Public name | Relson Gracie Jiu-Jitsu of Charleston |
| Former name (old site) | Gracie Jiu Jitsu of Charleston |
| Owner | Michael (Mike) Key |
| Address | 2467 Savannah Hwy, Suite 130, Charleston, SC 29414 (West Ashley) |
| Phone | (843) 377-5361 (`tel:+18433775361`) |
| Signup / trial link | https://relson-gracie-jiujitsu-of-charleston.gymdesk.com/signup |
| Instagram | https://www.instagram.com/graciejiujitsucharlestonsc/ |
| Facebook | https://www.facebook.com/people/Gracie-Jiujitsu-Charleston/100054647910466/ |

The old address (2070 Sam Rittenberg Blvd, Unit 752, 29407) is retired. Remove it everywhere, including the Google Business Profile.

---

## Weekly schedule

Transcribed from Mike's schedule graphic. There are no classes on Sunday. Class lengths aren't listed, so the site assumes 60 minutes until Mike confirms.

| Day | Time | Class |
|---|---|---|
| Monday | 6:00 AM | Open Mat |
| Monday | 12:00 PM | Mixed Level Jiu Jitsu |
| Monday | 5:00 PM | Youth Jiu Jitsu |
| Monday | 6:00 PM | Fundamentals |
| Monday | 7:00 PM | Mixed Level Jiu Jitsu |
| Tuesday | 12:00 PM | Mixed Level Jiu Jitsu |
| Tuesday | 5:00 PM | Youth Jiu Jitsu |
| Tuesday | 6:00 PM | Mixed Level Jiu Jitsu |
| Wednesday | 6:00 AM | Open Mat |
| Wednesday | 12:00 PM | Mixed Level Jiu Jitsu |
| Wednesday | 5:00 PM | Youth Jiu Jitsu |
| Wednesday | 6:00 PM | Fundamentals |
| Wednesday | 7:00 PM | Mixed Level Jiu Jitsu |
| Thursday | 12:00 PM | MMA |
| Thursday | 5:00 PM | Youth Jiu Jitsu |
| Thursday | 6:00 PM | Mixed Level Jiu Jitsu |
| Thursday | 7:00 PM | MMA |
| Friday | 6:00 AM | Open Mat |
| Friday | 12:00 PM | Mixed Level Jiu Jitsu |
| Friday | 6:00 PM | Competition Training |
| Saturday | 10:00 AM | Mixed Level Jiu Jitsu |

### Schedule as data (Keystatic seed)

```json
[
  { "day": "monday",    "start": "06:00", "class": "open-mat" },
  { "day": "monday",    "start": "12:00", "class": "mixed-level" },
  { "day": "monday",    "start": "17:00", "class": "youth" },
  { "day": "monday",    "start": "18:00", "class": "fundamentals" },
  { "day": "monday",    "start": "19:00", "class": "mixed-level" },
  { "day": "tuesday",   "start": "12:00", "class": "mixed-level" },
  { "day": "tuesday",   "start": "17:00", "class": "youth" },
  { "day": "tuesday",   "start": "18:00", "class": "mixed-level" },
  { "day": "wednesday", "start": "06:00", "class": "open-mat" },
  { "day": "wednesday", "start": "12:00", "class": "mixed-level" },
  { "day": "wednesday", "start": "17:00", "class": "youth" },
  { "day": "wednesday", "start": "18:00", "class": "fundamentals" },
  { "day": "wednesday", "start": "19:00", "class": "mixed-level" },
  { "day": "thursday",  "start": "12:00", "class": "mma" },
  { "day": "thursday",  "start": "17:00", "class": "youth" },
  { "day": "thursday",  "start": "18:00", "class": "mixed-level" },
  { "day": "thursday",  "start": "19:00", "class": "mma" },
  { "day": "friday",    "start": "06:00", "class": "open-mat" },
  { "day": "friday",    "start": "12:00", "class": "mixed-level" },
  { "day": "friday",    "start": "18:00", "class": "competition" },
  { "day": "saturday",  "start": "10:00", "class": "mixed-level" }
]
```

---

## Programs

Six programs, matching the schedule. Descriptions are paraphrased from the old site and Gymdesk and are drafts for Mike to review. Each program gets its own page at `/programs/<slug>`.

| Slug | Name | Tags | Draft description |
|---|---|---|---|
| `mixed-level` | Mixed Level Jiu Jitsu | Start here · All levels | The core adult class, open to all levels. No-Gi grappling covering positions, submissions, escapes and transitions, plus live rolling. |
| `fundamentals` | Fundamentals | Start here · Beginners | Step-by-step, repetition-based instruction in core ground techniques and self-defense. Made for beginners, and useful for any belt who wants sharper basics. |
| `youth` | Youth Jiu Jitsu | Kids · [Ages TBD] | Kids learn real self-defense, including against bigger opponents, while building focus, discipline and confidence. |
| `mma` | MMA | Adults | Mixed martial arts training for adults. Included in the Adult membership. |
| `open-mat` | Open Mat | Members | Unstructured early-morning rolling and drilling. Free for members, one session a day. |
| `competition` | Competition Training | Competitors | Friday-evening session for students preparing to compete. |

**Fundamentals detail page** (the template example in the mockups):
- What you'll learn: core ground techniques and self-defense; safe training habits; timing, and when to tap; rolling etiquette.
- Your first class: (1) start your free week online through Gymdesk; (2) wear a rash guard and shorts, no gi needed; (3) come to a 6 PM class Monday or Wednesday.
- Cost line: "Included in the Adult membership · first week free."

Programs on the old site that **aren't on the new schedule**: Striking, Wrestling, Gracie Gauntlet, and Self Defense. Leave them off unless Mike says they're still running. Striking may now be part of MMA (James's and Sebastian's bios still mention striking and wrestling coaching).

---

## Coaches

In display order. Bios are from Mike's team, lightly edited for grammar. Bracketed items are placeholders.

### 1. Relson Gracie
- **Role:** Head Instructor
- **Belt:** Red belt · Grandmaster
- **Tags:** Self-defense, Seminars
- **Teaches:** Seminars · privates
- **Photo:** `Photos/Relson/images.jpg` (promo poster, shows a gi; replace with a No-Gi portrait when available)
- **Bio:** Relson Gracie is the second oldest son of Grandmaster Helio Gracie, the man credited with creating what is now known as Gracie Jiu-Jitsu. Relson has trained since he was two and began competing at 10. He was the Brazilian National Champion for 22 consecutive years in both his weight class and the open division, earning the nickname "Campeão," Portuguese for champion. In 1988 he moved to Hawaii, bringing his art with him. He still teaches all over the world and visits Charleston often for seminars, private lessons and competitions. Long retired from competition, he trains, like his father, for self-defense and personal advancement.

### 2. Michael Key
- **Role:** Owner · Instructor
- **Belt:** [Belt rank] · Relson Gracie
- **Tags:** [Specialty]
- **Teaches:** [Classes]
- **Photo:** `Photos/Mike Key/IMG_7901.JPG`, cropped to 4:5 around his face
- **Bio:** [Bio from Mike: how long he's trained, who promoted him, what he teaches.]

### 3. Jerry Brewer
- **Role:** Instructor
- **Belt:** Black belt · Relson Gracie
- **Tags:** Competition, Combatives
- **Teaches:** [Classes]
- **Photo:** `Photos/Jerry/images.webp` (300px, shows a gi; replace when a larger No-Gi portrait is available)
- **Bio:** Jerry Brewer is a certified Gracie Jiu-Jitsu black belt under Grandmaster Relson Gracie. He has trained since 1998 and is credited with bringing Gracie Jiu-Jitsu to Charleston. He won gold in the advanced heavyweight division of the 2004 SC State Grappling Championship, took silver in the heavyweight division of the 2003 Arnold Gracie World Championships, and led his team to six consecutive state championships. A shoulder injury ended his competition career in 2006. His proudest accomplishment is teaching, and he is certified as a Level 3 Modern Army Combatives Instructor, a level few civilians reach.

### 4. James Foy
- **Role:** Instructor
- **Belt:** Black belt · Relson Gracie (2022)
- **Tags:** Adult BJJ, Striking
- **Teaches:** Adult BJJ · Striking
- **Photo:** `Photos/James/images.webp`
- **Bio:** James is our resident Adult BJJ and Striking Fundamentals coach. He has trained Brazilian Jiu-Jitsu and mixed martial arts since 2007, received his black belt from Master Relson Gracie in 2022, and has helped many students reach their own promotions since. He holds a 5-2 amateur MMA record, with three wins by submission. Students love how he teaches advanced techniques in a beginner-friendly way and puts the striking-shy at ease. His eldest started jiu jitsu here and joins his dad's striking classes every week.

### 5. Sebastian Seagraves
- **Role:** Instructor · Youth coach
- **Belt:** Purple belt · Relson Gracie
- **Tags:** Youth, MMA
- **Teaches:** Youth · Fundamentals · Adult BJJ
- **Photo:** `Photos/Sebastian/Hero.webp`
- **Bio:** Sebastian is our resident Youth coach and assistant wrestling and striking coach, and he coaches Fundamentals and Adult BJJ as scheduling allows. A purple belt under Relson Gracie, Mike Key, Pat McGuigan and James Foy, he trains here most days of the week. He started jiu jitsu at Gracie Charleston in 2016 and earned his blue belt in 2018, then served four years in the US Marine Corps Infantry, where he began fighting MMA. He came home in 2022 and earned his purple belt that July. He is an active MMA fighter with a 5-1-0 record (as of February 2024), mostly first-round finishes.

### 6. Aryan
- **Role:** [Role]
- **Belt:** [Belt rank]
- **Teaches:** [Classes]
- **Photo:** [none yet]
- **Bio:** [Bio for Aryan.]

---

## Pricing and offers (from Gymdesk)

| Plan | Price | Includes |
|---|---|---|
| Free trial | Free for 1 week | Unlimited access to all programs |
| Adult No-Gi Jiu Jitsu & MMA | $100/month | Unlimited MMA, No-Gi BJJ Adults, Open Mat |
| Kids No-Gi Jiu Jitsu | $100/month | Unlimited Kids No-Gi BJJ, Open Mat |
| 1-day pass | $25 | Unlimited for 1 day (drop-ins / travelers) |
| 10-day pass | $150 | 10 days within 1 year |
| Open Mat add-on | Free | 1 session per day |

**Main call to action for the whole site: "Start your free week."** It links to the Gymdesk signup. There is no sign-up page on the site; "Sign up" in the nav also goes straight to Gymdesk.

---

## Open questions for Mike

1. **Logo file:** The copy we have is a tiny web image. Need the original vector (SVG/AI/EPS/PDF) or a large PNG with a transparent background.
2. **Class lengths:** Are all classes 60 minutes?
3. **Youth age range:** What ages is Youth Jiu Jitsu for? Is there a younger "little kids" group?
4. **Retired programs:** Are Striking, Wrestling, Gracie Gauntlet, and Self Defense gone or folded into other classes?
5. **Pricing on the site:** The mockups show prices publicly. Confirm that's OK.
6. **Coaches:** Mike's own belt, bio, and classes; Aryan's role, belt, bio, and photo; which classes Relson, Jerry, and Mike teach; No-Gi portraits for Relson and Jerry; a current MMA record for Sebastian.
7. **Photos:** High-res originals of the photos used in the mockups, plus the new space (exterior, mats, classes, kids class with parent consent).
8. **Parking and entrance:** Any directions for Suite 130? (Used on the contact page and the Google listing.)
9. **Gymdesk embeds:** Lead-form and booking widget embed codes for the contact page.

---

## Confirmed decisions

- **Name:** Relson Gracie Jiu-Jitsu of Charleston.
- **No-Gi only.** The whole gym trains No-Gi. Copy says "No-Gi jiu jitsu," and photos show rash guards and shorts, not gis. No stock photos. The only exception is the current coach portraits of Relson and Jerry, until No-Gi ones are available.
- **Voice:** plain statements, no slogans or taglines. The old "No gi. No ego. Just jiu jitsu." line is out. Hero copy: "No-Gi jiu jitsu and MMA." / "West Ashley, Charleston. Adults and kids, all levels. First week free."
- **No sign-up page.** Every sign-up link goes straight to Gymdesk.
- **Logo:** A circular Relson Gracie badge in black and white, with the Gracie triangle in the center and the name around the ring. It needs a solid light or dark background, and the ring text needs enough size to stay readable: about 56–64px in the header, larger in the footer.

## Design decisions

- **Direction:** "Rash Guard." Dark by default: graphite (#121212), chalk (#FAFAF7), and concrete. The one accent is an electric purple (#9D6BFF on dark, #6B3FD9 on light).
- **Type:** Archivo **condensed** (62% width, weight 900, uppercase, tight 0.8 leading) for headlines, set very large. The program-name marquee and the small header wordmark stay expanded for contrast. Geist for body text, Geist Mono for class times and prices.
- **Photos:** black and white, so purple is the only color. The homepage hero uses a mirrored copy of the arm-lock photo so the coach's face clears the headline.
- **Coach cards:** fighter-style cards with the name over the portrait and a belt stripe in each coach's rank color.
- **Animation:** GSAP 3.13+ with ScrollTrigger and SplitText, including a 3D tilt on coach cards (desktop only). Disable all motion when the visitor's system is set to reduce motion.
- **Loose reference:** fenriz-gym.com, for trainer cards with discipline tags, class blocks with schedules attached, and the trial button always in the header.
- **Design system:** the "Relson Gracie Charleston" Design System artifact, copied into `design/design-system/`.
- **Mike's schedule graphic is not a style reference.** Don't reuse its red, blue, or neon look.
