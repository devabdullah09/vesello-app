-- Minimal setup for systeme.io webhooks
-- Run this in Supabase SQL Editor

-- Create systeme_orders table if it doesn't exist
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

-- Grant permissions to service_role
GRANT ALL ON systeme_orders TO service_role;

-- Enable RLS
ALTER TABLE systeme_orders ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policy (ignore if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'systeme_orders' 
        AND policyname = 'service_role_full_access'
    ) THEN
        CREATE POLICY "service_role_full_access" ON systeme_orders
        FOR ALL TO service_role
        USING (true);
    END IF;
END $$;
