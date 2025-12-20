import { pgTable, timestamp, varchar, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
	email: varchar("email", { length: 256 }).unique().notNull(),
	password: varchar("password", { length: 256}).notNull().default("unset"),
});

export type NewUser = typeof users.$inferInsert;

export const chirps = pgTable("chirps", {
	id: uuid("id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
	body: varchar({ length: 140 }).notNull(),
	user_id: uuid("user_id").references(() => users.id, { onDelete: 'cascade'}),
});

export type NewChirp = typeof chirps.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;
