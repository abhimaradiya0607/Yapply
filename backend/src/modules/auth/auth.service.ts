import type { loginInput, RegisterInput } from "./auth.validation.js";
import { comparePassword, hashPassword } from "../../utils/passwords.js";
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

export const logoutUser=async() => {
  return {
    message: "User logged out successfully",
  };
}