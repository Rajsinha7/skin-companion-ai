import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, ShieldAlert, Sparkles, Calendar, ChevronRight } from "lucide-react-native";
import { auth, db } from "../../components/FirebaseConfig";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function HomeDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Eleanor");
  const [skinType, setSkinType] = useState("Combination");
  const [lastScore, setLastScore] = useState<number | null>(78);
  const [totalScans, setTotalScans] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || "Explorer");
            setSkinType(data.skinType || "Combination");
          }

          // Query last scan score
          const scansRef = collection(db, "users", user.uid, "scans");
          const q = query(scansRef, orderBy("timestamp", "desc"), limit(1));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const firstScan = querySnap.docs[0].data();
            setLastScore(firstScan.skinScore);
            setTotalScans(querySnap.size);
          }
        }
      } catch (err) {
        console.error("Failed to load user info: ", err);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.dateLabel}>WEDNESDAY, JULY 1</Text>
            <Text style={styles.greeting}>Salutations, {userName}</Text>
          </View>
          <View style={styles.skinTypeBadge}>
            <Text style={styles.skinTypeBadgeText}>{skinType.toUpperCase()} SKIN</Text>
          </View>
        </View>

        {/* Clinical Skin Score Circular Meter */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardHeader}>COMPOSITE DERMAL HEALTH SCORE</Text>
          
          <View style={styles.radialScoreContainer}>
            <View style={styles.radialOuterCircle}>
              <View style={styles.radialInnerCircle}>
                <Text style={styles.scoreValue}>{lastScore ?? "--"}</Text>
                <Text style={styles.scoreScale}>/100</Text>
              </View>
            </View>
            
            <View style={styles.scoreMetricList}>
              <View style={styles.scoreStatusRow}>
                <Sparkles size={16} color="#233137" />
                <Text style={styles.scoreStatusLabel}>Hydration Index: Good</Text>
              </View>
              <View style={styles.scoreStatusRow}>
                <ShieldAlert size={16} color="#A2A7A7" />
                <Text style={styles.scoreStatusLabel}>Inflammation: Low-Mid</Text>
              </View>
              <Text style={styles.scoreSummaryText}>
                Your barrier density is performing at 84% efficacy. Some uneven sebum levels recorded in the T-Zone.
              </Text>
            </View>
          </View>
        </View>

        {/* Start New Scan CTA Block */}
        <TouchableOpacity
          style={styles.scanCtaBlock}
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/scan")}
        >
          <View style={styles.scanCtaContent}>
            <View style={styles.scanIconContainer}>
              <Camera size={24} color="#F2F5F5" />
            </View>
            <View style={styles.scanCtaTexts}>
              <Text style={styles.scanCtaTitle}>Initiate Facial Scan</Text>
              <Text style={styles.scanCtaSubtitle}>Calibrate biometrics and capture skin anomalies</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#515255" />
        </TouchableOpacity>

        {/* Routine Tracker */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TODAY'S REGIMEN SCHEDULE</Text>
          <Text style={styles.sectionSubtitle}>Tailored to your Combination skin concerns</Text>
        </View>

        <View style={styles.routineList}>
          <View style={styles.routineItem}>
            <View style={styles.routineTimeCol}>
              <Text style={styles.routineTime}>AM</Text>
              <Text style={styles.routinePeriod}>08:00</Text>
            </View>
            <View style={styles.routineDetailCol}>
              <Text style={styles.routineProduct}>Squalane Cleansing Emulsion</Text>
              <Text style={styles.routineDesc}>Gently lift lipophilic surface debris.</Text>
            </View>
          </View>

          <View style={styles.routineItem}>
            <View style={styles.routineTimeCol}>
              <Text style={styles.routineTime}>AM</Text>
              <Text style={styles.routinePeriod}>08:15</Text>
            </View>
            <View style={styles.routineDetailCol}>
              <Text style={styles.routineProduct}>Niacinamide 4% + Hyaluronic Serum</Text>
              <Text style={styles.routineDesc}>Strengthen intercellular desmosomes & regulate oil.</Text>
            </View>
          </View>

          <View style={styles.routineItem}>
            <View style={styles.routineTimeCol}>
              <Text style={styles.routineTime}>PM</Text>
              <Text style={styles.routinePeriod}>21:30</Text>
            </View>
            <View style={styles.routineDetailCol}>
              <Text style={styles.routineProduct}>Ceramide NP Barrier Emulsion</Text>
              <Text style={styles.routineDesc}>Replenish skin moisture barrier layers during sleep cycles.</Text>
            </View>
          </View>
        </View>

        <View style={styles.scansCounterCard}>
          <Calendar size={18} color="#233137" />
          <Text style={styles.scansCounterText}>
            You have logged <Text style={{ fontWeight: "bold" }}>{totalScans}</Text> biometric scans this month. Keep it up!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F5",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 110,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  dateLabel: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "300",
    color: "#233137",
    letterSpacing: -0.5,
  },
  skinTypeBadge: {
    backgroundColor: "#E5EBEB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  skinTypeBadgeText: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "600",
    color: "#233137",
  },
  scoreCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 28, // Matches specification: Cards radius 28
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  scoreCardHeader: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 20,
  },
  radialScoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  radialOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#233137", // Simulates deep luxury green-gray circular border
    alignItems: "center",
    justifyContent: "center",
  },
  radialInnerCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#F2F5F5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "300",
    color: "#233137",
    fontFamily: "System",
  },
  scoreScale: {
    fontSize: 12,
    color: "#515255",
    marginTop: 10,
  },
  scoreMetricList: {
    flex: 1,
    gap: 8,
  },
  scoreStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreStatusLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#233137",
  },
  scoreSummaryText: {
    fontSize: 11,
    lineHeight: 16,
    color: "#515255",
    marginTop: 4,
  },
  scanCtaBlock: {
    backgroundColor: "#233137",
    borderRadius: 28, // Matches card border-radius 28
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  scanCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  scanIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(242, 245, 245, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanCtaTexts: {
    flex: 1,
  },
  scanCtaTitle: {
    fontSize: 16,
    fontWeight: "400",
    color: "#F2F5F5",
  },
  scanCtaSubtitle: {
    fontSize: 11,
    color: "#A2A7A7",
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
    color: "#233137",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#515255",
    marginTop: 2,
  },
  routineList: {
    gap: 12,
    marginBottom: 24,
  },
  routineItem: {
    flexDirection: "row",
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    alignItems: "center",
  },
  routineTimeCol: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: "#E5EBEB",
    paddingRight: 12,
    marginRight: 16,
  },
  routineTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#233137",
  },
  routinePeriod: {
    fontSize: 10,
    color: "#888",
    marginTop: 2,
  },
  routineDetailCol: {
    flex: 1,
  },
  routineProduct: {
    fontSize: 13,
    fontWeight: "600",
    color: "#233137",
  },
  routineDesc: {
    fontSize: 11,
    color: "#515255",
    marginTop: 2,
  },
  scansCounterCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    gap: 12,
  },
  scansCounterText: {
    fontSize: 12,
    color: "#515255",
    flex: 1,
  },
});
