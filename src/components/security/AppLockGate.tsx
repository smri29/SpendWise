import { useEffect, useRef, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";

import { getSettingsSnapshot } from "@/db";
import {
  authenticateAppUnlockAsync,
  getAppLockAvailabilityAsync,
} from "@/services/appLock";
import { SpendWiseTheme } from "@/theme/spendwise";

export function AppLockGate() {
  const appState = useRef(AppState.currentState);
  const [needsUnlock, setNeedsUnlock] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInitialState() {
      try {
        const settings = await getSettingsSnapshot();
        if (!mounted) {
          return;
        }
        setNeedsUnlock(settings.appLockEnabled);
      } catch (error) {
        console.log("App lock initial load error:", error);
      }
    }

    void loadInitialState();

    const subscription = AppState.addEventListener("change", (nextState) => {
      void (async () => {
        const previousState = appState.current;
        appState.current = nextState;

        try {
          const settings = await getSettingsSnapshot();

          if (
            previousState === "active" &&
            (nextState === "inactive" || nextState === "background")
          ) {
            setNeedsUnlock(settings.appLockEnabled);
            setLockMessage(null);
          }

          if (
            settings.appLockEnabled &&
            (previousState === "inactive" || previousState === "background") &&
            nextState === "active"
          ) {
            setNeedsUnlock(true);
          }
        } catch (error) {
          console.log("App lock app-state error:", error);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!needsUnlock || isUnlocking) {
      return;
    }

    void handleUnlock();
  }, [isUnlocking, needsUnlock]);

  async function handleUnlock() {
    try {
      setIsUnlocking(true);
      setLockMessage(null);

      const availability = await getAppLockAvailabilityAsync();
      if (!availability.available) {
        setLockMessage(
          "Device authentication is not available. Disable app lock in Settings on a supported device.",
        );
        return;
      }

      const result = await authenticateAppUnlockAsync();
      if (result.success) {
        setNeedsUnlock(false);
        setLockMessage(null);
        return;
      }

      setLockMessage("Unlock was cancelled or failed. Try again to enter SpendWise.");
    } catch (error) {
      console.log("App unlock error:", error);
      setLockMessage("SpendWise could not verify your device lock right now.");
    } finally {
      setIsUnlocking(false);
    }
  }

  if (!needsUnlock) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>SpendWise Locked</Text>
        <Text style={styles.subtitle}>
          Unlock with your device biometrics, PIN, pattern, or passcode to continue.
        </Text>
        {lockMessage ? <Text style={styles.message}>{lockMessage}</Text> : null}
        <Pressable style={styles.button} onPress={() => void handleUnlock()} disabled={isUnlocking}>
          <Text style={styles.buttonText}>{isUnlocking ? "Unlocking..." : "Unlock SpendWise"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: "rgba(255,253,231,0.96)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    padding: 22,
    gap: 12,
  },
  title: {
    color: SpendWiseTheme.colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  message: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  button: {
    marginTop: 8,
    borderRadius: 20,
    backgroundColor: SpendWiseTheme.colors.text,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});
