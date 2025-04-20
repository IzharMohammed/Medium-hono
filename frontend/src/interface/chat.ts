import { UserInterface } from "./user";

export interface ChatListItemInterface {
  admin: string;
  createdAt: string;
  isGroupChat: true;
  lastMessage?: ChatMessageInterface;
  name: string;
  participants: UserInterface[];
  updatedAt: string;
  id: string;
}

export interface ChatMessageInterface {
  id: string;
  sender: Pick<UserInterface, "id" | "email" | "username" | "avatar">
  content: string;
  chat: string;
  chatId: string;
  attachments: {
    url: string;
    localPath: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
}