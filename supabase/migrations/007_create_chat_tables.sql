-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique session_id for guests or users
  CONSTRAINT unique_session UNIQUE (session_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot', 'agent')),
  quick_replies JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Index for efficient querying
  INDEX idx_chat_messages_session_created (session_id, created_at DESC)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);

-- Create function to update chat session timestamp
CREATE OR REPLACE FUNCTION update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions 
  SET 
    last_message_at = NOW(),
    updated_at = NOW()
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update session timestamp on new messages
DROP TRIGGER IF EXISTS trigger_update_chat_session_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_chat_session_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_session_timestamp();

-- Enable RLS (Row Level Security)
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own chat sessions
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.current_session_id', true))
  );

CREATE POLICY "Users can insert own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    user_id IS NULL
  );

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id = current_setting('app.current_session_id', true))
  );

-- Users can only access messages from their own sessions
CREATE POLICY "Users can view messages from own sessions" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        chat_sessions.user_id = auth.uid() OR 
        (chat_sessions.user_id IS NULL AND chat_sessions.session_id = current_setting('app.current_session_id', true))
      )
    )
  );

CREATE POLICY "Users can insert messages to own sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND (
        chat_sessions.user_id = auth.uid() OR 
        chat_sessions.user_id IS NULL
      )
    )
  );

-- Admin policies (for support agents)
CREATE POLICY "Admins can view all chat sessions" ON chat_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can view all chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );