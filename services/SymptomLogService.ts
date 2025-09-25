import { supabase } from '../lib/supabase';
import { SymptomLog, CreateSymptomLogRequest, ConditionUpdate, CreateConditionUpdateRequest } from '../types/symptomLogs';

export class SymptomLogService {
  /**
   * Create a new symptom log entry with enhanced fields
   */
  static async createSymptomLog(userId: string, data: CreateSymptomLogRequest): Promise<SymptomLog | null> {
    try {
      const { data: symptomLog, error } = await supabase
        .from('symptom_logs')
        .insert({
          user_id: userId,
          symptoms: data.symptoms,
          severity: data.severity,
          pain_scale: data.pain_scale || null,
          notes: data.notes || null,
          condition: data.condition || null,
          triggers: data.triggers || null,
          location: data.location || null,
          duration_minutes: data.duration_minutes || null,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating symptom log:', error);
        return null;
      }

      return symptomLog;
    } catch (error) {
      console.error('Error creating symptom log:', error);
      return null;
    }
  }

  /**
   * Get all symptom logs for a user, ordered by most recent first
   */
  static async getUserSymptomLogs(userId: string, limit = 50): Promise<SymptomLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching symptom logs:', error);
        return [];
      }

      return logs || [];
    } catch (error) {
      console.error('Error fetching symptom logs:', error);
      return [];
    }
  }

  /**
   * Get recent symptoms (most frequently logged) for quick access
   */
  static async getRecentSymptoms(userId: string, limit = 10): Promise<string[]> {
    try {
      const { data: logs, error } = await supabase
        .from('symptom_logs')
        .select('symptoms')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(20); // Get last 20 logs to analyze

      if (error) {
        console.error('Error fetching recent symptoms:', error);
        return [];
      }

      // Flatten all symptoms and count frequency
      const symptomCount: { [key: string]: number } = {};
      logs?.forEach(log => {
        log.symptoms.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      });

      // Sort by frequency and return top symptoms
      return Object.entries(symptomCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([symptom]) => symptom);
    } catch (error) {
      console.error('Error fetching recent symptoms:', error);
      return [];
    }
  }

  /**
   * Delete a symptom log entry
   */
  static async deleteSymptomLog(userId: string, logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('symptom_logs')
        .delete()
        .eq('id', logId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting symptom log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting symptom log:', error);
      return false;
    }
  }

  /**
   * Create a condition update entry with enhanced fields
   */
  static async createConditionUpdate(userId: string, data: CreateConditionUpdateRequest): Promise<ConditionUpdate | null> {
    try {
      const { data: conditionUpdate, error } = await supabase
        .from('condition_updates')
        .insert({
          user_id: userId,
          condition_name: data.condition_name,
          condition_type: data.condition_type || null,
          severity: data.severity,
          status: data.status || 'active',
          diagnosis_date: data.diagnosis_date || null,
          notes: data.notes || null,
          symptoms_related: data.symptoms_related || null,
          medications_related: data.medications_related || null,
          doctor_name: data.doctor_name || null,
          next_appointment: data.next_appointment || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating condition update:', error);
        return null;
      }

      return conditionUpdate;
    } catch (error) {
      console.error('Error creating condition update:', error);
      return null;
    }
  }

  /**
   * Get user's ongoing conditions with latest updates
   */
  static async getUserConditions(userId: string): Promise<ConditionUpdate[]> {
    try {
      const { data: conditions, error } = await supabase
        .from('condition_updates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conditions:', error);
        return [];
      }

      // Group by condition name and get the latest update for each
      const latestConditions: { [key: string]: ConditionUpdate } = {};
      conditions?.forEach(condition => {
        if (!latestConditions[condition.condition_name] || 
            new Date(condition.created_at) > new Date(latestConditions[condition.condition_name].created_at)) {
          latestConditions[condition.condition_name] = condition;
        }
      });

      return Object.values(latestConditions);
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  }

  /**
   * Get symptom logs for a specific date range
   */
  static async getSymptomLogsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<SymptomLog[]> {
    try {
      const { data: logs, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', startDate)
        .lte('recorded_at', endDate)
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching symptom logs by date range:', error);
        return [];
      }

      return logs || [];
    } catch (error) {
      console.error('Error fetching symptom logs by date range:', error);
      return [];
    }
  }

  /**
   * Format date for display
   */
  static formatLogDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }

  /**
   * Get full formatted date and time
   */
  static formatFullLogDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get symptom statistics for analytics
   */
  static async getSymptomStatistics(userId: string, days = 30): Promise<{
    totalLogs: number;
    averagePainScale: number;
    mostCommonSymptoms: string[];
    severityDistribution: { [key: string]: number };
    commonTriggers: string[];
    commonLocations: string[];
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('symptom_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) {
        console.error('Error fetching symptom statistics:', error);
        return {
          totalLogs: 0,
          averagePainScale: 0,
          mostCommonSymptoms: [],
          severityDistribution: {},
          commonTriggers: [],
          commonLocations: []
        };
      }

      const totalLogs = logs?.length || 0;
      
      // Calculate average pain scale
      const painScales = logs?.filter(log => log.pain_scale !== null).map(log => log.pain_scale) || [];
      const averagePainScale = painScales.length > 0 
        ? painScales.reduce((sum, scale) => sum + scale, 0) / painScales.length 
        : 0;

      // Most common symptoms
      const symptomCount: { [key: string]: number } = {};
      logs?.forEach(log => {
        log.symptoms?.forEach(symptom => {
          symptomCount[symptom] = (symptomCount[symptom] || 0) + 1;
        });
      });
      const mostCommonSymptoms = Object.entries(symptomCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symptom]) => symptom);

      // Severity distribution
      const severityDistribution: { [key: string]: number } = {};
      logs?.forEach(log => {
        severityDistribution[log.severity] = (severityDistribution[log.severity] || 0) + 1;
      });

      // Common triggers
      const triggerCount: { [key: string]: number } = {};
      logs?.forEach(log => {
        log.triggers?.forEach(trigger => {
          triggerCount[trigger] = (triggerCount[trigger] || 0) + 1;
        });
      });
      const commonTriggers = Object.entries(triggerCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([trigger]) => trigger);

      // Common locations
      const locationCount: { [key: string]: number } = {};
      logs?.forEach(log => {
        if (log.location) {
          locationCount[log.location] = (locationCount[log.location] || 0) + 1;
        }
      });
      const commonLocations = Object.entries(locationCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([location]) => location);

      return {
        totalLogs,
        averagePainScale: Math.round(averagePainScale * 10) / 10,
        mostCommonSymptoms,
        severityDistribution,
        commonTriggers,
        commonLocations
      };
    } catch (error) {
      console.error('Error fetching symptom statistics:', error);
      return {
        totalLogs: 0,
        averagePainScale: 0,
        mostCommonSymptoms: [],
        severityDistribution: {},
        commonTriggers: [],
        commonLocations: []
      };
    }
  }

  /**
   * Get pain scale trend over time
   */
  static async getPainScaleTrend(userId: string, days = 30): Promise<{
    date: string;
    averagePain: number;
  }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('symptom_logs')
        .select('recorded_at, pain_scale')
        .eq('user_id', userId)
        .gte('recorded_at', startDate.toISOString())
        .not('pain_scale', 'is', null)
        .order('recorded_at', { ascending: true });

      if (error) {
        console.error('Error fetching pain scale trend:', error);
        return [];
      }

      // Group by date and calculate average
      const dailyPain: { [key: string]: number[] } = {};
      logs?.forEach(log => {
        const date = new Date(log.recorded_at).toISOString().split('T')[0];
        if (!dailyPain[date]) {
          dailyPain[date] = [];
        }
        dailyPain[date].push(log.pain_scale);
      });

      return Object.entries(dailyPain).map(([date, painScales]) => ({
        date,
        averagePain: Math.round((painScales.reduce((sum, scale) => sum + scale, 0) / painScales.length) * 10) / 10
      }));
    } catch (error) {
      console.error('Error fetching pain scale trend:', error);
      return [];
    }
  }
}