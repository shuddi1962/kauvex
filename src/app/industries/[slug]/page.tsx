"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Package, UserCheck, FolderKanban, SlidersHorizontal, Truck, Wrench,
  Gavel, Landmark, ShieldCheck, ClipboardCheck, GraduationCap,
  BookOpen, MessageCircle, BarChart3, ArrowRight, ChevronRight,
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
            <p className="text-gray-500">Procurement tools and supplier management coming soon.</p>
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
              <p className="text-gray-500">Compliance information coming soon for this hub.</p>
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
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Training</h2>
            <p className="text-gray-500">Training courses for {hub.hubName} coming soon.</p>
          </div>
        );
      case "knowledge":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Knowledge Center</h2>
            <p className="text-gray-500 mb-4">Knowledge center for {hub.hubName} coming soon. Topics will include:</p>
            <div className="flex flex-wrap gap-2">
              {["Best practices", "Industry standards", "Case studies", "Whitepapers", "Regulations", "Technology trends"].map((t) => (
                <span key={t} className="px-3 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-600 border border-gray-200">
                  {t}
                </span>
              ))}
            </div>
          </div>
        );
      case "community":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Community</h2>
            <p className="text-gray-500">Community forum for {hub.hubName} professionals coming soon.</p>
          </div>
        );
      case "intelligence":
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-kauvex-navy mb-2">Industry Intelligence</h2>
            <p className="text-gray-500 mb-6">Industry intelligence and analytics for {hub.hubName} coming soon.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Market Size", value: "—" },
                { label: "Growth Rate", value: "—" },
                { label: "Active Companies", value: "—" },
                { label: "Employment", value: "—" },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-xl font-bold text-kauvex-navy">{m.value}</p>
                  <p className="text-xs text-gray-500">{m.label}</p>
                </div>
              ))}
            </div>
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
