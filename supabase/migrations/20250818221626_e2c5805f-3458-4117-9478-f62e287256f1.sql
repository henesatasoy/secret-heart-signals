-- Enable proper realtime for connections table
ALTER TABLE public.connections REPLICA IDENTITY FULL;