-- Fix RLS policies to allow proper partner operations

-- Allow users to insert connections for other users (needed when B connects via A's link)
DROP POLICY IF EXISTS "Users can create their own connection" ON public.connections;
CREATE POLICY "Users can create connections" ON public.connections
FOR INSERT 
WITH CHECK (true); -- Allow anyone to create connections

-- Fix UPDATE policy to allow partner disconnection properly  
DROP POLICY IF EXISTS "Users can update connections for partnership" ON public.connections;
CREATE POLICY "Users can update connections for partnership" ON public.connections
FOR UPDATE 
USING (
  -- Users can update their own connection OR 
  -- Users can update connections where they are the partner (for disconnection)
  ((auth.uid())::text = connection_id) OR 
  ((auth.uid())::text = partner_id)
);