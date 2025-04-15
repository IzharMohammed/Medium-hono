import { Socket } from "socket.io-client";
import ChatFooter from "../components/Chats/ChatFooter";
import ChatBody from "../components/Chats/ChatBody";
import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import Layout from "../layout/Layout";
import { ChatListItemInterface, ChatMessageInterface } from "../interface/chat";
import { LocalStorage, requestHandler } from "../utils";
import { getChatMessages, getUserChats, sendMessage } from "../api";
import { useSocket } from "../context/socketContext";

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
    // console.log(jwtDecode(token));

    const { username }: { username: string } = jwtDecode(token);
    console.log(username);

    useEffect(() => {
        if (!socket) return;

        socket.on('join_room', (data) => {
            console.log(`${data} joined from client side`);
            socket.emit('join_room', data);
        })

        return () => {
            socket.off('join_room');
        }
    }, [socket])

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

    return (
        <Layout>
            <div className="flex border border-white h-screen w-full">
                <div className="w-[14rem]">
                    <ChatBar />
                </div>
                <div className=" border border-slate-300  w-full flex flex-col rounded-md">
                    <div className="h-5/6 p-8">
                        {/* <ChatBody messages={messages} username={username} socket={socket} /> */}
                    </div>
                    <div>
                        <ChatFooter socket={socket} username={username} />
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ChatPage;