import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware";
import { addNewParticipantInGroupChat, createAGroupChat, createOrGetAOneOnOneChat, deleteGroupChat, deleteOneOnOneChat, getAllChats, getGroupChatDetails, leaveGroupChat, removeParticipantFromGroupChat, renameGroupChat, searchAvailabeUsers } from "../controller/chat.controller";

const router = Router();

router.use(verifyJwt);

router.route("/").get(getAllChats);

router.route("/users").get(searchAvailabeUsers);

router.route("/c/:receiverId").post(createOrGetAOneOnOneChat);

router.route("/group").post(createAGroupChat);

router
    .route("/group/:chatId")
    .get(getGroupChatDetails)
    .patch(renameGroupChat)
    .delete(deleteGroupChat);

router
.route("/group/:chatId/:participantId")
.post(addNewParticipantInGroupChat)
.delete(removeParticipantFromGroupChat);


router
  .route("/leave/group/:chatId")
  .delete(leaveGroupChat);

router
  .route("/remove/:chatId")
  .delete(deleteOneOnOneChat);

export default router;