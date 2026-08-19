import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  if (id === "A37") return <AccountCreationStandalone />;
  if (id === "A38") return <YourFileStandalone />;
  if (id === "A38.C") return <ComplianceStandalone />;
  if (id === "A38.S") return <ShareFileStandalone />;
  if (["A38.L", "A38.M", "A38.F", "A38.D", "A38.V", "A38.T"].includes(id))
    return <DocumentDetailStandalone id={id} />;
  if (id === "A26") return <CompanyTodayStandalone />;
  if (id === "A26.A") return <AddCompanyStandalone />;
  if (id === "A26.L") return <CompanyLinkedStandalone />;
  if (id === "A26.LI") return <CompanyLinkedStandalone showAcceptedPopup />;
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
  const [signInAttempted, setSignInAttempted] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  return (
    <SafeAreaView style={signInStyles.safe}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={signInStyles.content}
      >
        <View style={signInStyles.mark} accessibilityLabel="FleetSync">
          <View style={[signInStyles.markLine, signInStyles.markLineShort]} />
          <View style={[signInStyles.markLine, signInStyles.markLineMiddle]} />
          <View style={[signInStyles.markLine, signInStyles.markLineAmber]} />
        </View>
        <View style={signInStyles.intro}>
          <Text style={signInStyles.title}>Sign in to start your shift</Text>
          <Text style={signInStyles.subtitle}>Wednesday 8 July 2026</Text>
        </View>
        <View style={signInStyles.form}>
          <View style={signInStyles.field}>
            <Text style={signInStyles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              style={[signInStyles.input, signInAttempted && !email.trim() && signInStyles.inputError]}
            />
            {signInAttempted && !email.trim() && <Text style={signInStyles.errorText}>Please enter your email</Text>}
          </View>
          <View style={signInStyles.field}>
            <Text style={signInStyles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              autoComplete="current-password"
              style={[signInStyles.input, signInAttempted && !password.trim() && signInStyles.inputError]}
            />
            {signInAttempted && !password.trim() && <Text style={signInStyles.errorText}>Please enter your password</Text>}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            onPress={() => {
              if (!email.trim() || !password.trim()) {
                setSignInAttempted(true);
                return;
              }
              go("A26", true);
            }}
            style={({ pressed }) => [
              signInStyles.signInButton,
              pressed ? signInStyles.pressed : null,
            ]}
          >
            <Text style={signInStyles.signInButtonText}>Sign in</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setResetOpen(true)}
            style={signInStyles.forgot}
          >
            <Text style={signInStyles.forgotText}>Forgot password</Text>
          </Pressable>
          <View style={signInStyles.dividerRow}>
            <View style={signInStyles.divider} />
            <Text style={signInStyles.dividerText}>New to FleetSync</Text>
            <View style={signInStyles.divider} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Create an account"
            onPress={() => go("A37")}
            style={({ pressed }) => [
              signInStyles.createButton,
              pressed && signInStyles.pressed,
            ]}
          >
            <Text style={signInStyles.createButtonText}>Create an account</Text>
          </Pressable>
        </View>
        <Text style={signInStyles.version}>
          Version 4.2.0 · Redgum Freightlines and 1 other operator
        </Text>
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
          <View style={[signInStyles.sheet, resetSent && signInStyles.successSheet]}>
            <View style={signInStyles.handle} />
            {!resetSent && <View style={signInStyles.sheetTitleRow}><Text style={signInStyles.sheetTitle}>Forgot password</Text><Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => { setResetOpen(false); setResetSent(false); }} style={signInStyles.closeButton}><Text style={signInStyles.closeText}>×</Text></Pressable></View>}
            {resetSent ? (
              <>
                <View style={signInStyles.resetSuccessIcon}><Text style={signInStyles.resetSuccessCheck}>✓</Text></View>
                <Text style={signInStyles.resetSuccessTitle}>Check your email</Text>
                <Text style={signInStyles.resetSuccessText}>We sent a link to {resetEmail}. It{`\n`}stays valid for 30 minutes.</Text>
                <Button
                  label="Back to sign in"
                  onPress={() => {
                    setResetOpen(false);
                    setResetSent(false);
                  }}
                />
              </>
            ) : (
              <>
                <Text style={signInStyles.sheetSubtitle}>
                  We will send a reset link to the address your operator has on file.
                </Text>
                <Field
                  label="Email"
                  labelStyle={signInStyles.fieldLabel}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="Enter your email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Button
                  label="Send reset link"
                  disabled={!resetEmail.trim()}
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

function AccountFieldInput({
    label,
    value,
    onChangeText,
    placeholder,
    style,
    keyboardType,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    style?: object;
    keyboardType?: "default" | "phone-pad";
  }) {
  return (
    <View style={[accountStyles.field, style]}>
      <Text style={accountStyles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        keyboardType={keyboardType}
        style={accountStyles.input}
      />
    </View>
  );
}

function AccountCreationStandalone() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [licence, setLicence] = useState("");
  const [licenceClass, setLicenceClass] = useState("");
  const [state, setState] = useState("");

  return (
    <SafeAreaView style={accountStyles.safe} edges={["top", "left", "right"]}>
      <View style={accountStyles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          onPress={() => router.back()}
          style={accountStyles.backButton}
        >
          <Text style={accountStyles.back}>‹</Text>
        </Pressable>
        <View>
          <Text style={accountStyles.title}>Create an account</Text>
          <Text style={accountStyles.subtitle}>Yours, not an operator's</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={accountStyles.content} keyboardShouldPersistTaps="handled">
        <View style={accountStyles.notice}>
          <Text style={accountStyles.noticeIcon}>i</Text>
          <Text style={accountStyles.noticeText}>
            Your account and your documents belong to you. Operators are added afterwards, one at a time, and each only sees what you allow.
          </Text>
        </View>
        <AccountFieldInput label="Full name" value={name} onChangeText={setName} placeholder="Enter your full name" />
        <AccountFieldInput label="Mobile" value={mobile} onChangeText={setMobile} placeholder="Enter your mobile number" keyboardType="phone-pad" />
        <AccountFieldInput label="Email" value={email} onChangeText={setEmail} placeholder="Enter your email" />
        <View style={accountStyles.licenceRow}>
          <AccountFieldInput label="Licence number" value={licence} onChangeText={setLicence} placeholder="Enter number" style={accountStyles.licenceNumber} />
          <AccountFieldInput label="Class" value={licenceClass} onChangeText={setLicenceClass} placeholder="e.g. MC" style={accountStyles.licenceClass} />
        </View>
        <AccountFieldInput label="State of issue" value={state} onChangeText={setState} placeholder="Enter state" />
        <Pressable
          accessibilityRole="button"
          disabled={!name.trim() || !mobile.trim() || !email.trim() || !licence.trim() || !licenceClass.trim() || !state.trim()}
          onPress={() => go("A38")}
          style={({ pressed }) => [accountStyles.continue, (!name.trim() || !mobile.trim() || !email.trim() || !licence.trim() || !licenceClass.trim() || !state.trim()) && accountStyles.continueDisabled, pressed && { opacity: 0.8 }]}
        >
          <Text style={accountStyles.continueText}>Continue to your documents</Text>
        </Pressable>
        <Text style={accountStyles.helpText}>
          FleetSync checks your licence against VicRoads before any operator can allocate you work.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const accountStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: {
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backButton: { width: 28, height: 38, justifyContent: "center" },
  back: { color: colors.ink, fontSize: 30, lineHeight: 32, fontWeight: "300" },
  title: { color: colors.ink, fontSize: 22, lineHeight: 25, fontFamily: "BarlowSemiCondensed_700Bold" },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 16 },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 20, gap: 11 },
  notice: {
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#EEF4FC",
  },
  noticeIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.actionBlue,
    color: colors.actionBlue,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
  noticeText: { flex: 1, color: colors.ink, fontSize: 13, lineHeight: 19 },
  field: { gap: 5 },
  label: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase" },
  input: {
    height: 52,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    color: colors.ink,
    fontSize: 16,
  },
  licenceRow: { flexDirection: "row", gap: 10 },
  licenceNumber: { flex: 1 },
  licenceClass: { width: 96 },
  continue: { height: 58, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.actionBlue, marginTop: 2 },
  continueDisabled: { opacity: .42 },
  continueText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  helpText: { color: colors.muted, fontSize: 12, lineHeight: 17, textAlign: "center", paddingHorizontal: 4 },
});

const fileDocuments = [
  ["A38.L", "Heavy vehicle licence, MC", "Expires 1 August 2026", "✓  MATCHED WITH VICROADS", "good"],
  ["A38.M", "NHVR medical certificate", "Valid to 4 February 2027", "✓  CHECKED BY FLEETSYNC", "blue"],
  ["A38.F", "Fatigue accreditation, BFM", "Confirmed by Redgum Freightlines", "✓  CONFIRMED BY EMPLOYER", "good"],
  ["A38.D", "Dangerous goods licence", "Expired 2 July 2026", "EXPIRED", "bad"],
  ["A38.V", "Work rights, VEVO check", "Submitted 6 July, check running", "◷  BEING CHECKED", "warn"],
  ["A38.T", "Tanker safety induction", "Required by Barwon Fuel Haulage, not supplied", "⇧  TAP TO UPLOAD", "outline"],
] as const;

function FileHeader({ title, subtitle, share }: { title: string; subtitle: string; share?: boolean }) {
  return <View style={fileStyles.header}><Pressable onPress={() => router.back()} style={fileStyles.backButton}><Text style={fileStyles.back}>‹</Text></Pressable><View style={fileStyles.headerCopy}><Text style={fileStyles.headerTitle}>{title}</Text><Text style={fileStyles.headerSub}>{subtitle}</Text></View>{share && <Pressable accessibilityRole="button" accessibilityLabel="Share document" style={fileStyles.shareButton}><MaterialIcons name="ios-share" size={25} color="#2563EB" /></Pressable>}</View>;
}

function YourFileStandalone() {
  const [tankerUploadOpen, setTankerUploadOpen] = useState(false);
  return <SafeAreaView style={fileStyles.safe} edges={["top", "left", "right"]}>
    <FileHeader title="Your file" subtitle="3 verified, 1 checking, 1 expired, 1 missing" />
    <ScrollView style={fileStyles.body} contentContainerStyle={fileStyles.fileListContent} showsVerticalScrollIndicator={false}>
      <View style={fileStyles.listCard}>{fileDocuments.map(([id, title, detail, status, tone], index) => <Pressable key={id} onPress={() => id === "A38.T" ? setTankerUploadOpen(true) : go(id)} style={[fileStyles.docRow, index ? fileStyles.docBorder : null]}><View style={{ flex: 1 }}><Text style={fileStyles.docTitle}>{title}</Text><Text style={fileStyles.docDetail}>{detail}</Text><Text style={[fileStyles.pill, fileStyles[`pill${tone[0].toUpperCase()}${tone.slice(1)}` as "pillGood"]]}>{status}</Text></View><Text style={fileStyles.chevron}>›</Text></Pressable>)}</View>
      <Pressable onPress={() => go("A38.C")} style={fileStyles.fileListPrimary}><Text style={fileStyles.primaryText}>Check my compliance</Text></Pressable>
    </ScrollView>
    <DocumentUploadSheet visible={tankerUploadOpen} title="Tanker safety induction" onClose={() => setTankerUploadOpen(false)} />
  </SafeAreaView>;
}

function ComplianceStandalone() {
  const [replaceOpen, setReplaceOpen] = useState(false);
  return <SafeAreaView style={fileStyles.safe} edges={["top", "left", "right"]}>
    <View style={complianceStyles.header}><Pressable onPress={() => router.back()} style={fileStyles.backButton}><Text style={fileStyles.back}>‹</Text></Pressable><View style={fileStyles.headerCopy}><Text style={fileStyles.headerTitle}>My compliance</Text><Text style={fileStyles.headerSub}>Checked 11:41 today</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Compliance help" style={complianceStyles.help}><Text style={complianceStyles.helpText}>?</Text></Pressable></View>
    <ScrollView style={fileStyles.body} contentContainerStyle={complianceStyles.content} showsVerticalScrollIndicator={false}>
      <View style={[complianceStyles.summary, complianceStyles.cleared]}><View style={[complianceStyles.summaryIcon, complianceStyles.clearedIcon]}><Text style={complianceStyles.summaryIconText}>✓</Text></View><View style={fileStyles.flexOne}><Text style={complianceStyles.summaryTitle}>Cleared for general freight</Text><Text style={[complianceStyles.summaryDetail, complianceStyles.clearedText]}>Redgum Freightlines can allocate you work today.</Text></View></View>
      <View style={[complianceStyles.summary, complianceStyles.blocked]}><View style={[complianceStyles.summaryIcon, complianceStyles.blockedIcon]}><Text style={complianceStyles.summaryIconText}>×</Text></View><View style={fileStyles.flexOne}><Text style={complianceStyles.summaryTitle}>Blocked for dangerous{`\n`}goods</Text><Text style={[complianceStyles.summaryDetail, complianceStyles.blockedText]}>Your DG licence expired on 2 July, so tanker work at Barwon Fuel Haulage stays closed.</Text></View></View>
      <View style={complianceStyles.documentCard}>{fileDocuments.map(([id, title, detail], index) => { const tone = index < 3 ? "good" : index === 3 ? "bad" : index === 4 ? "warn" : "upload"; return <Pressable key={id} onPress={() => id === "A38.T" ? go("A38") : go(id)} style={[complianceStyles.documentRow, index > 0 && complianceStyles.documentRule]}><View style={[complianceStyles.rowIcon, tone === "good" ? complianceStyles.rowGood : tone === "bad" ? complianceStyles.rowBad : tone === "warn" ? complianceStyles.rowWarn : complianceStyles.rowUpload]}><Text style={[complianceStyles.rowIconText, tone === "bad" && complianceStyles.rowBadText, tone === "warn" && complianceStyles.rowWarnText, tone === "upload" && complianceStyles.rowUploadText]}>{tone === "good" ? "✓" : tone === "bad" ? "×" : tone === "warn" ? "◷" : "↥"}</Text></View><View style={fileStyles.flexOne}><Text style={complianceStyles.documentTitle}>{title}</Text><Text style={complianceStyles.documentDetail}>{detail}</Text></View><Text style={fileStyles.chevron}>›</Text></Pressable>})}</View>
      <Pressable onPress={() => go("A38.S")} style={complianceStyles.share}><Text style={complianceStyles.shareText}>Share my file with an employer</Text></Pressable>
      <Pressable onPress={() => setReplaceOpen(true)} style={complianceStyles.replaceLicence}><Text style={complianceStyles.replaceLicenceText}>Replace the expired licence</Text></Pressable>
    </ScrollView>
    <DocumentUploadSheet visible={replaceOpen} title="Work rights, VEVO check" onClose={() => setReplaceOpen(false)} />
  </SafeAreaView>;
}

const qrRows = Array.from({ length: 21 }, (_, row) =>
  Array.from({ length: 21 }, (_, column) => {
    const finder = (top: number, left: number) => {
      const y = row - top;
      const x = column - left;
      if (x < 0 || x > 6 || y < 0 || y > 6) return false;
      return x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
    };
    if (finder(0, 0) || finder(0, 14) || finder(14, 0)) return "1";
    const inFinderArea = (row <= 7 && (column <= 7 || column >= 13)) || (row >= 13 && column <= 7);
    if (inFinderArea) return "0";
    return ((row * 7 + column * 11 + row * column) % 5 < 2 || (row + column) % 9 === 0) ? "1" : "0";
  }).join("")
);

function ShareFileStandalone() {
  const [duration, setDuration] = useState<"24 hours" | "7 days" | "Until I revoke it">("Until I revoke it");
  const [copied, setCopied] = useState(false);
  return <SafeAreaView style={fileStyles.safe} edges={["top", "left", "right"]}>
    <View style={complianceStyles.header}><Pressable onPress={() => router.back()} style={fileStyles.backButton}><Text style={fileStyles.back}>‹</Text></Pressable><View style={fileStyles.headerCopy}><Text style={fileStyles.headerTitle}>Share my file</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Sharing help" style={complianceStyles.help}><Text style={complianceStyles.helpText}>?</Text></Pressable></View>
    <ScrollView style={fileStyles.body} contentContainerStyle={shareStyles.content} showsVerticalScrollIndicator={false}>
      <View style={shareStyles.qrCard}><View style={shareStyles.qr}>{qrRows.map((row, rowIndex) => <View key={rowIndex} style={shareStyles.qrRow}>{row.split("").map((bit, columnIndex) => <View key={columnIndex} style={[shareStyles.qrCell, bit === "1" && shareStyles.qrCellOn]}/>)}</View>)}</View><Text style={shareStyles.qrHelp}>Hold this up at the gate or in an interview. It opens your verified file, nothing else.</Text></View>
      <View style={shareStyles.linkCard}><Text style={shareStyles.label}>LINK</Text><Text style={shareStyles.link}>fleetsync.com.au/file/dw-042118663</Text><Text style={[shareStyles.label, shareStyles.durationLabel]}>STAYS OPEN FOR</Text><View style={shareStyles.segment}>{(["24 hours", "7 days", "Until I revoke it"] as const).map(option => <Pressable key={option} onPress={() => setDuration(option)} style={[shareStyles.segmentOption, duration === option && shareStyles.segmentSelected]}><Text style={[shareStyles.segmentText, duration === option && shareStyles.segmentSelectedText]}>{option}</Text></Pressable>)}</View></View>
      <View style={shareStyles.historyCard}><View style={shareStyles.historyRow}><Image source={require("../../../../assets/driver-profile.png")} style={shareStyles.historyAvatar}/><Text style={shareStyles.historyName}>Kate Ryan opened it</Text><Text style={shareStyles.historyDate}>6 July</Text></View><View style={shareStyles.historyRule}/><View style={shareStyles.historyRow}><View style={shareStyles.historyCompany}><Text style={shareStyles.historyCompanyText}>BF</Text></View><Text style={shareStyles.historyName}>Barwon Fuel Haulage opened it</Text><Text style={shareStyles.historyDate}>1 July</Text></View></View>
      <Pressable onPress={() => setCopied(true)} style={shareStyles.copyButton}><Text style={shareStyles.copyButtonText}>{copied ? "Link copied" : "Copy the link"}</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

function DocumentUploadSheet({ visible, title, onClose }: { visible: boolean; title: string; onClose: () => void }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={fileStyles.modalRoot}><Pressable accessibilityLabel="Close upload options" style={fileStyles.scrim} onPress={onClose}/><View style={fileStyles.uploadSheet}><View style={fileStyles.handle}/><Text style={fileStyles.uploadSheetTitle}>{title}</Text><Text style={fileStyles.uploadSheetSub}>Choose how to add it. FleetSync checks it, then matches it against the issuing authority where one exists.</Text>{["Photograph the document", "Choose a file on this phone", "Import from Service Victoria", "Ask the operator to send it"].map(option => <Pressable key={option} style={fileStyles.uploadOption} onPress={onClose}><Text style={fileStyles.uploadOptionText}>{option}</Text><Text style={fileStyles.uploadChevron}>›</Text></Pressable>)}</View></View></Modal>;
}

function DocumentDetailStandalone({ id }: { id: string }) {
  const doc = fileDocuments.find(([docId]) => docId === id)!;
  const isExpired = id === "A38.D";
  const isChecking = id === "A38.V";
  const [replaceOpen, setReplaceOpen] = useState(false);
  const status = isExpired ? "Expired" : isChecking ? "Being checked" : "Verification history";
  return <SafeAreaView style={fileStyles.safe} edges={["top", "left", "right"]}>
    <FileHeader title={doc[1]} subtitle={status} share={["A38.L", "A38.M", "A38.F"].includes(id)} />
    <ScrollView style={fileStyles.body} contentContainerStyle={[fileStyles.content, (isExpired || ["A38.L", "A38.M", "A38.F", "A38.V"].includes(id)) && fileStyles.expiredContent]} showsVerticalScrollIndicator={false}>
      {isExpired ? <ExpiredDocumentContent /> : id === "A38.L" ? <VerifiedLicenceContent /> : id === "A38.M" ? <VerifiedMedicalContent /> : id === "A38.F" ? <VerifiedFatigueContent /> : id === "A38.V" ? <CheckingWorkRightsContent /> : <>
        <View style={[fileStyles.statusCard, isChecking ? fileStyles.checking : fileStyles.verified]}><Text style={fileStyles.statusTitle}>{isChecking ? "◷  Being checked now" : "✓  Verified and current"}</Text><Text style={fileStyles.statusText}>{isChecking ? "Usually clears by the next business day." : "Nothing for you to do on this one."}</Text></View>
        <View style={fileStyles.infoCard}><Text style={fileStyles.docTitle}>{doc[1].toUpperCase()}</Text><Text style={fileStyles.docDetail}>{id === "A38.L" ? "042 118 663  ·  Class MC" : "Document verified by FleetSync"}</Text><View style={fileStyles.infoRule}/><View style={fileStyles.issuedRow}><Text style={fileStyles.docDetail}>ISSUED    02/08/2018     EXPIRES    01/08/2026</Text></View></View>
        <View style={fileStyles.infoCard}><Text style={fileStyles.sectionTitle}>{isChecking ? "WHERE IT IS UP TO" : "WHO HAS CHECKED THIS"}</Text><Text style={fileStyles.checkLine}>✓   {isChecking ? "Uploaded by you" : "Matched with VicRoads"}</Text><Text style={fileStyles.checkDetail}>    Image is legible, name matches your account.</Text><Text style={fileStyles.checkLine}>✓   Checked by FleetSync</Text><Text style={fileStyles.checkDetail}>    12 June 2026, 16:44</Text></View>
      </>}
      {isChecking ? <><View style={fileStyles.runNotice}><Text style={fileStyles.runTitle}>WHILE THIS RUNS</Text><Text style={fileStyles.runText}>✓   You can keep working. Nothing is blocked today.</Text><Text style={fileStyles.runMuted}>ⓘ   If it fails, we tell you what to send instead.{"\n"}     Nobody is notified of a failure except you.</Text></View><Pressable style={fileStyles.primary}><Text style={fileStyles.primaryText}>Tell me when it clears</Text></Pressable><Pressable onPress={() => setReplaceOpen(true)} style={fileStyles.replace}><Text style={fileStyles.replaceText}>Send a clearer copy</Text></Pressable></> : <><Pressable onPress={() => setReplaceOpen(true)} style={[fileStyles.replace, isExpired && fileStyles.replaceExpired]}><Text style={[fileStyles.replaceText, isExpired && { color: "#fff"}]}>{isExpired ? "Upload the renewed licence" : "Replace this document"}</Text></Pressable>{isExpired && <Pressable style={fileStyles.replace}><Text style={fileStyles.replaceText}>How to renew it</Text></Pressable>}</>}
    </ScrollView>
    <Modal visible={replaceOpen} transparent animationType="slide" onRequestClose={() => setReplaceOpen(false)}><View style={fileStyles.modalRoot}><Pressable style={fileStyles.scrim} onPress={() => setReplaceOpen(false)}/><View style={fileStyles.sheet}><View style={fileStyles.handle}/><Text style={fileStyles.sheetTitle}>{doc[1]}</Text><Text style={fileStyles.sheetSub}>Choose how to add it. FleetSync checks it, then matches it against the issuing authority where one exists.</Text>{["Photograph the document", "Choose a file on this phone", "Import from Service Victoria", "Ask the operator to send it"].map(option => <Pressable key={option} style={fileStyles.option} onPress={() => setReplaceOpen(false)}><Text style={fileStyles.optionText}>{option}</Text><Text style={fileStyles.chevron}>›</Text></Pressable>)}</View></View></Modal>
  </SafeAreaView>;
}

function VerifiedLicenceContent() {
  return <>
    <View style={[fileStyles.statusCard, fileStyles.verifiedBanner]}>
      <View style={fileStyles.verifiedIcon}><Text style={fileStyles.verifiedIconText}>✓</Text></View>
      <View style={fileStyles.flexOne}><Text style={[fileStyles.statusTitle, fileStyles.verifiedTitle]}>Verified and current</Text><Text style={[fileStyles.statusText, fileStyles.verifiedDetail]}>Nothing for you to do on this one.</Text></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.verifiedLicenceCard]}>
      <View style={fileStyles.licenceHeading}><View style={fileStyles.flexOne}><Text style={fileStyles.verifiedLicenceTitle}>VICTORIA DRIVER LICENCE</Text><Text style={fileStyles.licenceNumber}>042 118 663 · Class MC</Text></View><Image source={require("../../../../assets/driver-profile.png")} style={fileStyles.verifiedLicencePhoto} /></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.verifiedDates}><View style={fileStyles.verifiedDateColumn}><Text style={fileStyles.dateLabel}>ISSUED</Text><Text style={fileStyles.verifiedDateValue}>02/08/2018</Text></View><View style={fileStyles.verifiedDateColumn}><Text style={fileStyles.dateLabel}>EXPIRES</Text><Text style={fileStyles.verifiedDateValue}>01/08/2026</Text></View><View style={fileStyles.issuerColumn}><Text style={fileStyles.dateLabel}>ISSUED BY</Text><Text style={fileStyles.issuerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78}>VicRoads, Victoria</Text></View></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.historyCard]}>
      <Text style={fileStyles.sectionTitle}>WHO HAS CHECKED THIS</Text>
      <VerificationRow tone="green" title="Matched with VicRoads" detail={'Number, class and expiry agree with the\nregister. Rechecked nightly.'} date="13 June 2026, 02:10" />
      <VerificationRow tone="blue" title="Checked by FleetSync" detail={'Image is legible, name matches your account,\nno signs of alteration.'} date="12 June 2026, 16:44" compactDetail />
      <VerificationRow tone="pending" title="Uploaded by you" date="12 June 2026, 16:41" />
    </View>
    <View style={fileStyles.expiryWarning}><MaterialIcons name="schedule" size={20} color="#C44C00"/><Text style={fileStyles.expiryWarningText}>Expires in 24 days. Replace it before 1 August or Redgum Freightlines cannot allocate you work.</Text></View>
  </>;
}

