import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  saveBuffer(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }): UploadResult {
    if (!file || !file.buffer) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Type de fichier non autorisé (${file.mimetype}). Types acceptés: JPG, PNG, WEBP, GIF, PDF`,
      );
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeBytes) {
      throw new BadRequestException('La taille du fichier ne doit pas dépasser 10 Mo');
    }

    const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
    const filename = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${filename}`,
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  getFilePath(filename: string): string {
    const safeFilename = path.basename(filename);
    const fullPath = path.join(this.uploadDir, safeFilename);

    if (!fs.existsSync(fullPath)) {
      throw new NotFoundException('Fichier introuvable');
    }

    return fullPath;
  }
}
