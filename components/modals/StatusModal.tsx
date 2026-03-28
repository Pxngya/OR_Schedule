"use client";

export default function StatusModal({
  isOpen,
  onClose,
  statusUpdateCase,
  handleUpdatePatientStatus,
}: any) {

  if (!isOpen || !statusUpdateCase) return null;

  const handleClick = (status: string) => {
    handleUpdatePatientStatus(status);
    onClose(); // 🔥 ปิด modal อัตโนมัติหลังเลือก
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up border-t-[10px] border-[#d4b4dd]">

        {/* ❌ ปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-black text-2xl"
        >
          ✕
        </button>

        <h2 className="text-2xl font-black text-center mb-1 text-[#4a2b38]">
          อัปเดตสถานะ
        </h2>

        <div className="text-center text-gray-500 mb-6 font-bold text-lg">
          คุณ {statusUpdateCase.name}
        </div>

        <div className="grid grid-cols-1 gap-3">

          <button
            onClick={() => handleClick('In OR')}
            className="bg-[#fff0f1] hover:bg-[#ffe0e2] border-2 border-[#ff9a9e] text-[#b04a50] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span className="w-5 h-5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span>
            In OR
          </button>

          <button
            onClick={() => handleClick('Send to')}
            className="bg-[#fff0f1] hover:bg-[#ffe0e2] border-2 border-[#ff9a9e] text-[#b04a50] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span className="w-5 h-5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span>
            Send to
          </button>

          <button
            onClick={() => handleClick('Recovery')}
            className="bg-[#fffdf0] hover:bg-[#fff9d1] border-2 border-[#f6d365] text-[#b39535] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span className="w-5 h-5 rounded-full bg-[#f6d365] shadow-sm"></span>
            Recovery
          </button>

          <button
            onClick={() => handleClick('Discharge')}
            className="bg-[#f0fcf9] hover:bg-[#d8f7ee] border-2 border-[#84e3c8] text-[#2c7560] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105"
          >
            <span className="w-5 h-5 rounded-full bg-[#84e3c8] shadow-sm"></span>
            Discharge
          </button>

          <button
            onClick={() => handleClick('')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold text-lg mt-2 transition-colors border-2 border-transparent"
          >
            🔄 เคลียร์สถานะ (ตั้งเป็นค่าว่าง)
          </button>

        </div>
      </div>
    </div>
  );
}