"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Package, UserCheck, FolderKanban, SlidersHorizontal, Truck, Wrench,
  Gavel, Landmark, ShieldCheck, ClipboardCheck, GraduationCap,
  BookOpen, MessageCircle, BarChart3, ArrowRight, ChevronRight, Send,
} from "lucide-react";

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
  subdomain: string | null;
  description: string | null;
  iconUrl: string | null;
  heroImageUrl: string | null;
  productCategories: string[];
  professionalCategories: string[];
  configuratorsAvailable: string[];
  pillarsAvailable: string[];
  isActive: boolean;
}

const PILLAR_META: Record<string, { icon: React.ElementType; label: string }> = {
  products: { icon: Package, label: "Products" },
  professionals: { icon: UserCheck, label: "Professionals" },
  projects: { icon: FolderKanban, label: "Projects" },
  configurator: { icon: SlidersHorizontal, label: "Configurator" },
  procurement: { icon: ClipboardCheck, label: "Procurement" },
  rental: { icon: Truck, label: "Rental" },
  used_equipment: { icon: Wrench, label: "Used Equipment" },
  auction: { icon: Gavel, label: "Auction" },
  financing: { icon: Landmark, label: "Financing" },
  insurance: { icon: ShieldCheck, label: "Insurance" },
  compliance: { icon: ClipboardCheck, label: "Compliance" },
  asset_registry: { icon: Package, label: "Asset Registry" },
  training: { icon: GraduationCap, label: "Training" },
  knowledge: { icon: BookOpen, label: "Knowledge Center" },
  community: { icon: MessageCircle, label: "Community" },
  intelligence: { icon: BarChart3, label: "Intelligence" },
};

