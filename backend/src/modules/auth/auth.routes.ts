import  express  from "express";
import { googlelogin, login, logout, register } from "./auth.controller.js";
import { googleCallbackSchema, loginSchema, registerSchema } from "./auth.validation.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { protectRoute } from "../../middlewares/auth.protectroute.js";


const router=express.Router();

router.post('/register',validateBody(registerSchema),register);

router.post('/login',validateBody(loginSchema),login);

router.post('/logout',logout);

router.post('/google',validateBody(googleCallbackSchema),googlelogin);

export default router;



