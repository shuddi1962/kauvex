"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  disabled?: boolean;
}

const speechSupported =
  typeof window !== "undefined" &&
  ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

export default function VoiceSearchButton({
  onResult,
  disabled = false,
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // already stopped
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      setErrorMsg("Voice search is not supported in your browser");
      return;
    }

    setErrorMsg(null);
    setIsListening(true);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setErrorMsg("Voice search is not supported in your browser");
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.item(0)?.transcript || "";
      if (transcript) {
        onResult(transcript);
      }
      stopListening();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") {
        setErrorMsg("No speech detected. Please try again.");
      } else if (event.error === "aborted") {
        // user cancelled, don't show error
      } else {
        setErrorMsg(`Voice error: ${event.error}`);
      }
      stopListening();
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, stopListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // already stopped
        }
      }
    };
  }, []);

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isListening
            ? "bg-red text-white animate-pulse shadow-lg shadow-red/30"
            : "text-text-3 hover:text-text-1 hover:bg-gray-100"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={isListening ? "Stop listening" : "Search by voice"}
        aria-label={isListening ? "Stop voice search" : "Start voice search"}
      >
        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
      </button>

      {isListening && (
        <div className="absolute -top-1 -right-1 w-3 h-3">
          <span className="animate-ping absolute inset-0 rounded-full bg-red opacity-75" />
          <span className="absolute inset-0 rounded-full bg-red" />
        </div>
      )}

      {errorMsg && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-border rounded-lg shadow-md px-3 py-2 text-xs text-red whitespace-nowrap z-50">
          {errorMsg}
        </div>
      )}
    </div>
  );
}
