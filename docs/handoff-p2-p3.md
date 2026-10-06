# mining-api + mining-mobile — P2 & P3 handoff

Remaining items from the production-readiness audit, after P0 (closed) and P1 (separate handoff). Each item names the exact files and the problem, not just the fix, so a dev who wasn't in the original audit can pick it up directly.

For the two small pre-existing bugs (missing `Ionicons` import, a prettier nit), see `docs/handoff-pre-existing-issues.md` in this repo — not repeated here.

---

## P2 — fix soon

Real issues, but lower blast-radius than P0/P1, or needed verification this session couldn't do (e.g. no live AWS credentials).

### 1. [mobile] No error-state UI — failures look like "no data"

Every background list refresh does `.catch(() => undefined)`. A failed fetch and a genuinely empty result render identically — the user has no way to tell "nothing here" from "couldn't load this."

**Files:**
- `src/features/dashboard/screens/RequestsScreen.tsx`
- `src/features/dashboard/screens/MyOffersScreen.tsx`
- `src/features/dashboard/screens/HomeScreen.tsx`
- `src/features/messages/screens/MessagesScreen.tsx`
- `src/features/dashboard/screens/NotificationsScreen.tsx`

**Fix:** add a shared `ErrorState` component (sibling to the existing `EmptyState` in `src/shared/components/`) with a retry affordance, and wire each screen's refresh logic to track a distinct error state instead of swallowing the catch.

### 2. [api] S3 presigned upload has no size cap

A valid presigned PUT URL (`src/modules/uploads/services/upload.service.ts`) can upload an arbitrarily large object within its 5-minute expiry window — a cost/DoS exposure against the S3 bucket, not a data-integrity bug.

**Fix:** have the client declare the file size when requesting the upload URL, validate it against a sane max (e.g. 25MB), and pass that as `ContentLength` on the `PutObjectCommand` so S3 rejects any upload whose actual `Content-Length` doesn't match. **Verify against real AWS before shipping** — this session didn't have live AWS credentials to confirm the exact signing behavior.

**File:** `src/modules/uploads/services/upload.service.ts`

### 3. [api] Rate limiting is in-memory and single-instance only

Only `/auth/*` is rate-limited, via an in-memory counter that resets on restart and doesn't share state across processes.

**File:** `src/common/middleware/auth-rate-limit.ts`

**Fix:** not urgent — the current deploy runs exactly one PM2 instance, so this isn't broken today. Move to a Redis-backed limiter only when/if the API scales to more than one instance; don't do it preemptively.

### 4. [mobile] No request de-dup/cancellation on screen focus

Rapid focus → blur → refocus (e.g. flicking between tabs) fires overlapping background refreshes with no cancellation. Whichever response lands last wins, even if it's the stale one.

**File:** `src/features/listings/utils/refreshListings.ts` and its callers (same screens as item 1 — worth doing together).

**Fix:** cancel the in-flight request (or ignore its result) when a new refresh starts for the same resource, e.g. via an `AbortController` per screen or a simple "latest request wins" guard.

---

## P3 — nice to have

Cosmetic, deliberate-looking, or not confirmed broken at current scale. Don't let these block anything above.

### 1. [api] Remaining `console.*` calls not on the shared logger

A shared pino logger was added this session (`src/common/logger.ts`), but a few call sites still use raw `console.*`.

**Files:**
- `src/integrations/whatsapp/whatsapp.service.ts`
- `src/modules/listings/utils/listing-rfq.ts`

**Fix:** swap each `console.*` call for the shared `logger` import.

### 2. [mobile] `ScrollView` + `.map()` instead of `FlatList`

No virtualization on the listings/messages/notifications feeds (`src/features/dashboard/screens/*`, `src/features/messages/screens/*`). Looks like a deliberate choice at current list sizes, not a bug.

**Fix:** only revisit if these lists actually grow large enough that scroll performance becomes noticeable — don't swap to `FlatList` preemptively.

### 3. [api] No admin action audit log

No record of which admin changed what/when (`src/modules/admin/`). This is a new feature, not a bug fix — scope it as its own ticket.

### 4. [api] Public listings feed pagination not verified at scale

`src/modules/listings/repositories/listing.repository.ts` — `listFeed`/`listMine` haven't been load-tested. Not confirmed broken, just unverified. Check if listing volume grows significantly.
