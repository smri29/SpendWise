import { Ionicons } from "@expo/vector-icons";
import { Drawer, DrawerToggleButton } from "expo-router/drawer";

import { SpendWiseDrawerContent } from "@/components/navigation/SpendWiseDrawerContent";
import { SpendWiseTheme } from "@/theme/spendwise";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <SpendWiseDrawerContent {...props} />}
      screenOptions={{
        headerTransparent: true,
        headerTitleStyle: {
          color: SpendWiseTheme.colors.text,
          fontWeight: "800",
          fontSize: 22,
        },
        headerTintColor: SpendWiseTheme.colors.text,
        headerLeft: () => <DrawerToggleButton tintColor={SpendWiseTheme.colors.text} />,
        headerShadowVisible: false,
        sceneStyle: {
          backgroundColor: SpendWiseTheme.colors.background,
        },
        drawerActiveTintColor: SpendWiseTheme.colors.text,
        drawerInactiveTintColor: SpendWiseTheme.colors.textMuted,
        drawerType: "front",
        drawerStyle: {
          width: 336,
          backgroundColor: SpendWiseTheme.colors.backgroundSoft,
        },
        overlayColor: "rgba(41, 42, 20, 0.32)",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "SpendWise",
          drawerLabel: "Home",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="view"
        options={{
          title: "View Logs",
          drawerLabel: "View Logs",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="add"
        options={{
          title: "Add Entry",
          drawerLabel: "+ Add",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="analytics"
        options={{
          title: "Analytics & Export",
          drawerLabel: "Analytics & Export",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
      <Drawer.Screen
        name="feedback"
        options={{
          title: "Feedback & About",
          drawerLabel: "Feedback & About",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" color={color} size={size} />
          ),
        }}
      />
    </Drawer>
  );
}
