-- Create symptom_logs table
CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symptoms TEXT[] NOT NULL, -- Array of symptom names
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create condition_updates table
CREATE TABLE IF NOT EXISTS condition_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Mild', 'Moderate', 'Severe')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_created_at ON symptom_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_condition_updates_user_id ON condition_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_condition_updates_condition_name ON condition_updates(condition_name);
CREATE INDEX IF NOT EXISTS idx_condition_updates_created_at ON condition_updates(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for symptom_logs
CREATE POLICY "Users can view their own symptom logs" ON symptom_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom logs" ON symptom_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom logs" ON symptom_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom logs" ON symptom_logs
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for condition_updates
CREATE POLICY "Users can view their own condition updates" ON condition_updates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own condition updates" ON condition_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own condition updates" ON condition_updates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own condition updates" ON condition_updates
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to both tables
CREATE TRIGGER update_symptom_logs_updated_at 
    BEFORE UPDATE ON symptom_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condition_updates_updated_at 
    BEFORE UPDATE ON condition_updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (if needed)
GRANT ALL ON symptom_logs TO authenticated;
GRANT ALL ON condition_updates TO authenticated;