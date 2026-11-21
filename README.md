# Thinu Upadya — Portfolio

A responsive personal portfolio and Firebase-backed content management system built
with Next.js, React, and TypeScript. The existing charcoal-and-lavender visual
identity, TU monogram, motion-aware interactions, project filters, terminal,
navigation, and project case studies are preserved.

## Features

- Responsive portfolio sections for about, experience, skills, projects, education, and contact
- Shared site navigation across the homepage and project pages
- Filterable project gallery with project status and external links
- Generated case-study routes with project overviews, challenges, approaches, features, architecture notes, and previous/next navigation
- Responsive layout and reduced-motion support
- Metadata, sitemap, robots, and TU favicon
- CV download and authentic profile portrait
- Firebase-backed draft/release publishing with a protected administrator area
- Validated design and animation settings with safe public fallback when Firebase is not configured
- Private CV & Resume Studio with portfolio-synced profiles, built-in templates, DOCX and PDF export
- Private cover-letter editor, job application tracker, and optional analytics overview

The existing portfolio content in `src/lib/data.ts` remains intact and is used as
the local fallback and initial CMS source. Technology stacks, project status, and
individual contributions should reflect verified information. AutoPilot is listed
as Release Candidate v1.0.0-rc; feature availability and integrations are not
presented as verified.

## Tech Stack

- Next.js 15 App Router
- React 19 and TypeScript
- Tailwind CSS and custom global CSS
- Framer Motion
- Lucide React
- Firebase Web SDK and Firebase Admin SDK
- Zod

## Getting started

### Requirements

- Node.js 20 or later recommended
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Configure local environment

Copy the example environment file:

```bash
copy .env.example .env.local
```

On macOS/Linux, use `cp .env.example .env.local` instead. The site can run
without Firebase variables; in that mode it renders the existing data from
`src/lib/data.ts` and the existing design.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Type-check

```bash
npx tsc --noEmit
```

### 5. Build and run for production

```bash
npm run build
npm run start
```

## Default content, colors, and design

The current website design is the default and has not been replaced by the CMS:

- Background: `#080808`
- Surface: `#141414`
- Border: `#292929`
- Primary charcoal/lavender accent: `#B5A2D8`
- Secondary lavender accent: `#D2C5E8`
- Text: `#F5F5F5`
- Muted text: `#777777`
- Maximum content width: `1280px`
- Existing typography, spacing, layout, animations, responsive behavior, and
  retro-inspired interactions remain unchanged.

The CMS stores this preset as `current-charcoal-lavender`. Selecting or editing
another theme is optional; the current design remains the safe default when no
published Firebase release exists.

## Project structure

- `src/app/` — App Router layout, homepage, project routes, sitemap, robots, and favicon
- `src/app/projects/[slug]/page.tsx` — shared case-study layout and project metadata
- `src/components/brand/TULogo.tsx` — reusable TU monogram
- `src/components/portfolio/PortfolioHome.tsx` — homepage sections and project gallery
- `src/components/portfolio/SiteHeader.tsx` — shared responsive navigation
- `src/lib/data.ts` — portfolio, project, experience, education, and skill content
- `src/lib/schemas/portfolio.schema.ts` — validated release, design, and animation contracts
- `src/lib/repositories/portfolio.repository.ts` — draft and immutable release publishing
- `src/app/admin/` — Firebase-authenticated CMS routes
- `src/app/admin/(protected)/cv-studio/` — CV profile editor and export controls
- `src/lib/career/document.ts` — server-side editable DOCX and selectable-text PDF generation
- `src/lib/schemas/career.schema.ts` — validated CV, template, cover-letter, and application data
- `firestore.rules` and `storage.rules` — deny-by-default Firebase rules
- `.env.example` — required Firebase configuration
- `src/styles/globals.css` — theme, responsive layout, and component styles
- `public/images/` — profile image and public image assets

## Firebase CMS setup

Firebase is optional for local development and required for the live CMS workflow.

### 1. Create and configure a Firebase project

In the Firebase Console:

1. Create or select a Firebase project.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a Firestore database in production mode.
4. Create a Storage bucket.
5. Add a Web App and copy its configuration values.
6. Deploy the repository rules:

   ```bash
   firebase deploy --only firestore:rules,storage
   ```

   If the Firebase CLI is not installed, install it with `npm install -g
   firebase-tools`, then run `firebase login` and `firebase use <project-id>`.

