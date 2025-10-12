-- Database Schema for Systeme.io Webhook Integration
-- Run this in your Supabase SQL Editor

-- Create systeme.io orders table
CREATE TABLE IF NOT EXISTS systeme_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  systeme_order_id TEXT UNIQUE NOT NULL,
  systeme_transaction_id TEXT,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  package_name TEXT NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'refunded')) DEFAULT 'active',
  webhook_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table (updated for systeme.io)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  systeme_order_id TEXT REFERENCES systeme_orders(systeme_order_id),
  plan_name TEXT NOT NULL CHECK (plan_name IN ('basic', 'gold', 'premium')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature usage tracking table
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_name)
);

-- Add subscription columns to user_profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE user_profiles ADD COLUMN subscription_status TEXT DEFAULT 'none';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'trial_end_date') THEN
        ALTER TABLE user_profiles ADD COLUMN trial_end_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add plan features column to events table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'plan_features') THEN
        ALTER TABLE events ADD COLUMN plan_features JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'events' AND column_name = 'storage_used') THEN
        ALTER TABLE events ADD COLUMN storage_used BIGINT DEFAULT 0;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_systeme_orders_email ON systeme_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_systeme_orders_status ON systeme_orders(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_id ON feature_usage(user_id);

-- Enable Row Level Security
ALTER TABLE systeme_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for systeme_orders
CREATE POLICY "Users can view their own orders" ON systeme_orders
  FOR SELECT USING (
    customer_email = (SELECT email FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Service role can manage all orders" ON systeme_orders
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscription" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" ON user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for feature_usage
CREATE POLICY "Users can view their own usage" ON feature_usage
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" ON feature_usage
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all usage" ON feature_usage
  FOR ALL USING (auth.role() = 'service_role');

-- Create functions for subscription management
CREATE OR REPLACE FUNCTION get_user_subscription_features(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT features INTO result
    FROM user_subscriptions
    WHERE user_id = user_uuid AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_feature_access(user_uuid UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM user_subscriptions 
        WHERE user_id = user_uuid 
        AND status = 'active' 
        AND features ? feature_name
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_systeme_orders_updated_at
    BEFORE UPDATE ON systeme_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (remove in production)
INSERT INTO systeme_orders (systeme_order_id, customer_email, customer_name, package_name, amount, status)
VALUES 
    ('TEST-001', 'test@example.com', 'Test User', 'BASIC', 49.00, 'active')
ON CONFLICT (systeme_order_id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON systeme_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON feature_usage TO authenticated;

-- Grant service role full access
GRANT ALL ON systeme_orders TO service_role;
GRANT ALL ON user_subscriptions TO service_role;
GRANT ALL ON feature_usage TO service_role;
