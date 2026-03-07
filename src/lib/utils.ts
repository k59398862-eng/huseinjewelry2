import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Arabic to English numeral mapping
const ARABIC_NUMERALS = '٠١٢٣٤٥٦٧٨٩';
const ENGLISH_NUMERALS = '0123456789';

// Convert Arabic numerals (٠١٢٣٤٥٦٧٨٩) to English (0123456789)
export function toEnglishNumbers(str: string | number): string {
  const input = String(str);
  return input.replace(/[٠-٩]/g, (match) => {
    const index = ARABIC_NUMERALS.indexOf(match);
    return index !== -1 ? ENGLISH_NUMERALS[index] : match;
  });
}

// Convert English numerals to Arabic (for display in some contexts)
export function toArabicNumbers(str: string | number): string {
  const input = String(str);
  return input.replace(/[0-9]/g, (match) => {
    const index = ENGLISH_NUMERALS.indexOf(match);
    return index !== -1 ? ARABIC_NUMERALS[index] : match;
  });
}

// Format price with English numbers
export function formatPriceEnglish(amount: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'SAR', 
    minimumFractionDigits: 0 
  }).format(amount).replace('SAR', 'ر.س');
}

// Format price for checkout (plain number with currency)
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}
