// src/areas/dto/create-area.dto.ts
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateAreaDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  nombre: string; // <-- ¡Esta propiedad debe estar definida!

  @IsBoolean({ message: 'El estado "activo" debe ser un booleano.' })
  @IsOptional() // Es opcional al crear
  activo?: boolean; // <-- ¡Esta propiedad también debe estar definida!
}
