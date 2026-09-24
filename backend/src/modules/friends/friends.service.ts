import { friendRequests } from "../../db/schema/friend-request.schema.js"
import { sql } from "drizzle-orm"
import { users } from "../../db/schema/users.schema.js"
import { db } from "../../db/connection.js"
import { eq } from "drizzle-orm"
import { and ,or} from "drizzle-orm"

export const sendFriendRequetsService=async (senderId:string,recipientId:string) => {

    if(senderId===recipientId){
      throw new Error(
        "You can't send a friend request to yourself"
      );
    }
  
    const [recipient]=await db.select({
      id:users.id,
      friends:users.friends,
    }).from(users)
    .where(eq(users.id,recipientId))
    .limit(1);
  
    if(!recipient){
      throw new Error("Recipient not found");
    }
  
    if (recipient.friends?.includes(senderId)) {
      throw new Error(
        "You are already friends with this user"
      );
    }
  
    const [existingRequest]=await db.select().from(friendRequests).where(
      or(
        and(
          eq(friendRequests.senderId,senderId),
          eq(friendRequests.recipientId,recipientId),
        ),
        and(
          eq(friendRequests.senderId,recipientId),
          eq(friendRequests.recipientId,senderId),
        )
      )
    ).limit(1);
  
    if (existingRequest) {
      throw new Error(
        "A friend request already exists between you and this user"
      );
    }
  
    const [friendRequest] = await db
    .insert(friendRequests)
    .values({
      senderId,
      recipientId,
      status: "pending",
    })
    .returning();
  
  return friendRequest;
}
  
export const acceptFriendRequestService=async (requestId:string,currentUserId:string) => {
  
      // 1. Find the friend request
    
    const [friendRequest]=await db.select().from(friendRequests).where(eq(friendRequests.id,requestId));
  
      // 2. Check if request exists
  
    if (!friendRequest) {
      throw new Error("Friend request not found");
    }
  
       // 3. Verify current user is the recipient
  
    if(friendRequest.recipientId!==currentUserId){
      throw new Error(
        "You are not authorized to accept this request"
      );
    }
  
        // 4. Check request status
  
    if (friendRequest.status !== "pending") {
      throw new Error(
        "This friend request is no longer pending"
      );
    }
  
     // 5. Update everything inside a transaction
  
    const result =await db.transaction(async (tx) => {
  
      // Update request status
  
  
      const [updatedRequest]= await tx
      .update(friendRequests)
      .set({
        status: "accepted",
        updatedAt: new Date(),
      })
      .where(eq(friendRequests.id,requestId))
      .returning();
  
       // Add recipient to sender's friends
  
      await tx .update(users)
      .set({
        friends:sql`
          array_append(
              COALESCE(${users.friends}, ARRAY[]::uuid[]),
              ${friendRequest.recipientId}::uuid
            )
        `,
      })
      .where(eq(users.id, friendRequest.senderId));
  
         // Add sender to recipient's friends
  
      await tx
      .update(users)
      .set({
        friends: sql`
          array_append(
            COALESCE(${users.friends}, ARRAY[]::uuid[]),
            ${friendRequest.senderId}::uuid
          )
        `,
      })
      .where(eq(users.id, friendRequest.recipientId));
  
    return updatedRequest;
  });
    return result;
}

export const rejectFriendRequestService = async (
  requestId: string,
  currentUserId: string,
) => {
  const [friendRequest] = await db
    .select()
    .from(friendRequests)
    .where(eq(friendRequests.id, requestId));

  if (!friendRequest) {
    throw new Error("Friend request not found");
  }

  if (friendRequest.recipientId !== currentUserId) {
    throw new Error("You are not authorized to reject this request");
  }

  if (friendRequest.status !== "pending") {
    throw new Error("This friend request is no longer pending");
  }

  const [updatedRequest] = await db
    .update(friendRequests)
    .set({
      status: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(friendRequests.id, requestId))
    .returning();

  return updatedRequest;
};

export const getFriendRequestService = async (
    currentUserId: string
  ) => {
    // 1. Incoming pending requests
    // Other users -> current user
  
    const incomingRequest = await db
      .select({
        requestId: friendRequests.id,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
  
        sender: {
          id: users.id,
          fullname: users.fullname,
          profileurl: users.profileurl,
          location: users.location,
          bio: users.bio,
          nativeLanguage: users.nativelanguage,
          learningLanguage: users.learninglanguage,
        },
      })
      .from(friendRequests)
      .innerJoin(
        users,
        eq(friendRequests.senderId, users.id)
      )
      .where(
        and(
          eq(friendRequests.recipientId, currentUserId),
          eq(friendRequests.status, "pending")
        )
      );
  
    // 2. Accepted requests
    // Current user can be sender OR recipient
  
    const acceptedRequests = await db
      .select({
        requestId: friendRequests.id,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
  
        friend: {
          id: users.id,
          fullname: users.fullname,
          profileurl: users.profileurl,
        },
      })
      .from(friendRequests)
      .innerJoin(
        users,
        or(
          and(
            eq(friendRequests.senderId, currentUserId),
            eq(friendRequests.recipientId, users.id)
          ),
          and(
            eq(friendRequests.recipientId, currentUserId),
            eq(friendRequests.senderId, users.id)
          )
        )
      )
      .where(
        and(
          or(
            eq(friendRequests.senderId, currentUserId),
            eq(friendRequests.recipientId, currentUserId)
          ),
          eq(friendRequests.status, "accepted")
        )
      );
  
    return {
      incomingRequest,
      acceptedRequests,
    };
  };

export async function getOutgoingFriendRequestsService(currentUserId: string) {
    const outgoingRequests = await db
      .select({
        requestId: friendRequests.id,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
  
        recipient: {
          id: users.id,
          fullname: users.fullname,
          profileurl: users.profileurl,
          nativeLanguage: users.nativelanguage,
          learningLanguage: users.learninglanguage,
        },
      })
      .from(friendRequests)
      .innerJoin(
        users,
        eq(friendRequests.recipientId, users.id)
      )
      .where(
        and(
          eq(friendRequests.senderId, currentUserId),
          eq(friendRequests.status, "pending")
        )
      );
  
    return outgoingRequests;
  }