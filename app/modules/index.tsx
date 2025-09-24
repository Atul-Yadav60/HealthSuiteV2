import { Redirect } from "expo-router";

export default function ModulesIndex() {
  // Redirect to home for now; update to show modules dashboard if needed
  return <Redirect href="/(tabs)/home" />;
}
