import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import * as fs from 'fs';
import * as path from 'path';

describe('UploadsService', () => {
  let service: UploadsService;

  beforeEach(() => {
    service = new UploadsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should save a valid PNG image and return result with URL', () => {
    const mockFile = {
      buffer: Buffer.from('fake-png-content'),
      originalname: 'test-image.png',
      mimetype: 'image/png',
      size: 1024,
    };

    const result = service.saveBuffer(mockFile);

    expect(result).toBeDefined();
    expect(result.url).toContain('/uploads/');
    expect(result.filename).toContain('.png');
    expect(result.originalName).toBe('test-image.png');
    expect(result.mimetype).toBe('image/png');

    // Clean up created test file
    const filePath = service.getFilePath(result.filename);
    expect(fs.existsSync(filePath)).toBe(true);
    fs.unlinkSync(filePath);
  });

  it('should reject unsupported MIME types', () => {
    const mockFile = {
      buffer: Buffer.from('console.log("hello")'),
      originalname: 'script.js',
      mimetype: 'application/javascript',
      size: 50,
    };

    expect(() => service.saveBuffer(mockFile)).toThrow(BadRequestException);
  });

  it('should reject files exceeding 10MB', () => {
    const mockFile = {
      buffer: Buffer.from('big-data'),
      originalname: 'large.png',
      mimetype: 'image/png',
      size: 11 * 1024 * 1024, // 11MB
    };

    expect(() => service.saveBuffer(mockFile)).toThrow(BadRequestException);
  });

  it('should throw NotFoundException if file does not exist', () => {
    expect(() => service.getFilePath('non-existent-file-12345.png')).toThrow(NotFoundException);
  });

  it('should prevent path traversal attacks in getFilePath', () => {
    expect(() => service.getFilePath('../../package.json')).toThrow(NotFoundException);
  });
});
