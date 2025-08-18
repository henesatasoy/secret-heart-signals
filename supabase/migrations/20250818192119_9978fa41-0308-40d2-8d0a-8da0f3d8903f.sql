-- Test the connection update to see if RLS is blocking
-- First let me check the exact update that should work for connection
UPDATE public.connections 
SET partner_id = '2e72764c-23ee-44cb-9161-230b5e7bbf3b', is_connected = true 
WHERE connection_id = 'ec4bc8d3-36f6-4e11-a6c8-65e2589364a5';

UPDATE public.connections 
SET partner_id = 'ec4bc8d3-36f6-4e11-a6c8-65e2589364a5', is_connected = true 
WHERE connection_id = '2e72764c-23ee-44cb-9161-230b5e7bbf3b';