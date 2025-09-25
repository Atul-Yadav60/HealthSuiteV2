import { supabase } from "../lib/supabase";
import { MedicationSchedule, MedicationLog } from "../types/symptomLogs";

export class MedicationService {
  /**
   * Create a new medication schedule
   */
  static async createMedicationSchedule(
    userId: string,
    scheduleData: {
      medication_name: string;
      dosage: string;
      frequency: string;
      meal_timing?: "before" | "with" | "after" | "anytime";
      instructions?: string;
      start_date?: string;
      end_date?: string;
      prescribing_doctor?: string;
      refill_reminder?: boolean;
      side_effects?: string[];
    }
  ): Promise<MedicationSchedule | null> {
    try {
      const { data, error } = await supabase
        .from("medication_schedules")
        .insert({
          user_id: userId,
          ...scheduleData,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating medication schedule:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating medication schedule:", error);
      return null;
    }
  }

  /**
   * Get user's medication schedules
   */
  static async getUserMedicationSchedules(
    userId: string,
    activeOnly: boolean = true
  ): Promise<MedicationSchedule[]> {
    try {
      let query = supabase
        .from("medication_schedules")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (activeOnly) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching medication schedules:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching medication schedules:", error);
      return [];
    }
  }

  /**
   * Update medication schedule
   */
  static async updateMedicationSchedule(
    userId: string,
    scheduleId: string,
    updates: Partial<MedicationSchedule>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("medication_schedules")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", scheduleId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error updating medication schedule:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating medication schedule:", error);
      return false;
    }
  }

  /**
   * Deactivate medication schedule (soft delete)
   */
  static async deactivateMedicationSchedule(
    userId: string,
    scheduleId: string
  ): Promise<boolean> {
    return this.updateMedicationSchedule(userId, scheduleId, {
      is_active: false,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Log medication intake
   */
  static async createMedicationLog(
    userId: string,
    logData: {
      medication_schedule_id: string;
      taken_at?: string;
      dosage_taken?: string;
      notes?: string;
      side_effects_experienced?: string[];
    }
  ): Promise<MedicationLog | null> {
    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .insert({
          user_id: userId,
          taken_at: logData.taken_at || new Date().toISOString(),
          dosage_taken: logData.dosage_taken,
          notes: logData.notes,
          side_effects_experienced: logData.side_effects_experienced,
          medication_schedule_id: logData.medication_schedule_id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating medication log:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating medication log:", error);
      return null;
    }
  }

  /**
   * Get medication logs for a user
   */
  static async getUserMedicationLogs(
    userId: string,
    options?: {
      medication_schedule_id?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<MedicationLog[]> {
    try {
      let query = supabase
        .from("medication_logs")
        .select(`
          *,
          medication_schedules (
            medication_name,
            dosage,
            frequency
          )
        `)
        .eq("user_id", userId)
        .order("taken_at", { ascending: false });

      if (options?.medication_schedule_id) {
        query = query.eq("medication_schedule_id", options.medication_schedule_id);
      }

      if (options?.startDate) {
        query = query.gte("taken_at", options.startDate);
      }

      if (options?.endDate) {
        query = query.lte("taken_at", options.endDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching medication logs:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching medication logs:", error);
      return [];
    }
  }

  /**
   * Get medication adherence statistics
   */
  static async getMedicationAdherence(
    userId: string,
    scheduleId: string,
    days: number = 30
  ): Promise<{
    totalExpectedDoses: number;
    takenDoses: number;
    adherencePercentage: number;
    missedDoses: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get the medication schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from("medication_schedules")
        .select("*")
        .eq("id", scheduleId)
        .eq("user_id", userId)
        .single();

      if (scheduleError || !schedule) {
        console.error("Error fetching medication schedule:", scheduleError);
        return {
          totalExpectedDoses: 0,
          takenDoses: 0,
          adherencePercentage: 0,
          missedDoses: 0,
        };
      }

      // Get medication logs for the period
      const logs = await this.getUserMedicationLogs(userId, {
        medication_schedule_id: scheduleId,
        startDate: startDate.toISOString(),
      });

      // Calculate expected doses based on frequency
      const frequencyMap: { [key: string]: number } = {
        "Once daily": 1,
        "Twice daily": 2,
        "Three times daily": 3,
        "Four times daily": 4,
        "Every 4 hours": 6,
        "Every 6 hours": 4,
        "Every 8 hours": 3,
        "Every 12 hours": 2,
        "As needed": 1, // Approximate
        "Weekly": 1 / 7,
        "Every other day": 0.5,
      };

      const dailyDoses = frequencyMap[schedule.frequency] || 1;
      const totalExpectedDoses = Math.ceil(days * dailyDoses);
      const takenDoses = logs.length;
      const missedDoses = Math.max(0, totalExpectedDoses - takenDoses);
      const adherencePercentage = totalExpectedDoses > 0 
        ? Math.round((takenDoses / totalExpectedDoses) * 100) 
        : 0;

      return {
        totalExpectedDoses,
        takenDoses,
        adherencePercentage,
        missedDoses,
      };
    } catch (error) {
      console.error("Error calculating medication adherence:", error);
      return {
        totalExpectedDoses: 0,
        takenDoses: 0,
        adherencePercentage: 0,
        missedDoses: 0,
      };
    }
  }

  /**
   * Get medications due for refill
   */
  static async getMedicationsForRefill(userId: string): Promise<MedicationSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("medication_schedules")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .eq("refill_reminder", true);

      if (error) {
        console.error("Error fetching medications for refill:", error);
        return [];
      }

      // Filter medications that might need refill (this is a simple implementation)
      // In a real app, you'd track medication quantities and consumption
      return data || [];
    } catch (error) {
      console.error("Error fetching medications for refill:", error);
      return [];
    }
  }

  /**
   * Get medication schedule by ID
   */
  static async getMedicationScheduleById(
    userId: string,
    scheduleId: string
  ): Promise<MedicationSchedule | null> {
    try {
      const { data, error } = await supabase
        .from("medication_schedules")
        .select("*")
        .eq("id", scheduleId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // Not found
        }
        console.error("Error fetching medication schedule:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching medication schedule:", error);
      return null;
    }
  }

  /**
   * Search medications by name
   */
  static async searchMedications(userId: string, searchTerm: string): Promise<MedicationSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("medication_schedules")
        .select("*")
        .eq("user_id", userId)
        .ilike("medication_name", `%${searchTerm}%`)
        .order("medication_name");

      if (error) {
        console.error("Error searching medications:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error searching medications:", error);
      return [];
    }
  }

  /**
   * Get common side effects for a medication (from user's historical data)
   */
  static async getMedicationSideEffects(
    userId: string,
    medicationName: string
  ): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("medication_logs")
        .select("side_effects_experienced")
        .eq("user_id", userId)
        .not("side_effects_experienced", "is", null);

      if (error) {
        console.error("Error fetching medication side effects:", error);
        return [];
      }

      // Flatten and count side effects
      const allSideEffects = data
        ?.flatMap(log => log.side_effects_experienced || [])
        .filter(effect => effect) || [];

      // Get unique side effects
      const uniqueSideEffects = [...new Set(allSideEffects)];
      
      return uniqueSideEffects;
    } catch (error) {
      console.error("Error fetching medication side effects:", error);
      return [];
    }
  }

  /**
   * Get medication intake timeline for visualization
   */
  static async getMedicationTimeline(
    userId: string,
    scheduleId: string,
    days: number = 7
  ): Promise<{
    date: string;
    taken: boolean;
    scheduledTimes: string[];
    actualTimes: string[];
  }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await this.getUserMedicationLogs(userId, {
        medication_schedule_id: scheduleId,
        startDate: startDate.toISOString(),
      });

      // Group logs by date
      const logsByDate: { [key: string]: MedicationLog[] } = {};
      logs.forEach(log => {
        const date = new Date(log.taken_at).toISOString().split('T')[0];
        if (!logsByDate[date]) {
          logsByDate[date] = [];
        }
        logsByDate[date].push(log);
      });

      // Generate timeline for the past `days` days
      const timeline = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayLogs = logsByDate[dateStr] || [];
        timeline.push({
          date: dateStr,
          taken: dayLogs.length > 0,
          scheduledTimes: [], // This would need to be calculated based on frequency
          actualTimes: dayLogs.map(log => 
            new Date(log.taken_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })
          ),
        });
      }

