// Single source of truth for tyre brand + tread pattern options, shared by the customer
// registration form and the dealer/master claim forms.
export const BRANDS = [
  'Pirelli',
  'Kumho',
  'GT Radial',
  'RoadX',
  'General Tire',
  'Goodyear',
  'Continental',
  'Dunlop',
  'Doublestar',
] as const;

export type TyreBrand = typeof BRANDS[number];

export const BRAND_PATTERNS: Record<string, string[]> = {
  'Pirelli': [
    'Cinturato P7',
    'Cinturato P7 run flat',
    'Cinturato P7C2',
    'Cinturato P7C2 run flat',
    'CInturato P7Blue',
    'CNT-Rosso',
    'P7AS',
    'P Zero',
    'P Zero run flat',
    'P Zero PZ4',
    'P Zero PZ4 run flat',
    'P Zero Rosso',
    'P Zero PZ5',
    'P Zero PZ5 run flat',
    'Scorpion ATR',
    'Scorpion AT+',
    'Scorpion Verde',
    'Scorpion Verde run flat',
    'Scorpion Veas',
    'Scorpion Veas run flat',
    'Scorpion Zero',
    'Scorpion Zero All Season (SZROAS)',
    'Powergy',
    'P7 Evo',
    'Dragon Sport'
  ],
  'GT Radial': [
    'GTX pro',
    'ECOTEC',
    'FE2',
    'Sportactive 2',
    'Bxt pro',
    'Luxe',
    'Eco',
    'Savero suv',
    'Maxmiler pro'
  ],
  'RoadX': [
    'MX440',
    'U01',
    'H/T01',
    'UX01',
    'H12',
    'AT21',
    'U11',
    'SU01',
    'H/T02',
    'DU71'
  ],
  'Doublestar': [
    'DS602',
    'DH03',
    'DU05',
    'DL01',
    'DS01',
    'DSU02',
    'DU01',
    'DSS02'
  ],
  'Kumho': [
    'Ecowing ES31',
    'Ecsta PS31',
    'Ecsta HS52',
    'Ecsta PS71',
    'Ecsta PS71 EV',
    'Ecsta PS71 SUV',
    'Ecsta Sport PS72',
    'Ecsta Sport-S PS72-S',
    'Crugen HP51',
    'Crugen HP71',
    'Crugen HP71 EV'
  ],
  'General Tire': [
    'Altimax GC5',
    'Altimax GS6',
    'Grabber HT6',
    'Grabber AT6'
  ],
  'Goodyear': [
    'Assurance TripleMax 2',
    'Assurance DuraPlus 2',
    'Assurance ComforTred',
    'Eagle F1 Asymmetric',
    'Eagle F1 Directional 5',
    'Eagle EfficientGrip',
    'EfficientGrip Performance',
    'Excellence'
  ],
  'Continental': [
    'UltraContact UC6',
    'UltraContact UC7',
    'UltraContact UCJ',
    'PremiumContact 2',
    'PremiumContact C',
    'EcoContact 6',
    'EcoContact 6Q',
    'EcoContact 7 S',
    'MaxContact MC6'
  ],
  'Dunlop': [
    'SP Sport LM704',
    'SP Sport Maxx TT',
    'SP Sport J5',
    'SP Sport J6',
    'SP Sport 270',
    'Enasave EC300',
    'Direzza DZ102',
    'Formula D05',
    'Formula D06',
    'SP10'
  ],
};

// Get tread patterns for a specific brand
export const getTreadPatternsForBrand = (brand: string): string[] => {
  return BRAND_PATTERNS[brand] || [];
};
