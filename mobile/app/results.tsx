import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, Sparkles, Check, Info, ShieldCheck, X, TrendingUp, Droplets, Flame, Sparkle, Layers, Eye, ShieldAlert, Heart } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

// Definitions for the 8 detailed skin metrics
interface MetricDetail {
  title: string;
  key: string;
  description: string;
  tip: string;
  icon: React.ReactNode;
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse incoming scan results payload
  const analysisData = params.analysisData ? JSON.parse(params.analysisData as string) : null;
  const localImageUri = params.localImageUri as string || null;
  
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    analysisData?.issues?.[0]?.id || null
  );

  // Score count-up state
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Selected metric details modal state
  const [activeMetricDetail, setActiveMetricDetail] = useState<MetricDetail | null>(null);

  // Heatmap pulse animation shared values
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  // Staggered card animation values
  const cardOpacities = Array.from({ length: 8 }, () => useSharedValue(0));
  const cardTranslates = Array.from({ length: 8 }, () => useSharedValue(30));

  // Chart bar height animation shared values
  const chartHeight1 = useSharedValue(0);
  const chartHeight2 = useSharedValue(0);
  const chartHeight3 = useSharedValue(0);

  useEffect(() => {
    // 1. Heatmap pulse animation
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1.0, { duration: 1500, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(0.6, { duration: 1500, easing: Easing.out(Easing.ease) })
      ),
      -1,
      false
    );

    // 2. Score count-up
    if (analysisData?.skinScore) {
      let start = 0;
      const end = analysisData.skinScore;
      const duration = 1800;
      const startTime = Date.now();
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = progress * (2 - progress); // Ease out quad
        const current = Math.floor(easeProgress * end);
        
        setAnimatedScore(current);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }

    // 3. Staggered metric card entrances
    cardOpacities.forEach((v, i) => {
      v.value = withDelay(i * 90 + 300, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    });
    cardTranslates.forEach((v, i) => {
      v.value = withDelay(i * 90 + 300, withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) }));
    });

    // 4. Chart bar scale-up with slight delay
    const targetHeight3 = analysisData?.skinScore ? analysisData.skinScore : 78;
    chartHeight1.value = withDelay(1200, withTiming(68, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    chartHeight2.value = withDelay(1400, withTiming(72, { duration: 1000, easing: Easing.out(Easing.cubic) }));
    chartHeight3.value = withDelay(1600, withTiming(targetHeight3, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, [analysisData?.skinScore]);

  if (!analysisData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No analysis session found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>RETURN TO SCAN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Define metric items matching requested layout
  const rawMetrics = analysisData.metrics || {};
  const metricsList: MetricDetail[] = [
    {
      title: "Acne",
      key: "acne",
      description: "Evaluation of active inflammatory lesions, non-inflammatory comedones, and micro-clogging. Healthy skin maintains clean follicular openings with balanced microbial flora.",
      tip: "Utilize gentle sebum-regulating salicylic acid (BHA) micro-doses. Focus on lipid barrier protection to prevent inflammatory triggers.",
      icon: <Sparkle size={16} color="#B04B4B" />,
    },
    {
      title: "Pigmentation",
      key: "pigmentation",
      description: "Localized melanin clustering stemming from UV stimulation, hormonal signals, or post-inflammatory pathways. Lower index is ideal for uniform skin tone.",
      tip: "Integrate non-irritating melanin inhibitors like stable Vitamin C, Alpha Arbutin, or Niacinamide, and strictly apply mineral SPF 50 daily.",
      icon: <Layers size={16} color="#E2A44B" />,
    },
    {
      title: "Dark Circles",
      key: "darkCircles",
      description: "Vascular pooling and periorbital hyperpigmentation beneath the thin sub-orbital skin layers. Often accentuated by capillary fragility or fluid accumulation.",
      tip: "Apply vasoconstrictive caffeine and peptide solutions under the eyes. Supplement with gentle micro-lymphatic sweep movements.",
      icon: <Eye size={16} color="#7D6B9F" />,
    },
    {
      title: "Redness",
      key: "redness",
      description: "Localized skin erythema and capillarization. Suggests vascular sensitivity, mild inflammation, or temporary barrier stress.",
      tip: "Integrate soothing phytosterols, Centella Asiatica, and mugwort extracts. Shield the face from extreme temperatures and mechanical rubbing.",
    },
    {
      title: "Hydration",
      key: "hydration",
      description: "Water content bound inside the stratum corneum. High hydration ensures skin cell volume, elasticity, healthy barrier enzymes, and natural radiance.",
      tip: "Apply humectants like multi-molecular Hyaluronic Acid or Glycerin on damp skin. Immediately seal with a lipid-replenishing ceramide fluid.",
    },
    {
      title: "Texture",
      key: "unevenTexture",
      description: "The micro-smoothness of the skin surface. Retarded desquamation of keratinocytes creates rough patches, reducing light reflection.",
      tip: "Use super-gentle Polyhydroxy Acids (PHA) for daily micro-exfoliation without lipid disruption. Avoid harsh physical scrubs completely.",
    },
    {
      title: "Pores",
      key: "pores",
      description: "Visible dilation of follicular openings. Loss of collagen support in pore walls combined with oxidation of trapped sebum enlarges pores.",
      tip: "Maintain pore elasticity using Niacinamide. Utilize high-grade squalane cleansing oil in the evening to dissolve sebum plugs gently.",
    },
    {
      title: "Oil Balance",
      key: "oilBalance",
      description: "The rate of sebum excretion by sebaceous glands. Optimal balance prevents dry, flaky states as well as greasy, congestion-prone surfaces.",
      tip: "Avoid aggressive oil-stripping foaming cleansers, which trigger rebound sebum hyper-secretion. Support with light gel-emulsions.",
    },
  ];

  // Helper function to extract individual values
  const getMetricValue = (key: string) => {
    if (key === "hydration") {
      // High score is better for hydration
      return 100 - (rawMetrics.dryness || 30);
    }
    if (key === "pores") {
      return Math.min(100, Math.floor((rawMetrics.oiliness || 40) * 0.8));
    }
    if (key === "oilBalance") {
      return rawMetrics.oiliness || 35;
    }
    return rawMetrics[key] || 20;
  };

  // Helper function to get status label and color
  const getMetricStatus = (key: string, value: number) => {
    if (key === "hydration") {
      if (value > 75) return { label: "OPTIMAL", color: "#107C5F", bg: "#D6ECE5" };
      if (value > 50) return { label: "STABLE", color: "#E2A44B", bg: "#FDF4E5" };
      return { label: "DEHYDRATED", color: "#B04B4B", bg: "#FCE8E6" };
    }
    // For other metrics, lower is healthier
    if (value < 25) return { label: "OPTIMAL", color: "#107C5F", bg: "#D6ECE5" };
    if (value < 55) return { label: "STABLE", color: "#E2A44B", bg: "#FDF4E5" };
    return { label: "CONGESTED", color: "#B04B4B", bg: "#FCE8E6" };
  };

  // Pulse animation style for heatmap dots
  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }],
      opacity: pulseOpacity.value,
    };
  });

  const selectedIssue = analysisData.issues.find((i: any) => i.id === selectedIssueId);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Absolute Custom NavBar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={styles.backNavButton}>
          <ArrowLeft size={18} color="#233137" />
          <Text style={styles.navTitle}>BACK TO HOME</Text>
        </TouchableOpacity>
        <View style={styles.modeBadge}>
          <Sparkles size={10} color="#F2F5F5" style={{ marginRight: 4 }} />
          <Text style={styles.modeBadgeText}>
            {analysisData.mode === "live" 
              ? "AI LIVE INTEGRITY" 
              : analysisData.mode === "simulation_fallback"
              ? "LOCAL BIOMETRIC FALLBACK"
              : "BIOMETRIC SIMULATION"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {analysisData.fallbackNotice && (
          <View style={{
            backgroundColor: "#FDF4E5",
            borderWidth: 1,
            borderColor: "#E2A44B",
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            flexDirection: "row",
            alignItems: "flex-start",
          }}>
            <Sparkles size={18} color="#E2A44B" style={{ marginRight: 12, marginTop: 2, flexShrink: 0 }} />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontFamily: "Space Grotesk",
                fontSize: 12,
                fontWeight: "700",
                color: "#233137",
                letterSpacing: 1,
                marginBottom: 4,
              }}>
                HIGH CONGESTION REASSURANCE
              </Text>
              <Text style={{
                fontFamily: "Inter",
                fontSize: 12,
                color: "#4A5D65",
                lineHeight: 17,
              }}>
                {analysisData.fallbackNotice}
              </Text>
            </View>
          </View>
        )}
        
        {/* TOP: Large Face Analysis Card with Heatmap Overlay */}
        <View style={styles.faceCardContainer}>
          <Text style={styles.cardHeaderTag}>DERMAL MAPPER</Text>
          <Text style={styles.cardHeaderTitle}>FACIAL SCAN HIGH-ZONE HEATMAP</Text>
          
          <View style={styles.imageRelativeWrapper}>
            {localImageUri ? (
              <Image source={{ uri: localImageUri }} style={styles.scannedImage} />
            ) : (
              <View style={styles.scannedImagePlaceholder}>
                <Layers size={40} color="#A2A7A7" style={{ marginBottom: 10 }} />
                <Text style={styles.placeholderLabel}>SIMULATED BIOMETRIC VIEW</Text>
              </View>
            )}

            {/* Glowing heatmaps and pins */}
            {analysisData.issues.map((issue: any) => {
              const isSelected = issue.id === selectedIssueId;
              const severityColor = issue.severity === "high" ? "#B04B4B" : issue.severity === "medium" ? "#E2A44B" : "#107C5F";
              const pulseBg = issue.severity === "high" ? "rgba(176, 75, 75, 0.25)" : issue.severity === "medium" ? "rgba(226, 164, 75, 0.25)" : "rgba(16, 124, 95, 0.25)";
              
              return (
                <View
                  key={issue.id}
                  style={[styles.pinWrapper, { left: `${issue.x}%`, top: `${issue.y}%` }]}
                >
                  {/* Heatmap Ring */}
                  <Animated.View style={[styles.heatmapGlowRing, animatedPulseStyle, { backgroundColor: pulseBg }]} />
                  
                  {/* Pin Dot */}
                  <TouchableOpacity
                    style={[
                      styles.pinDot,
                      { backgroundColor: severityColor, borderColor: "#FFFFFF" },
                      isSelected && styles.pinDotActive
                    ]}
                    onPress={() => setSelectedIssueId(issue.id)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.pinDotCenter} />
                  </TouchableOpacity>

                  {/* Floating Micro Tag */}
                  <TouchableOpacity
                    style={[styles.floatingTag, isSelected && styles.floatingTagActive]}
                    onPress={() => setSelectedIssueId(issue.id)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.floatingTagText}>{issue.zone}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Interactive selected zone breakdown */}
          {selectedIssue ? (
            <View style={styles.selectedIssuePanel}>
              <View style={styles.issueHeaderRow}>
                <View style={styles.issueHeadingGroup}>
                  <Text style={styles.issueZone}>{selectedIssue.zone.toUpperCase()} DETECTED ANOMALY</Text>
                  <Text style={styles.issueName}>{selectedIssue.name}</Text>
                </View>
                <View style={[styles.severityBadge, styles[`badge_${selectedIssue.severity}` as keyof typeof styles] || styles.badge_medium]}>
                  <Text style={styles.severityText}>{selectedIssue.severity.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.issueDesc}>{selectedIssue.description}</Text>
              <Text style={styles.helperTip}>Tap other glowing heatmap pins above to investigate other face segments.</Text>
            </View>
          ) : (
            <View style={styles.noIssueSelectedPanel}>
              <Info size={16} color="#A2A7A7" style={{ marginRight: 8 }} />
              <Text style={styles.noIssueSelectedText}>Tap any glowing heatmap zone on the image to audit regional biometrics.</Text>
            </View>
          )}
        </View>

        {/* CENTER: Overall Skin Score Ring */}
        <View style={styles.scoreContainer}>
          <LinearGradient
            colors={["#FFFFFF", "#F9F9F9"]}
            style={styles.scoreGlassBackground}
          />
          <View style={styles.scoreRingOuter}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scoreValueText}>{animatedScore}</Text>
              <Text style={styles.scoreLabelText}>COMPOSITE INDEX</Text>
            </View>
          </View>
          
          <View style={styles.scoreOverviewGroup}>
            <Text style={styles.scoreHealthText}>
              OVERALL SKIN INTEGRITY IS{" "}
              <Text style={{ fontWeight: "700", color: analysisData.skinScore > 75 ? "#107C5F" : "#B04B4B" }}>
                {analysisData.skinScore > 85 ? "OPTIMAL" : analysisData.skinScore > 70 ? "STABLE" : "COMPROMISED"}
              </Text>
            </Text>
            <Text style={styles.scoreDetailText}>
              Calculated via multi-spectral analysis of cellular lipid density, moisture retention, and epidermal inflammation levels.
            </Text>
          </View>
        </View>

        {/* LEFT/RIGHT METRIC CARDS GRID */}
        <View style={styles.metricsHeaderBlock}>
          <Text style={styles.sectionHeaderTag}>CELLULAR PROFILE</Text>
          <Text style={styles.sectionHeaderTitle}>8-DIMENSIONAL BIOMETRICS</Text>
          <Text style={styles.sectionHeaderSubtitle}>Tap any card below for deep chemical descriptions and daily treatment routines.</Text>
        </View>

        <View style={styles.metricsGrid}>
          {metricsList.map((item, index) => {
            const val = getMetricValue(item.key);
            const status = getMetricStatus(item.key, val);
            
            // Reanimated Styles for staggered entries
            const animatedCardStyle = useAnimatedStyle(() => {
              return {
                opacity: cardOpacities[index].value,
                transform: [{ translateY: cardTranslates[index].value }],
              };
            });

            return (
              <Animated.View key={item.key} style={[styles.gridCardWrapper, animatedCardStyle]}>
                <TouchableOpacity
                  style={styles.gridCard}
                  onPress={() => setActiveMetricDetail(item)}
                  activeOpacity={0.85}
                >
                  <View style={styles.gridCardHeader}>
                    <Text style={styles.gridCardTitle}>{item.title}</Text>
                    <View style={[styles.cardStatusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.cardStatusText, { color: status.color }]}>{status.label}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.scoreRow}>
                    <Text style={styles.gridCardScore}>{val}</Text>
                    <Text style={styles.gridCardScoreMax}>/100</Text>
                  </View>

                  {/* Horizontal progress bar */}
                  <View style={styles.progressBarOuter}>
                    <View
                      style={[
                        styles.progressBarInner,
                        { width: `${val}%` },
                        { backgroundColor: status.color }
                      ]}
                    />
                  </View>
                  
                  <View style={styles.gridCardFooter}>
                    <Text style={styles.learnMoreText}>TAP TO EXPLAIN</Text>
                    <Info size={10} color="#233137" style={{ opacity: 0.5 }} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* BOTTOM: Progress Chart showing current scan vs previous scans */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartHeaderTag}>HISTORICAL TRANSITION</Text>
              <Text style={styles.chartHeaderTitle}>INTEGRITY PROGRESSION</Text>
            </View>
            <View style={styles.trendBadge}>
              <TrendingUp size={12} color="#107C5F" style={{ marginRight: 4 }} />
              <Text style={styles.trendBadgeText}>+10% IMPROVEMENT</Text>
            </View>
          </View>

          {/* Elegant Custom Vertical Bar Chart */}
          <View style={styles.barChartContainer}>
            
            {/* Bar 1 */}
            <View style={styles.barCol}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, useAnimatedStyle(() => ({ height: `${chartHeight1.value}%` }))]} />
                <View style={styles.barBubble}>
                  <Text style={styles.barBubbleText}>68</Text>
                </View>
              </View>
              <Text style={styles.barLabel}>4 WKS AGO</Text>
            </View>

            {/* Bar 2 */}
            <View style={styles.barCol}>
              <View style={styles.barTrack}>
                <Animated.View style={[styles.barFill, useAnimatedStyle(() => ({ height: `${chartHeight2.value}%` }))]} />
                <View style={styles.barBubble}>
                  <Text style={styles.barBubbleText}>72</Text>
                </View>
              </View>
              <Text style={styles.barLabel}>2 WKS AGO</Text>
            </View>

            {/* Bar 3 (Current) */}
            <View style={styles.barCol}>
              <View style={[styles.barTrack, styles.barTrackActive]}>
                <Animated.View style={[styles.barFill, styles.barFillActive, useAnimatedStyle(() => ({ height: `${chartHeight3.value}%` }))]} />
                
                {/* Pulsing ring at peak */}
                <View style={styles.activeBarGlow} />
                
                <View style={[styles.barBubble, styles.barBubbleActive]}>
                  <Text style={styles.barBubbleActiveText}>{analysisData.skinScore}</Text>
                </View>
              </View>
              <Text style={[styles.barLabel, styles.barLabelActive]}>TODAY</Text>
            </View>
          </View>

          <View style={styles.chartAnalysisInfo}>
            <Heart size={14} color="#107C5F" style={{ marginTop: 2, marginRight: 8 }} />
            <Text style={styles.chartAnalysisText}>
              Your barrier integrity is showing stable upward momentum. Epidermal moisture layers are progressively healing with your current ceramide prescription regimen.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.push("/(tabs)/home")}
          activeOpacity={0.85}
        >
          <ShieldCheck size={18} color="#F2F5F5" style={{ marginRight: 8 }} />
          <Text style={styles.exitButtonText}>SAVE & REPORT TO LAB PROFILE</Text>
        </TouchableOpacity>

        {/* CLINICAL DISCLAIMER */}
        <View style={styles.disclaimerContainer}>
          <ShieldAlert size={16} color="#B04B4B" style={{ marginBottom: 6 }} />
          <Text style={styles.disclaimerText}>
            This analysis is informational only. The skin metrics provided are derived via computer vision scans and are not intended for medical diagnosis, treatment, or clinical intervention.
          </Text>
        </View>

      </ScrollView>

      {/* METRIC DETAIL MODAL SHEET */}
      <Modal
        visible={activeMetricDetail !== null}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setActiveMetricDetail(null)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setActiveMetricDetail(null)} 
          />

          {activeMetricDetail && (
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <Text style={styles.modalSubtitle}>BIOMETRIC METRIC INSIGHT</Text>
                  <Text style={styles.modalTitle}>{activeMetricDetail.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setActiveMetricDetail(null)}
                >
                  <X size={16} color="#233137" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                
                {/* Clinical description block */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>CLINICAL OBSERVATION</Text>
                  <View style={styles.explanationBubble}>
                    <Text style={styles.explanationText}>
                      {activeMetricDetail.description}
                    </Text>
                  </View>
                </View>

                {/* Score analysis scale */}
                <View style={styles.modalSection}>
                  <Text style={styles.sectionHeading}>METRIC ANALYSIS VALUE</Text>
                  <View style={styles.modalScoreIndicatorRow}>
                    <View style={styles.indicatorCol}>
                      <Text style={styles.indicatorNum}>{getMetricValue(activeMetricDetail.key)}</Text>
                      <Text style={styles.indicatorUnit}>CURRENT VALUE</Text>
                    </View>
                    <View style={styles.indicatorDivider} />
                    <View style={styles.indicatorCol}>
                      <Text style={[
                        styles.indicatorStatus,
                        { color: getMetricStatus(activeMetricDetail.key, getMetricValue(activeMetricDetail.key)).color }
                      ]}>
                        {getMetricStatus(activeMetricDetail.key, getMetricValue(activeMetricDetail.key)).label}
                      </Text>
                      <Text style={styles.indicatorUnit}>INTEGRITY PROFILE</Text>
                    </View>
                  </View>
                </View>

                {/* AI generated treatment tip */}
                <View style={styles.modalSection}>
                  <View style={styles.prescriptionHeader}>
                    <Sparkles size={14} color="#107C5F" style={{ marginRight: 6 }} />
                    <Text style={styles.prescriptionHeading}>PRESCRIBED DAILY ROUTINE ADJUSTMENT</Text>
                  </View>
                  <View style={styles.tipBubble}>
                    <Text style={styles.tipText}>
                      {activeMetricDetail.tip}
                    </Text>
                  </View>
                </View>

                {/* Back link */}
                <TouchableOpacity
                  style={styles.closeModalActionBtn}
                  onPress={() => setActiveMetricDetail(null)}
                >
                  <Check size={16} color="#F2F5F5" style={{ marginRight: 8 }} />
                  <Text style={styles.closeModalActionText}>GOT IT, KEEP IN SYNC</Text>
                </TouchableOpacity>

              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F5",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F5F5",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: "#515255",
    marginBottom: 20,
    fontFamily: "System",
  },
  backButton: {
    backgroundColor: "#233137",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  backText: {
    color: "#F2F5F5",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  navBar: {
    height: 60,
    backgroundColor: "#F2F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EBEB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    top: 44,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
  },
  backNavButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navTitle: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: "700",
    color: "#233137",
  },
  modeBadge: {
    backgroundColor: "#233137",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  modeBadgeText: {
    fontSize: 8,
    color: "#F2F5F5",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  faceCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(35, 49, 55, 0.08)",
    marginBottom: 20,
    shadowColor: "#233137",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeaderTag: {
    fontSize: 8,
    color: "#A2A7A7",
    letterSpacing: 1.5,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardHeaderTitle: {
    fontSize: 13,
    color: "#233137",
    letterSpacing: 1,
    fontWeight: "bold",
    marginBottom: 16,
  },
  imageRelativeWrapper: {
    position: "relative",
    aspectRatio: 3 / 4,
    width: "100%",
    backgroundColor: "#E5EBEB",
    borderRadius: 16,
    overflow: "hidden",
  },
  scannedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scannedImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E5EBEB",
  },
  placeholderLabel: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 1,
    fontWeight: "600",
  },
  pinWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  heatmapGlowRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  pinDotActive: {
    width: 28,
    height: 28,
    borderRadius: 14,
    transform: [{ scale: 1.1 }],
  },
  pinDotCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  floatingTag: {
    position: "absolute",
    bottom: -22,
    backgroundColor: "#233137",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  floatingTagActive: {
    backgroundColor: "#107C5F",
  },
  floatingTagText: {
    color: "#F2F5F5",
    fontSize: 8,
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  selectedIssuePanel: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(35, 49, 55, 0.06)",
  },
  issueHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  issueHeadingGroup: {
    flex: 1,
    paddingRight: 8,
  },
  issueZone: {
    fontSize: 8,
    color: "#107C5F",
    letterSpacing: 1,
    fontWeight: "700",
  },
  issueName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#233137",
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badge_low: {
    backgroundColor: "rgba(16, 124, 95, 0.1)",
  },
  badge_medium: {
    backgroundColor: "rgba(226, 164, 75, 0.1)",
  },
  badge_high: {
    backgroundColor: "rgba(176, 75, 75, 0.1)",
  },
  severityText: {
    fontSize: 8,
    color: "#233137",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  issueDesc: {
    fontSize: 12,
    color: "#515255",
    lineHeight: 18,
    marginBottom: 8,
  },
  helperTip: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#A2A7A7",
  },
  noIssueSelectedPanel: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 12,
    borderRadius: 12,
  },
  noIssueSelectedText: {
    fontSize: 11,
    color: "#515255",
    flex: 1,
    lineHeight: 16,
  },
  scoreContainer: {
    position: "relative",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(35, 49, 55, 0.08)",
    marginBottom: 24,
    shadowColor: "#233137",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
    overflow: "hidden",
  },
  scoreGlassBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  scoreRingOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#233137",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#233137",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  scoreRingInner: {
    width: 126,
    height: 126,
    borderRadius: 63,
    backgroundColor: "#F2F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(242, 245, 245, 0.25)",
  },
  scoreValueText: {
    fontSize: 48,
    fontWeight: "200",
    color: "#233137",
    letterSpacing: -1,
  },
  scoreLabelText: {
    fontSize: 8,
    letterSpacing: 2,
    color: "#A2A7A7",
    fontWeight: "700",
    marginTop: -2,
  },
  scoreOverviewGroup: {
    alignItems: "center",
  },
  scoreHealthText: {
    fontSize: 12,
    color: "#233137",
    letterSpacing: 1.5,
    fontWeight: "500",
    marginBottom: 8,
  },
  scoreDetailText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#515255",
    textAlign: "center",
    maxWidth: width * 0.75,
  },
  metricsHeaderBlock: {
    marginBottom: 16,
  },
  sectionHeaderTag: {
    fontSize: 8,
    color: "#107C5F",
    letterSpacing: 2,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    color: "#233137",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: "#515255",
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  gridCardWrapper: {
    width: "48.5%",
    marginBottom: 12,
  },
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(35, 49, 55, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  gridCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  gridCardTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#233137",
  },
  cardStatusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  cardStatusText: {
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  gridCardScore: {
    fontSize: 22,
    fontWeight: "300",
    color: "#233137",
  },
  gridCardScoreMax: {
    fontSize: 10,
    color: "#A2A7A7",
    marginLeft: 1,
  },
  progressBarOuter: {
    height: 4,
    backgroundColor: "#E5EBEB",
    borderRadius: 2,
    marginBottom: 12,
    overflow: "hidden",
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 2,
  },
  gridCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(35, 49, 55, 0.06)",
    paddingTop: 8,
  },
  learnMoreText: {
    fontSize: 8,
    color: "#233137",
    opacity: 0.6,
    letterSpacing: 0.5,
    fontWeight: "700",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(35, 49, 55, 0.08)",
    marginBottom: 24,
    shadowColor: "#233137",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
  },
  chartHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  chartHeaderTag: {
    fontSize: 8,
    color: "#A2A7A7",
    letterSpacing: 1.5,
    fontWeight: "600",
    marginBottom: 2,
  },
  chartHeaderTitle: {
    fontSize: 13,
    color: "#233137",
    letterSpacing: 1,
    fontWeight: "bold",
  },
  trendBadge: {
    backgroundColor: "rgba(16, 124, 95, 0.08)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  trendBadgeText: {
    fontSize: 8,
    color: "#107C5F",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 150,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  barCol: {
    alignItems: "center",
    width: 60,
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: "#F2F5F5",
    borderRadius: 7,
    justifyContent: "flex-end",
    position: "relative",
    marginBottom: 10,
  },
  barTrackActive: {
    width: 16,
    backgroundColor: "#E5EBEB",
    borderColor: "rgba(35, 49, 55, 0.06)",
    borderWidth: 0.5,
  },
  barFill: {
    width: "100%",
    backgroundColor: "#A2A7A7",
    borderRadius: 7,
  },
  barFillActive: {
    backgroundColor: "#233137",
  },
  activeBarGlow: {
    position: "absolute",
    top: 0,
    left: -2,
    right: -2,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(35, 49, 55, 0.15)",
    borderWidth: 1.5,
    borderColor: "#233137",
    zIndex: 2,
  },
  barBubble: {
    position: "absolute",
    top: -22,
    alignSelf: "center",
    backgroundColor: "#A2A7A7",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 6,
  },
  barBubbleActive: {
    backgroundColor: "#233137",
    top: -24,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  barBubbleText: {
    color: "#F2F5F5",
    fontSize: 8,
    fontWeight: "bold",
  },
  barBubbleActiveText: {
    color: "#F2F5F5",
    fontSize: 9,
    fontWeight: "800",
  },
  barLabel: {
    fontSize: 8,
    color: "#A2A7A7",
    letterSpacing: 0.5,
    fontWeight: "600",
  },
  barLabelActive: {
    color: "#233137",
    fontWeight: "800",
  },
  chartAnalysisInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F2F5F5",
    padding: 12,
    borderRadius: 14,
  },
  chartAnalysisText: {
    fontSize: 11,
    color: "#515255",
    flex: 1,
    lineHeight: 16,
  },
  exitButton: {
    backgroundColor: "#233137",
    height: 50,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  exitButtonText: {
    color: "#F2F5F5",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  disclaimerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 9,
    color: "#515255",
    textAlign: "center",
    lineHeight: 14,
    opacity: 0.8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F2F5F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 10,
    maxHeight: height * 0.82,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5EBEB",
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitleGroup: {
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 8,
    color: "#107C5F",
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#233137",
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E5EBEB",
    alignItems: "center",
    justifyContent: "center",
  },
  modalScroll: {
    marginBottom: 10,
  },
  modalSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 9,
    color: "#A2A7A7",
    letterSpacing: 1,
    fontWeight: "700",
    marginBottom: 8,
  },
  explanationBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "rgba(35, 49, 55, 0.08)",
  },
  explanationText: {
    fontSize: 12,
    color: "#515255",
    lineHeight: 18,
  },
  modalScoreIndicatorRow: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(35, 49, 55, 0.08)",
  },
  indicatorCol: {
    flex: 1,
    alignItems: "center",
  },
  indicatorDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E5EBEB",
  },
  indicatorNum: {
    fontSize: 26,
    fontWeight: "200",
    color: "#233137",
  },
  indicatorUnit: {
    fontSize: 8,
    color: "#A2A7A7",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  indicatorStatus: {
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  prescriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  prescriptionHeading: {
    fontSize: 9,
    color: "#107C5F",
    letterSpacing: 1,
    fontWeight: "700",
  },
  tipBubble: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: "rgba(16, 124, 95, 0.15)",
  },
  tipText: {
    fontSize: 12,
    color: "#515255",
    lineHeight: 18,
  },
  closeModalActionBtn: {
    backgroundColor: "#233137",
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  closeModalActionText: {
    color: "#F2F5F5",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
