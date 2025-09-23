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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";
import { GlassCard } from "../../components/ui/GlassCard";
import { supabase } from "../../utils/supabase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// IMPORTANT: Replace this with your actual Supabase Function URL
const SUPABASE_FUNCTION_URL =
  "https://popkggkhybnfewugjuix.supabase.co/functions/v1/chat-rag";

export default function AssistantScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "dark"];
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        text: "Hi! I'm your Health Assistant. I can help you with:\n• Check your daily steps\n• Schedule medicines\n• Health tips\n• BMI calculations\n• Search your health reports\n• Answer medical questions\n\nHow can I help you today?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    setInput("");
    setIsLoading(true);

    // --- Enhanced Bot Response Logic ---
    try {
      // Get intelligent response from our ChatService
      const botResponseText = await getBotResponse(query);

      // Simulate a delay for a more natural feel
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
      console.error("Chat error:", error);
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
      <GlassCard
        style={[
          styles.messageBubble,
          item.sender === "user"
            ? { backgroundColor: colors.primary + "30" }
            : { backgroundColor: colors.card },
        ]}
      >
        <Text style={[styles.messageText, { color: colors.text }]}>
          {item.text}
        </Text>
        {isLoading && item.sender === "bot" && !item.text && (
          <ActivityIndicator
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        )}
        <Text
          style={[
            styles.timestamp,
            {
              color:
                item.sender === "user"
                  ? colors.onPrimary
                  : colors.onSurfaceVariant,
            },
          ]}
        >
          {typeof item.timestamp === "string"
            ? item.timestamp
            : (item.timestamp || new Date()).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
        </Text>
      </GlassCard>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Enhanced Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={[styles.title, { color: colors.onPrimary }]}>
            Health Assistant
          </Text>
          <Text style={[styles.subtitle, { color: colors.onPrimary + "CC" }]}>
            Your personal health companion
          </Text>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
        />

        {/* Input Container */}
        <View
          style={[styles.inputContainer, { borderTopColor: colors.outline }]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: colors.text,
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.outline,
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
            onPress={handleSend}
            disabled={isLoading || !input.trim()}
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              (isLoading || !input.trim()) && { opacity: 0.6 },
            ]}
          >
            <Ionicons name="send" size={20} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
    fontWeight: "500",
  },
  messageList: {
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: "80%",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  botMessageContainer: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 15,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 8,
    textAlign: "right",
  },
  loadingIndicator: {
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 15,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
});
