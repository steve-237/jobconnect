/**
 * Helper module for Matching Score (% Fit) & Bookmarks Management
 */

export interface CandidateFitInput {
  distanceKm?: number;
  userRating?: number;
  hasAvailability?: boolean;
  categoryMatch?: boolean;
}

export function calculateMatchingScore(input: CandidateFitInput): number {
  let score = 70; // Base score

  // Proximity bonus (up to +15%)
  if (typeof input.distanceKm === 'number') {
    if (input.distanceKm <= 10) score += 15;
    else if (input.distanceKm <= 30) score += 10;
    else if (input.distanceKm <= 100) score += 5;
  } else {
    score += 8;
  }

  // Rating bonus (up to +10%)
  const rating = input.userRating ?? 4.8;
  score += Math.round((rating / 5) * 10);

  // Category match (+5%)
  if (input.categoryMatch) {
    score += 5;
  }

  // Clamp between 65% and 99%
  return Math.min(99, Math.max(65, score));
}

export function getBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('jobconnect_bookmarks');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function toggleBookmark(jobId: string): boolean {
  if (typeof window === 'undefined') return false;
  const current = getBookmarks();
  const index = current.indexOf(jobId);
  let updated: string[];

  if (index > -1) {
    updated = current.filter((id) => id !== jobId);
  } else {
    updated = [...current, jobId];
  }

  try {
    localStorage.setItem('jobconnect_bookmarks', JSON.stringify(updated));
    window.dispatchEvent(new Event('jobconnect_bookmarks_changed'));
  } catch (e) {}

  return index === -1; // true if added, false if removed
}
