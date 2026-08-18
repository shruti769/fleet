import React from "react";
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from "react-native";
import { colors, radius, spacing } from "@/design/tokens";

export function Button({
  label,
  tone = "primary",
  disabled,
  accentOutline,
  ...props
}: PressableProps & {
  label: string;
  tone?: "primary" | "secondary" | "danger";
  accentOutline?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      {...props}
      style={({ pressed }) => [
        styles.button,
        tone === "secondary" && styles.secondary,
        tone === "danger" && styles.danger,
        accentOutline && styles.accentOutline,
        disabled && styles.disabled,
        pressed && { opacity: 0.78 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          tone === "secondary" && { color: colors.ink },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Card({
  children,
  title,
  onPress,
}: React.PropsWithChildren<{ title?: string; onPress?: () => void }>) {
  const body = (
    <>
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      {body}
    </Pressable>
  ) : (
    <View style={styles.card}>{body}</View>
  );
}
export function Field({
  labelStyle,
  ...props
}: TextInputProps & { label: string; labelStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[styles.label, labelStyle]}>{props.label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        {...props}
        style={[
          styles.input,
          props.multiline && { minHeight: 104, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  const bg =
    tone === "good"
      ? "#ECFDF3"
      : tone === "warn"
        ? "#FFFBEB"
        : tone === "bad"
          ? "#FEF2F2"
          : "#EEF3F9";
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text
        style={{
          fontWeight: "700",
          color:
            tone === "bad"
              ? "#B91C1C"
              : tone === "warn"
                ? "#92400E"
                : tone === "good"
                  ? "#15803D"
                  : colors.midNavy,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
export function Setting({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange(v: boolean): void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.setting}>
      <Text style={styles.bodyStrong}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.actionBlue }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.button,
    backgroundColor: colors.actionBlue,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondary: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentOutline: { borderWidth: 1.5, borderColor: "#BFD8F4" },
  danger: { backgroundColor: colors.breach },
  disabled: { opacity: 0.42 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.fleetNavy,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: "uppercase",
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.card,
  },
  pill: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  setting: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  bodyStrong: { fontSize: 16, fontWeight: "600", color: colors.ink, flex: 1 },
});
