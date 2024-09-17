import { Socket } from "socket.io-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useState } from "react";
interface ChatFooterProps {
    socket: Socket,
    username: string
}

const ChatFooter = ({ socket, username }: ChatFooterProps) => {
    const [message, setMessage] = useState('');
    const handleSendMessage = (e: any) => {
        e.preventDefault();
        if (username) {
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
        <div className="flex w-full max-w-sm items-center space-x-2">
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