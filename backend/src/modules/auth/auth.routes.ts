import  express  from "express";
import { login, logout, register } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";
import { validateBody } from "../../middlewares/validate.middleware.js";


const router=express.Router();

router.post('/register',validateBody(registerSchema),register);

router.post('/login',validateBody(loginSchema),login);

router.get('logout',validateBody(loginSchema),logout);

export default router;



