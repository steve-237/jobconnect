'use client';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  rateVsEuro: number; // Conversion multiplier if needed
  symbolPosition: 'before' | 'after';
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'EUR', symbol: '€', name: 'Euro (€)', rateVsEuro: 1, symbolPosition: 'after' },
  { code: 'FCFA', symbol: 'FCFA', name: 'Franc CFA (XAF)', rateVsEuro: 655.957, symbolPosition: 'after' },
  { code: 'USD', symbol: '$', name: 'Dollar Américain ($)', rateVsEuro: 1.09, symbolPosition: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar Canadien (C$)', rateVsEuro: 1.48, symbolPosition: 'before' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling (£)', rateVsEuro: 0.85, symbolPosition: 'before' },
];

export function getSelectedCurrency(): CurrencyConfig {
  if (typeof window === 'undefined') return CURRENCIES[0];
  try {
    const savedCode = localStorage.getItem('jobconnect_currency');
    if (savedCode) {
      const found = CURRENCIES.find((c) => c.code === savedCode);
      if (found) return found;
    }
  } catch (e) {}
  return CURRENCIES[0]; // Default EUR (€)
}

export function setSelectedCurrency(code: string): CurrencyConfig {
  const found = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('jobconnect_currency', found.code);
      // Dispatch custom event to notify all components
      window.dispatchEvent(new Event('jobconnect_currency_changed'));
    } catch (e) {}
  }
  return found;
}

export function formatPrice(amount: number | string | undefined | null, customCurrency?: CurrencyConfig): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  if (isNaN(num)) return '0.00 €';

  const curr = customCurrency || getSelectedCurrency();

  // If FCFA, convert from base EUR or display rounded integer
  if (curr.code === 'FCFA') {
    const fcfaAmount = Math.round(num * curr.rateVsEuro);
    return `${fcfaAmount.toLocaleString('fr-FR')} ${curr.symbol}`;
  }

  const formattedNum = (num * (curr.code === 'EUR' ? 1 : curr.rateVsEuro)).toFixed(2);

  if (curr.symbolPosition === 'before') {
    return `${curr.symbol} ${formattedNum}`;
  } else {
    return `${formattedNum} ${curr.symbol}`;
  }
}
