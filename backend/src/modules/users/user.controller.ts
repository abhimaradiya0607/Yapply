import type { Request, Response } from "express";


import {allfriends, allrecommendedUser, completeOnboarding, sendFriendRequetsService,} from './user.service.js';


export const onboard = async (req: Request,res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const updatedUser = await completeOnboarding(req.user.id,req.body);

    return res.status(200).json({
      success: true,
      message: "Onboarding completed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Onboarding controller error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRecommendedUsers=async (req:Request,res:Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({success: false,message: "Unauthorized",});
        }
        const recommendedUsers=await allrecommendedUser(req.user.id);
        return res.status(200).json({success: true,users: recommendedUsers,});

    } catch (error) {
        console.error("Error in getRecommendedUsers",error);
        return res.status(500).json({success: false,message: "Internal server error",});
        }
}

export const getMyfriends=async (req:Request,res:Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({success: false,message: "Unauthorized",});
        }
        const friends = await allfriends(req.user.id);

        return res.status(200).json({success: true,friends,});
    } catch (error) {
        console.error("Error in getMyFriendsController:", error);

        return res.status(500).json({success: false,message: "Internal server error"});
    }
}

type SendFriendRequestParams = {
  recipientId: string;
};

export const sentFriendRequest=async (req:Request<SendFriendRequestParams>,res:Response) => {
  try {
    const senderId=req.user?.id;

    if(!senderId){
      throw new Error('Un-authorized accesss plz authorized');
    }

    const {recipientId}=req.params;

    const friendRequest=await sendFriendRequetsService(senderId,recipientId);

    return res.status(201).json({success: true,message: "Friend request sent successfully",data: friendRequest,});
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error);

    return res.status(500).json({success: false,message: "Internal Server Error",})
  }
}
