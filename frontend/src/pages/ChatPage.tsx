import { Socket } from "socket.io-client";
// import ChatFooter from "../components/Chats/ChatFooter";
// import ChatBody from "../components/Chats/ChatBody";
// import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import Layout from "../layout/Layout";
import { ChatListItemInterface, ChatMessageInterface } from "../interface/chat";
import { classNames, getChatObjectMetadata, LocalStorage, requestHandler } from "../utils";
import { deleteMessage, getChatMessages, getUserChats, sendMessage } from "../api";
// import { useSocket } from "../context/socketContext";
import { Input } from "../components/ui/input";
import Typing from "../components/typing";
import { UserInterface } from "../interface/user";
// import { XCircleIcon } from "lucide-react";
import ChatItem from "../components/chatItem";
import MessageItem from "../components/messageItem";
import {
    PaperAirplaneIcon,
    PaperClipIcon,
    XCircleIcon,
} from "@heroicons/react/20/solid";
import AddChatModal from "../components/addChatModal";
import { Button } from "../components/ui/button";
import { useSocket } from "../context/socketContext";
import Navbar from "../components/Navbar/Navbar";
import { SendHorizontal } from "lucide-react";
import SendIcon from "../components/sendIcon";

interface ChatPageProps {
    socket: Socket | null;
}

//Method - 1
// const ChatPage: React.FC<ChatPageProps> = ({socket})=>{
//   return (
//     <div>chatPage</div>
//   )
// }

const CONNECTED_EVENT = "connected";
const DISCONNECT_EVENT = "disconnect";
const JOIN_CHAT_EVENT = "joinChat";
const NEW_CHAT_EVENT = "newChat";
const TYPING_EVENT = "typing";
const STOP_TYPING_EVENT = "stopTyping";
const MESSAGE_RECEIVED_EVENT = "messageReceived";
const LEAVE_CHAT_EVENT = "leaveChat";
const UPDATE_GROUP_NAME_EVENT = "updateGroupName";
const MESSAGE_DELETE_EVENT = "messageDeleted";

