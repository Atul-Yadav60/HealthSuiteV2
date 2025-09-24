import React, { useState, useRef, useEffect } from "react";
import { getBotResponse } from "../../services/ChatService";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "../../hooks/useColorScheme";
import Colors, { gradients } from "../../constants/Colors";
import { QuickActionButton } from "../../components/ui/QuickActionButton";

const { width } = Dimensions.get("window");

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Quick health questions
const QUICK_QUESTIONS = [
  {
    id: "steps",
    title: "Daily Steps",
    icon: "walk-outline",
    color: "#10B981",
    question: "How many steps have I taken today?",
  },
  {
    id: "bmi",
    title: "BMI Check",
    icon: "calculator-outline",
    color: "#6366F1",
    question: "Calculate my BMI",
  },
  {
    id: "tips",
    title: "Health Tips",
    icon: "bulb-outline",
    color: "#F59E0B",
    question: "Give me a health tip for today",
  },
];

export default function AssistantScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Hi! I'm your Health Assistant 👋\n\nI can help you with health questions, track your wellness, and provide personalized advice.\n\nWhat would you like to know?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (textToSend === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setShowQuickQuestions(false);

    try {
      const botResponseText = await getBotResponse(textToSend);

      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "user"
          ? styles.userMessageContainer
          : styles.botMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.sender === "user"
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.botBubble, { backgroundColor: colors.card }],
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: item.sender === "user" ? "#FFFFFF" : colors.text,
            },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color:
                item.sender === "user"
                  ? "rgba(255, 255, 255, 0.8)"
                  : colors.onSurfaceVariant,
            },
          ]}
        >
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <View style={styles.headerWrapper}>
        <LinearGradient
          colors={["#2066c1ff", "#1a5ba8"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.greeting}>Health Assistant</Text>
          <Text style={styles.subtitle}>Your wellness companion</Text>
        </LinearGradient>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
      />

      {/* Quick Questions */}
      {showQuickQuestions && messages.length <= 1 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={[styles.quickQuestionsTitle, { color: colors.text }]}>
            Quick Questions
          </Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_QUESTIONS.map((question) => (
              <QuickActionButton
                key={question.id}
                action={question}
                onPress={() => handleQuickQuestion(question.question)}
                style={styles.quickQuestion}
              />
            ))}
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary} />
          <Text
            style={[styles.loadingText, { color: colors.onSurfaceVariant }]}
          >
            Assistant is typing...
          </Text>
        </View>
      )}

      {/* Input Container - Fixed at bottom */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.card,
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about your health..."
            placeholderTextColor={colors.onSurfaceVariant}
            editable={!isLoading}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={isLoading || !input.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (isLoading || !input.trim()) && { opacity: 0.5 },
            ]}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: {
    paddingHorizontal: 0,
    paddingTop: 30,
    paddingBottom: 2,
  },
  header: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#2066c1ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "white",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  messageList: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexGrow: 1,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 8,
  },
  botBubble: {
    borderBottomLeftRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: "right",
  },
  quickQuestionsContainer: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  quickQuestionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 12,
  },
  quickQuestion: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    fontStyle: "italic",
  },
  inputContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    paddingBottom: 50, // Padding to stay above tab bar when keyboard is not active
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
});
