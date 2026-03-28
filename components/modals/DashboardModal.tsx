"use client";

export default function DashboardModal({
  isOpen,
  onClose,
  dashboardTab,
  setDashboardTab,
  dashCases,
}: any) {

  if (!isOpen) return null;

  const confirmed = dashCases.filter((c: any) => c.status === 'ยืนยัน');
  const postponed = dashCases.filter((c: any) => c.status === 'เลื่อนวัน');
  const cancelled = dashCases.filter((c: any) => c.status === 'ยกเลิก');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#fdfbf2] border border-[#fbc2eb] rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 relative flex flex-col my-8 md:my-auto">

        <h2 className="text-xl md:text-3xl font-black text-center mb-4 text-[#4a2b38] bg-[#fbc2eb] py-2 rounded-xl shadow-sm">
          Dashboard
        </h2>

        {/* 🔘 Tabs */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#f3eff4] p-1.5 rounded-full flex flex-wrap justify-center gap-1 sm:gap-2 shadow-inner text-sm md:text-base">

            {[
              { key: 'daily', label: 'รายวัน' },
              { key: 'weekly', label: 'รายสัปดาห์' },
              { key: 'monthly', label: 'รายเดือน' },
              { key: 'yearly', label: 'รายปี' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setDashboardTab(tab.key)}
                className={`px-4 sm:px-6 py-1.5 rounded-full font-bold transition-all ${
                  dashboardTab === tab.key
                    ? 'bg-white text-[#b88bc9] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}

          </div>
        </div>

        {/* 📊 Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          <Card title="เคสทั้งหมด" value={dashCases.length} />

          <Card title="ยืนยันแล้ว" value={confirmed.length} color="green" />

          <Card title="เลื่อนวัน" value={postponed.length} color="yellow" />

          <Card title="ยกเลิก" value={cancelled.length} color="red" />

        </div>

        {/* 🏥 OR */}
        <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 border-b pb-2">
          OR
        </h3>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center">
          {['1', '2', '3', '4', '5', '6', 'นอกสถานที่'].map(r => {
            const roomCount = confirmed.filter((c: any) => c.room === r).length;

            return (
              <div key={r} className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                <div className="text-[10px] md:text-xs font-bold text-gray-400">
                  {r === 'นอกสถานที่' ? 'นอก' : `OR ${r}`}
                </div>
                <div className="text-xl md:text-3xl font-black text-[#b88bc9]">
                  {roomCount}
                </div>
              </div>
            );
          })}
        </div>

        {/* ❌ Close */}
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold transition-colors w-full sm:w-auto"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}

/* 🔹 Reusable Card */
function Card({ title, value, color }: any) {
  const colorMap: any = {
    green: 'bg-[#f0fcf9] border-[#84e3c8] text-[#3ab795]',
    yellow: 'bg-[#fffdf0] border-[#f6d365] text-[#e5b835]',
    red: 'bg-[#fff0f1] border-[#ff9a9e] text-[#e85a62]',
  };

  return (
    <div className={`p-4 rounded-xl shadow-sm border text-center ${colorMap[color] || 'bg-white border-gray-200 text-[#4a2b38]'}`}>
      <div className="text-gray-500 font-bold text-sm">{title}</div>
      <div className="text-3xl md:text-5xl font-black">{value}</div>
    </div>
  );
}