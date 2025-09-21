import { Ionicons } from "@expo/vector-icons";

// Define a specific type for our navigation tabs to ensure type safety
type NavTab = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap; // This is the critical fix
  route: string;
};

// Define the QuickAction type
export type QuickAction = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  module: string;
  color: string;
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

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "scanSkin",
    title: "Scan Skin",
    icon: "camera",
    module: "/modules/skinAI",
    color: "#2EE6D6",
  },
  {
    id: "verifyRx",
    title: "Verify Rx",
    icon: "shield-checkmark",
    module: "/modules/trustMed",
    color: "#8A6CFF",
  },
  {
    id: "medPlanner",
    title: "Med Planner",
    icon: "calendar-outline",
    module: "/(tabs)/medPlanner",
    color: "#4ECDC4",    
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
  {
    id: "alerts",
    title: "Alerts",
    icon: "notifications",
    route: "/(tabs)/profile",
  },
  {
    id: "health",
    title: "Health",
    icon: "heart",
    route: "/(tabs)/profile",
  },
];

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
      id: "102",
      title: "Stay Hydrated",
      description: "Drink 8 glasses of water daily for better health",
      icon: "water",
      category: "wellness",
    },
    {
      id: "103",
      title: "Quality Sleep",
      description: "Aim for 7-9 hours of sleep for optimal health",
      icon: "moon",
      category: "wellness",
    },
    {
      id: "104",
      title: "Air Quality Alert",
      description: "AQI is poor in your area. Consider wearing a mask",
      icon: "cloud",
      category: "environment",
    },
     { id: "1", title: "Start your day with a glass of warm lemon water.", icon: "water-outline" },
    { id: "2", title: "Carry a reusable water bottle to sip throughout the day.", icon: "flask-outline" },
    { id: "3", title: "Eat water-rich foods like cucumber, watermelon, and strawberries.", icon: "nutrition-outline" },
    { id: "4", title: "Drink water before you feel thirsty to prevent dehydration.", icon: "water" },
    { id: "5", title: "Infuse water with mint or citrus for a refreshing flavor.", icon: "leaf-outline" },
    // Sleep
    { id: "6", title: "Establish a consistent sleep schedule, even on weekends.", icon: "alarm-outline" },
    { id: "7", title: "Create a relaxing bedtime routine, such as reading a book.", icon: "book-outline" },
    { id: "8", title: "Avoid caffeine and heavy meals close to bedtime.", icon: "cafe-outline" },
    { id: "9", title: "Keep your bedroom dark, cool, and quiet for optimal sleep.", icon: "moon-outline" },
    { id: "10", title: "Limit screen time an hour before you go to sleep.", icon: "phone-portrait-outline" },
    // Exercise
    { id: "11", title: "Find an exercise you enjoy to make it a sustainable habit.", icon: "bicycle-outline" },
    { id: "12", title: "Incorporate strength training at least twice a week.", icon: "barbell-outline" },
    { id: "13", title: "Take the stairs instead of the elevator for a quick workout.", icon: "walk-outline" },
    { id: "14", title: "Warm up before exercising and cool down afterward to prevent injury.", icon: "body-outline" },
    { id: "15", title: "Listen to your body and rest when you need to.", icon: "pulse-outline" },
    { id: "16", title: "A brisk 10-minute walk can boost your energy and mood.", icon: "footsteps-outline" },
    { id: "17", title: "Try a new activity like yoga or swimming to work different muscles.", icon: "fitness-outline" },
    { id: "18", title: "Exercise with a friend to stay motivated and accountable.", icon: "people-outline" },
    // Nutrition
    { id: "19", title: "Fill half your plate with colorful vegetables at every meal.", icon: "restaurant-outline" },
    { id: "20", title: "Choose whole grains like oats, quinoa, and brown rice.", icon: "leaf-outline" },
    { id: "21", title: "Include lean protein sources such as chicken, fish, beans, and lentils.", icon: "fish-outline" },
    { id: "22", title: "Opt for healthy fats from avocados, nuts, and olive oil.", icon: "leaf-outline" },
    { id: "23", title: "Read nutrition labels to be aware of added sugars and sodium.", icon: "reader-outline" },
    { id: "24", title: "Plan your meals for the week to make healthier choices.", icon: "calendar-outline" },
    { id: "25", title: "Cook at home more often to control ingredients and portion sizes.", icon: "home-outline" },
    { id: "26", title: "Snack on fruits, nuts, or yogurt instead of processed snacks.", icon: "nutrition-outline" },
    { id: "27", title: "Limit your intake of red and processed meats.", icon: "fast-food-outline" },
    { id: "28", title: "Add herbs and spices to flavor your food instead of salt.", icon: "leaf-outline" },
    // Mental Wellness
    { id: "29", title: "Practice gratitude by noting three things you're thankful for each day.", icon: "happy-outline" },
    { id: "30", title: "Take a few deep, slow breaths when you feel stressed or anxious.", icon: "pulse-outline" },
    { id: "31", title: "Disconnect from technology for a period each day.", icon: "power-outline" },
    { id: "32", title: "Spend time in nature; even a short walk in a park can help.", icon: "walk-outline" },
    { id: "33", title: "Engage in a hobby that brings you joy and relaxation.", icon: "color-palette-outline" },
    { id: "34", title: "Connect with friends or family; social interaction is vital.", icon: "chatbubbles-outline" },
    { id: "35", title: "Set realistic goals and celebrate your small achievements.", icon: "ribbon-outline" },
    { id: "36", title: "Don't be afraid to ask for help when you need it.", icon: "help-buoy-outline" },
    { id: "37", title: "Practice positive self-talk to build confidence.", icon: "sparkles-outline" },
    { id: "38", title: "Journaling can be a great way to process your thoughts and emotions.", icon: "book-outline" },
    { id: "39", title: "Declutter your living space to create a more calming environment.", icon: "trash-outline" },
    // General Health
    { id: "40", title: "Get regular dental check-ups and practice good oral hygiene.", icon: "happy-outline" },
    { id: "41", title: "Protect your hearing by avoiding prolonged exposure to loud noises.", icon: "ear-outline" },
    { id: "42", title: "Take care of your eyes by taking breaks from screens and getting them checked.", icon: "eye-outline" },
    { id: "43", title: "Wear sunscreen daily, even on cloudy days, to protect your skin.", icon: "sunny-outline" },
    { id: "44", title: "Know your numbers: blood pressure, cholesterol, and blood sugar.", icon: "analytics-outline" },
    { id: "45", title: "Limit alcohol consumption to moderate levels.", icon: "wine-outline" },
    { id: "46", title: "If you smoke, consider quitting. Resources are available to help.", icon: "close-circle-outline" },
    { id: "47", title: "Laugh often. It's good for your heart and soul.", icon: "happy-outline" },
    { id: "48", title: "Learn CPR and basic first aid; you could save a life.", icon: "medkit-outline" },
    { id: "49", title: "Maintain a healthy weight through diet and exercise.", icon: "scale-outline" },
    { id: "50", title: "Check the UV index before spending time outdoors.", icon: "sunny-outline" },
    { id: "51", title: "Stand up and stretch every 30-60 minutes if you have a desk job.", icon: "body-outline" },
    { id: "52", title: "Keep your vaccinations up to date as recommended by your doctor.", icon: "shield-checkmark-outline" },
    { id: "53", title: "Eat mindfully, savoring each bite and listening to your body's hunger cues.", icon: "restaurant-outline" },
    { id: "54", title: "Add fermented foods like yogurt or kimchi to your diet for gut health.", icon: "nutrition-outline" },
    { id: "55", title: "Challenge your brain with puzzles, games, or learning something new.", icon: "bulb-outline" },
    { id: "56", title: "Floss daily to prevent gum disease and improve oral health.", icon: "happy-outline" },
    { id: "57", title: "Choose stairs over the elevator whenever possible.", icon: "footsteps-outline" },
    { id: "58", title: "Limit your intake of sugary cereals and opt for oatmeal or eggs.", icon: "egg-outline" },
    { id: "59", title: "Create a budget to manage financial stress, which can impact health.", icon: "wallet-outline" },
    { id: "60", title: "Organize your medications to ensure you take them correctly.", icon: "medkit-outline" },
    { id: "61", title: "If you feel unwell, don't hesitate to consult a doctor.", icon: "pulse-outline" },
    { id: "62", title: "Keep a clean and organized home to reduce stress and allergens.", icon: "home-outline" },
    { id: "63", title: "Practice safe driving habits to prevent accidents.", icon: "car-sport-outline" },
    { id: "64", title: "Use ergonomic furniture and equipment to support your posture at work.", icon: "laptop-outline" },
    { id: "65", title: "Stay informed about health news from reliable sources.", icon: "newspaper-outline" },
    { id: "66", title: "Volunteer or help others to boost your sense of purpose and happiness.", icon: "heart-outline" },
    { id: "67", title: "Drink green tea for its antioxidant benefits.", icon: "cafe-outline" },
    { id: "68", title: "Make time for hobbies and activities you are passionate about.", icon: "musical-notes-outline" },
    { id: "69", title: "Practice forgiveness to let go of anger and resentment.", icon: "happy-outline" },
    { id: "70", title: "Set boundaries in your personal and professional life to protect your energy.", icon: "git-commit-outline" },
    { id: "71", title: "Get some morning sunlight to help regulate your sleep-wake cycle.", icon: "sunny-outline" },
    { id: "72", title: "Avoid comparing yourself to others, especially on social media.", icon: "at-outline" },
    { id: "73", title: "Try to eat a 'rainbow' of fruits and vegetables for diverse nutrients.", icon: "nutrition-outline" },
    { id: "74", title: "Cuddle with a pet to reduce stress and blood pressure.", icon: "paw-outline" },
    { id: "75", title: "Unplug from news and social media for a while if it becomes overwhelming.", icon: "eye-off-outline" },
    { id: "76", title: "Swap sugary sodas for sparkling water with a splash of juice.", icon: "water-outline" },
    { id: "77", title: "Do something kind for someone else without expecting anything in return.", icon: "heart-circle-outline" },
    { id: "78", title: "Check your skin regularly for any new or changing moles.", icon: "body-outline" },
    { id: "79", title: "Keep your workspace well-lit to reduce eye strain.", icon: "bulb-outline" },
    { id: "80", title: "Take a cold shower for a minute to boost circulation and energy.", icon: "snow-outline" },
    { id: "81", title: "Practice portion control by using smaller plates.", icon: "restaurant-outline" },
    { id: "82", title: "If you drink coffee, try to have your last cup before 2 PM.", icon: "cafe-outline" },
    { id: "83", title: "Read for at least 15 minutes a day to expand your knowledge.", icon: "book-outline" },
    { id: "84", title: "Try to walk at least 7,000-10,000 steps per day.", icon: "footsteps-outline" },
    { id: "85", title: "Listen to calming music to help you relax and focus.", icon: "musical-notes-outline" },
    { id: "86", title: "Plan a healthy meal you've never tried before.", icon: "receipt-outline" },
    { id: "87", title: "Sit up straight to improve breathing and confidence.", icon: "man-outline" },
    { id: "88", title: "Drink a glass of water upon waking up to rehydrate your body.", icon: "water-outline" },
    { id: "89", title: "Keep a plant on your desk to improve air quality and mood.", icon: "leaf-outline" },
    { id: "90", title: "Schedule 'worry time' to avoid letting anxieties consume your day.", icon: "timer-outline" },
    { id: "91", title: "Eat dark chocolate in moderation for its antioxidant properties.", icon: "heart-outline" },
    { id: "92", title: "Try to incorporate some form of balance exercise, like standing on one leg.", icon: "walk-outline" },
    { id: "93", title: "End your day by reflecting on one positive thing that happened.", icon: "star-outline" },
    { id: "94", title: "Make sure your shoes provide good support to prevent foot pain.", icon: "footsteps-outline" },
    { id: "95", title: "Learn to say 'no' to commitments that will overextend you.", icon: "hand-left-outline" },
    { id: "96", title: "Replace white bread and pasta with whole-wheat alternatives.", icon: "nutrition-outline" },
    { id: "97", title: "Get your annual flu shot to protect yourself and others.", icon: "medkit-outline" },
    { id: "98", title: "Always wear a seatbelt, no matter how short the drive.", icon: "car-sport-outline" },
    { id: "99", title: "Don't skip breakfast; it kickstarts your metabolism for the day.", icon: "egg-outline" },
    { id: "100", title: "Try to limit eating out to a few times a week to control your diet.", icon: "restaurant-outline" },
    { id: "101", title: "Take care of your mental health just as you do your physical health.", icon: "happy-outline" },
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