// src/events/events.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsService {
  private logger: Logger = new Logger('EventsService');

  constructor(private eventsGateway: EventsGateway) {}

  sendPermisoNotification(permiso: any, type: 'nuevo' | 'actualizado') {
    this.logger.log(
      `[WS] Enviando notificación: Permiso ${type} - ID: ${permiso.id}`,
    );
    this.eventsGateway.server.emit('permisoNotification', {
      type: type,
      permiso: permiso,
      message: `Un permiso ha sido ${type === 'nuevo' ? 'creado' : 'actualizado'} para el trabajo "${permiso.trabajo.nombre}".`,
    });
  }
}
