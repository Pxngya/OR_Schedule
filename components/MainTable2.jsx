import React from 'react';

const MainTable = ({
  displayCases,
  normThClass,
  handleOpenModal,
  renderStatusDot,
  formatHN,
  handleQuickStatusUpdate,
  setStatusUpdateCase,
  setIsStatusModalOpen,
  setIsPostponeModalOpen
}) => {

  const toggleStatus = (current, target) => {
    // ❌ กดซ้ำ → ปิดสถานะ
    if (current === target) return '';

    // 🚨 ยกเลิก → ถามครั้งเดียวพอ แล้วจบเลย
    if (target === 'ยกเลิก') {
      const ok = confirm('⚠️ ต้องการ "ยกเลิกเคส" ใช่หรือไม่?');
      return ok ? 'ยกเลิก' : current;
    }

    // 🔁 เปลี่ยนสถานะอื่น (เช่น ยืนยัน)
    if (current && current !== target) {
      const ok = confirm('ต้องการเปลี่ยนสถานะหรือไม่?');
      if (!ok) return current;
    }

    return target;
  };

  return (
    <>
      <div className="bg-white border border-gray-300 shadow-md min-h-0 flex flex-col overflow-x-auto rounded-b-xl w-full">
        <table className="w-full text-center border-collapse min-w-[1200px]">
          <thead>
            <tr>
              <th className={`${normThClass} w-16 bg-status-cancel`}>
                ยกเลิก<br />
                {displayCases.filter(c => c.status === 'ยกเลิก').length}
              </th>
              <th className={`${normThClass} w-16 bg-status-postpone`}>
                เลื่อน<br />
                {displayCases.filter(c => c.status === 'เลื่อนวัน').length}
              </th>
              <th className={`${normThClass} w-16 bg-status-confirm`}>
                ยืนยัน<br />
                {displayCases.filter(c => c.status === 'ยืนยัน').length}
              </th>
              <th className={normThClass}>คิว</th>
              <th className={normThClass}>เวลา</th>
              <th className={`${normThClass} text-blue-800`}>OR</th>
              <th className={`${normThClass} w-12`}>สถานะ</th>
              <th className={`${normThClass} min-w-[200px]`}>ชื่อ-สกุล</th>
              <th className={normThClass}>อายุ</th>
              <th className={normThClass}>HN</th>
              <th className={`${normThClass} min-w-[200px]`}>Operation</th>
              <th className={`${normThClass} min-w-[150px]`}>Surgeon</th>
              <th className={`${normThClass} min-w-[150px]`}>เครื่องมือพิเศษ</th>
              <th className={normThClass}>Type Anesth</th>
              <th className={normThClass}>Anesth.</th>
              <th className={normThClass}>Date Book</th>
              <th className={normThClass}>เวลารับ Set</th>
              <th className={normThClass}>ผู้จอง</th>
              <th className={normThClass}>ผู้รับจอง</th>
              <th className={`${normThClass} min-w-[200px]`}>หมายเหตุ</th>
            </tr>
          </thead>

          <tbody>
            {displayCases.map((c, index) => (
              <tr
                key={c._id || index}
                onClick={() => handleOpenModal(c)}
                className={`border-b border-gray-300 cursor-pointer ${c.status === 'ยกเลิก'
                  ? 'bg-red-50 opacity-50'
                  : c.status === 'เลื่อนวัน'
                    ? 'bg-yellow-50 opacity-50'
                    : !c.status
                      ? 'bg-gray-50 text-gray-500'
                      : 'hover:bg-[#fdfaf2]'
                  }`}
              >
                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatusUpdate(c, toggleStatus(c.status, 'ยกเลิก'));
                  }}
                  className="border-r border-gray-300 font-bold text-red-600 py-3 cursor-pointer hover:bg-red-100"
                >
                  {c.status === 'ยกเลิก' ? '✓' : ''}
                </td>

                <td
                  onClick={(e) => {
                    e.stopPropagation();

                    setStatusUpdateCase(c);

                    if (c.status !== 'เลื่อนวัน') {
                      setIsPostponeModalOpen(true);
                    } else {
                      handleQuickStatusUpdate(c, '');
                    }
                  }}
                  className="border-r border-gray-300 font-bold text-yellow-600 py-3 cursor-pointer hover:bg-yellow-100"
                >
                  {c.status === 'เลื่อนวัน' ? '✓' : ''}
                </td>

                <td
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatusUpdate(c, toggleStatus(c.status, 'ยืนยัน'));
                  }}
                  className="border-r border-gray-300 font-bold text-green-600 py-3 cursor-pointer hover:bg-green-100"
                >
                  {c.status === 'ยืนยัน' ? '✓' : ''}
                </td>
                <td className="border-r border-gray-300 py-3">{index + 1}</td>
                <td className="border-r border-gray-300 font-black px-2 text-[#b88bc9] py-3">
                  {c.time?.toLowerCase() === 'tf' ? 'TF' : c.time}
                </td>
                <td className="border-r border-gray-300 text-blue-700 font-black py-3">
                  {['1', '2', '3', '4', '5', '6'].includes(String(c.room))
                    ? `OR ${c.room}`
                    : c.room}
                </td>
                <td
                  onClick={(e) => {
                    e.stopPropagation(); // ❗ กันไม่ให้เปิด modal หลัก
                    setStatusUpdateCase(c);
                    setIsStatusModalOpen(true);
                  }}
                  className="border-r border-gray-300 py-3 cursor-pointer hover:bg-gray-100"
                >
                  {renderStatusDot(c.patientStatus)}
                </td>
                <td className="border-r border-gray-300 text-left font-bold px-3 py-3">
                  {c.name}
                </td>
                <td className="border-r border-gray-300 py-3">{c.age}</td>
                <td className="border-r border-gray-300 font-mono py-3">
                  {formatHN(c.hn)}
                </td>
                <td className="border-r border-gray-300 text-left px-3 py-3">
                  {c.operation}
                </td>
                <td className="border-r border-gray-300 px-3 py-3">
                  {c.surgeon}
                </td>
                <td className="border-r border-gray-300 px-3 py-3">
                  {c.specialEquipment}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.typeOfAnesth}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.anesthesiologist}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.dateOfBooking}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.timeReceiveSet}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.booker}
                </td>
                <td className="border-r border-gray-300 py-3">
                  {c.receiver}
                </td>
                <td className="border-r border-gray-300 text-left text-gray-500 px-3 py-3">
                  {c.remarks}
                </td>
              </tr>
            ))}

            {[...Array(Math.max(0, 10 - displayCases.length))].map((_, i) => (
              <tr
                key={i}
                onClick={() => handleOpenModal()} // ✅ เพิ่มตรงนี้
                className="border-b border-gray-300 bg-white h-12 cursor-pointer hover:bg-[#fdfaf2]"
              >
                {[...Array(20)].map((_, j) => (
                  <td key={j} className="border-r border-gray-300"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center mt-3 text-xs md:text-sm font-bold text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff9a9e]"></span>
          In OR
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-gray-500"></span>
          Call
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#f6d365]"></span>
          Recovery
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#84e3c8]"></span>
          Discharge
        </div>
      </div>
    </>
  );
};

export default MainTable;