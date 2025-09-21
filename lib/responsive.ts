import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375; // iPhone 12 width
const guidelineBaseHeight = 812; // iPhone 12 height

export function scale(size: number) {
	return (width / guidelineBaseWidth) * size;
}

export function verticalScale(size: number) {
	return (height / guidelineBaseHeight) * size;
}

export function moderateScale(size: number, factor = 0.5) {
	return size + (scale(size) - size) * factor;
}

export function font(size: number) {
	return PixelRatio.roundToNearestPixel(moderateScale(size));
} 