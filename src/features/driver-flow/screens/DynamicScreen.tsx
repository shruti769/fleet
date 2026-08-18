import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import type { CameraView as NativeCameraView } from "expo-camera";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenShell } from "@/components/layout/ScreenShell";
import { Button, Card, Field, Setting, StatusPill } from "@/components/ui";
import { BottomTabBar } from "@/navigation/BottomTabBar";
import { colors, spacing } from "@/design/tokens";
import { jobs, operators, vehicles } from "@/data/seed";
import { screenById, screens } from "@/navigation/screenRegistry";
import { useAppState } from "@/state/AppState";
import { recordOfflineFirst } from "@/services/records";

const useCameraPermissions = () =>
  [{ granted: true, denied: false }, async () => ({ granted: true })] as const;
const Location = {
  requestForegroundPermissionsAsync: async () => ({ granted: true }),
};
const ImagePicker = {
  requestCameraPermissionsAsync: async () => ({ granted: true }),
};
type CameraView = NativeCameraView;
const CameraView = forwardRef<NativeCameraView, any>(function PrototypeCamera(
  { onBarcodeScanned },
  ref,
) {
  useImperativeHandle(
    ref,
    () =>
      ({
        takePictureAsync: async () => ({ uri: "prototype://photo.jpg" }),
      }) as NativeCameraView,
  );
  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel="Simulated camera preview"
      onPress={() =>
        onBarcodeScanned?.({ data: "PLT-48213-22", type: "code128" })
      }
      style={prototypeCameraStyles.preview}
    >
      <Text style={prototypeCameraStyles.icon}>▣</Text>
      <Text style={prototypeCameraStyles.title}>Camera preview</Text>
      <Text style={prototypeCameraStyles.caption}>
        Prototype mode · tap preview to simulate a scan
      </Text>
    </Pressable>
  );
});
const prototypeCameraStyles = StyleSheet.create({
  preview: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.fleetNavy,
    gap: 8,
  },
  icon: { fontSize: 56, color: colors.amber },
  title: { fontSize: 18, fontWeight: "700", color: "#fff" },
  caption: { fontSize: 13, color: "#B8C4D1" },
});

const go = (id: string, replace = false) =>
  replace ? router.replace(`/screen/${id}`) : router.push(`/screen/${id}`);
const TextBody = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.body}>{children}</Text>
);
const Muted = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.muted}>{children}</Text>
);

export function DynamicScreen({ id }: { id: string }) {
  const def = screenById.get(id);
  if (!def)
    return (
      <ScreenShell id={id} title="Screen not found" module="FleetSync">
        <TextBody>This document ID is not registered.</TextBody>
      </ScreenShell>
    );
  if (id === "A2") return <SignInStandalone />;
  if (id === "A26") return <CompanyTodayStandalone />;
  if (id === "A35") return <PermissionsPrimerStandalone />;
  if (id === "A36") return <ProfileSetupStandalone />;
  const footer = ["A4", "A6", "A22", "A34"].includes(id) ? (
    <BottomTabBar />
  ) : undefined;
  return (
    <ScreenShell id={id} title={def.title} module={def.module} footer={footer}>
      {renderBody(id)}
    </ScreenShell>
  );
}

