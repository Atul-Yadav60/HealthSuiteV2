import { supabase } from '../lib/supabase';

// This is the main function your handleSend will call
export const getBotResponse = async (message: string, userId?: string): Promise<string> => {
  const chatService = new ChatService();
  const response = await chatService.processMessage(message, userId);
  return response.message;
};

export interface ChatResponse {
  message: string;
  intent: string;
  data?: any;
  suggestions?: string[];
}

export class ChatService {
  private medicalKnowledge = {
    vitamins: {
      'vitamin c': {
        sources: 'Oranges, strawberries, kiwi, guava, bell peppers',
        dailyNeed: '65-90mg for adults',
        benefits: 'Immune system support, antioxidant properties, wound healing'
      },
      'vitamin d': {
        sources: 'Sunlight exposure, fish, fortified milk, supplements',
        dailyNeed: '600-800 IU for adults',
        benefits: 'Bone health, immune function, mood regulation'
      },
      'iron': {
        sources: 'Spinach, lentils, red meat, tofu, dark chocolate',
        dailyNeed: '8-18mg depending on age and gender',
        benefits: 'Oxygen transport, energy production, brain function'
      },
      'calcium': {
        sources: 'Dairy products, leafy greens, almonds, sesame seeds',
        dailyNeed: '1000-1200mg for adults',
        benefits: 'Bone and teeth health, muscle function, nerve signaling'
      }
    },
    symptoms: {
      'headache': {
        advice: 'Rest in dark room, stay hydrated, apply cold compress',
        warning: 'Consult doctor if severe, frequent, or with fever'
      },
      'fever': {
        advice: 'Stay hydrated, rest, monitor temperature',
        warning: 'See doctor if temperature >103°F or lasts >3 days'
      },
      'cough': {
        advice: 'Stay hydrated, honey for sore throat, use humidifier',
        warning: 'See doctor if persistent >2 weeks or with blood'
      },
      'fatigue': {
        advice: 'Ensure adequate sleep, regular exercise, balanced diet',
        warning: 'Consult doctor if persistent or affects daily activities'
      }
    },
    healthTips: [
      "💧 Drink at least 8 glasses of water daily to stay hydrated",
      "🚶‍♂️ Aim for 10,000 steps daily for better cardiovascular health",
      "😴 Get 7-9 hours of quality sleep each night",
      "🥗 Include 5 servings of fruits and vegetables in your daily diet",
      "🧘‍♀️ Practice 10 minutes of meditation daily to reduce stress",
      "🏃‍♂️ Do 150 minutes of moderate exercise weekly",
      "📱 Take breaks from screens every hour to rest your eyes",
      "🌞 Get 15-30 minutes of sunlight daily for Vitamin D"
    ]
  };

  private hindiResponses = {
    greetings: [
      "नमस्ते! मैं आपका स्वास्थ्य सहायक हूं। कैसे मदद कर सकता हूं?",
      "आपका स्वागत है! आपकी सेहत के लिए मैं यहां हूं।"
    ],
    thanks: [
      "धन्यवाद! और कुछ जानना हो तो पूछिए।",
      "खुशी है कि मदद कर सका! कोई और सवाल हो तो बताइए।"
    ],
    healthTips: [
      "💧 रोज़ाना 8 गिलास पानी पिएं",
      "🚶‍♂️ दिन में 10,000 कदम चलने की कोशिश करें",
      "😴 रात में 7-9 घंटे की नींद लें"
    ]
  };

  async processMessage(message: string, userId?: string): Promise<ChatResponse> {
    const normalizedMessage = message.toLowerCase().trim();
    
    // Detect intent
    const intent = this.detectIntent(normalizedMessage);
    
    try {
      switch (intent) {
        case 'greeting':
          return this.handleGreeting(normalizedMessage);
        
        case 'steps':
          return await this.handleStepsQuery(userId);
        
        case 'medicine_schedule':
          return await this.handleMedicineScheduling(normalizedMessage, userId);
        
        case 'medicine_query':
          return await this.handleMedicineQuery(userId);
        
        case 'vitamin_info':
          return this.handleVitaminQuery(normalizedMessage);
        
        case 'symptom_advice':
          return this.handleSymptomQuery(normalizedMessage);
        
        case 'health_tip':
          return this.handleHealthTipRequest();
        
        case 'bmi':
          return await this.handleBMIQuery(userId);
        
        case 'thanks':
          return this.handleThanks();
        
        default:
          return this.handleUnknown(normalizedMessage);
      }
    } catch (error) {
      console.error('Chat service error:', error);
      return {
        message: "Sorry, I'm having some trouble right now. Please try again later.",
        intent: 'error'
      };
    }
  }

