"use client";

import { useMemo } from "react";

export const useTVBoard = (
  tvDisplayCases: any[],
  isTVMode: boolean
) => {
  return useMemo(() => {
    let activeCases: any[] = [];

    if (isTVMode) {
      const pinkCases = tvDisplayCases.filter(
        c =>
          c.patientStatus === "In OR" ||
          c.patientStatus === "Send to"
      );

      activeCases = pinkCases.slice(0, 4);
    }

    const inOrCount = tvDisplayCases.filter(
      c =>
        c.patientStatus === "In OR" ||
        c.patientStatus === "Send to"
    ).length;

    const recoveryCount = tvDisplayCases.filter(
      c => c.patientStatus === "Recovery"
    ).length;

    const dischargeCount = tvDisplayCases.filter(
      c => c.patientStatus === "Discharge"
    ).length;

    return {
      activeCases,
      inOrCount,
      recoveryCount,
      dischargeCount,
    };
  }, [tvDisplayCases, isTVMode]);
};