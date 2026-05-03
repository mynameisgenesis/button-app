import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from "expo-audio";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";

export default function HomeScreen() {
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [customSoundUri, setCustomSoundUri] = useState<string | null>(null);
  const [customSoundName, setCustomSoundName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<AudioPlayer | null>(null);

  const insets = useSafeAreaInsets();

  const animatePress = (pressed: boolean) => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.92 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();

    Animated.timing(glowAnim, {
      toValue: pressed ? 1 : 0,
      useNativeDriver: false,
    }).start();
  };

  const playSound = useCallback(async () => {
    try {
      // Stop/remove current player
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current.remove();
        soundRef.current = null;
      }

      setIsPlaying(true);

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
      });

      const source = customSoundUri
        ? { uri: customSoundUri }
        : require("../assets/default-sound.mp3");

      const player = createAudioPlayer(source);

      soundRef.current = player;

      const subscription = player.addListener(
        "playbackStatusUpdate",
        (status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            subscription.remove();

            player.remove();

            if (soundRef.current === player) {
              soundRef.current = null;
            }
          }
        },
      );

      player.seekTo(0);
      player.play();
    } catch (error) {
      console.error("Error playing sound:", error);
      setIsPlaying(false);

      Alert.alert(
        "Playback Error",
        "Could not play the sound. Make sure the file is a valid audio format.",
      );
    }
  }, [customSoundUri]);

  const handlePickSound = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setCustomSoundUri(asset.uri);
        setCustomSoundName(asset.name);
        Alert.alert("Sound Uploaded!", `"${asset.name}" is ready to use.`);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick the audio file.");
    }
  };

  const handleClearCustomSound = () => {
    setCustomSoundUri(null);
    setCustomSoundName(null);
    Alert.alert("Cleared", "Reverted to the default sound.");
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255, 40, 40, 0.3)", "rgba(255, 40, 40, 0.85)"],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BIG RED BUTTON</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setSettingsVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Main Button Area */}
      <View style={styles.mainContent}>
        <Text style={styles.subtitle}>
          {isPlaying ? "🔊 PLAYING..." : "TAP TO MAKE NOISE"}
        </Text>

        <Pressable
          onPressIn={() => animatePress(true)}
          onPressOut={() => {
            animatePress(false);
            playSound();
          }}
        >
          <Animated.View
            style={[
              styles.glowRing,
              { backgroundColor: glowColor, shadowColor: "#ff2828" },
            ]}
          >
            <Animated.View
              style={[
                styles.button,
                { transform: [{ scale: scaleAnim }] },
                isPlaying && styles.buttonPlaying,
              ]}
            >
              <Text style={styles.buttonEmoji}>📢</Text>
              <Text style={styles.buttonLabel}>
                {isPlaying ? "GOING!" : "PRESS ME"}
              </Text>
            </Animated.View>
          </Animated.View>
        </Pressable>

        {customSoundName && (
          <Text style={styles.activeSound}>🎵 {customSoundName}</Text>
        )}
      </View>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>⚙️ Settings</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>SOUND SOURCE</Text>

            <View style={styles.soundInfo}>
              <Text style={styles.soundInfoLabel}>Current sound:</Text>
              <Text style={styles.soundInfoValue} numberOfLines={1}>
                {customSoundName ?? "Default (built-in)"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={handlePickSound}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadBtnText}>📁 Upload Your Own Sound</Text>
            </TouchableOpacity>

            {customSoundUri && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={handleClearCustomSound}
                activeOpacity={0.8}
              >
                <Text style={styles.clearBtnText}>↩ Use Default Sound</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.hint}>
              Supports MP3, WAV, AAC, and most common audio formats.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: "#ff2828",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 3,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  settingsIcon: {
    fontSize: 20,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  subtitle: {
    color: "#888",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  glowRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 40,
    elevation: 20,
  },
  button: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#cc0000",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 6,
    borderColor: "#ff4444",
    borderBottomWidth: 12,
    borderBottomColor: "#880000",
    shadowColor: "#ff0000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    gap: 8,
  },
  buttonPlaying: {
    backgroundColor: "#e60000",
    borderColor: "#ff6666",
  },
  buttonEmoji: {
    fontSize: 52,
  },
  buttonLabel: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },
  activeSound: {
    color: "#ff6666",
    fontSize: 13,
    fontWeight: "600",
    maxWidth: 280,
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#161616",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    gap: 16,
    borderTopWidth: 1,
    borderColor: "#2a2a2a",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  closeBtn: {
    color: "#888",
    fontSize: 20,
    fontWeight: "600",
    padding: 4,
  },
  sectionLabel: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  soundInfo: {
    backgroundColor: "#1f1f1f",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  soundInfoLabel: {
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  soundInfoValue: {
    color: "#ccc",
    fontSize: 13,
    flex: 1,
  },
  uploadBtn: {
    backgroundColor: "#cc0000",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  uploadBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  clearBtn: {
    backgroundColor: "#1f1f1f",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  clearBtnText: {
    color: "#aaa",
    fontSize: 15,
    fontWeight: "700",
  },
  hint: {
    color: "#444",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
