import { index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const roomStatusEnum = pgEnum("room_status", ["active", "ended"]);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    roomCode: varchar("room_code", { length: 16 }).notNull().unique(),
    hostId: uuid("host_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: roomStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
  },
  (table) => [index("rooms_host_id_idx").on(table.hostId)],
);
