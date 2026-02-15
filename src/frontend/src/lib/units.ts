export const UNITS = [
  'Rft',
  'Sft',
  'Cuft',
  'Rmt',
  'Smt',
  'Cumt',
  'Pcs',
  'Nos',
  'Bundles',
  'Ltr',
  'Kg',
  'Ton',
  'Lumsum',
] as const;

export type Unit = typeof UNITS[number];
