import { pgTable, text, serial, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const farmersTable = pgTable("farmers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  village: text("village").notNull(),
  crop: text("crop").notNull(),
  quantity: real("quantity").notNull(),
  moisture: text("moisture").notNull(),
  paymentStatus: text("payment_status").notNull().default("Pending"),
  bankAccount: text("bank_account").notNull(),
  cropGrade: text("crop_grade"),
  harvestDate: text("harvest_date"),
  notes: text("notes"),
  profilePhotoUrl: text("profile_photo_url"),
  mediaUrls: text("media_urls").array().notNull().default([]),
  cropStatus: text("crop_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertFarmerSchema = createInsertSchema(farmersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFarmer = z.infer<typeof insertFarmerSchema>;
export type Farmer = typeof farmersTable.$inferSelect;
