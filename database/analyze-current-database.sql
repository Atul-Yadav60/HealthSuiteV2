-- =================================================================
-- 🔍 CURRENT DATABASE ANALYSIS SCRIPT
-- =================================================================
-- Run this in your Supabase Dashboard > SQL Editor to see what tables you currently have
-- This will show you exactly what exists in your cloud database right now
-- =================================================================

-- Show all tables in your database
SELECT 
    schemaname as "Schema",
    tablename as "Table Name",
    tableowner as "Owner",
    hasindexes as "Has Indexes",
    hasrules as "Has Rules", 
    hastriggers as "Has Triggers",
    rowsecurity as "Row Security Enabled"
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- Show table details with row counts
DO $$
DECLARE
    table_record RECORD;
    row_count INTEGER;
    total_tables INTEGER := 0;
    total_rows INTEGER := 0;
BEGIN
    RAISE NOTICE '=== YOUR CURRENT DATABASE TABLES ===';
    RAISE NOTICE '';
    
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        total_tables := total_tables + 1;
        
        BEGIN
            EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_record.schemaname) || '.' || quote_ident(table_record.tablename) INTO row_count;
            total_rows := total_rows + row_count;
            
            RAISE NOTICE '📊 % : % rows', 
                RPAD(table_record.tablename, 25), 
                LPAD(row_count::text, 8);
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ % : ERROR counting rows', 
                    RPAD(table_record.tablename, 25);
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📈 SUMMARY:';
    RAISE NOTICE '   Total Tables: %', total_tables;
    RAISE NOTICE '   Total Rows: %', total_rows;
    RAISE NOTICE '';
END $$;

-- Check if health app required tables exist
DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'user_profiles',
        'symptom_logs', 
        'condition_updates',
        'medication_schedules',
        'medication_logs',
        'health_metrics',
        'prescription_scans',
        'notifications'
    ];
    table_name TEXT;
    table_exists BOOLEAN;
    existing_count INTEGER := 0;
    missing_tables TEXT[] := '{}';
BEGIN
    RAISE NOTICE '=== HEALTH APP TABLES CHECK ===';
    RAISE NOTICE '';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name
        ) INTO table_exists;
        
        IF table_exists THEN
            RAISE NOTICE '✅ % - EXISTS', RPAD(table_name, 25);
            existing_count := existing_count + 1;
        ELSE
            RAISE NOTICE '❌ % - MISSING', RPAD(table_name, 25);
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 HEALTH APP TABLES SUMMARY:';
    RAISE NOTICE '   Required: % tables', array_length(required_tables, 1);
    RAISE NOTICE '   Existing: % tables', existing_count;
    RAISE NOTICE '   Missing: % tables', array_length(required_tables, 1) - existing_count;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '❌ MISSING TABLES:';
        FOREACH table_name IN ARRAY missing_tables
        LOOP
            RAISE NOTICE '   - %', table_name;
        END LOOP;
        RAISE NOTICE '';
        RAISE NOTICE '💡 TO FIX: Run the complete-migration-schema.sql script';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ALL HEALTH APP TABLES EXIST!';
    END IF;
    
    RAISE NOTICE '';
END $$;

-- Show RLS policies for existing tables
SELECT 
    schemaname as "Schema",
    tablename as "Table",
    policyname as "Policy Name",
    cmd as "Command",
    CASE 
        WHEN qual IS NOT NULL THEN 'Custom Rule'
        ELSE 'Default'
    END as "Policy Type"
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Final summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== ANALYSIS COMPLETE ===';
    RAISE NOTICE '✅ Check the output above to see:';
    RAISE NOTICE '   1. All tables currently in your database';
    RAISE NOTICE '   2. Row counts for each table';
    RAISE NOTICE '   3. Which health app tables exist vs missing';
    RAISE NOTICE '   4. Security policies in place';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Next steps:';
    RAISE NOTICE '   - If tables are missing, run complete-migration-schema.sql';
    RAISE NOTICE '   - If all tables exist, your migration is complete!';
    RAISE NOTICE '';
END $$;