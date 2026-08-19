import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  BarlowSemiCondensed_500Medium,
  BarlowSemiCondensed_600SemiBold,
  BarlowSemiCondensed_700Bold,
  useFonts,
} from '@expo-google-fonts/barlow-semi-condensed';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { RobotoMono_400Regular, RobotoMono_500Medium } from '@expo-google-fonts/roboto-mono';
import { darkTop } from '@/proto/runtime/data';
import { PrototypeProvider, useStore } from '@/proto/runtime/state';
import { OverlayHost } from '@/proto/runtime/OverlayHost';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    BarlowSemiCondensed_500Medium,
    BarlowSemiCondensed_600SemiBold,
    BarlowSemiCondensed_700Bold,
    RobotoMono_400Regular,
    RobotoMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) void SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <PrototypeProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 300,
            contentStyle: { backgroundColor: '#F4F6FA' },
          }}
        />
        <OverlayHost />
        <Chrome />
      </PrototypeProvider>
    </SafeAreaProvider>
  );
}

/** The prototype switches its status bar per screen; so does the app. */
function Chrome() {
  const { screen } = useStore();
  return <StatusBar style={darkTop.includes(screen) ? 'light' : 'dark'} />;
}
