-- Remove duplicate SELECT policy that overlaps
DROP POLICY IF EXISTS "Users can view their own connection" ON public.connections;

-- The "Partners can view connections where they are partner" policy already covers this use case
-- It allows users to view their own connections AND connections where they are partners