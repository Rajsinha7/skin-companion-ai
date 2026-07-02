import React, { useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Switch } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { db, auth } from "../components/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // State variables for form
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [skinType, setSkinType] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(true);

  const concernsList = [
    { id: "acne", label: "Acne & Breakouts" },
    { id: "redness", label: "Redness & Erythema" },
    { id: "darkCircles", label: "Dark Under-Eye Circles" },
    { id: "pigmentation", label: "Hyperpigmentation" },
    { id: "dryness", label: "Dryness & Flakiness" },
    { id: "oiliness", label: "Excess Sebum & Oil" },
    { id: "unevenTexture", label: "Rough / Uneven Texture" },
  ];

  const goalsList = [
    { id: "clear", label: "Minimize Breakouts" },
    { id: "smooth", label: "Smooth Texture & Exfoliate" },
    { id: "brighten", label: "Brighten Pigment & Spots" },
    { id: "soothe", label: "Calm Redness & Sensitivity" },
    { id: "hydrate", label: "Restore Hydration & Barrier" },
    { id: "antiage", label: "Prevent Aging Contour Lines" },
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      saveAndComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleConcern = (id: string) => {
    if (selectedConcerns.includes(id)) {
      setSelectedConcerns(selectedConcerns.filter((c) => c !== id));
    } else {
      setSelectedConcerns([...selectedConcerns, id]);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const saveAndComplete = async () => {
    try {
      const user = auth.currentUser;
      const uid = user ? user.uid : "offline_user";
      
      const payload = {
        name: name || "Skin Companion Explorer",
        age: parseInt(age) || 28,
        gender: gender || "Not Specified",
        skinType: skinType || "Normal",
        skinConcerns: selectedConcerns,
        goals: selectedGoals,
        notifications,
        completedAt: new Date().toISOString(),
      };

      if (user) {
        await setDoc(doc(db, "users", uid), payload);
      }
      
      // Save locally to AsyncStorage or state inside the app router, then redirect
      router.push("/(tabs)/home");
    } catch (err) {
      console.error("Failed to save onboarding settings: ", err);
      // Bypass fallback to let the user experience the app
      router.push("/(tabs)/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(step / 3) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Let's calibrate your analyzer</Text>
            <Text style={styles.description}>Skin scores are calculated relative to age and genomic profile benchmarks.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>WHAT IS YOUR PREFERRED NAME?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Eleanor"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>WHAT IS YOUR AGE?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 28"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
              />
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Skin Type Selection</Text>
            <Text style={styles.description}>Sebum production profiles vary depending on genetic baseline markers.</Text>

            <Text style={styles.label}>BIOLOGICAL GENDER</Text>
            <View style={styles.optionGrid}>
              {["Female", "Male", "Non-Binary", "Prefer Not To Say"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.optionCard, gender === g && styles.activeOptionCard]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.optionText, gender === g && styles.activeOptionText]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>CURRENT SKIN CLASSIFICATION</Text>
            <View style={styles.optionGrid}>
              {["Dry", "Oily", "Normal", "Combination", "Sensitive"].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.optionCard, skinType === t && styles.activeOptionCard]}
                  onPress={() => setSkinType(t)}
                >
                  <Text style={[styles.optionText, skinType === t && styles.activeOptionText]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.title}>Concerns and Skincare Goals</Text>
            <Text style={styles.description}>Select target zones for the deep clinical facial scanning network.</Text>

            <Text style={styles.label}>SKIN CONCERNS (SELECT ALL THAT APPLY)</Text>
            <View style={styles.chipContainer}>
              {concernsList.map((c) => {
                const active = selectedConcerns.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, active && styles.activeChip]}
                    onPress={() => toggleConcern(c.id)}
                  >
                    <Text style={[styles.chipText, active && styles.activeChipText]}>{c.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 24 }]}>PRIMARY SKINCARE GOALS</Text>
            <View style={styles.chipContainer}>
              {goalsList.map((g) => {
                const active = selectedGoals.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.chip, active && styles.activeChip]}
                    onPress={() => toggleGoal(g.id)}
                  >
                    <Text style={[styles.chipText, active && styles.activeChipText]}>{g.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.notificationToggle}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.toggleTitle}>Clinical Scanning Reminders</Text>
                <Text style={styles.toggleDesc}>Notify me to take weekly biometric scans to monitor changes.</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#E5EBEB", true: "#233137" }}
                thumbColor={notifications ? "#F2F5F5" : "#F4F3F4"}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footerButtons}>
        {step > 1 ? (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>{step === 3 ? "FINISH" : "NEXT"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F5",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#E5EBEB",
    width: "100%",
    top: 50,
    position: "absolute",
    zIndex: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#233137",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 110,
  },
  stepContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    color: "#233137",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#515255",
    lineHeight: 20,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: "#F9F9F9",
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#233137",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5EBEB",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    minWidth: "45%",
    flexGrow: 1,
  },
  activeOptionCard: {
    backgroundColor: "#233137",
    borderColor: "#233137",
  },
  optionText: {
    fontSize: 13,
    color: "#233137",
    textAlign: "center",
    fontWeight: "500",
  },
  activeOptionText: {
    color: "#F2F5F5",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#F9F9F9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EBEB",
  },
  activeChip: {
    backgroundColor: "#233137",
    borderColor: "#233137",
  },
  chipText: {
    fontSize: 12,
    color: "#233137",
    fontWeight: "500",
  },
  activeChipText: {
    color: "#F2F5F5",
  },
  notificationToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    marginTop: 36,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#233137",
  },
  toggleDesc: {
    fontSize: 12,
    color: "#515255",
    marginTop: 4,
  },
  footerButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#F2F5F5",
    paddingHorizontal: 28,
    paddingVertical: 24,
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderColor: "#E5EBEB",
  },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#233137",
  },
  backButtonText: {
    color: "#233137",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#233137",
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonText: {
    color: "#F2F5F5",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
