import { Href, Link } from "expo-router";
import { openBrowserAsync } from "expo-web-browser";
import { Platform, StyleSheet } from "react-native";

/**
 * Always uses bold, accessible style for links. Opens in-app browser on native.
 */
export function ExternalLink({
  href,
  style,
  ...rest
}: {
  href: Href & string;
  style?: any;
  [key: string]: any;
}) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      style={[styles.link, style]}
      onPress={async (event) => {
        if (Platform.OS !== "web") {
          event.preventDefault();
          await openBrowserAsync(href);
        }
      }}
      accessibilityRole="link"
      accessibilityLabel={href}
    />
  );
}

const styles = StyleSheet.create({
  link: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 16,
    textDecorationLine: "underline",
    letterSpacing: 0.2,
    paddingVertical: 6,
  },
});
