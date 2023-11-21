import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/pg-core";

// schemas define the structure of the tables in the database
// watch this playlist to learn more about database schemas:
// although it uses MySQL, the concepts are the same
// https://planetscale.com/learn/courses/mysql-for-developers/schema/introduction-to-schema
export const usersTable = pgTable(
  "user",
  {
    id: serial("id").primaryKey(),
    displayName: varchar("displayName").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    idIndex: index("id_index").on(table.id)
  }),
);

export const chatroomsTable = pgTable(
  "chatroom",
  {
    id: serial("id").primaryKey(),
    chatroomName: varchar("chatroom_name").notNull(),
    pinnedMessageId: integer("pinned_message_id"),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    idIndex: index("id_index").on(table.id)
  }),
);

export const userChatroomsTable = pgTable(
  "user_chatroom",
  {
    userId: integer("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
    chatroomId: integer("chatroom_id")
                .notNull()
                .references(() => chatroomsTable.id, { onDelete: "cascade" }),
    lastRead: timestamp("last_read")
  },
  (table) => ({
    userIdIndex: index("user_id_index").on(table.userId),
    chatroomIdIndex: index("chatroom_id_index").on(table.chatroomId)
  }),
);

export const messagesTable = pgTable(
  "message",
  {
    id: serial("id").primaryKey(),
    chatroomId: integer("chatroom_id")
                .notNull()
                .references(() => chatroomsTable.id, { onDelete: "cascade" }),
    userId: integer("user_id")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),
    content: varchar("content").notNull(),
    isSystem: boolean("is_system").default(sql`false`),
    isPinned: boolean("is_pinned").default(sql`false`),
    isHidden: boolean("is_hidden").default(sql`false`),
    isDeleted: boolean("is_deleted").default(sql`false`),
    createdAt: timestamp("created_at").default(sql`now()`),
  },
  (table) => ({
    idIndex: index("id_index").on(table.id),
    chatroomIdIndex: index("chatroom_id_index").on(table.chatroomId),
    userIdIndex: index("user_id_index").on(table.userId),
  }),
);
