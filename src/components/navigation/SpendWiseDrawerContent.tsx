import { Ionicons } from "@expo/vector-icons";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "expo-router/drawer";
import { type Href, router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

const drawerItems = [
  { label: "Home", routeName: "index", href: "/" as Href, icon: "home-outline" as const },
  { label: "View Logs", routeName: "view", href: "/view" as Href, icon: "grid-outline" as const },
  { label: "+ Add", routeName: "add", href: "/add" as Href, icon: "add-circle-outline" as const },
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
];

export function SpendWiseDrawerContent(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContent}
      style={styles.drawer}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>SpendWise</Text>
        <Text style={styles.tagline}>Local • Private • Simple Budgeting</Text>
      </View>

      <View style={styles.menuCard}>
        {drawerItems.map((item) => {
          const focused = props.state.routeNames[props.state.index] === item.routeName;

          return (
            <DrawerItem
              key={item.routeName}
              label={item.label}
              focused={focused}
              labelStyle={[styles.label, focused && styles.labelActive]}
              style={[styles.item, focused && styles.itemActive]}
              icon={({ color, size }) => (
                <Ionicons name={item.icon} color={color} size={size} />
              )}
              activeTintColor={SpendWiseTheme.colors.text}
              inactiveTintColor={SpendWiseTheme.colors.textMuted}
              onPress={() => router.push(item.href)}
            />
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: "#FDF7AF",
  },
  scrollContent: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 14,
    backgroundColor: "#FDF7AF",
  },
  header: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 18,
  },
  logo: {
    fontSize: 28,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  tagline: {
    marginTop: 6,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
  },
  menuCard: {
    marginTop: 22,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.30)",
    paddingVertical: 10,
  },
  item: {
    borderRadius: 18,
    marginHorizontal: 8,
  },
  itemActive: {
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
  },
  labelActive: {
    fontWeight: "800",
  },
});
