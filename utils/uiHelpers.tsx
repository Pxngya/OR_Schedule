import React from "react";

export const tvThClass =
  "border border-gray-300 p-2 text-sm lg:text-base font-black whitespace-nowrap text-[#4a2b38] bg-[#f3eff4] sticky top-0 z-10";

export const normThClass =
  "border border-gray-300 p-2 px-4 whitespace-nowrap text-[#4a2b38] bg-[#f3eff4] sticky top-0 z-10";

export const renderStatusDot = (status: string) => {
  if (status === "In OR" || status === "Send to") {
    return (
      <span className="inline-block w-4 h-4 rounded-full bg-[#ff9a9e] shadow-sm animate-pulse mx-auto"></span>
    );
  }

  if (status === "Recovery") {
    return (
      <span className="inline-block w-4 h-4 rounded-full bg-[#f6d365] shadow-sm mx-auto"></span>
    );
  }

  if (status === "Discharge") {
    return (
      <span className="inline-block w-4 h-4 rounded-full bg-[#84e3c8] shadow-sm mx-auto"></span>
    );
  }

  return null;
};