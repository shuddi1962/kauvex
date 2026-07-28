"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center px-6 py-12">
      <div className="flex flex-col items-center text-center max-w-md">
        <svg
          viewBox="0 0 100 100"
          className="w-20 h-20 mb-8"
          aria-hidden="true"
        >
          <rect width="100" height="100" rx="20" fill="#0A1628" />
          <path
            d="M30 15 h12 v26 l30-26 h14 l-32 35 32 35 h-14 l-30-26 v26 h-12 z"
            fill="#FF6B00"
          />
        </svg>

        <h1 className="text-2xl font-bold text-white mb-3">
          You&apos;re offline
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          It looks like you&apos;ve lost your connection. Please check your
          internet and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] hover:bg-[#FF8C3A] text-white font-semibold rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Try again
        </button>
      </div>
    </div>
  );
}
