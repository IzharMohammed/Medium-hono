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
        avatar: participant?.avatar?.url || "data:image/jpeg;base64,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",
        title: participant?.username,
        description: participant?.email,
        lastMessage,
      };
    }
  };