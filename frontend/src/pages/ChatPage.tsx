import { Socket } from "socket.io-client";
import ChatFooter from "../components/Chats/ChatFooter";
import ChatBody from "../components/Chats/ChatBody";
import ChatBar from "../components/Chats/ChatBar";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

interface ChatPageProps {
    socket: Socket
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
    useEffect(() => {
        console.log(messages);
        socket.on("messageResponse", (data) => setMessages([...messages, data]))
    }, [socket, messages])
    console.log('socket', socket);
    const token = localStorage.getItem('token') as string;
    const { email }: { email: string } = jwtDecode(token);
    console.log(email);

    return (
        <div className="flex border border-white h-screen">
            <div className="w-[14rem]">
                <ChatBar />
            </div>
            <div className=" border border-green-600 w-full flex flex-col ">
                <div className="h-5/6">
                    <ChatBody messages={messages} email={email}/>
                </div>
                <ChatFooter socket={socket} email={email} />
            </div>
        </div>
    )
}

export default ChatPage;