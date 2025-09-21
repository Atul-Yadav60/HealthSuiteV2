import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
    Platform,
} from 'react-native';
import { QUICK_ACTIONS } from '../../constants/AppConfig';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface QuickActionButtonProps {
  actionId: string;
  onPress: () => void;
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
}

export function QuickActionButton({
  actionId,
  onPress,
  style,
  size = 'medium',
}: QuickActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const action = QUICK_ACTIONS.find(a => a.id === actionId);

  if (!action) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 12,
          minWidth: 80,
        };
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          borderRadius: 20,
          minWidth: 120,
        };
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 16,
          minWidth: 100,
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[action.color, `${action.color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, getSizeStyles()]}
      >
        <View style={styles.content}>
          <Ionicons
            name={action.icon as any}
            size={getIconSize()}
            color={colors.text}
            style={styles.icon}
          />
          <Text
            style={[
              styles.text,
              {
                fontSize: getTextSize(),
                color: colors.text,
                fontWeight: '600',
              },
            ]}
            numberOfLines={1}
          >
            {action.title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
