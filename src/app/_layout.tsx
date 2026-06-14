import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { createExpensesTable } from "@/database/expenseDatabase";
import { prepareNotificationsAsync } from "@/services/notifications";

export default function RootLayout() {
  useEffect(() => {
    async function setupApp() {
      try {
        await createExpensesTable();
        await prepareNotificationsAsync();
        console.log("SpendWise setup completed");
      } catch (error) {
        console.log("App setup error:", error);
      }
    }

    setupApp();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerShadowVisible: false,
          headerTintColor: "#14213D",
          contentStyle: {
            backgroundColor: "#F4F7FB",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "SpendWise",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="add-expense"
          options={{
            title: "Expense",
          }}
        />
        <Stack.Screen
          name="expenses"
          options={{
            title: "Expense History",
          }}
        />
        <Stack.Screen
          name="explore"
          options={{
            title: "Insights",
          }}
        />
        <Stack.Screen
          name="budgets"
          options={{
            title: "Budgets",
          }}
        />
        <Stack.Screen
          name="reminders"
          options={{
            title: "Reminders",
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: "Settings",
          }}
        />
      </Stack>
    </>
  );
}
