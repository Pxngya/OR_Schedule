"use client";

export default function NurseModal({
  isOpen,
  onClose,
  nurseFormData,
  handleNurseChange,
  handleSaveNurseForm,
  editingNurseLog,
}: any) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-[#facba8] rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col my-8 md:my-auto">

        <div className="absolute top-0 left-0 w-full h-3 bg-[#ffdac1] rounded-t-2xl"></div>

        <h2 className="text-2xl font-black text-center mb-6 mt-2 text-[#4a2b38]">
          {editingNurseLog ? 'แก้ไขตาราง On call' : 'บันทึกตาราง On call'}
        </h2>

        <form onSubmit={handleSaveNurseForm} className="space-y-4">

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">วันที่บันทึก</label>
            <input
              type="date"
              name="nurseDate"
              value={nurseFormData.nurseDate}
              onChange={handleNurseChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none font-bold text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Inc.</label>
            <input
              type="text"
              name="inc"
              value={nurseFormData.inc}
              onChange={handleNurseChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Call</label>
            <input
              type="text"
              name="call"
              value={nurseFormData.call}
              onChange={handleNurseChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">บ.</label>
            <input
              type="text"
              name="b"
              value={nurseFormData.b}
              onChange={handleNurseChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">บ/ด</label>
            <input
              type="text"
              name="bd"
              value={nurseFormData.bd}
              onChange={handleNurseChange}
              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#ffdac1] hover:bg-[#facba8] text-[#4a2b38] py-3 rounded-xl font-black shadow-md transition-transform hover:scale-105"
            >
              💾 บันทึก
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors"
            >
              ยกเลิก
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}