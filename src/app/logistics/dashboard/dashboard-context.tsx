"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type TabId = "available" | "active" | "history" | "earnings" | "performance" | "fuel" | "settings";

interface DashboardContextValue {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  activeTab: "available",
  setActiveTab: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabId>("available");
  return (
    <DashboardContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
