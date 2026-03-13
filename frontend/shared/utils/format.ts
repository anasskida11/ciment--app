/**
 * Utilitaires de formatage
 */

export const formatCurrency = (amount: number | string | null | undefined): string => {
  // Convertir en nombre si c'est une string (cas des Decimal de Prisma)
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  
  // Vérifier que c'est un nombre valide
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return '0.00 أ.م';
  }
  
  return `${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} أ.م`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use numberingSystem: 'latn' to force Western Arabic numerals (0-9)
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn',
  } as Intl.DateTimeFormatOptions);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Use numberingSystem: 'latn' to force Western Arabic numerals (0-9)
  return d.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    numberingSystem: 'latn',
  } as Intl.DateTimeFormatOptions);
};

export const formatNumber = (value: number): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('ar-SA', {
    numberingSystem: 'latn',
  }).format(value);
};
