-- AfriTalent: Companies & Reviews tables
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text,
  location text,
  description text,
  rating numeric(2,1) DEFAULT 4.0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  author_name text,
  author_role text,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Keep company rating / review_count in sync
CREATE OR REPLACE FUNCTION refresh_company_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE companies c
  SET rating = COALESCE((SELECT round(avg(r.rating)::numeric, 1) FROM reviews r WHERE r.company_id = c.id), 4.0),
      review_count = (SELECT count(*) FROM reviews r WHERE r.company_id = c.id)
  WHERE c.id = COALESCE(NEW.company_id, OLD.company_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS reviews_refresh_company ON reviews;
CREATE TRIGGER reviews_refresh_company
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_company_rating();

-- "Helpful" vote increment used by the Reviews page
CREATE OR REPLACE FUNCTION increment_helpful(review_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT USING (true);

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post reviews"
  ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