//Method - 2 
const ChatPage = () => {
    // const [messages, setMessages] = useState<Message[]>([]);
    // const [roomId, setRoomId] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages

    const { socket } = useSocket();
    // Create a reference using 'useRef' to hold the currently selected chat.
    // 'useRef' is used here because it ensures that the 'currentChat' value within socket event callbacks
    // will always refer to the latest value, even if the component re-renders.
    const currentChat = useRef<ChatListItemInterface | null>(null);

    // To keep track of the setTimeout function
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Define state variables and their initial values using 'useState'
    const [isConnected, setIsConnected] = useState(false); // For tracking socket connection

    const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal
    const [loadingChats, setLoadingChats] = useState(false); // To indicate loading of chats
    const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages

    const [chats, setChats] = useState<ChatListItemInterface[]>([]); // To store user's chats
    const [messages, setMessages] = useState<ChatMessageInterface[]>([]); // To store chat messages
    const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
        []
    ); // To track unread messages

    const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
    const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

    const [message, setMessage] = useState(""); // To store the currently typed message
    const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

    useEffect(() => {
        console.log(messages);
        if (!socket) return;
        socket.on("messageResponse", (data) => setMessages([...messages, data]))
    }, [socket, messages])

    useEffect(() => {
        if (!socket) return;

        // Debug room joining
        const handleJoinAck = (room: string) => {
            console.log(`Successfully joined room ${room}`);
            // Manually check room membership (not standard in socket.io client)
            socket.emit("getMyRooms", (rooms: string[]) => {
                console.log("Currently in rooms:", rooms);
            });
        };

        socket.on("joinedRoom", handleJoinAck);

        return () => {
            socket.off("joinedRoom", handleJoinAck);
        };
    }, [socket]);

    // console.log('socket', socket);

    const token = localStorage.getItem('token') as string;
    const user = jwtDecode<UserInterface>(token);

    const getChats = async () => {
        requestHandler(
            async () => await getUserChats(),
            setLoadingChats,
            (res) => {
                const { data } = res;
                setChats(data || []);
            },
            alert
        )
    }

    // Function to send a chat message
    const sendChatMessage = async () => {
        // If no current chat ID exists or there's no socket connection, exit the function
        if (!currentChat.current?.id || !socket) return;

        // Emit a STOP_TYPING_EVENT to inform other users/participants that typing has stopped
        socket.emit(STOP_TYPING_EVENT, currentChat.current.id);
        console.log("message", message);

        // Use the requestHandler to send the message and handle potential response or error
        await requestHandler(
            // Try to send the chat message with the given message and attached files
            async () =>
                await sendMessage(
                    currentChat.current?.id || "",
                    message
                ),
            null,
            // On successful message sending, clear the message input and attached files, then update the UI
            (res) => {
                setMessage(""); // Clear the message input
                // setAttachedFiles([]); // Clear the list of attached files
                console.log("i am here ");
                setMessages((prev) => [res.data, ...prev]); // Update messages in the UI
                updateChatLastMessage(currentChat.current?.id || "", res.data); // Update the last message in the chat
            },
            alert
        )
    }

    /**
   *  A  function to update the last message of a specified chat to update the chat list
   */
    const updateChatLastMessage = (
        chatToUpdateId: string,
        message: ChatMessageInterface // The new message to be set as the last message
    ) => {
        // Search for the chat with the given ID in the chats array
        const chatToUpdate = chats.find((c) => c.id === chatToUpdateId);
        // Update the 'lastMessage' field of the found chat with the new message
        console.log(chatToUpdate);
        if (!chatToUpdate) {
            console.warn("Chat not found for id:", chatToUpdateId);
            return;
        }

        // Update the chat fields
        const updatedChat = {
            ...chatToUpdate,
            lastMessage: message,
            updatedAt: message.updatedAt
        };

        // Update the state of chats, placing the updated chat at the beginning of the array
        setChats([
            updatedChat!, // Place the updated chat first
            ...chats.filter((chat) => chat.id !== chatToUpdateId), // Include all other chats except the updated one
        ]);
    }

    const onConnect = () => {
        setIsConnected(true);
        if (!socket) return;
        // Join user's personal room
        // On frontend
        // Retrieve the current chat details from local storage.
        const _currentChat = LocalStorage.get("currentChat");
        console.log("_currentChat", _currentChat);
        console.log("user.id", _currentChat.id);
        socket.emit(JOIN_CHAT_EVENT, _currentChat.id);

        // Join all chat rooms the user participates in
        // chats.forEach(chat => {
        //     socket.emit(JOIN_CHAT_EVENT,chat.id);
        // });
    }

    const onDisconnect = () => {
        setIsConnected(false);
    }

    /**
   * Handles the "typing" event on the socket.
   */

    const handleOnSocketTyping = (chatId: string) => {
        // Check if the typing event is for the currently active chat.
        if (chatId !== currentChat.current?.id) return;
        // Set the typing state to true for the current chat.
        setIsTyping(true);
    }

    /**
   * Handles the "stop typing" event on the socket.
   */
    const handleOnSocketStopTyping = (chatId: string) => {
        // Check if the stop typing event is for the currently active chat.
        if (chatId !== currentChat.current?.id) return;
        console.log("stopping the typing from ui");

        // Set the typing state to false for the current chat.
        setIsTyping(false);
    }

    const getMessages = async () => {
        // Check if a chat is selected, if not, show an alert
        if (!currentChat.current?.id) return alert("No chat is selected");

        // Check if socket is available, if not, show an alert
        if (!socket) {
            // return alert("Socket not available");
            console.log("Socket not available");
            return;
        }

        // Emit an event to join the current chat
        socket!.emit(JOIN_CHAT_EVENT, currentChat.current?.id);

        // Filter out unread messages from the current chat as those will be read
        setUnreadMessages(
            unreadMessages.filter((msg) => msg.chat !== currentChat.current?.id)
        );

        // Make an async request to fetch chat messages for the current chat
        requestHandler(
            // Fetching messages for the current chat
            async () => await getChatMessages(currentChat.current?.id || ""),
            // Set the state to loading while fetching the messages
            setLoadingMessages,
            // After fetching, set the chat messages to the state if available
            (res) => {
                const { data } = res;
                console.log("data", data);

                setMessages(data.messages || []);
            },
            // Display any error alerts if they occur during the fetch
            alert
        );

    };
    useEffect(() => {
        // Fetch the chat list from the server.
        getChats();

        // Retrieve the current chat details from local storage.
        const _currentChat = LocalStorage.get("currentChat");
        // console.log("_currentChat", _currentChat);

        // If there's a current chat saved in local storage:
        if (_currentChat) {
            // Set the current chat reference to the one from local storage.
            currentChat.current = _currentChat;
            // If the socket connection exists, emit an event to join the specific chat using its ID.
            if (socket) {
                socket?.emit(JOIN_CHAT_EVENT, _currentChat.id);
                // Fetch the messages for the current chat.
                getMessages();
            }
        }
        // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
    }, [socket])

    // This useEffect handles the setting up and tearing down of socket event listeners.
    useEffect(() => {
        if (!socket) return;
        // Debug listeners
        socket.onAny((event, ...args) => {
            console.log(`Socket event received: ${event}`, args);
        });

        socket.onAnyOutgoing((event, ...args) => {
            console.log(`Socket event emitted: ${event}`, args);
        });

        // Listener for when the socket connects.
        socket.on(CONNECTED_EVENT, onConnect);
        // Listener for when the socket disconnects.
        socket.on(DISCONNECT_EVENT, onDisconnect);
        // Listener for when a user is typing.
        socket.on(TYPING_EVENT, handleOnSocketTyping);
        // Listener for when a user stops typing.
        socket.on(STOP_TYPING_EVENT, handleOnSocketStopTyping);
        // Listener for when a new message is received.
        socket.on(MESSAGE_RECEIVED_EVENT, onMessageReceived);
        // Listener for the initiation of a new chat.
        socket.on(NEW_CHAT_EVENT, onNewChat);
        // Listener for when a user leaves a chat.
        socket.on(LEAVE_CHAT_EVENT, onChatLeave);
        // Listener for when a group's name is updated.
        socket.on(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
        //Listener for when a message is deleted
        socket.on(MESSAGE_DELETE_EVENT, onMessageDelete);
        // When the component using this hook unmounts or if `socket` or `chats` change:
        return () => {
            // Remove all the event listeners we set up to avoid memory leaks and unintended behaviors.
            socket.offAny();
            socket.offAnyOutgoing();
            socket.off(CONNECTED_EVENT, onConnect);
            socket.off(DISCONNECT_EVENT, onDisconnect);
            socket.off(TYPING_EVENT, handleOnSocketTyping);
            socket.off(STOP_TYPING_EVENT, handleOnSocketStopTyping);
            socket.off(MESSAGE_RECEIVED_EVENT, onMessageReceived);
            socket.off(NEW_CHAT_EVENT, onNewChat);
            socket.off(LEAVE_CHAT_EVENT, onChatLeave);
            socket.off(UPDATE_GROUP_NAME_EVENT, onGroupNameChange);
            socket.off(MESSAGE_DELETE_EVENT, onMessageDelete);
        };

        // Note:
        // The `chats` array is used in the `onMessageReceived` function.
        // We need the latest state value of `chats`. If we don't pass `chats` in the dependency array,
        // the `onMessageReceived` will consider the initial value of the `chats` array, which is empty.
        // This will not cause infinite renders because the functions in the socket are getting mounted and not executed.
        // So, even if some socket callbacks are updating the `chats` state, it's not
        // updating on each `useEffect` call but on each socket call.
    }, [socket, chats]);

    /**
     * Handles the event when a new message is received.
     */
    const onMessageReceived = (message: ChatMessageInterface) => {
        console.log("message", message);

        // Debug: Check if message structure matches expected
        if (!message?.id) {
            console.error("Invalid message format:", message);
            return;
        }

        // Check if the received message belongs to the currently active chat
        if (message?.chat !== currentChat.current?.id) {
            // If not, update the list of unread messages
            console.log("change hoja bhaii");
            setUnreadMessages((prev) => [message, ...prev]);
        } else {
            // If it belongs to the current chat, update the messages list for the active chat
            setMessages((prev) => [message, ...prev]);
            console.log("change hoja bhaii");
        }

        // Update the last message for the chat to which the received message belongs
        updateChatLastMessage(message.chatId || "", message);
    };

    const onNewChat = (chat: ChatListItemInterface) => {
        setChats((prev) => [chat, ...prev]);
    };

    // This function handles the event when a user leaves a chat.
    const onChatLeave = (chat: ChatListItemInterface) => {
        // Check if the chat the user is leaving is the current active chat.
        if (chat.id === currentChat.current?.id) {
            // If the user is in the group chat they're leaving, close the chat window.
            currentChat.current = null;
            // Remove the currentChat from local storage.
            LocalStorage.remove("currentChat");
        }
        // Update the chats by removing the chat that the user left.
        setChats((prev) => prev.filter((c) => c.id !== chat.id));
    };

    // Function to handle changes in group name
    const onGroupNameChange = (chat: ChatListItemInterface) => {
        // Check if the chat being changed is the currently active chat
        if (chat.id === currentChat.current?.id) {
            // Update the current chat with the new details
            currentChat.current = chat;

            // Save the updated chat details to local storage
            LocalStorage.set("currentChat", chat);
        }

        // Update the list of chats with the new chat details
        setChats((prev) => [
            // Map through the previous chats
            ...prev.map((c) => {
                // If the current chat in the map matches the chat being changed, return the updated chat
                if (c.id === chat.id) {
                    return chat;
                }
                // Otherwise, return the chat as-is without any changes
                return c;
            }),
        ]);
    };

    const onMessageDelete = (message: ChatMessageInterface) => {
        if (message?.chat !== currentChat.current?.id) {
            setUnreadMessages((prev) =>
                prev.filter((msg) => msg._id !== message._id)
            );
        } else {
            setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
        }

        updateChatLastMessageOnDeletion(message.chat, message);
    };

    /**
 *A function to update the chats last message specifically in case of deletion of message *
 **/

    const updateChatLastMessageOnDeletion = (
        chatToUpdateId: string, //ChatId to find the chat
        message: ChatMessageInterface //The deleted message
    ) => {
        // Search for the chat with the given ID in the chats array
        const chatToUpdate = chats.find((chat) => chat.id === chatToUpdateId)!;

        //Updating the last message of chat only in case of deleted message and chats last message is same
        if (chatToUpdate.lastMessage?._id === message._id) {
            requestHandler(
                async () => getChatMessages(chatToUpdateId),
                null,
                (req) => {
                    const { data } = req;

                    chatToUpdate.lastMessage = data[0];
                    setChats([...chats]);
                },
                alert
            );
        }
    };

    const deleteChatMessage = async (message: ChatMessageInterface) => {
        //ONClick delete the message and reload the chat when deleteMessage socket gives any response in chat.tsx
        //use request handler to prevent any errors

        await requestHandler(
            async () => await deleteMessage(message.chat, message._id),
            null,
            (res) => {
                setMessages((prev) => prev.filter((msg) => msg._id !== res.data._id));
                updateChatLastMessageOnDeletion(message.chat, message);
            },
            alert
        );
    };

    const handleOnMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Update the message state with the current input value
        setMessage(e.target.value);

        // If socket doesn't exist or isn't connected, exit the function
        if (!socket || !isConnected) return;

        // Check if the user isn't already set as typing
        if (!selfTyping) {
            // Set the user as typing
            setSelfTyping(true);
            console.log("typing ...", currentChat.current?.id);

            // Emit a typing event to the server for the current chat
            socket.emit(TYPING_EVENT, currentChat.current?.id);
        }

        // Clear the previous timeout (if exists) to avoid multiple setTimeouts from running
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        console.log("typingTimeoutRef.current before", typingTimeoutRef.current);

        // Define a length of time (in milliseconds) for the typing timeout
        const timerLength = 3000;

        // Set a timeout to stop the typing indication after the timerLength has passed
        typingTimeoutRef.current = setTimeout(() => {
            // Emit a stop typing event to the server for the current chat
            socket.emit(STOP_TYPING_EVENT, currentChat.current?.id);
            // Reset the user's typing state
            setSelfTyping(false);
        }, timerLength);
        console.log("typingTimeoutRef.current after", typingTimeoutRef.current);

    };

    return (
        // <Layout>
        <>
            <Navbar />
            <AddChatModal
                open={openAddChat}
                onClose={() => {
                    setOpenAddChat(false);
                }}
                onSuccess={() => {
                    getChats();
                }}
            />
            <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0 ">
                <div className="w-1/3 relative ring-white overflow-y-auto px-4">
                    <div className="z-10 w-full sticky top-0 bg-dark py-4 flex justify-between items-center gap-4">

                        {/*  TODO:-Add logout button */}
                        {/* <button
                            type="button"
                            className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-xl text-sm px-5 py-4 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900 flex-shrink-0"
                            onClick={logout}
                        >
                            Log Out
                        </button> */}

                        <Input
                            placeholder="Search user or group..."
                            value={localSearchQuery}
                            onChange={(e) =>
                                setLocalSearchQuery(e.target.value.toLowerCase())
                            }
                        />
                        <Button
                            onClick={() => setOpenAddChat(true)}
                            className="rounded-xl border-none py-4 px-5 flex flex-shrink-0"
                        >
                            + Add chat
                        </Button>
                    </div>
                    {loadingChats ? (
                        <div className="flex justify-center items-center h-[calc(100%-88px)]">
                            <Typing />
                        </div>
                    ) : (
                        // Iterating over the chats array
                        [...chats]
                            // Filtering chats based on a local search query
                            .filter((chat) =>
                                // If there's a localSearchQuery, filter chats that contain the query in their metadata title
                                localSearchQuery
                                    ? getChatObjectMetadata(chat, user)
                                        .title?.toLocaleLowerCase()
                                        ?.includes(localSearchQuery)
                                    : // If there's no localSearchQuery, include all chats
                                    true
                            )
                            .map((chat) => {
                                return (
                                    <ChatItem
                                        chat={chat}
                                        isActive={chat.id === currentChat.current?.id}
                                        unreadCount={
                                            unreadMessages.filter((n) => n.chat === chat.id).length
                                        }
                                        onClick={(chat: any) => {
                                            if (
                                                currentChat.current?.id &&
                                                currentChat.current?.id === chat.id
                                            )
                                                return;
                                            LocalStorage.set("currentChat", chat);
                                            currentChat.current = chat;
                                            setMessage("");
                                            getMessages();
                                        }}
                                        key={chat.id}
                                        onChatDelete={(chatId: any) => {
                                            setChats((prev) =>
                                                prev.filter((chat) => chat.id !== chatId)
                                            );
                                            if (currentChat.current?.id === chatId) {
                                                currentChat.current = null;
                                                LocalStorage.remove("currentChat");
                                            }
                                        }}
                                    />
                                );
                            })
                    )}
                </div>
                <div className="w-2/3 border-l-[0.1px] border-secondary">
                    {currentChat.current && currentChat.current?.id ? (
                        <>
                            <div className="p-4 sticky top-0 bg-dark z-20 flex justify-between items-center w-full border-b-[0.1px] border-secondary">
                                <div className="flex justify-start items-center w-max gap-3">
                                    {currentChat.current.isGroupChat ? (
                                        <div className="w-12 relative h-12 flex-shrink-0 flex justify-start items-center flex-nowrap">
                                            {currentChat.current.participants
                                                .slice(0, 3)
                                                .map((participant, i) => {
                                                    return (
                                                        <img
                                                            key={participant.id}
                                                            src={participant?.avatar?.url}
                                                            className={classNames(
                                                                "w-9 h-9 border-[1px] border-white rounded-full absolute outline outline-4 outline-dark",
                                                                i === 0
                                                                    ? "left-0 z-30"
                                                                    : i === 1
                                                                        ? "left-2 z-20"
                                                                        : i === 2
                                                                            ? "left-4 z-10"
                                                                            : ""
                                                            )}
                                                        />
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <img
                                            className="h-14 w-14 rounded-full flex flex-shrink-0 object-cover"
                                            src={
                                                getChatObjectMetadata(currentChat.current, user!).avatar
                                            }
                                        />
                                    )}
                                    <div>
                                        <p className="font-bold">
                                            {getChatObjectMetadata(currentChat.current, user!).title}
                                        </p>
                                        <small className="text-zinc-400">
                                            {
                                                getChatObjectMetadata(currentChat.current, user!)
                                                    .description
                                            }
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div
                                className={classNames(
                                    "p-8 overflow-y-auto flex flex-col-reverse gap-6 w-full",
                                    attachedFiles.length > 0
                                        ? "h-[calc(100vh-336px)]"
                                        : "h-[calc(100vh-176px)]"
                                )}
                                id="message-window"
                            >
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-[calc(100%-88px)]">
                                        <Typing />
                                    </div>
                                ) : (
                                    <>
                                        {isTyping ? <Typing /> : null}
                                        {messages?.map((msg) => {
                                            console.log("msg.sender.id", msg);
                                            console.log("user.id", user.id);

                                            return (
                                                <MessageItem
                                                    key={msg._id}
                                                    isOwnMessage={msg.senderId === user?.id}
                                                    isGroupChatMessage={currentChat.current?.isGroupChat}
                                                    message={msg}
                                                    deleteChatMessage={deleteChatMessage}
                                                />
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                            {attachedFiles.length > 0 ? (
                                <div className="grid gap-4 grid-cols-5 p-4 justify-start max-w-fit">
                                    {attachedFiles.map((file, i) => {
                                        return (
                                            <div
                                                key={i}
                                                className="group w-32 h-32 relative aspect-square rounded-xl cursor-pointer"
                                            >
                                                <div className="absolute inset-0 flex justify-center items-center w-full h-full bg-black/40 group-hover:opacity-100 opacity-0 transition-opacity ease-in-out duration-150">
                                                    <Button
                                                        onClick={() => {
                                                            setAttachedFiles(
                                                                attachedFiles.filter((_, ind) => ind !== i)
                                                            );
                                                        }}
                                                        className="absolute -top-2 -right-2"
                                                    >
                                                        <XCircleIcon className="h-6 w-6 text-white" />
                                                    </Button>
                                                </div>
                                                <img
                                                    className="h-full rounded-xl w-full object-cover"
                                                    src={URL.createObjectURL(file)}
                                                    alt="attachment"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                            <div className="sticky top-full p-4 flex justify-between items-center w-full gap-2 border-t-[0.1px] border-secondary">
                                <input
                                    hidden
                                    id="attachments"
                                    type="file"
                                    value=""
                                    multiple
                                    max={5}
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setAttachedFiles([...e.target.files]);
                                        }
                                    }}
                                />
                                <label
                                    htmlFor="attachments"
                                    className="p-4 rounded-full bg-dark hover:bg-secondary"
                                >
                                    <PaperClipIcon className="w-6 h-6" />
                                </label>

                                <Input
                                    placeholder="Message"
                                    value={message}
                                    onChange={handleOnMessageChange}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            sendChatMessage();
                                        }
                                    }}
                                />
                                <Button
                                    onClick={sendChatMessage}
                                    disabled={!message && attachedFiles.length <= 0}
                                    className="group p-4 rounded-full  disabled:opacity-50 transition-all duration-200"
                                >
                                    <SendIcon />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex justify-center items-center">
                            No chat selected
                        </div>
                    )}
                </div>
            </div>
        </>
        // </Layout>
    )
}

export default ChatPage;