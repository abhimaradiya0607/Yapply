import type { Request, Response } from "express";


import {acceptFriendRequestService, getFriendRequestService, getOutgoingFriendRequestsService, sendFriendRequetsService,} from './friends.service.js';


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

      const message =
        error instanceof Error ? error.message : "Internal Server Error";

      if (message === "Un-authorized accesss plz authorized") {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (message === "Recipient not found") {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      if (
        message === "You can't send a friend request to yourself" ||
        message === "You are already friends with this user" ||
        message === "A friend request already exists between you and this user"
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }
  
      return res.status(500).json({success: false,message: "Internal Server Error",})
    }
  }
  
  
  type AcceptFriendRequestParams = {
    id: string;
  };
  
  export async function acceptFriendRequest(req: Request<AcceptFriendRequestParams>,res: Response) {
    try {
      // Logged-in user
  
      const currentUserId = req.user!.id;
  
      // Friend request ID from URL
  
      const { id: requestId } = req.params;
  
      // Call service
  
      const friendRequest =await acceptFriendRequestService(requestId,currentUserId);
  
      return res.status(200).json({success: true,message: "Friend request accepted successfully",data: friendRequest,});
  
    } catch (error) {
      console.error(
        "Error in acceptFriendRequest controller:",
        error
      );
  
      const message =
        error instanceof Error
          ? error.message
          : "Internal Server Error";
  
      if (message === "Friend request not found") {
        return res.status(404).json({
          success: false,
          message,
        });
      }
  
      if (
        message ===
        "You are not authorized to accept this request"
      ) {
        return res.status(403).json({
          success: false,
          message,
        });
      }
  
      if (
        message ===
        "This friend request is no longer pending"
      ) {
        return res.status(400).json({
          success: false,
          message,
        });
      }
  
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }

  export async function getFriendRequests(req: Request,res: Response) {
    try {
    const currentUserId = req.user!.id;
  
    const friendRequests =
        await getFriendRequestService(currentUserId);
  
    return res.status(200).json({
        success: true,
        data: friendRequests,
    });
  
    } catch (error) {
      console.error(
        "Error in getFriendRequests controller:",
        error
    );
  
    return res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
    }
}

export async function getOutgoingFriendRequests(
    req: Request,
    res: Response
  ) {
    try {
      const currentUserId = req.user!.id;
  
      const outgoingRequests =
        await getOutgoingFriendRequestsService(
          currentUserId
        );
  
      return res.status(200).json({
        success: true,
        data: outgoingRequests,
      });
  
    } catch (error) {
      console.error(
        "Error in getOutgoingFriendRequests controller:",
        error
      );
  
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }