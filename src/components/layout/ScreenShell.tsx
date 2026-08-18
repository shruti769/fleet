import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { colors, spacing } from "@/design/tokens";

export function ScreenShell({
  id,
  title,
  module,
  children,
  footer,
  back = true,
}: React.PropsWithChildren<{
  id: string;
  title: string;
  module: string;
  footer?: React.ReactNode;
  back?: boolean;
}>) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {back && (
          <Text
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/dashboard")
            }
            style={styles.back}
          >
            ‹
          </Text>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.module}>{module}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.id}>{id}</Text>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {children}
      </ScrollView>
      {footer && <View style={styles.footer}>{footer}</View>}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  header: {
    minHeight: 72,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  back: {
    fontSize: 38,
    lineHeight: 44,
    color: colors.ink,
    minWidth: 48,
    textAlign: "center",
  },
  module: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: colors.muted,
    textTransform: "uppercase",
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.ink },
  id: { fontFamily: "monospace", fontSize: 12, color: colors.muted },
  content: { padding: spacing.screen, gap: spacing.md, paddingBottom: 40 },
  footer: {
    padding: spacing.screen,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
});
