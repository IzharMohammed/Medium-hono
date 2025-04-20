import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { deleteMessage, getAllMessages, sendMessage } from "../controller/message.controller";

const router = Router();

router.use(verifyJwt);

router
    .route("/:chatId")
    .get(getAllMessages)
    .post(sendMessage);

router
    .route("/:chatId/:messageId")
    .delete(deleteMessage);

export default router;