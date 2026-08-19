# Pompeii — grill decisions

Living log. These are **direction**, not a spec. Nothing here is fully fleshed out. We lock the shape, then detail it later when we write the plan and stories.

Nothing is decided until the matching question is marked **accepted**.
Open items stay as question markers. We do not invent architecture in this file.

---

## Pause

**Auth mini-grill in progress.** Next: **Q44** (already signed in, they open `/auth/*`).

---

## Locked

### Q1 — Who is this for
**Accepted**

- This is a couple product. A planner is optional help, not the customer.
- Owners are the couple.
- One person signs up. Both names can go on the wedding immediately.
- The other person joins only by invite, with their own login. No account is created for them.
- One person can run the whole thing alone.

### Q2 — How invited people get access
**Accepted**

- One role system. A role is a permission bundle. No policy editor. No generic collaborator.
- Roles are added when we need them, with a real bundle, not invented up front.
- The admin bundle is a role called **Couple**.
- First person to sign up gets Couple.
- They can invite **one** other person as Couple. That person accepts, own login, same bundle.
- **Hard cap: 2** on Couple. There is no third Couple.
- Anyone else (planner, etc.) is a different role we add when we need it. They are not Couple unless invited as Couple, and that seat is already full at 2.

### Q3 — What is a guest
**Accepted**

- A guest is an invited attendee. Not a role. Not a workspace member. No account. They never sign in.
- They RSVP via a personal link. Couple sees the answers in the workspace.
- They can reopen that RSVP link to see/change their answer until the couple closes it.
- RSVP is RSVP. That link is not a guest portal and not their website.
- Some pages are for guests (e.g. seating). Those are separate from RSVP. Non-guests should not see them.
- Guests reach those pages without signing in.

### Q4 — Who is an invite for
**Accepted**

- An invite is usually a household.
- Couple does not have to know names or size to send it.
- RSVP: the household names who’s coming.
- Seating is based on RSVPs, not invites. Per person, later. A household is not a seat.
- A household of one is fine.

### Q5 — Events
**Accepted**

- A wedding has several events. One event is just a wedding with one.
- Couple/planner adds and configures events as they please.
- Templates for common ones (traditional, ceremony, reception, afters, thanksgiving, bachelorette, …). Custom for the rest.
- Custom is still a full event on the wedding. It only lacks template defaults.
- Who is invited is per event.
- RSVP is per event, not one RSVP for the whole wedding. RSVP is optional; an event can have none.
- Other event things (seat map, etc.) are optional per event. A wedding can skip them entirely.
- A guest can be a single person. Household is optional grouping on an invite, not the chokehold.

### Q6 — Guest lists
**Accepted** (for now; can revisit)

- Each event has its own guest list. That is how the couple works.
- People are not duplicated. Once someone is on any list, they exist on the wedding.
- Adding them to another event is search-from-existing, not a second person.
- RSVP is still per event. The pool is who exists, not whether they are coming to everything.

### Q7 — How the RSVP link gets to the guest
**Accepted**

- Both: the product can send email, and the couple can copy the link and share it themselves (WhatsApp, text, print, etc.).
- We are not deciding SMS, WhatsApp-as-a-channel, or sending infrastructure here.

### Q8 — One link per event
**Accepted**

- One RSVP link per guest/household **per event**. Not one link for all their events.
- Each event invite is its own act. Invites are intentional.
- You can put someone on an event list before you invite them.
- They are invited to that event when you email or copy **that** event’s link.

### Q9 — Couple-recorded RSVPs
**Accepted**

- Couple can record an RSVP in the workspace without the guest using the link (in person, WhatsApp, etc.).
- Later, a role we add can do this too if that bundle includes it.
- The guest link can still change the answer until RSVP is closed on that event.

### Q10 — Vendors
**Accepted** (for now; can revisit)

- A vendor is not a role and not a guest. No account.
- Couple creates a vendor on this wedding: name + type (preset or custom). Phone, email, address optional.
- System generates a link for that vendor on this workspace. Copy always. Send if email or phone exists.
- Vendor opens a space: logistics/line items, prices, invoices, receipts attached to those lines. They can complete their own contact details.
- Couple/planner sees that per vendor.
- We record amounts. We do not pay vendors.
- No vendor directory, no marketplace.
- Central “all invoices” and extra vendor tools (call sheet, chat, review queue, etc.) are later.

### Q11 — Couple budget ledger
**Accepted** (direction, not a spec)

- The couple has a budget ledger. Core, not a later extra.
- It shows what things cost, what they’ve paid, what still needs to be paid.
- Vendor line items / invoices can feed it. Couple can also add costs that aren’t a vendor.
- Categories: presets + custom.
- We record. We do not pay anyone.

### Q12 — Wedding page / site
**Accepted** (direction, not a spec)

