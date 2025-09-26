-- Create health_records table for storing user health documents and records
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Basic record information
  file_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- e.g., 'pdf', 'image', 'document'
  file_size BIGINT, -- file size in bytes
  mime_type TEXT, -- MIME type of the file
  
  -- Storage information
  file_path TEXT NOT NULL, -- path in Supabase storage
  storage_bucket TEXT DEFAULT 'health-records', -- bucket name
  
  -- Record metadata
  category TEXT DEFAULT 'general', -- e.g., 'lab', 'prescription', 'imaging', 'doctor_notes', 'insurance', 'general'
  description TEXT, -- user-provided description
  record_date DATE, -- date associated with the medical record (not upload date)
  
  -- Healthcare provider info
  provider_name TEXT, -- doctor/hospital name
  provider_type TEXT, -- e.g., 'doctor', 'hospital', 'lab', 'pharmacy'
  
  -- Status and visibility
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  
  -- System timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
CREATE INDEX idx_health_records_category ON health_records(category);
CREATE INDEX idx_health_records_created_at ON health_records(created_at);
CREATE INDEX idx_health_records_record_date ON health_records(record_date);
CREATE INDEX idx_health_records_active ON health_records(user_id, is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_health_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_health_records_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Users can only see their own health records
CREATE POLICY "Users can view their own health records" ON health_records
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own health records
CREATE POLICY "Users can insert their own health records" ON health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own health records
CREATE POLICY "Users can update their own health records" ON health_records
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own health records
CREATE POLICY "Users can delete their own health records" ON health_records
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for health records if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-records', 'health-records', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for health records bucket
CREATE POLICY "Users can upload their own health records" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'health-records' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own health records" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'health-records' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own health records" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'health-records' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own health records" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'health-records' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );