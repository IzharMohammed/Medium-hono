import Skeleton from "react-loading-skeleton";
import Luffy from "../../public/luffy.jpeg"
import { Button } from './ui/button';

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
                            <div className="w-full h-[70px] " key={user.id}>
                                <div className="flex gap-0 justify-between mb-0 px-2">
                                    <div>
                                        <img src={Luffy} className="w-[45px] rounded-full h-[45px]" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="font-medium text-sm">{user.name}</div>
                                    </div>
                                    <Button className="my-auto" >Accept</Button>
                                    <Button className="my-auto" variant="outline" >Reject</Button>
                                </div>
                            </div>

                        ) : null

                    })
            }

        </div>
    )
}

export default RegisteredUsers;