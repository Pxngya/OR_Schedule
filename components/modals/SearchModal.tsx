"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  globalSearchQuery: string;
  searchResults: any[];

  handleOpenModal: (data: any) => void;
  formatHN: (hn: string) => string;
};

export default function SearchModal({
  isOpen,
  onClose,
  globalSearchQuery,
  searchResults,
  handleOpenModal,
  formatHN,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-[300] p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-4 md:p-6 relative flex flex-col my-8 md:my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-lg md:text-2xl font-bold text-[#4a2b38] truncate pr-4">
            🔍 ผลการค้นหา: "{globalSearchQuery}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-gray-50 flex-1 max-h-[60vh]">
          <table className="w-full text-xs md:text-sm text-center border-collapse min-w-[700px]">
            
            <thead className="bg-[#b6d7d8] sticky top-0 shadow-sm z-10">
              <tr className="text-[#4a2b38]">
                <th className="p-2 md:p-3 border border-gray-300">วันที่</th>
                <th className="p-2 md:p-3 border border-gray-300">เวลา</th>
                <th className="p-2 md:p-3 border border-gray-300 text-blue-800">OR</th>
                <th className="p-2 md:p-3 border border-gray-300">HN</th>
                <th className="p-2 md:p-3 border border-gray-300 text-left">ชื่อ-สกุล</th>
                <th className="p-2 md:p-3 border border-gray-300 text-left">Operation</th>
                <th className="p-2 md:p-3 border border-gray-300">สถานะ</th>
              </tr>
            </thead>

            <tbody>
              {searchResults.length > 0 ? (
                searchResults.map((c, i) => (
                  <tr
                    key={i}
                    className={`border-b border-gray-200 hover:bg-[#fdfbf2] cursor-pointer transition-colors ${
                      c.status === 'ยกเลิก'
                        ? 'bg-red-50'
                        : c.status === 'เลื่อนวัน'
                        ? 'bg-yellow-50'
                        : 'bg-white'
                    }`}
                    onClick={() => {
                      onClose();
                      handleOpenModal(c);
                    }}
                  >
                    <td className="p-2 md:p-3 border border-gray-200 font-bold text-gray-700 whitespace-nowrap">
                      {c.date} {c.monthYear}
                    </td>

                    <td className="p-2 md:p-3 border border-gray-200 font-black text-[#b88bc9] whitespace-nowrap">
                      {c.time === 'tf' || c.time === 'TF' ? 'TF' : c.time}
                    </td>

                    <td className="p-2 md:p-3 border border-gray-200 font-black text-blue-700">
                      {c.room || '1'}
                    </td>

                    <td className="p-2 md:p-3 border border-gray-200 font-mono whitespace-nowrap">
                      {formatHN(c.hn)}
                    </td>

                    <td className="p-2 md:p-3 border border-gray-200 text-left font-bold text-[#4a2b38] whitespace-nowrap">
                      {c.name}
                    </td>

                    <td className="p-2 md:p-3 border border-gray-200 text-left text-gray-600 truncate max-w-[150px]">
                      {c.operation}
                    </td>

                    <td
                      className={`p-2 md:p-3 border border-gray-200 font-bold whitespace-nowrap ${
                        c.status === 'ยืนยัน'
                          ? 'text-green-600'
                          : c.status === 'เลื่อนวัน'
                          ? 'text-yellow-600'
                          : !c.status
                          ? 'text-gray-400'
                          : 'text-red-600'
                      }`}
                    >
                      • {c.status || 'รอระบุ'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="p-10 md:p-12 text-gray-400 text-base md:text-xl font-bold bg-white"
                  >
                    ไม่พบประวัติผู้ป่วยชื่อนี้ในระบบ 🏥
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs md:text-sm text-gray-500 font-medium">
          * คลิกที่รายชื่อเพื่อเปิดดู หรือแก้ไขรายละเอียดทั้งหมด
        </div>
      </div>
    </div>
  );
}