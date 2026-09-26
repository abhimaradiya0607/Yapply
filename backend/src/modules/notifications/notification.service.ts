import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { db } from "../../db/connection.js";
import { friendRequests } from "../../db/schema/friend-request.schema.js";
import {
  notifications,
  notificationTypeEnum,
} from "../../db/schema/notification.schema.js";
import { users } from "../../db/schema/users.schema.js";

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

type Database = typeof db;
type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
type DbClient = Database | Transaction;

const NOTIFICATION_LIMIT = 50;

const actorColumns = {
  id: users.id,
  fullname: users.fullname,
  profileurl: users.profileurl,
  location: users.location,
  bio: users.bio,
  nativeLanguage: users.nativelanguage,
  learningLanguage: users.learninglanguage,
};

const visibleToRecipient = (currentUserId: string) =>
  and(
    eq(notifications.recipientId, currentUserId),
    or(
      eq(notifications.type, "friend_request_accepted"),
      and(
        eq(notifications.type, "friend_request"),
        eq(friendRequests.status, "pending"),
      ),
    ),
  );

export async function createNotification(
  dbClient: DbClient,
  input: {
    recipientId: string;
    actorId: string;
    type: NotificationType;
    entityId: string;
  },
) {
  await dbClient
    .insert(notifications)
    .values(input)
    .onConflictDoNothing({
      target: [
        notifications.recipientId,
        notifications.type,
        notifications.entityId,
      ],
    });
}

export async function markEntityNotificationRead(
  dbClient: DbClient,
  input: {
    recipientId: string;
    type: NotificationType;
    entityId: string;
  },
) {
  await dbClient
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, input.recipientId),
        eq(notifications.type, input.type),
        eq(notifications.entityId, input.entityId),
        isNull(notifications.readAt),
      ),
    );
}

export async function getNotifications(currentUserId: string) {
  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      entityId: notifications.entityId,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      actor: actorColumns,
    })
    .from(notifications)
    .innerJoin(users, eq(notifications.actorId, users.id))
    .leftJoin(friendRequests, eq(notifications.entityId, friendRequests.id))
    .where(visibleToRecipient(currentUserId))
    .orderBy(desc(notifications.createdAt))
    .limit(NOTIFICATION_LIMIT);
}

export async function getUnreadNotificationCount(currentUserId: string) {
  const [row] = await db
    .select({
      unreadCount: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .leftJoin(friendRequests, eq(notifications.entityId, friendRequests.id))
    .where(and(visibleToRecipient(currentUserId), isNull(notifications.readAt)));

  return row?.unreadCount ?? 0;
}

export async function markNotificationAsRead(
  notificationId: string,
  currentUserId: string,
) {
  const [existing] = await db
    .select({
      id: notifications.id,
      recipientId: notifications.recipientId,
      readAt: notifications.readAt,
    })
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);

  if (!existing) {
    throw new Error("Notification not found");
  }

  if (existing.recipientId !== currentUserId) {
    throw new Error("You are not authorized to update this notification");
  }

  if (existing.readAt) {
    return existing;
  }

  const [updated] = await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.recipientId, currentUserId),
      ),
    )
    .returning({
      id: notifications.id,
      readAt: notifications.readAt,
    });

  return updated;
}

export async function markAllNotificationsAsRead(currentUserId: string) {
  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(notifications.recipientId, currentUserId),
        isNull(notifications.readAt),
      ),
    );
}
