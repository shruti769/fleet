import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/design/tokens";
import { useWorkAccess } from "@/hooks/useWorkAccess";
import { useAppState } from "@/state/AppState";
import { routes } from "@/utils/routes";

const tabs = [
  ["assignment", "Run", routes.dashboard],
  ["navigation", "Navigate", routes.navigate],
  ["verified-user", "Compliance", routes.compliance],
  ["chat-bubble-outline", "Messages", routes.messages],
  ["person-outline", "Profile", routes.profile],
] as const;
type TabName = (typeof tabs)[number][1];

export function BottomTabBar({ active, hideBadges = false }: { active?: TabName; hideBadges?: boolean }) {
  const state = useAppState();
  const insets = useSafeAreaInsets();
  const workUnlocked = useWorkAccess();
  return (
    <View
      style={[
        styles.root,
        { height: 52 + insets.bottom, paddingBottom: insets.bottom },
      ]}
    >
      {tabs.map(([icon, label, path]) => {
        const selected = active === label;
        const color = selected ? colors.actionBlue : colors.muted;
        return (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityLabel={label}
            onPress={() =>
              router.replace(
                (label === "Run" || label === "Navigate") && !workUnlocked
                  ? routes.startShiftGate
                  : path,
              )
            }
            style={styles.tab}
          >
            <MaterialIcons name={icon} size={23} color={color} />
            <Text
              style={[
                styles.label,
                { color },
                selected && styles.selectedLabel,
              ]}
            >
              {label}
            </Text>
            {!hideBadges && label === "Messages" && state.unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{state.unreadMessages}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3 },
  label: { fontSize: 10, fontWeight: "600" },
  selectedLabel: { fontWeight: "800" },
  badge: {
    position: "absolute",
    top: 8,
    right: 16,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.breach,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#FFF" },
});
