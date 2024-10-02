import { Button } from "../components/ui/button";
import Layout from "../layout/Layout";
import Luffy from "../../public/luffy.jpeg"
import useLocalStorage from "../components/Navbar/useLocalStorage";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import useRegisteredUsers from "../hooks/useRegisteredUsers";
import { SocketContext } from "../context/socketContext";

// interface Users {
//     id: number,
//     email: string,
//     password: string,
//     name: string
// }

interface SendFollowRequests {
    createdAt: string
    id: number
    receiverId: number
    senderId: number
    status: string
}

function UserDetails() {

    const { decoded } = useLocalStorage();
    const senderId = decoded.id;
    const { loading, registeredUsers } = useRegisteredUsers();
    // const [registeredUsers, setRegisteredUsers] = useState<Users[]>([]);
    // const [loading, setLoading] = useState(false);
    const [sendFollowRequests, setSendFollowRequests] = useState<SendFollowRequests[]>([]);

    // const getAllUsers = async () => {
    //     setLoading(true);
    //     const response = await axios.get(' http://127.0.0.1:8787/api/v1/user/allUsers');
    //     setRegisteredUsers(response.data);
    //     setLoading(false);
    // }

    useEffect(() => { getFollowRequestsBySender() }, []);
    //  useEffect(() => { getFollowRequestsBySender() }, [sendFollowRequests]);

    // console.log('all users', registeredUsers);
    // console.log('doubt 1', sendFollowRequests);

    const { socket } = useContext(SocketContext);
    const sentFriendRequest = async (receiverId: number) => {
        // console.log('inside sent frd request');

        const response = await axios.post(`http://127.0.0.1:8787/api/v1/followRequests/sentRequest`, {
            senderId,
            receiverId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token'),
            }
        })

        setSendFollowRequests(prevFollowRequests => [
            ...prevFollowRequests,
            {
                createdAt: response.data.followRequest.createdAt,
                id: response.data.followRequest.id,
                receiverId: response.data.followRequest.receiverId,
                senderId: response.data.followRequest.senderId,
                status: response.data.followRequest.status
            }
        ])
        const roomId = `room_${senderId}_${receiverId}`
        socket?.emit('join_room', roomId);
        console.log(`senderId: ${senderId} receiverId: ${receiverId} roomId: ${roomId}`);

        // console.log('frd request response', response.data.followRequest);
    }

    const getFollowRequestsBySender = async () => {
        const senderId = decoded.id;
        const response = await axios.get(`http://127.0.0.1:8787/api/v1/followRequests/${senderId}/sentFollowRequests`, {
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token'),
            }
        })
        setSendFollowRequests(response.data);
        // console.log('all users id response', response.data);
    }

    const renderFollowRequestButton = (usersId: number) => {
        const foundRequest = sendFollowRequests.find(request => request.receiverId === usersId);
        // console.log('found request', foundRequest);

        if (foundRequest) {
            if (foundRequest.status === "PENDING") {
                return <Button className="my-auto">Pending</Button>
            } else if (foundRequest.status === "ACCEPTED") {
                return <Button className="my-auto">Message</Button>
            } else {
                return <Button className="my-auto" onClick={() => sentFriendRequest(foundRequest.receiverId)}>Follow</Button>
            }
        }
        return <Button className="my-auto" onClick={() => sentFriendRequest(usersId)}>Follow</Button>
    }




    // function handleFollowRequest(){
    //     console.log('request accepted');
    //     axios.post(`http://127.0.0.1:8787/api/v1/followRequests/10/accept`)

    // }

    return (
        <>
            <Layout>
                <div className="h-screen w-full">
                    <div className="m-auto">
                        <div className="flex m-auto justify-around gap-8 w-[80rem]">
                            <div className="
                                    border
                                  border-slate-300 
                                    h-[25rem]
                                    w-[23rem]          /* Default width for small screens */
                                    mt-8 p-8
                                    md:w-[40rem]       /* Width 40rem on medium screens and above */
                        ">
                                <div className="flex gap-12 mb-12">
                                    <div>
                                        <img src={Luffy} className="w-[8rem] rounded-full h-[8rem]" />
                                    </div>
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div className="font-semibold text-3xl">{decoded.username}</div>
                                        <div className="text-slate-500">{decoded.email}</div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-8">
                                    <div>Software Developer | Coffee Enthusiast</div>
                                    <div className="flex ">
                                        <div>1234 Followers |  </div>
                                        <div> 567 Following</div>
                                    </div>
                                    <Button className="w-[10rem]">Follow</Button>
                                </div>
                            </div>
                            <div className="border border-slate-300 w-[25rem] h-[35rem]  m-8 p-8 flex flex-col gap-8 overflow-y-auto">
                                <div>
                                    <div className="font-semibold text-3xl">Registered Users</div>
                                    <div className="text-slate-500">Connect with other users</div>
                                </div>

                                {
                                    loading ?
                                        (
                                            Array.from({ length: 3 }).map((_, index) => (
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
                                        registeredUsers.map(user => (
                                            <div className="w-full h-[70px] " key={user.id}>
                                                <div className="flex gap-0 justify-around mb-0 px-2">
                                                    <div>
                                                        <img src={Luffy} className="w-[45px] rounded-full h-[45px]" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <div className="font-medium text-sm">{user.name}</div>
                                                        <div className="text-slate-500">{user.email}</div>
                                                    </div>
                                                    {renderFollowRequestButton(user.id)}
                                                    {/* <Button className="my-auto" onClick={() => sentFriendRequest(user.id)}>Follow</Button> */}
                                                </div>
                                            </div>
                                        ))
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    )
}

export default UserDetails;