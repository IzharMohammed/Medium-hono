import { Hono } from "hono";
import { decode, verify } from 'hono/jwt'; // Importing JWT functions for token handling
import axios from "axios";
import getPrismaClient from "../lib/getPrismaClient";

const followRequestsRouter = new Hono(); // Initialize a new Hono router for follow requests
const jwtPassword = 'secret'; // Secret key used for JWT signing and verification

// Define the structure of the JWT payload
type responsePayload = {
    email: string,
    id: number
}

// Middleware to authenticate and verify JWT for all routes
followRequestsRouter.use('/*', async (c, next) => {
    const token = c.req.header('token'); // Retrieve the token from the request headers

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
        await next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return c.json({
            msg: 'Invalid token',
        }, 401); // Respond with an error if the token is invalid
    }
});

// Define the interface for the follow request body
interface FollowRequestBody {
    senderId: string; // Sender's ID as a string (parsed from JSON)
    receiverId: string; // Receiver's ID as a string
}

// Route to handle sending a follow request from a sender to a receiver
followRequestsRouter.post('/sentRequest', async (c) => {
    const prisma = getPrismaClient(c); // Initialize Prisma client with the current context

    // Parse the JSON body of the request
    const body = await c.req.json<FollowRequestBody>();
    const { senderId, receiverId } = body;

    console.log(`senderId: ${senderId}, receiverId: ${receiverId}`);

    try {
        // Check if a pending follow request already exists between the sender and receiver
        const existingRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "PENDING"
            }
        })

        if (existingRequest) {
            return c.json({ message: 'Follow request already exists' }); // Inform the sender that the request is already pending
        }

        // Create a new follow request in the database
        const newFollowRequest = await prisma.followRequest.create({
            data: {
                sender: {
                    connect: { id: parseInt(senderId) } // Connect the sender by ID
                },
                receiver: {
                    connect: { id: parseInt(receiverId) } // Connect the receiver by ID
                }
            }
        })
        return c.json({ message: 'Follow request sent', followRequest: newFollowRequest }); // Confirm that the request was sent

    } catch (error) {
        console.log(`Error creating follow request: ${error}`);
        return c.json({ message: "Error creating follow request" }); // Respond with an error if something goes wrong
    }
})

// Route to retrieve all follow requests sent by the authenticated user
followRequestsRouter.get('/sent', async (c) => {
    const prisma = getPrismaClient(c); // Initialize Prisma client with the current context

    const senderId = c.get('jwtPayload'); // Retrieve the authenticated user's ID from the context
    try {
        // Fetch all follow requests where the authenticated user is the sender
        const senderRequests = await prisma.followRequest.findMany({
            where: {
                senderId
            }
        })
        console.log(`sender Requests :- ${senderRequests}`);
        return c.json({ 'sender Requests': senderRequests }); // Return the list of sent follow requests

    } catch (error) {
        return c.json({ message: -`Error retrieving requests sent by sender` }) // Respond with an error if retrieval fails
    }
})

// Define the interface for the received follow requests body
interface ReceiverRequestBody {
    receiverId: string // Receiver's ID as a string
}

// Route to retrieve all follow requests received by the authenticated user
followRequestsRouter.get('/received', async (c) => {
    const prisma = getPrismaClient(c); // Initialize Prisma client with the current context
    const body = await c.req.json<ReceiverRequestBody>(); // Parse the JSON body
    const { receiverId } = body;
    try {
        // Fetch all follow requests where the authenticated user is the receiver
        const receivedRequests = await prisma.followRequest.findMany({
            where: {
                receiverId: parseInt(receiverId)
            }
        })
        if (receivedRequests.length > 0) {
            return c.json({ 'Incoming follow requests': receivedRequests }) // Return the list if there are incoming requests
        } else {
            return c.json({ msg: 'No incoming follow requests' }) // Inform the user if there are no incoming requests
        }
    } catch (error) {
        return c.json({ message: -`Error retrieving incoming follow requests` }) // Respond with an error if retrieval fails
    }
})

// Function to accept a follow request
async function acceptFollowRequest(c: any, senderId: any, receiverId: string) {
    const prisma = getPrismaClient(c); // Initialize Prisma client with the current context
    try {
        // Check if there's already an accepted follow request between the sender and receiver
        const existingAcceptedRequests = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "ACCEPTED"
            }
        })

        if (existingAcceptedRequests) {
            return c.json({ msg: existingAcceptedRequests }) // Inform the user that the request has already been accepted
        }

        // Update the follow request status to "ACCEPTED"
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
        return c.json({ msg: updateFollowRequest }) // Confirm that the request has been accepted
    } catch (error) {
        c.json({ msg: error }) // Respond with an error if something goes wrong
    }
}

// Route for the receiver to accept a follow request
followRequestsRouter.patch('/:senderId/accept', async (c) => {
    const senderId = c.req.param('senderId'); // Extract the sender's ID from the URL parameters
    const receiverId = c.get('jwtPayload'); // Retrieve the authenticated receiver's ID from the context

    // Call the function to accept the follow request
    const response = await acceptFollowRequest(c, senderId, receiverId);

    // Uncomment and modify the following block if you want to create a socket.io room upon accepting a request
    /*
    if(followRequest){
        const roomId = `room_${followRequest.senderId}_${followRequest.receiverId}`;
        const data= {
            roomId,
            userIds:[followRequest.secret, followRequest.senderId]
        }
        try {
            await axios.post('http://localhost:4000/api/create-room',data);
        } catch (error) {
            return c.text(`Error creating socket IO room : ${error} `)
        }
    }
    */
    return response; // Return the response from accepting the follow request
})

// Function to reject a follow request
async function rejectFollowRequest(c: any, senderId: string, receiverId: string) {
    const prisma = getPrismaClient(c); // Initialize Prisma client with the current context
    console.log('inside reject');

    try {
        // Check if the follow request has already been rejected
        const existingFollowRequests = await prisma.followRequest.findFirst({
            where: {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
                status: "REJECTED"
            }
        })
        console.log('true', existingFollowRequests);

        if (existingFollowRequests?.status == "REJECTED") {
            return c.json({ msg: existingFollowRequests }) // Inform the user that the request has already been rejected
        }

        // Update the follow request status to "REJECTED"
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

        return c.json({ msg: updateFollowRequests }) // Confirm that the request has been rejected
    } catch (error) {
        return c.json({ msg: 'Error in rejecting' }) // Respond with an error if something goes wrong
    }
}

// Route for the receiver to reject a follow request
followRequestsRouter.patch('/:senderId/reject', async (c) => {
    const senderId = c.req.param('senderId'); // Extract the sender's ID from the URL parameters
    const receiverId = c.get('jwtPayload'); // Retrieve the authenticated receiver's ID from the context
    console.log(`senderId: ${senderId}, receiverId: ${receiverId}`);

    // Call the function to reject the follow request
    const response = await rejectFollowRequest(c, senderId, receiverId);
    return response; // Return the response from rejecting the follow request
})

export default followRequestsRouter; // Export the configured router for use in the application
