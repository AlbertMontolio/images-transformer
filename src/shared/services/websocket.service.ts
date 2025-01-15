import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class WebSocketService {
  private static instance: WebSocketService;
  private io: SocketServer;

  private constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  public static getInstance(server?: HttpServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  public broadcast(data: any): void {
    console.log('### Broadcasting:', data);
    this.io.emit('categorization-progress', data);
    console.log(`Broadcast sent to ${this.io.engine.clientsCount} clients`);
  }
} 