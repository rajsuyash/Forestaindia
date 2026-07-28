/**
 * ══════════════════════════════════════════════════════════════════════
 *  Foresta India — single source of truth for everything you'll want to
 *  edit without touching layout code: contact details, legal entity,
 *  nav links, buyer segments, footer text.
 *
 *  Anything marked TODO still needs your real value before launch.
 * ══════════════════════════════════════════════════════════════════════
 */

export const site = {
  name: 'Foresta India',
  /** Used for canonical URLs, sitemap and OG tags. */
  url: 'https://forestaindia.com',
  tagline: "India's Plug-and-Play Living Forest",
  description:
    'Living Forest systems that capture CO₂, cut PM2.5 and generate oxygen — forest-equivalent impact in a compact footprint, for Indian cities and industry.',
  locale: 'en_IN',
  lang: 'en-IN',
} as const;

export const company = {
  legalName: 'PassionFox Technologies Private Limited',
  /** Shown in the footer under the logo. */
  role: 'Authorised Distributor for India',
  /** The parent brand we distribute. Do not alter without their sign-off. */
  principal: 'Foresta — EnerSynk Group',

  email: 'niravm@forestaindia.com',
  phone: '+91 98202 17090',
  /** E.164, for tel: links. */
  phoneRaw: '+919820217090',

  /** TODO — replace with the registered office address. */
  address: {
    line1: 'TODO: office address line 1',
    line2: 'TODO: area / landmark',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: 'TODO',
    country: 'India',
  },

  /** TODO — optional, shown in the footer if filled. Leave '' to hide. */
  cin: '',
  gstin: '',

  serviceArea: 'All India',
  hours: 'Mon–Sat, 9:30am – 6:30pm IST',
} as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Product', href: '/product' },
  { label: 'About', href: '/about' },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '/contact' },
] as const;

/**
 * Buyer segments used on the contact form and referenced across copy.
 * These are the India-specific channels — not a copy of the parent site's
 * European municipal framing.
 */
export const segments = [
  'Municipal corporation / Smart City',
  'Industrial plant or cluster',
  'Real estate / infrastructure developer',
  'Corporate campus or IT park',
  'Hospital / healthcare facility',
  'School, university or institution',
  'Hospitality (hotel, mall, gym)',
  'CSR / ESG team',
  'Investor or channel partner',
  'Other',
] as const;

export const deploymentScales = [
  'Liquid Tube — indoor units',
  'Liquid Tree — outdoor public space',
  'Liquid Foresta (CTRX) — industrial scale',
  'Not sure yet, advise me',
] as const;

export const timelines = [
  'Immediate (0–3 months)',
  'This financial year',
  'Next financial year',
  'Exploring / early research',
] as const;

/** Endpoint for the enquiry form. PHP handler lives on Hostinger. */
export const contactEndpoint = '/contact.php';
