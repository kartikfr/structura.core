# Structura Core - Fix Report

This document summarizes the issues found and fixed during the local stabilization pass.

## 1) Routing import case mismatch

- **Error**: `src/App.tsx` imported `./pages/Landing` while the file on disk is `src/pages/landing.tsx`.
- **Why it happens**: Windows is usually case-insensitive; Linux CI/servers are case-sensitive.
- **Fix applied**: Updated import to `./pages/landing`.
- **Risk if not fixed**: Production/CI build can fail with module-not-found.

## 2) Supabase environment safety

- **Error**: Supabase client was created without explicit checks for missing env variables.
- **Why it happens**: App assumes `.env` values are always present.
- **Fix applied**: Added fail-fast guard for:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Risk if not fixed**: Unclear runtime failures when config is missing.

## 3) Payment page auth flow

- **Error**: `/crypto-payment` attempted to call protected edge functions before auth state was guaranteed.
- **Why it happens**: Wallet fetch ran on page mount regardless of auth readiness.
- **Fix applied**:
  - Wait for auth loading to complete.
  - Redirect unauthenticated users to `/login`.
  - Fetch wallets only for authenticated users.
- **Risk if not fixed**: Unauthorized function calls, failed payment UX, user confusion.

## 4) Database RBAC policy regression

- **Error**: Hardening migration had admin policy predicates that could mismatch auth identity checks.
- **Why it happens**: Role checks were inconsistent with `profiles.user_id` ownership model.
- **Fix applied**: Added corrective migration:
  - `supabase/migrations/20260227090000_fix_rbac_policies_and_admin_trigger.sql`
  - Rebuilds admin policies using `profiles.user_id = auth.uid()`.
- **Risk if not fixed**: Admin users denied access to admin/payment workflows.

## 5) Admin role trigger behavior

- **Error**: Admin auto-assignment logic and trigger timing were inconsistent.
- **Why it happens**: Multiple migration iterations changed trigger/function behavior.
- **Fix applied**:
  - Recreated trigger as `BEFORE INSERT`.
  - Ensured `NEW.role := 'admin'` behavior is valid in trigger context.
- **Risk if not fixed**: Admin bootstrap role may not be assigned reliably.

## 6) Supabase function JWT enforcement

- **Error**: `supabase/config.toml` had `verify_jwt = false` for sensitive functions.
- **Why it happens**: Common leftover from development/testing mode.
- **Fix applied**: Enabled `verify_jwt = true` for:
  - `get-wallet-addresses`
  - `submit-payment`
  - `verify-payment`
  - `auto-verify-payment`
  - `fetch-twelvedata`
- **Risk if not fixed**: Larger security exposure and unnecessary unauthenticated traffic.

## 7) TypeScript/Lint reliability issues

- **Error**: Multiple lint-blocking issues (`any`, empty interface declarations, `require` import style).
- **Why it happens**: Fast iteration and permissive typing.
- **Fix applied**:
  - Removed unsafe `any` in key files.
  - Replaced empty interfaces with type aliases.
  - Switched Tailwind plugin import to ESM style.
  - Fixed hook dependency warnings in actionable files.
- **Risk if not fixed**: Lower maintainability, hidden type bugs, CI/lint breakage.

## Validation Performed

- `npm run lint` -> no errors (only non-blocking Fast Refresh warnings in generated-style UI component files).
- `npm run build` -> success.
- Local dev server startup -> confirmed listening on `127.0.0.1:4173`.

## Notes

- Edge function end-to-end execution in this environment is limited by missing local Supabase tooling (`supabase` CLI / `deno`).
- Code and config are prepared for secure function deployment and runtime auth checks.
