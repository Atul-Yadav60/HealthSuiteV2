import { Ionicons } from "@expo/vector-icons";

// Define a specific type for our navigation tabs to ensure type safety
type NavTab = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap; // This is the critical fix
  route: string;
};

// App Configuration
export const APP_CONFIG = {
  name: "Aarogya AI",
  version: "1.0.0",
  description: "Unified Healthcare AI Assistant",
  tagline: "AI for your health",
};

// ... (MODULES and QUICK_ACTIONS are unchanged) ...
export const MODULES = {
  skinAI: {
    id: "skinAI",
    name: "SkinAI",
    subtitle: "Skin Health Scanner",
    description: "Scan and analyze skin conditions with AI",
    icon: "camera",
    color: "#2EE6D6",
    features: [
      "Skin condition detection",
      "Severity assessment",
      "Self-care guidance",
    ],
  },
  trustMed: {
    id: "trustMed",
    name: "TrustMed.AI",
    subtitle: "Medicine Verification",
    description: "Verify prescriptions and medicine authenticity",
    icon: "shield-checkmark",
    color: "#8A6CFF",
    features: [
      "Prescription verification",
      "Medicine authenticity",
      "Drug interactions",
    ],
  },
  healMind: {
    id: "healMind",
    name: "HealMind.AI",
    subtitle: "Mental Wellness",
    description: "Track mood and get personalized wellness guidance",
    icon: "heart",
    color: "#FF6B9D",
    features: ["Mood tracking", "Stress monitoring", "Wellness coaching"],
  },
  pulseNet: {
    id: "pulseNet",
    name: "PulseNet.AI",
    subtitle: "Community Health",
    description: "Local health alerts and community insights",
    icon: "location",
    color: "#3B82F6",
    features: [
      "Local health alerts",
      "Disease outbreaks",
      "Environmental factors",
    ],
  },
  symptoCare: {
    id: "symptoCare",
    name: "SymptoCare.AI",
    subtitle: "Symptom Analysis",
    description: "Analyze symptoms and find the right specialist",
    icon: "medical",
    color: "#10B981",
    features: [
      "Symptom analysis",
      "Specialist recommendation",
      "Urgency assessment",
    ],
  },
  medPlanner: {
    id: "medPlanner",
    name: "MedPlanner",
    subtitle: "Medication Manager",
    description: "Schedule and track your medications",
    icon: "calendar",
    color: "#F59E0B",
    features: [
      "Medication scheduling",
      "Reminder system",
      "Adherence tracking",
    ],
  },
};
export const QUICK_ACTIONS = [
  {
    id: "scanSkin",
    title: "Scan Skin",
    icon: "camera",
    module: "skinAI",
    color: "#2EE6D6",
  },
  {
    id: "verifyRx",
    title: "Verify Rx",
    icon: "shield-checkmark",
    module: "trustMed",
    color: "#8A6CFF",
  },
  {
    id: "moodCheck",
    title: "Mood Check",
    icon: "heart",
    module: "healMind",
    color: "#FF6B9D",
  },
];

// Navigation Tabs
export const NAV_TABS: NavTab[] = [
  {
    id: "home",
    title: "Home",
    icon: "home",
    route: "/(tabs)/home",
  },
  {
    id: "skinScan",
    title: "Skin Scan",
    icon: "scan",
    route: "/(tabs)/skinScan",
  },
  {
    id: "prescriptionScanner",
    title: "Scan Rx",
    icon: "medkit",
    route: "/(tabs)/prescriptionScanner",
  },
  {
    id: "heartRateMonitor",
    title: "Heart Rate",
    icon: "pulse-outline",
    route: "/(tabs)/heartRateMonitor",
  },
  {
    id: "assistant",
    title: "Assistant",
    icon: "chatbubble",
    route: "/(tabs)/assistant",
  },
  {
    id: "profile",
    title: "Profile",
    icon: "person",
    route: "/(tabs)/profile",
  },
];

