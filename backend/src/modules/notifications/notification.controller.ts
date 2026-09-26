import type { Request, Response } from "express";

import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.service.js";

export async function listNotifications(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const notifications = await getNotifications(currentUserId);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Error in listNotifications controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function unreadNotificationCount(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    const unreadCount = await getUnreadNotificationCount(currentUserId);

    return res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    console.error("Error in unreadNotificationCount controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

type NotificationIdParams = {
  id: string;
};

export async function readNotification(
  req: Request<NotificationIdParams>,
  res: Response,
) {
  try {
    const currentUserId = req.user!.id;
    const notification = await markNotificationAsRead(
      req.params.id,
      currentUserId,
    );

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error in readNotification controller:", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    if (message === "Notification not found") {
      return res.status(404).json({ success: false, message });
    }

    if (message === "You are not authorized to update this notification") {
      return res.status(403).json({ success: false, message });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

export async function readAllNotifications(req: Request, res: Response) {
  try {
    const currentUserId = req.user!.id;
    await markAllNotificationsAsRead(currentUserId);

    return res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error in readAllNotifications controller:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
