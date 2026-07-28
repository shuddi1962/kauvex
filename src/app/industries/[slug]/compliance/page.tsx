"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardCheck, ChevronRight, FileText, CheckCircle, DollarSign, RefreshCw, ArrowRight, Phone } from "lucide-react";

interface Hub {
  id: string;
  hubName: string;
  hubSlug: string;
}

interface ComplianceItem {
  name: string;
  description: string;
  documents: string[];
  steps: string[];
  renewal: string;
  feeRange: string;
}

const COMPLIANCE_DATA: Record<string, ComplianceItem[]> = {
  marine: [
    {
      name: "Vessel Registration (NIMASA)",
      description: "All commercial vessels must be registered with the Nigerian Maritime Administration and Safety Agency.",
      documents: ["Certificate of ownership", "Tonnage certificate", "Safety equipment certificate", "Insurance certificate", "Radio license"],
      steps: ["Submit application form (NIMASA)", "Vessel inspection and survey", "Tonnage measurement", "Registration fee payment", "Issuance of certificate"],
      renewal: "Annual renewal required. Renew 60 days before expiry.",
      feeRange: "₦150,000 – ₦2,000,000 (depending on vessel size)",
    },
    {
      name: "Survey Certificates",
      description: "Annual and special survey certificates required for vessel seaworthiness.",
      documents: ["Previous survey report", "Maintenance log", "Class society documents", "Dry docking report"],
      steps: ["Schedule survey with NIMASA", "Vessel inspection", "Sea trial (if applicable)", "Certificate issuance"],
      renewal: "Annual survey every 12 months. Special survey every 5 years.",
      feeRange: "₦250,000 – ₦1,500,000",
    },
    {
      name: "Crew Certifications (STCW)",
      description: "Standards of Training, Certification and Watchkeeping for seafarers.",
      documents: ["STCW basic training certificate", "Certificate of Competency (COC)", "Medical fitness certificate", "Seaman's book", "Passport photos"],
      steps: ["Complete approved STCW training", "Pass competency examination", "Medical examination", "Submit to NIMASA for COC", "Certification issuance"],
      renewal: "STCW refresher every 5 years. Medical certificate annually.",
      feeRange: "₦85,000 – ₦500,000",
    },
  ],
  construction: [
    {
      name: "Building Permit",
      description: "Required for any new construction, renovation, or demolition from local planning authority.",
      documents: ["Land title/deed", "Architectural drawings", "Structural calculations", "Soil test report", "Environmental impact assessment"],
      steps: ["Submit plans to planning department", "Plan review and approvals", "Site inspection", "Permit fee payment", "Permit issuance"],
      renewal: "Valid for 3 years. Extension available for ongoing projects.",
      feeRange: "₦50,000 – ₦5,000,000 (based on project value)",
    },
    {
      name: "COREN Registration",
      description: "Council for the Regulation of Engineering in Nigeria – mandatory for engineering professionals and firms.",
      documents: ["Engineering degree certificate", "NYSC discharge certificate", "COREN exam results", "Professional experience log", "Professional indemnity insurance"],
      steps: ["Apply to COREN", "Verification of credentials", "Professional interview", "Pay registration fee", "Issuance of COREN number"],
      renewal: "Annual renewal with CPD credits requirement.",
      feeRange: "₦25,000 – ₦150,000",
    },
    {
      name: "Fire Safety Clearance",
      description: "Fire service inspection and clearance certificate for commercial buildings.",
      documents: ["Building plan showing escape routes", "Fire extinguisher placement plan", "Fire alarm system specification", "Sprinkler system certification"],
      steps: ["Submit building fire safety plan", "Fire service inspection", "Remediation of violations", "Certificate issuance"],
      renewal: "Annual inspection and renewal.",
      feeRange: "₦30,000 – ₦200,000",
    },
  ],
  energy: [
    {
      name: "NERC License",
      description: "Nigerian Electricity Regulatory Commission license for electricity generation, distribution, or trading.",
      documents: ["Company registration documents", "Technical specifications", "Environmental impact assessment", "Financial statements", "Health and safety policy"],
      steps: ["Pre-application meeting with NERC", "Submit application with all documents", "Technical review", "Public hearing", "License issuance"],
      renewal: "Generation license: 10 years. Distribution license: 15 years.",
      feeRange: "₦1,000,000 – ₦25,000,000",
    },
    {
      name: "SON Approval",
      description: "Standards Organisation of Nigeria certification for manufactured products and equipment.",
      documents: ["Product specification sheet", "Quality management system (ISO)", "Test reports from accredited lab", "Factory inspection report"],
      steps: ["Application to SON", "Product testing", "Factory inspection", "Certification decision", "SONCAP certificate issuance"],
      renewal: "Annual renewal with periodic surveillance audits.",
      feeRange: "₦100,000 – ₦750,000",
    },
    {
      name: "Environmental Impact Assessment",
      description: "Required for solar farms, large installations, and energy projects under NESREA.",
      documents: ["Project description", "Site maps", "Baseline environmental data", "Public consultation report", "Mitigation measures plan"],
      steps: ["Screening and scoping", "EIA study", "Public hearing", "Review by NESREA", "EIA approval or rejection"],
      renewal: "Valid for project duration. Additional permits for expansion.",
      feeRange: "₦500,000 – ₦5,000,000",
    },
  ],
  dredging: [
    {
      name: "Environmental Impact Assessment (EIA)",
      description: "Mandatory EIA for dredging projects under NESREA regulations.",
      documents: ["Project scope document", "Sediment analysis report", "Hydrographic survey data", "Turbidity monitoring plan", "Waste management plan"],
      steps: ["Submit EIA application", "Scoping exercise", "Baseline data collection", "Impact analysis", "Public disclosure", "Decision by NESREA"],
      renewal: "Valid for approved project duration. Re-assessment for extensions.",
      feeRange: "₦750,000 – ₦8,000,000",
    },
    {
      name: "NIMASA Dredging Permit",
      description: "Permit from NIMASA for dredging activities in navigable waters.",
      documents: ["Company registration", "Dredger vessel documentation", "Certificate of insurance", "Environmental permit (NESREA)", "Work plan"],
      steps: ["Submit application to NIMASA", "Vessel inspection", "Work plan review", "Permit fee payment", "Permit issuance"],
      renewal: "Annual renewal. Re-inspection required.",
      feeRange: "₦200,000 – ₦3,000,000",
    },
    {
      name: "NEMA Approval",
      description: "National Environmental Management Authority approval for dredging waste management.",
      documents: ["Waste characterization report", "Dredged material disposal plan", "Spill contingency plan", "Monitoring protocol"],
      steps: ["Submit waste management plan", "Review by NEMA", "Site inspection", "Approval issuance"],
      renewal: "Valid per project cycle. New approval for new locations.",
      feeRange: "₦100,000 – ₦1,000,000",
    },
  ],
};

