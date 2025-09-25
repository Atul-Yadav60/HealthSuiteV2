import { supabase } from '../lib/supabase';

export class DatabaseInspector {
  /**
   * Get all table names in the public schema
   */
  static async getAllTables(): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_all_tables');
      
      if (error) {
        // Fallback: Try to query information_schema if RPC doesn't exist
        console.log('RPC not found, trying information_schema...');
        const { data: tables, error: schemaError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .eq('table_type', 'BASE TABLE');
          
        if (schemaError) {
          console.error('Error fetching tables:', schemaError);
          return [];
        }
        
        return tables?.map((t: any) => t.table_name) || [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllTables:', error);
      return [];
    }
  }

  /**
   * Test database connection and list tables using a simpler approach
   */
  static async inspectDatabase(): Promise<{
    connected: boolean;
    tables: string[];
    tableData: { [key: string]: any[] };
    issues: string[];
  }> {
    const result = {
      connected: false,
      tables: [] as string[],
      tableData: {} as { [key: string]: any[] },
      issues: [] as string[]
    };

    try {
      // Test connection by trying to query auth.users (should always exist)
      const { data: authTest, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        result.issues.push(`Auth connection issue: ${authError.message}`);
      } else {
        result.connected = true;
      }

      // Try to query known tables that might exist in a health app
      const possibleTables = [
        'symptom_logs',
        'condition_updates', 
        'medication_schedules',
        'health_records',
        'user_profiles',
        'appointments',
        'health_metrics',
        'allergies'
      ];

      for (const tableName of possibleTables) {
        try {
          const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(5); // Just get a few rows to check structure

          if (!error) {
            result.tables.push(tableName);
            result.tableData[tableName] = data || [];
            console.log(`✅ Found table: ${tableName} (${count} rows)`);
          }
        } catch (tableError) {
          // Table doesn't exist, skip
        }
      }

      // Check for required tables for symptom logging
      const requiredTables = ['symptom_logs', 'condition_updates'];
      const missingTables = requiredTables.filter(table => !result.tables.includes(table));
      
      if (missingTables.length > 0) {
        result.issues.push(`Missing required tables: ${missingTables.join(', ')}`);
      }

    } catch (error) {
      result.issues.push(`Database inspection failed: ${error}`);
    }

    return result;
  }

  /**
   * Create missing tables for symptom logging
   */
  static async createSymptomLogTables(): Promise<boolean> {
    try {
      // Note: This requires database admin privileges
      // Better to run SQL directly in Supabase dashboard
      console.log('Creating tables requires admin privileges. Please run the SQL from symptom-logs-schema.sql in your Supabase dashboard.');
      return false;
    } catch (error) {
      console.error('Error creating tables:', error);
      return false;
    }
  }

  /**
   * Test symptom logging functionality
   */
  static async testSymptomLogging(userId: string): Promise<boolean> {
    try {
      // Test inserting a sample symptom log
      const { data, error } = await supabase
        .from('symptom_logs')
        .insert({
          user_id: userId,
          symptoms: ['Test Symptom'],
          severity: 'Mild',
          notes: 'Test entry - can be deleted'
        })
        .select()
        .single();

      if (error) {
        console.error('Error testing symptom logging:', error);
        return false;
      }

      // Clean up test data
      if (data) {
        await supabase
          .from('symptom_logs')
          .delete()
          .eq('id', data.id);
      }

      return true;
    } catch (error) {
      console.error('Error in test symptom logging:', error);
      return false;
    }
  }

  /**
   * Get table statistics
   */
  static async getTableStats(): Promise<{ [key: string]: number }> {
    const stats: { [key: string]: number } = {};
    
    try {
      const tables = ['symptom_logs', 'condition_updates', 'medication_schedules'];
      
      for (const table of tables) {
        try {
          const { count } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          stats[table] = count || 0;
        } catch {
          // Table doesn't exist
          stats[table] = -1; // -1 indicates table doesn't exist
        }
      }
    } catch (error) {
      console.error('Error getting table stats:', error);
    }

    return stats;
  }
}