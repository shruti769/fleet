import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@/design/tokens";

export default function Splash() {
  useEffect(() => {
    const timer = setTimeout(() => router.replace("/screen/A2"), 1200);
    return () => clearTimeout(timer);
  }, []);
  return (
    <View style={styles.root}>
      <Text style={styles.logo}>
        FLEET<Text style={{ color: colors.amber }}>SYNC</Text>
      </Text>
      <Text style={styles.sub}>Mobile Driver App</Text>
      <Text style={styles.version}>v1.0 · SDK 57</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fleetNavy,
  },
  logo: { color: "#fff", fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  sub: { color: colors.amber, fontSize: 14, fontWeight: "700" },
  version: {
    position: "absolute",
    bottom: 48,
    color: "#AAB8C8",
    fontFamily: "monospace",
  },
});
