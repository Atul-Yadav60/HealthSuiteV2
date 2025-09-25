import { supabase } from '../lib/supabase';

export interface AllergyItem {
  id: string;
  user_id: string;
  name: string;
  category: 'food' | 'medication' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reactions: string[];
  notes?: string;
  first_reaction_date?: string;
  last_reaction_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAllergyData {
  name: string;
  category: AllergyItem['category'];
  severity: AllergyItem['severity'];
  reactions: string[];
  notes?: string;
  first_reaction_date?: string;
  last_reaction_date?: string;
}

export class AllergiesService {
  /**
   * Get user's allergies from allergies table
   */
  static async getUserAllergies(userId: string): Promise<AllergyItem[]> {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching allergies:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserAllergies:', error);
      throw error;
    }
  }

  /**
   * Get a specific allergy by ID
   */
  static async getAllergyById(userId: string, allergyId: string): Promise<AllergyItem | null> {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .select('*')
        .eq('user_id', userId)
        .eq('id', allergyId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching allergy:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getAllergyById:', error);
      throw error;
    }
  }

  /**
   * Create a new allergy
   */
  static async createAllergy(userId: string, allergyData: CreateAllergyData): Promise<AllergyItem> {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .insert({
          user_id: userId,
          ...allergyData,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating allergy:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createAllergy:', error);
      throw error;
    }
  }

  /**
   * Update an existing allergy
   */
  static async updateAllergy(userId: string, allergyId: string, allergyData: Partial<CreateAllergyData>): Promise<AllergyItem> {
    try {
      const { data, error } = await supabase
        .from('allergies')
        .update(allergyData)
        .eq('user_id', userId)
        .eq('id', allergyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating allergy:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateAllergy:', error);
      throw error;
    }
  }

  /**
   * Delete an allergy (soft delete)
   */
  static async deleteAllergy(userId: string, allergyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('allergies')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('id', allergyId);

      if (error) {
        console.error('Error deleting allergy:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteAllergy:', error);
      throw error;
    }
  }

  /**
   * Get allergies by category
   */
  static async getAllergiesByCategory(userId: string): Promise<Record<string, AllergyItem[]>> {
    try {
      const allergies = await this.getUserAllergies(userId);
      
      return allergies.reduce((grouped, allergy) => {
        const category = allergy.category;
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(allergy);
        return grouped;
      }, {} as Record<string, AllergyItem[]>);
    } catch (error) {
      console.error('Error grouping allergies by category:', error);
      throw error;
    }
  }

  /**
   * Get allergy statistics
   */
  static async getAllergyStats(userId: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    try {
      const allergies = await this.getUserAllergies(userId);
      
      const byCategory = allergies.reduce((stats, allergy) => {
        stats[allergy.category] = (stats[allergy.category] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      const bySeverity = allergies.reduce((stats, allergy) => {
        stats[allergy.severity] = (stats[allergy.severity] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);

      return {
        total: allergies.length,
        byCategory,
        bySeverity,
      };
    } catch (error) {
      console.error('Error getting allergy stats:', error);
      throw error;
    }
  }
}