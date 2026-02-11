
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
