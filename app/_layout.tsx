import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {                       
  useFonts,
  BarlowSemiCondensed_700Bold,
} from "@expo-google-fonts/barlow-semi-condensed";
import { AppStateProvider } from "@/state/AppState";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ BarlowSemiCondensed_700Bold });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}
