import { supabase } from '../lib/supabase';

export interface ConditionUpdate {
  id: string;
  user_id: string;
  condition_name: string;
  category: 'chronic' | 'acute' | 'mental-health' | 'other';
  status: 'active' | 'managed' | 'resolved' | 'monitoring';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  symptoms?: string[];
  triggers?: string[];
  medications?: string[];
  notes?: string;
  diagnosed_date?: string;
  last_flare_date?: string;
  next_appointment?: string;
  doctor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ConditionStats {
  total: number;
  active: number;
  managed: number;
  resolved: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
}

export class ConditionsService {
  /**
   * Get all conditions for a user
   */
  static async getUserConditions(userId: string): Promise<ConditionUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('condition_updates')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  }

  /**
   * Get a specific condition by ID
   */
  static async getCondition(userId: string, conditionId: string): Promise<ConditionUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('condition_updates')
        .select('*')
        .eq('user_id', userId)
        .eq('id', conditionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No condition found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching condition:', error);
      throw error;
    }
  }

  /**
   * Create a new condition
   */
  static async createCondition(condition: Omit<ConditionUpdate, 'id' | 'created_at' | 'updated_at'>): Promise<ConditionUpdate> {
    try {
      const { data, error } = await supabase
        .from('condition_updates')
        .insert({
          ...condition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating condition:', error);
      throw error;
    }
  }

  /**
   * Update an existing condition
   */
  static async updateCondition(
    userId: string, 
    conditionId: string, 
    updates: Partial<Omit<ConditionUpdate, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('condition_updates')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('id', conditionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating condition:', error);
      throw error;
    }
  }

  /**
   * Delete a condition
   */
  static async deleteCondition(userId: string, conditionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('condition_updates')
        .delete()
        .eq('user_id', userId)
        .eq('id', conditionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting condition:', error);
      throw error;
    }
  }

  /**
   * Get conditions by category
   */
  static async getConditionsByCategory(userId: string): Promise<Record<string, ConditionUpdate[]>> {
    try {
      const conditions = await this.getUserConditions(userId);
      
      return conditions.reduce((grouped, condition) => {
        const category = condition.category;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(condition);
        return grouped;
      }, {} as Record<string, ConditionUpdate[]>);
    } catch (error) {
      console.error('Error grouping conditions by category:', error);
      throw error;
    }
  }

  /**
   * Get conditions by status
   */
  static async getConditionsByStatus(userId: string): Promise<Record<string, ConditionUpdate[]>> {
    try {
      const conditions = await this.getUserConditions(userId);
      
      return conditions.reduce((grouped, condition) => {
        const status = condition.status;
        if (!grouped[status]) {
          grouped[status] = [];
        }
        grouped[status].push(condition);
        return grouped;
      }, {} as Record<string, ConditionUpdate[]>);
    } catch (error) {
      console.error('Error grouping conditions by status:', error);
      throw error;
    }
  }

  /**
   * Get condition statistics
   */
  static async getConditionStats(userId: string): Promise<ConditionStats> {
    try {
      const conditions = await this.getUserConditions(userId);
      
      const byCategory = conditions.reduce((stats, condition) => {
        stats[condition.category] = (stats[condition.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const bySeverity = conditions.reduce((stats, condition) => {
        stats[condition.severity] = (stats[condition.severity] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const active = conditions.filter(c => c.status === 'active').length;
      const managed = conditions.filter(c => c.status === 'managed').length;
      const resolved = conditions.filter(c => c.status === 'resolved').length;

      return {
        total: conditions.length,
        active,
        managed,
        resolved,
        byCategory,
        bySeverity,
      };
    } catch (error) {
      console.error('Error getting condition stats:', error);
      throw error;
    }
  }

  /**
   * Search conditions by name or symptoms
   */
  static async searchConditions(userId: string, query: string): Promise<ConditionUpdate[]> {
    try {
      const conditions = await this.getUserConditions(userId);
      const searchTerm = query.toLowerCase();
      
      return conditions.filter(condition => 
        condition.condition_name.toLowerCase().includes(searchTerm) ||
        condition.description.toLowerCase().includes(searchTerm) ||
        (condition.symptoms && condition.symptoms.some(symptom => 
          symptom.toLowerCase().includes(searchTerm)
        )) ||
        (condition.notes && condition.notes.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      console.error('Error searching conditions:', error);
      throw error;
    }
  }

  /**
   * Get active conditions requiring attention (e.g., upcoming appointments, severe status)
   */
  static async getConditionsRequiringAttention(userId: string): Promise<ConditionUpdate[]> {
    try {
      const conditions = await this.getUserConditions(userId);
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return conditions.filter(condition => {
        // Active conditions with severe status
        if (condition.status === 'active' && condition.severity === 'severe') {
          return true;
        }

        // Conditions with upcoming appointments within a week
        if (condition.next_appointment) {
          const appointmentDate = new Date(condition.next_appointment);
          return appointmentDate >= today && appointmentDate <= nextWeek;
        }

        // Conditions with recent flare-ups (within last 3 days)
        if (condition.last_flare_date) {
          const flareDate = new Date(condition.last_flare_date);
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(today.getDate() - 3);
          return flareDate >= threeDaysAgo;
        }

        return false;
      });
    } catch (error) {
      console.error('Error getting conditions requiring attention:', error);
      throw error;
    }
  }

  /**
   * Update condition status
   */
  static async updateConditionStatus(
    userId: string, 
    conditionId: string, 
    status: ConditionUpdate['status']
  ): Promise<void> {
    try {
      await this.updateCondition(userId, conditionId, { status });
    } catch (error) {
      console.error('Error updating condition status:', error);
      throw error;
    }
  }

  /**
   * Log a flare-up for a condition
   */
  static async logFlareUp(
    userId: string, 
    conditionId: string, 
    flareDate?: string,
    notes?: string
  ): Promise<void> {
    try {
      const updates: Partial<ConditionUpdate> = {
        last_flare_date: flareDate || new Date().toISOString(),
        status: 'active', // Set to active when logging a flare-up
      };

      if (notes) {
        // Append to existing notes if any
        const condition = await this.getCondition(userId, conditionId);
        if (condition) {
          const existingNotes = condition.notes || '';
          const newNote = `[${new Date().toLocaleDateString()}] Flare-up: ${notes}`;
          updates.notes = existingNotes ? `${existingNotes}\n\n${newNote}` : newNote;
        }
      }

      await this.updateCondition(userId, conditionId, updates);
    } catch (error) {
      console.error('Error logging flare-up:', error);
      throw error;
    }
  }
}