"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ExpressError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Express Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#0A1628] mb-2">Something went wrong</h2>
        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400 mb-4 font-mono">Error: {error.digest}</p>
        )}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#FF6B00] hover:bg-[#e55f00] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
          <Link
            href="/express/dashboard/overview"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
