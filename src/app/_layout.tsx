import { Stack } from "expo-router";
import { useEffect } from "react";

import { createExpensesTable } from "@/database/expenseDatabase";

export default function RootLayout() {
  useEffect(() => {
    async function setupDatabase() {
      try {
        await createExpensesTable();
        console.log("Database setup completed");
      } catch (error) {
        console.log("Database setup error:", error);
      }
    }

    setupDatabase();
  }, []);

  return (
    <Stack>
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
          title: "Add Expense",
        }}
      />

      <Stack.Screen
        name="expenses"
        options={{
          title: "Expenses",
        }}
      />
    </Stack>
  );
}