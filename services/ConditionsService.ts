import { supabase } from '../lib/supabase';

export interface ConditionItem {
  id: string;
  user_id: string;
  name: string;
  category: 'chronic' | 'acute' | 'mental_health' | 'genetic' | 'autoimmune' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  status: 'active' | 'managed' | 'resolved' | 'monitoring';
  description?: string;
  symptoms?: string[];
  medications?: string[];
  notes?: string;
  diagnosis_date?: string;
  onset_date?: string;
  last_flare_date?: string;
  treatment_plan?: string;
  doctor_name?: string;
  next_appointment?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConditionData {
  name: string;
  category: ConditionItem['category'];
  severity: ConditionItem['severity'];
  status: ConditionItem['status'];
  description?: string;
  symptoms?: string[];
  medications?: string[];
  notes?: string;
  diagnosis_date?: string;
  onset_date?: string;
  last_flare_date?: string;
  treatment_plan?: string;
  doctor_name?: string;
  next_appointment?: string;
}

export interface UpdateConditionData extends Partial<CreateConditionData> {
  // All fields are optional for updates
}

export class ConditionsService {
  /**
   * Get all active conditions for a user
   */
  static async getUserConditions(userId: string): Promise<ConditionItem[]> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user conditions:', error);
        throw new Error(`Failed to fetch conditions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserConditions:', error);
      throw error;
    }
  }

  /**
   * Get a specific condition by ID
   */
  static async getConditionById(conditionId: string, userId: string): Promise<ConditionItem | null> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('id', conditionId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error fetching condition:', error);
        throw new Error(`Failed to fetch condition: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getConditionById:', error);
      throw error;
    }
  }

  /**
   * Create a new condition
   */
  static async createCondition(
    userId: string,
    conditionData: CreateConditionData
  ): Promise<ConditionItem> {
    try {
      // Validate required fields
      if (!conditionData.name?.trim()) {
        throw new Error('Condition name is required');
      }

      const { data, error } = await supabase
        .from('conditions')
        .insert({
          user_id: userId,
          ...conditionData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating condition:', error);
        throw new Error(`Failed to create condition: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createCondition:', error);
      throw error;
    }
  }

  /**
   * Update an existing condition
   */
  static async updateCondition(
    conditionId: string,
    conditionData: UpdateConditionData
  ): Promise<ConditionItem> {
    try {
      // Remove undefined values to avoid overwriting with null
      const cleanData = Object.entries(conditionData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('conditions')
        .update({
          ...cleanData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conditionId)
        .select()
        .single();

      if (error) {
        console.error('Error updating condition:', error);
        throw new Error(`Failed to update condition: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateCondition:', error);
      throw error;
    }
  }

  /**
   * Soft delete a condition (mark as inactive)
   */
  static async deleteCondition(conditionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conditions')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conditionId);

      if (error) {
        console.error('Error deleting condition:', error);
        throw new Error(`Failed to delete condition: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in deleteCondition:', error);
      throw error;
    }
  }

  /**
   * Get conditions by category
   */
  static async getConditionsByCategory(
    userId: string,
    category: ConditionItem['category']
  ): Promise<ConditionItem[]> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conditions by category:', error);
        throw new Error(`Failed to fetch conditions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConditionsByCategory:', error);
      throw error;
    }
  }

  /**
   * Get conditions by status
   */
  static async getConditionsByStatus(
    userId: string,
    status: ConditionItem['status']
  ): Promise<ConditionItem[]> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conditions by status:', error);
        throw new Error(`Failed to fetch conditions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConditionsByStatus:', error);
      throw error;
    }
  }

  /**
   * Get condition statistics for a user
   */
  static async getConditionStats(userId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      const conditions = await this.getUserConditions(userId);

      const stats = {
        total: conditions.length,
        byCategory: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
      };

      conditions.forEach((condition) => {
        // Count by category
        stats.byCategory[condition.category] = 
          (stats.byCategory[condition.category] || 0) + 1;

        // Count by status
        stats.byStatus[condition.status] = 
          (stats.byStatus[condition.status] || 0) + 1;

        // Count by severity
        stats.bySeverity[condition.severity] = 
          (stats.bySeverity[condition.severity] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error in getConditionStats:', error);
      throw error;
    }
  }

  /**
   * Update condition status
   */
  static async updateConditionStatus(
    userId: string,
    conditionId: string,
    status: ConditionItem['status']
  ): Promise<ConditionItem> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conditionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating condition status:', error);
        throw new Error(`Failed to update condition status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in updateConditionStatus:', error);
      throw error;
    }
  }

  /**
   * Log a flare-up for a condition
   */
  static async logFlareUp(
    userId: string,
    conditionId: string,
    severity?: 'mild' | 'moderate' | 'severe' | 'critical',
    notes?: string
  ): Promise<ConditionItem> {
    try {
      const { data, error } = await supabase
        .from('conditions')
        .update({
          last_flare_date: new Date().toISOString(),
          severity: severity || undefined,
          notes: notes ? notes : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conditionId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error logging flare-up:', error);
        throw new Error(`Failed to log flare-up: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in logFlareUp:', error);
      throw error;
    }
  }
}