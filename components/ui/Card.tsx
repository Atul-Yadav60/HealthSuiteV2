import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

type Props = {
	children: ReactNode;
	style?: ViewStyle | ViewStyle[];
	variant?: 'surface' | 'primary';
};

export default function Card({ children, style, variant = 'surface' }: Props) {
	return <View style={[styles.base, variant === 'primary' ? styles.primary : styles.surface, style]}>{children}</View>;
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 16,
		padding: 16,
	},
	surface: {
		backgroundColor: '#0B1725',
		borderWidth: 1,
		borderColor: '#1E2A44',
	},
	primary: {
		backgroundColor: '#6AA6FF',
	},
}); 