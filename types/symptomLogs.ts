// Enhanced types matching the new database schema
export interface SymptomLog {
  id: string;
  user_id: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  pain_scale?: number; // 0-10 pain scale
  notes?: string;
  condition?: string;
  triggers?: string[]; // Array of potential triggers
  location?: string; // Body location if applicable
  duration_minutes?: number; // How long symptoms lasted
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSymptomLogRequest {
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  pain_scale?: number;
  notes?: string;
  condition?: string;
  triggers?: string[];
  location?: string;
  duration_minutes?: number;
}

export interface ConditionUpdate {
  id: string;
  user_id: string;
  condition_name: string;
  condition_type?: 'chronic' | 'acute' | 'temporary' | 'ongoing';
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'resolved' | 'monitoring' | 'improving' | 'worsening';
  diagnosis_date?: string;
  notes?: string;
  symptoms_related?: string[]; // Related symptoms
  medications_related?: string[]; // Related medications
  doctor_name?: string;
  next_appointment?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConditionUpdateRequest {
  condition_name: string;
  condition_type?: 'chronic' | 'acute' | 'temporary' | 'ongoing';
  severity: 'mild' | 'moderate' | 'severe';
  status?: 'active' | 'resolved' | 'monitoring' | 'improving' | 'worsening';
  diagnosis_date?: string;
  notes?: string;
  symptoms_related?: string[];
  medications_related?: string[];
  doctor_name?: string;
  next_appointment?: string;
}

// Enhanced medication types
export interface MedicationSchedule {
  id: string;
  user_id: string;
  medication_name: string;
  generic_name?: string;
  brand_name?: string;
  dosage: string;
  unit: string;
  frequency: string;
  schedule_times: string[];
  meal_timing?: 'before_meal' | 'with_meal' | 'after_meal' | 'anytime';
  start_date: string;
  end_date?: string;
  total_quantity?: number;
  remaining_quantity?: number;
  refill_reminder_days: number;
  condition_for?: string;
  prescribing_doctor?: string;
  pharmacy_info?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  side_effects?: string[];
  special_instructions?: string;
  is_active: boolean;
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicationScheduleRequest {
  medication_name: string;
  generic_name?: string;
  brand_name?: string;
  dosage: string;
  unit: string;
  frequency: string;
  schedule_times: string[];
  meal_timing?: 'before_meal' | 'with_meal' | 'after_meal' | 'anytime';
  start_date: string;
  end_date?: string;
  total_quantity?: number;
  remaining_quantity?: number;
  refill_reminder_days?: number;
  condition_for?: string;
  prescribing_doctor?: string;
  pharmacy_info?: {
    name?: string;
    phone?: string;
    address?: string;
  };
  side_effects?: string[];
  special_instructions?: string;
  reminder_enabled?: boolean;
}

// Health metrics types
export interface HealthMetric {
  id: string;
  user_id: string;
  metric_type: string; // weight, blood_pressure, heart_rate, temperature, glucose, etc.
  value_primary: number;
  value_secondary?: number; // For metrics like BP (diastolic)
  unit: string;
  additional_data?: any;
  measurement_method?: string;
  device_info?: {
    brand?: string;
    model?: string;
    serial?: string;
  };
  body_position?: 'sitting' | 'standing' | 'lying' | 'walking';
  notes?: string;
  symptoms_during?: string[];
  medications_taken?: boolean;
  recorded_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateHealthMetricRequest {
  metric_type: string;
  value_primary: number;
  value_secondary?: number;
  unit: string;
  additional_data?: any;
  measurement_method?: string;
  device_info?: {
    brand?: string;
    model?: string;
    serial?: string;
  };
  body_position?: 'sitting' | 'standing' | 'lying' | 'walking';
  notes?: string;
  symptoms_during?: string[];
  medications_taken?: boolean;
}