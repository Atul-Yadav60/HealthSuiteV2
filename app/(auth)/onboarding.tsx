import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
    BackHandler,
    Dimensions,
    FlatList,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    key: "care",
    title: "Your AI Care Companion",
    subtitle: "Smart insights and proactive health guidance.",
    image: require("@/assets/images/splash-icon.png"),
  },
  {
    key: "monitor",
    title: "Track What Matters",
    subtitle: "Vitals, medications, and activity in one place.",
    image: require("@/assets/images/adaptive-icon.png"),
  },
  {
    key: "secure",
    title: "Private & Secure",
    subtitle: "Your data stays encrypted and in your control.",
    image: require("@/assets/images/icon.png"),
  },
];

function Slide({ item, position, progress }: any) {
  // Floating animation for image
  const float = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000 }),
        withTiming(10, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [position - 1, position, position + 1],
      [0.4, 1, 0.4]
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [position - 1, position, position + 1],
          [40, 0, -40]
        ),
      },
    ],
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: float.value }],
  }));

  return (
    <View style={{ width }}>
      <Animated.View style={[styles.slide, animatedStyle]}>
        {/* Transparent Hero Image with floating effect */}
        <Animated.Image
          source={item.image}
          style={[styles.heroImage, floatStyle]}
          resizeMode="contain"
        />

        {/* Text Block */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (index > 0) {
        listRef.current?.scrollToIndex({ index: index - 1, animated: true });
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [index]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length) {
      const i = viewableItems[0]?.index ?? 0;
      setIndex(i);
      progress.value = withTiming(i, { duration: 250 });
    }
  }).current;

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

  return (
    <LinearGradient
      colors={["#0F1B33", "#1C2A59"]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.key}
        renderItem={({ item, index: i }) => (
          <Slide item={item} position={i} progress={progress} />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Footer */}
      <View style={styles.footer}>
        {/* Animated Dots */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Button */}
        {index < slides.length - 1 ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              listRef.current?.scrollToIndex({ index: index + 1, animated: true })
            }
          >
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: height * 0.12,
  },
  heroImage: {
    width: width * 0.75,
    height: height * 0.4,
    opacity: 0.95,
    marginBottom: 40,
  },
  textBlock: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#E6F1FF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 1,
  },
  subtitle: {
    color: "#9DB5D6",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 40,
    paddingHorizontal: 24,
    gap: 20,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#1E2A44",
  },
  dotActive: {
    backgroundColor: "#6AA6FF",
    width: 22,
  },
  primaryBtn: {
    backgroundColor: "rgba(106,166,255,0.9)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    ...Platform.select({
      web: {
        boxShadow: '0px 0px 12px rgba(106, 166, 255, 0.5)',
      },
      default: {
        shadowColor: "#6AA6FF",
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  primaryBtnText: {
    color: "#07111D",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
