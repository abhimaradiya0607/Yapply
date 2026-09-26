import { Router } from "express";

import { protectRoute } from "../../middlewares/auth.protectroute.js";
import { validateParams } from "../../middlewares/validate.middleware.js";
import {
  listNotifications,
  readAllNotifications,
  readNotification,
  unreadNotificationCount,
} from "./notification.controller.js";
import { notificationIdParamSchema } from "./notification.validation.js";

const router = Router();

router.use(protectRoute);

router.get("/", listNotifications);
router.get("/unread-count", unreadNotificationCount);
router.patch("/read-all", readAllNotifications);
router.patch(
  "/:id/read",
  validateParams(notificationIdParamSchema),
  readNotification,
);

export default router;
