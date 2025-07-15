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
  private clients: Map<string, { 
    ws: WebSocket, 
    userId: string, 
    rol: string, 
    areaId: string | undefined,
    nombre: string,
    email: string,
    area?: { id: string, nombre: string }
  }> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Método de ciclo de vida: se llama cuando el Gateway se ha inicializado completamente.
   * Aquí configuramos los listeners para las conexiones entrantes del servidor WebSocket puro.
   */
  afterInit(wss: WebSocketServerInterface) {
    this.logger.log('🚀 WebSocket Gateway Inicializado (WS puro) - Railway Mode');
    
    // El WsAdapter de NestJS se encarga de llamar a este 'connection' handler cuando un nuevo cliente se conecta.
    this.wss.on('connection', async (ws: WebSocket, request: any) => {
      this.logger.log('🔌 Nueva conexión WebSocket recibida');
      
      // Esperar el primer mensaje con el token JWT
      ws.once('message', async (data) => {
        this.logger.log('📨 Mensaje recibido para autenticación');
        
        try {
          // 🔍 Paso 1: Parsear mensaje
          this.logger.log(`🔍 Parseando datos: ${data.toString()}`);
          const { token } = JSON.parse(data.toString());
          
          if (!token) {
            this.logger.error('❌ No se encontró token en el mensaje');
            ws.close();
            return;
          }

          // 🔍 Paso 2: Verificar JWT
          this.logger.log('🔐 Verificando JWT token...');
          const payload = this.jwtService.verify(token);
          this.logger.log(`✅ JWT verificado. Payload: ${JSON.stringify(payload)}`);
          
          // 🔍 Paso 3: Buscar usuario
          this.logger.log(`👤 Buscando usuario con ID: ${payload.sub}`);
          const user = await this.usersService.findOneById(payload.sub);
          
          if (!user) {
            this.logger.error(`❌ Usuario no encontrado con ID: ${payload.sub}`);
            ws.close();
            return;
          }

          this.logger.log(`✅ Usuario encontrado: ${user.nombre} (${user.email})`);
          this.logger.log(`📋 Rol: ${user.role?.nombre || 'sin_rol'}`);
          this.logger.log(`🏢 Área: ${user.area?.nombre || 'sin_área'}`);

          // 🔍 Paso 4: Registrar cliente
          const clientId = request.headers['sec-websocket-key'] || Date.now().toString();
          const userRole = user.role?.nombre || 'sin_rol';
          this.clients.set(clientId, { 
            ws, 
            userId: user.id, 
            rol: userRole, 
            areaId: user.areaId,
            nombre: user.nombre,
            email: user.email,
            area: user.area ? { id: user.area.id, nombre: user.area.nombre } : undefined
          });
          
          this.logger.log(`🎉 Cliente autenticado exitosamente: ${user.nombre} (${userRole})`);
          
          // Enviar confirmación de autenticación
          ws.send(JSON.stringify({
            event: 'authenticated',
            message: `Bienvenido ${user.nombre}! Conectado como ${userRole}`,
            user: {
              id: user.id,
              nombre: user.nombre,
              rol: userRole,
              area: user.area?.nombre
            }
          }));

          this.emitConnectedUsers();
          
          // Notificar a todos los clientes sobre el nuevo usuario conectado
          this.notifyUserConnected(user, userRole);

          ws.on('close', () => {
            this.clients.delete(clientId);
            this.emitConnectedUsers();
            this.logger.log(`👋 Cliente desconectado: ${user.nombre} (${userRole})`);
          });

          ws.on('error', (error: Error) => {
            this.logger.error(`💥 Error en cliente WS ${clientId}: ${error.message}`);
          });

        } catch (error) {
          this.logger.error(`💥 ERROR EN AUTENTICACIÓN WEBSOCKET:`);
          this.logger.error(`🔍 Error tipo: ${error.constructor.name}`);
          this.logger.error(`📝 Error mensaje: ${error.message}`);
          this.logger.error(`📍 Error stack: ${error.stack}`);
          
          // Enviar mensaje de error al cliente antes de cerrar
          try {
            ws.send(JSON.stringify({
              event: 'authError',
              message: `Error de autenticación: ${error.message}`,
              error: error.constructor.name
            }));
          } catch (sendError) {
            this.logger.error(`💥 Error enviando mensaje de error: ${sendError.message}`);
          }
          
          // Cerrar conexión después de un pequeño delay
          setTimeout(() => {
            ws.close();
          }, 100);
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
   * Emite la lista de usuarios conectados a todos los clientes.
   */
  emitConnectedUsers() {
    const users = Array.from(this.clients.values()).map(info => ({
      id: info.userId,
      userId: info.userId,
      nombre: info.nombre,
      email: info.email,
      rol: info.rol,
      areaId: info.areaId,
      area: info.area
    }));

    this.logger.log(`👥 Emitiendo lista de usuarios conectados: ${users.length} usuarios`);

    this.clients.forEach((info) => {
      if (info.ws.readyState === WebSocket.OPEN) {
        info.ws.send(JSON.stringify({
          event: 'connectedUsers',
          users: users
        }));
      }
    });
  }

  /**
   * Maneja mensajes entrantes de clientes WebSocket.
   * @param client El objeto WebSocket del cliente que envió el mensaje.
   * @param data El contenido del mensaje enviado por el cliente.
   */
  @SubscribeMessage('messageToServer')
  handleMessage(client: WebSocket, @MessageBody() data: any): void {
    this.logger.log(`📨 Mensaje recibido de cliente WS (${client.readyState === WebSocket.OPEN ? 'abierto' : 'cerrado'}): ${JSON.stringify(data)}`);

    // Responder al cliente con un eco del mensaje
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event: 'messageToClient', data: `Eco del servidor: ${JSON.stringify(data)}` }));
    }
  }

  /**
   * Envía una notificación de permiso a todos los clientes WebSocket conectados.
   * @param permiso El objeto del permiso que se ha creado o actualizado.
   * @param type El tipo de notificación ('nuevo' o 'actualizado').
   * @param customMessage El mensaje personalizado a enviar.
   */
  sendPermisoNotification(permiso: any, type: 'nuevo' | 'actualizado', customMessage: string) { // <-- ¡Ahora recibe customMessage!
    const message = customMessage; // Usa el mensaje personalizado
    
    this.logger.log(`🔔 Enviando notificación de permiso ${type}: ${message}`);
    this.logger.log(`📋 Detalles del permiso: ID=${permiso.id}, Estado=${permiso.estado}`);

    this.clients.forEach((info) => {
      if (info.ws.readyState === WebSocket.OPEN) { // Solo envía si la conexión está abierta
        info.ws.send(JSON.stringify({
          event: 'permisoNotification',
          message: message,
          permiso: permiso,
          type: type
        }));
      }
    });
  }

  /**
   * Envía una notificación de trabajo a todos los clientes WebSocket conectados.
   * @param trabajo El objeto del trabajo que se ha iniciado o actualizado.
   * @param type El tipo de notificación ('iniciado', 'aprobado', 'rechazado').
   * @param customMessage El mensaje personalizado a enviar.
   */
  sendTrabajoNotification(trabajo: any, type: 'iniciado' | 'aprobado' | 'rechazado', customMessage: string) {
    const message = customMessage;
    
    this.logger.log(`🔔 Enviando notificación de trabajo ${type}: ${message}`);
    this.logger.log(`📋 Detalles del trabajo: ID=${trabajo.id}, Estado=${trabajo.estado}`);

    this.clients.forEach((info) => {
      if (info.ws.readyState === WebSocket.OPEN) {
        info.ws.send(JSON.stringify({
          event: 'trabajoNotification',
          message: message,
          trabajo: trabajo,
          type: type
        }));
      }
    });
  }

  /**
   * Notifica a todos los clientes cuando un nuevo usuario se conecta.
   * @param user El usuario que se acaba de conectar.
   * @param userRole El rol del usuario.
   */
  notifyUserConnected(user: User, userRole: string) {
    this.logger.log(`🔔 Notificando conexión de nuevo usuario: ${user.nombre} (${userRole})`);

    this.clients.forEach((info) => {
      if (info.ws.readyState === WebSocket.OPEN) {
        info.ws.send(JSON.stringify({
          event: 'userConnected',
          message: `${user.nombre} se ha conectado como ${userRole}`,
          user: {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: userRole,
            area: user.area?.nombre
          }
        }));
      }
    });
  }
}