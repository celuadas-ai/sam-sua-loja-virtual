import type { Language } from '@/i18n/translations';

/**
 * Traduz labels de unidade guardados em português na base de dados
 * (ex: "Caixa (2 garrafões)", "Mín. 5 garrafões", "1 pack (12un)").
 */
export function translateUnitLabel(label: string | undefined | null, language: Language): string {
  if (!label) return '';
  if (language === 'pt') return label;

  return label
    .replace(/Mín\./gi, 'Min.')
    .replace(/caução de garrafão/gi, 'Bottle deposit')
    .replace(/caução/gi, 'deposit')
    .replace(/garrafões/gi, 'bottles')
    .replace(/garrafão/gi, 'bottle')
    .replace(/galões/gi, 'gallons')
    .replace(/galão/gi, 'gallon')
    .replace(/caixas/gi, 'boxes')
    .replace(/caixa/gi, 'box')
    .replace(/unidades/gi, 'units')
    .replace(/(\d+)\s*un\b/gi, '$1pcs')
    .replace(/packs/gi, 'packs')
    .replace(/pack/gi, 'pack');
}

/** Abreviatura de unidade usada nos preços (cx / pack / un). */
export function unitAbbrev(unitLabel: string, minQuantity: number, language: Language): string {
  if (minQuantity <= 1) return language === 'en' ? 'ea' : 'un';
  const isBox = unitLabel?.toLowerCase().includes('caixa') || unitLabel?.toLowerCase().includes('box');
  if (isBox) return language === 'en' ? 'box' : 'cx';
  return 'pack';
}
