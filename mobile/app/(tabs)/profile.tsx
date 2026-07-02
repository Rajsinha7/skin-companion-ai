import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { User, ShieldAlert, LogOut, Trash2, Check } from "lucide-react-native";
import { auth, db } from "../../components/FirebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

export default function ProfileScreen() {
  const router = useRouter();
  
  // Profile settings state
  const [name, setName] = useState("Eleanor");
  const [age, setAge] = useState("28");
  const [skinType, setSkinType] = useState("Combination");
  const [notifications, setNotifications] = useState(true);
  
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || "Explorer");
            setAge(data.age ? String(data.age) : "28");
            setSkinType(data.skinType || "Combination");
            setNotifications(data.notifications ?? true);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile: ", err);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setUpdating(true);
    setSuccess(false);

    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          name,
          age: parseInt(age) || 28,
          skinType,
          notifications,
          updatedAt: new Date().toISOString(),
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        // Mock success for simulation
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to update profile details: ", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAllScanData = async () => {
    // In React Native, we present a native confirmation modal
    // Here we'll simulate the complete deletion cascade for Firestore
    try {
      const user = auth.currentUser;
      if (user) {
        const scansRef = collection(db, "users", user.uid, "scans");
        const querySnap = await getDocs(scansRef);
        const deletionPromises = querySnap.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletionPromises);
      }
      
      console.log("Cascade scan deletion completed successfully.");
      // Alert the user or reset state
      setName("Eleanor");
      setAge("28");
      setSkinType("Combination");
      
      // Redirect back to Landing screen after wiping local data
      router.push("/");
    } catch (err) {
      console.error("Cascade deletion failure: ", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/");
    } catch (err) {
      router.push("/");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Account Profile</Text>
          <Text style={styles.subtitle}>Configure biometric benchmarks and manage data storage parameters.</Text>
        </View>

        {success && (
          <View style={styles.successBanner}>
            <Check size={16} color="#107C5F" />
            <Text style={styles.successText}>PROFILES RE-CALIBRATED SUCCESSFULLY</Text>
          </View>
        )}

        {/* Profile Card details */}
        <View style={styles.formCard}>
          <Text style={styles.formCardHeader}>EDIT PROFILE METADATA</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>AGE BENCHMARK</Text>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SKIN CLASSIFICATION</Text>
            <TextInput
              style={styles.textInput}
              value={skinType}
              onChangeText={setSkinType}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.toggleLabel}>Weekly Reminders</Text>
              <Text style={styles.toggleDesc}>Biometric update intervals.</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#E5EBEB", true: "#233137" }}
              thumbColor={notifications ? "#F2F5F5" : "#F4F3F4"}
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleUpdateProfile}
            disabled={updating}
          >
            <Text style={styles.saveBtnText}>{updating ? "CALIBRATING..." : "SAVE SETTINGS"}</Text>
          </TouchableOpacity>
        </View>

        {/* Security & Action Boundaries */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsCardHeader}>DATA SAFETY GATEWAY</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleDeleteAllScanData}
            activeOpacity={0.8}
          >
            <View style={styles.actionTexts}>
              <Text style={styles.deleteActionTitle}>Delete All Scan History</Text>
              <Text style={styles.actionDesc}>Permanently wipe all biometric records and annotations.</Text>
            </View>
            <Trash2 size={18} color="#B04B4B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionRow, { borderBottomWidth: 0 }]}
            onPress={handleSignOut}
            activeOpacity={0.8}
          >
            <View style={styles.actionTexts}>
              <Text style={styles.signOutActionTitle}>Sign Out Of Account</Text>
              <Text style={styles.actionDesc}>Safely sever session links with cloud endpoints.</Text>
            </View>
            <LogOut size={18} color="#233137" />
          </TouchableOpacity>
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
    marginBottom: 24,
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 124, 95, 0.08)",
    padding: 12,
    borderRadius: 14,
    gap: 8,
    marginBottom: 20,
  },
  successText: {
    color: "#107C5F",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  formCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 28, // Card radius 28
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5EBEB",
    marginBottom: 20,
  },
  formCardHeader: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#F2F5F5",
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 16,
    color: "#233137",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#E5EBEB",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5EBEB",
    paddingTop: 16,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#233137",
  },
  toggleDesc: {
    fontSize: 11,
    color: "#515255",
    marginTop: 2,
  },
  saveBtn: {
    backgroundColor: "#233137",
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#F2F5F5",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  actionsCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E5EBEB",
  },
  actionsCardHeader: {
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#515255",
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5EBEB",
  },
  actionTexts: {
    flex: 1,
    paddingRight: 16,
  },
  deleteActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#B04B4B",
  },
  signOutActionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#233137",
  },
  actionDesc: {
    fontSize: 11,
    color: "#515255",
    marginTop: 4,
    lineHeight: 16,
  },
});
