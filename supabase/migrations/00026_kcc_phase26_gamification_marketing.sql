-- KCC Phase 26: Gamification & Marketing Notification Engine
-- Tables: daily_check_ins, spin_wheel_configs, spin_wheel_prizes, spin_wheel_spins,
--         achievements, user_achievements, social_shares, referral_milestones,
--         user_referral_milestones, marketing_campaigns, marketing_notifications

BEGIN;

-- ============================================================
-- GAMIFICATION TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_check_ins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL,
  check_in_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  streak_day INT NOT NULL DEFAULT 1,
  points_earned INT NOT NULL DEFAULT 0,
  bonus_earned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, check_in_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_customer ON public.daily_check_ins(customer_id);

CREATE TABLE IF NOT EXISTS public.spin_wheel_configs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  spins_per_day INT NOT NULL DEFAULT 1,
  cost_in_points INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spin_wheel_prizes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  config_id TEXT NOT NULL REFERENCES public.spin_wheel_configs(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  value TEXT,
  points INT NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5,2),
  weight INT NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#FF6B00',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.spin_wheel_spins (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  config_id TEXT NOT NULL REFERENCES public.spin_wheel_configs(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  prize_id TEXT REFERENCES public.spin_wheel_prizes(id) ON DELETE SET NULL,
  points_won INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  spun_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_spin_wheel_spins_customer ON public.spin_wheel_spins(customer_id, spun_at);

CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'trophy',
  category TEXT NOT NULL,
  threshold INT NOT NULL DEFAULT 1,
  points_reward INT NOT NULL DEFAULT 0,
  badge_color TEXT NOT NULL DEFAULT '#FF6B00',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, achievement_id)
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_customer ON public.user_achievements(customer_id);

CREATE TABLE IF NOT EXISTS public.social_shares (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL,
  share_type TEXT NOT NULL,
  reference_id TEXT,
  platform TEXT NOT NULL,
  points_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_social_shares_customer ON public.social_shares(customer_id);
CREATE INDEX IF NOT EXISTS idx_social_shares_reference ON public.social_shares(share_type, reference_id);

CREATE TABLE IF NOT EXISTS public.referral_milestones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  referrals_required INT NOT NULL,
  label TEXT NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value DECIMAL(12,2) NOT NULL,
  reward_label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_referral_milestones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL,
  milestone_id TEXT NOT NULL REFERENCES public.referral_milestones(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, milestone_id)
);

