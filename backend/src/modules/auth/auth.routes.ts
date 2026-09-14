import  express  from "express";
import { register } from "./auth.controller.js";
import { registerSchema } from "./auth.validation.js";
import { validateBody } from "../../middlewares/validate.middleware.js";


const router=express.Router();

router.post('/register',validateBody(registerSchema),register);

// router.get('/api/auth/login',login)

// router.get('/api/auth/logout',logout)
  
export default router;



