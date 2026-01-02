-- Add additional fields to Camp table
ALTER TABLE Camp ADD COLUMN description TEXT;
ALTER TABLE Camp ADD COLUMN location TEXT;
ALTER TABLE Camp ADD COLUMN venue TEXT;
ALTER TABLE Camp ADD COLUMN highlights TEXT DEFAULT '[]';
ALTER TABLE Camp ADD COLUMN registration_deadline INTEGER;
ALTER TABLE Camp ADD COLUMN capacity INTEGER;
ALTER TABLE Camp ADD COLUMN contact_email TEXT;
ALTER TABLE Camp ADD COLUMN contact_phone TEXT;
