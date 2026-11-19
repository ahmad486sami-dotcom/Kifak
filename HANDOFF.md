# Kifak (كيفك) — handoff notes

A couples app for iPhone. Each partner takes a deep personality quiz, they connect with a code, and the app **decodes** what the other means when they do X ("when she goes quiet…", "when he texts 'ok'…").

- **Platform:** iPhone only (App Store). No Android.
- **Languages:** English + Arabic in a general, everyday dialect (اللهجة العامة), with full right-to-left layout.
- **Money:** 7-day free trial, then one monthly subscription that covers both partners. **Price not decided yet.**
- **Stack:** Expo (React Native, expo-router) + Supabase (new project, separate from Habibi Gains) + subscription SDK (react-native-purchases) + iOS WidgetKit via @bacons/apple-targets.

## Status (19 Nov 2026)

v1 code is written end to end. It has **not been run on a device yet**: it was built in a workspace with no internet, so packages were never installed. The logic was checked with the TypeScript compiler (0 errors in app code) and a test script:
- 400 random couples run through scoring, the match report and the decoder.
- Every Arabic string checked in all 4 gender combinations.
- Every decoder answer has an action.

The first real step is `npm install` and a dev build. Expect a few small fixes once real library types are in.

## Features in v1

| Area | What it does |
|---|---|
| Sign-in | Apple, or email + 6-digit code. Name, gender (needed so the Arabic is correct) and language. |
| Quiz | 79 questions in 7 sections (attach, conflict, love, signals, moods, needs, life). Scale and multiple-choice. You need 4 sections to continue; the rest can be finished later. |
| Profile | 9 personality types ("The Slow Burner", "The Deep Feeler"…), love language, attachment style, conflict style, trait bars, a share button. |
| Paywall | 7-day trial, one subscription for both, restore, "my partner already pays", links to terms and privacy. |
| Connect | 6-character code, share link `kifak://join/CODE`, updates live when the partner joins, "together since" date. |
| Decoder | 16 situations, each built from the partner's own answers: what it means → what they want → what to do → a ready message to send in-app or to WhatsApp. It also warns you when your own instinct is the wrong one. Partners can add notes in their own words. |
| Match report | Score, where you click, where you clash, tips (chase loop, talk-now vs need-time, love language mismatch, texting gap, …). |
| Feelings translator | Pick a feeling and a need, and it writes the message the way your partner hears best. Runs on the phone, no AI. |
| Daily | Shared streak: whoever starts something keeps it alive, plus stats on who started. One free streak save a month. Moods, a daily question (98 of them; you only see theirs after answering), "thinking of you" taps, sealed love notes and voice notes. |
| Plan | Night out planner (7 emirates, 40 spots, vibe/budget/time → 3 stops), swipe-to-agree date deck, events with countdown and reminders, date jar, stay-in ideas. |
| Us | Days together, anniversary countdown, memory timeline with photos, wishlists with secret "I'll get this", monthly recap with sharing. |
| Conflict mode | Pause with a cool-down timer (also notifies the partner), 6 guided steps, the partner's own way of making up. |
| Fun | "How well do you know me" quiz built from the partner's real answers, 4 couple challenges. |
| Widgets | Streak, partner's mood, daily question, countdown, days together, plus lock-screen streak and days-together widgets. |
| Notifications | Push to the partner (notes, taps, moods, daily, events, pauses, matches) with a rate limit; daily local reminders. |
| Account | Settings, unlink, sign out, delete account (under "More options"), terms and privacy in both languages. |

## Folder map

```
app/                 screens (expo-router; file = route)
  (auth)/            welcome, email, code
  (tabs)/            home, decode, plan, us, me
  quiz/ decode/ plan/ us/ notes/ games/ challenges/ settings/ legal/ join/
src/data/            quiz.ts, situations.ts, daily.ts, dates.ts, extras.ts  ← all content lives here
src/engine/          scoring.ts, match.ts, decoder.ts, translate.ts         ← the brain
src/i18n/            strings.ts (all UI text), index.ts (t, tr, gender markers)
src/store/app.ts     app state, data loading, realtime, widget sync
src/lib/             supabase, billing, widget, notifications, spots, theme, constants
supabase/            migrations (schema + RLS + streak logic, spots seed) and 3 edge functions
targets/widget/      KifakWidget.swift (5 widgets)
```

### Arabic gender markers
Arabic text uses `{masc|fem}` for the person reading and `[masc|fem]` for their partner. For example, `"لما {name} [يسكت|تسكت]"` becomes "لما سارة تسكت". This is resolved by `g()` / `trg()` / `t()`. Keep this when adding text.

