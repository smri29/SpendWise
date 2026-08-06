import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { createSchemaAsync, executeRollingPurge, seedDefaultsAsync } from "@/db/schema";

let sharedDatabase: SQLiteDatabase | null = null;
let databasePromise: Promise<SQLiteDatabase> | null = null;

/**
 * Centralizes low-level database bootstrapping so data modules can stay focused
 * on one use case each instead of repeating connection and setup concerns.
 */
export async function initializeDatabaseAsync(db: SQLiteDatabase) {
  sharedDatabase = db;
  await createSchemaAsync(db);
  await seedDefaultsAsync(db);
  await executeRollingPurge(db);
}

export async function getDatabaseAsync() {
  if (sharedDatabase) {
    return sharedDatabase;
  }

  if (!databasePromise) {
    databasePromise = openDatabaseAsync("spendwise.db").then(async (db) => {
      await initializeDatabaseAsync(db);
      return db;
    });
  }

  sharedDatabase = await databasePromise;
  return sharedDatabase;
}
