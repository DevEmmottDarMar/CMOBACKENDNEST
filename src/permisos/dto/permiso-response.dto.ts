// src/permisos/dto/permiso-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermisoEstado } from '../entities/permiso.entity'; // Asegura la ruta correcta

// DTO para la data de usuario en la respuesta de Permiso (más conciso)
class PermisoResponseUser {
  @ApiProperty({ description: 'ID UUID del usuario', example: '1fff7471-86da-4530-84d3-4979e670a959' })
  id: string;
  @ApiProperty({ description: 'Nombre del usuario', example: 'Carlos Tecnico Centro' })
  nombre: string;
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'tecnico@example.com', format: 'email' })
  email?: string; // Opcional si no siempre se devuelve
}

// DTO para la data de trabajo en la respuesta de Permiso (más conciso)
class PermisoResponseTrabajo {
  @ApiProperty({ description: 'ID UUID del trabajo', example: '459b3e73-e0d6-463e-bf49-aae1e5563ec2' })
  id: string;
  @ApiProperty({ description: 'Nombre del trabajo', example: 'Revisión de Circuitos Eléctricos' })
  nombre: string;
  @ApiProperty({ description: 'Estado del trabajo', enum: ['pendiente', 'en_progreso', 'completado', 'cancelado'], example: 'en_progreso' })
  estado: string;
}

// DTO para la data de tipo de permiso en la respuesta de Permiso (más conciso)
class PermisoResponseTipoPermiso {
  @ApiProperty({ description: 'ID UUID del tipo de permiso', example: 'd3223b22-11b9-4a2e-bc48-0d466b50c19f' })
  id: string;
  @ApiProperty({ description: 'Nombre del tipo de permiso', example: 'altura' })
  nombre: string;
  @ApiProperty({ description: 'Descripción del tipo de permiso', example: 'Permiso para trabajos en altura o en elevaciones.', nullable: true })
  descripcion?: string; // Opcional si no siempre se devuelve
}


// DTOs de respuesta base para la propiedad 'data'
export class PermisoResponseData {
  @ApiProperty({ description: 'ID UUID del permiso', example: '5357b693-3fc2-46a0-96c6-512751bd9eb7' })
  id: string;
  @ApiProperty({ description: 'Objeto de Trabajo asociado', type: Object })
  trabajo: any;
  @ApiProperty({ description: 'Objeto de Técnico que envió el permiso', type: Object })
  tecnico: any;
  @ApiProperty({ description: 'Objeto del Tipo de Permiso', type: Object })
  tipoPermiso: any;
  @ApiProperty({ description: 'Clave de foto en S3 (si aplica)', nullable: true })
  fotoKey: string | null;
  @ApiProperty({ description: 'Estado actual del permiso', enum: PermisoEstado, example: PermisoEstado.PENDIENTE })
  estado: PermisoEstado;
  @ApiProperty({ description: 'Comentarios del técnico', nullable: true })
  comentariosTecnico: string | null;
  @ApiProperty({ description: 'Fecha y hora de envío', example: '2025-07-07T17:13:18.499Z' })
  enviadoAt: Date;
  @ApiProperty({ description: 'Objeto de Supervisor que revisó', type: Object, nullable: true })
  supervisor: any | null;
  @ApiProperty({ description: 'Comentarios del supervisor', nullable: true })
  comentariosSupervisor: string | null;
  @ApiProperty({ description: 'Fecha y hora de revisión', example: '2025-07-07T18:20:00.000Z', nullable: true })
  revisadoAt: Date | null;
}

// DTOs para las respuestas completas de la API (con 'message' y 'data')
export class PermisoSingleResponse {
  @ApiProperty({ description: 'Mensaje de la operación', example: 'Permiso creado exitosamente.' })
  message: string;
  @ApiProperty({ type: PermisoResponseData, description: 'Objeto del permiso.' })
  data: PermisoResponseData;
}

export class PermisoListResponse {
  @ApiProperty({ description: 'Mensaje de la operación', example: 'Permisos pendientes obtenidos exitosamente.' })
  message: string;
  @ApiProperty({ type: [PermisoResponseData], description: 'Array de objetos de permiso.' })
  data: PermisoResponseData[];
}

export class PermisoResponseDto {
  @ApiProperty({
    description: 'ID único del permiso',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'ID del trabajo al que pertenece el permiso',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  trabajoId: string;

  @ApiProperty({
    description: 'ID del técnico que solicita el permiso',
    example: '8476471a-4c5c-4938-9f0f-7b8ac9242b4c',
    format: 'uuid'
  })
  tecnicoId: string;

  @ApiProperty({
    description: 'ID del tipo de permiso solicitado',
    example: '369a8f2e-c985-47d8-bd20-4bbe575cd0e3',
    format: 'uuid'
  })
  tipoPermisoId: string;

  @ApiProperty({
    description: 'Estado actual del permiso',
    enum: ['pendiente', 'aprobado', 'rechazado'],
    example: 'pendiente'
  })
  estado: 'pendiente' | 'aprobado' | 'rechazado';

  @ApiPropertyOptional({
    description: 'Comentarios del técnico sobre el permiso',
    example: 'Necesito acceso a áreas elevadas para realizar el mantenimiento',
    nullable: true
  })
  comentariosTecnico?: string | null;

  @ApiPropertyOptional({
    description: 'Comentarios del supervisor sobre la aprobación/rechazo',
    example: 'Permiso aprobado. Asegúrate de usar el equipo de protección',
    nullable: true
  })
  comentariosSupervisor?: string | null;

  @ApiPropertyOptional({
    description: 'Clave de la imagen en S3 (si existe)',
    example: 'permisos/2025/01/15/permiso-123-image.jpg',
    nullable: true
  })
  fotoKey?: string | null;

  @ApiProperty({
    description: 'Fecha y hora de creación del permiso',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización del permiso',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time'
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha y hora de envío del permiso',
    example: '2025-01-15T10:30:00.000Z',
    format: 'date-time',
    nullable: true
  })
  enviadoAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Fecha y hora de autorización del permiso',
    example: '2025-01-15T14:45:00.000Z',
    format: 'date-time',
    nullable: true
  })
  autorizadoAt?: Date | null;

  @ApiPropertyOptional({
    description: 'ID del supervisor que autorizó el permiso',
    example: 'b2c3d4e5-f6g7-8901-2345-678901abcdef',
    format: 'uuid',
    nullable: true
  })
  autorizadoPor?: string | null;
}