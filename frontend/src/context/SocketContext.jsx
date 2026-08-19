import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        if (user) {
            // Adjust URL to match your backend
            const newSocket = io("http://localhost:8000", {
                transports: ['websocket'],
            });

            newSocket.on("connect", () => {
                console.log("Connected to WebSocket");
                newSocket.emit("join", user._id);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