- The wedding has a page (a site).
- Couple can design it: themes, content, previews.
- What’s on it is optional. They can keep it thin.

### Q13 — Site vs wedding data
**Accepted** (direction, not a spec)

- Tied where it matters: names, dates, events live on the wedding. The site shows them. Change the wedding, the site updates. It should feel live.
- Decoration is free: story, photos, extra content they write themselves.
- They can hide a section. They should not have to update the site in a second place when the reception moves.

### Q14 — Who can open the site
**Accepted** (direction, not a spec)

- Anyone with the URL. Shareable. You do not have to be a guest.
- Guest-only things (RSVP, seating, etc.) stay off that public page.

### Q15 — Planner role
**Accepted** (direction, not a spec)

- Planner is likely the first role we add besides Couple.
- Same role system: named role, permission bundle, invited in. Not Couple. Cap 2 still only applies to Couple.
- The actual bundle is not fleshed out.

### Q16 — One wedding
**Accepted** (direction, not a spec)

- One slug, one wedding, one workspace. 1 to 1.
- A person may belong to many weddings (Couple on one, later Planner on others, or another they create).
- Access is `weddingMembers`, not `createdBy`. Both Couple people get a row.
- After sign-in, if this device has no current wedding and they have memberships, they pick from that list (or create another).
- Planner is a role on that wedding, not their own area of the app. The list is re-entry, not a planner portfolio.

### Q17 — Signup stepper
**Accepted** (direction, not a spec)

- Form stepper, this order (after they are signed in):
  1. Name of the wedding
  2. Couple names
  3. Date — optional
  4. Where — optional
  5. Invite the other Couple — skippable
- Auth is not a stepper step. It lives on `/auth/login` (Q42).
- Then they’re in. Events, guests, budget, site, Planner are not in the stepper.

### Q18 — “Where” at signup
**Accepted** (direction, not a spec)

- City and country. Optional on the stepper.
- Not the venue. Venue lives on an event.

### Q19 — Ledger currency
**Accepted** (direction, not a spec)

- Couple picks the ledger currency.
- Not hard-coded. Not silently inferred from country.

### Q20 — What we grill next
**Accepted**

- Keep going on product. Architecture later.

### Q21 — Time
**Accepted** (direction, not a spec)

- Each event has a timezone.
- Default from the wedding’s city/country. They can change it per event.
- How it displays on a guest’s phone is later.

### Q22 — Enough product for now
**Accepted**

- Stop grilling product domains in the abstract. Meals, seating, guestbook, photos, etc. get fleshed when we get to those domains.
- Architecture next.

### Q23 — One app, URLs
**Accepted** (direction, not a spec)

- One app. Not microservices.
- `pompeii.com` — our public page (the company).
- `wedding.pompeii.com` — entry into the product. Paths from there.
- Per-wedding subdomains (`amara-tomi.pompeii.com`) — maybe later. Not now.

### Q24 — Couple login
**Accepted** (direction, not a spec)

- Couple signs in with email magic link, or Google, or Apple.
- No password.
- From the start, not later.

### Q25a — Language
**Accepted** (direction, not a spec)

- TypeScript.

### Q25b — UI
**Accepted** (direction, not a spec)

- Vite React app.

### Q25c — Server / repo
**Accepted** (direction, not a spec)

- Convex as the backend.
- Monorepo with Turborepo (Vite React app + Convex in one repo).

### Q25d — Database
**Accepted** (direction, not a spec)

- Convex data only. No extra Postgres until something forces it.

### Q25e — Files
**Accepted** (direction, not a spec)

- Cloudflare R2 for files (invoices, receipts, photos, etc.).

### Q25f — Email
**Accepted** (direction, not a spec)

- Resend. Dedicated sending domain later if we need it.

### Q25g — Hosting
**Accepted** (direction, not a spec)

- Cloudflare (Pages) for `pompeii.com` and `wedding.pompeii.com`, with CDN.
- Convex Cloud for Convex.

### Q25h — Auth library
**Accepted** (direction, not a spec)

- Better Auth (magic link, Google, Apple) with Convex.

### Q25i — App UI kit
**Accepted** (direction, not a spec)

- Tailwind + shadcn for the app (login, stepper, workspace).
- transitions.dev for motion advice.
- Wedding page themes are separate. Not this.

### Q25j — Keep going on stack
**Accepted**

- Stack grill continues (tests, errors, CI, envs, etc.).

### Q25k — Tests
**Accepted** (direction, not a spec)

- Vitest from the start in the monorepo.
- Playwright when we have a real RSVP flow, not empty E2E now.

### Q25l — Errors
**Accepted** (direction, not a spec)

- Sentry for production errors (Vite app, Convex if easy).

### Q25m — Product tracking
**Accepted** (direction, not a spec)

- PostHog.

### Q25n — CI
**Accepted** (direction, not a spec)

