-- Create allergies table for better allergy management
CREATE TABLE IF NOT EXISTS public.allergies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL, -- e.g., "Peanuts", "Penicillin", "Pollen"
    category VARCHAR(50) NOT NULL CHECK (category IN ('food', 'medication', 'environmental', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe', 'life-threatening')),
    reactions TEXT[] NOT NULL, -- Array of reaction symptoms
    notes TEXT,
    first_reaction_date DATE,
    last_reaction_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON public.allergies(user_id);
CREATE INDEX IF NOT EXISTS idx_allergies_category ON public.allergies(category);
CREATE INDEX IF NOT EXISTS idx_allergies_severity ON public.allergies(severity);
CREATE INDEX IF NOT EXISTS idx_allergies_active ON public.allergies(is_active);
CREATE INDEX IF NOT EXISTS idx_allergies_created_at ON public.allergies(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.allergies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for allergies
CREATE POLICY "Users can view their own allergies" ON public.allergies
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own allergies" ON public.allergies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allergies" ON public.allergies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allergies" ON public.allergies
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_allergies_updated_at 
    BEFORE UPDATE ON public.allergies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON public.allergies TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ SUCCESS: Allergies table created successfully!';
    RAISE NOTICE '🔐 Row Level Security enabled';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🤖 Auto-update trigger enabled';
END $$;