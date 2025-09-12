-- Supabase Database Setup for AI Chatbot
-- Run this SQL in your Supabase SQL Editor

-- Create the conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_id TEXT UNIQUE NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    lead_analysis JSONB DEFAULT NULL,
    lead_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create an index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Note: No updated_at column needed for this simple setup

-- Grant necessary permissions (adjust as needed for your setup)
-- ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Optional: Create a policy for row level security (uncomment if needed)
-- CREATE POLICY "Enable all operations for service role" ON conversations
--     FOR ALL USING (true);

-- Insert a test conversation (optional - remove in production)
-- INSERT INTO conversations (conversation_id, messages) 
-- VALUES ('test-session-123', '[{"role": "system", "content": "You are a helpful AI assistant."}]');

-- Verify the table was created successfully
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'conversations' 
ORDER BY ordinal_position;
