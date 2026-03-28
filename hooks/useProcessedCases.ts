"use client";

import { useMemo } from "react";

export const useProcessedCases = (cases: any[]) => {
  return useMemo(() => {
    if (!cases || cases.length === 0) {
      return {
        rawMainCases: [],
        nurseLogs: [],
        todaysNurseLog: {},
        displayCases: [],
        tvDisplayCases: [],
      };
    }

    const rawMainCases = cases.filter(c => !c.isNurseLog);
    const nurseLogs = cases.filter(c => c.isNurseLog);
    const todaysNurseLog = nurseLogs[0] || {};

    const standardCases = rawMainCases.filter(
      c => c.time && c.time !== "tf" && c.time !== "TF"
    );

    const tfCases = rawMainCases.filter(
      c => c.time === "tf" || c.time === "TF"
    );

    // 🔹 sort ตามเวลา + ห้อง
    standardCases.sort((a, b) => {
      const timeA = a.time || "23:59";
      const timeB = b.time || "23:59";

      if (timeA === timeB) {
        return String(a.room || "1").localeCompare(String(b.room || "1"));
      }

      return timeA.localeCompare(timeB);
    });

    // 🔹 จำเคสสุดท้ายของ surgeon
    const lastCaseBySurgeon: Record<string, any> = {};

    standardCases.forEach((c, index) => {
      if (c.surgeon) {
        lastCaseBySurgeon[c.surgeon.trim()] = {
          time: c.time,
          index,
        };
      }
    });

    const displayCases = [...standardCases];

    // 🔹 insert tf cases ต่อท้าย surgeon เดิม
    tfCases.forEach(tf => {
      const surgeon = tf.surgeon ? tf.surgeon.trim() : "";
      const match = lastCaseBySurgeon[surgeon];

      if (match) {
        const insertIndex = displayCases.findIndex(
          c => c === standardCases[match.index]
        );

        let finalIndex = insertIndex + 1;

        while (
          finalIndex < displayCases.length &&
          (displayCases[finalIndex].time === "tf" ||
            displayCases[finalIndex].time === "TF") &&
          displayCases[finalIndex].surgeon === surgeon
        ) {
          finalIndex++;
        }

        displayCases.splice(finalIndex, 0, tf);
      } else {
        displayCases.push(tf);
      }
    });

    const tvDisplayCases = displayCases.filter(
      c => c.status === "ยืนยัน"
    );

    return {
      rawMainCases,
      nurseLogs,
      todaysNurseLog,
      displayCases,
      tvDisplayCases,
    };
  }, [cases]);
};