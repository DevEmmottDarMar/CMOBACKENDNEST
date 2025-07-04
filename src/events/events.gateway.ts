// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection, // <-- Interfaz requerida
  OnGatewayDisconnect, // <-- Interfaz requerida
  OnGatewayInit, // <-- Interfaz requerida
} from '@nestjs/websockets'; // Asegúrate de que la importación sea @nestjs/websockets
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io'; // Importa Server y Socket de 'socket.io'

@WebSocketGateway({
  // Escucha en el mismo puerto HTTP de NestJS.
  // Configuración CORS para WebSockets (¡Ajustar para producción!)
  cors: {
    origin: '*', // Permite conexiones desde cualquier origen (AJUSTAR PARA PRODUCCIÓN REAL CON DOMINIOS ESPECÍFICOS)
    methods: ['GET', 'POST'], // Métodos permitidos para el handshake WebSocket
    credentials: true, // Si usas credenciales (cookies, auth headers en el handshake)
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() public server: Server; // Inyecta la instancia del servidor Socket.IO

  private logger: Logger = new Logger('EventsGateway');

  // === MÉTODOS REQUERIDOS POR LAS INTERFACES ===

  // Se llama cuando el Gateway se ha inicializado completamente
  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway Inicializado.');
  }

  // Se llama cuando un nuevo cliente WebSocket se conecta
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    // Puedes añadir lógica aquí para autenticar clientes o unirlos a salas
  }

  // Se llama cuando un cliente WebSocket se desconecta
  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // === FIN DE MÉTODOS REQUERIDOS ===

  // Ejemplo de cómo recibir un mensaje de un cliente (no lo usaremos en el flujo actual)
  @SubscribeMessage('messageToServer')
  handleMessage(@MessageBody() data: string): string {
    this.logger.log(`Mensaje recibido del cliente: ${data}`);
    return `Servidor recibió: ${data}`;
  }
}