function SignInStandalone() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  return (
    <SafeAreaView style={signInStyles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={signInStyles.content}
      >
        <Text style={signInStyles.brand}>FLEETSYNC</Text>
        <Text style={signInStyles.title}>Sign in</Text>
        <Text
          style={signInStyles.subtitle}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Your own email and password. No company code.
        </Text>
        <View style={signInStyles.form}>
          <Field
            label="Email"
            labelStyle={signInStyles.fieldLabel}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Field
            label="Password"
            labelStyle={signInStyles.fieldLabel}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button
            label="Sign in"
            disabled={!email.trim() || !password.trim()}
            onPress={() => go("A26")}
          />
          <Button
            label="◉  Use Face ID"
            tone="secondary"
            accentOutline
            onPress={() => go("A26")}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => setResetOpen(true)}
            style={signInStyles.forgot}
          >
            <Text style={signInStyles.forgotText}>Forgot password</Text>
          </Pressable>
        </View>
      </ScrollView>
      <Modal
        visible={resetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setResetOpen(false);
          setResetSent(false);
        }}
      >
        <View style={signInStyles.modalRoot}>
          <Pressable
            accessibilityLabel="Close reset password"
            onPress={() => {
              setResetOpen(false);
              setResetSent(false);
            }}
            style={signInStyles.scrim}
          />
          <View style={signInStyles.sheet}>
            <View style={signInStyles.handle} />
            <View style={signInStyles.sheetTitleRow}>
              <Text style={signInStyles.sheetTitle}>
                {resetSent ? "Check your email" : "Reset your password"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={() => {
                  setResetOpen(false);
                  setResetSent(false);
                }}
                style={signInStyles.closeButton}
              >
                <Text style={signInStyles.closeText}>×</Text>
              </Pressable>
            </View>
            {resetSent ? (
              <>
                <Text style={signInStyles.sheetSubtitle}>
                  The link lasts 30 minutes. If it does not arrive,{`\n`}check
                  your junk folder.
                </Text>
                <View style={signInStyles.emailSuccess}>
                  <View style={signInStyles.envelope}>
                    <View style={signInStyles.envelopeFoldLeft} />
                    <View style={signInStyles.envelopeFoldRight} />
                  </View>
                  <View style={signInStyles.checkBadge}>
                    <Text style={signInStyles.checkMark}>✓</Text>
                  </View>
                </View>
                <Button
                  label="Back to sign in"
                  tone="secondary"
                  accentOutline
                  onPress={() => {
                    setResetOpen(false);
                    setResetSent(false);
                  }}
                />
              </>
            ) : (
              <>
                <Text style={signInStyles.sheetSubtitle}>
                  We will send a link to the email on your account.
                </Text>
                <Field
                  label="Email"
                  labelStyle={signInStyles.fieldLabel}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Button
                  label="Send reset link"
                  onPress={() => setResetSent(true)}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CompanyTodayStandalone() {
  const appState = useAppState();
  const [selected, setSelected] = useState(appState.operatorId || "op_redgum");
  const [remember, setRemember] = useState(true);
  const companyRows = [
    {
      id: "op_redgum",
      code: "RF",
      name: "Redgum Freightlines",
      detail: "Laverton VIC · Permanent",
      last: "Last worked Yesterday",
      colour: "#933112",
    },
    {
      id: "op_barwon",
      code: "BF",
      name: "Barwon Fuel Haulage",
      detail: "Corio VIC · Casual",
      last: "Last worked Thursday 2 July",
      colour: "#176F82",
    },
  ];
  return (
    <SafeAreaView style={companyStyles.safe}>
      <ScrollView contentContainerStyle={companyStyles.content}>
        <View style={companyStyles.headingRow}>
          <Text
            style={companyStyles.heading}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.84}
          >
            Who are you driving for{`\n`}today?
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About company selection"
            onPress={() => go("A26.M1")}
            style={companyStyles.help}
          >
            <Text style={companyStyles.helpText}>?</Text>
          </Pressable>
        </View>
        <Text style={companyStyles.subtitle}>
          Your hours, jobs and checklists all belong to the company you pick.
        </Text>
        <View style={companyStyles.list}>
          {companyRows.map((company) => {
            const isSelected = selected === company.id;
            return (
              <Pressable
                key={company.id}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                onPress={() => setSelected(company.id)}
                style={[
                  companyStyles.card,
                  isSelected && companyStyles.cardSelected,
                ]}
              >
                <View
                  style={[
                    companyStyles.companyLogo,
                    { backgroundColor: company.colour },
                  ]}
                >
                  <Text style={companyStyles.companyCode}>{company.code}</Text>
                </View>
                <View style={companyStyles.companyCopy}>
                  <Text
                    style={companyStyles.companyName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    {company.name}
                  </Text>
                  <Text style={companyStyles.companyDetail} numberOfLines={1}>
                    {company.detail}
                  </Text>
                  <Text style={companyStyles.companyLast} numberOfLines={1}>
                    {company.last}
                  </Text>
                </View>
                <View
                  style={[
                    companyStyles.radio,
                    isSelected && companyStyles.radioSelected,
                  ]}
                >
                  {isSelected && <View style={companyStyles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: remember }}
          onPress={() => setRemember((value) => !value)}
          style={companyStyles.rememberRow}
        >
          <View
            style={[
              companyStyles.checkbox,
              remember && companyStyles.checkboxChecked,
            ]}
          >
            {remember && <Text style={companyStyles.tick}>✓</Text>}
          </View>
          <Text style={companyStyles.rememberText}>Remember for today</Text>
        </Pressable>
      </ScrollView>
      <View style={companyStyles.footer}>
        <Button
          label="Continue"
          onPress={() => {
            appState.setOperator(selected);
            router.replace("/screen/A35");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function PermissionsPrimerStandalone() {
  const permissionItems = [
    {
      icon: "location-on",
      title: "Your location",
      body: "Stamped onto your clock on, your job statuses and your proof of delivery.",
    },
    {
      icon: "photo-camera",
      title: "The camera",
      body: "Defect photographs, proof of delivery and your fit for duty photo.",
    },
    {
      icon: "notifications-none",
      title: "Notifications",
      body: "Break reminders and messages from your allocator.",
    },
  ];
  return (
    <SafeAreaView style={permissionStyles.safe}>
      <ScrollView contentContainerStyle={permissionStyles.content}>
        <Text
          style={permissionStyles.heading}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          Three things the app needs
        </Text>
        <Text style={permissionStyles.subtitle}>
          Each one exists for your record, not ours.
        </Text>
        <View style={permissionStyles.list}>
          {permissionItems.map((item) => (
            <View key={item.title} style={permissionStyles.card}>
              <View style={permissionStyles.iconCircle}>
                <MaterialIcons
                  name={
                    item.icon as
                      "location-on" | "photo-camera" | "notifications-none"
                  }
                  size={25}
                  color={colors.actionBlue}
                />
              </View>
              <View style={permissionStyles.copy}>
                <Text style={permissionStyles.itemTitle}>{item.title}</Text>
                <Text style={permissionStyles.itemBody}>{item.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={permissionStyles.footer}>
        <Button label="Continue" onPress={() => go("A36", true)} />
      </View>
    </SafeAreaView>
  );
}

const permissionStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 100 },
  heading: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 28,
    lineHeight: 34,
    color: colors.ink,
  },
  subtitle: { marginTop: 5, fontSize: 15, lineHeight: 22, color: colors.muted },
  list: { marginTop: 24, gap: 14 },
  card: {
    minHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.fleetNavy,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF4FC",
  },
  copy: { flex: 1, gap: 4 },
  itemTitle: { fontSize: 17, fontWeight: "800", color: colors.ink },
  itemBody: { fontSize: 14, lineHeight: 20, color: colors.muted },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.appBg,
  },
});

function ProfileSetupStandalone() {
  const state = useAppState();
  const rows = [
    {
      icon: "badge",
      label: "Heavy vehicle licence",
      value: "MC 4471982 · Victoria",
      mono: true,
    },
    { icon: "event", label: "Licence expiry", value: "14 March 2028" },
    { icon: "phone", label: "Mobile", value: "0412 668 204", mono: true },
    {
      icon: "contact-emergency",
      label: "Emergency contact",
      value: "Sharon Whitmore · 0413 552 907",
    },
  ] as const;
  return (
    <SafeAreaView style={profileSetupStyles.safe}>
      <View style={profileSetupStyles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => go("A35", true)}
          style={profileSetupStyles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.midNavy} />
        </Pressable>
        <View>
          <Text style={profileSetupStyles.headerTitle}>
            Set up your profile
          </Text>
          <Text style={profileSetupStyles.headerSubtitle}>
            Once only, takes a minute
          </Text>
        </View>
      </View>
      <ScrollView
        style={profileSetupStyles.body}
        contentContainerStyle={profileSetupStyles.content}
      >
        <View style={profileSetupStyles.identity}>
          <Image
            source={require("../../../../assets/driver-profile.png")}
            style={profileSetupStyles.photo}
          />
          <View style={profileSetupStyles.identityCopy}>
            <Text style={profileSetupStyles.name}>Dave Whitmore</Text>
            <Pressable accessibilityRole="button">
              <Text style={profileSetupStyles.changePhoto}>
                Change the photograph
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={profileSetupStyles.detailsCard}>
          {rows.map((row, index) => (
            <Pressable
              key={row.label}
              accessibilityRole="button"
              style={[
                profileSetupStyles.detailRow,
                index < rows.length - 1 && profileSetupStyles.detailDivider,
              ]}
            >
              <MaterialIcons name={row.icon} size={20} color={colors.midNavy} />
              <View style={profileSetupStyles.detailCopy}>
                <Text style={profileSetupStyles.detailLabel}>{row.label}</Text>
                <Text
                  style={[
                    profileSetupStyles.detailValue,
                    "mono" in row && row.mono && profileSetupStyles.mono,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {row.value}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color={colors.muted}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={profileSetupStyles.footer}>
        <Button
          label="Save and continue"
          onPress={() => {
            state.setShift("clocked_off");
            router.replace("/dashboard");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const profileSetupStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  body: { backgroundColor: colors.appBg },
  header: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 38,
    height: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 20,
    lineHeight: 23,
    color: colors.ink,
  },
  headerSubtitle: { fontSize: 12, lineHeight: 16, color: colors.muted },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 },
  identity: { flexDirection: "row", alignItems: "center", gap: 14 },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#C8D7E8",
  },
  identityCopy: { flex: 1, gap: 2 },
  name: { fontSize: 19, fontWeight: "800", color: colors.ink },
  changePhoto: { fontSize: 14, fontWeight: "700", color: colors.actionBlue },
  detailsCard: {
    marginTop: 22,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.card,
    shadowColor: colors.fleetNavy,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  detailRow: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  detailCopy: { flex: 1, gap: 2 },
  detailLabel: { fontSize: 12, color: colors.muted },
  detailValue: { fontSize: 15, fontWeight: "700", color: colors.ink },
  mono: { fontFamily: "monospace", letterSpacing: 0.5 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.appBg,
  },
});

const companyStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 96 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  heading: {
    flex: 1,
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
  },
  help: {
    width: 30,
    height: 30,
    marginTop: 4,
    borderWidth: 2,
    borderColor: colors.muted,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: { fontSize: 18, fontWeight: "800", color: colors.muted },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
  },
  list: { marginTop: 28, gap: 14 },
  card: {
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  cardSelected: { borderColor: colors.actionBlue, backgroundColor: "#F2F7FF" },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  companyCode: { color: "#fff", fontSize: 16, fontWeight: "900" },
  companyCopy: { flex: 1, gap: 3 },
  companyName: { fontSize: 16, fontWeight: "800", color: colors.ink },
  companyDetail: { fontSize: 13, color: colors.muted },
  companyLast: { fontSize: 12, color: colors.muted },
  radio: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C8D7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: colors.actionBlue },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.actionBlue,
  },
  rememberRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 34,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.actionBlue,
    borderColor: colors.actionBlue,
  },
  tick: { color: "#fff", fontSize: 17, fontWeight: "900" },
  rememberText: { fontSize: 15, fontWeight: "700", color: colors.ink },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.appBg,
  },
});

const signInStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: 22, paddingTop: 28, paddingBottom: 48 },
  brand: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 0.2,
    color: colors.fleetNavy,
    marginBottom: 42,
  },
  title: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -0.8,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.muted,
    marginTop: 4,
    marginBottom: 36,
  },
  form: { gap: 20 },
  fieldLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "none",
    color: colors.midNavy,
  },
  forgot: {
    minHeight: 32,
    marginTop: -10,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotText: { fontSize: 14, fontWeight: "700", color: colors.actionBlue },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(14,32,51,.46)" },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 38,
    gap: 16,
  },
  handle: {
    width: 56,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 2,
  },
  sheetTitleRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  sheetTitle: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    flex: 1,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 38, lineHeight: 42, color: colors.muted },
  sheetSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginTop: -16,
    maxWidth: 380,
  },
  emailSuccess: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ECFDF3",
    marginVertical: 4,
  },
  envelope: {
    width: 48,
    height: 34,
    borderRadius: 4,
    backgroundColor: colors.onTime,
    overflow: "hidden",
  },
  envelopeFoldLeft: {
    position: "absolute",
    width: 34,
    height: 3,
    backgroundColor: "#fff",
    left: -3,
    top: 10,
    transform: [{ rotate: "35deg" }],
  },
  envelopeFoldRight: {
    position: "absolute",
    width: 34,
    height: 3,
    backgroundColor: "#fff",
    right: -3,
    top: 10,
    transform: [{ rotate: "-35deg" }],
  },
  checkBadge: {
    position: "absolute",
    right: 7,
    bottom: 7,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  checkMark: { fontSize: 28, fontWeight: "900", color: colors.onTime },
});

function renderBody(id: string) {
  if (id === "A2") return <SignIn />;
  if (id === "A2.M1")
    return (
      <SimpleForm
        text="Enter your email and we will send a secure reset link."
        label="Email"
        button="Send reset link"
        next="A2.M2"
      />
    );
  if (id === "A2.M2")
    return (
      <Notice
        tone="good"
        title="Check your inbox"
        text="A reset link has been sent. It expires in 30 minutes."
        action="Back to sign in"
        next="A2"
      />
    );
  if (id === "A2.S1")
    return (
      <Notice
        tone="bad"
        title="We couldn't sign you in"
        text="Check your email and password. Your entries have been preserved."
        action="Try again"
        next="A2"
      />
    );
  if (id === "A2.S2")
    return (
      <Notice
        tone="warn"
        title="No connection"
        text="Sign in requires a connection the first time on this device."
        action="Try again"
        next="A2"
      />
    );
  if (id === "A26" || id === "A26.S1") return <CompanyPicker />;
  if (id === "A26.S2")
    return (
      <Notice
        tone="warn"
        title="Redgum Freightlines invited you"
        text="Accepting links your driver profile to this operator. Their records remain separate."
        action="Accept invitation"
        next="A26"
      />
    );
  if (id === "A26.M1")
    return (
      <Notice
        title="One driver, several companies"
        text="Choose who you are working for today. Jobs, records and hours are kept separate for each operator."
        action="Got it"
        next="A26"
      />
    );
  if (id === "A35" || id === "A35.M1" || id === "A35.S1")
    return <Permissions denied={id === "A35.S1"} />;
  if (id === "A36") return <ProfileSetup />;
  if (id.startsWith("A27")) return <ShiftState id={id} />;
  if (id === "A3") return <ShiftGates />;
  if (id === "A33") return <ShiftSummary />;
  if (id.startsWith("A16")) return <Fitness id={id} />;
  if (id.startsWith("A32")) return <DutyCamera id={id} />;
  if (id.startsWith("A14") || id.startsWith("A15"))
    return <Inspection id={id} />;
  if (id === "A28") return <StartWork />;
  if (id.startsWith("A29")) return <Unscheduled id={id} />;
  if (id.startsWith("A30")) return <CreateJob id={id} />;
  if (id.startsWith("A4")) return <RunSheet id={id} />;
  if (["A6", "A6.M1", "A6.M2", "A7", "A7.M1", "A18"].includes(id))
    return <NavigationFeature id={id} />;
  if (id.startsWith("A5")) return <JobDetail id={id} />;
  if (id.startsWith("A31")) return <Comments id={id} />;
  if (id.startsWith("A8")) return <JobStatus id={id} />;
  if (id.startsWith("A10")) return <Scanner id={id} />;
  if (id.startsWith("A9")) return <Proof id={id} />;
  if (id.startsWith("A11")) return <FailedDelivery id={id} />;
  if (id.startsWith("A12") || id.startsWith("A13") || id.startsWith("A21"))
    return <Hours id={id} />;
  if (id.startsWith("A17")) return <Incident id={id} />;
  if (id.startsWith("A19")) return <Fuel id={id} />;
  if (id.startsWith("A20")) return <Odometer id={id} />;
  if (id.startsWith("A22")) return <Messages id={id} />;
  if (id.startsWith("A23") || id.startsWith("A25")) return <Wallet id={id} />;
  if (id.startsWith("A24")) return <SyncQueue />;
  if (id.startsWith("A34")) return <Profile id={id} />;
  return <RegistryFallback id={id} />;
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <>
      <Text style={styles.hero}>
        FLEET<Text style={{ color: colors.amber }}>SYNC</Text>
      </Text>
      <Muted>Sign in to start your shift</Muted>
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text onPress={() => go("A2.M1")} style={styles.link}>
        Forgot password?
      </Text>
      <Button
        label="Sign in"
        disabled={!email.includes("@") || password.length < 8}
        onPress={() => go("A26")}
      />
      <Button label="Use Face ID" tone="secondary" onPress={() => go("A26")} />
    </>
  );
}
function CompanyPicker() {
  const state = useAppState();
  return (
    <>
      <Text style={styles.lead}>Who are you driving for today?</Text>
      {operators.map((o) => (
        <Card
          key={o.id}
          onPress={() => {
            state.setOperator(o.id);
            router.replace("/dashboard");
          }}
        >
          <View style={styles.row}>
            <View style={[styles.operator, { backgroundColor: o.colour }]}>
              <Text style={styles.operatorText}>{o.code}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>{o.name}</Text>
              <Muted>Active driver</Muted>
            </View>
            <Text style={styles.chev}>›</Text>
          </View>
        </Card>
      ))}
      <Text style={styles.link} onPress={() => go("A26.S2")}>
        1 pending invitation
      </Text>
    </>
  );
}
function Permissions({ denied }: { denied: boolean }) {
  const request = async () => {
    const loc = await Location.requestForegroundPermissionsAsync();
    await ImagePicker.requestCameraPermissionsAsync();
    if (loc.granted) go("A36");
    else go("A35.S1", true);
  };
  return (
    <>
      <Text style={styles.lead}>
        {denied ? "Location is required to start work" : "Set up FleetSync"}
      </Text>
      <TextBody>
        Location stamps work records. Camera access captures declarations,
        defects and delivery evidence. Notifications carry job changes and
        fatigue reminders.
      </TextBody>
      <Card>
        <Text style={styles.strong}>◎ Location</Text>
        <Muted>Required for clock on and work records</Muted>
      </Card>
      <Card>
        <Text style={styles.strong}>▣ Camera</Text>
        <Muted>Declarations and evidence</Muted>
      </Card>
      {denied ? (
        <>
          <Button
            label="Open Settings"
            onPress={() => Linking.openSettings()}
          />
          <Button
            label="Continue to profile"
            tone="secondary"
            onPress={() => go("A36")}
          />
        </>
      ) : (
        <Button label="Continue" onPress={request} />
      )}
    </>
  );
}
function ProfileSetup() {
  const [licence, setLicence] = useState("642118");
  const [mobile, setMobile] = useState("0412 555 019");
  return (
    <>
      <Field label="Licence number" value={licence} onChangeText={setLicence} />
      <Field label="Licence class" value="MC" editable={false} />
      <Field label="Licence expiry" value="14 March 2029" editable={false} />
      <Field
        label="Mobile"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
      />
      <Field label="Emergency contact" value="Kate Whitmore" />
      <Button
        label="Save and continue"
        onPress={() => router.replace("/dashboard")}
      />
    </>
  );
}
function ShiftState({ id }: { id: string }) {
  const state = useAppState();
  if (id === "A27.M4") return <CompanyPicker />;
  if (id === "A27.M5")
    return (
      <Notice
        tone="warn"
        title="Clock off before switching"
        text="Records cannot move between operators during an active shift."
        action="Clock off first"
        next="A27.M2"
      />
    );
  if (id === "A27.M3")
    return (
      <Notice
        title="Looking for work"
        text="In Phase 1 this preference is stored on this device and is not sent to your operator."
        action="Got it"
        next="A27.S1"
      />
    );
  if (id === "A27.M2") return <ShiftSummary />;
  if (id === "A27.M1")
    return (
      <>
        <Card>
          <Text style={styles.strong}>Record this shift start?</Text>
          <Text style={styles.metric}>06:12</Text>
          <Muted>Lavernton VIC · GPS accuracy 14 m</Muted>
        </Card>
        <Button
          label="Confirm clock on"
          onPress={async () => {
            await recordOfflineFirst("shift", "today", "clock_on", {});
            state.setShift("clocked_on");
            state.refreshQueue();
            go("A3", true);
          }}
        />
      </>
    );
  return (
    <Notice
      title={id === "A27.S2" ? "You are on break" : "Shift status"}
      text={
        id === "A27.S3"
          ? "No work is currently allocated. You can start unscheduled work or message the allocator."
          : "Your shift is active and available on the dashboard."
      }
      action="Back to dashboard"
      next="dashboard"
    />
  );
}
function ShiftGates() {
  const state = useAppState();
  const unlocked = state.fitForDuty === "passed" && state.preStart === "passed";
  return (
    <>
      <Text style={styles.lead}>Before you start work</Text>
      <Card onPress={() => go("A16")}>
        <View style={styles.row}>
          <Text style={styles.strong}>Fitness for duty</Text>
          <StatusPill
            label={state.fitForDuty === "passed" ? "Passed" : "Required"}
            tone={state.fitForDuty === "passed" ? "good" : "warn"}
          />
        </View>
      </Card>
      <Card onPress={() => go("A14")}>
        <View style={styles.row}>
          <Text style={styles.strong}>Pre-start inspection</Text>
          <StatusPill
            label={state.preStart === "passed" ? "Passed" : "Required"}
            tone={state.preStart === "passed" ? "good" : "warn"}
          />
        </View>
      </Card>
      <Button
        label="Start work"
        disabled={!unlocked}
        onPress={() => go("A28")}
      />
      <Muted>
        Both gates must pass before scheduled or unscheduled work can begin.
      </Muted>
    </>
  );
}
function ShiftSummary() {
  const state = useAppState();
  return (
    <>
      <Text style={styles.lead}>Shift summary</Text>
      <Card>
        <Text style={styles.metric}>10:26</Text>
        <Muted>06:12 to 16:38</Muted>
        <TextBody>5 jobs completed · 624 km</TextBody>
      </Card>
      <Field
        label="Note for tomorrow"
        placeholder="Anything the next driver should know"
        multiline
      />
      <Button
        label="Clock off and finish"
        onPress={async () => {
          await recordOfflineFirst("shift", "today", "clock_off", {});
          state.setShift("clocked_off");
          state.setGate("fitForDuty", "not_started");
          state.setGate("preStart", "not_started");
          state.refreshQueue();
          router.replace("/dashboard");
        }}
      />
    </>
  );
}

function Fitness({ id }: { id: string }) {
  const state = useAppState();
  const [answers, setAnswers] = useState([true, true, true, true, true, true]);
  if (id === "A16.M1")
    return (
      <Notice
        title="About continuous rest"
        text="Continuous rest means an unbroken period away from work, including no loading, paperwork or yard duties."
        action="Got it"
        next="A16"
      />
    );
  if (id === "A16.S2")
    return (
      <Notice
        tone="bad"
        title="You cannot start this shift"
        text="An answer falls outside Redgum Freightlines' fitness rule. The allocator can be notified."
        action="Notify allocator"
        next="A16.M2"
      />
    );
  if (id === "A16.M2")
    return (
      <Notice
        tone="good"
        title="Allocator notified"
        text="Kate has received your declaration result and current location."
        action="Back to declaration"
        next="A16"
      />
    );
  if (id === "A16.S3")
    return (
      <Notice
        tone="warn"
        title="Declaration queued"
        text="The captured time, answers, location and photo will send when connected."
        action="Continue"
        next="A14"
      />
    );
  if (id === "A16.S1")
    return (
      <Notice
        tone="good"
        title="Fit for duty passed"
        text="Your signed declaration and photograph have been recorded."
        action="Continue to pre start"
        next="A14"
      />
    );
  return (
    <>
      <Text style={styles.progress}>Question 1 of 6</Text>
      <Card>
        <Text style={styles.lead}>
          Have you had at least 7 hours continuous rest in the last 24 hours?
        </Text>
        <Text onPress={() => go("A16.M1")} style={styles.link}>
          What counts as rest?
        </Text>
        <View style={styles.row}>
          <Button
            label="Yes"
            tone="secondary"
            onPress={() =>
              setAnswers((a) => a.map((_, i) => (i === 0 ? true : _)))
            }
            style={{ flex: 1 }}
          />
          <Button
            label="No"
            tone="secondary"
            onPress={() =>
              setAnswers((a) => a.map((v, i) => (i === 0 ? false : v)))
            }
            style={{ flex: 1 }}
          />
        </View>
      </Card>
      <Card onPress={() => go("A32")}>
        <Text style={styles.strong}>▣ Photograph required</Text>
        <Muted>Stamped with the time and location</Muted>
      </Card>
      <Button
        label="Submit declaration"
        onPress={async () => {
          if (!answers.every(Boolean)) {
            go("A16.S2");
            return;
          }
          await recordOfflineFirst("declaration", "today", "submit", {
            answers,
          });
          state.setGate("fitForDuty", "passed");
          state.refreshQueue();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          go("A16.S1", true);
        }}
      />
    </>
  );
}
function DutyCamera({ id }: { id: string }) {
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  if (id === "A32.S1" || permission?.denied) return <Permissions denied />;
  if (id === "A32.M1")
    return (
      <>
        <View style={styles.photoPlaceholder}>
          <Text style={{ fontSize: 54 }}>✓</Text>
          <Text style={styles.photoText}>Photo captured · 06:18</Text>
          <Muted>Lavernton VIC · accuracy 14 m</Muted>
        </View>
        <Button label="Use photo" onPress={() => go("A16", true)} />
        <Button
          label="Retake"
          tone="secondary"
          onPress={() => go("A32", true)}
        />
      </>
    );
  if (!permission?.granted)
    return (
      <>
        <TextBody>
          Camera permission is needed for the duty declaration photograph.
        </TextBody>
        <Button label="Allow camera" onPress={requestPermission} />
      </>
    );
  return (
    <>
      <View style={styles.camera}>
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="front"
        />
        <View style={styles.faceGuide} />
      </View>
      <Text style={styles.center}>Line your face up inside the guide</Text>
      <Button
        label="Take photo"
        onPress={async () => {
          await camera.current?.takePictureAsync({ quality: 0.75 });
          go("A32.M1");
        }}
      />
    </>
  );
}

function Inspection({ id }: { id: string }) {
  const state = useAppState();
  if (id === "A14.M1")
    return (
      <>
        {vehicles.map((v) => (
          <Card key={v.id} onPress={() => go("A14")}>
            <Text style={styles.strong}>{v.name}</Text>
            <Muted>{v.registration}</Muted>
          </Card>
        ))}
      </>
    );
  if (id === "A14.M2" || id === "A14.M3")
    return (
      <>
        <Card>
          <StatusPill
            label={id.endsWith("M2") ? "Pass" : "Fail"}
            tone={id.endsWith("M2") ? "good" : "bad"}
          />
          <Text style={styles.lead}>Tyres and wheel nuts</Text>
          <Muted>
            Tread depth above 3 mm, no cracks or bulges, no missing nuts.
          </Muted>
          <Field
            label="Comment"
            placeholder="Optional on pass, required on fail"
            multiline
          />
        </Card>
        {id.endsWith("M3") && (
          <Button label="Add defect photograph" onPress={() => go("A14.M4")} />
        )}
        <Button
          label={id.endsWith("M2") ? "Save as pass" : "Continue"}
          onPress={() => go(id.endsWith("M2") ? "A14" : "A14.M5", true)}
        />
      </>
    );
  if (id === "A14.M4" || id === "A15.M1")
    return (
      <Notice
        title="Capture evidence"
        text="Take a clear photograph showing the whole defect and enough context to identify its location."
        action="Use photograph"
        next="A14.M5"
      />
    );
  if (id === "A14.M5")
    return (
      <>
        <Text style={styles.lead}>How severe is the defect?</Text>
        {["Monitor", "Minor", "Blocking"].map((x) => (
          <Card key={x} onPress={() => go(x === "Blocking" ? "A14.S2" : "A14")}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
      </>
    );
  if (id === "A14.S2")
    return (
      <Notice
        tone="bad"
        title="Vehicle locked out"
        text="A blocking defect has been recorded. Do not begin the run in this vehicle."
        action="Report defect"
        next="A15"
      />
    );
  if (id === "A14.S1")
    return (
      <>
        <StatusPill label="18 of 18 checked" tone="good" />
        <Text style={styles.lead}>Review and sign off</Text>
        <Card>
          <Text style={styles.strong}>17 passed · 1 monitor</Text>
          <Muted>Air-line clip reported for workshop review.</Muted>
        </Card>
        <Button
          label="Sign off inspection"
          onPress={async () => {
            await recordOfflineFirst("inspection", "today", "sign_off", {});
            state.setGate("preStart", "passed");
            state.refreshQueue();
            go("A28", true);
          }}
        />
      </>
    );
  if (id.startsWith("A15"))
    return (
      <>
        <Text style={styles.lead}>Report a vehicle defect</Text>
        <Field label="Description" placeholder="Describe the issue" multiline />
        <Button
          label="Add photograph"
          tone="secondary"
          onPress={() => go("A15.M1")}
        />
        <Button label="Submit to workshop" onPress={() => go("A15.M2")} />
      </>
    );
  return (
    <>
      <View style={styles.row}>
        <Text style={styles.progress}>12 of 18 checked</Text>
        <StatusPill label="1 fail" tone="warn" />
      </View>
      <Card onPress={() => go("A14.M1")}>
        <Text style={styles.strong}>Kenworth T610 · 1RG4XT</Text>
        <Muted>Curtainsider · T-4471</Muted>
      </Card>
      {[
        "Lights and indicators",
        "Tyres and wheel nuts",
        "Air lines and couplings",
        "Brakes and air pressure",
      ].map((x, i) => (
        <Card key={x} onPress={() => go(i === 2 ? "A14.M3" : "A14.M2")}>
          <View style={styles.row}>
            <StatusPill
              label={i < 2 ? "Pass" : i === 2 ? "Fail" : "To do"}
              tone={i < 2 ? "good" : i === 2 ? "bad" : "neutral"}
            />
            <Text style={[styles.strong, { flex: 1 }]}>{x}</Text>
            <Text style={styles.chev}>›</Text>
          </View>
        </Card>
      ))}
      <Button label="Review and sign off" onPress={() => go("A14.S1")} />
    </>
  );
}

function StartWork() {
  return (
    <>
      <Text style={styles.lead}>How are you starting work?</Text>
      <Card onPress={() => go("A4")}>
        <Text style={styles.strong}>Scheduled run</Text>
        <Muted>5 stops · 624 km · ready now</Muted>
      </Card>
      <Card onPress={() => go("A29")}>
        <Text style={styles.strong}>Unscheduled work</Text>
        <Muted>Workshop collection, yard duties or relocation</Muted>
      </Card>
      <Text style={styles.link} onPress={() => go("A22.M1")}>
        Not sure? Message the allocator
      </Text>
    </>
  );
}
function Unscheduled({ id }: { id: string }) {
  if (id === "A29.M1")
    return (
      <>
        {[
          "Workshop collection",
          "Yard duties",
          "Customer site",
          "Relocation",
          "Other",
        ].map((x) => (
          <Card key={x} onPress={() => go("A29")}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
      </>
    );
  if (id === "A29.M2")
    return (
      <>
        <View style={styles.map}>
          <Text style={{ fontSize: 46 }}>⌖</Text>
          <Muted>Captured accuracy · 14 m</Muted>
        </View>
        <Button label="Use this location" onPress={() => go("A29")} />
        <Button
          label="Search for an address"
          tone="secondary"
          onPress={() => go("A30.M1")}
        />
      </>
    );
  if (id === "A29.S1")
    return (
      <Notice
        tone="warn"
        title="Offline, location queued"
        text="Work still starts. The original tap time and GPS fix will send in order when connected."
        action="Start work anyway"
        next="A5"
      />
    );
  return (
    <>
      <Card onPress={() => go("A29.M1")}>
        <Text style={styles.strong}>Workshop collection</Text>
        <Muted>Reason</Muted>
      </Card>
      <Card onPress={() => go("A29.M2")}>
        <Text style={styles.strong}>⌖ Captured location</Text>
        <Muted>Lavernton VIC · 14 m</Muted>
      </Card>
      <Field label="Odometer" value="642118" keyboardType="number-pad" />
      <Field label="Your note" placeholder="Optional" multiline />
      <Button
        label="Start work"
        onPress={async () => {
          await recordOfflineFirst("work", "unscheduled", "start", {
            reason: "workshop",
          });
          go("A5", true);
        }}
      />
    </>
  );
}
function CreateJob({ id }: { id: string }) {
  if (id === "A30.M1")
    return (
      <>
        <Field label="Search" placeholder="Address or business" autoFocus />
        <Card onPress={() => go("A30")}>
          <Text style={styles.strong}>Coastline Grocers</Text>
          <Muted>16 McKoy Street, Wodonga VIC</Muted>
        </Card>
        <Button
          label="Use my location"
          tone="secondary"
          onPress={() => go("A30.M2")}
        />
      </>
    );
  if (id === "A30.M2")
    return (
      <Notice
        title="Use your current location?"
        text="The captured pin can be adjusted before the job is saved."
        action="Use location"
        next="A30"
      />
    );
  if (id === "A30.S1")
    return (
      <Notice
        tone="good"
        title="Job saved"
        text="The allocator has been notified and the new job is on today's run."
        action="View job"
        next="A5"
      />
    );
  return (
    <>
      <Field label="Site name" placeholder="Business or location" />
      <Field
        label="Pickup address"
        placeholder="Search address"
        onFocus={() => go("A30.M1")}
      />
      <Field
        label="Delivery address"
        placeholder="Search address"
        onFocus={() => go("A30.M1")}
      />
      <Field label="Planned time" value="14:30" />
      <Field label="Load description" placeholder="Optional" multiline />
      <Field label="Reference" placeholder="Optional" />
      <Button label="Save job" onPress={() => go("A30.S1")} />
    </>
  );
}

function RunSheet({ id }: { id: string }) {
  if (id === "A4.S1")
    return (
      <Notice
        title="No run allocated"
        text="There is no scheduled run today. You can start unscheduled work or create a job."
        action="Start unscheduled work"
        next="A29"
      />
    );
  if (id === "A4.S2")
    return (
      <>
        <StatusPill label="Offline · cached run" tone="warn" />
        <TextBody>
          Your last complete run remains available. Status changes will queue.
        </TextBody>
        <RunJobs />
      </>
    );
  if (id === "A4.M1")
    return (
      <>
        <Button label="Open job" onPress={() => go("A5")} />
        <Button
          label="Mark arrived"
          tone="secondary"
          onPress={() => go("A8")}
        />
        <Button
          label="Report problem"
          tone="danger"
          onPress={() => go("A11")}
        />
      </>
    );
  return (
    <>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.lead}>Today’s run</Text>
          <Muted>Wednesday 8 July · 5 stops · 624 km</Muted>
        </View>
        <Button label="Add a job" tone="secondary" onPress={() => go("A30")} />
      </View>
      <RunJobs />
    </>
  );
}
function RunJobs() {
  return (
    <>
      {jobs.map((j, i) => (
        <Card key={j.id} onPress={() => go("A5")}>
          <View style={styles.row}>
            <View style={styles.stop}>
              <Text style={styles.stopText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.strong}>{j.name}</Text>
              <Muted>
                {j.address} · {j.pallets} pallets
              </Muted>
            </View>
            <StatusPill
              label={j.status}
              tone={
                j.status === "Done"
                  ? "good"
                  : j.status === "Next"
                    ? "warn"
                    : "neutral"
              }
            />
          </View>
        </Card>
      ))}
    </>
  );
}
function NavigationFeature({ id }: { id: string }) {
  if (id === "A6.M1")
    return (
      <Notice
        tone="warn"
        title="Restriction ahead"
        text="Low bridge 4.3 m on the current route. Your configured vehicle is 4.6 m."
        action="View reroute options"
        next="A6.M2"
      />
    );
  if (id === "A6.M2")
    return (
      <>
        {[
          "Avoid low bridge · +8 min",
          "Return to approved route · +12 min",
        ].map((x) => (
          <Card key={x} onPress={() => go("A6")}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
      </>
    );
  if (id === "A7" || id === "A7.M1")
    return (
      <>
        <Text style={styles.lead}>Optimised stop order</Text>
        <RunJobs />
        <Button label="Accept optimised order" onPress={() => go("A4")} />
      </>
    );
  return (
    <>
      <View style={styles.map}>
        <Text style={{ fontSize: 52 }}>➤</Text>
        <Text style={styles.strong}>Hume Freeway · 41 km</Text>
        <Muted>ETA 08:44 · Heavy vehicle route</Muted>
      </View>
      <Card onPress={() => go("A6.M1")}>
        <StatusPill label="Route checked" tone="good" />
        <Text style={styles.strong}>Vehicle profile: Kenworth T610</Text>
      </Card>
      <Button
        label="Share live ETA"
        tone="secondary"
        onPress={() => go("A18")}
      />
    </>
  );
}

function JobDetail({ id }: { id: string }) {
  if (id === "A5.M1")
    return (
      <>
        <StatusPill label="Pre start passed 06:24" tone="good" />
        <Card>
          <Text style={styles.strong}>Tyres and wheel nuts</Text>
          <StatusPill label="Pass" tone="good" />
        </Card>
        <Card>
          <Text style={styles.strong}>Air-line clip</Text>
          <StatusPill label="Monitor" tone="warn" />
          <Muted>Flagged for workshop</Muted>
        </Card>
      </>
    );
  if (id === "A5.M2")
    return (
      <>
        {["Marie Doyle · Receiving", "Kate Ryan · Allocator"].map((x) => (
          <Card key={x}>
            <Text style={styles.strong}>{x}</Text>
            <Button
              label="Call"
              onPress={() => Linking.openURL("tel:0399346129")}
            />
          </Card>
        ))}
      </>
    );
  if (id === "A5.M3")
    return (
      <>
        <Card>
          <Text style={styles.strong}>Delivery instructions.pdf</Text>
          <Muted>248 KB · available offline</Muted>
        </Card>
        <Card>
          <Text style={styles.strong}>Dangerous goods manifest.pdf</Text>
          <Muted>1.1 MB</Muted>
        </Card>
      </>
    );
  return (
    <>
      <Text style={styles.lead}>Coastline Grocers</Text>
      <Muted>16 McKoy Street, Wodonga VIC · Booked 10:30</Muted>
      <Card onPress={() => go("A5.M1")}>
        <StatusPill label="Pre start passed 06:24" tone="good" />
        <Text style={styles.strong}>Job-level vehicle checks</Text>
      </Card>
      <Card onPress={() => go("A31")}>
        <Text style={styles.strong}>Comments and handover</Text>
        <StatusPill label="2 unread" tone="bad" />
      </Card>
      <Card>
        <TextBody>Consignment: CN-48213</TextBody>
        <TextBody>Pallets: 22 dry goods</TextBody>
        <TextBody>Priority: Today</TextBody>
      </Card>
      <View style={styles.row}>
        <Button
          label="Call site"
          tone="secondary"
          onPress={() => go("A5.M2")}
          style={{ flex: 1 }}
        />
        <Button
          label="Documents"
          tone="secondary"
          onPress={() => go("A5.M3")}
          style={{ flex: 1 }}
        />
      </View>
      <Button label="Proof of delivery" onPress={() => go("A9")} />
      <Button label="Change status" tone="secondary" onPress={() => go("A8")} />
    </>
  );
}
function Comments({ id }: { id: string }) {
  const [comment, setComment] = useState("");
  if (id === "A31.S1")
    return (
      <Notice
        title="No comments yet"
        text="Write the first handover note for this job."
        action="Write a comment"
        next="A31.M1"
      />
    );
  if (id === "A31.M1")
    return (
      <>
        <Field
          label="Comment"
          value={comment}
          onChangeText={setComment}
          placeholder="Add a note for the next driver"
          multiline
          maxLength={500}
        />
        <Muted>{comment.length} / 500 · up to 4 photos</Muted>
        <Button
          label="Attach photo"
          tone="secondary"
          onPress={() => go("A14.M4")}
        />
        <Setting label="Visible to allocator" value onValueChange={() => {}} />
        <Button
          label="Post comment"
          disabled={!comment.trim()}
          onPress={async () => {
            await recordOfflineFirst("comment", "job_2", "create", {
              body: comment,
            });
            go("A31");
          }}
        />
      </>
    );
  return (
    <>
      <Card>
        <Text style={styles.strong}>Kate Ryan · Allocator</Text>
        <Muted>Today 08:02</Muted>
        <TextBody>
          Use loading dock 3. Call Marie ten minutes before arrival.
        </TextBody>
      </Card>
      <Card>
        <Text style={styles.strong}>Tom Reed · Driver</Text>
        <Muted>Yesterday 16:44</Muted>
        <TextBody>
          Air-line clip is loose. Tightened for now; workshop has been notified.
        </TextBody>
      </Card>
      <Button label="Add comment" onPress={() => go("A31.M1")} />
    </>
  );
}
function JobStatus({ id }: { id: string }) {
  if (id === "A8.S1")
    return (
      <Notice
        tone="warn"
        title="Status queued offline"
        text="The original tap time and location are retained."
        action="Back to job"
        next="A5"
      />
    );
  if (id === "A8.M1")
    return (
      <Notice
        title="Mark job en route?"
        text="This will record the current time and GPS location."
        action="Confirm status"
        next="A5"
      />
    );
  return (
    <>
      <Text style={styles.lead}>Change job status</Text>
      {["En route", "Arrived", "Loading", "Completed"].map((x) => (
        <Card
          key={x}
          onPress={async () => {
            await recordOfflineFirst("job", "job_2", "status", { status: x });
            go("A8.M1");
          }}
        >
          <Text style={styles.strong}>{x}</Text>
        </Card>
      ))}
    </>
  );
}
function Scanner({ id }: { id: string }) {
  const [scanned, setScanned] = useState(false);
  if (id === "A10.M1")
    return (
      <Notice
        tone="bad"
        title="Already scanned"
        text="PLT-48213-15 is already on this consignment."
        action="Scan another"
        next="A10"
      />
    );
  if (id === "A10.M2")
    return (
      <SimpleForm
        text="Type the pallet label exactly as printed and choose why scanning was not possible."
        label="Pallet label"
        button="Add this pallet"
        next="A10"
      />
    );
  return (
    <>
      <View style={styles.camera}>
        <CameraView
          style={StyleSheet.absoluteFill}
          barcodeScannerSettings={{ barcodeTypes: ["qr", "code128", "ean13"] }}
          onBarcodeScanned={
            scanned
              ? undefined
              : () => {
                  setScanned(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
          }
        />
        <View style={styles.scanGuide} />
      </View>
      <Text style={styles.center}>
        {scanned
          ? "Pallet accepted · 22 of 22"
          : "Point the camera at a pallet label"}
      </Text>
      <Button
        label="Type it in"
        tone="secondary"
        onPress={() => go("A10.M2")}
      />
    </>
  );
}

function Proof({ id }: { id: string }) {
  const [name, setName] = useState("Marie Doyle");
  if (id === "A9.M1")
    return (
      <>
        <View style={styles.signature}>
          <Text style={{ fontSize: 52, fontStyle: "italic" }}>〜Dave</Text>
        </View>
        <Button label="Use this signature" onPress={() => go("A9")} />
      </>
    );
  if (id === "A9.M2")
    return (
      <Notice
        title="Photograph the goods"
        text="Capture the delivered goods and enough surroundings to identify the delivery location."
        action="Use photograph"
        next="A9"
      />
    );
  if (id === "A9.M3")
    return (
      <SimpleForm
        text="Optional handover note for the office and next driver."
        label="Closing comment"
        button="Save comment"
        next="A9"
        multiline
      />
    );
  if (id === "A9.S1")
    return (
      <Notice
        tone="warn"
        title="Proof queued offline"
        text="Receiver, signature, photographs, time and location will send together."
        action="Back to run"
        next="A4"
      />
    );
  return (
    <>
      <Card onPress={() => go("A10")}>
        <Text style={styles.strong}>22 of 22 pallets</Text>
        <StatusPill label="Complete" tone="good" />
      </Card>
      <Field label="Who took it?" value={name} onChangeText={setName} />
      <Card onPress={() => go("A9.M1")}>
        <Text style={styles.strong}>Receiver signature</Text>
        <Muted>Tap to sign</Muted>
      </Card>
      <Button
        label="Add photograph"
        tone="secondary"
        onPress={() => go("A9.M2")}
      />
      <Button
        label="Add a closing comment"
        tone="secondary"
        onPress={() => go("A9.M3")}
      />
      <Button
        label="Finish the delivery"
        onPress={async () => {
          await recordOfflineFirst("proof", "job_2", "submit", {
            receiver: name,
            pallets: 22,
          });
          go("A9.S1", true);
        }}
      />
    </>
  );
}
function FailedDelivery({ id }: { id: string }) {
  if (id === "A11.M1")
    return (
      <>
        {[
          "Site closed",
          "Receiver refused",
          "Access blocked",
          "Damaged goods",
          "Other",
        ].map((x) => (
          <Card key={x} onPress={() => go("A11")}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
      </>
    );
  if (id === "A11.M2")
    return (
      <Notice
        title="Photograph evidence"
        text="At least one photograph is required for an unsuccessful delivery."
        action="Use photograph"
        next="A11"
      />
    );
  return (
    <>
      <Card onPress={() => go("A11.M1")}>
        <Text style={styles.strong}>Choose a reason</Text>
      </Card>
      <Field
        label="What happened?"
        placeholder="Add useful details"
        multiline
      />
      <Button label="Add photograph" onPress={() => go("A11.M2")} />
      <Button
        label="Submit unsuccessful delivery"
        tone="danger"
        onPress={() => go("A4")}
      />
    </>
  );
}

function Hours({ id }: { id: string }) {
  const state = useAppState();
  if (id === "A21.M1")
    return (
      <>
        <Text style={styles.lead}>How long a break?</Text>
        {["15 minutes", "30 minutes", "1 hour", "Open ended"].map((x) => (
          <Card key={x}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
        <Button
          label="Start the break"
          onPress={() => {
            state.setShift("on_break");
            go("A27.S2", true);
          }}
        />
      </>
    );
  if (id === "A21.M2")
    return (
      <>
        <StatusPill label="30 minutes rest" tone="good" />
        <Text style={styles.metric}>0:30</Text>
        <Button
          label="Back on duty"
          onPress={() => {
            state.setShift("clocked_on");
            router.replace("/dashboard");
          }}
        />
      </>
    );
  if (id === "A12.M1")
    return (
      <Notice
        tone="warn"
        title="Break due soon"
        text="Plan a safe place to stop. Your work diary remains the authoritative record."
        action="View work diary"
        next="A13"
      />
    );
  if (id === "A12.M2")
    return (
      <Notice
        tone="bad"
        title="Potential breach"
        text="Review your duty status and stop safely if required."
        action="Open work diary"
        next="A13"
      />
    );
  if (id.startsWith("A13"))
    return (
      <>
        <Text style={styles.lead}>Electronic work diary</Text>
        {["06:12 · Work", "10:30 · Rest", "11:05 · Work", "16:38 · Rest"].map(
          (x) => (
            <Card key={x}>
              <Text style={styles.strong}>{x}</Text>
            </Card>
          ),
        )}
        <Button label="Change duty status" onPress={() => go("A13.M1")} />
        <Button
          label="Request correction"
          tone="secondary"
          onPress={() => go("A13.M2")}
        />
      </>
    );
  return (
    <>
      <Card>
        <Text style={styles.metric}>10:30</Text>
        <Muted>This shift · illustrative, not a compliance calculation</Muted>
      </Card>
      <Card>
        <Text style={styles.metric}>41:50</Text>
        <Muted>This week · Mon to Sun</Muted>
      </Card>
      <Button label="Take a break" onPress={() => go("A21.M1")} />
    </>
  );
}
function Incident({ id }: { id: string }) {
  if (id === "A17.M1")
    return (
      <>
        {[
          "Injury",
          "Vehicle damage",
          "Near miss",
          "Environmental",
          "Security",
        ].map((x) => (
          <Card key={x} onPress={() => go("A17")}>
            <Text style={styles.strong}>{x}</Text>
          </Card>
        ))}
      </>
    );
  if (id === "A17.M2")
    return (
      <>
        <Button label="Take photograph" onPress={() => go("A17")} />
        <Field label="Witness name" placeholder="Optional" />
        <Field
          label="Witness phone"
          placeholder="Optional"
          keyboardType="phone-pad"
        />
      </>
    );
  if (id === "A17.S1")
    return (
      <Notice
        tone="good"
        title="Incident submitted"
        text="The allocator and safety contact have been notified."
        action="Done"
        next="A34"
      />
    );
  return (
    <>
      <Card onPress={() => go("A17.M1")}>
        <Text style={styles.strong}>Choose incident type</Text>
      </Card>
      <Field
        label="What happened?"
        placeholder="Describe facts, not assumptions"
        multiline
      />
      <Button
        label="Photographs and witnesses"
        tone="secondary"
        onPress={() => go("A17.M2")}
      />
      <Button label="Submit incident" onPress={() => go("A17.S1")} />
    </>
  );
}
function Fuel({ id }: { id: string }) {
  if (id === "A19.M2")
    return (
      <Notice
        title="Capture receipt"
        text="Keep the whole receipt inside the frame and make totals readable."
        action="Use receipt"
        next="A19.M1"
      />
    );
  if (id === "A19.M1")
    return (
      <>
        <Field label="Litres" value="420.6" keyboardType="decimal-pad" />
        <Field label="Total" value="$812.44" keyboardType="decimal-pad" />
        <Field label="Odometer" value="642486" keyboardType="number-pad" />
        <Button
          label="Capture receipt"
          tone="secondary"
          onPress={() => go("A19.M2")}
        />
        <Button label="Save fuel fill" onPress={() => go("A19")} />
      </>
    );
  return (
    <>
      <Card>
        <Text style={styles.strong}>Today · Lavernton Fuel</Text>
        <Text style={styles.metric}>420.6 L</Text>
        <Muted>$812.44 · receipt attached</Muted>
      </Card>
      <Button label="Add fuel fill" onPress={() => go("A19.M1")} />
    </>
  );
}
function Odometer({ id }: { id: string }) {
  if (id === "A20.M1")
    return (
      <Notice
        tone="good"
        title="Telematics reading available"
        text="642,118 km was received from vehicle 1RG4XT."
        action="Use reading"
        next="A20"
      />
    );
  if (id === "A20.M2")
    return (
      <SimpleForm
        text="A manual reading outside the expected range requires a reason."
        label="Override reason"
        button="Save correction"
        next="A20"
        multiline
      />
    );
  return (
    <>
      <Field label="Odometer" value="642118" keyboardType="number-pad" />
      <Field label="Engine hours" value="12684.2" keyboardType="decimal-pad" />
      <Button label="Use telematics reading" onPress={() => go("A20.M1")} />
      <Button
        label="Enter manually"
        tone="secondary"
        onPress={() => go("A20.M2")}
      />
    </>
  );
}
function Messages({ id }: { id: string }) {
  if (id === "A22.M1")
    return (
      <SimpleForm
        text="Send a message to the allocator for the active operator."
        label="Message"
        button="Send message"
        next="A22"
        multiline
      />
    );
  return (
    <>
      <Card onPress={() => go("A22.M1")}>
        <Text style={styles.strong}>Kate Ryan · Allocator</Text>
        <Muted>08:42 · 2 unread</Muted>
        <TextBody>Dock 3 is ready. Call Marie ten minutes out.</TextBody>
      </Card>
      <Card>
        <Text style={styles.strong}>Operations</Text>
        <Muted>Yesterday 16:10</Muted>
        <TextBody>Tomorrow’s vehicle allocation is now available.</TextBody>
      </Card>
      <Button label="New message" onPress={() => go("A22.M1")} />
    </>
  );
}
function Wallet({ id }: { id: string }) {
  if (id.endsWith(".M1"))
    return (
      <>
        <Card>
          <Text style={styles.strong}>Heavy combination licence</Text>
          <TextBody>NSW 642118 · Class MC</TextBody>
          <TextBody>Expires 14 March 2029</TextBody>
          <StatusPill label="Verified" tone="good" />
        </Card>
      </>
    );
  if (id.endsWith(".S1"))
    return (
      <Notice
        tone="warn"
        title="Document expiring soon"
        text="Your dangerous goods accreditation expires in 30 days."
        action="View document"
        next={id.startsWith("A23") ? "A23.M1" : "A25.M1"}
      />
    );
  return (
    <>
      <Card onPress={() => go(id.startsWith("A23") ? "A23.M1" : "A25.M1")}>
        <Text style={styles.strong}>
          {id.startsWith("A23")
            ? "Dangerous goods certificate"
            : "Heavy combination licence"}
        </Text>
        <Muted>Expires 14 March 2029</Muted>
        <StatusPill label="Current" tone="good" />
      </Card>
      <Card>
        <Text style={styles.strong}>Medical assessment</Text>
        <Muted>Expires 8 July 2027</Muted>
        <StatusPill label="Current" tone="good" />
      </Card>
    </>
  );
}
function SyncQueue() {
  const state = useAppState();
  return (
    <>
      <StatusPill
        label={`${state.queuedWrites} queued`}
        tone={state.queuedWrites ? "warn" : "good"}
      />
      <TextBody>
        Writes are stored locally with their original time and location, then
        sent in order with retry backoff.
      </TextBody>
      {[
        "Clock on · 06:12",
        "Fit for duty · 06:18",
        "Pre-start sign off · 06:31",
      ]
        .slice(0, state.queuedWrites || 0)
        .map((x) => (
          <Card key={x}>
            <Text style={styles.strong}>{x}</Text>
            <StatusPill label="Queued" tone="warn" />
          </Card>
        ))}
      {state.queuedWrites === 0 && (
        <Card>
          <Text style={styles.strong}>Everything is synced</Text>
        </Card>
      )}
    </>
  );
}
function Profile({ id }: { id: string }) {
  const state = useAppState();
  if (id === "A34.M1")
    return (
      <>
        <CompanyPicker />
        <Button label="Switch company for today" onPress={() => go("A27.M4")} />
      </>
    );
  if (id === "A34.M2")
    return (
      <>
        <Setting label="A new job for me" value onValueChange={() => {}} />
        <Setting label="A job of mine changed" value onValueChange={() => {}} />
        <Setting
          label="Messages from the office"
          value
          onValueChange={() => {}}
        />
        <Setting
          label="Break falling due"
          value
          onValueChange={() => {}}
          disabled
        />
        <Setting label="A licence expiring" value onValueChange={() => {}} />
      </>
    );
  if (id === "A34.M3")
    return (
      <>
        <Text style={styles.lead}>Sign out of FleetSync?</Text>
        <Muted>Queued records must be sent before signing out.</Muted>
        <Button
          label="Sign out"
          tone="danger"
          disabled={state.queuedWrites > 0}
          onPress={async () => {
            await state.reset();
            router.replace("/screen/A2");
          }}
        />
        <Button label="Cancel" tone="secondary" onPress={() => router.back()} />
      </>
    );
  return (
    <>
      <Card onPress={() => go("A36")}>
        <Text style={styles.strong}>Dave Whitmore</Text>
        <Muted>MC licence · NSW 642118</Muted>
      </Card>
      <Card onPress={() => go("A34.M1")}>
        <Text style={styles.strong}>My companies</Text>
        <Muted>Redgum Freightlines · Barwon Fuel Haulage</Muted>
      </Card>
      <View style={styles.grid}>
        {[
          ["Work diary", "A13"],
          ["My licence", "A25"],
          ["Documents", "A23"],
          ["Fuel", "A19"],
          ["Odometer", "A20"],
          ["Incidents", "A17"],
        ].map(([x, d]) => (
          <Pressable key={x} onPress={() => go(d)} style={styles.gridTile}>
            <Text style={styles.strong}>{x}</Text>
          </Pressable>
        ))}
      </View>
      <Card onPress={() => go("A34.M2")}>
        <Text style={styles.strong}>Notifications</Text>
      </Card>
      <Card onPress={() => go("A24")}>
        <Text style={styles.strong}>Offline sync</Text>
        <StatusPill
          label={`${state.queuedWrites} queued`}
          tone={state.queuedWrites ? "warn" : "good"}
        />
      </Card>
      <Button label="Sign out" tone="secondary" onPress={() => go("A34.M3")} />
      <Text style={styles.link} onPress={() => go("A1.S1")}>
        Open complete screen register ({screens.length})
      </Text>
    </>
  );
}

function RegistryFallback({ id }: { id: string }) {
  return (
    <>
      <Card>
        <Text style={styles.strong}>Implemented document state</Text>
        <TextBody>
          This artboard is registered with its document ID, navigation shell,
          design tokens and accessible layout.
        </TextBody>
      </Card>
      <Muted>
        Use the screen register below to inspect every documented artboard.
      </Muted>
      {screens.map((x) => (
        <Pressable
          key={x.id}
          onPress={() => go(x.id, true)}
          style={styles.registryRow}
        >
          <Text style={styles.id}>{x.id}</Text>
          <Text style={[styles.body, { flex: 1 }]}>{x.title}</Text>
        </Pressable>
      ))}
    </>
  );
}
function Notice({
  title,
  text,
  action,
  next,
  tone = "neutral",
}: {
  title: string;
  text: string;
  action: string;
  next: string;
  tone?: "good" | "warn" | "bad" | "neutral";
}) {
  return (
    <>
      <StatusPill
        label={
          tone === "good"
            ? "Completed"
            : tone === "warn"
              ? "Attention"
              : tone === "bad"
                ? "Action required"
                : "FleetSync"
        }
        tone={tone}
      />
      <Text style={styles.lead}>{title}</Text>
      <TextBody>{text}</TextBody>
      <Button
        label={action}
        tone={tone === "bad" ? "danger" : "primary"}
        onPress={() =>
          next === "dashboard" ? router.replace("/dashboard") : go(next, true)
        }
      />
    </>
  );
}
function SimpleForm({
  text,
  label,
  button,
  next,
  multiline,
}: {
  text: string;
  label: string;
  button: string;
  next: string;
  multiline?: boolean;
}) {
  const [value, setValue] = useState("");
  return (
    <>
      <TextBody>{text}</TextBody>
      <Field
        label={label}
        value={value}
        onChangeText={setValue}
        multiline={multiline}
      />
      <Button
        label={button}
        disabled={!value.trim()}
        onPress={() => go(next, true)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.fleetNavy,
    marginTop: spacing.xl,
  },
  lead: { fontSize: 22, lineHeight: 28, fontWeight: "700", color: colors.ink },
  body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  strong: { fontSize: 16, fontWeight: "700", color: colors.ink },
  muted: { fontSize: 13, lineHeight: 19, color: colors.muted },
  link: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.actionBlue,
    paddingVertical: spacing.xs,
  },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  operator: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  operatorText: { color: "#fff", fontWeight: "900" },
  chev: { fontSize: 30, color: colors.muted },
  metric: {
    fontSize: 34,
    fontWeight: "800",
    fontFamily: "monospace",
    color: colors.ink,
  },
  progress: { fontSize: 13, fontWeight: "700", color: colors.muted },
  camera: {
    height: 390,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.fleetNavy,
  },
  faceGuide: {
    position: "absolute",
    width: 220,
    height: 280,
    borderRadius: 120,
    borderWidth: 3,
    borderStyle: "dashed",
    borderColor: colors.amber,
    alignSelf: "center",
    top: 48,
  },
  scanGuide: {
    position: "absolute",
    left: 32,
    right: 32,
    top: 110,
    height: 150,
    borderWidth: 3,
    borderColor: colors.amber,
    borderRadius: 16,
  },
  center: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  photoPlaceholder: {
    height: 390,
    borderRadius: 24,
    backgroundColor: colors.midNavy,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoText: { color: "#fff", fontWeight: "700" },
  map: {
    height: 300,
    borderRadius: 24,
    backgroundColor: "#DDEAF0",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stop: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.fleetNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  stopText: { color: "#fff", fontWeight: "700" },
  signature: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  gridTile: {
    width: "47%",
    minHeight: 88,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
  },
  registryRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  id: { fontFamily: "monospace", color: colors.actionBlue, minWidth: 64 },
});
