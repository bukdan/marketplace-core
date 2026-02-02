-- Fix permissive RLS policy on banner_events
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can insert banner events" ON banner_events;

-- Create a more secure policy - allow insert from authenticated users or service role
-- For anonymous tracking, we'll use an edge function with service role
CREATE POLICY "Authenticated users can insert banner events" 
ON banner_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');