// ... (The rest of your MOCK_DATA, API_ENDPOINTS, etc. remains unchanged) ...
// Mock Data
export const MOCK_DATA = {
  user: {
    name: "Shashikant",
    email: "shashikant@example.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    region: "Mumbai",
    language: "en",
  },
  healthTips: [
    {
      id: "1",
      title: "Stay Hydrated",
      description: "Drink 8 glasses of water daily for better health",
      icon: "water",
      category: "wellness",
    },
    {
      id: "2",
      title: "Quality Sleep",
      description: "Aim for 7-9 hours of sleep for optimal health",
      icon: "moon",
      category: "wellness",
    },
    {
      id: "3",
      title: "Air Quality Alert",
      description: "AQI is poor in your area. Consider wearing a mask",
      icon: "cloud",
      category: "environment",
    },
  ],
  recentScans: [
    {
      id: "1",
      condition: "Acne",
      severity: "mild",
      confidence: 0.84,
      date: "2024-01-15",
      image:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=300&fit=crop",
    },
    {
      id: "2",
      condition: "Eczema",
      severity: "moderate",
      confidence: 0.92,
      date: "2024-01-10",
      image:
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
    },
  ],
  medications: [
    {
      id: "1",
      name: "Vitamin D",
      dosage: "1 tab",
      time: "08:00",
      status: "taken",
      date: "2024-01-15",
    },
    {
      id: "2",
      name: "Metformin",
      dosage: "500mg",
      time: "20:00",
      status: "due",
      date: "2024-01-15",
    },
  ],
  alerts: [
    {
      id: "1",
      type: "medication",
      title: "Time for Metformin",
      message: "Take your 500mg dose now",
      time: "20:00",
      priority: "high",
      actions: ["Taken", "Snooze", "Skip"],
    },
    {
      id: "2",
      type: "community",
      title: "Flu cases rising",
      message: "Dengue cases increased in Andheri area",
      time: "2 hours ago",
      priority: "medium",
      actions: ["View Details", "Subscribe"],
    },
  ],
  moodData: [
    { date: "2024-01-09", mood: 3, sleep: 7.5, steps: 6500 },
    { date: "2024-01-10", mood: 4, sleep: 8.0, steps: 7200 },
    { date: "2024-01-11", mood: 2, sleep: 6.5, steps: 4800 },
    { date: "2024-01-12", mood: 4, sleep: 7.8, steps: 6800 },
    { date: "2024-01-13", mood: 5, sleep: 8.2, steps: 7500 },
    { date: "2024-01-14", mood: 3, sleep: 7.0, steps: 5200 },
    { date: "2024-01-15", mood: 4, sleep: 7.5, steps: 6100 },
  ],
};

// API Endpoints (for future integration)
export const API_ENDPOINTS = {
  base: "https://api.aarogya-ai.com",
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    refresh: "/auth/refresh",
  },
  modules: {
    skinAI: "/skinai/scan",
    trustMed: {
      prescription: "/trustmed/ocr",
      medicine: "/trustmed/verify",
      interactions: "/trustmed/interactions",
    },
    healMind: "/healmind/checkin",
    pulseNet: "/pulsenet/alerts",
    symptoCare: "/symptocare/triage",
    medPlanner: "/medplanner/schedule",
  },
  health: {
    history: "/health/history",
    export: "/health/export",
  },
};

// Local Storage Keys
export const STORAGE_KEYS = {
  user: "aarogya_user",
  settings: "aarogya_settings",
  healthData: "aarogya_health_data",
  notifications: "aarogya_notifications",
  language: "aarogya_language",
  theme: "aarogya_theme",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  medication: "medication_reminder",
  community: "community_alert",
  followup: "followup_reminder",
  wellness: "wellness_tip",
  security: "security_alert",
};

// Permissions
export const PERMISSIONS = {
  camera: "Camera access for skin scanning and medicine verification",
  microphone: "Microphone for voice-based health check-ins",
  location: "Location for local health alerts and nearby clinic information",
  notifications: "Notifications for medication reminders and health alerts",
  storage: "Storage for saving health reports and images",
};

// Languages
export const LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "hi", name: "हिंदी", flag: "🇮🇳" },
  { code: "mr", name: "मराठी", flag: "🇮🇳" },
];

// Regions
export const REGIONS = [
  { code: "IN-MH", name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
  { code: "IN-DL", name: "Delhi", cities: ["New Delhi", "Gurgaon", "Noida"] },
  {
    code: "IN-KA",
    name: "Karnataka",
    cities: ["Bangalore", "Mysore", "Hubli"],
  },
];
