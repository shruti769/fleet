import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { screens } from '@/proto/screens';
import { fromRoute } from '@/proto/runtime/state';

/**
 * One route for every artboard. Ids travel with `.` written as `_`, so
 * `A27.S1` is reached at `/s/A27_S1`.
 */
export default function ScreenRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const screenId = fromRoute(id ?? '');
  const Screen = screens[screenId];

  if (!Screen) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#0F1B2A' }}>
          No screen for {screenId}
        </Text>
      </View>
    );
  }

  return <Screen />;
}