export default function HubCompliancePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/kpn/hubs/${slug}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setHub(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const complianceItems = COMPLIANCE_DATA[slug] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/industries" className="hover:text-kauvex-orange">Industries</Link>
            <ChevronRight size={14} />
            {hub && <Link href={`/industries/${slug}`} className="hover:text-kauvex-orange">{hub.hubName}</Link>}
            <ChevronRight size={14} />
            <span className="text-kauvex-navy font-medium">Compliance Center</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : complianceItems.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardCheck size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-semibold text-gray-500 mb-1">Compliance center not available</p>
            <p className="text-sm text-gray-400 mb-6">Compliance information for this hub coming soon.</p>
            {hub && (
              <Link href={`/industries/${slug}`} className="text-kauvex-orange hover:underline text-sm">
                Back to {hub.hubName}
              </Link>
            )}
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-kauvex-navy mb-2">{hub?.hubName} Compliance Center</h1>
            <p className="text-gray-500 mb-8">
              Stay compliant with regulatory requirements for {hub?.hubName} operations.
              Below are the key permits, registrations, and certifications you need.
            </p>

            <div className="space-y-4">
              {complianceItems.map((item) => {
                const isExpanded = expandedItem === item.name;
                return (
                  <div key={item.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => setExpandedItem(isExpanded ? null : item.name)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-kauvex-orange/10 flex items-center justify-center shrink-0">
                          <FileText size={20} className="text-kauvex-orange" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-kauvex-navy">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Required Documents */}
                          <div>
                            <h4 className="text-xs font-semibold text-kauvex-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <FileText size={14} /> Required Documents
                            </h4>
                            <ul className="space-y-1.5">
                              {item.documents.map((doc) => (
                                <li key={doc} className="flex items-start gap-2 text-sm text-gray-600">
                                  <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Application Steps */}
                          <div>
                            <h4 className="text-xs font-semibold text-kauvex-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <ArrowRight size={14} /> Application Steps
                            </h4>
                            <ol className="space-y-1.5">
                              {item.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="w-5 h-5 rounded-full bg-kauvex-orange/10 text-kauvex-orange text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>

                        {/* Renewal & Fees */}
                        <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-start gap-2 text-sm">
                            <RefreshCw size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium text-kauvex-navy">Renewal: </span>
                              <span className="text-gray-500">{item.renewal}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <DollarSign size={14} className="text-green-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-medium text-kauvex-navy">Fee Range: </span>
                              <span className="text-gray-500">{item.feeRange}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-kauvex-navy to-[#0D1F3C] rounded-xl p-8 text-white mt-8">
              <div className="flex items-start gap-4">
                <Phone size={24} className="text-kauvex-orange shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-1">Need Help with Compliance?</h3>
                  <p className="text-white/60 text-sm mb-4">
                    Our compliance team can help you navigate regulatory requirements and
                    connect you with verified professionals who handle permit applications.
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-kauvex-orange text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-kauvex-orange/90 transition-colors text-sm"
                  >
                    Get Help <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
