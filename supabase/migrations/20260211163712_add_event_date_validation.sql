/*
  # Add date validation constraints for event_date

  1. Changes
    - Fix existing logs with invalid dates (future dates or more than 100 years old)
    - Add CHECK constraint to logs table to ensure event_date is not in the future
    - Add CHECK constraint to logs table to ensure event_date is not more than 100 years in the past
  
  2. Security
    - Prevents invalid dates from being inserted into the database
    - Ensures data integrity at the database level
    - Complements client-side validation for defense in depth
  
  3. Important Notes
    - Existing logs with invalid dates will be updated to today's date
    - This ensures data consistency while enabling validation
*/

-- Update existing logs with invalid dates to today's date
UPDATE logs
SET event_date = CURRENT_DATE
WHERE event_date > CURRENT_DATE 
   OR event_date < CURRENT_DATE - INTERVAL '100 years';

-- Add CHECK constraint to ensure event_date is not in the future and not more than 100 years old
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'logs_event_date_range_check'
  ) THEN
    ALTER TABLE logs
    ADD CONSTRAINT logs_event_date_range_check
    CHECK (
      event_date <= CURRENT_DATE 
      AND event_date >= CURRENT_DATE - INTERVAL '100 years'
    );
  END IF;
END $$;
