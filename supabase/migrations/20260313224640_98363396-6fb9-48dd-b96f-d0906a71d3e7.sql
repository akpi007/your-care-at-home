
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile for every new user
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  -- Assign role based on is_professional flag
  IF (NEW.raw_user_meta_data->>'is_professional')::boolean IS TRUE THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'professional');

    -- Auto-create professionals record
    INSERT INTO public.professionals (
      user_id,
      display_name,
      specialization,
      years_experience,
      license_number,
      bio,
      verification_status
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'specialization', ''),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::int, 0),
      COALESCE(NEW.raw_user_meta_data->>'license_number', ''),
      COALESCE(NEW.raw_user_meta_data->>'bio', ''),
      'pending'
    );
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'patient');
  END IF;

  RETURN NEW;
END;
$$;
