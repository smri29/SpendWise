import * as LocalAuthentication from "expo-local-authentication";

export async function getAppLockAvailabilityAsync() {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return {
    available: hasHardware && isEnrolled,
    hasHardware,
    isEnrolled,
  };
}

export async function authenticateAppUnlockAsync() {
  return LocalAuthentication.authenticateAsync({
    biometricsSecurityLevel: "weak",
    disableDeviceFallback: false,
    promptMessage: "Unlock SpendWise",
    promptSubtitle: "Use biometrics, PIN, pattern, or passcode",
    promptDescription: "Protect your private budgeting data",
    cancelLabel: "Cancel",
  });
}
