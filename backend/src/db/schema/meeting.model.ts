import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    pgEnum,
  } from "drizzle-orm/pg-core";
  
  import { users } from "./users.schema.js";
  
  
  // Meeting status
  export const meetingStatusEnum = pgEnum("meeting_status", [
    "waiting",
    "live",
    "ended",
  ]);
  
  
  // Meetings table
  export const meetings = pgTable("meetings", {
    id: uuid("id").defaultRandom().primaryKey(),
  
    // User who created the meeting
    hostId: uuid("host_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
      
    // Code users enter to join the meeting
    meetingCode: varchar("meeting_code", {
      length: 20,
    })
      .notNull()
      .unique(),
  
    // Optional name of the room
    title: varchar("title", {
      length: 100,
    }),
  
    // Current meeting state
    status: meetingStatusEnum("status")
      .notNull()
      .default("waiting"),
  
    // When the meeting record was created
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  
    // When someone actually started the meeting
    startedAt: timestamp("started_at", {
      withTimezone: true,
    }),
  
    // When the meeting ended
    endedAt: timestamp("ended_at", {
      withTimezone: true,
    }),
  });