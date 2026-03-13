-- Drop FK constraint on professionals.user_id so we can have demo professionals
ALTER TABLE professionals DROP CONSTRAINT IF EXISTS professionals_user_id_fkey;

-- Make user_id nullable for demo professionals
ALTER TABLE professionals ALTER COLUMN user_id DROP NOT NULL;

-- Add columns
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS available boolean DEFAULT true;

-- Seed services (idempotent with ON CONFLICT)
INSERT INTO services (id, name, description) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Doctor', 'General & specialist consultations'),
  ('a1b2c3d4-0001-4000-8000-000000000002', 'Nurse', 'Professional nursing care'),
  ('a1b2c3d4-0001-4000-8000-000000000003', 'Physiotherapist', 'Physical therapy sessions'),
  ('a1b2c3d4-0001-4000-8000-000000000004', 'Caregiver', 'Daily care assistance'),
  ('a1b2c3d4-0001-4000-8000-000000000005', 'Lab Technician', 'Blood tests & diagnostics')
ON CONFLICT (id) DO NOTHING;

-- Seed demo professionals (user_id is NULL for demo entries)
INSERT INTO professionals (id, user_id, display_name, specialization, service_id, rating, total_reviews, years_experience, consultation_fee, image_url, available, verification_status) VALUES
  ('b1b2c3d4-0001-4000-8000-000000000001', NULL, 'Dr. Sarah Johnson', 'General Physician', 'a1b2c3d4-0001-4000-8000-000000000001', 4.9, 234, 12, 75, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face', true, 'verified'),
  ('b1b2c3d4-0001-4000-8000-000000000002', NULL, 'Emily Chen, RN', 'Critical Care Nurse', 'a1b2c3d4-0001-4000-8000-000000000002', 4.8, 189, 8, 45, 'https://images.unsplash.com/photo-1594824476967-48c8b964ac31?w=200&h=200&fit=crop&crop=face', true, 'verified'),
  ('b1b2c3d4-0001-4000-8000-000000000003', NULL, 'Dr. Michael Park', 'Orthopedic Specialist', 'a1b2c3d4-0001-4000-8000-000000000001', 4.7, 312, 15, 95, 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face', false, 'verified'),
  ('b1b2c3d4-0001-4000-8000-000000000004', NULL, 'Lisa Thompson, PT', 'Sports Physiotherapy', 'a1b2c3d4-0001-4000-8000-000000000003', 4.9, 156, 10, 60, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face', true, 'verified'),
  ('b1b2c3d4-0001-4000-8000-000000000005', NULL, 'James Wilson', 'Home Care Specialist', 'a1b2c3d4-0001-4000-8000-000000000004', 4.6, 98, 6, 35, 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face', true, 'verified'),
  ('b1b2c3d4-0001-4000-8000-000000000006', NULL, 'Dr. Priya Patel', 'Pediatrician', 'a1b2c3d4-0001-4000-8000-000000000001', 4.8, 267, 11, 80, 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face', true, 'verified')
ON CONFLICT (id) DO NOTHING;
