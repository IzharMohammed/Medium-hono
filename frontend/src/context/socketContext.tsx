import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import * as io from "socket.io-client";
import { LocalStorage } from '../utils';
import socketio from "socket.io-client";

// Define the type for the Socket context, which contains a Socket instance or null
type SocketContextType = {
    socket: io.Socket | null;  // Socket can be either a socket object or null initially
}

// Initial state for the Socket context, where socket is set to null before connection
const INITIAL_STATE: SocketContextType = { socket: null }

// Create the SocketContext using React's createContext API with the initial state
export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

const useSocket = () => useContext(SocketContext);

// SocketContextProvider component, which will wrap around components that need access to the socket

//M-1
// const SocketContextProvider: React.FC<{ children: React.ReactNode }> = ({

const getSocket = () => {
    // const token = LocalStorage.get("token");
    const token = localStorage.getItem("token");
    console.log(token);
    
    if (!token) {
        console.error("No token found in localStorage");
        // Handle this case appropriately in your app
    }

    // Create a socket connection with the provided URI and authentication
    return socketio("http://localhost:4000", {
        withCredentials: true,
        auth: { token }
    })
}

const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    // Define a piece of state to hold the socket instance, initially set to null
    const [socket, setSocket] = useState<io.Socket | null>(null);

    // useEffect hook to set up the socket connection when the component mounts
    useEffect(() => {
        // Create a new connection to the socket server at localhost:4000
        // const socket = io.connect("http://localhost:4000");

        // Update the state with the connected socket instance
        setSocket(getSocket());

        // Log the socket ID when successfully connected
        // socket.on('connected', () => {
        //     console.log("socketId:-", socket.id);
        // })

        // // Clean up: disconnect the socket when the component unmounts
        // return () => {
        //     socket.disconnect();  // Ensure the socket disconnects when the provider is removed
        // }
    }, []); // Empty dependency array ensures the effect runs only once on mount

    // Return the context provider, passing the socket instance as the context value
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}  {/* Render any child components inside the provider */}
        </SocketContext.Provider>
    );
}

export { SocketContextProvider, useSocket };  // Export the provider to be used in the app
