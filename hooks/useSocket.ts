'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      // Connect to socket server
      socket = io({
        path: '/api/socket',
        addTrailingSlash: false,
      });
      
      // Initialize socket connection
      fetch('/api/socket');
    }
    
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });
    
    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  return { socket, isConnected };
}