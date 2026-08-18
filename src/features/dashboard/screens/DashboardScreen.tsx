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
            <View style={styles.companyMark}>
              <Text style={styles.companyCode}>RF</Text>
            </View>
            <Text numberOfLines={1} style={styles.companyName}>
              Redgum Freightlines
            </Text>
            <MaterialIcons name="swap-horiz" size={22} color={colors.amber} />
          </Pressable>
          <Pressable onPress={() => router.push("/screen/A34")}>
            <Image
              source={require("../../../../assets/driver-profile.png")}
              style={styles.avatar}
            />
          </Pressable>
        </View>
        <Text style={styles.greeting}>Morning, Dave</Text>
        <Text style={styles.date}>Wednesday 8 July</Text>
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
          <View style={styles.playCircle}>
            <MaterialIcons
              name={running ? "stop" : "play-arrow"}
              size={21}
              color={running ? colors.breach : colors.onTime}
            />
          </View>
          <Text style={styles.clockLabel}>
            {running ? "Clock off" : "Clock on"}
          </Text>
        </Pressable>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>THIS SHIFT</Text>
            <Text style={styles.statValue}>{running ? "03:33" : "–"}</Text>
            <Text style={styles.statCaption}>
              {running ? "On duty" : "Not started"}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.eyebrow}>THIS WEEK</Text>
            <Text style={styles.statValue}>31:42</Text>
            <Text style={styles.statCaption}>of 72:00</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.push(running ? "/screen/A5" : "/screen/A3")}
          style={styles.jobCard}
        >
          <Image
            source={require("../../../../assets/job-coastline.png")}
            style={styles.jobImage}
          />
          <View style={styles.jobCopy}>
            <Text style={styles.eyebrow}>NEXT JOB</Text>
            <Text numberOfLines={1} style={styles.jobTitle}>
              Coastline Grocers, Wodonga
            </Text>
            <Text numberOfLines={1} style={styles.jobSubtitle}>
              {running
                ? "08:45–10:15 · 22 pallets"
                : "Clock on to see your run"}
            </Text>
          </View>
          {!running && (
            <MaterialIcons name="lock-outline" size={27} color={colors.amber} />
          )}
        </Pressable>
        <View style={styles.availabilityCard}>
          <Text numberOfLines={1} style={styles.availabilityTitle}>
            Looking for work
          </Text>
          <View style={styles.phasePill}>
            <Text style={styles.phaseText}>Phase 2</Text>
          </View>
          <MaterialIcons name="info-outline" size={25} color={colors.muted} />
          <Switch
            value={state.availability}
            onValueChange={state.toggleAvailability}
            trackColor={{ false: "#C8D3E2", true: "#93B4F8" }}
            thumbColor={state.availability ? colors.actionBlue : "#FFFFFF"}
          />
        </View>
      </ScrollView>
      <BottomTabBar active="Dashboard" />
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
    paddingHorizontal: 25,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  companyPill: {
    height: 48,
    maxWidth: "72%",
    paddingHorizontal: 13,
    paddingRight: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#71849A",
    backgroundColor: "#38516A",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    fontFamily: headingFont,
    fontSize: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  greeting: {
    marginTop: 18,
    color: "#FFF",
    fontFamily: headingFont,
    fontSize: 37,
    lineHeight: 41,
  },
  date: {
    marginTop: 1,
    color: "#D5DEEA",
    fontSize: 18,
    fontFamily: "BarlowSemiCondensed_600SemiBold",
  },
  body: { flex: 1, backgroundColor: colors.appBg },
  content: {
    paddingHorizontal: 25,
    paddingTop: 15,
    gap: 10,
    paddingBottom: 15,
  },
  clockButton: {
    height: 82,
    borderRadius: 20,
    backgroundColor: "#17AA4B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    shadowColor: "#16A34A",
    shadowOpacity: 0.23,
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
  clockLabel: { color: "#FFF", fontFamily: headingFont, fontSize: 27 },
  statsRow: { flexDirection: "row", gap: 12 },
  statCard: {
    ...shadow,
    flex: 1,
    height: 96,
    borderRadius: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eyebrow: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  statValue: {
    marginTop: 4,
    color: colors.ink,
    fontFamily: headingFont,
    fontSize: 29,
    lineHeight: 31,
  },
  statCaption: { color: colors.muted, fontSize: 15 },
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
    height: 66,
    borderRadius: 20,
    backgroundColor: "#FFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  availabilityTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 17,
    fontWeight: "700",
  },
  phasePill: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#B9CBE1",
    backgroundColor: "#EDF4FD",
    paddingHorizontal: 13,
    paddingVertical: 4,
  },
  phaseText: { color: colors.midNavy, fontSize: 13, fontWeight: "700" },
});
