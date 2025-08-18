-- Clean up duplicate UPDATE policies on connections table
DROP POLICY IF EXISTS "Users can be set as partners" ON public.connections;

-- The existing "Users can update connections for partnership" policy already handles this correctly