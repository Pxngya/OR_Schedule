// /components/NurseTab.tsx
"use client";

type NurseTabProps = {
  nurseLogs: any[];
  handleOpenNurseModal: (log: any | null) => void;
  handleDeleteCase: (id: string, isNurse?: boolean) => void;
};

export default function NurseTab({
  nurseLogs,
  handleOpenNurseModal,
  handleDeleteCase,
}: NurseTabProps) {
  return (
    <div className="flex justify-center mt-2">
      <div className="bg-white border border-gray-300 shadow-md rounded-xl overflow-hidden w-full max-w-3xl mb-10">
        {nurseLogs.length > 0 ? (
          nurseLogs.map((log) => (
            <div
              key={log._id}
              className="relative cursor-pointer hover:bg-[#fffdfa] transition-colors"
              onClick={() => handleOpenNurseModal(log)}
            >
              <table className="w-full text-left border-collapse text-base md:text-lg">
                <tbody>
                  <tr className="border-b border-gray-100">
                    <th className="bg-[#fffaf5] p-3 md:p-4 text-[#4a2b38] w-1/3 border-r border-gray-100 text-right pr-6 md:pr-8">
                      Inc.
                    </th>
                    <td className="p-3 md:p-4 font-black text-[#4a2b38] pl-6 md:pl-8">
                      {log.inc || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="bg-[#fffaf5] p-3 md:p-4 text-[#4a2b38] w-1/3 border-r border-gray-100 text-right pr-6 md:pr-8">
                      Call
                    </th>
                    <td className="p-3 md:p-4 font-black text-[#4a2b38] pl-6 md:pl-8">
                      {log.call || "-"}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <th className="bg-[#fffaf5] p-3 md:p-4 text-[#4a2b38] w-1/3 border-r border-gray-100 text-right pr-6 md:pr-8">
                      บ.
                    </th>
                    <td className="p-3 md:p-4 font-black text-[#4a2b38] pl-6 md:pl-8">
                      {log.b || "-"}
                    </td>
                  </tr>
                  <tr>
                    <th className="bg-[#fffaf5] p-3 md:p-4 text-[#4a2b38] w-1/3 border-r border-gray-100 text-right pr-6 md:pr-8">
                      บ/ด
                    </th>
                    <td className="p-3 md:p-4 font-black text-[#4a2b38] pl-6 md:pl-8">
                      {log.bd || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="bg-gray-50 p-2 md:p-3 flex justify-between items-center border-t border-gray-200">
                <span className="text-xs text-gray-500 font-bold ml-2 md:ml-4">
                  * คลิกที่บริเวณตารางเพื่อแก้ไขข้อมูล
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCase(log._id, true);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-100 hover:bg-red-200 px-4 py-1.5 rounded-lg shadow-sm transition-colors mr-2"
                >
                  ลบข้อมูล
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 md:p-16 text-center flex flex-col items-center justify-center gap-3">
            <span className="text-5xl">📋</span>
            <span className="text-gray-400 font-bold text-lg md:text-xl">
              ยังไม่มีข้อมูลตาราง On call ในวันนี้
            </span>
            <button
              onClick={() => handleOpenNurseModal(null)}
              className="mt-2 bg-[#ffdac1] text-[#4a2b38] text-sm px-6 py-2 rounded-full font-bold hover:bg-[#facba8] shadow-sm transition-transform hover:scale-105"
            >
              เพิ่มข้อมูล On call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}