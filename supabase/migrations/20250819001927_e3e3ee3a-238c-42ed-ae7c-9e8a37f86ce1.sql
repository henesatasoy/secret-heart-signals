-- Fix asymmetric connection state between users
UPDATE connections 
SET is_connected = true, partner_id = '2e72764c-23ee-44cb-9161-230b5e7bbf3b' 
WHERE connection_id = '8ac384ee-418e-457b-afb9-94392e15835f';