function VerifiedMedicalContent() {
  return <>
    <View style={[fileStyles.statusCard, fileStyles.verifiedBanner]}>
      <View style={fileStyles.verifiedIcon}><Text style={fileStyles.verifiedIconText}>✓</Text></View>
      <View style={fileStyles.flexOne}><Text style={[fileStyles.statusTitle, fileStyles.verifiedTitle]}>Verified and current</Text><Text style={[fileStyles.statusText, fileStyles.verifiedDetail]}>Nothing for you to do on this one.</Text></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.medicalCard]}>
      <View style={fileStyles.licenceHeading}><View style={fileStyles.flexOne}><Text style={fileStyles.verifiedLicenceTitle}>HEAVY VEHICLE MEDICAL</Text><Text style={fileStyles.licenceNumber}>MED-70412</Text></View><Image source={require("../../../../assets/driver-profile.png")} style={fileStyles.medicalPhoto} /></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.medicalDates}><View style={fileStyles.medicalDateColumn}><Text style={fileStyles.dateLabel}>ISSUED</Text><Text style={fileStyles.verifiedDateValue}>05/02/2025</Text></View><View style={fileStyles.medicalDateColumn}><Text style={fileStyles.dateLabel}>EXPIRES</Text><Text style={fileStyles.verifiedDateValue}>04/02/2027</Text></View><View style={fileStyles.medicalIssuerColumn}><Text style={fileStyles.dateLabel}>ISSUED BY</Text><Text style={fileStyles.issuerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>Dr A Kaur, Werribee</Text></View></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.medicalHistoryCard]}>
      <Text style={fileStyles.sectionTitle}>WHO HAS CHECKED THIS</Text>
      <VerificationRow tone="blue" title="Checked by FleetSync" detail={'Image is legible, name matches your account,\nno signs of alteration.'} date="12 June 2026, 16:44" compactDetail />
      <VerificationRow tone="pending" title="Uploaded by you" date="12 June 2026, 16:41" />
    </View>
  </>;
}

