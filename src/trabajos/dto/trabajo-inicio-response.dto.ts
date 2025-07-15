import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrabajoInicioResponseDto {
  @ApiProperty({
    description: 'ID del trabajo iniciado',
    example: 'e1d68650-a7c2-435e-9623-7e4249e8f00e',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'Título del trabajo',
    example: 'Mantenimiento Preventivo Sistema de Aire Acondicionado'
  })
  titulo: string;

  @ApiProperty({
    description: 'Estado actual del trabajo',
    example: 'pendiente_aprobacion'
  })
  estado: string;

  @ApiProperty({
    description: 'Indica si el trabajo está aprobado',
    example: false
  })
  estaAprobado: boolean;

  @ApiProperty({
    description: 'Indica si el trabajo está rechazado',
    example: false
  })
  estaRechazado: boolean;

  @ApiPropertyOptional({
    description: 'Motivo del rechazo (si aplica)',
    example: 'Foto no cumple con los requisitos de seguridad'
  })
  motivoRechazo?: string;

  @ApiProperty({
    description: 'Fecha de creación de la solicitud',
    example: '2025-01-20T10:30:00.000Z'
  })
  fechaSolicitud: Date;

  @ApiPropertyOptional({
    description: 'Comentarios del técnico',
    example: 'Condiciones normales, equipo funcionando correctamente'
  })
  comentarios?: string;
} 