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

const SUPPORT_FAQ = [
  {
    keywords: ['séquestre', 'paiement', 'argent', 'payer', 'bloqué', 'escrow', 'sécurité'],
    response: "Le système de paiement séquestre JobConnect bloque le montant de la mission lors de la validation. L'argent n'est transmis au prestataire qu'une fois la mission marquée comme terminée et validée par l'employeur ! 🛡️",
  },
  {
    keywords: ['kyc', 'identité', 'pièce', 'passeport', 'cni', 'selfie', 'vérification', 'badge'],
    response: "Pour obtenir le badge 'Identité Vérifiée 🛡️', rendez-vous sur votre profil, soumettez votre pièce d'identité (CNI/Passeport) et votre selfie. L'administration examine les demandes sous 24h !",
  },
  {
    keywords: ['commission', 'frais', 'réduction', 'niveau', 'badge', 'fidélité', 'or', 'diamant'],
    response: "JobConnect récompense les utilisateurs fidèles ! En accomplissant des missions, vous gagnez des niveaux : Bronze 🥉, Argent 🥈 (-2% frais), Or 🥇 (-5% frais) et Diamant 💎 (-10% frais).",
  },
  {
    keywords: ['annuler', 'refuser', 'litige', 'problème', 'annulation'],
    response: "En cas de problème ou d'impossibilité d'effectuer la mission, vous pouvez contacter l'assistance via la messagerie ou signaler la mission. Les fonds en séquestre sont alors gelés pour arbitrage admin.",
  },
  {
    keywords: ['bonjour', 'salut', 'hello', 'aide', 'question'],
    response: "Bonjour ! Je suis l'assistant IA de support JobConnect 🤖. Comment puis-je vous aider aujourd'hui ? (Paiements, Séquestre, Vérification KYC, Candidatures, Tarifs...)",
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

    const matchedRule = MARKET_RULES.find((rule) =>
      rule.keywords.some((kw) => cleanPrompt.includes(kw))
    ) || {
      categoryName: 'Services Divers',
      hourlyRate: 22,
      baseHours: 2,
      emoji: '💡',
    };

    const locationMultiplier = location.toLowerCase().includes('paris') ? 1.2 : 1.0;
    const calculatedPrice = Math.round(matchedRule.hourlyRate * matchedRule.baseHours * locationMultiplier);

    const categories = await prisma.category.findMany();
    const matchedCategory = categories.find((c) =>
      c.name.toLowerCase().includes(matchedRule.categoryName.toLowerCase())
    ) || categories[0];

    const rawTopic = prompt.replace(/bénévole|cherche|besoin de|aide pour|voulais/gi, '').trim();
    const formattedTopic = rawTopic.charAt(0).toUpperCase() + rawTopic.slice(1);
    const title = `${matchedRule.emoji} ${formattedTopic.length > 5 ? formattedTopic : matchedRule.categoryName} — ${location}`;

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

  /**
   * Advanced AI Matchmaking Score Calculator
   */
  async calculateMatchScore(
    jobTitle: string,
    jobDescription: string,
    candidateSkills: string[] = [],
    isVerified = false,
    rating = 5.0,
  ) {
    const fullText = `${jobTitle} ${jobDescription}`.toLowerCase();

    // Skill Match (40 pts max)
    let skillScore = 20; // Default base
    if (candidateSkills && candidateSkills.length > 0) {
      const matches = candidateSkills.filter((s) => fullText.includes(s.toLowerCase()));
      skillScore = Math.min(40, 20 + matches.length * 10);
    }

    // Reputation Score (30 pts max)
    const ratingScore = Math.round((rating / 5.0) * 30);

    // Verification Score (30 pts max)
    const verificationScore = isVerified ? 30 : 15;

    const totalScore = Math.min(99, Math.max(65, skillScore + ratingScore + verificationScore));

    let summary = "Excellente compatibilité pour cette mission !";
    if (totalScore >= 90) summary = "Match Parfait 🔥 — Compétences & Profil vérifié d'exception";
    else if (totalScore >= 80) summary = "Très bon profil 🌟 — Forte affinité avec les exigences";
    else summary = "Profil compatible 👍 — Disponible pour cette prestation";

    return {
      score: totalScore,
      breakdown: {
        skills: skillScore,
        reputation: ratingScore,
        verification: verificationScore,
      },
      summary,
    };
  }

  /**
   * AI Support Chatbot Query Processor
   */
  async supportChat(message: string) {
    const text = (message || '').toLowerCase();
    const matched = SUPPORT_FAQ.find((item) =>
      item.keywords.some((kw) => text.includes(kw))
    );

    if (matched) {
      return { answer: matched.response };
    }

    return {
      answer: "Je comprends votre question. Pour des demandes spécifiques, notre équipe support JobConnect est disponible via le centre d'aide. Vous pouvez également consulter vos notifications ou contacter directement votre interlocuteur via la messagerie !",
    };
  }

  /**
   * User Gamification Level & Loyalty Calculator
   */
  getGamificationStatus(completedJobsCount = 0, averageRating = 5.0) {
    if (completedJobsCount >= 30 && averageRating >= 4.7) {
      return {
        levelName: 'Diamant 💎',
        badge: 'Top Elite 🏆',
        discountPercent: 10,
        nextThreshold: 50,
        currentProgress: 100,
        titleColor: 'text-cyan-400',
        badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      };
    }

    if (completedJobsCount >= 15 && averageRating >= 4.5) {
      return {
        levelName: 'Or 🥇',
        badge: 'Super Prestataire ⚡',
        discountPercent: 5,
        nextThreshold: 30,
        currentProgress: Math.round((completedJobsCount / 30) * 100),
        titleColor: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      };
    }

    if (completedJobsCount >= 5) {
      return {
        levelName: 'Argent 🥈',
        badge: 'Confirmé 🌟',
        discountPercent: 2,
        nextThreshold: 15,
        currentProgress: Math.round((completedJobsCount / 15) * 100),
        titleColor: 'text-slate-300',
        badgeBg: 'bg-slate-400/20 text-slate-200 border-slate-400/40',
      };
    }

    return {
      levelName: 'Bronze 🥉',
      badge: 'Membre Actif 🌱',
      discountPercent: 0,
      nextThreshold: 5,
      currentProgress: Math.round((completedJobsCount / 5) * 100),
      titleColor: 'text-amber-600',
      badgeBg: 'bg-amber-700/20 text-amber-400 border-amber-700/40',
    };
  }
}
