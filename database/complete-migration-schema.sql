-- =================================================================
-- 🚀 COMPLETE HEALTH SUITE CLOUD MIGRATION SCHEMA
-- =================================================================
-- This script creates ALL tables needed for your health app on Supabase Cloud
-- Run this in your Supabase Dashboard > SQL Editor to migrate everything to cloud
-- 
-- Tables included:
-- 1. symptom_logs - For symptom logging feature
-- 2. condition_updates - For condition tracking  
-- 3. medication_schedules - For medication management
-- 4. user_profiles - For user profile data
-- 5. health_metrics - For general health tracking
-- 6. prescription_scans - For prescription scanner results
-- =================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =================================================================
-- 1. USER PROFILES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    phone_number TEXT,
    emergency_contact JSONB,
    medical_history JSONB,
    allergies TEXT[],
    blood_type VARCHAR(5),
    height_cm DECIMAL(5,2),
    weight_kg DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 2. SYMPTOM LOGS TABLE (Updated)
-- =================================================================
CREATE TABLE IF NOT EXISTS symptom_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    symptoms TEXT[] NOT NULL, -- Array of symptom names
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    condition VARCHAR(255), -- Associated condition
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 3. CONDITION UPDATES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS condition_updates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    condition_name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 4. MEDICATION SCHEDULES TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS medication_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100), -- e.g., "twice daily", "every 8 hours"
    schedule_times TIME[], -- Array of times when medication should be taken
    start_date DATE NOT NULL,
    end_date DATE,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    reminder_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 5. MEDICATION LOGS TABLE (for tracking actual medication taken)
-- =================================================================
CREATE TABLE IF NOT EXISTS medication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    schedule_id UUID REFERENCES medication_schedules(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    status VARCHAR(20) DEFAULT 'taken' CHECK (status IN ('taken', 'missed', 'delayed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 6. HEALTH METRICS TABLE (for vitals, weight, etc.)
-- =================================================================
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    metric_type VARCHAR(50) NOT NULL, -- e.g., 'weight', 'blood_pressure', 'heart_rate', 'temperature'
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- e.g., 'kg', 'mmHg', 'bpm', '°C'
    additional_data JSONB, -- For complex metrics like blood pressure (systolic/diastolic)
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 7. PRESCRIPTION SCANS TABLE
-- =================================================================
CREATE TABLE IF NOT EXISTS prescription_scans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT,
    scan_text TEXT, -- OCR extracted text
    medications JSONB, -- Parsed medication data
    doctor_name VARCHAR(255),
    clinic_name VARCHAR(255),
    scan_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- 8. NOTIFICATIONS TABLE (for medication reminders, etc.)
-- =================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'medication', 'symptom_reminder', 'appointment'
    reference_id UUID, -- ID of related record (medication_schedule, etc.)
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =================================================================
-- INDEXES FOR PERFORMANCE
-- =================================================================

-- User Profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Symptom Logs
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_recorded_at ON symptom_logs(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_condition ON symptom_logs(condition);

-- Condition Updates
CREATE INDEX IF NOT EXISTS idx_condition_updates_user_id ON condition_updates(user_id);
CREATE INDEX IF NOT EXISTS idx_condition_updates_condition_name ON condition_updates(condition_name);
CREATE INDEX IF NOT EXISTS idx_condition_updates_created_at ON condition_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_condition_updates_status ON condition_updates(status);

-- Medication Schedules
CREATE INDEX IF NOT EXISTS idx_medication_schedules_user_id ON medication_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_active ON medication_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_medication_schedules_start_date ON medication_schedules(start_date);

-- Medication Logs
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_schedule_id ON medication_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_taken_at ON medication_logs(taken_at DESC);

-- Health Metrics
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_type ON health_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);

-- Prescription Scans
CREATE INDEX IF NOT EXISTS idx_prescription_scans_user_id ON prescription_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_scans_date ON prescription_scans(scan_date DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at ON notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- =================================================================
-- ROW LEVEL SECURITY (RLS)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =================================================================
-- RLS POLICIES - USER PROFILES
-- =================================================================
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - SYMPTOM LOGS
-- =================================================================
CREATE POLICY "Users can view their own symptom logs" ON symptom_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own symptom logs" ON symptom_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom logs" ON symptom_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptom logs" ON symptom_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - CONDITION UPDATES
-- =================================================================
CREATE POLICY "Users can view their own condition updates" ON condition_updates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own condition updates" ON condition_updates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own condition updates" ON condition_updates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own condition updates" ON condition_updates
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - MEDICATION SCHEDULES
-- =================================================================
CREATE POLICY "Users can view their own medication schedules" ON medication_schedules
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication schedules" ON medication_schedules
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication schedules" ON medication_schedules
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication schedules" ON medication_schedules
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - MEDICATION LOGS
-- =================================================================
CREATE POLICY "Users can view their own medication logs" ON medication_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medication logs" ON medication_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medication logs" ON medication_logs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medication logs" ON medication_logs
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - HEALTH METRICS
-- =================================================================
CREATE POLICY "Users can view their own health metrics" ON health_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health metrics" ON health_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health metrics" ON health_metrics
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health metrics" ON health_metrics
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - PRESCRIPTION SCANS
-- =================================================================
CREATE POLICY "Users can view their own prescription scans" ON prescription_scans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prescription scans" ON prescription_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prescription scans" ON prescription_scans
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prescription scans" ON prescription_scans
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- RLS POLICIES - NOTIFICATIONS
-- =================================================================
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- =================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =================================================================

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at column
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_symptom_logs_updated_at 
    BEFORE UPDATE ON symptom_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_condition_updates_updated_at 
    BEFORE UPDATE ON condition_updates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medication_schedules_updated_at 
    BEFORE UPDATE ON medication_schedules 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at 
    BEFORE UPDATE ON health_metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescription_scans_updated_at 
    BEFORE UPDATE ON prescription_scans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =================================================================
-- GRANT PERMISSIONS
-- =================================================================
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON symptom_logs TO authenticated;
GRANT ALL ON condition_updates TO authenticated;
GRANT ALL ON medication_schedules TO authenticated;
GRANT ALL ON medication_logs TO authenticated;
GRANT ALL ON health_metrics TO authenticated;
GRANT ALL ON prescription_scans TO authenticated;
GRANT ALL ON notifications TO authenticated;

-- =================================================================
-- SUCCESS MESSAGE
-- =================================================================
DO $$
BEGIN
    RAISE NOTICE '🎉 SUCCESS: All Health Suite tables created successfully on Supabase Cloud!';
    RAISE NOTICE '📊 Tables created: user_profiles, symptom_logs, condition_updates, medication_schedules, medication_logs, health_metrics, prescription_scans, notifications';
    RAISE NOTICE '🔐 Row Level Security enabled on all tables';
    RAISE NOTICE '⚡ Performance indexes created';
    RAISE NOTICE '🤖 Auto-update triggers enabled';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your app is now ready to use cloud database exclusively!';
    RAISE NOTICE '🌍 All data will be saved to Supabase Cloud and sync across devices';
END $$;