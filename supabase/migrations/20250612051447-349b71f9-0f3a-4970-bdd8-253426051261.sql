
-- Add missing columns to user_sessions table
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS daily_call_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS leads_data JSONB DEFAULT NULL;

-- Update the column comment for documentation
COMMENT ON COLUMN public.user_sessions.daily_call_count IS 'Current daily call count for the user session';
COMMENT ON COLUMN public.user_sessions.leads_data IS 'Cached leads data with call counts and timestamps';
