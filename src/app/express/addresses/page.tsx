"use client";

import { useState } from "react";
import { MapPin, Plus, Edit3, Trash2, Star, Home, Building2 } from "lucide-react";

const ADDRESSES = [
  { id: 1, label: "Office", name: "John Doe", address: "123 Victoria Island, Lagos", phone: "+234 801 234 5678", type: "pickup", default: true },
  { id: 2, label: "Warehouse", name: "Doe Business Ltd", address: "45 Ikeja Industrial Layout, Lagos", phone: "+234 802 345 6789", type: "pickup", default: false },
  { id: 3, label: "Home", name: "John Doe", address: "78 Lekki Phase 1, Lagos", phone: "+234 803 456 7890", type: "delivery", default: true },
  { id: 4, label: "Branch Office", name: "Doe Business Ltd", address: "12 Abuja, Wuse 2", phone: "+234 804 567 8901", type: "delivery", default: false },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(ADDRESSES);

  const pickupAddresses = addresses.filter((a) => a.type === "pickup");
  const deliveryAddresses = addresses.filter((a) => a.type === "delivery");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0A1628]">Addresses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your saved pickup and delivery addresses</p>
        </div>
        <button className="bg-[#FF6B00] hover:bg-[#e55f00] text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Home className="w-4 h-4" /> Pickup Addresses ({pickupAddresses.length})
          </h2>
          <div className="space-y-3">
            {pickupAddresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-xl border p-4 ${addr.default ? "border-[#FF6B00]/30" : "border-gray-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#FF6B00]/10 rounded-lg flex items-center justify-center mt-0.5">
                      <MapPin className="w-4 h-4 text-[#FF6B00]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0A1628]">{addr.label}</span>
                        {addr.default && <span className="text-[10px] bg-[#FF6B00] text-white px-1.5 py-0.5 rounded-full font-medium">DEFAULT</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{addr.name}</p>
                      <p className="text-xs text-gray-500">{addr.address}</p>
                      <p className="text-xs text-gray-500">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Delivery Addresses ({deliveryAddresses.length})
          </h2>
          <div className="space-y-3">
            {deliveryAddresses.map((addr) => (
              <div key={addr.id} className={`bg-white rounded-xl border p-4 ${addr.default ? "border-[#FF6B00]/30" : "border-gray-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#0A1628]/10 rounded-lg flex items-center justify-center mt-0.5">
                      <MapPin className="w-4 h-4 text-[#0A1628]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0A1628]">{addr.label}</span>
                        {addr.default && <span className="text-[10px] bg-[#0A1628] text-white px-1.5 py-0.5 rounded-full font-medium">DEFAULT</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{addr.name}</p>
                      <p className="text-xs text-gray-500">{addr.address}</p>
                      <p className="text-xs text-gray-500">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Edit"><Edit3 className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
