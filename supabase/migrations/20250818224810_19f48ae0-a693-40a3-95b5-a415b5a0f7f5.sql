-- Fix SELECT policy to allow users to check if partner connections exist
-- This is needed for the connectWith function to work properly

DROP POLICY IF EXISTS "Partners can view connections where they are partner" ON public.connections;

CREATE POLICY "Users can view all connections" ON public.connections
FOR SELECT 
USING (true); -- Allow everyone to view all connections for connection checking