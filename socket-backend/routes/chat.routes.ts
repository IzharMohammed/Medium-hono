import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { createOrGetAOneOnOneChat, getAllChats, searchAvailabeUsers } from "../controller/chat.controller";

const router = Router();

router.use(verifyJwt);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailabeUsers);

router.route("/c/:receiverId").post(createOrGetAOneOnOneChat);

export default router;