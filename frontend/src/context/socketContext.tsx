import { createContext, ReactNode, useEffect, useState } from 'react';
import * as io from "socket.io-client";

// Define the type for the Socket context, which contains a Socket instance or null
type SocketContextType = {
    socket: io.Socket | null;  // Socket can be either a socket object or null initially
}

// Initial state for the Socket context, where socket is set to null before connection
const INITIAL_STATE: SocketContextType = { socket: null }

// Create the SocketContext using React's createContext API with the initial state
export const SocketContext = createContext<SocketContextType>(INITIAL_STATE);

// SocketContextProvider component, which will wrap around components that need access to the socket
const SocketContextProvider = ({ children }: { children: ReactNode }) => {
    // Define a piece of state to hold the socket instance, initially set to null
    const [socket, setSocket] = useState<io.Socket | null>(null);

    // useEffect hook to set up the socket connection when the component mounts
    useEffect(() => {
        // Create a new connection to the socket server at localhost:4000
        const socket = io.connect("http://localhost:4000");
        
        // Update the state with the connected socket instance
        setSocket(socket);

        // Log the socket ID when successfully connected
        socket.on('connect', () => {
            console.log(socket.id);
        })

        // Clean up: disconnect the socket when the component unmounts
        return () => {
            socket.disconnect();  // Ensure the socket disconnects when the provider is removed
        }
    }, []); // Empty dependency array ensures the effect runs only once on mount

    // Return the context provider, passing the socket instance as the context value
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}  {/* Render any child components inside the provider */}
        </SocketContext.Provider> 
    );
}

export default SocketContextProvider;  // Export the provider to be used in the app
