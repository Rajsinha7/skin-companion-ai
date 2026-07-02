import React, { useEffect } from "react";
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { height, width } = Dimensions.get("window");

export default function LandingScreen() {
  const router = useRouter();

  // Shared values for high-fidelity slow ambient background motion
  const scale = useSharedValue(1.05);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.85);

  // Shared values for badge row animation
  const badgeOpacity = useSharedValue(0);
  const badgeTranslateY = useSharedValue(20);

  useEffect(() => {
    // Elegant, slow 16-second subtle breathing zoom
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 16000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.05, { duration: 16000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Subtle floating displacement
    translateX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 12000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-15, { duration: 12000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    translateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 14000, easing: Easing.inOut(Easing.quad) }),
        withTiming(10, { duration: 14000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Subtle luxury light shift / opacity breathing
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.75, { duration: 8000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Badge Row elegant entry (fade in + slide up) with a subtle delay
    badgeOpacity.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
    badgeTranslateY.value = withTiming(0, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      opacity: badgeOpacity.value,
      transform: [{ translateY: badgeTranslateY.value }],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Absolute background wrapper with hidden overflow */}
      <View style={styles.backgroundWrapper}>
        <Animated.Image
          source={{ uri: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1200&auto=format&fit=crop" }}
          style={[StyleSheet.absoluteFill, animatedImageStyle]}
          resizeMode="cover"
        />
        
        {/* Soft elegant blur layer */}
        <BlurView intensity={6} style={StyleSheet.absoluteFill} tint="dark" />
        
        {/* Luxury dark color-wash linear gradient to ensure extreme readability */}
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.25)", "rgba(35, 49, 55, 0.55)", "#233137"]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Foreground Content */}
      <View style={styles.imageOverlayContainer}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandSubtitle}>QOVES INSPIRED CLINICAL ENGINE</Text>
          <Text style={styles.brandTitle}>SKIN COMPANION AI</Text>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.heroText}>
            Understand{"\n"}
            your skin{"\n"}
            scientifically.
          </Text>

          {/* Premium Floating Feature Badge Row */}
          <Animated.View style={[styles.badgeRow, animatedBadgeStyle]}>
            <View style={styles.badgePill}>
              <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.badgeInner}>
                <View style={styles.badgeIndicator} />
                <Text style={styles.badgeText}>AI Powered</Text>
              </View>
            </View>
            
            <View style={styles.badgePill}>
              <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.badgeInner}>
                <Text style={styles.badgeText}>Private</Text>
              </View>
            </View>

            <View style={styles.badgePill}>
              <BlurView intensity={12} tint="light" style={StyleSheet.absoluteFill} />
              <View style={styles.badgeInner}>
                <Text style={styles.badgeText}>Fast Scan</Text>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.descText}>
            Advanced facial biome analysis powered by artificial intelligence. Real-time logging, custom recommendations, and progress tracking.
          </Text>
        </View>

        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/auth")}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>Start Analysis</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerNote}>
            Designed for high-fidelity cellular biometrics
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#233137", // Dark luxury base
  },
  backgroundWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  imageOverlayContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 72,
    paddingBottom: 48,
    zIndex: 10,
  },
  brandContainer: {
    alignItems: "center",
  },
  brandSubtitle: {
    fontSize: 10,
    letterSpacing: 2,
    color: "#F2F5F5",
    opacity: 0.6,
    fontFamily: "System",
    fontWeight: "600",
    marginBottom: 6,
  },
  brandTitle: {
    fontSize: 16,
    letterSpacing: 3,
    color: "#F2F5F5",
    fontFamily: "System",
    fontWeight: "300",
  },
  textContainer: {
    marginTop: height * 0.1,
  },
  heroText: {
    fontSize: 40,
    lineHeight: 48,
    color: "#F2F5F5",
    fontFamily: "System",
    fontWeight: "300",
    letterSpacing: -1,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 24,
    marginBottom: 20,
  },
  badgePill: {
    height: 24,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  badgeInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  badgeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F2F5F5",
    marginRight: 6,
    opacity: 0.8,
  },
  badgeText: {
    fontSize: 10,
    color: "#F2F5F5",
    letterSpacing: 1,
    fontFamily: "System",
    fontWeight: "500",
    textTransform: "uppercase",
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#F2F5F5",
    opacity: 0.75,
    fontFamily: "System",
    fontWeight: "400",
    maxWidth: width * 0.8,
  },
  ctaContainer: {
    alignItems: "stretch",
    gap: 16,
  },
  ctaButton: {
    backgroundColor: "#F2F5F5",
    height: 48,
    borderRadius: 24, // Pill shape
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  ctaButtonText: {
    color: "#233137",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  footerNote: {
    fontSize: 10,
    color: "#F2F5F5",
    opacity: 0.4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
