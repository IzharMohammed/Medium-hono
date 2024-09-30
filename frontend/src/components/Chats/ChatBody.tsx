import { useEffect } from "react";
import { Socket } from "socket.io-client";

interface Message {
    text: string,
    name: string,
    socketId: string,
    id: string

}
interface ChatBodyProps {
    messages: Message[],
    username: string,
    socket: Socket | null,
}

const ChatBody = ({ messages, username, socket }: ChatBodyProps) => {
    console.log('messages', messages);


    // function joinChatRoom(roomId: string) {
    //     if(!socket) return;
    //     socket.emit('join_room', roomId);
    // }
    
    // useEffect(() => {
    //     joinChatRoom(`room_${}_${}`);
    // }, [])

    
    return (
        <div>
            {
                messages.map(message =>
                    message.name === username ?
                        (<div>
                            <p>You</p>
                            <div>{message.text}</div>
                        </div>)
                        :
                        (<div>
                            <p>{message.name}</p>
                            <div>{message.text}</div>
                        </div>)
                )

            }
        </div>
    )
}

export default ChatBody;