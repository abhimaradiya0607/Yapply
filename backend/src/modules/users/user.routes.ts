import { Router } from "express";
import { protectRoute } from "../../middlewares/auth.protectroute.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { onboardingSchema } from "./user.validation.js";
import { getMyfriends, getRecommendedUsers, onboard, sentFriendRequest } from "./user.controller.js";

const router=Router();

router.use(protectRoute);

router.patch('/onboarding',validateBody(onboardingSchema),onboard);

router.get('/',getRecommendedUsers);

router.get('/friends',getMyfriends);

router.post('/friend-request/:recipientId',sentFriendRequest);

router.put('/friend-request/:id/accept')

export default router;