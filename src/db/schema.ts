import { pgTable, serial, varchar, boolean, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: varchar("uid", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  isPro: boolean("is_pro").default(false).notNull(),
  theme: varchar("theme", { length: 50 }).default("emerald").notNull(),
  activeModel: varchar("active_model", { length: 100 }).default("gemini-3.5-flash").notNull(),
  customApiKey: text("custom_api_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessionLogs = pgTable("session_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }), // Can store Firebase UID or be null for guests
  type: varchar("type", { length: 100 }).notNull(), // SYSTEM, AUTH, AI, SYSTEM_DEBUG
  action: text("action").notNull(),
  status: varchar("status", { length: 50 }).notNull(), // SUCCESS, STABLE, ERROR
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
