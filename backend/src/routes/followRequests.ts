import { Hono } from "hono";
import { decode, verify } from 'hono/jwt'; // Importing JWT functions for token handling
import axios from "axios";
import getPrismaClient from "../lib/getPrismaClient";
const followRequestsRouter = new Hono();
const jwtPassword = 'secret'; // Secret key used for JWT signing and verification

type responsePayload = {
    email: string,
    id: number
}

followRequestsRouter.use('/*', async (c, next) => {
    const token = c.req.header('token'); // Get the token from the request headers

    if (!token) {
        return c.json({
            msg: 'Token needed',
        }); // Respond with an error if the token is missing
    }

    try {
        // Verify the token and cast it to the responsePayload type
        const response = await verify(token, jwtPassword) as responsePayload;
        const id = response.id; // Extract the user ID from the verified token

        console.log(response);
        // Store the user ID in the context for later use
        c.set('jwtPayload', id);
        await next(); // Continue to the next middleware or route handler
    } catch (error) {
        return c.json({
            msg: 'Invalid token',
        }, 401); // Respond with an error if the token is invalid
    }
});

// Define the interface for the request body
interface FollowRequestBody {
    senderId: string; // Initially as string since JSON parses numbers as strings
    receiverId: string;
}

// Sender sends a follow request to a receiver
followRequestsRouter.post('/sentRequest', async (c) => {
    const prisma = getPrismaClient(c);


    // Parse the JSON body
    const body = await c.req.json<FollowRequestBody>();
    const { senderId, receiverId } = body;

    console.log(`senderId: ${senderId}, receiverId: ${receiverId}`);

    try {
        const existingRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "PENDING"
            }
        })

        if (existingRequest) {
            return c.json({ message: 'Follow request already exists' });
        }

        const newFollowRequest = await prisma.followRequest.create({
            data: {
                sender: {
                    connect: { id: parseInt(senderId) }
                },
                receiver: {
                    connect: { id: parseInt(receiverId) }
                }
            }
        })
        return c.json({ message: 'Follow request sent', followRequest: newFollowRequest });

    } catch (error) {
        console.log(`Error creating follow request: ${error}`);
        return c.json({ message: "Error creating follow request" });
    }
})


// Retrieve all follow requests sent by the authenticated user
followRequestsRouter.get('/sent', async (c) => {
    const prisma = getPrismaClient(c);

    const senderId = c.get('jwtPayload');
    try {
        const senderRequests = await prisma.followRequest.findMany({
            where: {
                senderId
            }
        })
        console.log(`sender Requests :- ${senderRequests}`);
        return c.json({ 'sender Requests': senderRequests });

    } catch (error) {
        return c.json({ message: -`Error retreiving requests send by sender` })
    }
})

interface ReceiverRequestBody {
    receiverId: string
}
// Retrieve all follow requests received by the authenticated user
followRequestsRouter.get('/received', async (c) => {
    const prisma = getPrismaClient(c);
    const body = await c.req.json<ReceiverRequestBody>();
    const { receiverId } = body;
    try {
        const receivedRequests = await prisma.followRequest.findMany({
            where: {
                receiverId: parseInt(receiverId)
            }
        })
        if (receivedRequests.length > 0) {
            return c.json({ 'Incoming follow requests': receivedRequests })
        } else {
            return c.json({ msg: 'No incoming follow requests' })
        }
    } catch (error) {
        return c.json({ message: -`Error retreiving incoming follow requests` })
    }
})

async function acceptFollowRequest(c: any, senderId: any, receiverId: string) {

    const prisma = getPrismaClient(c);
    try {
        const existingAcceptedRequests = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "ACCEPTED"
            }
        })

        if (existingAcceptedRequests) {
            return c.json({ msg: existingAcceptedRequests })
        }

        const updateFollowRequest = await prisma.followRequest.updateMany({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "PENDING"
            },
            data: {
                status: "ACCEPTED"
            }
        })
        return c.json({ msg: updateFollowRequest })
    } catch (error) {
        c.json({msg:error})
    }

}

//  Receiver accepts a follow request
followRequestsRouter.patch('/:senderId/accept', async (c) => {
    const senderId = c.req.param('senderId');
    const receiverId = c.get('jwtPayload');

    const response = await acceptFollowRequest(c, senderId, receiverId);

    // if(followRequest){
    //     const roomId = `room_${followRequest.senderId}_${followRequest.receiverId}`;
    //     const data= {
    //         roomId,
    //         userIds:[followRequest.secret, followRequest.senderId]
    //     }
    // try {
    //     await axios.post('http://localhost:4000/api/create-room',data);

    // } catch (error) {
    //     return c.text(`Error creating socket IO room : ${error} `)
    // }
    // }
    return response;

})

async function rejectFollowRequest(c: any, senderId: string, receiverId: string) {
    const prisma = getPrismaClient(c);
    console.log('inside reject');

    try {
        const existingFollowRequests = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "REJECTED"
            }
        })
        console.log('true', existingFollowRequests);

        if (existingFollowRequests?.status == "REJECTED") {

            return c.json({ msg: existingFollowRequests })
        }

        const updateFollowRequests = await prisma.followRequest.updateMany({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "PENDING"
            },
            data: {
                status: "REJECTED"
            }
        })
        console.log('update many', updateFollowRequests);

        return c.json({ msg: updateFollowRequests })
    } catch (error) {
        return c.json({ msg: 'Error in rejecting' })
    }
}

// Receiver rejects a follow request
followRequestsRouter.patch('/:senderId/reject', async (c) => {
    const senderId = c.req.param('senderId');
    const receiverId = c.get('jwtPayload');
    console.log(`senderId: ${senderId}, receiverId: ${receiverId}`);

    const response = await rejectFollowRequest(c, senderId, receiverId);
    return response;
})



export default followRequestsRouter;