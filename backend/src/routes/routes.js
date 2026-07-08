import { Router } from "express";
import {authLimiter} from "../middleware/authLimiter.js"
const router = Router();
import {
  login,
  register,
  getUserHistory,
  addToHistory,
  clearHistory,
} from "../controllers/authController.js";
router.route("/login").post(authLimiter,login);
router.route("/register").post(authLimiter,register);
router.route("/add_to_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/clear_history").post(clearHistory);
export default router;
