import type { CookieOptions, Request, Response } from "express";
import { loginUser, loginWithGoogle, logoutUser, registerUser } from "./auth.service.js";
import { AppError } from "../../utils/app-error.js";

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
};

const setAuthCookie = (res: Response, token: string) => {
  res.cookie("jwt", token, {
    ...authCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { user, token } = await registerUser(req.body);

    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

export const login=async (req:Request,res:Response) => {
  try {
    const {user,token}=await loginUser(req.body);

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "User loggedIn successfully",
      user,
    });

  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Invalid credentials"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (
      error instanceof Error &&
      error.message.includes("Continue with Google")
    ) {
      return res.status(400).json({
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
          : "Something went wrong during login",
    });
  }
}


export const googlelogin=async (req:Request,res:Response) => {
  try {
    //step-1 check the code from frontend
    const { code } = req.body;

    if (!code || typeof code !== "string") {
      return res.status(400).json({
        success: false,
        message: "Google authorization code is required",
      });
    }

    const { user, token } = await loginWithGoogle(code);

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      user,
    });

  } catch (error) {
    console.error("Google login error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(401).json({
      success: false,
      message: "Google login failed",
    });
  }
};


export const logout=async (_req:Request,res:Response) => {

  const result=await logoutUser();

  try {
    res.clearCookie("jwt", authCookieOptions);

    return res.status(200).json({
      success:true,
      message:result.message
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
    });
  }
}


