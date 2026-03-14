-- User table is handled by auth.users in Supabase by default
-- We only need a table for Summaries

DROP TABLE IF EXISTS summaries;
DROP TYPE IF EXISTS summary_type CASCADE;
DROP TYPE IF EXISTS summary_mode CASCADE;

CREATE TYPE summary_type AS ENUM ('youtube', 'url', 'image', 'text');
CREATE TYPE summary_mode AS ENUM ('tldr', 'bullet', 'study', 'blog', 'insights', 'actions');

CREATE TABLE summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type summary_type NOT NULL,
    mode summary_mode NOT NULL,
    title TEXT,
    original_input TEXT NOT NULL, -- The URL or the extracted text
    summary_content TEXT NOT NULL, -- Markdown formatted summary
    metadata JSONB, -- Optional: video thumbnails, channel name, image storage path
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own summaries" ON summaries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries" ON summaries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" ON summaries
    FOR DELETE USING (auth.uid() = user_id);