  private detectIntent(message: string): string {
    // Greeting patterns
    if (/^(hi|hello|hey|namaste|namaskar|good morning|good evening)/i.test(message)) {
      return 'greeting';
    }
    
    // Steps queries
    if (/(steps|walk|distance|activity|exercise)/i.test(message)) {
      return 'steps';
    }
    
    // Medicine scheduling
    if (/(add medicine|schedule medicine|remind me|take medicine|medication|med)/i.test(message)) {
      return 'medicine_schedule';
    }
    
    // Medicine queries
    if (/(my medicines|medication list|pills|drugs|prescriptions)/i.test(message)) {
      return 'medicine_query';
    }
    
    // Vitamin information
    if (/(vitamin|mineral|nutrient|calcium|iron)/i.test(message)) {
      return 'vitamin_info';
    }
    
    // Symptom advice
    if (/(headache|fever|cough|pain|sick|symptom|fatigue|cold|flu)/i.test(message)) {
      return 'symptom_advice';
    }
    
    // Health tips
    if (/(health tip|advice|healthy|wellness|tip)/i.test(message)) {
      return 'health_tip';
    }
    
    // BMI queries
    if (/(bmi|weight|height|body mass)/i.test(message)) {
      return 'bmi';
    }
    
    // Thanks
    if (/(thanks|thank you|dhanyawad)/i.test(message)) {
      return 'thanks';
    }
    
    return 'unknown';
  }

  private handleGreeting(message: string): ChatResponse {
    const isHindi = /namaste|namaskar/i.test(message);
    
    if (isHindi) {
      const greeting = this.hindiResponses.greetings[Math.floor(Math.random() * this.hindiResponses.greetings.length)];
      return {
        message: greeting,
        intent: 'greeting',
        suggestions: ['मेरे कदम दिखाओ', 'दवाई याद दिलाओ', 'स्वास्थ्य टिप दो']
      };
    }
    
    return {
      message: "Hello! I'm your Health Assistant. I can help you with:\n\n• Track your daily steps\n• Schedule medicine reminders\n• Get health tips and advice\n• BMI calculations\n• Vitamin information\n\nWhat would you like to know?",
      intent: 'greeting',
      suggestions: ['Show my steps', 'Add medicine reminder', 'Give me a health tip']
    };
  }

  private async handleStepsQuery(userId?: string): Promise<ChatResponse> {
    try {
      // Try to get steps from your existing health data
      const { data, error } = await supabase
        .from('user_health_data')
        .select('steps, date')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(7);

      if (error) {
        return {
          message: "I couldn't retrieve your step data right now. Make sure you're logged in and have recorded some activity data.",
          intent: 'steps'
        };
      }

      if (data && data.length > 0) {
        const today = data[0];
        const weekTotal = data.reduce((sum, day) => sum + (day.steps || 0), 0);
        const average = Math.round(weekTotal / data.length);

        return {
          message: `📊 **Your Step Summary:**\n\n🚶‍♂️ Today: ${today.steps || 0} steps\n📈 7-day average: ${average} steps\n🎯 Weekly total: ${weekTotal} steps\n\n${today.steps >= 10000 ? '🎉 Great job! You hit your daily goal!' : '💪 Keep going! Try to reach 10,000 steps today.'}`,
          intent: 'steps',
          data: { todaySteps: today.steps, weeklyAverage: average }
        };
      } else {
        return {
          message: "I don't see any step data yet. Start tracking your daily activities to see your progress here!",
          intent: 'steps'
        };
      }
    } catch (error) {
      return {
        message: "I'm having trouble accessing your step data. Please make sure you're connected to the internet and try again.",
        intent: 'steps'
      };
    }
  }

  private async handleMedicineScheduling(message: string, userId?: string): Promise<ChatResponse> {
    // Extract medicine name and time from message
    const medicineMatch = message.match(/(add|schedule|remind).*(medicine|med|pill|tablet|capsule)\s+([a-zA-Z\s]+)/i);
    const timeMatch = message.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?|morning|evening|night|afternoon/i);

    if (!medicineMatch) {
      return {
        message: "I'd be happy to help you schedule medicine! Please tell me:\n\n• Medicine name\n• Time to take it\n\nFor example: 'Add medicine Aspirin at 8 AM' or 'Remind me to take Vitamin D in the morning'",
        intent: 'medicine_schedule'
      };
    }

    const medicineName = medicineMatch[3]?.trim();
    
    if (!medicineName) {
      return {
        message: "Please specify the medicine name. For example: 'Add medicine Aspirin at 8 AM'",
        intent: 'medicine_schedule'
      };
    }