function VerifiedFatigueContent() {
  return <>
    <View style={[fileStyles.statusCard, fileStyles.verifiedBanner]}>
      <View style={fileStyles.verifiedIcon}><Text style={fileStyles.verifiedIconText}>✓</Text></View>
      <View style={fileStyles.flexOne}><Text style={[fileStyles.statusTitle, fileStyles.verifiedTitle]}>Verified and current</Text><Text style={[fileStyles.statusText, fileStyles.verifiedDetail]}>Nothing for you to do on this one.</Text></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.medicalCard]}>
      <View style={fileStyles.licenceHeading}><View style={fileStyles.flexOne}><Text style={fileStyles.verifiedLicenceTitle}>BASIC FATIGUE MANAGEMENT</Text><Text style={fileStyles.licenceNumber}>BFM-31188</Text></View><Image source={require("../../../../assets/driver-profile.png")} style={fileStyles.medicalPhoto} /></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.medicalDates}><View style={fileStyles.medicalDateColumn}><Text style={fileStyles.dateLabel}>ISSUED</Text><Text style={fileStyles.verifiedDateValue}>06/07/2026</Text></View><View style={fileStyles.medicalDateColumn}><Text style={fileStyles.dateLabel}>EXPIRES</Text><Text style={fileStyles.verifiedDateValue}>30/06/2027</Text></View><View style={fileStyles.medicalIssuerColumn}><Text style={fileStyles.dateLabel}>ISSUED BY</Text><Text style={fileStyles.issuerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>Redgum Freightlines</Text></View></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.historyCard]}>
      <Text style={fileStyles.sectionTitle}>WHO HAS CHECKED THIS</Text>
      <VerificationRow tone="teal" title="Confirmed by employer" detail={'Kate Ryan sighted the original at the Laverton\ndepot and signed for it.'} date="6 July 2026, 07:20" compactDetail />
      <VerificationRow tone="blue" title="Checked by FleetSync" detail={'Image is legible, name matches your account,\nno signs of alteration.'} date="12 June 2026, 16:44" compactDetail />
      <VerificationRow tone="pending" title="Uploaded by you" date="12 June 2026, 16:41" />
    </View>
  </>;
}

