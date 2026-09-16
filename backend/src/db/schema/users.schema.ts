import {pgTable,uuid,varchar,text,timestamp,boolean} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm';
import { friendRequests } from './friend-request.schema.js';


export const users=pgTable('users',{
    id:uuid('id').primaryKey().defaultRandom(),
    fullname:varchar('full_name',{length:255}).notNull(),
    email:varchar('email',{length:255}).notNull().unique(),
    passwordHash:varchar('password_hash',{length:255}),
    bio:text('bio').default(""),
    profileurl:varchar('avatar_url',{length: 500}).default(""),
    nativelanguage:varchar('native_language',{length:100}).default(""),
    learninglanguage:varchar('learning_language',{length:100}).default(""),
    location:varchar('location',{length:255}).default(""),
    isonboarded:boolean('is_onboarded').default(false).notNull(),
    friends: uuid("friends").array().default([]).notNull(),
    createdAt: timestamp("created_at", {withTimezone: true,}).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", {withTimezone: true,}).defaultNow().notNull(),
    });

export const usersRealtions=relations(
    users,
    ({many})=>({
        sentFriendRequets:many(friendRequests,{
            relationName:"sentFriendRequests",
        }),
        receivedFriendRequest:many(friendRequests,{
            relationName:"receivedFriendRequests",
        }),
    })
);