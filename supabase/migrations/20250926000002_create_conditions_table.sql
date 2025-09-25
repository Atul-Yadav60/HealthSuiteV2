-- Create conditions table for user health conditions management
-- This table will store user's ongoing health conditions with detailed information

-- Drop table if exists (for development)
DROP TABLE IF EXISTS public.conditions CASCADE;

-- Create conditions table
CREATE TABLE public.conditions (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Foreign key to users (auth.users)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Condition details
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('chronic', 'acute', 'mental_health', 'genetic', 'autoimmune', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')) DEFAULT 'mild',
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'managed', 'resolved', 'monitoring')) DEFAULT 'active',
    
    -- Condition information
    description TEXT,
    symptoms TEXT[],
    medications TEXT[],
    notes TEXT,
    
    -- Important dates
    diagnosis_date DATE,
    onset_date DATE,
    last_flare_date DATE,
    
    -- Treatment information
    treatment_plan TEXT,
    doctor_name VARCHAR(255),
    next_appointment DATE,
    
    -- System fields
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX idx_conditions_user_id ON public.conditions(user_id);
CREATE INDEX idx_conditions_category ON public.conditions(category);
CREATE INDEX idx_conditions_severity ON public.conditions(severity);
CREATE INDEX idx_conditions_status ON public.conditions(status);
CREATE INDEX idx_conditions_active ON public.conditions(is_active);
CREATE INDEX idx_conditions_created_at ON public.conditions(created_at DESC);

-- Add composite index for user queries
CREATE INDEX idx_conditions_user_active ON public.conditions(user_id, is_active, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can view their own conditions
CREATE POLICY "Users can view their own conditions" ON public.conditions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own conditions
CREATE POLICY "Users can insert their own conditions" ON public.conditions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own conditions
CREATE POLICY "Users can update their own conditions" ON public.conditions
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own conditions
CREATE POLICY "Users can delete their own conditions" ON public.conditions
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER set_conditions_updated_at
    BEFORE UPDATE ON public.conditions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.conditions IS 'User health conditions with detailed tracking and management';
COMMENT ON COLUMN public.conditions.category IS 'Type of condition: chronic, acute, mental_health, genetic, autoimmune, other';
COMMENT ON COLUMN public.conditions.severity IS 'Severity level: mild, moderate, severe, critical';
COMMENT ON COLUMN public.conditions.status IS 'Current status: active, managed, resolved, monitoring';
COMMENT ON COLUMN public.conditions.symptoms IS 'Array of symptoms related to this condition';
COMMENT ON COLUMN public.conditions.medications IS 'Array of medications for this condition';
COMMENT ON COLUMN public.conditions.is_active IS 'Soft delete flag - false means condition is archived/deleted';

-- Success notification
DO $$ BEGIN
    RAISE NOTICE '✅ SUCCESS: Conditions table created successfully!';
    RAISE NOTICE '🔐 Row Level Security enabled';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🤖 Auto-update trigger enabled';
END $$;