import { AxiosResponse } from "axios";
import { FreeAPISuccessResponseInterface } from "../interface/api";
import { ChatListItemInterface } from "../interface/chat";
import { UserInterface } from "../interface/user";
import { User } from 'lucide-react';

export const isBrowser = typeof window !== "undefined";

// A utility function for handling API requests with loading, success, and error handling
export const requestHandler = async (
    api: () => Promise<AxiosResponse<FreeAPISuccessResponseInterface, any>>,
    setLoading: ((loading: boolean) => void) | null,
    onSuccess: (data: FreeAPISuccessResponseInterface) => void,
    onError: (error: string) => void
) => {
    // Show loading state if setLoading function is provided
    setLoading && setLoading(true);
    try {
        // Make the API request
        const response = await api();
        const { data } = response;
        if (data?.success) {
            // Call the onSuccess callback with the response data
            onSuccess(data);
        }
    } catch (error: any) {
        // Handle error cases, including unauthorized and forbidden cases
        if ([401, 403].includes(error?.response.data?.statusCode)) {
            localStorage.clear(); // Clear local storage on authentication issues
            if (isBrowser) window.location.href = "/login"; // Redirect to login page
        }
        onError(error?.response?.data?.message || "Something went wrong");
    } finally {
        // Hide loading state if setLoading function is provided
        setLoading && setLoading(false);
    }
};

// A utility function to concatenate CSS class names with proper spacing
export const classNames = (...classeName: string[]) => {
    // Filter out any empty class names and join them with a space
    return classeName.filter(Boolean).join(" ");
}

// A class that provides utility functions for working with local storage
export class LocalStorage {
    // Get a value from local storage by key
    static get(key: string) {
        if (!isBrowser) return;
        const value = localStorage.getItem(key);
        if (value) {
            try {
                return JSON.parse(value);
            } catch (err) {
                return null;
            }
        }
        return null;
    }

    // Set a value in local storage by key
    static set(key: string, value: any) {
        if (!isBrowser) return;
        localStorage.setItem(key, JSON.stringify(value));
    }

    // Remove a value from local storage by key
    static remove(key: string) {
        if (!isBrowser) return;
        localStorage.removeItem(key);
    }

    // Clear all items from local storage
    static clear() {
        if (!isBrowser) return;
        localStorage.clear();
    }
}



// This utility function generates metadata for chat objects.
// It takes into consideration both group chats and individual chats.
export const getChatObjectMetadata = (
    chat: ChatListItemInterface,
    loggedInUser: UserInterface
  ) => {
    // Safely determine the content of the last message
    const lastMessage = chat.lastMessage?.content
      ? chat.lastMessage.content
      : chat.lastMessage
      ? `${chat.lastMessage?.attachments?.length || 0} attachment${
          (chat.lastMessage?.attachments?.length || 0) > 1 ? "s" : ""
        }`
      : "No messages yet";
  
    if (chat.isGroupChat) {
      return {
        avatar: "https://via.placeholder.com/100x100.png",
        title: chat.name,
        description: `${chat.participants.length} members in the chat`,
        lastMessage: chat.lastMessage
          ? `${chat.lastMessage.sender?.username || "Unknown"}: ${lastMessage}`
          : lastMessage,
      };
    } else {
      const participant = chat.participants.find(
        (p) => p.id !== loggedInUser?.id
      );
      return {
        avatar: participant?.avatar?.url || "data:image/jpeg;base64,...",
        title: participant?.username,
        description: participant?.email,
        lastMessage,
      };
    }
  };