function CheckingWorkRightsContent() {
  return <>
    <View style={[fileStyles.statusCard, fileStyles.checkingBanner]}>
      <View style={fileStyles.progressRing}><View style={fileStyles.progressRingCutout}/></View>
      <View style={fileStyles.flexOne}><Text style={fileStyles.checkingTitle}>Being checked now</Text><Text style={fileStyles.checkingDetail}>Usually clears by the next business day.</Text></View>
    </View>
    <View style={fileStyles.vevoCard}>
      <View style={fileStyles.vevoHeading}><View style={fileStyles.flexOne}><Text style={fileStyles.verifiedLicenceTitle}>WORK RIGHTS, VEVO</Text><Text style={fileStyles.licenceNumber}>VEVO-4419</Text></View><Text style={fileStyles.notVerifiedPill}>NOT VERIFIED YET</Text></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.vevoDates}><View><Text style={fileStyles.dateLabel}>SUBMITTED</Text><Text style={fileStyles.verifiedDateValue}>06/07/2026</Text></View><View><Text style={fileStyles.dateLabel}>VALID</Text><Text style={fileStyles.vevoValid}>While the visa holds</Text></View></View>
      <Text style={fileStyles.vevoPrivacy}>Checked against Department of Home Affairs. Nothing you send is visible to an operator until it clears.</Text>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.vevoProgressCard]}>
      <Text style={fileStyles.sectionTitle}>WHERE IT IS UP TO</Text>
      <VerificationRow tone="green" title="Uploaded by you" date="6 July 2026, 09:04" />
      <VerificationRow tone="blue" title="Checked by FleetSync" detail="Legible, name matches your account." date="6 July 2026, 09:06" />
      <View style={fileStyles.verificationRow}><View style={fileStyles.waitingRing}><View style={fileStyles.waitingRingCutout}/></View><View style={fileStyles.flexOne}><Text style={fileStyles.waitingTitle}>Waiting on Department of Home Affairs</Text><Text style={fileStyles.verificationDetail}>The register answers in business hours. We{`\n`}retry every 30 minutes.</Text></View></View>
      <View style={fileStyles.verificationRow}><View style={[fileStyles.verificationIcon, fileStyles.verificationPending]}/><Text style={[fileStyles.verificationTitle, fileStyles.pendingTitle]}>Added to your verified file</Text></View>
    </View>
  </>;
}

function VerificationRow({ tone, title, detail, date, compactDetail = false }: { tone: "green" | "teal" | "blue" | "pending"; title: string; detail?: string; date: string; compactDetail?: boolean }) {
  const pending = tone === "pending";
  return <View style={fileStyles.verificationRow}><View style={[fileStyles.verificationIcon, tone === "green" ? fileStyles.verificationGreen : tone === "teal" ? fileStyles.verificationTeal : tone === "blue" ? fileStyles.verificationBlue : fileStyles.verificationPending]}>{!pending && <Text style={fileStyles.verificationCheck}>✓</Text>}</View><View style={fileStyles.flexOne}><Text style={[fileStyles.verificationTitle, pending && fileStyles.pendingTitle]}>{title}</Text>{detail && <Text style={[fileStyles.verificationDetail, compactDetail && fileStyles.compactVerificationDetail]}>{detail}</Text>}<Text style={fileStyles.verificationDate}>{date}</Text></View></View>;
}

