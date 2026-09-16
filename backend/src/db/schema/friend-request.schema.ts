import { sql } from "drizzle-orm";
import { pgTable,uuid,timestamp,pgEnum,unique,index,check,} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";
import { relations } from "drizzle-orm";


export const friendRequestStatusEnum=pgEnum(
    "friend_request_status",
    [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
    ]
);

export const friendRequests=pgTable("friend_requests",{
    id:uuid('id').defaultRandom().primaryKey(),
    senderId:uuid('sender_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
    recipientId:uuid('recipient_id').notNull().references(()=>users.id,{onDelete:'cascade'}),
    status:friendRequestStatusEnum('status').default('pending').notNull(),
    createdAt: timestamp("created_at", {withTimezone: true,}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true,}).defaultNow().notNull(),
},

(table)=>[
    unique("unique_friend_request")
    .on(table.senderId,table.recipientId),

    index("friend_requests_sender_idx")
    .on(table.senderId),

    index("friend_requests_recipient_idx")
    .on(table.recipientId),

    check("no_self_friend_request",
    sql`${table.senderId}<>${table.recipientId}`
    ),
    ]
)

export const friendRequestsRelations=relations(
    friendRequests,
    ({one})=>({
        sender:one(users,{
            fields: [friendRequests.senderId],
            references: [users.id],
            relationName: "sentFriendRequests",
        }),
        recipitent:one(users,{
            fields:[friendRequests.recipientId],
            references:[users.id],
            relationName:"receivedFriendRequests"
        })
    })
)

