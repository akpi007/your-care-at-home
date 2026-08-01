CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_patient_profile_id ON public.bookings(patient_profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON public.bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON public.bookings(status, booking_date DESC);

CREATE INDEX IF NOT EXISTS idx_messages_booking_created ON public.messages(booking_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON public.patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_user_id ON public.medical_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_reports_patient_profile_id ON public.medical_reports(patient_profile_id);

CREATE INDEX IF NOT EXISTS idx_reviews_professional_id ON public.reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_patient_id ON public.reviews(patient_id);

CREATE INDEX IF NOT EXISTS idx_earnings_professional_id ON public.earnings(professional_id);
CREATE INDEX IF NOT EXISTS idx_earnings_booking_id ON public.earnings(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);

CREATE INDEX IF NOT EXISTS idx_availability_professional_id ON public.availability(professional_id);
CREATE INDEX IF NOT EXISTS idx_prof_certs_professional_id ON public.professional_certifications(professional_id);

CREATE INDEX IF NOT EXISTS idx_professionals_status ON public.professionals(verification_status);
CREATE INDEX IF NOT EXISTS idx_professionals_city ON public.professionals(city);
CREATE INDEX IF NOT EXISTS idx_professionals_service_id ON public.professionals(service_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_booking_locations_professional_id ON public.booking_locations(professional_id);