function ExpiredDocumentContent() {
  return <>
    <View style={[fileStyles.statusCard, fileStyles.expiredBanner]}>
      <View style={fileStyles.expiredIcon}><Text style={fileStyles.expiredIconText}>×</Text></View>
      <View style={fileStyles.flexOne}><Text style={[fileStyles.statusTitle, fileStyles.expiredText]}>Expired 6 days ago</Text><Text style={[fileStyles.statusText, fileStyles.expiredText]}>02/07/2026. It no longer counts towards your file.</Text></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.licenceCard]}>
      <View style={fileStyles.licenceHeading}><View style={fileStyles.flexOne}><Text style={[fileStyles.docTitle, fileStyles.licenceTitle]}>DANGEROUS GOODS LICENCE</Text><Text style={fileStyles.docDetail}>DG-88420</Text><Text style={fileStyles.docDetail}>Issued by WorkSafe Victoria</Text></View><Image source={require("../../../../assets/driver-profile.png")} style={fileStyles.licencePhoto} /></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.licenceDates}><View><Text style={fileStyles.dateLabel}>ISSUED</Text><Text style={fileStyles.dateValue}>03/07/2023</Text></View><View><Text style={fileStyles.dateLabel}>EXPIRED</Text><Text style={[fileStyles.dateValue, fileStyles.expiryDate]}>02/07/2026</Text></View><Text style={fileStyles.expiredStamp}>EXPIRED</Text></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.detailCard]}>
      <Text style={fileStyles.sectionTitle}>WHAT THIS BLOCKS</Text>
      <View style={fileStyles.impactRow}><View style={[fileStyles.roundIcon, fileStyles.badIcon]}><Text style={fileStyles.badIconText}>×</Text></View><View style={fileStyles.flexOne}><Text style={fileStyles.checkLine}>Tanker and placarded loads</Text><Text style={[fileStyles.checkDetail, fileStyles.badDetail]}>Barwon Fuel Haulage cannot allocate you a tanker</Text></View></View>
      <View style={[fileStyles.infoRule, fileStyles.indentedRule]}/>
      <View style={fileStyles.impactRow}><View style={[fileStyles.roundIcon, fileStyles.goodIcon]}><Text style={fileStyles.goodIconText}>✓</Text></View><View style={fileStyles.flexOne}><Text style={fileStyles.checkLine}>General freight</Text><Text style={[fileStyles.checkDetail, fileStyles.goodDetail]}>Unaffected. Your Redgum run today still stands</Text></View></View>
    </View>
    <View style={[fileStyles.infoCard, fileStyles.toldCard]}>
      <Text style={fileStyles.sectionTitle}>WHO HAS BEEN TOLD</Text>
      <View style={fileStyles.personRow}><View style={fileStyles.companyAvatar}><Text style={fileStyles.companyAvatarText}>BF</Text></View><Text style={fileStyles.personName}>Barwon Fuel Haulage compliance</Text><Text style={fileStyles.personDate}>2 July</Text></View>
      <View style={fileStyles.infoRule}/>
      <View style={fileStyles.personRow}><Image source={require("../../../../assets/driver-profile.png")} style={fileStyles.personAvatar}/><Text style={fileStyles.personName}>Kate Ryan, Allocator</Text><Text style={fileStyles.personDate}>2 July</Text></View>
    </View>
    <View style={fileStyles.warning}><MaterialIcons name="info-outline" size={18} color="#DC2626"/><Text style={fileStyles.warningText}>Driving a placarded load on an expired licence is an offence under the Dangerous Goods Act. FleetSync will not let an operator allocate one.</Text></View>
  </>;
}

const fileStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" }, body: { backgroundColor: "#F4F6FA" }, header: { minHeight: 56, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 18 }, headerCopy: { flex: 1 }, backButton: { width: 28, height: 36, justifyContent: "center" }, back: { fontSize: 29, lineHeight: 30, color: colors.ink }, shareButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" }, headerTitle: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 20, lineHeight: 23, color: colors.ink }, headerSub: { fontSize: 12, lineHeight: 16, color: colors.muted }, content: { padding: 18, gap: 18 }, fileListContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 34, gap: 16 }, expiredContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28, gap: 16 }, listCard: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 18, shadowColor: colors.fleetNavy, shadowOpacity: .07, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, docRow: { minHeight: 104, flexDirection: "row", alignItems: "center", gap: 8 }, docBorder: { borderTopWidth: 1, borderColor: colors.border }, docTitle: { fontSize: 16, lineHeight: 20, fontWeight: "700", color: colors.ink }, docDetail: { fontSize: 13, lineHeight: 18, color: colors.muted, marginTop: 2 }, pill: { alignSelf: "flex-start", overflow: "hidden", borderRadius: 12, marginTop: 7, paddingHorizontal: 9, paddingVertical: 3, fontSize: 9, fontWeight: "700", letterSpacing: .7 }, pillGood: { backgroundColor: "#EAFBF1", color: "#12733D" }, pillBlue: { backgroundColor: "#EEF4FF", color: colors.actionBlue }, pillBad: { backgroundColor: "#FFF0F0", color: "#B91C1C" }, pillWarn: { backgroundColor: "#FFF6E9", color: "#B45309" }, pillOutline: { borderWidth: 1, borderStyle: "dashed", borderColor: "#94A3B8", color: colors.muted }, chevron: { fontSize: 27, color: "#94A3B8" }, primary: { height: 72, borderRadius: 14, justifyContent: "center", alignItems: "center", backgroundColor: colors.actionBlue }, fileListPrimary: { height: 60, borderRadius: 13, justifyContent: "center", alignItems: "center", backgroundColor: "#2D64E8" }, primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" }, statusCard: { padding: 16, borderRadius: 15 }, verified: { backgroundColor: "#ECFDF3", borderWidth: 1, borderColor: "#A7F3C2" }, expiredText: { color: "#FFFFFF" }, checking: { backgroundColor: "#FFF7EA", borderWidth: 1, borderColor: "#F59E0B" }, statusTitle: { color: colors.ink, fontSize: 18, lineHeight: 22, fontWeight: "700" }, statusText: { color: colors.muted, fontSize: 14, lineHeight: 19, marginTop: 2 }, infoCard: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 7 }, infoRule: { height: 1, backgroundColor: colors.border, marginVertical: 8 }, issuedRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, expiredStamp: { color: "#D22B2B", borderWidth: 2.5, borderColor: "#D22B2B", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 17, fontWeight: "900", letterSpacing: 2.5, transform: [{ rotate: "-10deg" }] }, sectionTitle: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 }, checkLine: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: "700" }, checkDetail: { color: colors.muted, fontSize: 14, lineHeight: 19 }, warning: { padding: 16, borderRadius: 15, backgroundColor: "#FFF0EE", flexDirection: "row", alignItems: "flex-start", gap: 10 }, runNotice: { padding: 18, borderRadius: 16, backgroundColor: "#EEF4FC", gap: 10 }, runTitle: { color: colors.actionBlue, fontSize: 11, letterSpacing: 1, fontWeight: "700" }, runText: { color: colors.ink, fontSize: 15, lineHeight: 21 }, runMuted: { color: colors.muted, fontSize: 13, lineHeight: 19 }, replace: { height: 60, backgroundColor: "#fff", borderRadius: 13, borderWidth: 1, borderColor: colors.border, justifyContent: "center", alignItems: "center" }, replaceExpired: { backgroundColor: "#E5252A", borderColor: "#E5252A" }, replaceText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  expiredBanner: { minHeight: 94, backgroundColor: "#E5252A", flexDirection: "row", alignItems: "center", gap: 14 }, expiredIcon: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,.22)" }, expiredIconText: { color: "#fff", fontSize: 28, lineHeight: 30, fontWeight: "400" }, flexOne: { flex: 1 }, licenceCard: { minHeight: 160, padding: 20, gap: 8, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, licenceHeading: { flexDirection: "row", gap: 12 }, licenceTitle: { color: "#9299A3" }, licencePhoto: { width: 46, height: 58, borderRadius: 4, opacity: .5 }, licenceDates: { minHeight: 44, flexDirection: "row", alignItems: "flex-end", gap: 30 }, dateLabel: { color: "#C6CFDC", fontSize: 10, fontWeight: "700", letterSpacing: 1.1 }, dateValue: { color: "#707C8C", fontSize: 13, marginTop: 5, fontFamily: "monospace" }, expiryDate: { color: "#F08D91" }, detailCard: { padding: 20, gap: 10, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, impactRow: { flexDirection: "row", alignItems: "center", gap: 14 }, roundIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" }, badIcon: { backgroundColor: "#FFF0F0" }, goodIcon: { backgroundColor: "#EAFBF1" }, badIconText: { color: "#DC2626", fontSize: 22, lineHeight: 23 }, goodIconText: { color: "#16A34A", fontSize: 18, fontWeight: "700" }, badDetail: { color: "#B91C1C", marginTop: 3 }, goodDetail: { color: "#16733A", marginTop: 3 }, indentedRule: { marginLeft: 46, marginVertical: 0 }, toldCard: { padding: 20, gap: 10, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, personRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 12 }, companyAvatar: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#0EA5A4", alignItems: "center", justifyContent: "center" }, companyAvatarText: { color: "#fff", fontSize: 12, fontWeight: "700" }, personAvatar: { width: 34, height: 34, borderRadius: 17 }, personName: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 18 }, personDate: { color: colors.muted, fontSize: 13, fontFamily: "monospace" }, warningText: { flex: 1, color: "#B91C1C", fontSize: 13, lineHeight: 19 },
  verifiedBanner: { minHeight: 74, backgroundColor: "#ECFDF3", borderWidth: 1, borderColor: "#A7F3C2", flexDirection: "row", alignItems: "center", gap: 14 }, verifiedIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#18A957", alignItems: "center", justifyContent: "center" }, verifiedIconText: { color: "#fff", fontSize: 22, fontWeight: "800" }, verifiedTitle: { color: "#126B35", fontSize: 16 }, verifiedDetail: { color: "#397E51", fontSize: 13 }, verifiedLicenceCard: { minHeight: 174, padding: 20, gap: 10, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, verifiedLicenceTitle: { color: colors.ink, fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 18, lineHeight: 22 }, licenceNumber: { color: colors.muted, fontFamily: "monospace", fontSize: 13, marginTop: 4 }, verifiedLicencePhoto: { width: 48, height: 62, borderRadius: 4 }, verifiedDates: { flexDirection: "row", alignItems: "flex-start", gap: 20 }, verifiedDateColumn: { minWidth: 78 }, issuerColumn: { flex: 1 }, verifiedDateValue: { color: colors.ink, fontFamily: "monospace", fontSize: 13, fontWeight: "600", marginTop: 5 }, issuerValue: { color: colors.ink, fontSize: 13, fontWeight: "600", marginTop: 5 }, historyCard: { paddingVertical: 20, paddingHorizontal: 16, gap: 15, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, verificationRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, verificationIcon: { width: 27, height: 27, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 1 }, verificationGreen: { backgroundColor: "#18A957" }, verificationTeal: { backgroundColor: "#17A8AA" }, verificationBlue: { backgroundColor: "#2D64E8" }, verificationPending: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#D7E0EB" }, verificationCheck: { color: "#fff", fontSize: 16, fontWeight: "800" }, verificationTitle: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: "700" }, pendingTitle: { color: colors.muted }, verificationDetail: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 }, compactVerificationDetail: { fontSize: 12, letterSpacing: -0.05 }, verificationDate: { color: colors.muted, fontFamily: "monospace", fontSize: 12, lineHeight: 18, marginTop: 3 }, expiryWarning: { minHeight: 82, backgroundColor: "#FFF7E8", borderRadius: 15, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12 }, expiryWarningText: { flex: 1, color: "#B84A00", fontSize: 13, lineHeight: 19 },
  medicalCard: { minHeight: 166, padding: 20, gap: 10, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, medicalPhoto: { width: 48, height: 62, borderRadius: 4 }, medicalDates: { flexDirection: "row", alignItems: "flex-start", gap: 16 }, medicalDateColumn: { minWidth: 82 }, medicalIssuerColumn: { flex: 1 }, medicalHistoryCard: { paddingVertical: 20, paddingHorizontal: 16, gap: 18, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  checkingBanner: { minHeight: 76, backgroundColor: "#FFF8EB", borderWidth: 1, borderColor: "#F59E0B", flexDirection: "row", alignItems: "center", gap: 14 }, progressRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 3, borderColor: "#FDE0A8", borderLeftColor: "#C65B00", borderBottomColor: "#C65B00", alignItems: "center", justifyContent: "center", transform: [{ rotate: "-18deg" }] }, progressRingCutout: { width: 25, height: 25, borderRadius: 13, backgroundColor: "#FFF8EB" }, checkingTitle: { color: colors.ink, fontSize: 16, lineHeight: 21, fontWeight: "700" }, checkingDetail: { color: "#C04D00", fontSize: 13, lineHeight: 18, marginTop: 2 }, vevoCard: { minHeight: 198, backgroundColor: "#fff", borderWidth: 1.5, borderStyle: "dashed", borderColor: "#91A5C0", borderRadius: 3, padding: 20, gap: 10 }, vevoHeading: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, notVerifiedPill: { color: "#B84A00", backgroundColor: "#FFF5E8", borderRadius: 14, overflow: "hidden", paddingHorizontal: 9, paddingVertical: 5, fontSize: 9, fontWeight: "700", letterSpacing: .4 }, vevoDates: { flexDirection: "row", alignItems: "flex-start", gap: 42 }, vevoValid: { color: colors.ink, fontSize: 13, fontWeight: "600", marginTop: 5 }, vevoPrivacy: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 3 }, vevoProgressCard: { paddingVertical: 20, paddingHorizontal: 16, gap: 17, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } }, waitingRing: { width: 27, height: 27, borderRadius: 14, borderWidth: 2.5, borderColor: "#FDE0A8", borderLeftColor: "#C65B00", borderBottomColor: "#C65B00", alignItems: "center", justifyContent: "center", marginTop: 1 }, waitingRingCutout: { width: 17, height: 17, borderRadius: 9, backgroundColor: "#fff" }, waitingTitle: { color: "#B84A00", fontSize: 15, lineHeight: 20, fontWeight: "700" },
  modalRoot: { flex: 1, justifyContent: "flex-end" }, scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(15,27,42,.52)" }, uploadSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }, uploadSheetTitle: { color: colors.ink, fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 22, lineHeight: 27 }, uploadSheetSub: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 5, marginBottom: 8 }, uploadOption: { minHeight: 60, borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, uploadOptionText: { color: colors.ink, fontSize: 16 }, uploadChevron: { color: "#94A3B8", fontSize: 28, lineHeight: 30 }, sheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 28 }, handle: { width: 48, height: 4, borderRadius: 3, backgroundColor: colors.border, alignSelf: "center", marginBottom: 20 }, sheetTitle: { color: colors.ink, fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 22 }, sheetSub: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 10 }, option: { height: 60, borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, optionText: { color: colors.ink, fontSize: 16 },
});

