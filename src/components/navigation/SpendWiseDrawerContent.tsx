import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "expo-router/drawer";
import { type Href, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

const drawerItems = [
  { label: "Home", routeName: "index", href: "/" as Href, icon: "home-outline" as const },
  { label: "View Logs", routeName: "view", href: "/view" as Href, icon: "grid-outline" as const },
  {
    label: "Add Entry",
    routeName: "add",
    href: "/add" as Href,
    icon: "add-circle-outline" as const,
  },
  {
    label: "Analytics & Export",
    routeName: "analytics",
    href: "/analytics" as Href,
    icon: "pie-chart-outline" as const,
  },
  {
    label: "Settings",
    routeName: "settings",
    href: "/settings" as Href,
    icon: "settings-outline" as const,
  },
  {
    label: "Feedback & About",
    routeName: "feedback",
    href: "/feedback" as Href,
    icon: "chatbubble-ellipses-outline" as const,
  },
] as const;

export function SpendWiseDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
      style={styles.drawer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.shell}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.brandCard}>
          <Text style={styles.brandTitle}>SpendWise</Text>
          <Text style={styles.brandTagline}>Local | Private | Simple Budgeting</Text>
          <Text style={styles.brandSlogan}>
            Confidence in your spending, completely on your terms.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionEyebrow}>Navigate</Text>

          {drawerItems.map((item) => {
            const focused = props.state.routeNames[props.state.index] === item.routeName;

            return (
              <Pressable
                key={item.routeName}
                onPress={() => router.push(item.href)}
                style={({ pressed }) => [
                  styles.navItem,
                  focused && styles.navItemActive,
                  pressed && styles.navItemPressed,
                ]}
              >
                <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={focused ? SpendWiseTheme.colors.text : SpendWiseTheme.colors.textMuted}
                  />
                </View>

                <View style={styles.navCopy}>
                  <Text style={[styles.navLabel, focused && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                </View>

                {focused ? (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Open</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="lock-closed-outline" size={18} color={SpendWiseTheme.colors.text} />
            <Text style={styles.infoText}>Private local data</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={SpendWiseTheme.colors.text}
            />
            <Text style={styles.infoText}>Offline-first control</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons
              name="document-text-outline"
              size={18}
              color={SpendWiseTheme.colors.text}
            />
            <Text style={styles.infoText}>Exports and backups in Settings</Text>
          </View>
        </View>

        <Text style={styles.footerText}>SpendWise v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: SpendWiseTheme.colors.backgroundSoft,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 28,
    backgroundColor: SpendWiseTheme.colors.backgroundSoft,
  },
  shell: {
    flex: 1,
    gap: 18,
  },
  glowTop: {
    position: "absolute",
    top: -48,
    left: -92,
    width: 250,
    height: 250,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  glowBottom: {
    position: "absolute",
    right: -110,
    bottom: 18,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  brandCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
  },
  brandTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  brandTagline: {
    marginTop: 6,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  brandSlogan: {
    marginTop: 10,
    color: SpendWiseTheme.colors.text,
    opacity: 0.8,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.42)",
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.34)",
  },
  sectionEyebrow: {
    paddingHorizontal: 6,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  navItem: {
    minHeight: 68,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  navItemActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: SpendWiseTheme.colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  navItemPressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.48)",
  },
  iconWrapActive: {
    backgroundColor: "rgba(255,245,157,0.9)",
  },
  navCopy: {
    flex: 1,
  },
  navLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 18,
    fontWeight: "700",
  },
  navLabelActive: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
  },
  activeBadge: {
    borderRadius: 999,
    backgroundColor: SpendWiseTheme.colors.text,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activeBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  infoCard: {
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.58)",
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.36)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  footerText: {
    marginTop: "auto",
    textAlign: "center",
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    paddingBottom: 4,
  },
});
