import { users } from "../../db/schema/users.schema.js"
import { db } from "../../db/connection.js"
import { eq, ne, notInArray, inArray, and } from "drizzle-orm"
import type { OnboardingData } from "./user.validation.js"
import { upsertStreamUser } from "../../utils/stream.js"


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