const complianceStyles = StyleSheet.create({
  header: { minHeight: 56, backgroundColor: "#fff", borderBottomWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 22, gap: 18 },
  help: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: colors.muted, alignItems: "center", justifyContent: "center" },
  helpText: { color: colors.muted, fontSize: 18, lineHeight: 21, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 30, gap: 14 },
  summary: { borderWidth: 1, borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  cleared: { minHeight: 100, backgroundColor: "#ECFDF3", borderColor: "#A7F3C2" },
  blocked: { minHeight: 142, backgroundColor: "#FFF4F3", borderColor: "#FF9292" },
  summaryIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginTop: 2 },
  clearedIcon: { backgroundColor: "#18A957" },
  blockedIcon: { backgroundColor: "#E5252A" },
  summaryIconText: { color: "#fff", fontSize: 25, lineHeight: 27, fontWeight: "700" },
  summaryTitle: { color: colors.ink, fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 20, lineHeight: 24 },
  summaryDetail: { fontSize: 14, lineHeight: 20, marginTop: 3 },
  clearedText: { color: "#16733A" },
  blockedText: { color: "#B91C1C" },
  documentCard: { backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 18, shadowColor: colors.fleetNavy, shadowOpacity: .07, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  documentRow: { minHeight: 76, flexDirection: "row", alignItems: "center", gap: 12 },
  documentRule: { borderTopWidth: 1, borderColor: colors.border },
  rowIcon: { width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  rowGood: { backgroundColor: "#EAFBF1" },
  rowBad: { backgroundColor: "#FFF0F0" },
  rowWarn: { backgroundColor: "#FFF6E9" },
  rowUpload: { backgroundColor: "#fff", borderWidth: 1.5, borderStyle: "dashed", borderColor: "#91A5C0" },
  rowIconText: { color: "#16A34A", fontSize: 18, fontWeight: "700" },
  rowBadText: { color: "#DC2626", fontSize: 22 },
  rowWarnText: { color: "#C65B00" },
  rowUploadText: { color: colors.muted },
  documentTitle: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: "700" },
  documentDetail: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  share: { height: 60, borderRadius: 13, backgroundColor: "#2D64E8", alignItems: "center", justifyContent: "center" },
  shareText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  replaceLicence: { height: 60, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  replaceLicenceText: { color: colors.ink, fontSize: 16, fontWeight: "700" },
});

const shareStyles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32, gap: 16 },
  qrCard: { minHeight: 272, borderRadius: 18, backgroundColor: "#fff", padding: 20, alignItems: "center", justifyContent: "center", shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  qr: { width: 170, height: 170, padding: 8, backgroundColor: "#fff", gap: 0 },
  qrRow: { flex: 1, flexDirection: "row" },
  qrCell: { flex: 1, backgroundColor: "#fff" },
  qrCellOn: { backgroundColor: colors.ink },
  qrHelp: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 14 },
  linkCard: { borderRadius: 18, backgroundColor: "#fff", padding: 18, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  label: { color: colors.muted, fontSize: 10, lineHeight: 14, fontWeight: "700", letterSpacing: 1.1 },
  link: { color: "#2563EB", fontFamily: "monospace", fontSize: 13, lineHeight: 20, marginTop: 6 },
  durationLabel: { marginTop: 16, marginBottom: 9 },
  segment: { height: 52, borderRadius: 12, padding: 4, backgroundColor: "#E5EBF3", flexDirection: "row" },
  segmentOption: { flex: 1, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  segmentSelected: { backgroundColor: colors.ink },
  segmentText: { color: colors.muted, fontSize: 12 },
  segmentSelectedText: { color: "#fff" },
  historyCard: { borderRadius: 18, backgroundColor: "#fff", paddingHorizontal: 18, shadowColor: colors.fleetNavy, shadowOpacity: .06, shadowRadius: 12, shadowOffset: { width: 0, height: 5 } },
  historyRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12 },
  historyRule: { height: 1, backgroundColor: colors.border },
  historyAvatar: { width: 36, height: 36, borderRadius: 18 },
  historyCompany: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ECFDF8", alignItems: "center", justifyContent: "center" },
  historyCompanyText: { color: "#07877D", fontSize: 12, fontWeight: "700" },
  historyName: { flex: 1, color: colors.ink, fontSize: 14 },
  historyDate: { color: colors.muted, fontFamily: "monospace", fontSize: 12 },
  copyButton: { height: 60, borderRadius: 13, backgroundColor: "#2D64E8", alignItems: "center", justifyContent: "center" },
  copyButtonText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});

