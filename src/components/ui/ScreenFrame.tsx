import { type PropsWithChildren } from "react";
import {
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SpendWiseTheme } from "@/theme/spendwise";

type ScreenFrameProps = PropsWithChildren<{
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}>;

export function ScreenFrame({
  children,
  scrollable = true,
  contentContainerStyle,
}: ScreenFrameProps) {
  const content = <View style={[styles.content, contentContainerStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.background}>
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobBottomRight]} />
        <View style={[styles.glow, styles.glowCenter]} />
        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{content}</View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: SpendWiseTheme.colors.background,
  },
  background: {
    flex: 1,
    backgroundColor: SpendWiseTheme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  blob: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.48)",
    shadowColor: SpendWiseTheme.colors.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 3,
  },
  blobTopLeft: {
    width: 340,
    height: 340,
    top: -140,
    left: -140,
    borderBottomRightRadius: 180,
    borderBottomLeftRadius: 120,
    borderTopRightRadius: 220,
    transform: [{ rotate: "-8deg" }],
  },
  blobBottomRight: {
    width: 370,
    height: 410,
    right: -150,
    bottom: -200,
    borderTopLeftRadius: 220,
    borderTopRightRadius: 120,
    borderBottomLeftRadius: 200,
    transform: [{ rotate: "8deg" }],
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  glowCenter: {
    width: 360,
    height: 360,
    left: 18,
    top: 210,
  },
});
