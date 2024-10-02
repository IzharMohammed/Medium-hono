import Skeleton from "react-loading-skeleton";
import Luffy from "../../public/luffy.jpeg"
import { Button } from './ui/button';
import useLocalStorage from "./Navbar/useLocalStorage";
import { useContext } from "react";
import { SocketContext } from "../context/socketContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface ReceivedFriendRequest {
    createdAt: string
    id: number
    receiverId: number
    senderId: number
    status: string
}

interface Users {
    id: number,
    email: string,
    password: string,
    name: string
}

interface ReceivedFriendRequestProps {
    receivedFriendRequest: ReceivedFriendRequest[],
    loading: boolean,
    registeredUsers: Users[]
}

const RegisteredUsers: React.FC<ReceivedFriendRequestProps> = ({ receivedFriendRequest, loading, registeredUsers }) => {

    console.log('receivedFriendRequest', receivedFriendRequest);
    const receivedFriendRequestFiltering = (senderId: number) => {
        const foundSender = receivedFriendRequest.find(response => response.senderId === senderId)
        console.log('foundSender', foundSender);
        return foundSender;
    }
    const navigate = useNavigate()

    const { socket } = useContext(SocketContext);

    const { decoded } = useLocalStorage();

    const handleAcceptFriendRequest = async (senderId: number) => {
        try {
            const response = await axios.patch(`http://127.0.0.1:8787/api/v1/followRequests/${senderId}/accept`);
            console.log('frd req accepted', response);
            navigate('/chatPage');
        } catch (error) {
            console.log('Error', error);
        }
        const roomId = `room_${senderId}_${decoded.id}`
        socket?.emit('join_room', roomId);
        console.log(`senderId: ${senderId} receiverId: ${decoded.id} room: ${roomId}`);

    }

    const handleRejectFriendRequest = () => { }

    return (
        <div>
            {
                loading ?
                    (
                        Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="border border-slate-100 w-[19rem] flex flex-col gap-1 cursor-pointer"
                            >
                                <div>
                                    <Skeleton height={5} />
                                </div>
                                <div className="p-2 flex flex-col gap-5">
                                    <div className="text-3xl font-bold">
                                        <Skeleton width={`100%`} />
                                    </div>
                                    <div>
                                        <Skeleton count={1} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) :
                    registeredUsers &&
                    registeredUsers.map(user => {
                        const foundSender = receivedFriendRequestFiltering(user.id)
                        return foundSender ? (
                            <div className="w-full h-[70px] mt-1 " key={user.id}>
                                <div className="flex gap-0 justify-between px-2">
                                    <div>
                                        <img src={Luffy} className="w-[45px] rounded-full h-[45px]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium text-lg">{user.name}</div>
                                    </div>
                                    <Button className="my-auto" onClick={() => handleAcceptFriendRequest(user.id)}>Accept</Button>
                                    <Button className="my-auto" variant="outline" onClick={handleRejectFriendRequest} >Reject</Button>
                                </div>
                            </div>

                        ) : null

                    })
            }

        </div>
    )
}

export default RegisteredUsers;