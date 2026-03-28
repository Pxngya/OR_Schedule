"use client";
import { useState } from "react";

export const useDashboardState = (
  setIsDashboardOpen: any,
  setIsSpeedDialOpen: any
) => {

  const [dashboardTab, setDashboardTab] = useState("daily");
  const [allDashboardCases, setAllDashboardCases] = useState<any[]>([]);

  const handleOpenDashboard = async () => {
    setIsDashboardOpen(true);
    setIsSpeedDialOpen(false);
    setDashboardTab("daily");

    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setAllDashboardCases(
          data.data.filter((c: any) => !c.isNurseLog)
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return {
    dashboardTab,
    setDashboardTab,
    allDashboardCases,
    setAllDashboardCases,
    handleOpenDashboard,
  };
};