-- Create the processed_images table
CREATE TABLE processed_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename VARCHAR NOT NULL,
  storage_path VARCHAR NOT NULL,
  public_url VARCHAR NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO storage.buckets (id, name, public) VALUES ('processed-images', 'processed-images', true);

CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'processed-images');
CREATE POLICY "Allow public downloads" ON storage.objects FOR SELECT USING (bucket_id = 'processed-images');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'processed-images');

ALTER TABLE processed_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on processed_images" ON processed_images FOR ALL USING (true);
