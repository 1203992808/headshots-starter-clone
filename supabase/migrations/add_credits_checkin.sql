ALTER TABLE public.credits ADD COLUMN last_check_in timestamptz, ADD COLUMN updated_at timestamptz DEFAULT now();