-- ============================================================
-- MARKETING NOTIFICATION ENGINE TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  channel TEXT NOT NULL,
  trigger TEXT,
  trigger_event TEXT,
  target_segment TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  deep_link TEXT,
  points_reward INT NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_count INT NOT NULL DEFAULT 0,
  opened_count INT NOT NULL DEFAULT 0,
  clicked_count INT NOT NULL DEFAULT 0,
  converted_count INT NOT NULL DEFAULT 0,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marketing_notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  campaign_id TEXT NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  deep_link TEXT,
  read_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  error_msg TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_marketing_notifications_customer ON public.marketing_notifications(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_marketing_notifications_campaign ON public.marketing_notifications(campaign_id);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.achievements (code, name, description, category, threshold, points_reward, badge_color, is_active)
SELECT * FROM (VALUES
  ('first_order', 'First Order', 'Place your first order', 'orders', 1, 50, '#FF6B00', true),
  ('five_orders', 'Shopaholic', 'Place 5 orders', 'orders', 5, 100, '#F59E0B', true),
  ('ten_orders', 'Loyal Customer', 'Place 10 orders', 'orders', 10, 200, '#8B5CF6', true),
  ('twenty_five_orders', 'VIP Shopper', 'Place 25 orders', 'orders', 25, 500, '#10B981', true),
  ('streak_3d', 'Getting Started', '3-day check-in streak', 'streak', 3, 30, '#3B82F6', true),
  ('streak_7d', 'Week Warrior', '7-day check-in streak', 'streak', 7, 100, '#8B5CF6', true),
  ('streak_14d', 'Fortnight Champion', '14-day check-in streak', 'streak', 14, 200, '#F59E0B', true),
  ('streak_30d', 'Monthly Legend', '30-day check-in streak', 'streak', 30, 500, '#FF6B00', true),
  ('streak_90d', 'Quarterly King', '90-day check-in streak', 'streak', 90, 1000, '#EF4444', true),
  ('streak_365d', 'Yearly God', '365-day check-in streak', 'streak', 365, 5000, '#FF6B00', true),
  ('first_referral', 'Friend Inviter', 'Refer your first friend', 'referrals', 1, 100, '#3B82F6', true),
  ('five_referrals', 'Social Butterfly', 'Refer 5 friends', 'referrals', 5, 250, '#8B5CF6', true),
  ('ten_referrals', 'Influencer', 'Refer 10 friends', 'referrals', 10, 500, '#F59E0B', true),
  ('first_review', 'Critic', 'Write your first product review', 'reviews', 1, 25, '#10B981', true),
  ('ten_reviews', 'Top Reviewer', 'Write 10 product reviews', 'reviews', 10, 150, '#8B5CF6', true),
  ('first_share', 'Social Sharer', 'Share a product or referral link', 'social', 1, 10, '#3B82F6', true),
  ('twenty_five_shares', 'Viral', 'Share 25 times', 'social', 25, 150, '#EF4444', true),
  ('big_spender', 'Big Spender', 'Spend over ₦100,000 total', 'spending', 100000, 500, '#FF6B00', true),
  ('whale', 'Whale', 'Spend over ₦1,000,000 total', 'spending', 1000000, 2000, '#FF6B00', true)
) AS v(code, name, description, category, threshold, points_reward, badge_color, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.achievements WHERE public.achievements.code = v.code);

INSERT INTO public.spin_wheel_configs (name, spins_per_day, cost_in_points, is_active)
SELECT 'Daily Prize Wheel', 3, 0, true
WHERE NOT EXISTS (SELECT 1 FROM public.spin_wheel_configs LIMIT 1);

INSERT INTO public.spin_wheel_prizes (config_id, label, type, points, weight, color, is_active)
SELECT c.id, p.label, p.type, p.points, p.weight, p.color, true
FROM public.spin_wheel_configs c
CROSS JOIN (VALUES
  ('5 pts', 'points', 5, 25, '#94A3B8'),
  ('10 pts', 'points', 10, 20, '#CBD5E1'),
  ('25 pts', 'points', 25, 15, '#FCD34D'),
  ('50 pts', 'points', 50, 10, '#F59E0B'),
  ('100 pts', 'points', 100, 5, '#FF6B00'),
  ('Free Ship', 'free_shipping', 0, 8, '#10B981'),
  ('5% Off', 'discount', 0, 10, '#8B5CF6'),
  ('Try Again', 'bad_luck', 0, 7, '#EF4444')
) AS p(label, type, points, weight, color)
WHERE NOT EXISTS (SELECT 1 FROM public.spin_wheel_prizes WHERE public.spin_wheel_prizes.config_id = c.id LIMIT 1);

INSERT INTO public.referral_milestones (referrals_required, label, reward_type, reward_value, reward_label, is_active)
SELECT * FROM (VALUES
  (1, 'First Referral', 'points', 50, '+50 pts', true),
  (3, '3 Referrals', 'points', 150, '+150 pts', true),
  (5, '5 Referrals', 'wallet', 500, '₦500 wallet', true),
  (10, '10 Referrals', 'wallet', 1500, '₦1,500 wallet', true),
  (25, '25 Referrals', 'wallet', 5000, '₦5,000 wallet', true),
  (50, '50 Referrals', 'wallet', 15000, '₦15,000 wallet', true)
) AS v(referrals_required, label, reward_type, reward_value, reward_label, is_active)
WHERE NOT EXISTS (SELECT 1 FROM public.referral_milestones);

COMMIT;
