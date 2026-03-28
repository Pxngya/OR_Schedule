"use client";

import { useMemo } from "react";

export const useDashboard = ({
  isDashboardOpen,
  allDashboardCases,
  dashboardTab,
  currentMonthYear,
  selectedDate,
}: any) => {

  const dashCases = useMemo(() => {
    if (!isDashboardOpen || !allDashboardCases?.length) return [];

    try {
      if (dashboardTab === "daily") {
        return allDashboardCases.filter(
          (c: any) =>
            c.monthYear === currentMonthYear &&
            c.date === selectedDate
        );
      }

      if (dashboardTab === "monthly") {
        return allDashboardCases.filter(
          (c: any) => c.monthYear === currentMonthYear
        );
      }

      if (dashboardTab === "yearly") {
        const year = currentMonthYear
          ? currentMonthYear.split("-")[0]
          : new Date().getFullYear().toString();

        return allDashboardCases.filter((c: any) =>
          String(c.monthYear || "").startsWith(year)
        );
      }

      if (dashboardTab === "weekly") {
        const selD = new Date(
          `${currentMonthYear}-${String(selectedDate).padStart(
            2,
            "0"
          )}T12:00:00`
        );

        if (isNaN(selD.getTime())) return [];

        const day = selD.getDay();
        const diffToMon =
          selD.getDate() - day + (day === 0 ? -6 : 1);

        const startOfWeek = new Date(selD);
        startOfWeek.setDate(diffToMon);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return allDashboardCases.filter((c: any) => {
          if (!c.monthYear || !c.date) return false;

          const cDate = new Date(
            `${c.monthYear}-${String(c.date).padStart(
              2,
              "0"
            )}T12:00:00`
          );

          return cDate >= startOfWeek && cDate <= endOfWeek;
        });
      }

      return [];
    } catch (error) {
      console.error("Dashboard calculation error:", error);
      return [];
    }
  }, [
    isDashboardOpen,
    allDashboardCases,
    dashboardTab,
    currentMonthYear,
    selectedDate,
  ]);

  return { dashCases };
};