      return timeline;
    } catch (error) {
      console.error("Error fetching medication timeline:", error);
      return [];
    }
  }

  /**
   * Delete medication log
   */
  static async deleteMedicationLog(userId: string, logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("medication_logs")
        .delete()
        .eq("id", logId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting medication log:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting medication log:", error);
      return false;
    }
  }

  /**
   * Format medication frequency for display
   */
  static formatFrequency(frequency: string): string {
    const frequencyMap: { [key: string]: string } = {
      "Once daily": "1x per day",
      "Twice daily": "2x per day", 
      "Three times daily": "3x per day",
      "Four times daily": "4x per day",
      "Every 4 hours": "Every 4h",
      "Every 6 hours": "Every 6h",
      "Every 8 hours": "Every 8h",
      "Every 12 hours": "Every 12h",
      "As needed": "As needed",
      "Weekly": "Weekly",
      "Every other day": "Every 2 days",
    };

    return frequencyMap[frequency] || frequency;
  }

  /**
   * Format meal timing for display
   */
  static formatMealTiming(mealTiming: string | null): string {
    if (!mealTiming) return "";
    
    const timingMap: { [key: string]: string } = {
      "before": "Before meals",
      "with": "With meals",
      "after": "After meals", 
      "anytime": "Anytime",
    };

    return timingMap[mealTiming] || mealTiming;
  }

  /**
   * Get medication color based on type/category
   */
  static getMedicationColor(medicationName: string): string {
    // Simple color coding based on medication type
    const name = medicationName.toLowerCase();
    
    if (name.includes("pain") || name.includes("ibuprofen") || name.includes("acetaminophen")) {
      return "#EF4444"; // Red for pain medications
    } else if (name.includes("antibiotic") || name.includes("amoxicillin")) {
      return "#10B981"; // Green for antibiotics
    } else if (name.includes("vitamin") || name.includes("supplement")) {
      return "#F59E0B"; // Orange for vitamins/supplements
    } else if (name.includes("blood pressure") || name.includes("heart")) {
      return "#EC4899"; // Pink for cardiovascular
    } else {
      return "#8B5CF6"; // Purple for general medications
    }
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Format full date for display
   */
  static formatFullDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}