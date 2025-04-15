import { Socket } from "socket.io-client";
import ChatFooter from "../components/Chats/ChatFooter";
import ChatBody from "../components/Chats/ChatBody";
import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import Layout from "../layout/Layout";
import { ChatListItemInterface, ChatMessageInterface } from "../interface/chat";
import { classNames, getChatObjectMetadata, LocalStorage, requestHandler } from "../utils";
import { getChatMessages, getUserChats, sendMessage } from "../api";
import { useSocket } from "../context/socketContext";
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
const ChatPage = ({ socket }: ChatPageProps) => {
    // const [messages, setMessages] = useState<Message[]>([]);
    const [roomId, setRoomId] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]); // To store files attached to messages

    // const {socket} = useSocket();
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

    console.log('socket', socket);

    const token = localStorage.getItem('token') as string;
    const user = jwtDecode<UserInterface>(token);
    // console.log(jwtDecode(token));

    // const { username, email, id }: { username: string, email: string, id: number } = jwtDecode(token);
    // console.log(jwtDecode(token));

    // const user: UserInterface = {
    //     email: payload.email  ,
    //         id: payload.id,
    //     username: payload.username,
    // } 
    console.log("user", user);

    // useEffect(() => {
    //     if (!socket) return;

    //     socket.on('join_room', (data) => {
    //         console.log(`${data} joined from client side`);
    //         socket.emit('join_room', data);
    //     })

    //     return () => {
    //         socket.off('join_room');
    //     }
    // }, [socket])

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
        chatToUpdate!.lastMessage = message;
        // Update the 'updatedAt' field of the chat with the 'updatedAt' field from the message
        chatToUpdate!.updatedAt = message.updatedAt

        // Update the state of chats, placing the updated chat at the beginning of the array
        setChats([
            chatToUpdate!, // Place the updated chat first
            ...chats.filter((chat) => chat.id !== chatToUpdateId), // Include all other chats except the updated one
        ]);
    }

    const onConnect = () => {
        setIsConnected(true);
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

        // Set the typing state to false for the current chat.
        setIsTyping(false);
    }

    const getMessages = () => {
        if (!currentChat.current?.id) return
    }

    useEffect(() => {
        // Fetch the chat list from the server.
        getChats();

        // Retrieve the current chat details from local storage.
        const _currentChat = LocalStorage.get("currentChat");

        // If there's a current chat saved in local storage:
        if (_currentChat) {
            // Set the current chat reference to the one from local storage.
            currentChat.current = _currentChat;
            // If the socket connection exists, emit an event to join the specific chat using its ID.
            socket?.emit(JOIN_CHAT_EVENT, _currentChat.current.id);
            // Fetch the messages for the current chat.
            getMessages();
        }
        // An empty dependency array ensures this useEffect runs only once, similar to componentDidMount.
    }, [])

    // This useEffect handles the setting up and tearing down of socket event listeners.
    useEffect(() => {
        if (!socket) return;
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

    const onMessageReceived = () => { }

    const onNewChat = () => { }

    const onChatLeave = () => { }

    const onGroupNameChange = () => { }

    const onMessageDelete = () => { }

    const deleteChatMessage = () => { }

    const handleOnMessageChange = () => { }
    return (
        <Layout>
            <AddChatModal
                open={openAddChat}
                onClose={() => {
                    setOpenAddChat(false);
                }}
                onSuccess={() => {
                    getChats();
                }}
            />
            <div className="w-full justify-between items-stretch h-screen flex flex-shrink-0">
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
                        <button
                            onClick={() => setOpenAddChat(true)}
                            className="rounded-xl border-none bg-primary text-white py-4 px-5 flex flex-shrink-0"
                        >
                            + Add chat
                        </button>
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
                                            return (
                                                <MessageItem
                                                    key={msg.id}
                                                    isOwnMessage={msg.sender?.id === user?.id}
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
                                                    <button
                                                        onClick={() => {
                                                            setAttachedFiles(
                                                                attachedFiles.filter((_, ind) => ind !== i)
                                                            );
                                                        }}
                                                        className="absolute -top-2 -right-2"
                                                    >
                                                        <XCircleIcon className="h-6 w-6 text-white" />
                                                    </button>
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
                                <button
                                    onClick={sendChatMessage}
                                    disabled={!message && attachedFiles.length <= 0}
                                    className="p-4 rounded-full bg-dark hover:bg-secondary disabled:opacity-50"
                                >
                                    <PaperAirplaneIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full flex justify-center items-center">
                            No chat selected
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ChatPage;