import { users } from "../../db/schema/users.schema.js"
import { db } from "../../db/connection.js"
import { eq ,ne, notInArray,inArray} from "drizzle-orm"
import { OnboardingData } from "./user.validation.js"
import { upsertStreamUser } from "../../utils/stream.js"
import { and ,or} from "drizzle-orm"
import { friendRequests } from "../../db/schema/friend-request.schema.js"


export const completeOnboarding=async (userId:string,onboarddata:OnboardingData) => {

    const [updatedUser]=await db.update(users).set({
        fullname:onboarddata.fullname,
        bio:onboarddata.bio,
        nativelanguage:onboarddata.nativelanguage,
        learninglanguage:onboarddata.learninglanguage,
        location:onboarddata.location,
        isonboarded:true,
        updatedAt:new Date()
    }).where(eq(users.id,userId))
    .returning({
        id: users.id,
      fullname: users.fullname,
      email: users.email,
      bio: users.bio,
      profileurl: users.profileurl,
      nativelanguage: users.nativelanguage,
      learninglanguage: users.learninglanguage,
      location: users.location,
      isonboarded: users.isonboarded,
      });

    if (!updatedUser) {
        throw new Error("User not found while completing onboarding");
    }

    try {
        await upsertStreamUser({
          id:updatedUser.id.toString(),
          name:updatedUser.fullname,
          image:updatedUser.profileurl||"",
        })
        console.log(`Stream user updated with details for ${updatedUser.fullname}`);
      } catch (error) {
        throw new Error("Error Updating schema in stream for user ");
      }

    return updatedUser;
}

export const allrecommendedUser=async (currentUserId:string) => {

    const [currentUser]=await db.select({
        friends:users.friends,
    })
    .from(users)
    .where(eq(users.id,currentUserId))
    .limit(1)

    if(!currentUser){
        throw new Error("Current user not found");
    }

    const friendIds=currentUser.friends??[]

    const conditions=[
        ne(users.id,currentUserId),
        eq(users.isonboarded,true),
    ];

    if(friendIds.length>0){
        conditions.push(notInArray(users.id,friendIds));
    }

    const recommendedUser=await db.select({
      id: users.id,
      fullname: users.fullname,
      bio: users.bio,
      profileurl: users.profileurl,
      nativelanguage: users.nativelanguage,
      learninglanguage: users.learninglanguage,
      location: users.location,
      isonboarded: users.isonboarded,
    })
    .from(users)
    .where(and(...conditions))
    
    return recommendedUser;
}

export const allfriends=async (currentUserId:string) => {

    const [currentUser] = await db
    .select({
    friends: users.friends,
    })
    .from(users)
    .where(eq(users.id, currentUserId))
    .limit(1);

    if (!currentUser) {
        throw new Error("Current user not found");
    }

    const friendIds = currentUser.friends ?? [];

    if (friendIds.length === 0) {
        return [];
    }

    const friends = await db
    .select({
      id: users.id,
      fullname: users.fullname,
      email: users.email,
      bio: users.bio,
      profileurl: users.profileurl,
      nativelanguage: users.nativelanguage,
      learninglanguage: users.learninglanguage,
      location: users.location,
      isonboarded: users.isonboarded,
    })
    .from(users)
    .where(inArray(users.id, friendIds));

    return friends;
}

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
