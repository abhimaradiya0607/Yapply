import { z } from "zod";

export const notificationIdParamSchema = z.object({
  id: z.uuid("Notification ID must be a valid UUID"),
});
