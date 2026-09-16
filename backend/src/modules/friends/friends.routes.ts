import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.protectroute.js";
import { validateParams } from "../../middlewares/validate.middleware.js";
import { recipientIdParamSchema, requestIdParamSchema } from "./friends.validation.js";
import { acceptFriendRequest, getFriendRequests, getOutgoingFriendRequests, sentFriendRequest } from "./friends.controller.js";

const router=Router();

router.use(protectRoute);

router.get('/requests',getFriendRequests);

router.get("/requests/outgoing",getOutgoingFriendRequests);

router.post('/:recipientId',validateParams(recipientIdParamSchema),sentFriendRequest);

router.put('/:id/accept',validateParams(requestIdParamSchema),acceptFriendRequest);

export default router;