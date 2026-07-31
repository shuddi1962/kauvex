# EC-046 — Financial Engine

> **Status:** Active
> **Phase:** F — Marketplace & Business OS
> **Canonical code:** `src/lib/pay/` (wallet.ts, bnpl.ts, cashback.ts, credit-score.ts, float.ts), `src/app/api/v1/pay/**`, `src/app/account/wallet/`, `src/app/vendor/wallet/`, `src/app/admin/pay-later/`, `src/app/admin/wallets/`
> **Overrides:** EC-011 on money rules

## Purpose

Defines KCC's money layer — the Kauvex Pay engine: wallets, BNPL, cashback, float, vendor payouts — and the rules that make it safe: decimal money, ledger-style audit, and cashflow timing.

## Current Truth (in this repo today)

- **Wallet (KP1):** every account gets a wallet on registration (DB trigger). Top-up: card (Paystack), bank transfer (virtual account), USSD. Spending: one-click checkout, split payment. Withdrawal: below ₦50K instant, above manual review (24h). Security: 4-digit PIN, daily spend limits, fraud flagging. Surfaces: `/account/wallet` (customer), `/vendor/wallet` (vendor earnings/withdrawal), `/admin/wallets` (oversight, freeze/unfreeze). APIs: `/api/v1/pay/wallet/{topup,withdraw,virtual-account,pin}`.
- **BNPL (KP2):** 25% upfront → item immediately; 75% in 3 installments over 9 weeks (21 days apart); vendor paid FULL on Day 1 (Kauvex holds credit risk). Auto-charge daily 9 AM cron; 7-day grace; late fee ₦500. Eligibility: 3+ month account, 2+ completed orders, no outstanding debt; external credit checks ≥ ₦50K. Limits: ₦20K → ₦50K → ₦100K → ₦200K ladder. Suspension blocks new agreements only. Surfaces: `/account/pay-later`, `/admin/pay-later` (overview, agreements, config, risk).
- **Cashback:** per category/storefront config, 30-day pending period, daily processing cron.
- **Float:** wallet balances earn interest (tracked daily via float-track cron; admin treasury view).
- **Rules of record (AGENTS.md):** customer receives item immediately after first payment; vendor paid in full on Day 1; Kauvex holds the credit risk; never cancel/reverse a shipped order for a missed BNPL payment.
- **Accounting foundation:** `BosGlAccount`/`BosJournalEntry` (Business OS GL) + `erp_*` tables (V2 migration) as the ledger base.

## Rules

1. All money is Decimal(10,2) (or finer for escrow) — never float; no implicit rounding (EC-011 Rule 6).
2. Wallet balance is a DB column with atomic updates (transactional decrements) — never computed client-side.
3. Every money mutation is recorded (ledger/journal or wallet transaction row) — balances are auditable end-to-end.
4. BNPL invariants are absolute: item shipped after 25% payment; vendor paid Day 1; shipped orders never reversed for missed payments (AGENTS.md).
5. Withdrawals above ₦50K require manual review; wallet freezes are admin-only and block spends/withdrawals.
6. Cashback is pending for 30 days (return window) then released by cron; refunds claw back pending cashback.
7. Escrow flows (manufacturer milestones) use the same wallet rails (`src/lib/pay/wallet.ts`).
8. Daily jobs (BNPL charge, cashback, float) are idempotent and logged (EC-016).

## Evolution Targets

> **Evolution target — NOT in the repo today.**
- Interest-bearing savings products beyond float tracking.
- Cross-border wallet transfers (multiple currencies).
- Subscription billing rails for vendors/KAI plans via the wallet (currently plans are subscription tables, not wallet-drawn).
- Real-time payment webhook reconciliation dashboard.

## Checklist (Definition of Done for this area)

- [ ] Decimal money everywhere
- [ ] Atomic balance updates + transaction records
- [ ] BNPL invariants enforced in engine + docs
- [ ] Withdrawal review thresholds enforced
- [ ] Cron jobs idempotent + logged
