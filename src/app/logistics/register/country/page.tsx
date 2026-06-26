"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, Bike, Car, Building2, Package, Check, ChevronRight, Upload, MapPin, Globe, AlertCircle, FileText } from "lucide-react";

const COUNTRY_DOCS: Record<string, { label: string; docs: { name: string; required: boolean; description: string }[] }> = {
  NG: {
    label: "Nigeria",
    docs: [
      { name: "CAC Registration Certificate", required: true, description: "Corporate Affairs Commission business registration" },
      { name: "National ID (NIN) or Voter's Card", required: true, description: "Driver/rider personal identification" },
      { name: "Vehicle Papers (C of C)", required: true, description: "Vehicle certificate of roadworthiness" },
      { name: "Insurance Certificate", required: true, description: "Third-party motor insurance" },
      { name: "NIN Verification (BVN)", required: false, description: "Bank verification number for payouts" },
      { name: "FRSC License", required: false, description: "Federal Road Safety Corps driver's license" },
    ],
  },
  GB: {
    label: "United Kingdom",
    docs: [
      { name: "Companies House Registration", required: true, description: "UK company registration number" },
      { name: "DVLA Driving License", required: true, description: "Full UK driving license" },
      { name: "MOT Certificate", required: true, description: "Valid vehicle MOT test certificate" },
      { name: "Motor Insurance (COM)", required: true, description: "Commercial motor insurance" },
      { name: "DBS Check", required: false, description: "Disclosure and Barring Service check" },
      { name: "OFT License", required: false, description: "Office of Fair Trading carrier license" },
    ],
  },
  US: {
    label: "United States",
    docs: [
      { name: "Business License (State)", required: true, description: "State-issued business operating license" },
      { name: "Driver's License", required: true, description: "Valid US state driver's license" },
      { name: "Vehicle Registration", required: true, description: "Current vehicle registration" },
      { name: "Commercial Auto Insurance", required: true, description: "Commercial vehicle insurance policy" },
      { name: "W-9 Tax Form", required: true, description: "Tax identification for 1099 reporting" },
      { name: "DOT Number", required: false, description: "Department of Transportation number (for >10,000 lbs)" },
    ],
  },
  AE: {
    label: "UAE",
    docs: [
      { name: "Trade License (DED)", required: true, description: "Dubai Economic Department trade license" },
      { name: "Emirates ID", required: true, description: "UAE Emirates ID card" },
      { name: "Vehicle Registration (Mulkiya)", required: true, description: "RTA vehicle registration card" },
      { name: "Auto Insurance", required: true, description: "UAE comprehensive motor insurance" },
      { name: "TRA Permit", required: false, description: "Telecom Regulatory Authority permit" },
    ],
  },
  IN: {
    label: "India",
    docs: [
      { name: "GST Registration", required: true, description: "Goods and Services Tax registration" },
      { name: "PAN Card", required: true, description: "Permanent Account Number" },
      { name: "Aadhaar Card", required: true, description: "Government ID for verification" },
      { name: "Driving License", required: true, description: "Valid Indian driving license" },
      { name: "Vehicle RC", required: true, description: "Registration Certificate for vehicle" },
      { name: "Commercial Insurance", required: true, description: "Commercial vehicle insurance" },
    ],
  },
  AU: {
    label: "Australia",
    docs: [
      { name: "ABN (Australian Business Number)", required: true, description: "Registered business number" },
      { name: "Driver's License", required: true, description: "Valid Australian state driving license" },
      { name: "Vehicle Registration", required: true, description: "Current state vehicle registration" },
      { name: "CTP Insurance", required: true, description: "Compulsory third-party insurance" },
      { name: "ACN (if company)", required: false, description: "Australian Company Number" },
    ],
  },
  DE: {
    label: "Germany",
    docs: [
      { name: "Gewerbeanmeldung (Trade License)", required: true, description: "German trade registration" },
      { name: "Personalausweis (ID Card)", required: true, description: "German national ID card" },
      { name: "Fahrzeugschein (Vehicle Title)", required: true, description: "German vehicle registration document" },
      { name: "Kfz-Versicherung (Insurance)", required: true, description: "German commercial vehicle insurance" },
      { name: "GmbH Registration", required: false, description: "Limited liability company registration" },
    ],
  },
  CA: {
    label: "Canada",
    docs: [
      { name: "Business Number (BN)", required: true, description: "CRA business number" },
      { name: "Provincial Business License", required: true, description: "Provincial operating license" },
      { name: "Driver's License", required: true, description: "Valid provincial driver's license" },
      { name: "Vehicle Registration", required: true, description: "Provincial vehicle registration" },
      { name: "Commercial Insurance", required: true, description: "Commercial vehicle insurance" },
      { name: "GST/HST Number", required: false, description: "Tax account number" },
    ],
  },
  GH: {
    label: "Ghana",
    docs: [
      { name: "Registrar General Certificate", required: true, description: "Business registration certificate" },
      { name: "Ghana Card (ID)", required: true, description: "National ID card" },
      { name: "DVLA Driver's License", required: true, description: "Valid Ghanaian driving license" },
      { name: "Vehicle Insurance", required: true, description: "Third-party motor insurance" },
      { name: "SSNIT Number", required: false, description: "Social security number for payouts" },
    ],
  },
  KE: {
    label: "Kenya",
    docs: [
      { name: "Business Registration Certificate", required: true, description: "Registrar of Companies certificate" },
      { name: "National ID / Passport", required: true, description: "Personal identification" },
      { name: "Driving License", required: true, description: "Valid Kenyan driving license" },
      { name: "Vehicle Logbook", required: true, description: "NTSA vehicle registration" },
      { name: "Insurance Certificate", required: true, description: "Third-party motor insurance" },
      { name: "KRA PIN", required: false, description: "Kenya Revenue Authority PIN" },
    ],
  },
  ZA: {
    label: "South Africa",
    docs: [
      { name: "CIPC Registration", required: true, description: "Companies and Intellectual Property Commission" },
      { name: "SA ID Document", required: true, description: "South African ID book/card" },
      { name: "Code 08 Driver's License", required: true, description: "Valid SA driving license" },
      { name: "Vehicle Disc", required: true, description: "Valid vehicle license disc" },
      { name: "Commercial Insurance", required: true, description: "Commercial vehicle insurance" },
    ],
  },
  SA: {
    label: "Saudi Arabia",
    docs: [
      { name: "CR (Commercial Registration)", required: true, description: "Ministry of Commerce CR" },
      { name: "Iqama (Residence Permit)", required: true, description: "Saudi residence permit" },
      { name: "Saudi Driving License", required: true, description: "Valid Saudi driving license" },
      { name: "Vehicle Registration (Istimara)", required: true, description: "Saudi vehicle registration" },
      { name: "Motor Insurance", required: true, description: "Saudi motor insurance" },
      { name: "ZATCA Tax Registration", required: false, description: "Tax authority registration" },
    ],
  },
  BR: {
    label: "Brazil",
    docs: [
      { name: "CNPJ (Business ID)", required: true, description: "Brazilian business registration number" },
      { name: "CPF (Personal ID)", required: true, description: "Brazilian individual taxpayer ID" },
      { name: "CNH (Driver's License)", required: true, description: "Carteira Nacional de Habilitacao" },
      { name: "CRLV (Vehicle Registration)", required: true, description: "Vehicle registration document" },
      { name: "DPVAT Insurance", required: true, description: "Mandatory vehicle insurance" },
    ],
  },
  JP: {
    label: "Japan",
    docs: [
      { name: "Business Registration (登記簿謄本)", required: true, description: "Certificate of registered matters" },
      { name: "My Number Card", required: true, description: "Japanese national ID card" },
      { name: "Driver's License (免許証)", required: true, description: "Valid Japanese driving license" },
      { name: "Shakensho (車検証)", required: true, description: "Vehicle inspection certificate" },
      { name: "Jibaiseki Hoken (自賠責保険)", required: true, description: "Compulsory automobile liability insurance" },
    ],
  },
  FR: {
    label: "France",
    docs: [
      { name: "Kbis (Business Registration)", required: true, description: "Registre du Commerce et des Societes" },
      { name: "Piece d'Identite (ID Card)", required: true, description: "French national ID card" },
      { name: "Permis de Conduire (License)", required: true, description: "Valid French driving license" },
      { name: "Carte Grise (Vehicle Title)", required: true, description: "French vehicle registration" },
      { name: "Assurance Auto Pro", required: true, description: "Commercial vehicle insurance" },
      { name: "SIRET Number", required: false, description: "Business tax identification number" },
    ],
  },
};

