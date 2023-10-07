import  express  from "express";
import { authUser, registerUser,getAllUser } from "../controllers/userController.js";
import protect from "../middleware/authMiddleware.js";

const router=express.Router();

router.post("/",registerUser);
router.post("/login",authUser);
router.get("/",protect,getAllUser)

export default router;