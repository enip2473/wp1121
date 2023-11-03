import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// schemas define the structure of the tables in the database
// watch this playlist to learn more about database schemas:
// although it uses MySQL, the concepts are the same
// https://planetscale.com/learn/courses/mysql-for-developers/schema/introduction-to-schema
export const eventsTable = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    eventName: varchar("eventName").notNull(),
    startTime: timestamp("startTime").notNull(),
    endTime: timestamp("endTime").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    createdAtIndex: index("created_at_index").on(table.createdAt),
  }),
);

export const participationsTable = pgTable(
  "participations",
  {
    id: serial("id").primaryKey(),
    username: varchar("username")
      .notNull(),
    eventId: integer("eventId")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userIdIndex: index("username").on(table.username),
    eventIdIndex: index("eventId").on(table.eventId),
    uniqCombination: unique().on(table.username, table.eventId),
  }),
);

export const commentsTable = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    username: varchar("username")
      .notNull(),
    eventId: integer("eventId")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    content: varchar("content", { length: 280 }).notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    eventIdIndex: index("eventId").on(table.eventId),
  }),
);

export const timeTable = pgTable(
  "availableTimes",
  {
    id: serial("id").primaryKey(),
    username: varchar("username")
      .notNull(),
    eventId: integer("eventId")
      .notNull()
      .references(() => eventsTable.id, { onDelete: "cascade" }),
    availableTime: integer("availableTime")
      .notNull(),
  },
  (table) => ({
    uniqCombination: unique().on(table.username, table.eventId, table.availableTime),
    eventIdIndex: index("eventId").on(table.eventId),
  }),
);
