import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MarketRateRule {
  keywords: string[];
  categoryName: string;
  hourlyRate: number; // Base rate €/h
  baseHours: number;
  emoji: string;
}

const MARKET_RULES: MarketRateRule[] = [
  {
    keywords: ['déménagement', 'carton', 'canapé', 'meuble', 'transport', 'camion', 'déménager', 'porte', 'étage'],
    categoryName: 'Déménagement & Manutention',
    hourlyRate: 22,
    baseHours: 3,
    emoji: '📦',
  },
  {
    keywords: ['bricolage', 'peinture', 'montage', 'ikea', 'fixer', 'étagère', 'serrure', 'porte', 'mur', 'percer'],
    categoryName: 'Bricolage & Travaux',
    hourlyRate: 25,
    baseHours: 2,
    emoji: '🛠️',
  },
  {
    keywords: ['jardin', 'jardinage', 'pelouse', 'haie', 'tonte', 'arbre', 'taille', 'arrosage', 'fleur', 'désherbage'],
    categoryName: 'Jardinage & Extérieur',
    hourlyRate: 20,
    baseHours: 2,
    emoji: '🌿',
  },
  {
    keywords: ['ménage', 'nettoyage', 'propres', 'vitres', 'appartement', 'maison', 'repassage', 'sol'],
    categoryName: 'Ménage & Entretien',
    hourlyRate: 18,
    baseHours: 3,
    emoji: '🧹',
  },
  {
    keywords: ['cours', 'maths', 'anglais', 'français', ' soutien', 'scolaire', 'professeur', 'aide aux devoirs', 'guitare', 'piano'],
    categoryName: 'Cours & Soutien Scolaire',
    hourlyRate: 30,
    baseHours: 1.5,
    emoji: '🎓',
  },
  {
    keywords: ['garderie', 'baby-sitting', 'babysitting', 'enfant', 'garde', 'nourrice', 'bébé'],
    categoryName: 'Garde d\'Enfants',
    hourlyRate: 16,
    baseHours: 4,
    emoji: '👶',
  },
  {
    keywords: ['informatique', 'ordinateur', 'wifi', 'bug', 'réseau', 'site', 'développement', 'pc', 'imprimante'],
    categoryName: 'Informatique & Dépannage',
    hourlyRate: 35,
    baseHours: 2,
    emoji: '💻',
  },
  {
    keywords: ['plomberie', 'fuite', 'robinet', 'évier', 'tuyau', 'salle de bain', 'wc', 'eau'],
    categoryName: 'Plomberie',
    hourlyRate: 40,
    baseHours: 1.5,
    emoji: '🚰',
  },
  {
    keywords: ['électricité', 'prise', 'tableau', 'ampoule', 'lumière', 'câble', 'panne'],
    categoryName: 'Électricité',
    hourlyRate: 38,
    baseHours: 2,
    emoji: '⚡',
  },
];

@Injectable()
export class AiService {
  /**
   * AI Generator for Job Post creation
   */
  async generateJob(prompt: string, userLocation?: string) {
    const cleanPrompt = (prompt || '').trim().toLowerCase();
    const location = userLocation || 'Paris';

    // Find matching rule
    const matchedRule = MARKET_RULES.find((rule) =>
      rule.keywords.some((kw) => cleanPrompt.includes(kw))
    ) || {
      categoryName: 'Services Divers',
      hourlyRate: 22,
      baseHours: 2,
      emoji: '💡',
    };

    // Calculate duration & price
    const locationMultiplier = location.toLowerCase().includes('paris') ? 1.2 : 1.0;
    const calculatedPrice = Math.round(matchedRule.hourlyRate * matchedRule.baseHours * locationMultiplier);

    // Try matching category in database
    const categories = await prisma.category.findMany();
    const matchedCategory = categories.find((c) =>
      c.name.toLowerCase().includes(matchedRule.categoryName.toLowerCase())
    ) || categories[0];

    // Generate catchy title
    const rawTopic = prompt.replace(/bénévole|cherche|besoin de|aide pour|voulais/gi, '').trim();
    const formattedTopic = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1);
    const title = `${matchedRule.emoji} ${formattedTopic.length > 5 ? formattedTopic : matchedRule.categoryName} — ${location}`;

    // Generate structured Markdown description
    const description = `### ${matchedRule.emoji} Description de la Mission
Nous recherchons un prestataire qualifié pour effectuer la mission suivante : **${prompt}**.

### 📋 Tâches & Déroulement
- Réalisation des prestations demandées avec soin et professionnalisme.
- Matériel nécessaire à prévoir ou fourni sur place selon accord.
- Ponctualité et communication fluide exigées.

### 🎯 Profil Recherché & Compétences
- Expérience préalable appréciée en ${matchedRule.categoryName}.
- Personne de confiance, sérieuse et rigoureuse.
- Profils certifiés *Identité Vérifiée 🛡️* prioritaires.

### 📍 Détails Pratiques
- **Lieu :** ${location}
- **Durée estimée :** ~${matchedRule.baseHours} heure(s)
- **Paiement :** Sécurisé via séquestre JobConnect à la fin de la prestation.`;

    return {
      title,
      description,
      recommendedPrice: calculatedPrice,
      estimatedDuration: matchedRule.baseHours,
      categoryId: matchedCategory?.id || '',
      categoryName: matchedCategory?.name || matchedRule.categoryName,
      explanation: `Prix estimé à ${calculatedPrice} € (sur la base de ~${matchedRule.baseHours}h à ${Math.round(matchedRule.hourlyRate * locationMultiplier)} €/h pour la zone ${location}).`,
    };
  }

  /**
   * AI Smart Price Estimator
   */
  async estimatePrice(title: string, description: string, location?: string) {
    const text = `${title} ${description}`.toLowerCase();
    const matchedRule = MARKET_RULES.find((rule) =>
      rule.keywords.some((kw) => text.includes(kw))
    ) || {
      categoryName: 'Service Général',
      hourlyRate: 22,
      baseHours: 2.5,
      emoji: '💡',
    };

    const isParis = (location || '').toLowerCase().includes('paris');
    const locMultiplier = isParis ? 1.25 : 1.0;

    const basePrice = Math.round(matchedRule.hourlyRate * matchedRule.baseHours * locMultiplier);
    const minPrice = Math.max(15, Math.round(basePrice * 0.8));
    const maxPrice = Math.round(basePrice * 1.25);

    return {
      recommendedPrice: basePrice,
      minPrice,
      maxPrice,
      currency: '€',
      explanation: `Fourchette recommandée : ${minPrice} € – ${maxPrice} € (Basée sur le tarif moyen de ${matchedRule.categoryName} à ${location || 'votre secteur'}).`,
    };
  }

  /**
   * AI Candidate Cover Letter / Pitch Generator
   */
  async generatePitch(jobTitle: string, jobDescription: string, userBio?: string) {
    const topic = jobTitle.replace(/^[^\w\s]+/, '').trim();
    const bioText = userBio ? ` Fort de mon expérience (${userBio.slice(0, 100)}...),` : '';

    const pitch = `Bonjour !

Je suis très intéressé par votre annonce "${topic}".${bioText} je suis disponible et équipé pour intervenir rapidement à la date convenue.

Je m'engage à réaliser un travail soigné, efficace et conforme à vos attentes. Vous pouvez consulter les avis sur mon profil JobConnect.

Restant à votre disposition pour échanger par message,
À bientôt !`;

    return { pitch };
  }
}
