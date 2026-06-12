"use client";

import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    fetch("/api/docs/spec")
      .then((r) => r.json())
      .then(setSpec)
      .catch(() => {});
  }, []);

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">KAUVEX API v1</h1>
          <p className="text-sm text-gray-500 mt-1">REST API documentation for the Kauvex Commerce Cloud platform.</p>
        </div>
        <SwaggerUI spec={spec} />
      </div>
    </div>
  );
}
