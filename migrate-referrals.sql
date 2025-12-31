-- Add job_id column to referrals table
ALTER TABLE referrals ADD COLUMN job_id INTEGER REFERENCES jobs(id);