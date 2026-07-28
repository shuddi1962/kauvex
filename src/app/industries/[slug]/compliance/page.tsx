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
agriculture: [
    {
      name: "NAFDAC Registration (Agro-Processing)",
      description: "National Agency for Food and Drug Administration and Control registration for processed agricultural products and agro-allied inputs.",
      documents: ["Company registration (CAC)", "Product formulation details", "Factory inspection report", "Water quality analysis", "Label/package mock-up", "Good Manufacturing Practice cert"],
      steps: ["Submit product registration application", "Product laboratory analysis", "Factory inspection by NAFDAC", "Label review and approval", "NAFDAC registration number issuance"],
      renewal: "Renewal every 3 years. Post-marketing surveillance annually.",
      feeRange: "₦200,000 – ₦1,000,000",
    },
    {
      name: "Fertilizer Registration (FEPSAN/NAQS)",
      description: "Registration of fertilizer products with the Fertilizer Producers and Suppliers Association and National Agricultural Quarantine Service.",
      documents: ["Product composition analysis", "Soil efficacy trial results", "Manufacturing license", "Packaging specification", "Import permit (if applicable)"],
      steps: ["Product sample submission", "Efficacy trials at approved sites", "Laboratory analysis", "Registration committee review", "Certificate of registration"],
      renewal: "Annual renewal with batch testing.",
      feeRange: "₦150,000 – ₦500,000",
    },
    {
      name: "Pesticide Control License (NAFDAC/EPA)",
      description: "License for importation, distribution, or use of agricultural pesticides and herbicides under NAFDAC and National Environmental Standards.",
      documents: ["Product toxicology report", "Material safety data sheet", "Label and leaflet", "Import permit", "Environmental management plan"],
      steps: ["Submit pesticide notification dossier", "Risk assessment review", "Label compliance check", "License fee payment", "Issuance of pesticide license"],
      renewal: "Annual renewal. Batch re-analysis every 2 years.",
      feeRange: "₦100,000 – ₦600,000",
    },
  ],
  automotive: [
    {
      name: "Vehicle Assembly License (NAIDP)",
      description: "License under the National Automotive Industry Development Plan for vehicle assembly and manufacturing operations.",
      documents: ["Factory layout and equipment list", "Technical partnership agreement", "Local content compliance plan", "Environmental impact assessment", "Quality management system cert"],
      steps: ["Submit expression of interest to NADDC", "Factory inspection and audit", "Local content verification", "Technical committee review", "Assembly license issuance"],
      renewal: "Annual renewal. Full re-audit every 3 years.",
      feeRange: "₦1,000,000 – ₦10,000,000",
    },
    {
      name: "Spare Parts Certification (SON)",
      description: "Standards Organisation of Nigeria certification for automotive spare parts and components.",
      documents: ["Product specification sheet", "Material composition report", "Performance test results", "Factory quality manual", "ISO 9001 certification (if applicable)"],
      steps: ["Application to SON", "Sample collection and testing", "Factory inspection (local manufacturers)", "Test report review", "SONCAP certificate issuance"],
      renewal: "Annual renewal with periodic market surveillance.",
      feeRange: "₦75,000 – ₦350,000",
    },
    {
      name: "Auto Workshop Registration (LASAA/State)",
      description: "Registration and operating permit for automotive repair workshops and service centers with state transport authorities.",
      documents: ["Business premises lease/title", "Equipment inventory", "Qualified technician certificates", "Waste disposal agreement", "Fire extinguisher certification"],
      steps: ["Apply to state automobile registration body", "Premises inspection", "Technician credential verification", "Environmental compliance check", "Operating permit issuance"],
      renewal: "Biennial renewal. Random spot inspections.",
      feeRange: "₦50,000 – ₦250,000",
    },
  ],
  aviation: [
    {
      name: "Air Operator's Certificate (NCAA)",
      description: "Nigeria Civil Aviation Authority certificate required for any commercial air transport operation.",
      documents: ["Aircraft registration documents", "Insurance certificate (hull and liability)", "Maintenance program manual", "Operations manual", "Crew licenses and medicals"],
      steps: ["Pre-application meeting with NCAA", "Formal application submission", "Document review and audit", "Proving flights and inspections", "AOC issuance"],
      renewal: "Annual renewal with recurrent audits. Full recertification every 2 years.",
      feeRange: "₦2,000,000 – ₦15,000,000",
    },
    {
      name: "Aircraft Maintenance Organization Approval",
      description: "NCAA approval for organizations performing aircraft maintenance, repair, and overhaul.",
      documents: ["Facility lease/ownership", "Tooling and equipment list", "Qualified engineer licenses", "Maintenance procedures manual", "Quality assurance manual"],
      steps: ["Submit maintenance organization manual", "Facility inspection by NCAA", "Tooling and equipment verification", "Staff competency assessment", "Maintenance organization approval"],
      renewal: "Annual renewal with scheduled and surprise audits.",
      feeRange: "₦1,000,000 – ₦5,000,000",
    },
    {
      name: "Aviation Security Clearance (AVSEC)",
      description: "Security clearance and background checks for aviation personnel and ground handling companies.",
      documents: ["Personal identification documents", "Police character certificate", "Employment letter", "Security background check form", "Training certificates"],
      steps: ["Submit AVSEC clearance application", "Background investigation", "Security awareness training", "Biometric enrolment", "AVSEC ID card issuance"],
      renewal: "Renewable every 2 years. Immediate review on incident report.",
      feeRange: "₦35,000 – ₦150,000",
    },
  ],
  healthcare: [
    {
      name: "Medical Facility Registration (MDCN/FMH)",
      description: "Registration and accreditation of medical facilities with the Medical and Dental Council of Nigeria and Federal Ministry of Health.",
      documents: ["Certificate of incorporation", "Facility floor plan", "Equipment inventory", "Staff qualification certificates", "Infection control policy", "Fire safety certificate"],
      steps: ["Submit facility registration application", "Documentation review", "Facility inspection by accreditation team", "Staff credential verification", "Registration certificate issuance"],
      renewal: "Annual renewal. Full reaccreditation every 3 years.",
      feeRange: "₦150,000 – ₦1,500,000",
    },
    {
      name: "Pharmacy License (PCN)",
      description: "Pharmacists Council of Nigeria license for dispensing of pharmaceuticals and operation of pharmacy premises.",
      documents: ["Pharmacy degree certificate", "Pharmacist practicing license", "Premises lease agreement", "Drug storage facility inspection", "Controlled drugs register"],
      steps: ["Apply to PCN for premises registration", "Supervising pharmacist verification", "Premises inspection", "Controlled substances license", "Pharmacy license issuance"],
      renewal: "Annual renewal with unannounced inspections.",
      feeRange: "₦50,000 – ₦300,000",
    },
    {
      name: "NHIS Accreditation",
      description: "National Health Insurance Scheme accreditation for healthcare providers to treat NHIS enrollees.",
      documents: ["Facility registration certificate", "Practitioner licenses", "NHIS provider application form", "Service price list", "Pharmacy and lab accreditation"],
      steps: ["Express interest in NHIS accreditation", "Submit provider application", "Facility inspection and grading", "Price negotiation and contract", "NHIS provider code issuance"],
      renewal: "Annual revalidation. Quality audit every 2 years.",
      feeRange: "₦100,000 – ₦500,000",
    },
  ],
  hospitality: [
    {
      name: "Hotel Classification (NTDC)",
      description: "National Tourism Development Corporation star rating classification for hotels, resorts, and guest houses.",
      documents: ["Certificate of incorporation", "Hotel floor plans and room inventory", "Staff list with qualifications", "Fire safety certificate", "Public liability insurance"],
      steps: ["Submit classification application to NTDC", "Pre-assessment visit", "Facility inspection and scoring", "Mystery guest evaluation", "Star rating certificate issuance"],
      renewal: "Every 2 years. Re-classification after major renovations.",
      feeRange: "₦100,000 – ₦750,000",
    },
    {
      name: "Food Service Permit (State MoH)",
      description: "State Ministry of Health permit for restaurants, cafés, and food service operations in hospitality establishments.",
      documents: ["Food handlers medical certificates", "Kitchen layout plan", "Water quality test report", "Pest control contract", "Waste disposal agreement"],
      steps: ["Submit food service registration", "Kitchen and storage inspection", "Food handler health screening", "Food safety training verification", "Permit issuance"],
      renewal: "Annual renewal. Quarterly inspections by environmental health officers.",
      feeRange: "₦30,000 – ₦150,000",
    },
    {
      name: "Liquor License (State Licensing Board)",
      description: "State liquor licensing board permit for sale and service of alcoholic beverages in hospitality venues.",
      documents: ["Hotel/hospitality license", "Tax clearance certificate", "Police clearance", "Community consent letter", "Floor plan showing bar area"],
      steps: ["Apply to state liquor licensing board", "Police background investigation", "Community notification and hearing", "Premises inspection", "Liquor license issuance"],
      renewal: "Annual renewal. Sundays and public holiday permits separate.",
      feeRange: "₦200,000 – ₦1,000,000",
    },
  ],
  manufacturing: [
    {
      name: "Factory Registration (State/Federal Min of Labour)",
      description: "Registration of manufacturing factory premises with the Ministry of Labour and Productivity for occupational safety compliance.",
      documents: ["Certificate of incorporation", "Factory layout plan", "Equipment schedule", "Health and safety policy", "Fire extinguisher placement plan"],
      steps: ["Submit factory registration form", "Premises inspection by labour officer", "Fire safety and exit audit", "Employee welfare facilities check", "Factory registration certificate"],
      renewal: "Annual renewal with periodic safety audits.",
      feeRange: "₦50,000 – ₦400,000",
    },
    {
      name: "Manufacturing License (SON/NAFDAC)",
      description: "Product-specific manufacturing license depending on product category — SON for industrial goods, NAFDAC for food/drugs/cosmetics.",
      documents: ["Product formulation/specification", "Factory GMP certificate", "Quality control lab setup", "Raw material sourcing documentation", "Packaging specification"],
      steps: ["Determine regulatory body (SON/NAFDAC)", "Submit manufacturing application", "Factory inspection", "Product sample testing", "Manufacturing license issuance"],
      renewal: "NAFDAC: 1–3 years. SON: Annual with surveillance audit.",
      feeRange: "₦200,000 – ₦2,000,000",
    },
    {
      name: "Environmental Compliance (NESREA)",
      description: "National Environmental Standards and Regulations Enforcement Agency compliance permit for manufacturing operations with waste discharge.",
      documents: ["Environmental audit report", "Effluent treatment plant design", "Air emission monitoring report", "Waste management plan", "Community grievance mechanism"],
      steps: ["Environmental audit of facility", "Submit environmental compliance report", "Effluent sampling and analysis", "Public notice (if applicable)", "NESREA compliance certificate"],
      renewal: "Annual renewal. Quarterly self-monitoring reports required.",
      feeRange: "₦150,000 – ₦1,000,000",
    },
  ],
  mining: [
    {
      name: "Mining Lease (NMCO)",
      description: "Mining lease granted by the Nigerian Mining Cadastre Office for large-scale commercial mineral extraction.",
      documents: ["Exploration report", "Feasibility study", "Environmental impact assessment", "Community development agreement", "Financial capacity evidence"],
      steps: ["File application at NMCO", "Cadastral survey and plot allocation", "Technical review by Mines Inspectorate", "Community consultation", "Mining lease execution"],
      renewal: "Initial term 25 years. Renewable for another 25 years.",
      feeRange: "₦500,000 – ₦5,000,000",
    },
    {
      name: "Small Scale Mining License",
      description: "License for artisanal and small-scale mining operations with reduced regulatory burden.",
      documents: ["Business registration", "Site description and coordinates", "Work program proposal", "Environmental protection plan", "Community consent letter"],
      steps: ["Submit SSM license application to NMCO", "Site assessment", "Environmental undertaking", "License fee payment", "SSM license issuance"],
      renewal: "Renewable every 5 years. Annual environmental compliance report.",
      feeRange: "₦100,000 – ₦500,000",
    },
    {
      name: "Mineral Export Permit",
      description: "Permit required from the Ministry of Mines and Steel Development for export of solid minerals.",
      documents: ["Valid mining license", "Mineral analysis certificate", "Export contract", "Tax clearance certificate", "Pre-shipment inspection report"],
      steps: ["Submit export permit application", "Mineral quality verification", "Royalty payment confirmation", "Pre-shipment inspection", "Export clearance issuance"],
      renewal: "Permit per shipment. Annual exporter registration.",
      feeRange: "₦200,000 – ₦1,500,000",
    },
  ],
  oil_gas: [
    {
      name: "DPR/Upstream License (NUPRC)",
      description: "Nigerian Upstream Petroleum Regulatory Commission license for oil and gas exploration, development, and production activities.",
      documents: ["PSC/SPA agreement", "Environmental impact assessment", "Local content plan", "Technical work program", "Insurance and financial guarantees"],
      steps: ["Bid round participation or farm-in", "License award negotiation", "Environmental impact assessment", "Local content compliance approval", "License signing and issuance"],
      renewal: "Initial term typically 5–20 years. Extension subject to NUPRC approval.",
      feeRange: "₦10,000,000 – ₦500,000,000",
    },
    {
      name: "Downstream License (NMDPRA)",
      description: "Nigerian Midstream and Downstream Petroleum Regulatory Authority license for refining, storage, distribution, and retail of petroleum products.",
      documents: ["Company registration (CAC)", "Facility design and safety report", "Fire safety certificate", "Environmental compliance cert", "Third-party insurance"],
      steps: ["Submit application to NMDPRA", "Facility design review", "Construction inspection (for new facilities)", "Safety audit and commissioning", "Operating license issuance"],
      renewal: "Annual renewal with safety audit. Major inspection every 3 years.",
      feeRange: "₦1,000,000 – ₦20,000,000",
    },
    {
      name: "Local Content Compliance (NCDMB)",
      description: "Nigerian Content Development and Monitoring Board compliance certificate for all oil and gas operations in Nigeria.",
      documents: ["Nigerian content plan", "Equipment ownership list", "Employment and training plan", "Research and development commitment", "Quarterly compliance reports"],
      steps: ["Register with NCDMB", "Submit Nigerian content plan", "Compliance audit and verification", "Quarterly reporting and monitoring", "Annual compliance certificate issuance"],
      renewal: "Annual compliance certificate. Quarterly reporting mandatory.",
      feeRange: "₦500,000 – ₦10,000,000",
    },
  ],
  pharmaceutical: [
    {
      name: "Drug Manufacturing License (NAFDAC)",
      description: "NAFDAC drug manufacturing license required for production of pharmaceutical products including ethical, OTC, and herbal medicines.",
      documents: ["Factory GMP certificate", "Drug registration dossiers", "Stability study reports", "Quality control lab accreditation", "Product market authorization applications"],
      steps: ["Factory GMP pre-qualification inspection", "Submit drug registration dossiers", "Product sample analysis by NAFDAC lab", "Label and package review", "Manufacturing and marketing authorization"],
      renewal: "GMP license annual. Drug registration renewable every 5 years.",
      feeRange: "₦500,000 – ₦3,000,000",
    },
    {
      name: "Pharmacist Superintendent License (PCN)",
      description: "Pharmacists Council of Nigeria license for a supervising pharmacist responsible for pharmaceutical manufacturing or distribution.",
      documents: ["Pharmacy degree (B.Pharm/Pharm.D)", "PCN annual practicing license", "Experience verification letter", "Professional indemnity insurance", "CPD certificate"],
      steps: ["Apply to PCN for superintendent license", "Credential verification", "Interview by PCN committee", "Inspection of proposed facility", "Superintendent pharmacist approval"],
      renewal: "Annual renewal with mandatory CPD credits.",
      feeRange: "₦50,000 – ₦200,000",
    },
    {
      name: "Controlled Substances License (NDLEA)",
      description: "National Drug Law Enforcement Agency license for handling, storage, and distribution of narcotics and psychotropic substances.",
      documents: ["NAFDAC manufacturing license", "Schedule of controlled substances", "Secure storage facility plan", "Staff security clearance", "Record keeping system"],
      steps: ["Submit application to NDLEA", "Background investigation", "Facility security audit", "Record keeping system review", "Controlled substances license issuance"],
      renewal: "Annual renewal with quarterly stock reporting.",
      feeRange: "₦100,000 – ₦500,000",
    },
  ],
  real_estate: [
    {
      name: "Property Development Permit (State Planning Authority)",
      description: "Development permit from state urban and regional planning board for construction of real estate projects.",
      documents: ["Certificate of occupancy (C-of-O)", "Architectural designs", "Structural engineering report", "Service layout (water, electricity, sewage)", "Environmental impact screening"],
      steps: ["Submit development application to planning authority", "Plan review and zoning check", "Site inspection and survey verification", "Development levy payment", "Development permit issuance"],
      renewal: "Valid for 3 years. Extension for ongoing projects.",
      feeRange: "₦100,000 – ₦3,000,000",
    },
    {
      name: "Estate Agent Registration (ESVBN/SHRO)",
      description: "Registration with the Estate Surveyors and Valuers Registration Board of Nigeria for real estate agency practice.",
      documents: ["ESV degree or HND certificate", "Professional exam results (NIESV)", "Practical experience log", "Certificate of incorporation", "Professional indemnity insurance"],
      steps: ["Apply to ESVBN for registration", "Credential verification", "Professional interview", "Oath of professional conduct", "Practicing certificate issuance"],
      renewal: "Annual practicing certificate. CPD mandatory for renewal.",
      feeRange: "₦35,000 – ₦150,000",
    },
    {
      name: "Property Registration (Land Registry)",
      description: "Registration of property title and land documents at the state land registry for legal ownership recognition.",
      documents: ["Deed of assignment/lease", "Survey plan", "Governor's consent (if applicable)", "Tax clearance certificate", "Certificate of occupancy"],
      steps: ["Search at land registry for encumbrances", "Prepare deed of assignment", "Submit for stamp duty assessment", "Pay registration fees and stamp duty", "Title registration and C-of-O processing"],
      renewal: "Governor's consent valid indefinitely. C-of-O renewable after 99 years.",
      feeRange: "₦200,000 – ₦2,000,000",
    },
  ],
  technology: [
    {
      name: "Software Registration (NBC/NOA)",
      description: "Registration of technology products and software with the National Broadcasting Commission (digital content) and National Office for Technology Acquisition.",
      documents: ["Product specification document", "Intellectual property registration (IPO)", "Source code escrow (for licensed software)", "Tax identification number", "Data privacy compliance policy"],
      steps: ["Classify product type (software/digital content)", "Submit registration application", "Technical evaluation by regulator", "Data protection compliance check", "Registration certificate issuance"],
      renewal: "Annual renewal. Re-evaluation on major version updates.",
      feeRange: "₦50,000 – ₦500,000",
    },
    {
      name: "Data Protection Registration (NDPC)",
      description: "Registration as a data processor or data controller with the Nigeria Data Protection Commission under the NDPA 2023.",
      documents: ["Company registration (CAC)", "Data processing inventory", "Privacy policy document", "DPIA report (for high-risk processing)", "Data Protection Officer appointment letter"],
      steps: ["Register on NDPC portal", "Submit data processing documentation", "Annual audit engagement filing", "Compliance verification", "Data protection compliance certificate"],
      renewal: "Annual filing with updated audit report. Immediate notification of data breaches.",
      feeRange: "₦25,000 – ₦250,000",
    },
    {
      name: "Fintech License (CBN/SEC)",
      description: "Regulatory license from Central Bank of Nigeria or Securities and Exchange Commission for fintech operations (PSB, PSSP, crowdfunding, digital lending).",
      documents: ["Business plan and financial projections", "Technical infrastructure document", "AML/CFT compliance policy", "Board members CVs", "Capital adequacy evidence", "Shareholder structure"],
      steps: ["Pre-application meeting with regulator", "Submit formal application with all schedules", "Regulatory review and due diligence", "Technology infrastructure audit", "License approval and issuance"],
      renewal: "Payment service license: annual. Fintech license: renewable every 5 years.",
      feeRange: "₦500,000 – ₦10,000,000",
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
