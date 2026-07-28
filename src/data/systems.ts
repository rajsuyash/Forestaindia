/**
 * The three Foresta Living Forest systems.
 *
 * Specifications are the manufacturer's (EnerSynk Group) published figures,
 * reproduced from officialforesta.com. `designedFor` and `indiaFit` are the
 * India-specific framing — the parent site addresses European municipalities.
 *
 * Do not alter the numeric claims without written confirmation from the
 * principal; they get scrutinised in Indian government tenders.
 */

import liquidTube from '../assets/products/liquid-tube.png';
import liquidTree from '../assets/products/liquid-tree.png';
import liquidForesta from '../assets/products/liquid-foresta.png';
import type { ImageMetadata } from 'astro';

export interface System {
  id: string;
  name: string;
  strapline: string;
  treeEquivalent: string;
  image: ImageMetadata;
  /** One-line summary used on the home page cards. */
  summary: string;
  designedFor: string;
  /** Why this scale makes sense in the Indian market specifically. */
  indiaFit: string;
  performance: string[];
  capabilities: string[];
  biomass: string[];
  footprint: string[];
}

export const systems: System[] = [
  {
    id: 'liquid-tube',
    name: 'Liquid Tube',
    strapline: 'Indoor air regeneration, refined.',
    treeEquivalent: 'Equivalent to 2–3 mature trees',
    image: liquidTube,
    summary:
      'Compact indoor carbon capture and air purification for offices, hospitals, hotels, gyms and retail interiors.',
    designedFor:
      'Indoor and semi-outdoor spaces — corporate offices, hospitals, schools, hotels, gyms, showrooms and commercial interiors.',
    indiaFit:
      'Indian indoor air routinely tracks outdoor PM2.5 because buildings are naturally ventilated for much of the year. A Liquid Tube works without consumable filters, which removes the recurring cartridge cost that makes conventional purifier fleets expensive to run across a large campus.',
    performance: [
      'Continuous CO₂ capture',
      'Removes NOx, VOCs, PM2.5 and airborne pollutants',
      'Oxygen enrichment',
      'Filter-free biological purification — no cartridge replacement',
      'Improves indoor air quality in closed environments',
    ],
    capabilities: [
      'Photobioreactor microalgae chamber',
      'Closed-loop water system',
      'Continuous oxygen release',
      'Low maintenance operation',
    ],
    biomass: [
      'Microalgae biomass harvested periodically',
      'Repurposed for fertilisers, bio-based materials and energy applications',
    ],
    footprint: ['Compact installation suitable for interior integration'],
  },
  {
    id: 'liquid-tree',
    name: 'Liquid Tree',
    strapline: 'The forest for modern cities.',
    treeEquivalent: 'Equivalent to 130–150 mature trees',
    image: liquidTree,
    summary:
      'Outdoor unit for parks, plazas, parking areas, school and university campuses, and dense city centres.',
    designedFor:
      'Urban public spaces, parking areas, high-density zones, transit hubs and city centres.',
    indiaFit:
      'Land is the binding constraint in Indian cities. A Liquid Tree delivers the absorption of well over a hundred mature trees on a footprint smaller than a single car parking bay — deployable on a footpath, plaza or metro forecourt where planting 150 trees is simply not possible.',
    performance: [
      'Equivalent impact of 130–150 mature trees',
      'Significant CO₂ absorption',
      'Pollutant reduction — NOx, particulate matter, VOCs',
      'Oxygen production in a compact footprint',
    ],
    capabilities: [
      'Autonomous outdoor photobioreactor',
      'LED-optimised algae growth system',
      'Durable urban installation',
      'Climate-adaptive operation',
    ],
    biomass: [
      'High biomass productivity',
      'Supports biomethane, fertiliser or industrial feedstock production',
    ],
    footprint: ['Approximately 6–10 m² depending on configuration'],
  },
  {
    id: 'liquid-foresta',
    name: 'Liquid Foresta',
    strapline: 'Industrial-scale carbon transformation.',
    treeEquivalent: 'Equivalent to 700–800 mature trees',
    image: liquidForesta,
    summary:
      'Containerised CTRX biofactory for industrial estates, infrastructure hubs and municipal-scale carbon mitigation.',
    designedFor:
      'Industrial zones and clusters, infrastructure hubs, municipal corporations and large-scale carbon mitigation programmes.',
    indiaFit:
      'Arrives as a 20ft container, which means it moves on standard Indian road and rail freight and commissions in days rather than the multi-year horizon of a compensatory afforestation plot. That suits industrial estates and SEZs that need demonstrable mitigation inside a reporting year.',
    performance: [
      '1 CTRX ≈ 700–800 mature trees equivalent',
      '14.4 m² footprint delivering roughly 24,000 m² of forest impact',
      '87–89% carbon removal efficiency',
      'Continuous high-density CO₂ absorption',
      '24/7 oxygen production',
    ],
    capabilities: [
      'Modular 20ft container biofactory',
      'Rapid installation',
      'High-yield microalgae growth',
      'Circular water recovery system',
      'Harvest cycle every 2–3 days',
    ],
    biomass: [
      'High-value algae biomass',
      'Biofuel — biodiesel and biojet',
      'Fertilisers',
      'Bioplastics',
      'Nutraceuticals',
      'Industrial raw materials',
    ],
    footprint: ['Compact containerised system', 'Scalable by stacking multiple CTRX units'],
  },
];

/** Rows for the side-by-side comparison table on /product. */
export const comparison = {
  columns: ['Liquid Tube', 'Liquid Tree', 'Liquid Foresta'],
  rows: [
    {
      label: 'Primary use',
      values: [
        'Offices, hospitals, hotels, schools',
        'Urban public spaces',
        'Industrial zones, municipalities',
      ],
    },
    { label: 'CO₂ capture scale', values: ['Standard', 'High', 'Very high'] },
    { label: 'Tree equivalent', values: ['2–3', '130–150', '700–800'] },
    { label: 'Footprint', values: ['Compact', '6–10 m²', '14.4 m²'] },
    { label: 'Environment', values: ['Indoor / semi-outdoor', 'Outdoor', 'Outdoor'] },
    { label: 'Biomass output', values: ['Periodic', 'High', 'Very high'] },
    { label: 'Pollutant removal', values: ['Yes', 'Yes', 'Yes'] },
    { label: 'Installation speed', values: ['Plug-and-play', 'Fast', 'Rapid'] },
    { label: 'Scalability', values: ['Unit-based', 'Modular', 'Fully modular'] },
    { label: 'Economic value creation', values: ['Moderate', 'High', 'Very high'] },
  ],
};