const HARDCODED_COMPLIANCE: Record<string, { name: string; items: string[] }[]> = {
  marine: [
    { name: "Vessel Registration", items: ["NIMASA registration", "Tonnage measurement", "Annual survey"] },
    { name: "Survey Certificates", items: ["Annual survey", "Special survey (5yr)", "Dry docking"] },
    { name: "Crew Certifications", items: ["STCW basic training", "COC (Certificate of Competency)", "Medical fitness"] },
  ],
  construction: [
    { name: "Building Permit", items: ["Local government approval", "Structural drawings", "Soil test report"] },
    { name: "COREN Registration", items: ["Engineering registration", "Professional indemnity", "CPD compliance"] },
    { name: "Fire Safety Clearance", items: ["Fire risk assessment", "Extinguisher certification", "Escape route plan"] },
  ],
  energy: [
    { name: "NERC License", items: ["Generation license", "Distribution license", "Compliance filing"] },
    { name: "SON Approval", items: ["Product standards certification", "Quality management system", "Inspection report"] },
    { name: "Environmental Impact", items: ["EIA scoping report", "Public hearing", "Monitoring plan"] },
  ],
  dredging: [
    { name: "EIA Requirements", items: ["Environmental Impact Assessment", "Sediment sampling", "Mitigation plan"] },
    { name: "NIMASA Permit", items: ["Dredging license", "Vessel clearance", "Navigational safety"] },
    { name: "NEMA Approval", items: ["Waste management plan", "Spill contingency", "Ecosystem monitoring"] },
  ],
  agriculture: [
    { name: "NAFDAC Registration", items: ["Product registration certificate", "Good Manufacturing Practice certification", "Annual renewal compliance"] },
    { name: "SONCAP Compliance", items: ["Product standards certification", "Quality management system", "Inspection report"] },
    { name: "Quarantine Service Permit", items: ["Phytosanitary certificate", "Import/export permit", "Pest risk assessment"] },
  ],
  automotive: [
    { name: "SON Standards", items: ["Vehicle type approval", "Component quality certification", "Emissions compliance"] },
    { name: "FRSC Registration", items: ["Vehicle registration", "Road worthiness certificate", "Speed limiter compliance"] },
    { name: "NESREA Approval", items: ["Emission control compliance", "Waste management plan", "Environmental audit"] },
  ],
  aviation: [
    { name: "NCAA Certification", items: ["Air operator certificate", "Maintenance organization approval", "Flight operations compliance"] },
    { name: "FAAN Clearance", items: ["Aerodrome safety compliance", "Security clearance", "Ground handling permit"] },
    { name: "NAMA Compliance", items: ["Air navigation compliance", "Communication equipment certification", "Radar tracking standards"] },
  ],
  healthcare: [
    { name: "FMOH Accreditation", items: ["Hospital accreditation", "Medical waste management", "Patient safety protocols"] },
    { name: "NAFDAC Clearance", items: ["Drug and device registration", "Pharmacy inspection", "Product recall plan"] },
    { name: "MDCN Registration", items: ["Medical practitioner license", "Specialty certification", "CPD compliance"] },
  ],
  hospitality: [
    { name: "NAFDAC Compliance", items: ["Food handling permit", "Water quality testing", "Kitchen hygiene inspection"] },
    { name: "SON Standards", items: ["Facility classification", "Fire safety compliance", "Equipment quality certification"] },
    { name: "Local Govt Permit", items: ["Business premises registration", "Noise control compliance", "Sanitation clearance"] },
  ],
  manufacturing: [
    { name: "NAFDAC Registration", items: ["Product registration", "GMP certification", "Quality control compliance"] },
    { name: "SON Approval", items: ["Industrial standards certification", "Process quality audit", "Product batch testing"] },
    { name: "NESREA Permit", items: ["EIA compliance", "Effluent treatment report", "Air quality monitoring"] },
  ],
  mining: [
    { name: "MMDS License", items: ["Mineral title registration", "Exploration permit", "Mining lease compliance"] },
    { name: "NESREA Approval", items: ["Environmental impact assessment", "Reclamation plan", "Water use permit"] },
    { name: "Ministry of Mines", items: ["Community development agreement", "Royalty payment compliance", "Health and safety inspection"] },
  ],
  oil_gas: [
    { name: "NUPRC License", items: ["Oil prospecting license", "Oil mining lease", "Production quota compliance"] },
    { name: "NOSDRA Compliance", items: ["Oil spill contingency plan", "Environmental remediation", "Gas flaring compliance"] },
    { name: "DPR Approval", items: ["Refinery license", "LPG facility permit", "Product quality certification"] },
  ],
  pharmaceutical: [
    { name: "NAFDAC Certification", items: ["Drug registration", "GMP audit", "Pharmacovigilance compliance"] },
    { name: "PCN License", items: ["Premises registration", "Superintendent pharmacist", "Controlled substances permit"] },
    { name: "SON Standards", items: ["Good distribution practice", "Cold chain compliance", "Quality assurance audit"] },
  ],
  real_estate: [
    { name: "REDAN Registration", items: ["Realtor accreditation", "Property agent license", "Professional certification"] },
    { name: "LASBCA Permit", items: ["Building plan approval", "Structural integrity certificate", "Occupancy permit"] },
    { name: "Local Govt Clearance", items: ["Property registration", "Land use compliance", "Tax clearance"] },
  ],
  technology: [
    { name: "NITDA Compliance", items: ["Data protection registration", "ICT standards compliance", "Cybersecurity audit"] },
    { name: "NCC License", items: ["Telecom service license", "Spectrum allocation", "Consumer protection code"] },
    { name: "SON Certification", items: ["Hardware quality standards", "Software testing verification", "Interoperability compliance"] },
  ],
};

