import type { Request, Response, NextFunction } from "express";
import { jwtVerify, type JWTPayload } from "jose";
import { createSecretKey } from "node:crypto";
import "dotenv/config";
import { eq } from "drizzle-orm";

import { users } from "../db/schema/users.schema.js";
import { db } from "../db/connection.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}

const JWT_SECRET = process.env.JWT_SECRET;
const secretKey = createSecretKey(JWT_SECRET, "utf-8");

type AuthTokenPayload = JWTPayload & {
  id: string;
  fullname: string;
  email: string;
};

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;

    if (!token || typeof token !== "string") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const { payload } = await jwtVerify<AuthTokenPayload>(
      token,
      secretKey
    );

    if (!payload.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token payload",
      });
    }

    const [user] = await db
      .select({
        id: users.id,
        fullname: users.fullname,
        email: users.email,
        profileurl: users.profileurl,
        isonboarded: users.isonboarded,
      })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User not found",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(
      "Error in protected route middleware:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired token",
    });
  }
};