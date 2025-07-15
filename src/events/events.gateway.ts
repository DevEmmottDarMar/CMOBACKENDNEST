// src/events/events.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Injectable } from '@nestjs/common';

export enum ConnectionStatus {
  connecting = 'connecting',
  connected = 'connected',
  disconnected = 'disconnected',
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  namespace: '/ws',
}) // Configuración específica para Railway
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private server: Server;

  private logger: Logger = new Logger('EventsGateway');

  private clients: Map<
    string,
    {
      socket: Socket;
      userId: string;
      rol: string;
      areaId: string | undefined;
      nombre: string;
      email: string;
      area?: { id: string; nombre: string };
    }
  > = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Método de ciclo de vida: se llama cuando el Gateway se ha inicializado completamente.
   */
  afterInit(server: Server) {
    this.logger.log('🚀 WebSocket Gateway Inicializado - Railway Mode');
  }

  /**
   * Método de ciclo de vida: se llama cuando un nuevo cliente WebSocket se conecta.
   */
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log('🔌 Nueva conexión WebSocket recibida');
    
    // Obtener token de los query parameters
    const token = client.handshake.query.token as string;
    
    if (token) {
      this.authenticateClient(client, token);
    } else {
      this.logger.error('❌ No se encontró token en la conexión');
      client.disconnect();
    }
  }

  /**
   * Método de ciclo de vida: se llama cuando un cliente WebSocket se desconecta.
   */
  handleDisconnect(client: Socket) {
    this.logger.log('👋 Cliente desconectado');
    
    // Remover cliente de la lista
    for (const [clientId, info] of this.clients.entries()) {
      if (info.socket.id === client.id) {
        this.clients.delete(clientId);
        break;
      }
    }
    
    this.emitConnectedUsers();
  }

  /**
   * Autentica un cliente WebSocket
   */
  private async authenticateClient(socket: Socket, token: string) {
    try {
      // 🔍 Paso 1: Verificar JWT
      this.logger.log('🔐 Verificando JWT token...');
      const payload = this.jwtService.verify(token);
      this.logger.log(`✅ JWT verificado. Payload: ${JSON.stringify(payload)}`);

      // 🔍 Paso 2: Buscar usuario
      this.logger.log(`👤 Buscando usuario con ID: ${payload.sub}`);
      const user = await this.usersService.findOneById(payload.sub);

      if (!user) {
        this.logger.error(`❌ Usuario no encontrado con ID: ${payload.sub}`);
        socket.disconnect();
        return;
      }

      this.logger.log(`✅ Usuario encontrado: ${user.nombre} (${user.email})`);
      this.logger.log(`📋 Rol: ${user.role?.nombre || 'sin_rol'}`);
      this.logger.log(`🏢 Área: ${user.area?.nombre || 'sin_área'}`);

      // 🔍 Paso 3: Registrar cliente
      const clientId = socket.id;
      const userRole = user.role?.nombre || 'sin_rol';
      this.clients.set(clientId, {
        socket,
        userId: user.id,
        rol: userRole,
        areaId: user.areaId,
        nombre: user.nombre,
        email: user.email,
        area: user.area
          ? { id: user.area.id, nombre: user.area.nombre }
          : undefined,
      });

      this.logger.log(
        `🎉 Cliente autenticado exitosamente: ${user.nombre} (${userRole})`,
      );

      // Enviar confirmación de autenticación
      socket.emit('authenticated', {
        message: `Bienvenido ${user.nombre}! Conectado como ${userRole}`,
        user: {
          id: user.id,
          nombre: user.nombre,
          rol: userRole,
          area: user.area?.nombre,
        },
      });

      this.emitConnectedUsers();

      // Notificar a todos los clientes sobre el nuevo usuario conectado
      this.notifyUserConnected(user, userRole);

    } catch (error) {
      this.logger.error(`💥 ERROR EN AUTENTICACIÓN WEBSOCKET:`);
      this.logger.error(`🔍 Error tipo: ${error.constructor.name}`);
      this.logger.error(`📝 Error mensaje: ${error.message}`);
      this.logger.error(`📍 Error stack: ${error.stack}`);

      // Enviar mensaje de error al cliente antes de desconectar
      socket.emit('authError', {
        message: `Error de autenticación: ${error.message}`,
        error: error.constructor.name,
      });

      // Desconectar después de un pequeño delay
      setTimeout(() => {
        socket.disconnect();
      }, 100);
    }
  }

  /**
   * Emite la lista de usuarios conectados a todos los clientes.
   */
  emitConnectedUsers() {
    const users = Array.from(this.clients.values()).map((info) => ({
      id: info.userId,
      userId: info.userId,
      nombre: info.nombre,
      email: info.email,
      rol: info.rol,
      areaId: info.areaId,
      area: info.area,
    }));

    this.logger.log(
      `👥 Emitiendo lista de usuarios conectados: ${users.length} usuarios`,
    );

    this.server.emit('connectedUsers', { users });
  }

  /**
   * Maneja mensajes entrantes de clientes WebSocket.
   */
  @SubscribeMessage('messageToServer')
  handleMessage(client: Socket, @MessageBody() data: any): void {
    this.logger.log(
      `📨 Mensaje recibido de cliente: ${JSON.stringify(data)}`,
    );

    // Responder al cliente con un eco del mensaje
    client.emit('messageToClient', {
      data: `Eco del servidor: ${JSON.stringify(data)}`,
    });
  }

  /**
   * Envía una notificación de permiso a todos los clientes WebSocket conectados.
   */
  sendPermisoNotification(
    permiso: any,
    type: 'nuevo' | 'actualizado',
    customMessage: string,
  ) {
    const message = customMessage;

    this.logger.log(`🔔 Enviando notificación de permiso ${type}: ${message}`);
    this.logger.log(
      `📋 Detalles del permiso: ID=${permiso.id}, Estado=${permiso.estado}`,
    );

    this.server.emit('permisoNotification', {
      message: message,
      permiso: permiso,
      type: type,
    });
  }

  /**
   * Notifica a todos los clientes cuando un nuevo usuario se conecta.
   */
  notifyUserConnected(user: User, userRole: string) {
    this.logger.log(
      `🔔 Notificando conexión de nuevo usuario: ${user.nombre} (${userRole})`,
    );

    this.server.emit('userConnected', {
      message: `${user.nombre} se ha conectado como ${userRole}`,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: userRole,
        area: user.area?.nombre,
      },
    });
  }
}
