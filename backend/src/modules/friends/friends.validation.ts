import { z } from "zod";

export const recipientIdParamSchema = z.object({
  recipientId: z.uuid("Recipient ID must be a valid UUID"),
});

export const requestIdParamSchema = z.object({
  id: z.uuid("Friend request ID must be a valid UUID"),
});
