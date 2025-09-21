import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
	return (
		<View style={styles.row}>
			<Text style={styles.title}>{title}</Text>
			{action}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginTop: 16,
		marginBottom: 8,
	},
	title: {
		color: '#E6F1FF',
		fontSize: 16,
		fontWeight: '800',
	},
}); 