### 2. Add environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Where it is used |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Browser Firebase client |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Browser Firebase client |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Browser and server |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Browser and server storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Browser Firebase client |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Browser Firebase client |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK, server only |
| `AUTH_COOKIE_NAME` | Optional session-cookie name |
| `NEXT_PUBLIC_SITE_URL` | Optional deployment URL |

`FIREBASE_PRIVATE_KEY` may contain escaped `\\n` characters. The server converts
them to line breaks. Never commit `.env.local`, service-account JSON files, private
keys, or credentials.

### 3. Create the first administrator

There is no public registration route. Create the user manually in Firebase
Authentication, then grant the trusted custom claim `admin: true` or
`role: "admin"` using a protected Firebase Admin SDK script or Cloud Function.
Do not grant this claim from browser code. After the claim is created, the user
must sign out and sign in again to receive a refreshed ID token.

Alternatively, create or update an administrator locally with the included
one-time provisioning script. This does not save the password in the repository:

PowerShell:

```powershell
$env:ADMIN_EMAIL="your-admin@example.com"
$env:ADMIN_PASSWORD="use-a-new-password-of-at-least-12-characters"
npm run create-admin
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
```

The script uses the server-only Firebase Admin variables from `.env.local`,
creates the account if it does not exist, updates its password if it does,
and assigns the `admin: true` custom claim. Use a unique password and do not
paste it into source files, chat, screenshots, or commits.

If the login page says **This account is not an administrator**, run the command
above for the exact Firebase Authentication email you are using, then sign out
and sign in again. Firebase custom claims are only included in a newly refreshed
ID token. The provisioning script now loads `.env.local` automatically.

### 4. Preserve and migrate the existing portfolio data

The existing data is not deleted or replaced:

1. `src/lib/data.ts` remains the verified local fallback.
2. When Firebase is unavailable, the public site uses that data and the current
   charcoal/lavender design.
3. When an administrator first opens `/admin/content` with Firebase configured,
   the editor loads the same existing content as the draft fallback.
4. Click **Save draft**, review the values, then click **Publish**.
5. Publishing writes a validated immutable release and updates the active release
   pointer only after the release write succeeds.

The public website reads `site_config/active.activeReleaseId` and validates
`portfolio_releases/{releaseId}`. Drafts are stored in
`portfolio_drafts/current`; drafts do not affect the live site until publishing.

### 5. Run locally with Firebase

```bash
npm run dev
```

Open [http://localhost:3000/admin/login](http://localhost:3000/admin/login), sign
in with the provisioned administrator account, edit the draft, and publish it.
Open [http://localhost:3000](http://localhost:3000) to verify the published result.

### 6. Configure Vercel

In **Vercel → Project → Settings → Environment Variables**, add all variables from
`.env.local` to the Production environment. Add the three Admin SDK variables
without the `NEXT_PUBLIC_` prefix as server-only secrets. Redeploy after saving
the variables. The Firebase project, Vercel project, and custom domain must use
the intended production configuration.

## Updating content

Use `/admin/login` to update content without editing source files. The current
profile, projects, skills, experience, education, images, and verified project
descriptions are retained as the starting content. Do not publish customer
information, credentials, private infrastructure details, or unverified project
capabilities.

Project case-study pages use each project's `id` as its URL slug, for example
`/projects/ravanlink-autopilot`. Change slugs carefully because changing one
changes the public URL.

## CV and career management

The private dashboard includes `/admin/cv-studio`, `/admin/cv-templates`,
`/admin/cover-letters`, `/admin/job-applications`, and `/admin/analytics`.
These routes require the same administrator session as the portfolio CMS.

CV profiles reuse the existing portfolio profile, projects, experience, skills,
education, and certifications. A CV summary, template, page size, and design
settings are stored separately, so editing a CV does not change public portfolio
content. The built-in templates are source-controlled and available without an
external marketplace.

The CV Studio generates:

- Editable Microsoft Word `.docx` files using semantic headings and bullet lists.
- Selectable-text `.pdf` files using server-side PDF generation.

Generated documents are created only after administrator authentication. Private
career documents are not published or exposed to public visitors. Generated-file
Storage persistence and public CV approval should be configured separately before
enabling public downloads.

Add project screenshots only when approved for public use. Do not publish customer information, credentials, private infrastructure details, or unverified project capabilities.
