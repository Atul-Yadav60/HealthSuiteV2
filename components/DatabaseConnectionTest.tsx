import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { supabase } from "../lib/supabase";

interface DatabaseInfo {
  connectionType: "CLOUD" | "LOCAL" | "UNKNOWN";
  url: string;
  isConnected: boolean;
  error?: string;
  tables: string[];
}

export const DatabaseConnectionTest = () => {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      console.log("🔍 Testing database connection...");

      // Get the actual URL being used
      const url = supabase.supabaseUrl;
      console.log("📡 Connecting to:", url);

      // Determine connection type
      const isLocal =
        url.includes("localhost") ||
        url.includes("127.0.0.1") ||
        url.includes("10.12.240.136");
      const connectionType = isLocal
        ? "LOCAL"
        : url.includes("supabase.co")
        ? "CLOUD"
        : "UNKNOWN";

      console.log("🏷️ Connection type:", connectionType);

      // Test actual connection
      const { data: session, error: authError } =
        await supabase.auth.getSession();

      if (authError) {
        console.error("❌ Auth error:", authError.message);
        setDbInfo({
          connectionType,
          url,
          isConnected: false,
          error: authError.message,
          tables: [],
        });
        return;
      }

      console.log("✅ Connection successful");

      // Try to list some tables by attempting to query them
      const tablesToCheck = [
        "symptom_logs",
        "condition_updates",
        "medication_schedules",
        "user_profiles",
        "health_records",
        "appointments",
      ];

      const existingTables: string[] = [];

      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true });

          if (!error) {
            existingTables.push(tableName);
            console.log(`✅ Found table: ${tableName}`);
          }
        } catch (err) {
          // Table doesn't exist, that's ok
          console.log(`❌ Table not found: ${tableName}`);
        }
      }

      setDbInfo({
        connectionType,
        url,
        isConnected: true,
        tables: existingTables,
      });

      // Show alert with results
      Alert.alert(
        `Database Connection: ${connectionType}`,
        `URL: ${url}\n\nTables found: ${existingTables.length}\n${
          existingTables.join(", ") || "None"
        }`
      );
    } catch (error) {
      console.error("💥 Connection test failed:", error);
      setDbInfo({
        connectionType: "UNKNOWN",
        url: "Error getting URL",
        isConnected: false,
        error: String(error),
        tables: [],
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Database Connection Status</Text>

      {dbInfo ? (
        <>
          <Text style={styles.info}>
            🏷️ Type:{" "}
            <Text style={styles.highlight}>{dbInfo.connectionType}</Text>
          </Text>
          <Text style={styles.info}>
            📡 URL: <Text style={styles.url}>{dbInfo.url}</Text>
          </Text>
          <Text style={styles.info}>
            🔗 Connected:{" "}
            <Text
              style={[
                styles.highlight,
                { color: dbInfo.isConnected ? "green" : "red" },
              ]}
            >
              {dbInfo.isConnected ? "YES" : "NO"}
            </Text>
          </Text>
          <Text style={styles.info}>
            📊 Tables:{" "}
            <Text style={styles.highlight}>{dbInfo.tables.length}</Text>
          </Text>
          {dbInfo.tables.length > 0 && (
            <Text style={styles.tables}>{dbInfo.tables.join(", ")}</Text>
          )}
          {dbInfo.error && (
            <Text style={styles.error}>❌ Error: {dbInfo.error}</Text>
          )}
        </>
      ) : (
        <Text style={styles.loading}>🔍 Testing connection...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
  },
  highlight: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  url: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#666",
  },
  tables: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginLeft: 16,
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 8,
  },
  loading: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
