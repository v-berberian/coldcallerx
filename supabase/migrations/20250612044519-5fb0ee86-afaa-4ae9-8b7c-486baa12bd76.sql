
-- First, let's check if the migration was applied by examining the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_sessions' 
ORDER BY ordinal_position;

-- If the device_id and last_updated_at columns don't exist, we need to add them
-- Let's also check for any existing data
SELECT COUNT(*) as row_count FROM user_sessions;
