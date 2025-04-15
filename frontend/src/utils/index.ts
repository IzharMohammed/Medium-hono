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
    chat: ChatListItemInterface, // The chat item for which metadata is being generated.
    loggedInUser: UserInterface // The currently logged-in user details.
  ) => {
    // Determine the content of the last message, if any.
    // If the last message contains only attachments, indicate their count.
    const lastMessage = chat.lastMessage?.content
      ? chat.lastMessage?.content
      : chat.lastMessage
      ? `${chat.lastMessage?.attachments?.length} attachment${
          chat.lastMessage.attachments.length > 1 ? "s" : ""
        }`
      : "No messages yet"; // Placeholder text if there are no messages.
  
    if (chat.isGroupChat) {
      // Case: Group chat
      // Return metadata specific to group chats.
      return {
        // Default avatar for group chats.
        avatar: "https://via.placeholder.com/100x100.png",
        title: chat.name, // Group name serves as the title.
        description: `${chat.participants.length} members in the chat`, // Description indicates the number of members.
        lastMessage: chat.lastMessage
          ? chat.lastMessage?.sender?.username + ": " + lastMessage
          : lastMessage,
      };
    } else {
      // Case: Individual chat
      // Identify the participant other than the logged-in user.
      const participant = chat.participants.find(
        (p) => p.id !== loggedInUser?.id
      );
      // Return metadata specific to individual chats.
      return {
        avatar: participant?.avatar?.url || "data:image/jpeg;base64,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" , // Participant's avatar URL.
        title: participant?.username, // Participant's username serves as the title.
        description: participant?.email, // Email address of the participant.
        lastMessage,
      };
    }
  };