import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateJob', () => {
    it('should generate a structured job post with title and price estimation', async () => {
      const result = await service.generateJob('Déménagement canapé à Paris');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result.recommendedPrice).toBeGreaterThan(0);
      expect(result.explanation).toContain('Prix estimé');
    });
  });

  describe('estimatePrice', () => {
    it('should calculate price range based on topic and location', async () => {
      const result = await service.estimatePrice('Bricolage étagère IKEA', 'Montage meuble', 'Paris');
      expect(result.minPrice).toBeLessThanOrEqual(result.recommendedPrice);
      expect(result.maxPrice).toBeGreaterThanOrEqual(result.recommendedPrice);
      expect(result.currency).toBe('€');
    });
  });

  describe('generatePitch', () => {
    it('should generate candidate motivation cover letter', async () => {
      const result = await service.generatePitch('Peinture chambre', 'Mise en peinture blanche');
      expect(result.pitch).toContain('Bonjour !');
      expect(result.pitch).toContain('Peinture chambre');
    });
  });

  describe('calculateMatchScore', () => {
    it('should calculate affinity score between 65 and 99', async () => {
      const result = await service.calculateMatchScore(
        'Plomberie',
        'Réparation fuite robinet',
        ['plomberie', 'bricolage'],
        true,
        4.9,
      );
      expect(result.score).toBeGreaterThanOrEqual(65);
      expect(result.score).toBeLessThanOrEqual(99);
      expect(result.breakdown).toHaveProperty('skills');
      expect(result.breakdown).toHaveProperty('reputation');
      expect(result.breakdown).toHaveProperty('verification');
    });
  });

  describe('supportChat', () => {
    it('should respond with relevant support information for keywords', async () => {
      const result = await service.supportChat('Comment fonctionne le séquestre ?');
      expect(result.answer).toContain('séquestre');
    });

    it('should return default fallback answer for unrecognised queries', async () => {
      const result = await service.supportChat('Quelle est la météo ?');
      expect(result.answer).toContain('support JobConnect');
    });
  });

  describe('getGamificationStatus', () => {
    it('should return Bronze level for new users', () => {
      const status = service.getGamificationStatus(2, 4.0);
      expect(status.levelName).toContain('Bronze');
      expect(status.discountPercent).toBe(0);
    });

    it('should return Gold level for experienced users', () => {
      const status = service.getGamificationStatus(18, 4.8);
      expect(status.levelName).toContain('Or');
      expect(status.discountPercent).toBe(5);
    });

    it('should return Diamond level for top tier users', () => {
      const status = service.getGamificationStatus(35, 4.9);
      expect(status.levelName).toContain('Diamant');
      expect(status.discountPercent).toBe(10);
    });
  });
});
