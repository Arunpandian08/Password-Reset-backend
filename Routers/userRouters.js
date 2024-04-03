import express from "express";
import {
  forgetPassword,
  passwordReset,
  registerUser,
  userLogin,
  validateResetToken,
} from "../Controllers/userControllers.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", userLogin);
router.post("/forgetpassword", forgetPassword);
router.post("/passwordreset", passwordReset);
router.get("/validateresettoken/:token", validateResetToken);

export default router;
