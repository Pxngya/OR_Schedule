"use client";

import { formatHN } from "@/lib/utils";

export const useGlobalSearch = ({
  globalSearchQuery,
  setSearchResults,
  setIsSearchModalOpen,
  setIsSearching,
}: any) => {

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!globalSearchQuery.trim()) return;

    setIsSearching(true);

    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        const query = globalSearchQuery.trim().toLowerCase();

        const filtered = data.data.filter((c: any) => {
          if (c.isNurseLog) return false;

          const cleanHN = formatHN(c.hn).toLowerCase();
          const name = String(c.name || "").toLowerCase();

          return (
            name.includes(query) ||
            cleanHN.includes(query) ||
            String(c.hn).toLowerCase().includes(query)
          );
        });

        filtered.sort((a: any, b: any) => {
          return (
            new Date(
              `${a.monthYear}-${String(a.date).padStart(2, "0")}T${
                a.time || "00:00"
              }`
            ).getTime() -
            new Date(
              `${b.monthYear}-${String(b.date).padStart(2, "0")}T${
                b.time || "00:00"
              }`
            ).getTime()
          );
        });

        setSearchResults(filtered);
        setIsSearchModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    }

    setIsSearching(false);
  };

  return {
    handleGlobalSearch,
  };
};