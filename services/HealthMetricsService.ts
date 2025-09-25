import { supabase } from "../lib/supabase";
import { HealthMetric } from "../types/symptomLogs";

export class HealthMetricsService {
  /**
   * Create a new health metric entry
   */
  static async createHealthMetric(
    userId: string,
    metricData: {
      metric_type: string;
      value: number;
      unit: string;
      device_info?: string;
      notes?: string;
    }
  ): Promise<HealthMetric | null> {
    try {
      const { data, error } = await supabase
        .from("health_metrics")
        .insert({
          user_id: userId,
          ...metricData,
          recorded_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating health metric:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating health metric:", error);
      return null;
    }
  }

  /**
   * Get user's health metrics with optional filtering
   */
  static async getUserHealthMetrics(
    userId: string,
    options?: {
      metric_type?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<HealthMetric[]> {
    try {
      let query = supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false });

      if (options?.metric_type) {
        query = query.eq("metric_type", options.metric_type);
      }

      if (options?.startDate) {
        query = query.gte("recorded_at", options.startDate);
      }

      if (options?.endDate) {
        query = query.lte("recorded_at", options.endDate);
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching health metrics:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching health metrics:", error);
      return [];
    }
  }

  /**
   * Get latest value for a specific metric type
   */
  static async getLatestMetricValue(
    userId: string,
    metricType: string
  ): Promise<HealthMetric | null> {
    try {
      const { data, error } = await supabase
        .from("health_metrics")
        .select("*")
        .eq("user_id", userId)
        .eq("metric_type", metricType)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No data found
          return null;
        }
        console.error("Error fetching latest metric value:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching latest metric value:", error);
      return null;
    }
  }

  /**
   * Create multiple health metrics at once (useful for blood pressure)
   */
  static async createMultipleHealthMetrics(
    userId: string,
    metrics: {
      metric_type: string;
      value: number;
      unit: string;
      device_info?: string;
      notes?: string;
    }[]
  ): Promise<HealthMetric[]> {
    try {
      const metricsWithUserId = metrics.map((metric) => ({
        user_id: userId,
        ...metric,
        recorded_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("health_metrics")
        .insert(metricsWithUserId)
        .select();

      if (error) {
        console.error("Error creating multiple health metrics:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error creating multiple health metrics:", error);
      return [];
    }
  }

  /**
   * Record blood pressure (systolic and diastolic)
   */
  static async recordBloodPressure(
    userId: string,
    systolic: number,
    diastolic: number,
    deviceInfo?: string,
    notes?: string
  ): Promise<HealthMetric[]> {
    const metrics = [
      {
        metric_type: "blood_pressure_systolic",
        value: systolic,
        unit: "mmHg",
        device_info: deviceInfo,
        notes: notes,
      },
      {
        metric_type: "blood_pressure_diastolic",
        value: diastolic,
        unit: "mmHg",
        device_info: deviceInfo,
        notes: notes,
      },
    ];

    return this.createMultipleHealthMetrics(userId, metrics);
  }

  /**
   * Record weight
   */
  static async recordWeight(
    userId: string,
    weight: number,
    unit: "kg" | "lbs" = "kg",
    deviceInfo?: string,
    notes?: string
  ): Promise<HealthMetric | null> {
    return this.createHealthMetric(userId, {
      metric_type: "weight",
      value: weight,
      unit: unit,
      device_info: deviceInfo,
      notes: notes,
    });
  }

  /**
   * Record heart rate
   */
  static async recordHeartRate(
    userId: string,
    heartRate: number,
    deviceInfo?: string,
    notes?: string
  ): Promise<HealthMetric | null> {
    return this.createHealthMetric(userId, {
      metric_type: "heart_rate",
      value: heartRate,
      unit: "bpm",
      device_info: deviceInfo,
      notes: notes,
    });
  }

  /**
   * Record temperature
   */
  static async recordTemperature(
    userId: string,
    temperature: number,
    unit: "celsius" | "fahrenheit" = "celsius",
    deviceInfo?: string,
    notes?: string
  ): Promise<HealthMetric | null> {
    return this.createHealthMetric(userId, {
      metric_type: "temperature",
      value: temperature,
      unit: unit,
      device_info: deviceInfo,
      notes: notes,
    });
  }

  /**
   * Record oxygen saturation
   */
  static async recordOxygenSaturation(
    userId: string,
    oxygenSaturation: number,
    deviceInfo?: string,
    notes?: string
  ): Promise<HealthMetric | null> {
    return this.createHealthMetric(userId, {
      metric_type: "oxygen_saturation",
      value: oxygenSaturation,
      unit: "%",
      device_info: deviceInfo,
      notes: notes,
    });
  }

  /**
   * Get health metrics statistics for a specific metric type
   */
  static async getMetricStatistics(
    userId: string,
    metricType: string,
    days: number = 30
  ): Promise<{
    average: number;
    min: number;
    max: number;
    trend: "increasing" | "decreasing" | "stable";
    totalReadings: number;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await this.getUserHealthMetrics(userId, {
        metric_type: metricType,
        startDate: startDate.toISOString(),
      });

      if (metrics.length === 0) {
        return {
          average: 0,
          min: 0,
          max: 0,
          trend: "stable",
          totalReadings: 0,
        };
      }

      const values = metrics.map((m) => m.value);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);

      // Calculate trend (simple approach: compare first half vs second half)
      let trend: "increasing" | "decreasing" | "stable" = "stable";
      if (metrics.length >= 4) {
        const midpoint = Math.floor(metrics.length / 2);
        const firstHalfAvg =
          metrics
            .slice(midpoint)
            .reduce((sum, m) => sum + m.value, 0) /
          metrics.slice(midpoint).length;
        const secondHalfAvg =
          metrics
            .slice(0, midpoint)
            .reduce((sum, m) => sum + m.value, 0) /
          metrics.slice(0, midpoint).length;

        const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
        
        if (changePercent > 5) {
          trend = "increasing";
        } else if (changePercent < -5) {
          trend = "decreasing";
        }
      }

      return {
        average: Math.round(average * 100) / 100,
        min,
        max,
        trend,
        totalReadings: metrics.length,
      };
    } catch (error) {
      console.error("Error calculating metric statistics:", error);
      return {
        average: 0,
        min: 0,
        max: 0,
        trend: "stable",
        totalReadings: 0,
      };
    }
  }

  /**
   * Get trend data for charts (daily averages)
   */
  static async getMetricTrend(
    userId: string,
    metricType: string,
    days: number = 30
  ): Promise<{ date: string; value: number }[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await this.getUserHealthMetrics(userId, {
        metric_type: metricType,
        startDate: startDate.toISOString(),
      });

      // Group by date and calculate daily averages
      const dailyValues: { [key: string]: number[] } = {};
      
      metrics.forEach((metric) => {
        const date = new Date(metric.recorded_at).toISOString().split("T")[0];
        if (!dailyValues[date]) {
          dailyValues[date] = [];
        }
        dailyValues[date].push(metric.value);
      });

      return Object.entries(dailyValues)
        .map(([date, values]) => ({
          date,
          value: Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 100) / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error("Error fetching metric trend:", error);
      return [];
    }
  }

  /**
   * Delete a health metric entry
   */
  static async deleteHealthMetric(userId: string, metricId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("health_metrics")
        .delete()
        .eq("id", metricId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting health metric:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting health metric:", error);
      return false;
    }
  }

  /**
   * Get all available metric types for a user
   */
  static async getUserMetricTypes(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from("health_metrics")
        .select("metric_type")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching metric types:", error);
        return [];
      }

      const uniqueTypes = [...new Set(data?.map((item) => item.metric_type) || [])];
      return uniqueTypes;
    } catch (error) {
      console.error("Error fetching metric types:", error);
      return [];
    }
  }

  /**
   * Format metric value for display
   */
  static formatMetricValue(metric: HealthMetric): string {
    const { value, unit, metric_type } = metric;

    switch (metric_type) {
      case "blood_pressure_systolic":
      case "blood_pressure_diastolic":
        return `${value} ${unit}`;
      case "weight":
        return `${value} ${unit}`;
      case "heart_rate":
        return `${value} ${unit}`;
      case "temperature":
        return `${value}° ${unit === "celsius" ? "C" : "F"}`;
      case "oxygen_saturation":
        return `${value}${unit}`;
      default:
        return `${value} ${unit}`;
    }
  }

  /**
   * Get metric display name
   */
  static getMetricDisplayName(metricType: string): string {
    const displayNames: { [key: string]: string } = {
      weight: "Weight",
      heart_rate: "Heart Rate",
      blood_pressure_systolic: "Blood Pressure (Systolic)",
      blood_pressure_diastolic: "Blood Pressure (Diastolic)",
      temperature: "Temperature",
      oxygen_saturation: "Oxygen Saturation",
      blood_sugar: "Blood Sugar",
      steps: "Daily Steps",
      sleep_hours: "Sleep Duration",
    };

    return displayNames[metricType] || metricType.replace(/_/g, " ");
  }

  /**
   * Validate metric value based on type
   */
  static validateMetricValue(metricType: string, value: number): { valid: boolean; message?: string } {
    switch (metricType) {
      case "weight":
        if (value <= 0 || value > 1000) {
          return { valid: false, message: "Weight must be between 0 and 1000" };
        }
        break;
      case "heart_rate":
        if (value < 30 || value > 250) {
          return { valid: false, message: "Heart rate must be between 30 and 250 BPM" };
        }
        break;
      case "blood_pressure_systolic":
        if (value < 60 || value > 300) {
          return { valid: false, message: "Systolic pressure must be between 60 and 300 mmHg" };
        }
        break;
      case "blood_pressure_diastolic":
        if (value < 30 || value > 200) {
          return { valid: false, message: "Diastolic pressure must be between 30 and 200 mmHg" };
        }
        break;
      case "temperature":
        if (value < 30 || value > 45) {
          return { valid: false, message: "Temperature must be between 30°C and 45°C" };
        }
        break;
      case "oxygen_saturation":
        if (value < 70 || value > 100) {
          return { valid: false, message: "Oxygen saturation must be between 70% and 100%" };
        }
        break;
    }

    return { valid: true };
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