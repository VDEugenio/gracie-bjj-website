# Launch checklist

How to get the site live, in order. **Mike** owns every account (GitHub, Cloudflare, Keystatic Cloud, the domain, Google). **You** (the developer) do the technical steps once Mike has added you.

The site is an Astro build deployed to **Cloudflare Workers with static assets** (the current `@astrojs/cloudflare` adapter targets Workers, not classic Pages). In the Cloudflare dashboard this lives under **Workers & Pages**, and it gives the same Git-connected, build-on-every-push setup as Pages.

---

## 0. Before you start

- [ ] **You:** confirm `main` builds (all six phases are already merged there):
  ```sh
  git checkout main
  npm ci
  npm run build
  ```
- [ ] **Mike:** decide the domain, and whether the site lives on `www.` or the bare domain. Every step below uses that one address. This guide calls it `https://www.YOURDOMAIN.com`.
- [ ] **Mike:** send any open items you can (see the end of this file). The site launches fine with placeholders, but visitors will see things like `[Belt rank]` and the dashed parking-note box until they're filled in.

## 1. GitHub repository

Keystatic Cloud saves Mike's edits as commits to a GitHub repo, and Cloudflare rebuilds the site from that repo. Mike needs a GitHub account to **own** the repo. He won't need it to edit content.

1. **Mike:** create a free account at https://github.com/signup.
2. **Mike:** create a **private** repository at https://github.com/new, named for example `gracie-bjj-website`. Leave "Add a README", ".gitignore" and "license" **unchecked**, because the repo must start empty.
3. **Mike:** go to the repo's **Settings → Collaborators → Add people** and invite you with write access.
4. **You:** accept the invite, then push:
   ```sh
   git remote add origin https://github.com/MIKE_USERNAME/gracie-bjj-website.git
   git push -u origin main
   ```
