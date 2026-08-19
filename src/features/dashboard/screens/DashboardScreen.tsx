import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BottomTabBar } from "@/navigation/BottomTabBar";
import { colors } from "@/design/tokens";
import { useAppState } from "@/state/AppState";

const headingFont = "BarlowSemiCondensed_700Bold";

export function DashboardScreen() {
  const state = useAppState();
  const running = state.shift !== "clocked_off";
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() =>
              router.push(running ? "/screen/A27.M5" : "/screen/A27.M4")
            }
            style={styles.companyPill}
          >
            <Text numberOfLines={1} style={styles.companyName}>
              Barwon Fuel Haulage
            </Text>
            <MaterialIcons name="swap-horiz" size={22} color={colors.amber} />
          </Pressable>
          <Pressable onPress={() => router.push("/screen/A22")} style={styles.notification}>
            <MaterialIcons name="notifications-none" size={29} color="#FFFFFF" />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>
        <Text style={styles.greeting}>Good morning, Dave</Text>
        <Text style={styles.date}>Wednesday 8 July · {running ? "Clocked on" : "Clocked off"}</Text>
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() =>
            router.push(running ? "/screen/A27.M2" : "/screen/A27.M1")
          }
          style={[styles.clockButton, running && styles.clockButtonRunning]}
        >
          <MaterialIcons name={running ? "stop-circle" : "schedule"} size={26} color={colors.ink} />
          <Text style={styles.clockLabel}>
            {running ? "Clock off" : "Clock on"}
          </Text>
        </Pressable>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>THIS SHIFT</Text>
            <Text style={styles.statValue}>{running ? "03:33" : "00:00"}</Text>
            <Text style={styles.statCaption}>
              {running ? "On duty" : "Not started"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>THIS WEEK</Text>
            <Text numberOfLines={1} style={styles.statValue}>31 h 45 m</Text>
            <Text style={styles.statCaption}>4 days worked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>NEXT JOB</Text>
            <Text style={styles.jobCode}>CN-48213</Text>
            <Text style={styles.statCaption}>09:30</Text>
          </View>
        </View>
        <View style={styles.availabilityCard}>
          <View style={styles.availabilityTop}>
            <Text style={styles.availabilityTitle}>Looking for work</Text>
            <MaterialIcons name="info-outline" size={22} color={colors.muted} />
            <Switch
              value={state.availability}
              onValueChange={state.toggleAvailability}
              trackColor={{ false: "#D9E1EC", true: "#93B4F8" }}
              thumbColor={state.availability ? colors.actionBlue : "#FFFFFF"}
            />
          </View>
          <Text style={styles.availabilityText}>Off means no operator can see you. Turn it on to take extra work around your Redgum shifts.</Text>
        </View>
      </ScrollView>
      <BottomTabBar active="Run" hideBadges />
    </SafeAreaView>
  );
}

const shadow = {
  shadowColor: "#10243A",
  shadowOpacity: 0.07,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.midNavy },
  header: {
    backgroundColor: colors.midNavy,
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyPill: {
    height: 36,
    maxWidth: "72%",
    paddingHorizontal: 12,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#71849A",
    backgroundColor: "#38516A",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  companyMark: {
    width: 31,
    height: 31,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#9C3415",
  },
  companyCode: { color: "#FFF", fontFamily: headingFont, fontSize: 13 },
  companyName: {
    flexShrink: 1,
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  notification: { width: 38, height: 38, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", right: 4, top: 3, width: 7, height: 7, borderRadius: 4, backgroundColor: "#EF4444" },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  greeting: {
    marginTop: 16,
    color: "#FFF",
    fontFamily: headingFont,
    fontSize: 29,
    lineHeight: 34,
  },
  date: {
    marginTop: 1,
    color: "#D5DEEA",
    fontSize: 13,
  },
  body: { flex: 1, backgroundColor: colors.appBg },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
    paddingBottom: 15,
  },
  clockButton: {
    height: 62,
    borderRadius: 14,
    backgroundColor: "#FFA51B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#D97706",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  clockButtonRunning: { backgroundColor: colors.breach },
  playCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  clockLabel: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    ...shadow,
    flex: 1,
    height: 98,
    borderRadius: 17,
    backgroundColor: "#FFF",
    paddingHorizontal: 13,
    paddingVertical: 14,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 4,
    color: colors.ink,
    fontFamily: headingFont,
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.35,
  },
  statCaption: { color: colors.muted, fontSize: 12 },
  jobCode: { marginTop: 8, color: colors.ink, fontFamily: "monospace", fontSize: 13, fontWeight: "700" },
  jobCard: {
    ...shadow,
    height: 92,
    borderRadius: 20,
    backgroundColor: "#FFF",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },
  jobImage: { width: 64, height: 64, borderRadius: 11 },
  jobCopy: { flex: 1, gap: 3 },
  jobTitle: { color: colors.ink, fontFamily: headingFont, fontSize: 19 },
  jobSubtitle: { color: colors.muted, fontSize: 15 },
  availabilityCard: {
    ...shadow,
    minHeight: 112,
    borderRadius: 17,
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  availabilityTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  availabilityTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
    fontWeight: "700",
  },
  availabilityText: { marginTop: 10, color: colors.muted, fontSize: 13, lineHeight: 18 },
});
