import { io, Socket } from "socket.io-client";
import ChatFooter from "../components/Chats/ChatFooter";
import ChatBody from "../components/Chats/ChatBody";
import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

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

//Method - 2 
const ChatPage = ({ socket }: ChatPageProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    // const [roomId, setRoomId] = useState('');

    useEffect(() => {
        console.log(messages);
        if(!socket) return;
        socket.on("messageResponse", (data) => setMessages([...messages, data]))
    }, [socket, messages])

    console.log('socket', socket);

    const token = localStorage.getItem('token') as string;
    console.log(jwtDecode(token));

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
        <div className="flex border border-white h-screen">
            <div className="w-[14rem]">
                <ChatBar />
            </div>
            <div className=" border border-green-600 w-full flex flex-col ">
                <div className="h-5/6">
                    <ChatBody messages={messages} username={username} socket={socket}/>
                </div>
                <ChatFooter socket={socket} username={username} />
            </div>
        </div>
    )
}

export default ChatPage;