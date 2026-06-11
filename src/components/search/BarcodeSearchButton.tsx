"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Scan, X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeSearchButtonProps {
  onSearch: (code: string) => void;
  disabled?: boolean;
}

export default function BarcodeSearchButton({
  onSearch,
  disabled = false,
}: BarcodeSearchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"scan" | "manual">("scan");
  const [manualCode, setManualCode] = useState("");
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<any>(null);
  const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      try {
        readerRef.current.reset();
      } catch {
        // ignore
      }
      readerRef.current = null;
    }
    setScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    setScanning(true);

    try {
      // Dynamically import @zxing/browser to avoid SSR issues
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      setHasCamera(true);

      // Poll for barcode detection every 500ms
      scanTimerRef.current = setInterval(async () => {
        if (!videoRef.current || !readerRef.current) return;
        try {
          const result = await readerRef.current.decodeOnceFromVideoDevice(
            null,
            videoRef.current
          );
          if (result?.getText()) {
            stopCamera();
            setIsOpen(false);
            onSearch(result.getText());
          }
        } catch {
          // no barcode found in this frame, keep scanning
        }
      }, 500);
    } catch (err: any) {
      if (err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access or enter the code manually.");
      } else if (err?.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError("Failed to access camera. Try entering the code manually.");
      }
      setHasCamera(false);
      setScanning(false);
    }
  }, [stopCamera, onSearch]);

  const handleOpen = () => {
    setIsOpen(true);
    setMode("scan");
    setManualCode("");
    setError(null);
    setHasCamera(null);
    setTimeout(() => startCamera(), 100);
  };

  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setError(null);
    setManualCode("");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = manualCode.trim();
    if (code) {
      stopCamera();
      setIsOpen(false);
      onSearch(code);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className="p-2 rounded-lg text-text-3 hover:text-text-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Search by barcode"
        aria-label="Open barcode scanner"
      >
        <Scan size={18} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-strong w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text-1">
                Scan Barcode
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-text-3 hover:text-text-1 transition-colors"
                aria-label="Close scanner"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tab: Scan / Manual */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setMode("scan")}
                className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
                  mode === "scan"
                    ? "text-blue border-b-2 border-blue"
                    : "text-text-3 hover:text-text-1"
                }`}
              >
                <Camera size={14} className="inline mr-1.5" />
                Scan
              </button>
              <button
                onClick={() => {
                  setMode("manual");
                  stopCamera();
                }}
                className={`flex-1 py-2.5 text-sm font-medium text-center transition-colors ${
                  mode === "manual"
                    ? "text-blue border-b-2 border-blue"
                    : "text-text-3 hover:text-text-1"
                }`}
              >
                Manual Entry
              </button>
            </div>

            {/* Scanner View */}
            {mode === "scan" && (
              <div className="p-5">
                <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Viewfinder overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/2 border-2 border-white/60 rounded-lg" />
                  </div>

                  {!hasCamera && hasCamera !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white text-sm px-6 text-center">
                      <div>
                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Camera unavailable</p>
                      </div>
                    </div>
                  )}

                  {scanning && hasCamera !== false && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                      <Loader2 size={12} className="animate-spin" />
                      Scanning...
                    </div>
                  )}
                </div>

                {error && (
                  <p className="mt-3 text-xs text-red text-center">{error}</p>
                )}

                <p className="mt-3 text-xs text-text-4 text-center">
                  Point your camera at a barcode or QR code to search
                </p>
              </div>
            )}

            {/* Manual Entry */}
            {mode === "manual" && (
              <form onSubmit={handleManualSubmit} className="p-5">
                {error && (
                  <p className="mb-3 text-xs text-red">{error}</p>
                )}
                <label className="block text-xs font-medium text-text-3 mb-1.5">
                  Enter barcode / SKU / EAN
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 9781234567890"
                    className="flex-1 h-10 px-3 rounded-lg border border-border bg-white text-sm text-text-1 placeholder:text-text-4 focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue transition-shadow"
                    autoFocus
                  />
                  <Button type="submit" size="sm">
                    Search
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
