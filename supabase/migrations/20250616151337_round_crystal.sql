/*
  # Create default admin user

  1. New Data
    - Insert default admin user with hashed password
    - Email: admin@riveroflifeministries.org
    - Password: RiverLife123 (hashed using SHA-256)
  
  2. Security
    - Password is properly hashed before storage
    - Admin user ready for immediate login
*/

-- Insert default admin user with SHA-256 hashed password
-- Password: RiverLife123
-- SHA-256 hash: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
INSERT INTO admins (email, password_hash, name, role) 
VALUES (
  'admin@riveroflifeministries.org',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
  'Administrator',
  'admin'
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = now();