## Supabase — DONE (19 Nov 2026)
Project **prkpoolfoduzcrgtdxrh** (`https://prkpoolfoduzcrgtdxrh.supabase.co`), the second project next to habibi-gains.
- Kifak's schema is installed (`001`), along with 40 date spots (`002`) and function lock-down (`003`). The app's URL + public key are built into `app.config.ts`.
- Functions deployed: `notify`, `delete-account`, `billing-webhook`. The webhook stays locked until `BILLING_WEBHOOK_SECRET` is set.
- Tested on the live DB with two fake users (rolled back): invite/join, streak, daily-answer privacy, partner profile access, premium can't be self-granted.
- **The barber booking system that was in this project is parked in the `barber` schema.** All data is intact and nothing was deleted; see `000_park_barber.sql`.
- Still manual (dashboard only):
  1. Auth → Email Templates → **Magic Link** and **Confirm signup**: add `Your Kifak code: {{ .Token }}`. Without this, the email login sends a link instead of a 6-digit code.
  2. Auth → SMTP: the built-in sender only allows a few emails per hour. Set custom SMTP (e.g. the same sender used for Habibi Gains) before testing with friends.
  3. Auth → Providers → Apple, when doing TestFlight.

## Setup (in order)

1. **Install:** `npm install`, then `npx expo install --fix` (lines package versions up with the Expo SDK).
2. **Supabase:** create a NEW project. In the SQL editor run `supabase/migrations/001_init.sql`, then `002_seed_spots.sql`.
   - Auth → Email: change the Magic Link template to show the code `{{ .Token }}`, with code length 6. Send email from your own domain.
   - Auth → Apple: enable it (Services ID + key from your Apple Developer account).
   - Deploy the functions: `supabase functions deploy notify billing-webhook delete-account`
   - Set the secret: `supabase secrets set BILLING_WEBHOOK_SECRET=<long random string>`
3. **App Store Connect:** create the app with bundle `com.kifak.app`.
   - Capabilities: Sign in with Apple, Push, App Groups (`group.com.kifak.app`).
   - Create an auto-renewable monthly subscription with a **7-day free trial** introductory offer. Price is still to be decided.
4. **Billing dashboard:**
   - Add the iOS app and create entitlement **`couple`**.
   - Default offering with a monthly package.
   - Webhook URL: `https://<project>.supabase.co/functions/v1/billing-webhook`, Authorization header = the secret above.
5. **Env:** copy `.env.example` to `.env` and fill in the Supabase URL + anon key and the billing iOS public key. Run `eas init` and put the project ID in `EAS_PROJECT_ID`.
6. **Build:** run `BUILD_AND_SEND.bat` (EAS iOS build, then TestFlight). Widgets only work in a real build, not Expo Go.

## Test builds via GitHub → ESign
`.github/workflows/build-ipa.yml` builds an **unsigned** `Kifak-unsigned.ipa` on every push to `main` (or manually from the Actions tab). Download it from the run's artifacts and sign it in ESign.
- No repo secrets needed — the Supabase keys are built in.
- These builds set `EXPO_PUBLIC_TEST_UNLOCK=1`, so they skip the paywall. EAS / App Store builds don't set it.
- With a re-signed (ESign) app, **Sign in with Apple, push notifications, widgets and in-app purchases usually don't work**: they're tied to the real bundle ID and Apple certificates. Use email-code login to test. Test those four in a TestFlight build.

## Decisions made with Ahmad
- Name: **Kifak** (one "a"), from Fairuz's "Kifak Inta". Arabic: كيفك. Rejected: Decode Us, Even Ground, The Mask.
- iPhone only, App Store only.
- Paid only: 7-day trial, then monthly, one subscription covers both partners. Price TBD.
- English + Arabic general dialect from day one.
- The quiz is "as long as needed" to really map someone; it's split into sections so it doesn't feel like an exam.
- Streak = who starts something. Widgets for the home screen.
- Night out planner included. "Think of everything" → the full list above shipped in v1 rather than in waves.
- No tracking features (no location sharing, no reading chats).
- User-facing text never names third-party providers. They're described only by type ("outsourced service providers").

## Before launch / next
- [ ] Set the price, and the real support email in `src/lib/constants.ts` (currently `hello@kifak.app`).
- [ ] First device test, then fix whatever the real types or runtime flag.
- [ ] Have a native speaker read the Arabic, especially the gendered lines.
- [ ] Check the "Kifak" name is free on the App Store, Instagram and as a trademark.
- [ ] Replace the placeholder icon and splash in `assets/` with final artwork.
- [ ] Review the date spots list (`spots` table) — seasonal places like Global Village are marked "in season".
- [ ] Optional later: AI-written decoder messages, a custom font, and more situations and challenges.
