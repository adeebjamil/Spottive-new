import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest } from 'next/server';

// This route handles the WebSocket connection
export async function GET(req: NextRequest) {
  // Check if socket.io server is already initialized
  if (!(global as any).io) {
    // Initialize Socket.io server
    const io = new SocketIOServer({ 
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      }
    });
    
    (global as any).io = io;
    
    // Set up socket events
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    console.log('Socket.io server initialized');
  }
  
  // Return an empty response - socket connection happens through upgrade
  return new Response(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}