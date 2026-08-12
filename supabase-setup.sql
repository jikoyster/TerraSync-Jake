-- TerraSync farmer table
-- Run this in Supabase SQL Editor if the table does not already exist.

CREATE TABLE IF NOT EXISTS public.farmers (
    farmer_id serial NOT NULL,
    rsbsa_number character varying(100) NOT NULL,
    name character varying(255) NOT NULL,
    crops text NULL,
    status character varying(10) NOT NULL DEFAULT 'active',
    address character varying(255) NULL,
    email character varying(255) NULL,
    phone character varying(20) NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT farmers_pk PRIMARY KEY (farmer_id),
    CONSTRAINT farmers_rsbsa_number_key UNIQUE (rsbsa_number),
    CONSTRAINT farmers_status_check CHECK (status IN ('active', 'inactive'))
);

-- Enable RLS. The app uses the authenticated user's Supabase session.
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;

-- Remove/recreate policies so this script can be safely rerun.
DROP POLICY IF EXISTS "Authenticated users can read farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can insert farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can update farmers" ON public.farmers;
DROP POLICY IF EXISTS "Authenticated users can delete farmers" ON public.farmers;

CREATE POLICY "Authenticated users can read farmers"
ON public.farmers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert farmers"
ON public.farmers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update farmers"
ON public.farmers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete farmers"
ON public.farmers FOR DELETE TO authenticated USING (true);

-- Keep updated_at current whenever a farmer is updated.
CREATE OR REPLACE FUNCTION public.set_farmers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS farmers_set_updated_at ON public.farmers;

CREATE TRIGGER farmers_set_updated_at
BEFORE UPDATE ON public.farmers
FOR EACH ROW
EXECUTE FUNCTION public.set_farmers_updated_at();

-- Optional sample records:
-- INSERT INTO public.farmers (rsbsa_number, name, crops, status, address, email, phone)
-- VALUES
-- ('RSBSA-07-000001', 'Juan Dela Cruz', 'Rice, Corn', 'active', 'Davao del Norte', 'juan@example.com', '+639123456789'),
-- ('RSBSA-07-000002', 'Maria Santos', 'Vegetables', 'active', 'Bukidnon', 'maria@example.com', '+639876543210');
