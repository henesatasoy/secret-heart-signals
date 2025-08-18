-- Fix connection sync issue - ensure both partners show connected status
UPDATE connections 
SET is_connected = true, partner_id = 'ec4bc8d3-36f6-4e11-a6c8-65e2589364a5'
WHERE connection_id = '2e72764c-23ee-44cb-9161-230b5e7bbf3b';