import { useLocalSearchParams } from "expo-router";
import { DynamicScreen } from "@/features/driver-flow";
export default function ScreenRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DynamicScreen id={id} />;
}
