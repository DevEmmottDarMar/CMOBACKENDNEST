// src/tipos-permiso/dto/create-tipo-permiso.dto.ts
import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateTipoPermisoDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  nombre: string; // <-- ¡Esta propiedad debe estar definida!

  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción no puede estar vacía.' })
  descripcion: string; // <-- ¡Esta propiedad debe estar definida!

  @IsBoolean({ message: 'El estado "activo" debe ser un booleano.' })
  @IsOptional() // Es opcional al crear
  activo?: boolean; // <-- ¡Esta propiedad también debe estar definida!
}
