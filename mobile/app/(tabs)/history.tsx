import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Calendar, ChevronRight, TrendingUp, Sparkles } from "lucide-react-native";
import { db, auth } from "../../components/FirebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface ScanLog {
  id: string;
  timestamp: string;
  skinScore: number;
  metrics: {
    acne: number;
    redness: number;
    darkCircles: number;
    pigmentation: number;
    dryness: number;
    oiliness: number;
    unevenTexture: number;
  };
  summary: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [scans, setScans] = useState<ScanLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScanHistory() {
      try {
        const user = auth.currentUser;
        if (user) {
          const scansRef = collection(db, "users", user.uid, "scans");
          const q = query(scansRef, orderBy("timestamp", "desc"));
          const querySnap = await getDocs(q);
          const list: ScanLog[] = [];
          querySnap.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              timestamp: data.timestamp,
              skinScore: data.skinScore,
              metrics: data.metrics,
              summary: data.summary,
            });
          });
          setScans(list);
        } else {
          // Provide elegant mock logs for offline test preview
          setScans([
            {
              id: "scan-1",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
              skinScore: 78,
              metrics: { acne: 35, redness: 48, darkCircles: 40, pigmentation: 15, dryness: 25, oiliness: 45, unevenTexture: 50 },
              summary: "Midface epidermal structures present moderate inflammation alongside standard sebum output."
            },
            {
              id: "scan-2",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
              skinScore: 74,
              metrics: { acne: 45, redness: 55, darkCircles: 42, pigmentation: 18, dryness: 30, oiliness: 50, unevenTexture: 55 },
              summary: "Vascular dilation noted. Recommended soothing barrier repair creams & mineral sunscreen guards."
            },
            {
              id: "scan-3",
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
              skinScore: 70,
              metrics: { acne: 55, redness: 60, darkCircles: 45, pigmentation: 20, dryness: 35, oiliness: 58, unevenTexture: 60 },
              summary: "Sub-surface cell congestion observed. Recommend implementing salicyclic treatments & humectants."
            }
          ]);
        }
      } catch (err) {
        console.error("Failed to load historical scan logs: ", err);
      } finally {
        setLoading(false);
      }
    }
    fetchScanHistory();
  }, []);

  const handleOpenHistoricalScan = (scan: ScanLog) => {
    // Generate full payload layout to pass to /results
    const dummyRoutine = [
      { step: "Cleanse", product: "Soothing Squalane Face Cleanser", reason: "Target lipids" },
      { step: "Hydrate", product: "Hyaluronic + Zinc Barrier Emulsion", reason: "Fortify moisture cell layers" }
    ];
    router.push({
      pathname: "/results",
      params: {
        analysisData: JSON.stringify({
          mode: "simulation",
          skinScore: scan.skinScore,
          metrics: scan.metrics,
          issues: [
            { id: "issue-1", name: "Epidermal Vascular Congestion", zone: "Cheeks", x: 60, y: 55, severity: "medium", description: scan.summary }
          ],
          skincareRoutine: dummyRoutine,
          summary: scan.summary
        }),
        localImageUri: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400"
      }
    });
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Scans Timeline</Text>
        <Text style={styles.subtitle}>Audit changes in cellular structure and barrier strength across consecutive diagnostics.</Text>
      </View>

      {/* Progress Chart Representation */}
      <View style={styles.chartCard}>
        <View style={styles.chartTitleRow}>
          <TrendingUp size={16} color="#233137" />
          <Text style={styles.chartTitle}>CHRONOLOGICAL SKIN SCORE TREND</Text>
        </View>
        <View style={styles.mockChartVisual}>
          <View style={[styles.chartBar, { height: 70 }]}>
            <Text style={styles.chartBarLabel}>70</Text>
          </View>
          <View style={[styles.chartBar, { height: 80 }]}>
            <Text style={styles.chartBarLabel}>74</Text>
          </View>
          <View style={[styles.chartBar, { height: 90 }]}>
            <Text style={styles.chartBarLabel}>78</Text>
          </View>
        </View>
        <View style={styles.chartXLabels}>
          <Text style={styles.chartXLabel}>14 days ago</Text>
          <Text style={styles.chartXLabel}>7 days ago</Text>
          <Text style={styles.chartXLabel}>Today</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#233137" />
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Calendar size={36} color="#A2A7A7" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>NO SCANS DETECTED</Text>
          <Text style={styles.emptyDesc}>Conduct your first Face Scan to begin registering historical timelines.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.timelineList}>
          {scans.map((scan) => (
            <TouchableOpacity
              key={scan.id}
              style={styles.timelineItem}
              activeOpacity={0.8}
              onPress={() => handleOpenHistoricalScan(scan)}
            >
              <View style={styles.timelineLineWrapper}>
                <View style={styles.timelineNode} />
                <View style={styles.timelineLine} />
              </View>

              <View style={styles.timelineItemContent}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemDate}>{formatDate(scan.timestamp)}</Text>
                  <View style={styles.itemScoreBadge}>
                    <Sparkles size={12} color="#233137" />
                    <Text style={styles.itemScoreText}>Score: {scan.skinScore}</Text>
                  </View>
                </View>
                <Text style={styles.itemSummary} numberOfLines={2}>
                  {scan.summary}
                </Text>
                <View style={styles.itemFooterLink}>
                  <Text style={styles.itemLinkText}>Open detailed diagnostics</Text>
                  <ChevronRight size={14} color="#233137" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F5",
    paddingTop: 68,
    paddingBottom: 90,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "300",
    color: "#233137",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#515255",
    marginTop: 6,
    lineHeight: 18,
  },
  chartCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    marginBottom: 24,
  },
  chartTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
  },
  mockChartVisual: {
    height: 100,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    borderBottomWidth: 1,
    borderBottomColor: "#E5EBEB",
    paddingBottom: 4,
  },
  chartBar: {
    width: 40,
    backgroundColor: "#233137",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
  },
  chartBarLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#F2F5F5",
  },
  chartXLabels: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  chartXLabel: {
    fontSize: 9,
    color: "#888",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#233137",
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 11,
    color: "#515255",
    textAlign: "center",
    lineHeight: 16,
  },
  timelineList: {
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  timelineLineWrapper: {
    width: 24,
    alignItems: "center",
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#233137",
    marginTop: 6,
  },
  timelineLine: {
    flex: 1,
    width: 1,
    backgroundColor: "#E5EBEB",
    marginVertical: 4,
  },
  timelineItemContent: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    marginLeft: 4,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#233137",
  },
  itemScoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5EBEB",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4,
  },
  itemScoreText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#233137",
  },
  itemSummary: {
    fontSize: 11,
    color: "#515255",
    lineHeight: 16,
    marginBottom: 12,
  },
  itemFooterLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5EBEB",
    paddingTop: 8,
  },
  itemLinkText: {
    fontSize: 11,
    color: "#233137",
    fontWeight: "bold",
  },
});
