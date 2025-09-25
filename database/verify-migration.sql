-- =================================================================
-- 🔍 DATABASE VERIFICATION SCRIPT
-- =================================================================
-- Run this AFTER the migration script to verify everything was created correctly
-- This will show you a summary of all tables, their row counts, and security settings
-- =================================================================

-- Check if all tables exist and show their details
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_profiles', 
        'symptom_logs', 
        'condition_updates', 
        'medication_schedules', 
        'medication_logs', 
        'health_metrics', 
        'prescription_scans', 
        'notifications'
    )
ORDER BY tablename;

-- Check row counts for each table
DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
BEGIN
    RAISE NOTICE '=== TABLE ROW COUNTS ===';
    
    FOR table_name IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN (
            'user_profiles', 
            'symptom_logs', 
            'condition_updates', 
            'medication_schedules', 
            'medication_logs', 
            'health_metrics', 
            'prescription_scans', 
            'notifications'
        )
    LOOP
        EXECUTE 'SELECT COUNT(*) FROM ' || table_name INTO row_count;
        RAISE NOTICE '📊 % : % rows', RPAD(table_name, 25), row_count;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_profiles', 
        'symptom_logs', 
        'condition_updates', 
        'medication_schedules', 
        'medication_logs', 
        'health_metrics', 
        'prescription_scans', 
        'notifications'
    )
ORDER BY tablename, policyname;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN (
        'user_profiles', 
        'symptom_logs', 
        'condition_updates', 
        'medication_schedules', 
        'medication_logs', 
        'health_metrics', 
        'prescription_scans', 
        'notifications'
    )
ORDER BY tablename, indexname;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 VERIFICATION COMPLETE!';
    RAISE NOTICE '✅ If you see the tables listed above, your migration was successful';
    RAISE NOTICE '🔐 Check that RLS policies exist for each table';
    RAISE NOTICE '⚡ Verify that indexes are created for performance';
    RAISE NOTICE '';
    RAISE NOTICE '🌍 Your app is now using CLOUD DATABASE ONLY!';
    RAISE NOTICE '📱 All data will sync across devices through Supabase Cloud';
END $$;