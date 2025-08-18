-- Enable proper realtime for connections table
ALTER TABLE public.connections REPLICA IDENTITY FULL;

-- Add connections table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;