const partnerTypes = [
  { id: "rider", label: "Rider", icon: Bike, desc: "Motorcycle / scooter courier" },
  { id: "driver", label: "Driver", icon: Car, desc: "Car / van driver" },
  { id: "courier", label: "Courier Business", icon: Building2, desc: "Fleet operator" },
  { id: "freight", label: "Freight Company", icon: Package, desc: "Trucking / cargo" },
];

export default function CountryPartnerRegistration() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);

  const countryDocs = selectedCountry ? COUNTRY_DOCS[selectedCountry] : null;
  const requiredDocs = countryDocs?.docs.filter((d) => d.required) || [];
  const optionalDocs = countryDocs?.docs.filter((d) => !d.required) || [];
  const allRequiredUploaded = requiredDocs.every((d) => uploadedDocs[d.name]);
  const progress = countryDocs ? (Object.values(uploadedDocs).filter(Boolean).length / countryDocs.docs.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/logistics/register" className="p-2 hover:bg-gray-200 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partner Registration</h1>
            <p className="text-sm text-gray-500">Country-specific document requirements</p>
          </div>
        </div>

        {/* Step 0: Select Country */}
        {step === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" /> Select Your Country
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(COUNTRY_DOCS).map(([code, config]) => (
                <button
                  key={code}
                  onClick={() => { setSelectedCountry(code); setStep(1); }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCountry === code
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-medium text-gray-900">{config.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{config.docs.length} documents required</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Select Partner Type */}
        {step === 1 && countryDocs && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Partner Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {partnerTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedType(type.id); setStep(2); }}
                  className={`p-4 rounded-lg border-2 text-center transition-all ${
                    selectedType === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <type.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500 mt-1">{type.desc}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-4 text-sm text-gray-500 hover:text-gray-700">
              &larr; Change Country
            </button>
          </div>
        )}

        {/* Step 2: Upload Documents */}
        {step === 2 && countryDocs && (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {Object.values(uploadedDocs).filter(Boolean).length} / {countryDocs.docs.length} documents uploaded
                </span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {requiredDocs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> Required Documents
                </h2>
                <div className="space-y-3">
                  {requiredDocs.map((doc) => (
                    <div key={doc.name} className={`flex items-center justify-between p-4 rounded-lg border ${
                      uploadedDocs[doc.name] ? "border-emerald-200 bg-emerald-50" : "border-gray-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <div>
                        {uploadedDocs[doc.name] ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <Check className="w-4 h-4" /> Uploaded
                          </span>
                        ) : (
                          <label className="cursor-pointer px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" /> Upload
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={() => setUploadedDocs({ ...uploadedDocs, [doc.name]: true })} />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {optionalDocs.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optional Documents</h2>
                <div className="space-y-3">
                  {optionalDocs.map((doc) => (
                    <div key={doc.name} className={`flex items-center justify-between p-4 rounded-lg border ${
                      uploadedDocs[doc.name] ? "border-emerald-200 bg-emerald-50" : "border-gray-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <div>
                        {uploadedDocs[doc.name] ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                            <Check className="w-4 h-4" /> Uploaded
                          </span>
                        ) : (
                          <label className="cursor-pointer px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" /> Upload
                            <input type="file" className="hidden" accept=".pdf,.jpg,.png" onChange={() => setUploadedDocs({ ...uploadedDocs, [doc.name]: true })} />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                &larr; Back
              </button>
              <button
                disabled={!allRequiredUploaded}
                className={`px-6 py-2 rounded-lg text-sm font-medium ${
                  allRequiredUploaded
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Submit Application &rarr;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
