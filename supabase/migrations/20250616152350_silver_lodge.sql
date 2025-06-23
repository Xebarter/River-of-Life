/*
  # Create default admin user

  1. New Data
    - Insert default admin user with email 'admin@riveroflifeministries.org'
    - Set password hash for 'RiverLife123' (SHA-256: bf94286d4c6771a04adcddea25ab2ced94d453fa7a54cc7844a5ee9a7c9cf12d)
    - Set name as 'Administrator' and role as 'admin'

  2. Security
    - Uses the existing RLS policies on the admins table
    - Password is properly hashed using SHA-256
*/

-- Insert the default admin user if it doesn't exist
INSERT INTO admins (email, password_hash, name, role)
SELECT 
  'admin@riveroflifeministries.org',
  'bf94286d4c6771a04adcddea25ab2ced94d453fa7a54cc7844a5ee9a7c9cf12d',
  'Administrator',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE email = 'admin@riveroflifeministries.org'
);