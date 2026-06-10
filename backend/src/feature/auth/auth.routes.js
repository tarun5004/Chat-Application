import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import {
  login,
  logout,
  me,
  refreshToken,
  register,
} from "./auth.controller.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/refresh-token", validateRequest(refreshTokenSchema), refreshToken);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);

export default router;
