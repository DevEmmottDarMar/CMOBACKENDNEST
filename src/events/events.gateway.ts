// src/events/events.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer, // Decorador de NestJS para inyectar la instancia del servidor WebSocket
  OnGatewayConnection, // Interfaz para manejar conexiones (lógica en afterInit para WS puros)
  OnGatewayDisconnect, // Interfaz para manejar desconexiones (lógica en afterInit para WS puros)
  OnGatewayInit,       // Interfaz para inicializar el gateway (aquí se configura el servidor WS)
} from '@nestjs/websockets'; // Importa de @nestjs/websockets (para el adaptador WS puro)

import { Logger } from '@nestjs/common';
import { Server as WebSocketServerInterface, WebSocket } from 'ws'; // Importa los tipos 'Server' y 'WebSocket' de la librería 'ws'
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway() // Este decorador marca la clase como un gateway WebSocket. Por defecto, escuchará en el mismo puerto HTTP (3000).
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() private wss: WebSocketServerInterface; // Inyecta la instancia del servidor WebSocket (la librería 'ws')

  private logger: Logger = new Logger('EventsGateway');
  // Mapa para mantener info extendida de los clientes conectados
  private clients: Map<string, { ws: WebSocket, userId: string, rol: string, areaId: string | undefined }> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Método de ciclo de vida: se llama cuando el Gateway se ha inicializado completamente.
   * Aquí configuramos los listeners para las conexiones entrantes del servidor WebSocket puro.
   */
  afterInit(wss: WebSocketServerInterface) {
    this.logger.log('WebSocket Gateway Inicializado (WS puro).');
    
    // El WsAdapter de NestJS se encarga de llamar a este 'connection' handler cuando un nuevo cliente se conecta.
    this.wss.on('connection', async (ws: WebSocket, request: any) => {
      // Esperar el primer mensaje con el token JWT
      ws.once('message', async (data) => {
        try {
          const { token } = JSON.parse(data.toString());
          const payload = this.jwtService.verify(token);
          // Buscar usuario en la base de datos
          const user = await this.usersService.findOneById(payload.sub);
          if (!user) {
            ws.close();
            return;
          }
          const clientId = request.headers['sec-websocket-key'] || Date.now().toString();
          this.clients.set(clientId, { ws, userId: user.id, rol: user.rol, areaId: user.areaId });
          this.logger.log(`Cliente autenticado: ${user.nombre} (${user.rol})`);
          this.emitConnectedUsers();

          ws.on('close', () => {
            this.clients.delete(clientId);
            this.emitConnectedUsers();
            this.logger.log(`Cliente desconectado: ${user.nombre} (${user.rol})`);
          });

          ws.on('error', (error: Error) => {
            this.logger.error(`Error en cliente WS ${clientId}: ${error.message}`);
          });
        } catch (e) {
          ws.close();
        }
      });
    });
  }

  /**
   * Método de ciclo de vida: se llama cuando un nuevo cliente WebSocket intenta conectarse.
   * Con WsAdapter, la lógica principal de conexión se maneja en 'afterInit' a través de 'wss.on("connection")'.
   * Este método puede usarse para validaciones adicionales si fuera necesario en la fase de conexión.
   */
  handleConnection(client: WebSocket, ...args: any[]) {}

  /**
   * Método de ciclo de vida: se llama cuando un cliente WebSocket se desconecta.
   * Con WsAdapter, la lógica principal de desconexión se maneja en 'afterInit' a través de 'ws.on("close")'.
   */
  handleDisconnect(client: WebSocket) {}

  /**
   * Emitir la lista filtrada de conectados a cada cliente
   */
  emitConnectedUsers() {
    this.clients.forEach((info, clientId) => {
      let lista: any[] = [];
      if (info.rol === 'supervisor') {
        // Supervisores ven todos los técnicos conectados
        lista = Array.from(this.clients.values())
          .filter(c => c.rol === 'tecnico')
          .map(c => ({ userId: c.userId, areaId: c.areaId }));
      } else if (info.rol === 'tecnico') {
        // Técnicos ven supervisores de su área
        lista = Array.from(this.clients.values())
          .filter(c => c.rol === 'supervisor' && c.areaId === info.areaId)
          .map(c => ({ userId: c.userId, areaId: c.areaId }));
      }
      if (info.ws.readyState === WebSocket.OPEN) {
        info.ws.send(JSON.stringify({ event: 'connectedUsers', users: lista }));
      }
    });
  }

  /**
   * Maneja los mensajes enviados por los clientes al servidor a través del evento 'messageToServer'.
   * Este método es activado por el decorador @SubscribeMessage('messageToServer').
   * @param client El objeto WebSocket del cliente que envió el mensaje.
   * @param data El cuerpo del mensaje enviado por el cliente.
   */
  @SubscribeMessage('messageToServer')
  handleMessage(client: WebSocket, @MessageBody() data: any): void {
    this.logger.log(`Mensaje recibido de cliente WS (${client.readyState === WebSocket.OPEN ? 'abierto' : 'cerrado'}): ${JSON.stringify(data)}`);
    
    // Envía una respuesta de vuelta solo a ese cliente específico.
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: 'messageToClient', data: `Servidor recibió tu mensaje: ${data.text || data}` }));
    }
  }

  /**
   * Envía una notificación de permiso a todos los clientes WebSocket conectados.
   * Este método es llamado por EventsService.
   * @param permiso El objeto permiso completo (populado) que se envía en la notificación.
   * @param type El tipo de evento ('nuevo' o 'actualizado').
   * @param customMessage El mensaje personalizado que se mostrará en la notificación.
   */
  sendPermisoNotification(permiso: any, type: 'nuevo' | 'actualizado', customMessage: string) { // <-- ¡Ahora recibe customMessage!
    const notificationPayload = {
      event: 'permisoNotification', // Nombre del evento que el cliente debe escuchar
      type: type,
      permiso: permiso, // Objeto permiso completo
      message: customMessage, // <-- El mensaje personalizado se incluye aquí
    };

    // Itera sobre todos los clientes conectados y les envía el payload.
    this.clients.forEach((info) => {
      if (info.ws.readyState === WebSocket.OPEN) { // Solo envía si la conexión está abierta
        info.ws.send(JSON.stringify(notificationPayload));
      }
    });
  }
}