import { Ionicons } from "@expo/vector-icons";
import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { useColorScheme } from "../../hooks/useColorScheme";
import Colors from "../../constants/Colors";
import { GlassCard } from "../../components/ui/GlassCard";
import { supabase } from "../../utils/supabase";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

// IMPORTANT: Replace this with your actual Supabase Function URL
// You can get this after you deploy the function in the next step.
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
        text: "Hello! I can search your health reports or the internet for general medical questions. How can I help?",
        sender: "bot",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    const query = input;
    setInput("");
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: botMessageId, text: "", sender: "bot" },
    ]);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Authentication session not found.");
      if (SUPABASE_FUNCTION_URL.includes("YOUR_SUPABASE_FUNCTION_URL")) {
        throw new Error(
          "Please replace the placeholder URL in the code before using the chatbot."
        );
      }

      const response = await fetch(SUPABASE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to get a response from the assistant."
        );
      }

      // Updated logic to handle a single JSON response
      const data = await response.json();
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, text: data.response } : msg
        )
      );
    } catch (error: any) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: `Error: ${error.message}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>AI Assistant</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
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
                <ActivityIndicator color={colors.primary} />
              )}
            </GlassCard>
          </View>
        )}
      />
      <View style={[styles.inputContainer, { borderTopColor: colors.outline }]}>
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
          placeholder="Ask a question..."
          placeholderTextColor={colors.onSurfaceVariant}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={isLoading}
          style={styles.sendButton}
        >
          <Ionicons
            name="send"
            size={24}
            color={isLoading ? colors.onSurfaceVariant : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageContainer: {
    marginVertical: 5,
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
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
  },
  sendButton: {
    padding: 5,
  },
});
