import { Socket } from "socket.io-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
interface ChatFooterProps {
    socket: Socket | null,
    username: string
}

const ChatFooter = ({ socket, username }: ChatFooterProps) => {
    const [message, setMessage] = useState('');
    const handleSendMessage = (e: any) => {
        e.preventDefault();
        if (username) {
            if(!socket) return;
            socket.emit("message", {
                text: message,
                name: username,
                socketId: socket.id,
                id: `${socket.id}${Math.random()}`
            })
        }
        setMessage('');
    }
    return (
        <div className="flex  max-w-sm items-center space-x-2 m-auto">
            <Input
                type="text"
                placeholder="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <Button type="submit" onClick={handleSendMessage}>send</Button>
        </div>
    )
}
export default ChatFooter;