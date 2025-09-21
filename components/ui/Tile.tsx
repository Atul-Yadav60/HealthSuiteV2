import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';

interface TileProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress?: () => void;  // <-- Add this prop to fix onPress errors
}

export default function Tile({ icon, title, subtitle, onPress }: TileProps) {
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.7}>
      <View>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: '#101c2f',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    width: 140,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 10px rgba(10, 18, 32, 0.1)',
      },
      default: {
        shadowColor: '#0A1220',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 3,
      },
    }),
  },
  title: {
    color: '#E6F1FF',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9DB5D6',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
