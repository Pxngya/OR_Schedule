"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export const useScheduleCases = (
  currentUser: any,
  selectedDate: number,
  currentMonthYear: string,
  isTVMode: boolean
) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCases = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const data = await apiFetch(
        `/api/cases?date=${selectedDate}&monthYear=${currentMonthYear}`
      );

      if (data.success) {
        setCases(data.data);
      }
    } catch (error) {
      console.error("Error fetching cases:", error);
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก + เปลี่ยนวัน/เดือน
  useEffect(() => {
    fetchCases();
  }, [selectedDate, currentMonthYear, currentUser]);

  // TV mode sync ทุก 10 วิ
  useEffect(() => {
    if (isTVMode && currentUser) {
      const syncTimer = setInterval(() => fetchCases(), 10000);
      return () => clearInterval(syncTimer);
    }
  }, [isTVMode, currentUser, selectedDate, currentMonthYear]);

  return {
    cases,
    setCases,
    fetchCases,
    loading,
  };
};