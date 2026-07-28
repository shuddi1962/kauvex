import { Suspense } from "react";
import RegisterPage from "./_components/RegisterPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" /></div>}>
      <RegisterPage />
    </Suspense>
  );
}