- No CI for now.
- GitHub Actions later if we want a test/deploy gate.

### Q25o — Environments
**Accepted** (direction, not a spec)

- Local + main (main is what we ship). Staging/extra prod split when we have a reason.

### Q25p — Feature flags
**Accepted** (direction, not a spec)

- Not now. Wedding/event settings are Convex data, not flags.
- When we want flags, use **PostHog** (already in the stack). Do not add LaunchDarkly.
- **When:**
  - **Release** — shipping something dark on main and turning it on later (or for one test wedding).
  - **Kill** — e.g. stop sending mail if Resend is on fire.
  - **Experiment** — A/B something (stepper, copy).
- Not for: RSVP-on-this-event, seating-on-this-event, secrets, env URLs.
- Release flags get deleted after they’re on for everyone.

### Q25q — Package manager
**Accepted** (direction, not a spec)

- pnpm.

### Q25r — Lint / format
**Accepted** (direction, not a spec)

- ESLint + Prettier.

### Q25s — Node
**Accepted** (direction, not a spec)

- Node 24 LTS. Pinned in the repo (`engines` / `.nvmrc`).

### Q25t — Monorepo shape
**Accepted** (direction, not a spec)

- `apps/workspace` — Vite React. `wedding.pompeii.com`
- `apps/marketing` — `pompeii.com`
- `convex/` at the repo root. Not inside `packages/`.
- `packages/api` — re-export Convex generated `api` / types. Apps talk to Convex through this.
- `packages/errors` — shared error codes/handling between Convex and the apps.
- Other `packages/` (ui, eslint, tsconfig) as we need them.
- No `packages/domain` unless we add it later.

### Q25u — Stack grill
**Accepted**

- Stack is done as direction. Scaffold details when we build.

### Q26 — Convex folders
**Accepted** (direction, not a spec)

- Domain, then use-case/verb (`weddings/create`, not `queries/` / `mutations/`).
- Shared helpers in that domain’s `lib/` (and `convex/lib/` when shared across domains).
- Public function in the use-case folder (`handler.ts`, unless we name it otherwise when we scaffold).
- `schema.ts` at `convex/` root until it hurts.
- Add a domain/use-case when it exists. Don’t pre-create seating/guestbook.

### Q27 — Workspace app folders
**Accepted** (direction, not a spec)

- TanStack Router.
- `src/routes/` + `src/components/` + `src/hooks/` + `src/lib/`.
- Inside components, hooks, and lib: domain folders + `shared`.
- `src/components/ui` — primitives (shadcn).
- Don’t pre-create domains that don’t exist yet.

### Q28 — Marketing app
**Accepted** (direction, not a spec)

- `apps/marketing` is Next.js. `pompeii.com`. SEO.
- `apps/workspace` stays Vite + TanStack Router.
- Marketing stays thin. Not the workspace domain tree.

### Q29 — Packages on day one
**Accepted** (direction, not a spec)

- Day one: `api`, `errors`, `eslint-config`, `typescript-config`.
- `ui` later. Workspace keeps `components/ui` until marketing needs the same primitives.

### Q30 — Package scope
**Accepted** (direction, not a spec)

- `@pompeii/` (`@pompeii/api`, `@pompeii/errors`, …).

### Q31 — Keep grilling structure
**Accepted**

- Project structure grill continues. Not jumping to the implementation plan yet.

### Q32 — URLs on wedding.pompeii.com
**Accepted** (direction, not a spec)

- `/` — signed in, no current wedding on this session: picker (list + create). Signed out: get-started.
- `/{slug}` — this wedding’s workspace (logged in). Further paths under it as we add features.
- `/{slug}/site` — public wedding page. Anyone with the URL.
- Reserved first segments (not a wedding): at least `/new` (or `/create`), `/auth`, and `/weddings`.
- RSVP, vendor, and other trees hang off the slug; exact paths when those features exist.

### Q33 — Slug
**Accepted** (direction, not a spec)

- Slugified from the wedding name. Unique. Reserved words blocked. Collision gets a suffix.
- Preview on the name step. Not a second field they type.
- Changing the slug after create is later (breaks `/site` links).

### Q34 — Unauthenticated `/{slug}`
**Accepted** (direction, not a spec)

- Send them to `/auth/login`, then back to `/{slug}`.
- `/{slug}/site` stays public. No login.

### Q35 — Someone else’s `/{slug}`
**Accepted** (direction, not a spec)

- Not found. Same as an unknown slug. Forbidden would leak that a wedding exists.
- `/{slug}/site` is still the public page when that wedding exists.
- A member whose **this session** has no pointer to that wedding is not in the workspace. Send them to `/` (picker), not into `/{slug}`.

### Q36 — `/new` when you already have a wedding
**Accepted** (direction, not a spec)

