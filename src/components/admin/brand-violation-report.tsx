"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BrandViolationReportProps {
  className?: string;
  onSubmit?: (data: BrandViolationFormData) => void;
}

export interface BrandViolationFormData {
  violationType: string;
  description: string;
  offendingUrl: string;
  evidenceUrls: string[];
  entityType: string;
  entityId: string;
}

const violationTypes = [
  { value: "counterfeit", label: "Counterfeit Products" },
  { value: "impersonation", label: "Brand Impersonation" },
  { value: "logo_misuse", label: "Logo Misuse" },
  { value: "competitor_packaging", label: "Competitor Packaging" },
  { value: "unauthorized_use", label: "Unauthorized Brand Use" },
];

const entityTypes = [
  { value: "vendor", label: "Vendor" },
  { value: "supplier", label: "Supplier" },
  { value: "partner", label: "Logistics Partner" },
  { value: "external", label: "External Entity" },
];

export function BrandViolationReport({
  className,
  onSubmit,
}: BrandViolationReportProps) {
  const [formData, setFormData] = React.useState<BrandViolationFormData>({
    violationType: "",
    description: "",
    offendingUrl: "",
    evidenceUrls: [],
    entityType: "",
    entityId: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit?.(formData);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={cn("text-center py-12", className)}>
        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
          <span className="text-3xl">✓</span>
        </div>
        <h3 className="text-lg font-bold text-kauvex-navy mb-2">
          Report Submitted
        </h3>
        <p className="text-sm text-gray-500">
          Our team will review your report within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("max-w-2xl space-y-6", className)}
    >
      <div>
        <h2 className="text-xl font-bold text-kauvex-navy mb-1">
          Report Brand Abuse
        </h2>
        <p className="text-sm text-gray-500">
          Help us protect the Kauvex brand. All reports are reviewed within 24
          hours.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-kauvex-navy mb-1.5">
          Violation Type *
        </label>
        <select
          required
          value={formData.violationType}
          onChange={(e) =>
            setFormData({ ...formData, violationType: e.target.value })
          }
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange"
        >
          <option value="">Select violation type</option>
          {violationTypes.map((vt) => (
            <option key={vt.value} value={vt.value}>
              {vt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-kauvex-navy mb-1.5">
          Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe the brand violation in detail..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-kauvex-navy mb-1.5">
          Offending URL
        </label>
        <input
          type="url"
          value={formData.offendingUrl}
          onChange={(e) =>
            setFormData({ ...formData, offendingUrl: e.target.value })
          }
          placeholder="https://..."
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-kauvex-navy mb-1.5">
          Entity Involved
        </label>
        <div className="flex gap-3">
          <select
            value={formData.entityType}
            onChange={(e) =>
              setFormData({ ...formData, entityType: e.target.value })
            }
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange"
          >
            <option value="">Select entity type</option>
            {entityTypes.map((et) => (
              <option key={et.value} value={et.value}>
                {et.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={formData.entityId}
            onChange={(e) =>
              setFormData({ ...formData, entityId: e.target.value })
            }
            placeholder="Entity ID (if known)"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kauvex-orange focus:border-kauvex-orange"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Submit Report
        </Button>
      </div>
    </form>
  );
}
