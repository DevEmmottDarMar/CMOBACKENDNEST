// src/events/events.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from './events.gateway'; // Importa el Gateway

@Injectable()
export class EventsService {
  private logger: Logger = new Logger('EventsService');

  constructor(private eventsGateway: EventsGateway) {}

  /**
   * Envía una notificación de permiso a todos los clientes conectados a través de WebSockets puros.
   * Ahora acepta un mensaje personalizado que se incluirá en el payload.
   * @param permiso El objeto permiso completo (populado) que se envía en la notificación.
   * @param type El tipo de evento (ej. 'nuevo', 'actualizado').
   * @param customMessage Opcional. Un mensaje personalizado para la notificación.
   */
  sendPermisoNotification(permiso: any, type: 'nuevo' | 'actualizado', customMessage?: string) {
    const defaultMessage = `Un permiso ha sido ${type === 'nuevo' ? 'creado' : 'actualizado'} para el trabajo "${permiso.trabajo.nombre}".`;
    const messageToSend = customMessage || defaultMessage; // Usa el mensaje personalizado o el por defecto

    this.logger.log(`[WS-Puro] Enviando notificación: Permiso ${type} - ID: ${permiso.id} - Mensaje: ${messageToSend}`);
    
    // Llama al método del Gateway, pasando el mensaje dentro del payload
    this.eventsGateway.sendPermisoNotification(permiso, type, messageToSend);
  }
}