import { supabase } from '../lib/supabase';

export interface AllergyItem {
  id: string;
  name: string;
  category: 'food' | 'medication' | 'environmental' | 'other';
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  reactions: string[];
  notes?: string;
  first_reaction_date?: string;
  last_reaction_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UserAllergies {
  user_id: string;
  allergies: AllergyItem[];
  updated_at: string;
}

export class AllergiesService {
  /**
   * Get user's allergies from user_profiles table
   */
  static async getUserAllergies(userId: string): Promise<AllergyItem[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('allergies')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found, return empty array
          return [];
        }
        throw error;
      }

      // If allergies is stored as a simple string array, convert to AllergyItem format
      if (data?.allergies && Array.isArray(data.allergies)) {
        if (typeof data.allergies[0] === 'string') {
          // Convert old format to new format
          return data.allergies.map((allergy: string, index: number) => ({
            id: `allergy_${index}_${Date.now()}`,
            name: allergy,
            category: 'other' as const,
            severity: 'mild' as const,
            reactions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));
        } else {
          // Already in the new format
          return data.allergies;
        }
      }

      return [];
    } catch (error) {
      console.error('Error fetching user allergies:', error);
      throw error;
    }
  }

  /**
   * Update user's allergies in user_profiles table
   */
  static async updateUserAllergies(userId: string, allergies: AllergyItem[]): Promise<void> {
    try {
      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            allergies: allergies,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) throw insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            allergies: allergies,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating user allergies:', error);
      throw error;
    }
  }

  /**
   * Add a new allergy
   */
  static async addAllergy(userId: string, allergy: Omit<AllergyItem, 'id' | 'created_at' | 'updated_at'>): Promise<AllergyItem> {
    try {
      const existingAllergies = await this.getUserAllergies(userId);
      
      const newAllergy: AllergyItem = {
        ...allergy,
        id: `allergy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedAllergies = [...existingAllergies, newAllergy];
      await this.updateUserAllergies(userId, updatedAllergies);

      return newAllergy;
    } catch (error) {
      console.error('Error adding allergy:', error);
      throw error;
    }
  }

  /**
   * Update an existing allergy
   */
  static async updateAllergy(userId: string, allergyId: string, updates: Partial<Omit<AllergyItem, 'id' | 'created_at'>>): Promise<void> {
    try {
      const existingAllergies = await this.getUserAllergies(userId);
      
      const updatedAllergies = existingAllergies.map(allergy => 
        allergy.id === allergyId 
          ? { 
              ...allergy, 
              ...updates, 
              updated_at: new Date().toISOString() 
            }
          : allergy
      );

      await this.updateUserAllergies(userId, updatedAllergies);
    } catch (error) {
      console.error('Error updating allergy:', error);
      throw error;
    }
  }

  /**
   * Delete an allergy
   */
  static async deleteAllergy(userId: string, allergyId: string): Promise<void> {
    try {
      const existingAllergies = await this.getUserAllergies(userId);
      
      const updatedAllergies = existingAllergies.filter(allergy => allergy.id !== allergyId);
      await this.updateUserAllergies(userId, updatedAllergies);
    } catch (error) {
      console.error('Error deleting allergy:', error);
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