interface Message {
    text: string,
    name: string,
    socketId: string,
    id: string

}
interface ChatBodyProps {
    messages: Message[],
    username: string
}

const ChatBody = ({ messages, username }: ChatBodyProps) => {
    console.log('messages', messages);

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