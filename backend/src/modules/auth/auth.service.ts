import type { loginInput, RegisterInput } from "./auth.validation.js";
import { comparePassword, hashPassword } from "../../utils/passwords.js";
import { users } from "../../db/schema/users.schema.js";
import { db } from "../../db/connection.js";
import { eq,and } from "drizzle-orm";
import { generateToken } from "../../utils/jwt.js";
import { googleClient } from "../../config/google-oauth.js";
import { AppError } from "../../utils/app-error.js";
import { oauthAccounts } from "../../db/schema/oauth-accounts.schema.js";
import { upsertStreamUser } from "../../utils/stream.js";
import { generateAvatarUrl } from "../../utils/avatar.js";

export const registerUser = async (data: RegisterInput) => {

  const [existingUser] = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser) {
    throw new Error(
      "Email is already registered. Please use a different email."
    );
  }

  const passwordHash = await hashPassword(data.password);

  const [createdUser] = await db
  .insert(users)
  .values({
    fullname: data.fullname,
    email: data.email,
    passwordHash,
  })
  .returning({
    id: users.id,
    fullname: users.fullname,
    email: users.email,
    profileurl: users.profileurl,
    isonboarded: users.isonboarded,
    createdAt: users.createdAt,
  });

  if (!createdUser) {
    throw new Error("User registration failed");
  }

  const profileurl = generateAvatarUrl(createdUser.id);

  const [user] = await db
  .update(users)
  .set({
    profileurl,
    updatedAt: new Date(),
  })
  .where(eq(users.id, createdUser.id))
  .returning({
    id: users.id,
    fullname: users.fullname,
    email: users.email,
    profileurl: users.profileurl,
    isonboarded: users.isonboarded,
    createdAt: users.createdAt,
  });

if (!user) {
  throw new Error("Unable to save user avatar");
}

  try {
    await upsertStreamUser({
      id:user.id.toString(),
      name:user.fullname,
      image:user.profileurl??"",
    })
    console.log(`Stream user created for ${user.fullname}`);
  } catch (error) {
    console.error("Stream user creation failed:", error);

    throw new Error("Error creating stream user ");
  }

  const token = await generateToken({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
  });
  
  return {user,token,};
};

export const loginUser=async (loginData:loginInput) => {
  
  const [user]=await db.select({
    id: users.id,
    fullname: users.fullname,
    email: users.email,
    passwordHash: users.passwordHash,
    profileurl: users.profileurl,
    isonboarded: users.isonboarded,
    createdAt: users.createdAt,
  })
  .from(users)
  .where(eq(users.email,loginData.email))
  .limit(1);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.passwordHash) {
    throw new Error(
      "This account uses Google login. Continue with Google instead."
    );
  }

  const passCheck=await comparePassword(loginData.password,user.passwordHash);

  if(!passCheck){
    throw new Error("Invalid credentials");
  }

  const token=await generateToken({
    id:user.id,
    fullname:user.fullname,
    email:user.email,
  })
  const { passwordHash, ...safeUser } = user;

  return {
    user:safeUser,
    token,
  }
}

export const loginWithGoogle = async (code: string) => {
  // Step 1: Exchange Google's authorization code for tokens.
  const { tokens } = await googleClient.getToken(code);

  if (!tokens.id_token) {
    throw new AppError("Google ID token was not received", 401);
  }

  // Step 2: Verify Google's ID token.
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  // Step 3: Get Google user information.
  const googleUser = ticket.getPayload();

  if (!googleUser) {
    throw new AppError("Unable to verify Google account", 401);
  }

  const googleAccountId = googleUser.sub;
  const email = googleUser.email;
  const emailVerified = googleUser.email_verified;

  if (!googleAccountId) {
    throw new AppError("Google account ID is missing", 401);
  }

  if (!email) {
    throw new AppError("Google email is missing", 401);
  }

  if (!emailVerified) {
    throw new AppError("Google email is not verified", 401);
  }

  // Step 4: Check whether this Google account is already connected.
  const [existingOAuthAccount] = await db
    .select({
      oauthAccountId: oauthAccounts.id,
      userId: oauthAccounts.userId,
    })
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, "google"),
        eq(oauthAccounts.providerAccountId, googleAccountId)
      )
    )
    .limit(1);

  let user;

  // Step 5A: Existing Google account.
  if (existingOAuthAccount) {
    const [existingUser] = await db
      .select({
        id: users.id,
        fullname: users.fullname,
        email: users.email,
        profileurl: users.profileurl,
        isonboarded: users.isonboarded,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, existingOAuthAccount.userId))
      .limit(1);

    if (!existingUser) {
      throw new AppError("Connected Yapply user was not found", 404);
    }

    user = existingUser;
  } else {
    // Step 5B: Google account is not connected yet.
    const [existingEmailUser] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingEmailUser) {
      throw new AppError(
        "An account with this email already exists. Login with your password first, then connect Google from account settings.",
        409
      );
    }

    // Create the user and OAuth account inside one transaction.
    // If either insert fails, both operations are rolled back.
    user = await db.transaction(async (tx) => {
      // Step 5B-1: Create the new Yapply user.
      const [createdUser] = await tx
        .insert(users)
        .values({
          fullname: googleUser.name ?? email.split("@")[0],
          email,

          // Use Google's picture if available.
          // Otherwise, use the generated random avatar.
          profileurl: googleUser.picture ?? "",

          // Google users do not have a Yapply password.
          passwordHash: null,

          isonboarded: false,
        })
        .returning({
          id: users.id,
          fullname: users.fullname,
          email: users.email,
          profileurl: users.profileurl,
          isonboarded: users.isonboarded,
          createdAt: users.createdAt,
        });

      if (!createdUser) {
        throw new AppError("Unable to create Yapply user", 500);
      }

      const finalProfileUrl =createdUser.profileurl || generateAvatarUrl(createdUser.id);

      const [updatedUser] = await tx
      .update(users)
      .set({
        profileurl: finalProfileUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, createdUser.id))
      .returning({
        id: users.id,
        fullname: users.fullname,
        email: users.email,
        profileurl: users.profileurl,
        isonboarded: users.isonboarded,
        createdAt: users.createdAt,
      });

      if (!updatedUser) {
        throw new AppError("Unable to save Google user avatar", 500);
      }



      // Step 5B-2: Connect the Google account to the new Yapply user.
      await tx.insert(oauthAccounts).values({
        userId: updatedUser.id,
        provider: "google",
        providerAccountId: googleAccountId,
      });

      // Return the newly created user from the transaction.
      return updatedUser;
    });
  }

  try {
    await upsertStreamUser({
      id: user.id.toString(),
      name: user.fullname,
      image: user.profileurl ?? "",
    });
  } catch (error) {
    console.error("Stream user creation failed:", error);
    throw new Error("Error creating stream user ");
  }

  // Step 6: Generate Yapply JWT.
  const token = await generateToken({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
  });

  return {
    user,
    token,
  };
};


export const logoutUser=async() => {
  return {
    message: "User logged out successfully",
  };
}

