/*
  # Initial Schema for Axient ALPR System

  1. New Tables
    - `license_plates` - Stores detected license plates with metadata
    - `registered_plates` - Stores registered vehicle information
    - `cameras` - Camera configuration and status
    - `detections` - Links plates to cameras with detection metadata
    - `users` - System users with roles and permissions
    - `notification_logs` - SMS notification history
    - `system_logs` - Application logs and events

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Create indexes for performance

  3. Functions
    - Trigger functions for automatic timestamps
    - Notification trigger for new detections
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'viewer');
CREATE TYPE plate_status AS ENUM ('pending', 'verified', 'flagged');
CREATE TYPE camera_status AS ENUM ('online', 'offline', 'maintenance');
CREATE TYPE registered_plate_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE notification_status AS ENUM ('sent', 'failed', 'pending');

-- License plates table
CREATE TABLE IF NOT EXISTS license_plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text NOT NULL,
  confidence decimal(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  image_url text NOT NULL,
  detected_at timestamptz NOT NULL DEFAULT now(),
  camera_id uuid NOT NULL,
  location jsonb,
  vehicle_info jsonb,
  status plate_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Registered plates table
CREATE TABLE IF NOT EXISTS registered_plates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_number text UNIQUE NOT NULL,
  owner_name text NOT NULL,
  owner_phone text NOT NULL,
  vehicle_make text,
  vehicle_model text,
  vehicle_color text,
  registration_date date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  status registered_plate_status DEFAULT 'active',
  alert_enabled boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cameras table
CREATE TABLE IF NOT EXISTS cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  ip_address inet NOT NULL,
  port integer NOT NULL DEFAULT 554,
  username text,
  password text,
  stream_url text NOT NULL,
  status camera_status DEFAULT 'offline',
  last_heartbeat timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Detections table (junction table with additional metadata)
CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
  plate_id uuid NOT NULL REFERENCES license_plates(id) ON DELETE CASCADE,
  registered_plate_id uuid REFERENCES registered_plates(id),
  confidence decimal(5,4) NOT NULL,
  bounding_box jsonb NOT NULL,
  processing_time decimal(8,3) NOT NULL,
  notification_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role user_role DEFAULT 'viewer',
  name text NOT NULL,
  phone text,
  permissions text[] DEFAULT '{}',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_id uuid NOT NULL REFERENCES detections(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  message text NOT NULL,
  status notification_status DEFAULT 'pending',
  provider text DEFAULT 'twilio',
  sent_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_license_plates_plate_number ON license_plates(plate_number);
CREATE INDEX IF NOT EXISTS idx_license_plates_detected_at ON license_plates(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_license_plates_camera_id ON license_plates(camera_id);
CREATE INDEX IF NOT EXISTS idx_registered_plates_plate_number ON registered_plates(plate_number);
CREATE INDEX IF NOT EXISTS idx_detections_camera_id ON detections(camera_id);
CREATE INDEX IF NOT EXISTS idx_detections_created_at ON detections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_detection_id ON notification_logs(detection_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);

-- Enable Row Level Security
ALTER TABLE license_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE registered_plates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view license plates based on role"
  ON license_plates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator', 'viewer')
    )
  );

CREATE POLICY "Admins and operators can manage license plates"
  ON license_plates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Users can view registered plates based on role"
  ON registered_plates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator', 'viewer')
    )
  );

CREATE POLICY "Admins and operators can manage registered plates"
  ON registered_plates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator')
    )
  );

CREATE POLICY "Users can view cameras based on role"
  ON cameras FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator', 'viewer')
    )
  );

CREATE POLICY "Only admins can manage cameras"
  ON cameras FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view detections based on role"
  ON detections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'operator', 'viewer')
    )
  );

CREATE POLICY "Only admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can manage users"
  ON users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_license_plates_updated_at 
  BEFORE UPDATE ON license_plates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registered_plates_updated_at 
  BEFORE UPDATE ON registered_plates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at 
  BEFORE UPDATE ON cameras 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
INSERT INTO users (email, password_hash, role, name, permissions) VALUES 
('admin@axient.com', crypt('admin123', gen_salt('bf')), 'admin', 'System Administrator', 
 ARRAY['view_detections', 'manage_plates', 'manage_cameras', 'manage_users', 'view_analytics', 'system_settings']);

-- Insert sample cameras
INSERT INTO cameras (name, location, ip_address, stream_url, status) VALUES 
('Main Entrance', 'Building A - Main Gate', '192.168.1.100', 'rtsp://192.168.1.100:554/stream1', 'online'),
('Parking Lot A', 'North Parking Area', '192.168.1.101', 'rtsp://192.168.1.101:554/stream1', 'online'),
('Exit Gate', 'Building A - Exit', '192.168.1.102', 'rtsp://192.168.1.102:554/stream1', 'offline'),
('Side Entrance', 'Building B - Side Gate', '192.168.1.103', 'rtsp://192.168.1.103:554/stream1', 'online');

-- Insert sample registered plates
INSERT INTO registered_plates (plate_number, owner_name, owner_phone, vehicle_make, vehicle_model, vehicle_color) VALUES 
('ABC-1234', 'John Doe', '+1234567890', 'Toyota', 'Camry', 'White'),
('XYZ-5678', 'Jane Smith', '+1234567891', 'Honda', 'Civic', 'Black'),
('DEF-9012', 'Bob Johnson', '+1234567892', 'Ford', 'F-150', 'Blue');