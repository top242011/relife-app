/*
  # Create Authentication and Registration System

  ## Overview
  This migration creates a complete authentication system with admin approval workflow.
  Users must register and wait for admin approval before accessing the system.

  ## 1. New Tables
    
    ### `auth_users`
    Core authentication table for all users
    - `id` (uuid, primary key) - Unique user identifier
    - `email` (text, unique, not null) - User email address
    - `password_hash` (text, not null) - Hashed password using bcrypt
    - `name` (text, not null) - Full name
    - `role` (text, not null, default 'user') - User role: 'admin' or 'user'
    - `is_active` (boolean, default true) - Account active status
    - `created_at` (timestamptz, default now()) - Registration timestamp
    - `updated_at` (timestamptz, default now()) - Last update timestamp

    ### `registration_requests`
    Tracks pending registration requests awaiting admin approval
    - `id` (uuid, primary key) - Unique request identifier
    - `email` (text, unique, not null) - Applicant email
    - `password_hash` (text, not null) - Pre-hashed password
    - `name` (text, not null) - Applicant full name
    - `student_id` (text) - Optional student ID
    - `education_center` (text) - Optional education center
    - `phone` (text) - Optional phone number
    - `reason` (text) - Optional reason for joining
    - `status` (text, default 'pending') - Status: 'pending', 'approved', 'rejected'
    - `reviewed_by` (uuid) - Admin who reviewed (foreign key to auth_users)
    - `reviewed_at` (timestamptz) - Review timestamp
    - `rejection_reason` (text) - Optional reason if rejected
    - `created_at` (timestamptz, default now()) - Request submission timestamp
    - `updated_at` (timestamptz, default now()) - Last update timestamp

  ## 2. Security - Row Level Security (RLS)
    
    ### auth_users table
    - Enabled RLS to protect user data
    - Users can read their own profile only
    - Users can update their own profile only
    - Only admins can view all users
    
    ### registration_requests table
    - Enabled RLS to protect registration data
    - Users can create registration requests (public access for registration)
    - Users can view their own registration requests
    - Only admins can view all registration requests
    - Only admins can update registration requests (approve/reject)

  ## 3. Important Notes
    - Passwords must be hashed before storing (use bcrypt with salt rounds 10)
    - The first user should be created as admin manually or via seed
    - Email validation should be handled at application level
    - Registration requests are archived after approval/rejection
    - When approved, user data is copied to auth_users table
*/

-- Create auth_users table
CREATE TABLE IF NOT EXISTS auth_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registration_requests table
CREATE TABLE IF NOT EXISTS registration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  student_id text,
  education_center text,
  phone text,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth_users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on auth_users
ALTER TABLE auth_users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on registration_requests
ALTER TABLE registration_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_users

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON auth_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON auth_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON auth_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for registration_requests

-- Anyone can create registration requests (for public registration)
CREATE POLICY "Anyone can create registration request"
  ON registration_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own registration requests
CREATE POLICY "Users can view own registration request"
  ON registration_requests FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth_users WHERE id = auth.uid()));

-- Admins can view all registration requests
CREATE POLICY "Admins can view all registration requests"
  ON registration_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update registration requests
CREATE POLICY "Admins can update registration requests"
  ON registration_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);
CREATE INDEX IF NOT EXISTS idx_auth_users_role ON auth_users(role);
CREATE INDEX IF NOT EXISTS idx_registration_requests_status ON registration_requests(status);
CREATE INDEX IF NOT EXISTS idx_registration_requests_email ON registration_requests(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_auth_users_updated_at
  BEFORE UPDATE ON auth_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registration_requests_updated_at
  BEFORE UPDATE ON registration_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();