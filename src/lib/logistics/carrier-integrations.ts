export interface CarrierIntegration {
  code: string;
  name: string;
  country: string;
  tier: string;
  apiBase: string;
  authType: "api_key" | "oauth2" | "basic" | "signature";
  features: string[];
  testEndpoint: string;
  docsUrl: string;
}

export const CARRIER_INTEGRATIONS: CarrierIntegration[] = [
  // Nigeria
  { code: "gig", name: "GIG Logistics", country: "NG", tier: "TIER_1_LOCAL", apiBase: "https://api.gigl.com/v1", authType: "api_key", features: ["tracking", "pricing", "scheduling"], testEndpoint: "/health", docsUrl: "https://developer.gigl.com" },
  { code: "kwik", name: "Kwik Delivery", country: "NG", tier: "TIER_1_LOCAL", apiBase: "https://api.kwikdelivery.com/v1", authType: "api_key", features: ["tracking", "pricing", "realtime"], testEndpoint: "/ping", docsUrl: "https://docs.kwikdelivery.com" },
  { code: "sendbox", name: "Sendbox", country: "NG", tier: "TIER_1_LOCAL", apiBase: "https://api.sendbox.co/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://docs.sendbox.co" },
  { code: "dhl_ng", name: "DHL Nigeria", country: "NG", tier: "TIER_1_LOCAL", apiBase: "https://api.dhl.com/express-rate", authType: "oauth2", features: ["tracking", "pricing", "customs"], testEndpoint: "/test", docsUrl: "https://developer.dhl.com" },
  { code: "dhl_intl", name: "DHL Express International", country: "NG", tier: "TIER_3_INTERNATIONAL", apiBase: "https://api.dhl.com/mydhlapi", authType: "oauth2", features: ["tracking", "pricing", "customs", "pickup"], testEndpoint: "/test", docsUrl: "https://developer.dhl.com" },
  { code: "aramex_intl", name: "Aramex International", country: "NG", tier: "TIER_3_INTERNATIONAL", apiBase: "https://www.aramex.com/us/en/api", authType: "api_key", features: ["tracking", "pricing", "customs"], testEndpoint: "/test", docsUrl: "https://developer.aramex.com" },

  // United Kingdom
  { code: "royal_mail", name: "Royal Mail", country: "GB", tier: "TIER_1_LOCAL", apiBase: "https://api.royalmail.net/v1", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/health", docsUrl: "https://developer.royalmail.net" },
  { code: "evri", name: "Evri (Hermes)", country: "GB", tier: "TIER_1_LOCAL", apiBase: "https://api.evri.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.evri.com" },
  { code: "dpd_uk", name: "DPD UK", country: "GB", tier: "TIER_1_LOCAL", apiBase: "https://api.dpd.co.uk/v1", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/health", docsUrl: "https://developer.dpd.co.uk" },
  { code: "dhl_uk", name: "DHL UK", country: "GB", tier: "TIER_1_LOCAL", apiBase: "https://api.dhl.com/express-rate", authType: "oauth2", features: ["tracking", "pricing", "customs"], testEndpoint: "/test", docsUrl: "https://developer.dhl.com" },

  // United States
  { code: "usps", name: "USPS", country: "US", tier: "TIER_1_LOCAL", apiBase: "https://secure.shippingapis.com/ShippingAPI.dll", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/test", docsUrl: "https://developer.usps.com" },
  { code: "ups", name: "UPS Domestic", country: "US", tier: "TIER_1_LOCAL", apiBase: "https://wwwcie.ups.com/rest", authType: "oauth2", features: ["tracking", "pricing", "label", "scheduling"], testEndpoint: "/test", docsUrl: "https://developer.ups.com" },
  { code: "fedex_us", name: "FedEx US", country: "US", tier: "TIER_1_LOCAL", apiBase: "https://apis.fedex.com", authType: "oauth2", features: ["tracking", "pricing", "label"], testEndpoint: "/test", docsUrl: "https://developer.fedex.com" },

  // India
  { code: "delhivery", name: "Delhivery", country: "IN", tier: "TIER_1_LOCAL", apiBase: "https://dlv-api.delhivery.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://docs.delhivery.com" },
  { code: "bluedart", name: "BlueDart (DHL)", country: "IN", tier: "TIER_1_LOCAL", apiBase: "https://netconnect.bluedart.com/Ver1.8/REST", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/test", docsUrl: "https://developers.bluedart.com" },
  { code: "dtdc", name: "DTDC", country: "IN", tier: "TIER_1_LOCAL", apiBase: "https://dtdc.com/api/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.dtdc.com" },

  // Australia
  { code: "auspost", name: "Australia Post", country: "AU", tier: "TIER_1_LOCAL", apiBase: "https://digitalapi.auspost.com.au/v1", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/health", docsUrl: "https://auspost.com.au/developer" },
  { code: "startrack", name: "StarTrack", country: "AU", tier: "TIER_1_LOCAL", apiBase: "https://api.startrack.com.au/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.startrack.com.au" },

  // UAE
  { code: "aramex_uae", name: "Aramex UAE", country: "AE", tier: "TIER_1_LOCAL", apiBase: "https://www.aramex.com/us/en/api", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/test", docsUrl: "https://developer.aramex.com" },
  { code: "emirates_post", name: "Emirates Post", country: "AE", tier: "TIER_1_LOCAL", apiBase: "https://api.emiratespost.ae/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.emiratespost.ae" },

  // Germany
  { code: "dhl_paket", name: "DHL Paket", country: "DE", tier: "TIER_1_LOCAL", apiBase: "https://cig.dhl.de/services/production/rest", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/test", docsUrl: "https://developer.dhl.com" },
  { code: "dpd_de", name: "DPD Germany", country: "DE", tier: "TIER_1_LOCAL", apiBase: "https://api.dpd.de/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.dpd.de" },
  { code: "gls", name: "GLS Germany", country: "DE", tier: "TIER_1_LOCAL", apiBase: "https://api.gls-group.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.gls-group.com" },

  // Canada
  { code: "canada_post", name: "Canada Post", country: "CA", tier: "TIER_1_LOCAL", apiBase: "https://www.canadapost.gc.ca/rest", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/test", docsUrl: "https://www.canadapost.gc.ca/business" },

  // Ghana
  { code: "speedaf", name: "SpeedAF Ghana", country: "GH", tier: "TIER_1_LOCAL", apiBase: "https://api.speedaf.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.speedaf.com" },
  { code: "gexpress", name: "Ghana Express", country: "GH", tier: "TIER_1_LOCAL", apiBase: "https://api.ghexpress.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.ghexpress.com" },

  // Kenya
  { code: "sendy_ke", name: "Sendy Kenya", country: "KE", tier: "TIER_1_LOCAL", apiBase: "https://api.sendyit.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.sendyit.com" },
  { code: "g4s_ke", name: "G4S Kenya", country: "KE", tier: "TIER_1_LOCAL", apiBase: "https://api.g4s.co.ke/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.g4s.co.ke" },

  // South Africa
  { code: "theCourierGuy", name: "The Courier Guy", country: "ZA", tier: "TIER_1_LOCAL", apiBase: "https://api.thecourierguy.co.za/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.thecourierguy.co.za" },
  { code: "ram_zd", name: "RAM Hand-to-Hand", country: "ZA", tier: "TIER_1_LOCAL", apiBase: "https://api.ram.co.za/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.ram.co.za" },

  // Saudi Arabia
  { code: "smsa", name: "SMSA Express", country: "SA", tier: "TIER_1_LOCAL", apiBase: "https://api.smsaexpress.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.smsaexpress.com" },

  // Brazil
  { code: "correios", name: "Correios", country: "BR", tier: "TIER_1_LOCAL", apiBase: "https://api.correios.com.br/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.correios.com.br" },

  // Japan
  { code: "yamato", name: "Yamato Transport", country: "JP", tier: "TIER_1_LOCAL", apiBase: "https://api.yamato.com/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.yamato.com" },

  // France
  { code: "laposte", name: "La Poste", country: "FR", tier: "TIER_1_LOCAL", apiBase: "https://api.laposte.fr/v1", authType: "api_key", features: ["tracking", "pricing", "label"], testEndpoint: "/health", docsUrl: "https://developer.laposte.fr" },
  { code: "colissimo", name: "Colissimo", country: "FR", tier: "TIER_1_LOCAL", apiBase: "https://api.colissimo.fr/v1", authType: "api_key", features: ["tracking", "pricing"], testEndpoint: "/health", docsUrl: "https://developer.colissimo.fr" },
];

export function getCarriersByCountry(countryCode: string): CarrierIntegration[] {
  return CARRIER_INTEGRATIONS.filter((c) => c.country === countryCode);
}

export function getCarrierByCode(code: string): CarrierIntegration | undefined {
  return CARRIER_INTEGRATIONS.find((c) => c.code === code);
}

export function getAllCarriers(): CarrierIntegration[] {
  return CARRIER_INTEGRATIONS;
}

export function getCountryCarrierSummary(): Record<string, CarrierIntegration[]> {
  const summary: Record<string, CarrierIntegration[]> = {};
  for (const carrier of CARRIER_INTEGRATIONS) {
    if (!summary[carrier.country]) summary[carrier.country] = [];
    summary[carrier.country].push(carrier);
  }
  return summary;
}
