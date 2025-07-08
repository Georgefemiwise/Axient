import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import logger from './logger';

export interface SocketData {
  userId?: string;
  role?: string;
}

export class WebSocketManager {
  private io: SocketIOServer;
  private connectedClients: Map<string, any> = new Map();

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('Client connected', { socketId: socket.id });

      socket.on('authenticate', (data: { token: string }) => {
        // Verify JWT token and set user data
        // This would integrate with your auth system
        socket.data = { userId: 'user123', role: 'admin' };
        this.connectedClients.set(socket.id, socket.data);
      });

      socket.on('join_room', (room: string) => {
        socket.join(room);
        logger.info('Client joined room', { socketId: socket.id, room });
      });

      socket.on('disconnect', () => {
        this.connectedClients.delete(socket.id);
        logger.info('Client disconnected', { socketId: socket.id });
      });
    });
  }

  // Broadcast new detection to all connected clients
  broadcastDetection(detection: any) {
    this.io.emit('new_detection', detection);
    logger.info('Detection broadcasted', { detectionId: detection.id });
  }

  // Send camera status update
  broadcastCameraStatus(cameraId: string, status: string) {
    this.io.emit('camera_status', { cameraId, status });
  }

  // Send system alert
  broadcastSystemAlert(alert: { type: string; message: string; severity: 'info' | 'warning' | 'error' }) {
    this.io.emit('system_alert', alert);
  }

  // Send notification to specific user
  sendToUser(userId: string, event: string, data: any) {
    const userSockets = Array.from(this.connectedClients.entries())
      .filter(([_, socketData]) => socketData.userId === userId)
      .map(([socketId]) => socketId);

    userSockets.forEach(socketId => {
      this.io.to(socketId).emit(event, data);
    });
  }

  // Get connected clients count
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

let wsManager: WebSocketManager;

export function initializeWebSocket(server: HTTPServer): WebSocketManager {
  if (!wsManager) {
    wsManager = new WebSocketManager(server);
  }
  return wsManager;
}

export function getWebSocketManager(): WebSocketManager {
  return wsManager;
}