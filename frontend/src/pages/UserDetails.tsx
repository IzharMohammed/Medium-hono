import { Button } from "../components/ui/button";
import Layout from "../layout/Layout";
import Luffy from "../../public/luffy.jpeg"
import useLocalStorage from "../components/Navbar/useLocalStorage";
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";

interface Users {
    id: number,
    email: string,
    password: string,
    name: string
}

function UserDetails() {
    const { decoded } = useLocalStorage();
    const [registeredUsers, setRegisteredUsers] = useState<Users[]>([]);
    const [loading, setLoading] = useState(false);
    const[status, setStatus] = useState('');
    const getAllUsers = async () => {
        setLoading(true);
        const response = await axios.get(' https://backend.izharmohammed21.workers.dev/api/v1/user/allUsers');
        setRegisteredUsers(response.data);
        setLoading(false);
    }
    useEffect(() => {
        getAllUsers();
    }, [])
    console.log('hi', registeredUsers);
    const sentFriendRequest = async (receiverId: number) => {

        const response = await axios.post(`http://127.0.0.1:8787/api/v1/followRequests/sentRequest`, {
            senderId: decoded.id,
            receiverId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('token'),
            }
        })
        console.log('frd request response', response.data.followRequest.status);
        setStatus(response.data.followRequest.status);
    }


    const renderFollowRequestButton = (receiverId: number) =>{
        if(status == 'ACCEPTED'){
            return <Button className="my-auto">Message</Button>
        }else if(status == 'PENDING'){
            return <Button className="my-auto">Pending</Button>
        }else{
            return <Button className="my-auto" onClick={() => sentFriendRequest(receiverId)}>Follow</Button>
        }
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
                                            <div className="w-full h-[70px] ">
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