5. **You:** check on GitHub that `.env` was **not** pushed (it's git-ignored; only `.env.example` should be there).

## 2. Keystatic Cloud (content editing at `/keystatic`)

1. **Mike:** sign in at https://keystatic.cloud with his GitHub account.
2. **Mike:** create a **team** (e.g. `relson-gracie-charleston`), then a **project** inside it (e.g. `website`).
3. **Mike:** connect the project to the GitHub repo from step 1. Keystatic will ask him to install its GitHub app. Allow it on **only** that repository.
4. Copy the project ID Keystatic shows. It looks like `team-name/project-name`, for example `relson-gracie-charleston/website`. That's the value of `PUBLIC_KEYSTATIC_CLOUD_PROJECT` below.
5. **Mike:** under the project's team members, invite anyone else who should edit content (by email). Editors sign in with Keystatic Cloud, so they don't need GitHub accounts.
6. **You:** test locally before deploying. In `.env`:
   ```
   KEYSTATIC_STORAGE=cloud
   PUBLIC_KEYSTATIC_CLOUD_PROJECT=relson-gracie-charleston/website
   ```
   Run `npm run dev`, open http://localhost:4321/keystatic, sign in, and confirm the collections (Settings, Promo, Programs, Schedule, Coaches, Pricing) load.

## 3. Cloudflare (hosting)

1. **Mike:** create a free account at https://dash.cloudflare.com/sign-up, then add you under **Manage Account → Members** (Administrator) so you can do the rest.
2. **You:** go to **Workers & Pages → Create → Import a repository**, connect GitHub (install the Cloudflare app on **only** this repo), and pick the repo.
3. **You:** set the build settings:

   | Setting | Value |
   |---|---|
   | Project name | `gracie-bjj-website` (must match `name` in `package.json`, which the adapter uses as the Worker name) |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` |
   | Root directory | `/` (leave empty) |

4. **You:** under **Settings → Build → Variables and secrets**, add these **build** variables. Astro reads them during the build, so they must be build variables, not runtime ones:

   | Name | Value | Why |
   |---|---|---|
   | `SITE_URL` | `https://www.YOURDOMAIN.com` (no trailing slash) | Canonical URLs, Open Graph tags, sitemap, robots.txt, JSON-LD |
   | `KEYSTATIC_STORAGE` | `cloud` | Builds the `/keystatic` admin into production |
   | `PUBLIC_KEYSTATIC_CLOUD_PROJECT` | `team-name/project-name` from step 2.4 | Tells the admin which Keystatic Cloud project to use |
   | `NODE_VERSION` | `22` | Matches `.nvmrc` and the `engines` field (Node 22.12+) |

   None of these are secrets. There are no API keys in this project.
5. **You:** run the first deploy (**Deployments → Retry/Deploy**, or push any commit). Wrangler creates the `SESSION` KV namespace the adapter asks for on its own on the first deploy. If the deploy log says it can't, create a KV namespace (any name, e.g. `gracie-bjj-website-session`) under **Storage & Databases → KV** and bind it to the Worker as `SESSION` (**Settings → Bindings**).
6. **You:** open the `*.workers.dev` URL Cloudflare shows and check:
   - [ ] Every page loads: `/`, `/schedule`, `/programs`, `/programs/fundamentals`, `/coaches`, `/contact`
   - [ ] `/keystatic` shows the Keystatic Cloud sign-in
   - [ ] `/classes`, `/instructors` and `/relson-gracie` redirect (301) to `/programs` or `/coaches`, and `/login` goes to the Gymdesk member login
   - [ ] A "Start your free week" button opens Gymdesk with `utm_source=website&utm_medium=cta&utm_campaign=…` in the address bar
   - [ ] `/robots.txt` and `/sitemap-index.xml` show the real domain (they will once `SITE_URL` is set)

From now on, every push to `main`, including every save Mike makes in Keystatic, rebuilds and redeploys the site in about a minute.

## 4. Point the domain

The domain's DNS has to be managed by Cloudflare to attach it to the Worker.

1. **Mike:** in Cloudflare, **Add a domain** → enter `YOURDOMAIN.com` → Free plan. Cloudflare imports the existing DNS records. **Keep any email records** (MX, TXT/SPF, DKIM) exactly as imported, or email at that domain will stop working.
2. **Mike:** at the registrar where the domain was bought (GoDaddy, Squarespace, Namecheap…), replace the nameservers with the two Cloudflare shows. This takes from a few minutes up to 24 hours to take effect. Cloudflare emails when the domain is active.
3. **You:** once it's active, open the Worker → **Settings → Domains & Routes → Add → Custom domain** and add the address you chose (e.g. `www.YOURDOMAIN.com`). Cloudflare creates the DNS record and the HTTPS certificate on its own. If the old site's DNS record for that same name is still there, delete it first.
4. **You:** also add the other form (e.g. the bare `YOURDOMAIN.com`) as a custom domain, then create a redirect so there's only one address: **Rules → Redirect Rules → Create rule → "Redirect from root to WWW"** template (or the reverse, to match `SITE_URL`), status **301**, preserve query string.
5. **You:** confirm `SITE_URL` matches the final address exactly, then redeploy.
6. **You:** check the old site's URLs on the new domain, e.g. `https://www.YOURDOMAIN.com/classes`, and confirm they redirect.

## 5. Google

### Google Business Profile: new address

The old address (2070 Sam Rittenberg Blvd, Unit 752, 29407) is retired. Google must show the new one.

1. **Mike:** sign in at https://business.google.com with the Google account that owns the gym's profile. (Or search the gym name in Google while signed in. The profile editor appears above the results.)
2. **Edit profile → Business information → Location**: set the address to
   **2467 Savannah Hwy, Suite 130, Charleston, SC 29414**, and drag the map pin onto the building if it's off.
3. **Business name**: **Relson Gracie Jiu-Jitsu of Charleston** (the old name was "Gracie Jiu Jitsu of Charleston").
4. **Contact**: phone **(843) 377-5361**. Website: the new domain, tagged so Mike can see Google traffic in Gymdesk and analytics:
   `https://www.YOURDOMAIN.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
5. **Hours**: the site's structured data treats each day as open from the first class to the end of the last one (Mon 6 AM–8 PM, Tue 12–7 PM, Wed 6 AM–8 PM, Thu 12–8 PM, Fri 6 AM–7 PM, Sat 10–11 AM, Sun closed). Use the same hours in the profile so Google sees one story, and update both when the schedule changes.
6. **Save.** Google may ask Mike to **re-verify** after an address change, usually with a short video of the signage, the inside of the gym, and proof he runs it (keys, a business document). Changes can take a few days to show while "under review".
7. Add a few current photos of the new space (exterior, entrance to Suite 130, the mats).
8. Update the same address anywhere else it appears: Facebook and Instagram profiles, Apple Business Connect (Apple Maps), Bing Places, Yelp, and Gymdesk's location settings.

### Google Search Console

1. **Mike** (or you, as a delegated user): open https://search.google.com/search-console → **Add property → Domain** → `YOURDOMAIN.com`.
2. Verify with the DNS TXT record Google gives. Add it in Cloudflare **DNS → Records**.
3. **Sitemaps** → submit `sitemap-index.xml`.
4. **URL Inspection** → check the home page → **Request indexing**.
5. If the old site was a different domain, use **Settings → Change of address** from the old property to the new one.

## 6. After launch

- [ ] Run Lighthouse (mobile) on the live home page and on `/contact`. Locally, every page scored Performance 94–98, Accessibility 100, Best Practices 96 and SEO 100 (median of 3 runs). Best Practices loses points only on the 60px placeholder logo, which the vector logo fixes. `/contact` occasionally dips when the Google Maps embed loads slowly. That's normal run-to-run variance.
- [ ] Have Mike make one small edit in Keystatic (e.g. the promo message), click **Save**, and confirm it's live within a couple of minutes.
- [ ] Once the Gymdesk lead-form and booking embed codes arrive, Mike pastes them into **Settings → Gymdesk** in Keystatic. The contact page switches to the real form on the next build.

## Still needed from Mike

These show placeholders on the live site until they're filled in through Keystatic (or sent to the developer):

- Michael Key's belt and bio (he teaches the Mon/Wed/Fri adult evening classes); Aryan's classes and portrait
- Which classes Relson teaches (Jerry no longer teaches; his card says "Founding instructor")
- No-Gi portraits of Relson and Jerry; higher-resolution portraits of Jerry and James
- Youth Jiu Jitsu age range
- Class lengths (the site assumes 60 minutes, which also sets the closing times in the hours above)
- Parking and entrance directions for Suite 130 (the contact page shows a dashed placeholder box until then)
- The vector logo, and high-resolution originals of the site photos
- Gymdesk lead-form and booking embed codes
- An email address for the contact page and footer, if he wants one shown
