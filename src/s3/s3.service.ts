import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3Service.name);

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION');

    this.logger.log(`AWS Config - AccessKeyId: ${accessKeyId ? 'SET' : 'NOT SET'}`);
    this.logger.log(`AWS Config - SecretAccessKey: ${secretAccessKey ? 'SET' : 'NOT SET'}`);
    this.logger.log(`AWS Config - BucketName: ${bucketName}`);
    this.logger.log(`AWS Config - Region: ${region}`);

    if (!accessKeyId || !secretAccessKey || !bucketName) {
      this.logger.error('AWS credentials and bucket name are required');
      throw new Error('AWS credentials and bucket name are required');
    }

    this.s3Client = new S3Client({
      region: 'sa-east-1', // Forzar la región correcta
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = bucketName;
    this.logger.log('S3Client initialized successfully');
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      this.logger.log(`Archivo subido exitosamente: ${key}`);
      
      return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
    } catch (error) {
      this.logger.error(`Error al subir archivo: ${error.message}`);
      throw error;
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`URL firmada generada para: ${key}`);
      
      return signedUrl;
    } catch (error) {
      this.logger.error(`Error al generar URL firmada: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`Archivo eliminado exitosamente: ${key}`);
    } catch (error) {
      this.logger.error(`Error al eliminar archivo: ${error.message}`);
      throw error;
    }
  }

  async uploadBase64File(base64Data: string, key: string, contentType: string): Promise<string> {
    try {
      this.logger.log(`Iniciando subida Base64 - Key: ${key}, ContentType: ${contentType}`);
      this.logger.log(`Base64 data length: ${base64Data.length}`);
      
      // Remover el prefijo data:image/jpeg;base64, si existe
      const base64Content = base64Data.replace(/^data:.*?;base64,/, '');
      this.logger.log(`Base64 content length after cleanup: ${base64Content.length}`);
      
      const buffer = Buffer.from(base64Content, 'base64');
      this.logger.log(`Buffer size: ${buffer.length} bytes`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      this.logger.log(`Enviando comando a S3 - Bucket: ${this.bucketName}, Key: ${key}`);
      await this.s3Client.send(command);
      this.logger.log(`Archivo Base64 subido exitosamente: ${key}`);
      
      const url = `https://${this.bucketName}.s3.amazonaws.com/${key}`;
      this.logger.log(`URL generada: ${url}`);
      
      return url;
    } catch (error) {
      this.logger.error(`Error al subir archivo Base64: ${error.message}`);
      this.logger.error(`Error stack: ${error.stack}`);
      throw error;
    }
  }
} 