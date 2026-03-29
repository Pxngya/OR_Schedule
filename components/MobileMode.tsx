"use client";

import { useEffect, useMemo, useState } from "react";

interface Case {
  _id?: string;
  room?: string;
  patientStatus?: string;
  name?: string;
  hn?: string;
  operation?: string;
  surgeon?: string;
  time?: string;
}

interface NurseLog {
  inc?: string;
  call?: string;
  b?: string;
  bd?: string;
  anesthIn?: string;
  anesthOut?: string;
}

interface MobileModeProps {
  tvDisplayCases: Case[];
  todaysNurseLog: NurseLog;

  renderStatusDot: (status?: string) => React.ReactNode;
  formatHN: (hn?: string) => string;
  setStatusUpdateCase: (c: Case) => void;
  setIsStatusModalOpen: (v: boolean) => void;
  isViewer: boolean;
}

export default function MobileMode({
  tvDisplayCases,
  todaysNurseLog,
  renderStatusDot,
  formatHN,
  setStatusUpdateCase,
  setIsStatusModalOpen,
  isViewer,
}: MobileModeProps) {
  const [filter, setFilter] = useState<
    "ALL" | "In OR" | "Call" | "Recovery" | "Discharge"
  >("ALL");

  const [time, setTime] = useState("");

  // ⏱ clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 📊 counts
  const inOrCount = tvDisplayCases.filter(c => c.patientStatus === "In OR").length;
  const callCount = tvDisplayCases.filter(c => c.patientStatus === "Call").length;
  const recoveryCount = tvDisplayCases.filter(c => c.patientStatus === "Recovery").length;
  const dischargeCount = tvDisplayCases.filter(c => c.patientStatus === "Discharge").length;

  // 🔍 filter
  const filteredCases = useMemo(() => {
    if (filter === "ALL") return tvDisplayCases;
    return tvDisplayCases.filter(c => c.patientStatus === filter);
  }, [filter, tvDisplayCases]);

  // 🎨 สี
  const getBorderColor = (status?: string) => {
    switch (status) {
      case "In OR":
        return "border-l-[#ff9a9e]";
      case "Call":
        return "border-l-gray-500";
      case "Recovery":
        return "border-l-[#f6d365]";
      case "Discharge":
        return "border-l-[#84e3c8]";
      default:
        return "border-l-gray-200";
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#f9f6f7] pb-4">

      {/* 🔥 HEADER */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm px-3 py-2 space-y-2">

        <div className="flex justify-between items-center">
          <div className="font-black text-[#4a2b38] text-sm">
            แผนกผ่าตัด รพ.กรุงเทพอุดร
          </div>
          <div className="text-xs font-mono text-gray-500">
            {time}
          </div>
        </div>

        {/* 📊 SUMMARY */}
        <div className="flex flex-wrap gap-3 text-xs font-bold">

          <span className="text-gray-500">
            ทั้งหมด {tvDisplayCases.length}
          </span>

          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#ff9a9e] animate-pulse"></span>
            In OR {inOrCount}
          </span>

          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-500"></span>
            Call {callCount}
          </span>

          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f6d365]"></span>
            Recovery {recoveryCount}
          </span>

          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#84e3c8]"></span>
            Discharge {dischargeCount}
          </span>
        </div>

        {/* 🎛 FILTER */}
        <div className="flex gap-2 overflow-x-auto">
          {["ALL", "In OR", "Call", "Recovery", "Discharge"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-2 py-1 rounded-lg text-xs font-bold border whitespace-nowrap
                ${filter === f
                  ? "bg-[#4a2b38] text-white border-[#4a2b38]"
                  : "bg-white text-gray-500 border-gray-200"}
              `}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* 🏥 OR STATUS (เหมือน TV) */}
      <div className="p-2 grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6"].map(r => {
          const activeCase = tvDisplayCases.find(
            c => c.room === r && (c.patientStatus === "In OR" || c.patientStatus === "Call")
          );

          return (
            <div
              key={r}
              className={`rounded-xl border text-center p-2 shadow-sm
              ${activeCase
                  ? "bg-[#fff0f1] border-[#ff9a9e] text-[#b04a50]"
                  : "bg-white border-gray-200 text-gray-400"}
              `}
            >
              <div className="font-bold text-sm">OR {r}</div>
              <div className="text-xs font-black">
                {activeCase ? "กำลังผ่าตัด" : "ว่าง"}
              </div>
            </div>
          );
        })}
      </div>

      {/* 📝 NURSE LOG */}
      <div className="mx-2 mb-2 bg-[#fffaf5] border border-[#facba8] rounded-xl p-3 text-xs font-bold text-[#4a2b38] space-y-1">

        <div>Inc: {todaysNurseLog?.inc || "-"}</div>

        <div>Call: {todaysNurseLog?.call || "-"}</div>

        <div>วิสัญญี (ใน): {todaysNurseLog?.anesthIn || "-"}</div>

        <div>วิสัญญี (นอก): {todaysNurseLog?.anesthOut || "-"}</div>

        {/* 👉 แถวเดียว */}
        <div className="flex gap-4">
          <div>บ: {todaysNurseLog?.b || "-"}</div>
          <div>บ/ด: {todaysNurseLog?.bd || "-"}</div>
        </div>

      </div>

      {/* 📋 LIST */}
      <div className="p-2 space-y-2">
        {filteredCases.map((c, index) => (
          <div
            key={c._id || index}
            onClick={() => {
              if (isViewer) return;
              setStatusUpdateCase(c);
              setIsStatusModalOpen(true);
            }}
            className={`bg-white rounded-xl shadow-sm border border-gray-200 border-l-[6px] ${getBorderColor(c.patientStatus)} p-3 space-y-2 
${!isViewer ? "active:scale-[0.97] cursor-pointer" : "opacity-90 cursor-default"}
`}
          >
            {/* TOP */}
            <div className="flex justify-between">

              <span className="font-black text-blue-700 text-sm">
                OR {c.room || "-"}
              </span>
              <span className="text-[10px] text-gray-400">
                🕒 {c.time || "-"}
              </span>


              {/* {renderStatusDot(c.patientStatus)} */}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderStatusDot(c.patientStatus)}
                <span className="font-black text-[#4a2b38]">
                  {c.name || "-"}
                </span>
              </div>

              <span className="text-[10px] text-gray-400">
                {/* 🕒 {c.time || "-"} */}
              </span>
            </div>

            <div className="text-xs text-gray-500 font-mono">
              HN: {formatHN(c.hn)}
            </div>

            <div className="bg-[#fdf7f9] rounded px-2 py-1 text-sm font-semibold">
              {c.operation || "-"}
            </div>

            <div className="flex justify-between text-xs text-gray-600">
              <span>👨‍⚕️ {c.surgeon || "-"}</span>
              {!isViewer && (
                <span className="text-[10px] text-gray-400">
                  tap เพื่ออัปเดต
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center text-gray-400 mt-10 text-sm">
            ไม่มีเคส
          </div>
        )}
      </div>
    </div>
  );
}