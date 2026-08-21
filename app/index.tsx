import { Redirect } from 'expo-router';

/** The flow starts at the splash artboard, A1. */
export default function Index() {
  return <Redirect href="/screens/A1" />;
}
