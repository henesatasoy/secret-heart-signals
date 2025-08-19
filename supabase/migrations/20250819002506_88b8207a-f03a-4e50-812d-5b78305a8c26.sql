-- Fix polygon relationship - disconnect invalid connections
-- Keep only the most recent connection for 2e72764c-23ee-44cb-9161-230b5e7bbf3b

-- Reset all connections for this user except the most recent one
UPDATE connections 
SET is_connected = false, partner_id = null 
WHERE connection_id IN (
    'ec4bc8d3-36f6-4e11-a6c8-65e2589364a5',
    'c972505c-8294-4545-823b-f43e9e68e6ef'
) 
AND partner_id = '2e72764c-23ee-44cb-9161-230b5e7bbf3b';

-- Also disconnect 2e72764c-23ee-44cb-9161-230b5e7b from the invalid connections
-- Keep only connection with 8ac384ee-418e-457b-afb9-94392e15835f (original pair)