    // For now, we'll create a simple response. In the next step, we'll actually save to database
    return {
      message: `✅ **Medicine Scheduled!**\n\n💊 Medicine: ${medicineName}\n⏰ Time: ${timeMatch ? timeMatch[0] : 'As specified'}\n🔔 You'll get reminders\n\n*Note: Full scheduling with database integration will be added in the next step.*`,
      intent: 'medicine_schedule',
      data: { medicine: medicineName, time: timeMatch ? timeMatch[0] : null }
    };
  }

  private async handleMedicineQuery(userId?: string): Promise<ChatResponse> {
    return {
      message: "📋 **Your Medicine Schedule:**\n\nThis feature will show your scheduled medicines once we connect to the database in the next step.\n\nFor now, you can:\n• Ask me to 'Add medicine [name] at [time]'\n• Get health tips\n• Check your daily steps",
      intent: 'medicine_query'
    };
  }

  private handleVitaminQuery(message: string): ChatResponse {
    // Find which vitamin/nutrient is being asked about
    let vitaminInfo = null;
    let vitaminName = '';

    for (const [name, info] of Object.entries(this.medicalKnowledge.vitamins)) {
      if (message.includes(name.replace(' ', ''))) {
        vitaminInfo = info;
        vitaminName = name.toUpperCase();
        break;
      }
    }

    if (vitaminInfo) {
      return {
        message: `💊 **${vitaminName} Information:**\n\n🥗 **Sources:** ${vitaminInfo.sources}\n\n📏 **Daily Need:** ${vitaminInfo.dailyNeed}\n\n✨ **Benefits:** ${vitaminInfo.benefits}\n\n*Always consult your doctor before starting new supplements.*`,
        intent: 'vitamin_info',
        data: { vitamin: vitaminName, info: vitaminInfo }
      };
    }

    return {
      message: "I can provide information about:\n\n• Vitamin C\n• Vitamin D\n• Iron\n• Calcium\n\nWhich one would you like to know about?",
      intent: 'vitamin_info',
      suggestions: ['Vitamin C info', 'Vitamin D benefits', 'Iron sources']
    };
  }

  private handleSymptomQuery(message: string): ChatResponse {
    // Find which symptom is being asked about
    let symptomInfo = null;
    let symptomName = '';

    for (const [name, info] of Object.entries(this.medicalKnowledge.symptoms)) {
      if (message.includes(name)) {
        symptomInfo = info;
        symptomName = name;
        break;
      }
    }

    if (symptomInfo) {
      return {
        message: `🏥 **${symptomName.toUpperCase()} Advice:**\n\n💡 **What you can try:**\n${symptomInfo.advice}\n\n⚠️ **When to see a doctor:**\n${symptomInfo.warning}\n\n*This is general advice. Always consult a healthcare professional for persistent symptoms.*`,
        intent: 'symptom_advice',
        data: { symptom: symptomName, advice: symptomInfo }
      };
    }

    return {
      message: "I can help with common symptoms like:\n\n🤕 Headache\n🤒 Fever\n😷 Cough\n😴 Fatigue\n\nWhat symptom are you experiencing?",
      intent: 'symptom_advice',
      suggestions: ['Headache advice', 'Fever treatment', 'Cough remedies']
    };
  }

  private handleHealthTipRequest(): ChatResponse {
    const randomTip = this.medicalKnowledge.healthTips[Math.floor(Math.random() * this.medicalKnowledge.healthTips.length)];
    
    return {
      message: `💡 **Daily Health Tip:**\n\n${randomTip}\n\n*Want another tip? Just ask for more health advice!*`,
      intent: 'health_tip',
      suggestions: ['Another tip', 'Vitamin information', 'Check my steps']
    };
  }

  private async handleBMIQuery(userId?: string): Promise<ChatResponse> {
    return {
      message: "📊 **BMI Calculator:**\n\nI can help calculate your BMI once we integrate with your health profile data.\n\nFor now, here's the BMI formula:\n**BMI = Weight (kg) ÷ Height (m)²**\n\n**BMI Categories:**\n• Below 18.5: Underweight\n• 18.5-24.9: Normal\n• 25-29.9: Overweight\n• 30+: Obese\n\n*This feature will be enhanced in the next step!*",
      intent: 'bmi'
    };
  }

  private handleThanks(): ChatResponse {
    const responses = [
      "You're welcome! I'm here whenever you need health advice. 😊",
      "Happy to help! Stay healthy and feel free to ask me anything.",
      "Glad I could assist! Take care of your health. 💪",
      "Anytime! Remember, your health is your wealth. 🌟"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      message: randomResponse,
      intent: 'thanks',
      suggestions: ['Health tip', 'Check steps', 'Medicine info']
    };
  }

  private handleUnknown(message: string): ChatResponse {
    const suggestions = [
      "I'm still learning! Here's what I can help you with:\n\n🚶‍♂️ **Steps:** 'Show my steps' or 'How much did I walk today?'\n\n💊 **Medicine:** 'Add medicine Aspirin at 8 AM' or 'My medicine list'\n\n🍎 **Health:** 'Health tip' or 'Vitamin C information'\n\n🤒 **Symptoms:** 'I have a headache' or 'Fever advice'\n\nTry asking me about any of these topics!"
    ];

    return {
      message: suggestions[0],
      intent: 'unknown',
      suggestions: ['Show my steps', 'Health tip', 'Add medicine']
    };
  }
}