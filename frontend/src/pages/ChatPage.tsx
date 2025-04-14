import { Socket } from "socket.io-client";
import ChatFooter from "../components/Chats/ChatFooter";
import ChatBody from "../components/Chats/ChatBody";
import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import Layout from "../layout/Layout";

interface ChatPageProps {
    socket: Socket | null;
}

//Method - 1
// const ChatPage: React.FC<ChatPageProps> = ({socket})=>{
//   return (
//     <div>chatPage</div>
//   )
// }

interface Message {
    text: string,
    name: string,
    socketId: string,
    id: string
}


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
    const [messages, setMessages] = useState<Message[]>([]);
    const [roomId, setRoomId] = useState('');

    // // Create a reference using 'useRef' to hold the currently selected chat.
    // // 'useRef' is used here because it ensures that the 'currentChat' value within socket event callbacks
    // // will always refer to the latest value, even if the component re-renders.
    // const currentChat = useRef<ChatListItemInterface | null>(null);

    // // To keep track of the setTimeout function
    // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // // Define state variables and their initial values using 'useState'
    // const [isConnected, setIsConnected] = useState(false); // For tracking socket connection

    // const [openAddChat, setOpenAddChat] = useState(false); // To control the 'Add Chat' modal
    // const [loadingChats, setLoadingChats] = useState(false); // To indicate loading of chats
    // const [loadingMessages, setLoadingMessages] = useState(false); // To indicate loading of messages

    // const [chats, setChats] = useState<ChatListItemInterface[]>([]); // To store user's chats
    // const [messages, setMessages] = useState<ChatMessageInterface[]>([]); // To store chat messages
    // const [unreadMessages, setUnreadMessages] = useState<ChatMessageInterface[]>(
    //     []
    // ); // To track unread messages

    // const [isTyping, setIsTyping] = useState(false); // To track if someone is currently typing
    // const [selfTyping, setSelfTyping] = useState(false); // To track if the current user is typing

    // const [message, setMessage] = useState(""); // To store the currently typed message
    // const [localSearchQuery, setLocalSearchQuery] = useState(""); // For local search functionality

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
        if(!socket) return;

        socket.on('join_room', (data) => {
            console.log(`${data} joined from client side`);
            socket.emit('join_room', data);
        })

        return () => {
            socket.off('join_room');
        }
    }, [socket])


    return (
        <Layout>
            <div className="flex border border-white h-screen w-full">
                <div className="w-[14rem]">
                    <ChatBar />
                </div>
                <div className=" border border-slate-300  w-full flex flex-col rounded-md">
                    <div className="h-5/6 p-8">
                        <ChatBody messages={messages} username={username} socket={socket} />
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