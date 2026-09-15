import {pgTable,uuid,varchar,timestamp,unique,} from "drizzle-orm/pg-core";
import { users } from "./users.schema.js";

export const oauthAccounts = pgTable('oauth_accounts',{
    id: uuid("id").defaultRandom().primaryKey(),
    userId:uuid('user_id').notNull().references(()=>
        users.id,{
            onDelete:'cascade'
        }),
    provider: varchar("provider", {length: 50,}).notNull(),
    providerAccountId: varchar("provider_account_id", {length: 255,}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },

    (table)=>[
        unique("oauth_provider_account_unique").on(
            table.provider,
            table.providerAccountId
        ),
    ]
)