function CompanyTodayStandalone() {
  const appState = useAppState();
  const [selected, setSelected] = useState("op_barwon");
  const [remember, setRemember] = useState(false);
  const companyRows = [
    {
      id: "op_redgum",
      code: "RF",
      name: "Redgum Freightlines",
      detail: "Laverton VIC",
      type: "FULL TIME",
      last: "Last worked yesterday",
      colour: colors.fleetNavy,
    },
    {
      id: "op_barwon",
      code: "BF",
      name: "Barwon Fuel Haulage",
      detail: "Corio VIC",
      type: "CASUAL",
      last: "Last worked 1 July",
      colour: "#12A6A7",
    },
  ];
  return (
    <SafeAreaView edges={["top", "right", "left"]} style={companyStyles.safe}>
      <View style={companyStyles.header}>
        <View style={companyStyles.headingRow}>
          <View style={companyStyles.headingCopy}>
            <Text style={companyStyles.heading}>Good morning, Dave</Text>
            <Text style={companyStyles.headingSubtitle}>Who are you driving for today?</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="About company selection"
            onPress={() => go("A26.M1")}
            style={companyStyles.help}
          >
            <Text style={companyStyles.helpText}>?</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView style={companyStyles.body} contentContainerStyle={companyStyles.content}>
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
                {isSelected && <Text style={companyStyles.drivingBadge}>DRIVING TODAY</Text>}
                <View
                  style={[
                    companyStyles.companyLogo,
                    { backgroundColor: company.colour },
                  ]}
                >
                  <Text style={[companyStyles.companyCode, company.id === "op_redgum" && companyStyles.redgumCode]}>{company.code}</Text>
                </View>
                <View style={companyStyles.companyCopy}>
                  <Text
                    style={companyStyles.companyName}
                    numberOfLines={1}
                  >
                    {company.name}
                  </Text>
                  <Text style={companyStyles.companyDetail} numberOfLines={1}>
                    {company.detail}
                  </Text>
                  <Text style={[companyStyles.typeBadge, company.id === "op_barwon" && companyStyles.casualBadge]}>{company.type}</Text>
                  <Text style={companyStyles.companyLast} numberOfLines={1}>
                    {company.last}
                  </Text>
                </View>
                <Image source={require("../../../../assets/job-coastline.png")} style={companyStyles.companyImage} />
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" onPress={() => go("A26.A")} style={companyStyles.addCard}>
            <View style={companyStyles.addIcon}><Text style={companyStyles.addIconText}>＋</Text></View>
            <View style={companyStyles.companyCopy}><Text style={companyStyles.addTitle}>Add a company</Text><Text style={companyStyles.addDetail}>Use the driver ID and password they{`\n`}issued you</Text></View>
            <MaterialIcons name="chevron-right" size={25} color="#93A4BA" />
          </Pressable>
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
            appState.setShift("clocked_off");
            router.replace("/dashboard");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function AddCompanyStandalone() {
  const [operator, setOperator] = useState("Barwon Fuel Haulage");
  const [driverId, setDriverId] = useState("BFH-2291");
  const [companyPassword, setCompanyPassword] = useState("password");
  const [invitationCode, setInvitationCode] = useState("BF7KQ2");
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <SafeAreaView style={addCompanyStyles.safe}>
      <View style={addCompanyStyles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => router.back()} style={addCompanyStyles.back}>
          <MaterialIcons name="chevron-left" size={30} color={colors.ink} />
        </Pressable>
        <Text style={addCompanyStyles.title}>Add a company</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={addCompanyStyles.content}>
        <Text style={addCompanyStyles.intro}>Each operator issues you their own driver ID and password. Enter the ones on the letter or SMS they sent you.</Text>
        <CompanyFormField label="Operator" value={operator} onChangeText={setOperator} />
        <CompanyFormField label="Driver ID they issued" value={driverId} onChangeText={setDriverId} autoCapitalize="characters" />
        <CompanyFormField label="Password they issued" value={companyPassword} onChangeText={setCompanyPassword} secureTextEntry />
        <View style={addCompanyStyles.notice}>
          <MaterialIcons name="lock-outline" size={22} color={colors.actionBlue} />
          <Text style={addCompanyStyles.noticeText}>Linking lets Barwon Fuel Haulage see your verified file and allocate you work. It does not let them see any Redgum Freightlines run.</Text>
        </View>
        <Button label="Link this company" onPress={() => go("A26.L", true)} />
        <Pressable accessibilityRole="button" onPress={() => setInviteOpen(true)} style={addCompanyStyles.invite}><Text style={addCompanyStyles.inviteText}>I have an invitation code instead</Text></Pressable>
      </ScrollView>
      <Modal visible={inviteOpen} transparent animationType="slide" onRequestClose={() => setInviteOpen(false)}>
        <View style={addCompanyStyles.modalRoot}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close invitation code" onPress={() => setInviteOpen(false)} style={addCompanyStyles.scrim} />
          <View style={addCompanyStyles.sheet}>
            <View style={addCompanyStyles.handle} />
            <Text style={addCompanyStyles.sheetTitle}>Invitation code</Text>
            <Text style={addCompanyStyles.sheetSubtitle}>Six characters from the allocator, valid for 48 hours.</Text>
            <TextInput
              value={invitationCode}
              onChangeText={(value) => setInvitationCode(value.toUpperCase())}
              autoCapitalize="characters"
              maxLength={6}
              style={addCompanyStyles.codeInput}
            />
            <Button label="Use this code" onPress={() => go("A26.LI", true)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function CompanyFormField({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={addCompanyStyles.field}><Text style={addCompanyStyles.label}>{label}</Text><TextInput {...props} style={addCompanyStyles.input} placeholderTextColor="#94A3B8" /></View>;
}

function CompanyLinkedStandalone({ showAcceptedPopup = false }: { showAcceptedPopup?: boolean }) {
  const [acceptedOpen, setAcceptedOpen] = useState(showAcceptedPopup);
  return (
    <SafeAreaView style={linkedStyles.safe}>
      <View style={linkedStyles.header}><Text style={linkedStyles.headerTitle}>Company linked</Text></View>
      <ScrollView contentContainerStyle={linkedStyles.content}>
        <View style={linkedStyles.successCard}>
          <View style={linkedStyles.successIcon}><MaterialIcons name="check" size={32} color="#16A34A" /></View>
          <Text style={linkedStyles.companyTitle}>Barwon Fuel Haulage linked</Text>
          <Text style={linkedStyles.verified}>BFH-2291  ·  verified 11:41</Text>
        </View>
        <View style={linkedStyles.accessCard}>
          <Text style={linkedStyles.sectionLabel}>WHAT THEY CAN SEE</Text>
          <LinkedRow icon="check" text="Your verified file and expiry dates" />
          <LinkedRow icon="check" text="Work you do for them, and only that work" />
          <LinkedRow icon="close" text="Nothing from Redgum Freightlines" muted />
        </View>
        <View style={linkedStyles.warning}><MaterialIcons name="error-outline" size={20} color="#DC2626" /><Text style={linkedStyles.warningText}>Barwon run tankers. Your dangerous goods licence expired on 2 July, so they cannot allocate you a tanker until it is replaced.</Text></View>
        <Button label="Done" onPress={() => go("A26", true)} />
      </ScrollView>
      <Modal visible={acceptedOpen} transparent animationType="fade" onRequestClose={() => setAcceptedOpen(false)}>
        <View style={linkedStyles.popupRoot}>
          <View style={linkedStyles.popupCard}>
            <View style={linkedStyles.popupIcon}><MaterialIcons name="check" size={30} color="#16A34A" /></View>
            <Text style={linkedStyles.popupTitle}>Invitation code accepted</Text>
            <Pressable accessibilityRole="button" onPress={() => setAcceptedOpen(false)} style={linkedStyles.popupButton}><Text style={linkedStyles.popupButtonText}>OK</Text></Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function LinkedRow({ icon, text, muted = false }: { icon: "check" | "close"; text: string; muted?: boolean }) {
  return <View style={linkedStyles.row}><MaterialIcons name={icon} size={20} color={icon === "check" ? "#16A34A" : "#DC2626"} /><Text style={[linkedStyles.rowText, muted && linkedStyles.rowMuted]}>{text}</Text></View>;
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
    fontSize: 23,
    lineHeight: 28,
    color: colors.ink,
  },
  subtitle: { marginTop: 5, fontSize: 13, lineHeight: 19, color: colors.muted },
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
  itemTitle: { fontSize: 15, fontWeight: "800", color: colors.ink },
  itemBody: { fontSize: 12, lineHeight: 17, color: colors.muted },
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
    minHeight: 54,
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
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  header: { minHeight: 78, paddingHorizontal: 28, paddingTop: 4, paddingBottom: 10, justifyContent: "center", backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: colors.border },
  body: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: 28, paddingTop: 0, paddingBottom: 96 },
  headingRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  headingCopy: { flex: 1 },
  heading: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 24,
    lineHeight: 29,
    color: colors.ink,
  },
  headingSubtitle: { marginTop: 2, fontSize: 15, lineHeight: 20, color: colors.muted },
  help: {
    width: 25,
    height: 25,
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: colors.muted,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  helpText: { fontSize: 15, fontWeight: "800", color: colors.muted },
  list: { marginTop: 28, gap: 14 },
  card: {
    minHeight: 134,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.card,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  cardSelected: { borderColor: colors.actionBlue, backgroundColor: colors.card },
  drivingBadge: { position: "absolute", top: -12, left: 16, zIndex: 2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, overflow: "hidden", backgroundColor: colors.actionBlue, color: "#fff", fontSize: 11, fontWeight: "800", letterSpacing: .5 },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  companyCode: { color: "#fff", fontSize: 16, fontWeight: "900" },
  redgumCode: { color: colors.amber },
  companyCopy: { flex: 1, minWidth: 0, gap: 4 },
  companyName: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 18, lineHeight: 23, color: colors.ink },
  companyDetail: { fontSize: 13, color: colors.muted },
  companyLast: { alignSelf: "flex-start", borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, fontSize: 11, color: colors.muted },
  typeBadge: { alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, overflow: "hidden", backgroundColor: "#EEF4FF", color: colors.actionBlue, fontSize: 10, fontWeight: "800", letterSpacing: .7 },
  casualBadge: { backgroundColor: "#FFF6E8", color: "#B84D00" },
  companyImage: { width: 66, height: 66, borderRadius: 12 },
  addCard: { minHeight: 84, borderWidth: 1.5, borderStyle: "dashed", borderColor: "#8FA3BD", borderRadius: 16, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  addIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#EEF4FC", alignItems: "center", justifyContent: "center" },
  addIconText: { color: colors.actionBlue, fontSize: 22 },
  addTitle: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  addDetail: { color: colors.muted, fontSize: 12, lineHeight: 17 },
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
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.actionBlue,
    borderColor: colors.actionBlue,
  },
  tick: { color: "#fff", fontSize: 17, fontWeight: "900" },
  rememberText: { fontSize: 14, fontWeight: "400", color: colors.ink },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: colors.appBg,
  },
});

const addCompanyStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  header: { height: 54, paddingHorizontal: 28, flexDirection: "row", alignItems: "center", gap: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { width: 22, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 22, lineHeight: 27, color: colors.ink },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 36, gap: 12 },
  intro: { color: colors.muted, fontSize: 14, lineHeight: 20, marginBottom: 2 },
  field: { gap: 6 },
  label: { color: colors.muted, fontSize: 11, lineHeight: 15, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  input: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: "#fff", paddingHorizontal: 16, color: colors.ink, fontSize: 16 },
  notice: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#EEF4FC" },
  noticeText: { flex: 1, color: colors.ink, fontSize: 12, lineHeight: 17 },
  invite: { minHeight: 38, alignItems: "center", justifyContent: "center" },
  inviteText: { color: colors.actionBlue, fontSize: 15, fontWeight: "700" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(14, 32, 51, .48)" },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 28, paddingTop: 10, paddingBottom: 38, gap: 12, backgroundColor: "#FFFFFF" },
  handle: { width: 54, height: 5, borderRadius: 3, alignSelf: "center", marginBottom: 8, backgroundColor: "#DCE4EE" },
  sheetTitle: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 23, lineHeight: 28, color: colors.ink },
  sheetSubtitle: { marginTop: -7, fontSize: 13, lineHeight: 18, color: colors.muted },
  codeInput: { height: 64, marginTop: 6, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: "#FFFFFF", textAlign: "center", color: colors.ink, fontSize: 25, fontWeight: "700", letterSpacing: 7 },
});

const linkedStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.appBg },
  header: { height: 54, justifyContent: "center", paddingHorizontal: 20, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 21, color: colors.ink },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 36, gap: 14 },
  successCard: { minHeight: 172, borderRadius: 17, alignItems: "center", justifyContent: "center", padding: 18, backgroundColor: "#FFFFFF", shadowColor: colors.fleetNavy, shadowOpacity: .05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  successIcon: { width: 62, height: 62, borderRadius: 31, alignItems: "center", justifyContent: "center", marginBottom: 14, backgroundColor: "#ECFDF3" },
  companyTitle: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 23, lineHeight: 28, color: colors.ink, textAlign: "center" },
  verified: { marginTop: 10, fontFamily: "monospace", fontSize: 12, color: colors.muted },
  accessCard: { borderRadius: 17, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, backgroundColor: "#FFFFFF", shadowColor: colors.fleetNavy, shadowOpacity: .05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  sectionLabel: { marginBottom: 5, color: colors.muted, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  row: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { flex: 1, color: colors.ink, fontSize: 14, lineHeight: 19 },
  rowMuted: { color: colors.muted },
  warning: { borderRadius: 15, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, backgroundColor: "#FFF0F0" },
  warningText: { flex: 1, color: "#B91C1C", fontSize: 13, lineHeight: 19 },
  popupRoot: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "rgba(14,32,51,.48)" },
  popupCard: { width: "100%", maxWidth: 330, borderRadius: 20, padding: 24, alignItems: "center", backgroundColor: "#FFFFFF" },
  popupIcon: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", marginBottom: 14, backgroundColor: "#ECFDF3" },
  popupTitle: { fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 23, color: colors.ink, textAlign: "center" },
  popupButton: { width: "100%", height: 48, marginTop: 22, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: colors.actionBlue },
  popupButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
});

const signInStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 16,
  },
  mark: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: colors.fleetNavy,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  markLine: { height: 4, borderRadius: 3, backgroundColor: "#AAB8C8" },
  markLineShort: { width: 20 },
  markLineMiddle: { width: 28 },
  markLineAmber: { width: 38, backgroundColor: colors.amber },
  intro: { marginTop: 32, marginBottom: 18 },
  title: {
    fontFamily: "BarlowSemiCondensed_700Bold",
    fontSize: 29,
    lineHeight: 35,
    letterSpacing: -0.25,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.muted,
    marginTop: 4,
  },
  form: { gap: 16 },
  field: { gap: 8 },
  fieldLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: colors.muted,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 18,
    color: colors.ink,
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    marginTop: -4,
    color: "#DC2626",
    fontSize: 12,
    lineHeight: 16,
  },
  signInButton: {
    height: 60,
    marginTop: 4,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.actionBlue,
  },
  signInButtonDisabled: { opacity: 1 },
  signInButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  pressed: { opacity: 0.8 },
  forgot: {
    minHeight: 34,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotText: { fontSize: 16, fontWeight: "700", color: colors.actionBlue },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 12,
  },
  divider: {
    height: 1,
    minWidth: 36,
    backgroundColor: "#D7E0EA",
    flex: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.05,
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  createButton: {
    height: 60,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonText: { color: colors.ink, fontSize: 18, fontWeight: "700" },
  version: {
    marginTop: "auto",
    paddingTop: 36,
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
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
  successSheet: { alignItems: "stretch", paddingTop: 12, paddingBottom: 38 },
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
    borderRadius: 12,
    backgroundColor: "#F4F6FA",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { fontSize: 24, lineHeight: 28, color: colors.muted },
  sheetSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginTop: -16,
    maxWidth: 380,
  },
  resetSuccessIcon: { width: 60, height: 60, borderRadius: 30, alignSelf: "center", alignItems: "center", justifyContent: "center", backgroundColor: "#ECFDF3", marginTop: 4 },
  resetSuccessCheck: { color: "#16A34A", fontSize: 28, lineHeight: 31, fontWeight: "700" },
  resetSuccessTitle: { color: colors.ink, fontFamily: "BarlowSemiCondensed_700Bold", fontSize: 24, lineHeight: 29, textAlign: "center", marginTop: 4 },
  resetSuccessText: { color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center", marginBottom: 12 },
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
