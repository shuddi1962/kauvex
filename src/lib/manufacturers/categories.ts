export const MANUFACTURING_CATEGORIES: Record<string, string[]> = {
  'Textiles & Apparel': [
    'Fabric mills',
    'Garment factories',
    'Knitwear producers',
    'Denim manufacturers',
    'Activewear/sportswear factories',
    'Uniform manufacturers',
    'Embroidery/print-on-fabric',
  ],
  'Footwear & Leather': [
    'Shoe factories',
    'Leather tanneries',
    'Bag/luggage manufacturers',
    'Leather accessory makers',
  ],
  'Furniture & Woodwork': [
    'Furniture factories',
    'Cabinet makers',
    'Wood/MDF panel producers',
    'Office furniture manufacturers',
  ],
  'Electronics & Hardware': [
    'PCB assembly (EMS)',
    'Consumer electronics assembly',
    'Cable/charger/accessory factories',
    'IoT device manufacturers',
    'Battery manufacturers',
  ],
  'Food & Beverage Processing': [
    'Packaged food producers',
    'Beverage bottling/canning plants',
    'Snack food manufacturers',
    'Confectionery producers',
    'Spice/seasoning blenders',
    'Co-packing facilities',
  ],
  'Cosmetics & Personal Care': [
    'Skincare formulation labs',
    'Haircare manufacturers',
    'Soap/cosmetic producers',
    'Fragrance/perfume manufacturers',
    'Contract manufacturing',
  ],
  'Plastics & Packaging': [
    'Injection molding facilities',
    'Packaging box/carton manufacturers',
    'Bottle/container producers',
    'Flexible packaging',
  ],
  'Metal Works & Fabrication': [
    'Sheet metal fabrication',
    'Casting/forging facilities',
    'Aluminum/steel product makers',
    'Cookware/kitchenware manufacturers',
  ],
  "Toys & Children's Products": [
    'Toy manufacturers',
    "Children's furniture/equipment makers",
    'Educational product manufacturers',
  ],
  'Automotive & Parts': [
    'Auto parts manufacturers',
    'Tire/rubber producers',
    'Automotive accessory makers',
  ],
  'Jewelry & Accessories': [
    'Jewelry manufacturers',
    'Watch assembly facilities',
    'Fashion accessory producers',
  ],
  'Printing & Stationery': [
    'Commercial printing facilities',
    'Notebook/paper goods manufacturers',
    'Custom stationery producers',
  ],
  'Home Goods & Textiles': [
    'Bedding/linen manufacturers',
    'Curtain/upholstery fabric producers',
    'Home decor manufacturers',
  ],
  'Construction & Building Materials': [
    'Tile/ceramic manufacturers',
    'Paint/coating producers',
    'Hardware/fastener manufacturers',
  ],
  'Agricultural Processing': [
    'Oil pressing/refining facilities',
    'Grain milling operations',
    'Fertilizer/agri-input producers',
  ],
  'Pharmaceuticals & Supplements': [
    'GMP-certified supplement manufacturers',
    'Generic pharmaceutical producers',
  ],
  'Custom/Promotional Products': [
    'Promotional item manufacturers',
    'Custom merchandise factories',
    'Corporate gift manufacturers',
  ],
  '3D Printing & Rapid Prototyping': [
    '3D printing service bureaus',
    'CNC machining facilities',
    'Prototype development shops',
  ],
  'Renewable Energy Equipment': [
    'Solar panel/component assembly',
    'Battery storage manufacturers',
  ],
};

export const CERTIFICATION_TYPES = [
  'ISO 9001',
  'ISO 14001',
  'SA8000',
  'BSCI',
  'SEDEX',
  'GMP',
  'HACCP',
  'FDA Registration',
  'CE Marking',
  'NAFDAC',
  'SON',
  'MANCAP',
  'Halal',
  'Kosher',
  'Fair Trade',
  'OEKO-TEX',
  'BIFMA',
];

export function getCategoryList(): string[] {
  return Object.keys(MANUFACTURING_CATEGORIES);
}

export function getSubcategories(category: string): string[] {
  return MANUFACTURING_CATEGORIES[category] ?? [];
}
