import type { Request, Response } from "express";
import { registerUser } from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { user, token } = await registerUser(req.body);

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    // This prints the complete error in your terminal
    console.error("========== REGISTER ERROR ==========");
    console.error(error);
    console.error("====================================");

    if (
      error instanceof Error &&
      error.message.includes("already registered")
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.message
            : String(error)
          : "Something went wrong during registration",
    });
  }
};