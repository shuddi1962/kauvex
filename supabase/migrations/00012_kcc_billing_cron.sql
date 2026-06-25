-- ============================================================
-- KAUVEX BILLING — Recurring Billing Cron Jobs (pg_cron + pg_net)
-- ============================================================
-- Requires: pg_cron extension, pg_net extension
-- Run: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Run: CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- Replace NEXT_PUBLIC_SITE_URL with actual deployment URL.
-- The cron calls the Next.js billing API which handles:
--   - Subscription auto-renewal (wallet debit)
--   - FBK fee auto-billing (wallet debit or debt creation)
-- ============================================================

-- ============================================================
-- 1. DAILY BILLING CYCLE CHECK (Every day at 02:00 UTC)
-- Processes all vendor billing cycles:
--   - Checks subscription renewals
--   - Processes FBK billing
--   - Creates debt entries for insufficient balance
-- ============================================================

CREATE OR REPLACE FUNCTION cron_process_billing_cycles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result int;
BEGIN
  -- Call the Next.js billing API endpoint
  -- Uses pg_net to make async HTTP POST
  SELECT net.http_post(
    url := current_setting('app.billing_api_url', true),
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting('app.billing_cron_secret', true)}'::jsonb,
    body := '{}'::jsonb
  ) INTO result;
END;
$$;

-- ============================================================
-- 2. ORDER EARNINGS BACKFILL (Every hour)
-- Checks for completed orders that haven't had earnings credited
-- and triggers the credit process
-- ============================================================

CREATE OR REPLACE FUNCTION cron_backfill_order_earnings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result int;
BEGIN
  SELECT net.http_post(
    url := current_setting('app.billing_api_url', true) || '?backfill=true',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer " || current_setting('app.billing_cron_secret', true)}'::jsonb,
    body := '{"backfillCompleted": true}'::jsonb
  ) INTO result;
END;
$$;

-- ============================================================
-- Register cron jobs (uncomment and set variables)
-- ============================================================

-- Set the billing API URL (replace with actual deployment URL)
-- ALTER DATABASE postgres SET app.billing_api_url TO 'https://kauvex.com/api/v1/billing/process';
-- ALTER DATABASE postgres SET app.billing_cron_secret TO 'your-cron-secret-here';

-- Schedule daily billing cycle check
-- SELECT cron.schedule('billing-daily-cycle', '0 2 * * *', 'SELECT cron_process_billing_cycles()');

-- Schedule hourly earnings backfill
-- SELECT cron.schedule('billing-earnings-backfill', '0 * * * *', 'SELECT cron_backfill_order_earnings()');

-- View active cron jobs:
-- SELECT * FROM cron.job;
