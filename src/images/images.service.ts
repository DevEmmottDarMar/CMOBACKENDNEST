import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly s3Service: S3Service,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    try {
      const image = this.imageRepository.create(createImageDto);
      const savedImage = await this.imageRepository.save(image);
      
      this.logger.log(`Imagen creada exitosamente: ${savedImage.id}`);
      return savedImage;
    } catch (error) {
      this.logger.error(`Error al crear imagen: ${error.message}`);
      throw error;
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    uploadImageDto: any,
  ): Promise<Image> {
    try {
      // Generar clave única para S3
      const timestamp = Date.now();
      const extension = file.originalname.split('.').pop();
      const s3Key = `uploads/images/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

      // Subir archivo a S3
      const url = await this.s3Service.uploadFile(file, s3Key);

      // Crear registro en base de datos
      const createImageDto: CreateImageDto = {
        s3Key,
        url,
        altText: uploadImageDto.altText,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById: uploadImageDto.uploadedById,
        permisoId: uploadImageDto.permisoId,
        trabajoId: uploadImageDto.trabajoId,
      };

      return await this.create(createImageDto);
    } catch (error) {
      this.logger.error(`Error al subir imagen: ${error.message}`);
      throw error;
    }
  }

  async uploadBase64Image(
    base64Data: string,
    contentType: string,
    uploadImageDto: any,
  ): Promise<Image> {
    try {
      // Generar clave única para S3
      const timestamp = Date.now();
      const extension = contentType.split('/')[1];
      const s3Key = `uploads/images/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`;

      // Subir archivo Base64 a S3
      const url = await this.s3Service.uploadBase64File(base64Data, s3Key, contentType);

      // Calcular tamaño aproximado (Base64 es ~33% más grande)
      const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
      const size = Math.ceil((base64Content.length * 3) / 4);

      // Crear registro en base de datos
      const createImageDto: CreateImageDto = {
        s3Key,
        url,
        altText: uploadImageDto.altText,
        mimetype: contentType,
        size,
        uploadedById: uploadImageDto.uploadedById,
        permisoId: uploadImageDto.permisoId,
        trabajoId: uploadImageDto.trabajoId,
      };

      return await this.create(createImageDto);
    } catch (error) {
      this.logger.error(`Error al subir imagen Base64: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Image[]> {
    try {
      return await this.imageRepository.find({
        relations: ['uploadedBy', 'permiso', 'trabajo'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error al obtener todas las imágenes: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string): Promise<Image> {
    try {
      const image = await this.imageRepository.findOne({
        where: { id },
        relations: ['uploadedBy', 'permiso', 'trabajo'],
      });

      if (!image) {
        throw new NotFoundException(`Imagen con ID ${id} no encontrada`);
      }

      return image;
    } catch (error) {
      this.logger.error(`Error al obtener imagen ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByPermiso(permisoId: string): Promise<Image[]> {
    try {
      return await this.imageRepository.find({
        where: { permisoId },
        relations: ['uploadedBy'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error al obtener imágenes del permiso ${permisoId}: ${error.message}`);
      throw error;
    }
  }

  async findByTrabajo(trabajoId: string): Promise<Image[]> {
    try {
      return await this.imageRepository.find({
        where: { trabajoId },
        relations: ['uploadedBy'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error al obtener imágenes del trabajo ${trabajoId}: ${error.message}`);
      throw error;
    }
  }

  async findByUser(userId: string): Promise<Image[]> {
    try {
      return await this.imageRepository.find({
        where: { uploadedById: userId },
        relations: ['permiso', 'trabajo'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Error al obtener imágenes del usuario ${userId}: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, updateImageDto: UpdateImageDto): Promise<Image> {
    try {
      const image = await this.findOne(id);
      
      Object.assign(image, updateImageDto);
      const updatedImage = await this.imageRepository.save(image);
      
      this.logger.log(`Imagen actualizada exitosamente: ${id}`);
      return updatedImage;
    } catch (error) {
      this.logger.error(`Error al actualizar imagen ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const image = await this.findOne(id);
      
      // Eliminar archivo de S3
      await this.s3Service.deleteFile(image.s3Key);
      
      // Eliminar registro de base de datos
      await this.imageRepository.remove(image);
      
      this.logger.log(`Imagen eliminada exitosamente: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar imagen ${id}: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(id: string, expiresIn: number = 3600): Promise<string> {
    try {
      const image = await this.findOne(id);
      return await this.s3Service.getSignedUrl(image.s3Key, expiresIn);
    } catch (error) {
      this.logger.error(`Error al generar URL firmada para imagen ${id}: ${error.message}`);
      throw error;
    }
  }
} 