- Current wedding on **this Better Auth session** (app `workspaceSessions` row keyed by JWT `sessionId`, not a column on the hosted session table, not on `users`, not on `weddings`) → `/{slug}`.
- No current on this session, but they have `weddingMembers` → picker on `/`. They can open one or create another (`/new`).
- No memberships → `/new`.
- Logged out `/new` → `/auth/login`, then back to `/new` (Q43).
- Leave-workspace (later) clears this session only. iPad does not boot the Mac. One Couple person does not boot the other.

### Q37 — Invite URLs
**Accepted** (direction, not a spec)

- Under the slug: `/{slug}/invite/$token`.
- Token still required. Planner invites can follow the same idea later.

### Q38 — Convex tables
**Parked**

- Schema when we build that domain. Not now.

### Q40 — Auth wiring
**Accepted** (direction, not a spec)

- `@convex-dev/better-auth` as a Convex component. Auth config in `convex/auth.ts`. HTTP routes registered on Convex. Resend sends the magic-link email.
- Workspace uses Better Auth’s React client.
- Email sign-in is **magic link**, not password/OTP.
- Google and Apple as well (Q24). No Expo.

### Q41 — After login, where they land
**Accepted** (direction, not a spec)

- Magic link `callbackURL` is `/`. Then Q36: this session’s current wedding, else picker, else `/new`.

### Q42 — Auth routes
**Accepted** (direction, not a spec)

- `/auth/get-started` — welcome, then into sign-in.
- `/auth/login` — sign in. First time and coming back. Same page.
- Methods: magic link, Google, Apple.
- `/auth` is reserved. Not a wedding slug. Replaces the old reserved `/login`.
- Signed in on `/auth/*` → `/` (then Q36), not straight to `/new`.
- `/new` is the wedding stepper. Wedding name is not on `/auth/login`.

### Q43 — Logged out `/new`
**Accepted** (direction, not a spec)

- Send them to `/auth/login`, then back to `/new`.
- `/{slug}` still goes to `/auth/login` (Q34).

### Q45 — Workspace headline
**Accepted** (direction, not a spec)

- Slot under the inset header: a foretitle and a title. Workspace chrome, not a page.
- Automatic. The couple never sets a headline. Facts in, copy out.
- No stored copy, no stage column, no headline mutation.
- `kind` is the voice (`welcome`, later `dayOf` / `after`), not the event id. An event can win the slot later. It does not write the headline.
- Convex queries do not read `Date.now()`. Pass `now` from the client when a moment needs the clock.
- Same-day events need a picker later (ceremony beats a shower). Until then, welcome only: `Welcome to` / wedding name.
- Copy catalog lives in server code. The query is access plus load.

---

## Open (question markers)

- **Q3-open:** After someone has RSVP’d, how does the system know it’s them on later guest-only pages, without a sign-in? Parked. Not architecture yet. Come back later.
- **Q4-open:** Optional, later, off by default: a wedding-level guest cap, and a per-household RSVP max.
- **Q8-open:** Copy people and/or RSVPs from one event to another (all / some / pick), without sending. Later. Not locked.
- **Q10-open:** How the vendor magic link proves it’s them, and not just anybody with the URL. Same class of problem as Q3-open. Parked.
- **Q11-open:** Family contributors (who put money in), and who besides Couple can see the ledger. Later.
- **Q12-open:** What’s public vs guest-only on the page, custom domain, how many themes. Later.
- **Q14-open:** Couple can lock the whole site later if they want. Optional, not the default. Later.
- **Q19-open:** Whether currency is its own stepper step or sits on the “where” step. Later.
- **Q23-open:** Exact path shapes under `wedding.pompeii.com` (workspace vs wedding page vs RSVP/vendor links). Later. **Superseded by Q32** (general shape locked; remaining paths as features land).
- **Q28-open:** Next.js on Cloudflare (OpenNext / Pages adapter) when we scaffold.
- **Q25m-open:** What we track on guest/vendor links vs the couple workspace. Later.
- **Q38-open:** First Convex tables / schema when we get to it.

---

## In progress

- **Q44 — Already signed in, they open `/auth/login`?** Not accepted. Rec: same as Q36 / Q41 (current session wedding, else picker, else `/new`).

---

## Rejected / corrected

- Owner as a special non-role concept → no. Couple is a role in the same system.
- No cap on Couple → no. Cap is 2.
- RSVP link as the guest’s access to all guest pages → no. RSVP ends at RSVP.
- Generic collaborator role → no.
- One login, many weddings / planner domain with a portfolio → no. 1 to 1. Planner is a role inside the wedding.
- Login as step 1 of the wedding stepper → no. Auth is `/auth/login`.
- Two auth URLs (`/auth/login` and `/auth/sign-up`) → no. One sign-in at `/auth/login`.
- Reserved first segment `/login` → superseded by `/auth`.
