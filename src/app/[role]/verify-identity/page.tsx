"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Camera,
  FileText,
  Shield,
  User,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Document Type" },
  { id: 2, label: "Upload ID" },
  { id: 3, label: "Take Selfie" },
  { id: 4, label: "Review & Submit" },
  { id: 5, label: "Result" },
];

const DOCUMENT_TYPES = [
  { id: "passport", label: "Passport", icon: FileText, countries: ["*"] },
  { id: "national_id", label: "National ID", icon: CreditCard, countries: ["*"] },
  { id: "drivers_license", label: "Driver's License", icon: CreditCard, countries: ["*"] },
  { id: "bvn", label: "BVN", icon: User, countries: ["NG"], description: "Bank Verification Number (Nigeria)" },
  { id: "nin", label: "NIN", icon: User, countries: ["NG"], description: "National Identification Number (Nigeria)" },
];

const COUNTRY_PROVIDERS: Record<string, string> = {
  NG: "Smile Identity",
  GH: "Smile Identity",
  KE: "Smile Identity",
  ZA: "Smile Identity",
  US: "Onfido",
  GB: "Onfido",
  DE: "Onfido",
  FR: "Onfido",
  AE: "Onfido",
  SA: "Onfido",
  IN: "Onfido",
  JP: "Onfido",
  BR: "Onfido",
  AU: "Onfido",
  CA: "Onfido",
};

function getProviderForCountry(code: string): string {
  return COUNTRY_PROVIDERS[code] || "Onfido";
}

export default function VerifyIdentityPage() {
  const params = useParams();
  const role = (params?.role as string) || "customer";

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [consent, setConsent] = useState(false);
  const [countryCode] = useState("NG");

  const provider = getProviderForCountry(countryCode);
  const availableDocs = DOCUMENT_TYPES.filter(
    (d) => d.countries.includes("*") || d.countries.includes(countryCode)
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedDoc;
      case 2: return !!uploadedFile;
      case 3: return selfieTaken;
      case 4: return consent;
      default: return false;
    }
  };

  const nextStep = () => {
    if (currentStep < 5 && canProceed()) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 capitalize mb-1">{role?.replace("_", " ")}</p>
          <h1 className="text-2xl font-bold text-[#0A1628]">Identity Verification</h1>
          <p className="text-gray-500 mt-1">Verify your identity to unlock platform features</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep > step.id
                      ? "bg-[#FF6B00] text-white"
                      : currentStep === step.id
                      ? "bg-[#0A1628] text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-2 hidden sm:block">{step.label}</span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 sm:w-20 mx-2 ${
                    currentStep > step.id ? "bg-[#FF6B00]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
          {/* Step 1: Document Type */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A1628] mb-1">Select Document Type</h2>
              <p className="text-sm text-gray-500 mb-6">Choose the government-issued ID you want to verify with</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      selectedDoc === doc.id
                        ? "border-[#FF6B00] bg-[#FF6B00]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedDoc === doc.id ? "bg-[#FF6B00]/10" : "bg-gray-100"
                    }`}>
                      <doc.icon className={`h-5 w-5 ${selectedDoc === doc.id ? "text-[#FF6B00]" : "text-gray-500"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-[#0A1628]">{doc.label}</p>
                      {doc.description && <p className="text-xs text-gray-500">{doc.description}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Upload ID */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A1628] mb-1">Upload Government ID</h2>
              <p className="text-sm text-gray-500 mb-6">Take a clear photo or scan of your document</p>
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  uploadedFile ? "border-[#FF6B00] bg-[#FF6B00]/5" : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {uploadedFile ? (
                  <div className="space-y-2">
                    <FileText className="h-10 w-10 text-[#FF6B00] mx-auto" />
                    <p className="font-medium text-[#0A1628]">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button onClick={() => setUploadedFile(null)} className="text-sm text-red-600 underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Drag and drop your file here, or click to browse</p>
                    <p className="text-xs text-gray-400">Accepted: JPG, PNG, PDF — Max 10MB</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setUploadedFile(file);
                        }}
                      />
                      <span className="inline-block px-4 py-2 bg-[#0A1628] text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-[#0A1628]/90 transition-colors">
                        Choose File
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Take Selfie */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A1628] mb-1">Take a Live Selfie</h2>
              <p className="text-sm text-gray-500 mb-6">We need to verify that you match your ID document</p>
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-xl aspect-video flex flex-col items-center justify-center">
                  {selfieTaken ? (
                    <div className="text-center space-y-2">
                      <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
                      <p className="font-medium text-[#0A1628]">Selfie captured</p>
                      <button onClick={() => setSelfieTaken(false)} className="text-sm text-[#FF6B00] underline">Retake</button>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Camera preview will appear here</p>
                      <button
                        onClick={() => setSelfieTaken(true)}
                        className="px-4 py-2 bg-[#FF6B00] text-white text-sm font-medium rounded-lg hover:bg-[#e55f00] transition-colors"
                      >
                        Take Photo
                      </button>
                    </div>
                  )}
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Selfie Guidelines</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Ensure your face is clearly visible and well-lit</li>
                    <li>• Center your face in the frame</li>
                    <li>• Remove sunglasses, hats, or face coverings</li>
                    <li>• Anti-spoofing: We detect photos of photos and video replay</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-[#0A1628] mb-1">Review & Submit</h2>
              <p className="text-sm text-gray-500 mb-6">Please review your information before submitting</p>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Document Type</span>
                    <span className="font-medium text-[#0A1628] capitalize">{selectedDoc?.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Uploaded File</span>
                    <span className="font-medium text-[#0A1628]">{uploadedFile?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Selfie</span>
                    <span className="font-medium text-[#0A1628]">{selfieTaken ? "Captured" : "Not taken"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Verification Provider</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Shield className="h-3 w-3" />
                      {provider}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium text-[#0A1628] capitalize">{role?.replace("_", " ")}</span>
                  </div>
                </div>

                <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm this is my legitimate identity document and I authorize Kauvex to verify it with the selected provider.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Result */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-[#0A1628] mb-2">Verification Submitted</h2>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Your verification is being reviewed. This typically takes 1-2 business days.
                We&apos;ll notify you via email once the review is complete.
              </p>
              <div className="bg-gray-50 rounded-xl p-4 max-w-sm mx-auto mb-6">
                <p className="text-sm text-gray-500">Reference ID</p>
                <p className="font-mono text-sm text-[#0A1628]">KYC-{Date.now().toString(36).toUpperCase()}</p>
              </div>
              <a
                href={`/${role}/dashboard`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A1628] text-white font-medium rounded-lg hover:bg-[#0A1628]/90 transition-colors"
              >
                Return to Dashboard
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B00] text-white text-sm font-semibold rounded-lg hover:bg-[#e55f00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 4 ? "Submit Verification" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
