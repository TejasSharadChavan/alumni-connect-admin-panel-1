-- Add resume_url column to applications table
ALTER TABLE applications ADD COLUMN resume_url TEXT;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  alumni_id INTEGER NOT NULL REFERENCES users(id),
  code TEXT NOT NULL UNIQUE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  description TEXT,
  max_uses INTEGER DEFAULT 10,
  used_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  expires_at TEXT,
  created_at TEXT NOT NULL
);

-- Create referral_usage table
CREATE TABLE IF NOT EXISTS referral_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  referral_id INTEGER NOT NULL REFERENCES referrals(id),
  student_id INTEGER NOT NULL REFERENCES users(id),
  job_id INTEGER REFERENCES jobs(id),
  application_id INTEGER REFERENCES applications(id),
  used_at TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);
CREATE INDEX IF NOT EXISTS idx_referrals_alumni_id ON referrals(alumni_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_referral_id ON referral_usage(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_usage_student_id ON referral_usage(student_id);
