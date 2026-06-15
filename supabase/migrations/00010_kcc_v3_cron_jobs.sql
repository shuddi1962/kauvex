-- ============================================================
-- KAUVEX V3 — Supabase Cron Jobs (pg_cron)
-- ============================================================
-- These cron jobs handle automated tasks for V3 features.
-- pg_cron extension must be enabled.
-- Run: CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 1. SUPPLIER ORDER ESCALATION CHECK (Every 15 minutes)
-- Escalates unconfirmed orders past 2hr/4hr/6hr thresholds
-- ============================================================

CREATE OR REPLACE FUNCTION cron_check_supplier_escalations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  now_ts timestamptz := now();
  two_hours timestamptz := now_ts - interval '2 hours';
  four_hours timestamptz := now_ts - interval '4 hours';
  six_hours timestamptz := now_ts - interval '6 hours';
BEGIN
  -- Escalate orders past 6 hours (no response)
  UPDATE supplier_orders
  SET status = 'escalated', escalated_at = now_ts
  WHERE status = 'pending' AND created_at <= six_hours;

  -- Log escalations
  INSERT INTO supplier_notifications (supplier_id, notification_type, title, message, read)
  SELECT so.supplier_id, 'escalation', 'Order Escalated - No Response',
    'Order #' || so.order_id || ' has been auto-escalated due to no response within 6 hours.',
    false
  FROM supplier_orders so
  WHERE so.status = 'escalated' AND so.escalated_at = now_ts;
END;
$$;

-- ============================================================
-- 2. PRICE ALERT CHECK (Every 6 hours)
-- Checks if any products have dropped to target price
-- ============================================================

CREATE OR REPLACE FUNCTION cron_check_price_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  alert_record RECORD;
  current_price numeric;
BEGIN
  FOR alert_record IN
    SELECT pa.id, pa.customer_id, pa.product_id, pa.target_price,
      p.name AS product_name, p.sale_price, p.regular_price
    FROM price_alerts pa
    JOIN products p ON p.id = pa.product_id
    WHERE pa.status = 'active'
  LOOP
    current_price := COALESCE(alert_record.sale_price, alert_record.regular_price, 0);

    IF current_price > 0 AND current_price <= alert_record.target_price THEN
      UPDATE price_alerts
      SET status = 'triggered', notified_at = now(), current_price = current_price
      WHERE id = alert_record.id;
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- 3. GROUP BUY EXPIRY CHECK (Every hour)
-- Expires group buys past their deadline
-- ============================================================

CREATE OR REPLACE FUNCTION cron_expire_group_buys()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE group_buys
  SET status = 'expired'
  WHERE status = 'active' AND expires_at <= now();
END;
$$;

-- ============================================================
-- 4. RECORD PRICE HISTORY (Every 6 hours)
-- Archives current product prices for price history charts
-- ============================================================

CREATE OR REPLACE FUNCTION cron_record_price_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO price_history (product_id, price, currency, recorded_at)
  SELECT id, COALESCE(sale_price, regular_price, 0), 'USD', now()
  FROM products
  WHERE COALESCE(sale_price, regular_price, 0) > 0;
END;
$$;

-- ============================================================
-- 5. CLEANUP EXPIRED DATA (Daily)
-- Removes stale data
-- ============================================================

CREATE OR REPLACE FUNCTION cron_daily_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Expire stale abandoned carts (> 30 days)
  UPDATE abandoned_carts
  SET recovered = true
  WHERE recovered = false AND created_at < now() - interval '30 days';

  -- Soft-delete old price alerts (triggered + 90 days)
  DELETE FROM price_alerts
  WHERE status = 'triggered' AND notified_at < now() - interval '90 days';

  -- Clean expired gift certificates
  UPDATE gift_certificates
  SET status = 'expired'
  WHERE status = 'active' AND expires_at < now();
END;
$$;

-- ============================================================
-- Register cron jobs (requires superuser)
-- Uncomment and run these after the migration is applied:
-- ============================================================

-- SELECT cron.schedule('supplier-escalation',  '*/15 * * * *',  'SELECT cron_check_supplier_escalations()');
-- SELECT cron.schedule('price-alert-check',    '0 */6 * * *',   'SELECT cron_check_price_alerts()');
-- SELECT cron.schedule('group-buy-expiry',     '0 * * * *',     'SELECT cron_expire_group_buys()');
-- SELECT cron.schedule('record-price-history', '0 */6 * * *',   'SELECT cron_record_price_history()');
-- SELECT cron.schedule('daily-cleanup',        '0 3 * * *',     'SELECT cron_daily_cleanup()');

-- View active cron jobs:
-- SELECT * FROM cron.job;
