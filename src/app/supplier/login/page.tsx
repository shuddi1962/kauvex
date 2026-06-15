"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupplierLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1628] to-[#1a2a4a] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0A1628]">Supplier Login</h1>
          <p className="text-gray-500 mt-2">Access your Kauvex supplier dashboard</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-[#FF6B00]" />
          </div>
          <Button className="w-full bg-[#FF6B00] hover:bg-[#e86000] h-11">Sign In</Button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Not registered? <Link href="/supplier/register" className="text-[#FF6B00] font-medium hover:underline">Apply now</Link>
        </p>
      </div>
    </div>
  );
}