const HARDCODED_INTELLIGENCE: Record<string, { label: string; value: string; suffix: string }[]> = {
  agriculture: [
    { label: "Market Size", value: "$4.2B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "6.8%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "12,400+", suffix: "Registered firms" },
    { label: "Employment", value: "35%", suffix: "Of national workforce" },
  ],
  automotive: [
    { label: "Market Size", value: "$8.1B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "4.2%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "3,200+", suffix: "Dealers & manufacturers" },
    { label: "Employment", value: "240K+", suffix: "Direct jobs" },
  ],
  aviation: [
    { label: "Market Size", value: "$1.5B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "5.1%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "180+", suffix: "Licensed operators" },
    { label: "Employment", value: "65K+", suffix: "Aviation jobs" },
  ],
  construction: [
    { label: "Market Size", value: "$28.6B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "3.5%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "45,000+", suffix: "Registered contractors" },
    { label: "Employment", value: "2.1M+", suffix: "Direct & indirect" },
  ],
  energy: [
    { label: "Market Size", value: "$64B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "2.9%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "560+", suffix: "Licensed operators" },
    { label: "Employment", value: "350K+", suffix: "Energy sector jobs" },
  ],
  dredging: [
    { label: "Market Size", value: "$980M", suffix: "West Africa 2026" },
    { label: "Growth Rate", value: "7.2%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "120+", suffix: "Licensed dredgers" },
    { label: "Employment", value: "28K+", suffix: "Marine jobs" },
  ],
  healthcare: [
    { label: "Market Size", value: "$9.8B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "8.4%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "8,700+", suffix: "Hospitals & clinics" },
    { label: "Employment", value: "460K+", suffix: "Healthcare workers" },
  ],
  hospitality: [
    { label: "Market Size", value: "$2.6B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "5.9%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "15,000+", suffix: "Hotels & restaurants" },
    { label: "Employment", value: "1.2M+", suffix: "Hospitality jobs" },
  ],
  manufacturing: [
    { label: "Market Size", value: "$48B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "3.8%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "52,000+", suffix: "SMEs & large firms" },
    { label: "Employment", value: "3.5M+", suffix: "Manufacturing jobs" },
  ],
  mining: [
    { label: "Market Size", value: "$2.8B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "9.5%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "3,800+", suffix: "Licensed miners" },
    { label: "Employment", value: "450K+", suffix: "Artisanal & industrial" },
  ],
  oil_gas: [
    { label: "Market Size", value: "$68B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "1.8%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "420+", suffix: "IOC & indigenous" },
    { label: "Employment", value: "200K+", suffix: "Oil & gas jobs" },
  ],
  pharmaceutical: [
    { label: "Market Size", value: "$2.3B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "11.2%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "340+", suffix: "Manufacturers & importers" },
    { label: "Employment", value: "85K+", suffix: "Pharma jobs" },
  ],
  real_estate: [
    { label: "Market Size", value: "$18.5B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "6.1%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "32,000+", suffix: "Registered agents" },
    { label: "Employment", value: "1.8M+", suffix: "Real estate jobs" },
  ],
  marine: [
    { label: "Market Size", value: "$1.2B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "4.6%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "280+", suffix: "Marine operators" },
    { label: "Employment", value: "75K+", suffix: "Maritime jobs" },
  ],
  technology: [
    { label: "Market Size", value: "$7.5B", suffix: "Nigeria 2026" },
    { label: "Growth Rate", value: "13.4%", suffix: "CAGR 2025-2030" },
    { label: "Active Companies", value: "6,500+", suffix: "Tech startups & firms" },
    { label: "Employment", value: "290K+", suffix: "Tech professionals" },
  ],
};

export default function IndustryHubPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePillar, setActivePillar] = useState<string>("products");

  useEffect(() => {
    fetch(`/api/v1/kpn/hubs/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setHub(res.data);
          if (res.data.pillarsAvailable?.length > 0) {
            setActivePillar(res.data.pillarsAvailable[0]);
          }
        } else {
          setHub(null);
        }
      })
      .catch(() => setHub(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-kauvex-orange border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-kauvex-navy mb-2">Industry Hub Not Found</h1>
          <p className="text-gray-500 mb-6">The hub you're looking for doesn't exist.</p>
          <Link href="/industries" className="text-kauvex-orange font-semibold hover:underline">
            Browse all industries
          </Link>
        </div>
      </div>
    );
  }

  const pillars = hub.pillarsAvailable || [];
  const complianceData = HARDCODED_COMPLIANCE[hub.hubSlug];
  const intelligenceData = HARDCODED_INTELLIGENCE[hub.hubSlug];

  const renderPillarContent = () => {
    switch (activePillar) {
      case "products":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Products</h2>
            <p className="text-gray-500 mb-6">Browse {hub.hubName} products on Kauvex marketplace.</p>
            <Link
              href={`/industries/${hub.hubSlug}/products`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              Browse Products <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "professionals":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Professionals</h2>
            <p className="text-gray-500 mb-6">Find qualified professionals in {hub.hubName}.</p>
            <Link
              href={`/industries/${hub.hubSlug}/professionals`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              Find Professionals <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "projects":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Projects</h2>
            <p className="text-gray-500 mb-6">Post or browse projects in {hub.hubName}.</p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              View Projects <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "configurator":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Configurator</h2>
            {hub.configuratorsAvailable?.length > 0 ? (
              <div>
                <p className="text-gray-500 mb-4">Available configurators for {hub.hubName}:</p>
                <div className="flex flex-wrap gap-3">
                  {hub.configuratorsAvailable.map((c) => (
                    <Link
                      key={c}
                      href={`/configure/${c}`}
                      className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm font-medium text-kauvex-navy hover:border-kauvex-orange hover:text-kauvex-orange transition-colors"
                    >
                      {c.charAt(0).toUpperCase() + c.slice(1)} Configurator
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No configurators available for this hub yet.</p>
            )}
          </div>
        );
      case "procurement":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Procurement</h2>
            <p className="text-gray-500 mb-6">
              Source products, request quotes, and manage suppliers for {hub.hubName}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Supplier Discovery</h4>
                <p className="text-xs text-gray-500 mb-3">Find verified suppliers and manufacturers in every category.</p>
                <Link
                  href="/manufacturers"
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  Browse Suppliers <ArrowRight size={12} />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Request for Quote</h4>
                <p className="text-xs text-gray-500 mb-3">Post RFQs and receive competitive bids from multiple vendors.</p>
                <Link
                  href={`/industries/${hub.hubSlug}/procurement/rfq`}
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  Post RFQ <ArrowRight size={12} />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Procurement Marketplace</h4>
                <p className="text-xs text-gray-500 mb-3">Buy bulk quantities at wholesale prices from trusted sellers.</p>
                <Link
                  href="/marketplace/procurement"
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  Start Sourcing <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <Link
              href="/marketplace/procurement"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors text-sm"
            >
              Open Procurement Hub <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "rental":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Rental</h2>
            <p className="text-gray-500 mb-6">Rent equipment and machinery for {hub.hubName}.</p>
            <Link
              href={`/marketplace/rentals?category=${encodeURIComponent(hub.hubName)}`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              Browse Rentals <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "used_equipment":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Used Equipment</h2>
            <p className="text-gray-500 mb-6">Buy and sell used {hub.hubName} equipment.</p>
            <Link
              href={`/marketplace/used-equipment?assetType=${encodeURIComponent(hub.hubName)}`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              Browse Used Equipment <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "auction":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Auction</h2>
            <p className="text-gray-500 mb-6">Participate in {hub.hubName} equipment auctions.</p>
            <Link
              href={`/marketplace/auctions?category=${encodeURIComponent(hub.hubName)}`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              View Auctions <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "financing":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Financing</h2>
            <p className="text-gray-500 mb-6">Explore financing options for {hub.hubName} projects and equipment.</p>
            <Link
              href="/financing"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              View Options <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "insurance":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Insurance</h2>
            <p className="text-gray-500 mb-6">Get insured for {hub.hubName} assets and operations.</p>
            <Link
              href="/insurance"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              Get Insurance <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "compliance":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Compliance</h2>
            {complianceData ? (
              <div className="space-y-4">
                {complianceData.map((c) => (
                  <div key={c.name} className="border border-gray-100 rounded-lg p-4">
                    <h4 className="font-semibold text-kauvex-navy mb-1">{c.name}</h4>
                    <ul className="space-y-1">
                      {c.items.map((item) => (
                        <li key={item} className="text-sm text-gray-500 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-kauvex-orange mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link
                  href={`/industries/${hub.hubSlug}/compliance`}
                  className="inline-flex items-center gap-2 text-kauvex-orange font-semibold text-sm hover:underline mt-2"
                >
                  View Full Compliance Center <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <ComplianceRequestForm />
            )}
          </div>
        );
      case "asset_registry":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Asset Registry</h2>
            <p className="text-gray-500 mb-6">Manage and track your {hub.hubName} assets with digital twins.</p>
            <Link
              href="/assets"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
            >
              View Assets <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "training":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Training Catalog</h2>
            <p className="text-gray-500 mb-6">
              Upskill your team with {hub.hubName}-focused courses, certifications, and workshops.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Industry Fundamentals</h4>
                <p className="text-xs text-gray-500">Introductory courses covering {hub.hubName} basics, safety, and regulations.</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Advanced Certification</h4>
                <p className="text-xs text-gray-500">Professional certifications for experienced {hub.hubName} practitioners.</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Compliance Training</h4>
                <p className="text-xs text-gray-500">Stay compliant with regulatory updates and mandatory training modules.</p>
              </div>
            </div>
            <Link
              href="/vendor/university"
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors text-sm"
            >
              Browse All Courses <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "knowledge":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Knowledge Center</h2>
            <p className="text-gray-500 mb-6">
              Access articles, guides, whitepapers, and regulatory updates for {hub.hubName}.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Link href={`/industries/${hub.hubSlug}/knowledge?topic=best-practices`} className="border border-gray-100 rounded-lg p-4 hover:border-kauvex-orange transition-colors group">
                <h4 className="font-semibold text-kauvex-navy text-sm group-hover:text-kauvex-orange transition-colors">Best Practices</h4>
                <p className="text-xs text-gray-500 mt-1">Operational guides & standards</p>
              </Link>
              <Link href={`/industries/${hub.hubSlug}/knowledge?topic=regulations`} className="border border-gray-100 rounded-lg p-4 hover:border-kauvex-orange transition-colors group">
                <h4 className="font-semibold text-kauvex-navy text-sm group-hover:text-kauvex-orange transition-colors">Regulations</h4>
                <p className="text-xs text-gray-500 mt-1">Compliance & legal updates</p>
              </Link>
              <Link href={`/industries/${hub.hubSlug}/knowledge?topic=case-studies`} className="border border-gray-100 rounded-lg p-4 hover:border-kauvex-orange transition-colors group">
                <h4 className="font-semibold text-kauvex-navy text-sm group-hover:text-kauvex-orange transition-colors">Case Studies</h4>
                <p className="text-xs text-gray-500 mt-1">Real-world success stories</p>
              </Link>
              <Link href={`/industries/${hub.hubSlug}/knowledge?topic=whitepapers`} className="border border-gray-100 rounded-lg p-4 hover:border-kauvex-orange transition-colors group">
                <h4 className="font-semibold text-kauvex-navy text-sm group-hover:text-kauvex-orange transition-colors">Whitepapers</h4>
                <p className="text-xs text-gray-500 mt-1">In-depth industry reports</p>
              </Link>
            </div>
            <Link
              href={`/industries/${hub.hubSlug}/knowledge`}
              className="inline-flex items-center gap-2 text-kauvex-orange font-semibold text-sm hover:underline"
            >
              Explore Knowledge Center <ArrowRight size={14} />
            </Link>
          </div>
        );
      case "community":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Community</h2>
            <p className="text-gray-500 mb-6">
              Connect with {hub.hubName} professionals, join discussions, and attend industry events.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Industry Forums</h4>
                <p className="text-xs text-gray-500 mb-3">Topic-based discussion boards moderated by industry experts.</p>
                <Link
                  href={`/industries/${hub.hubSlug}/community/forums`}
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  Join Discussions <ArrowRight size={12} />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Professional Groups</h4>
                <p className="text-xs text-gray-500 mb-3">Connect with peers in specialized {hub.hubName} groups.</p>
                <Link
                  href={`/industries/${hub.hubSlug}/community/groups`}
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  Browse Groups <ArrowRight size={12} />
                </Link>
              </div>
              <div className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-semibold text-kauvex-navy text-sm mb-1">Events & Webinars</h4>
                <p className="text-xs text-gray-500 mb-3">Upcoming conferences, workshops, and networking sessions.</p>
                <Link
                  href={`/industries/${hub.hubSlug}/community/events`}
                  className="inline-flex items-center gap-1 text-kauvex-orange text-xs font-semibold hover:underline"
                >
                  View Events <ArrowRight size={12} />
                </Link>
              </div>
            </div>
            <Link
              href={`/industries/${hub.hubSlug}/community`}
              className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors text-sm"
            >
              Enter Community Hub <ArrowRight size={16} />
            </Link>
          </div>
        );
      case "intelligence":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Industry Intelligence</h2>
            <p className="text-gray-500 mb-6">
              Key market metrics and analytics for the {hub.hubName} industry.
            </p>
            {intelligenceData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {intelligenceData.map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-lg p-5 text-center">
                    <p className="text-2xl font-bold text-kauvex-orange">{m.value}</p>
                    <p className="text-sm font-medium text-kauvex-navy mt-1">{m.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.suffix}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Intelligence data loading for this hub. Check back soon.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-kauvex-navy to-[#0D1F3C] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <Link
            href="/industries"
            className="inline-flex items-center gap-1 text-white/50 hover:text-white text-sm mb-4 transition-colors"
          >
            <ChevronRight size={14} className="rotate-180" /> All Industries
          </Link>
          <div className="bg-white/5 rounded-2xl border border-white/10 p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">{hub.hubName}</h1>
            <p className="text-lg text-white/70 max-w-2xl">{hub.description}</p>
          </div>
        </div>
      </section>

      {/* Pillar Navigation */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex gap-1 py-2">
          {pillars.map((pillar) => {
            const meta = PILLAR_META[pillar];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <button
                key={pillar}
                onClick={() => setActivePillar(pillar)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activePillar === pillar
                    ? "bg-kauvex-orange text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon size={14} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Pillar Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {renderPillarContent()}
      </section>

      {/* Sub-pillar Navigation for Products & Professionals */}
      {activePillar === "products" && hub.productCategories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-kauvex-navy mb-3">Product Categories</h3>
            <div className="flex flex-wrap gap-2">
              {hub.productCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/industries/${hub.hubSlug}/products?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:border-kauvex-orange hover:text-kauvex-orange transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {activePillar === "professionals" && hub.professionalCategories?.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-kauvex-navy mb-3">Professional Categories</h3>
            <div className="flex flex-wrap gap-2">
              {hub.professionalCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/pro/search?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:border-kauvex-orange hover:text-kauvex-orange transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-kauvex-navy text-white">
        <div className="max-w-7xl mx-auto px-6 py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">
            Get Started with <span className="text-kauvex-orange">{hub.hubName}</span>
          </h2>
          <p className="text-white/60 max-w-lg mx-auto mb-6">
            Join Kauvex and access all {hub.hubName} tools, products, and professional network.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-8 py-3 rounded-lg hover:bg-kauvex-orange/90 transition-colors"
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

function ComplianceRequestForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("Compliance request:", { name, email, company });
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    setSuccess(true);
    setName("");
    setEmail("");
    setCompany("");
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50">
      <h4 className="font-semibold text-kauvex-navy mb-1">Request Compliance Data</h4>
      <p className="text-sm text-gray-500 mb-4">
        This hub&apos;s compliance data is being compiled. Leave your details and we&apos;ll notify you when it&apos;s ready.
      </p>
      {success ? (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium bg-green-50 rounded-lg px-4 py-3">
          <Send size={16} />
          Thank you! We&apos;ll notify you at <span className="font-semibold">{email}</span> when compliance data is available.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange"
              placeholder="Your name"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
            <input
              type="text"
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange/30 focus:border-kauvex-orange"
              placeholder="Company name"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-5 py-2 rounded-lg hover:bg-kauvex-orange/90 transition-colors disabled:opacity-50 text-sm"
          >
            {submitting ? "Sending..." : "Submit"}
            <Send size={14} />
          </button>
        </form>
      )}
    </div>
  );
}
