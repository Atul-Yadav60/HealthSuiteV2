import { Redirect } from "expo-router";
import React from "react";

/**
 * Redirects to the main home tab.
 * In production, you might do onboarding or authentication here.
 */
export default function Index() {
  return <Redirect href="/(tabs)/home" />;
}
