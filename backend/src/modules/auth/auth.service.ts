import type { RegisterInput } from "./auth.validation.js";
import { hashPassword } from "../../utils/passwords.js";
import { users } from "../../db/schema/users.schema.js";
import { db } from "../../db/connection.js";
import { eq } from "drizzle-orm";
import { generateToken } from "../../utils/jwt.js";

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

  const idx = Math.floor(Math.random() * 100) + 1;

  const randomAvatar = `https://avatarapi.runflare.run/public/${idx}.png`;

  const [user] = await db
    .insert(users)
    .values({
      fullname: data.fullname,
      email: data.email,
      passwordHash,
      profileurl: randomAvatar,
    })
    .returning({
      id: users.id,
      fullname: users.fullname,
      email: users.email,
      profileurl: users.profileurl,
      isonboarded: users.isonboarded,
      createdAt: users.createdAt,
    });

  if (!user) {
    throw new Error("User registration failed");
  }

  const token = await generateToken({
    id: user.id,
    fullname: user.fullname,
    email: user.email,
  });
  
  return {user,token,};
};