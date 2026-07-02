import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Camera, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { db, auth } from "../../components/FirebaseConfig";
import { collection, addDoc } from "firebase/firestore";

const { width, height } = Dimensions.get("window");

export default function ScanScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request media library and camera permissions on mount
  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  // Pick image from gallery
  const pickImage = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selected = result.assets[0];
        setImageUri(selected.uri);
        // We will pass the base64 code to the analyzer
        if (selected.base64) {
          analyzeSkinImage(`data:image/jpeg;base64,${selected.base64}`);
        } else {
          setError("Image data extraction failed. Please try another image.");
        }
      }
    } catch (err) {
      console.error("Gallery picking failed: ", err);
      setError("Failed to open media library.");
    }
  };

  // Launch camera
  const captureImage = async () => {
    setError(null);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selected = result.assets[0];
        setImageUri(selected.uri);
        if (selected.base64) {
          analyzeSkinImage(`data:image/jpeg;base64,${selected.base64}`);
        } else {
          setError("Image data capture failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Camera capture failed: ", err);
      setError("Failed to initialize camera device.");
    }
  };

  // Analyze skin via backend Express Node.js API
  const analyzeSkinImage = async (base64Image: string) => {
    setAnalyzing(true);
    setError(null);

    try {
      // Fetch onboarding data to personalize analysis
      const user = auth.currentUser;
      const uid = user ? user.uid : "offline_user";
      
      const payload = {
        image: base64Image,
        onboardingData: {
          uid,
          name: "Eleanor",
          skinType: "Combination",
          skinConcerns: ["redness", "unevenTexture"]
        }
      };

      // Call Express full-stack API endpoint
      // Adjust server URL dynamically or default to the host
      const response = await fetch("/api/analyze-skin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Dermal response was non-optimal. Status: " + response.status);
      }

      const result = await response.json();

      // Save scan details to Firestore if authenticated
      if (user) {
        const scansRef = collection(db, "users", user.uid, "scans");
        await addDoc(scansRef, {
          timestamp: new Date().toISOString(),
          skinScore: result.skinScore,
          metrics: result.metrics,
          issues: result.issues,
          summary: result.summary,
          imageUri: "simulated_storage_uri", // Firebase Storage Mock
        });
      }

      // Router state routing with results payload
      router.push({
        pathname: "/results",
        params: {
          analysisData: JSON.stringify(result),
          localImageUri: imageUri || base64Image
        }
      });
    } catch (err: any) {
      console.error("Skin analysis failed: ", err);
      setError("Server response timed out. Please check your network connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.title}>Clinical Face Scan</Text>
        <Text style={styles.subtitle}>Align face in center frame. For best results, scan under natural daylight.</Text>
      </View>

      <View style={styles.scanningFrameContainer}>
        {analyzing ? (
          <View style={styles.processingWrapper}>
            <ActivityIndicator size="large" color="#233137" style={{ marginBottom: 16 }} />
            <Text style={styles.progressText}>MAPPING FACIAL TEXTURES...</Text>
            <Text style={styles.subProgressText}>Calculating biometric density indices via Gemini AI neural net.</Text>
          </View>
        ) : imageUri ? (
          <View style={styles.previewWrapper}>
            <Image source={{ uri: imageUri }} style={styles.cameraPreview} />
            <View style={styles.scanningReticle} />
          </View>
        ) : (
          <View style={styles.placeholderWrapper}>
            <View style={styles.reticleCornerTopLeft} />
            <View style={styles.reticleCornerTopRight} />
            <View style={styles.reticleCornerBottomLeft} />
            <View style={styles.reticleCornerBottomRight} />
            
            <Camera size={48} color="#A2A7A7" style={{ marginBottom: 16 }} />
            <Text style={styles.placeholderText}>ALIGN FACE IN RETICLE</Text>
            <Text style={styles.placeholderSubText}>Ensure no sunglasses, hair over forehead, or excessive shadows.</Text>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color="#B04B4B" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Capture Control Gate */}
      {!analyzing && (
        <View style={styles.controlPanel}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <ImageIcon size={20} color="#233137" />
            <Text style={styles.buttonLabel}>GALLERY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={captureImage}
            activeOpacity={0.85}
          >
            <View style={styles.scanInnerCircle}>
              <Sparkles size={24} color="#F2F5F5" />
            </View>
          </TouchableOpacity>

          {imageUri ? (
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={() => {
                setImageUri(null);
                setError(null);
              }}
              activeOpacity={0.8}
            >
              <RefreshCw size={20} color="#233137" />
              <Text style={styles.buttonLabel}>RESET</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F5F5",
    justifyContent: "space-between",
    paddingTop: 68,
    paddingBottom: 110,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "300",
    color: "#233137",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#515255",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
    maxWidth: width * 0.8,
  },
  scanningFrameContainer: {
    flex: 1,
    aspectRatio: 3 / 4,
    maxHeight: height * 0.45,
    alignSelf: "center",
    backgroundColor: "#F9F9F9",
    borderRadius: 28, // Card radius 28
    borderWidth: 1,
    borderColor: "#E5EBEB",
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderWrapper: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  reticleCornerTopLeft: {
    position: "absolute",
    top: 24,
    left: 24,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#A2A7A7",
  },
  reticleCornerTopRight: {
    position: "absolute",
    top: 24,
    right: 24,
    width: 24,
    height: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "#A2A7A7",
  },
  reticleCornerBottomLeft: {
    position: "absolute",
    bottom: 24,
    left: 24,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "#A2A7A7",
  },
  reticleCornerBottomRight: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 24,
    height: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "#A2A7A7",
  },
  placeholderText: {
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: "600",
    color: "#233137",
    marginBottom: 8,
  },
  placeholderSubText: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
    lineHeight: 14,
  },
  previewWrapper: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  cameraPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  scanningReticle: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "80%",
    height: "80%",
    borderWidth: 1,
    borderColor: "rgba(242, 245, 245, 0.4)",
    borderRadius: 20,
    borderStyle: "dashed",
  },
  processingWrapper: {
    alignItems: "center",
    paddingHorizontal: 36,
  },
  progressText: {
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: "600",
    color: "#233137",
    marginBottom: 8,
  },
  subProgressText: {
    fontSize: 11,
    color: "#515255",
    textAlign: "center",
    lineHeight: 16,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(176, 75, 75, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
    alignSelf: "center",
  },
  errorText: {
    color: "#B04B4B",
    fontSize: 11,
    fontWeight: "500",
  },
  controlPanel: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 20,
  },
  galleryButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    gap: 6,
  },
  buttonLabel: {
    fontSize: 9,
    letterSpacing: 1,
    fontWeight: "600",
    color: "#233137",
  },
  scanButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#233137",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  scanInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#233137",
    alignItems: "center",
    justifyContent: "center",
  },
});
