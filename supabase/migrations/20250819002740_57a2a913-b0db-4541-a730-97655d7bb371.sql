-- COMPLETE DATA WIPE - Delete all user data
-- WARNING: This operation is IRREVERSIBLE

-- 1. Delete all messages
DELETE FROM public.messages;

-- 2. Delete all connections  
DELETE FROM public.connections;

-- 3. Delete all users from auth.users (this will cascade to everything)
-- Note: This is a dangerous operation but necessary for complete cleanup
DELETE FROM auth.users;