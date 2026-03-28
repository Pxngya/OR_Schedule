"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;

  // state
  employees: any[];
  filteredEmployees: any[];
  currentUser: any;

  newEmpId: string;
  setNewEmpId: (v: string) => void;

  newEmpName: string;
  setNewEmpName: (v: string) => void;

  newEmpRole: string;
  setNewEmpRole: (v: string) => void;

  isEditingEmp: boolean;
  editingEmpDbId: string | null;

  empSearchQuery: string;
  setEmpSearchQuery: (v: string) => void;

  // handlers
  handleAddOrEditEmployee: (e: any) => void;
  handleEditEmpClick: (emp: any) => void;
  handleCancelEditEmp: () => void;
  handleDeleteEmployee: (id: string) => void;
};

export default function AdminModal({
  isOpen,
  onClose,

  employees,
  filteredEmployees,
  currentUser,

  newEmpId,
  setNewEmpId,
  newEmpName,
  setNewEmpName,
  newEmpRole,
  setNewEmpRole,

  isEditingEmp,
  editingEmpDbId,

  empSearchQuery,
  setEmpSearchQuery,

  handleAddOrEditEmployee,
  handleEditEmpClick,
  handleCancelEditEmp,
  handleDeleteEmployee,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-[300] p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 md:p-8 relative flex flex-col my-8 md:my-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 md:mb-6 border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#4a2b38]">
            ⚙️ จัดการสิทธิ์ผู้ใช้งาน (Admin)
          </h2>
          <button
            onClick={() => {
              onClose();
              setEmpSearchQuery('');
            }}
            className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleAddOrEditEmployee}
          className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 mb-4 md:mb-6 bg-[#fdfbf2] p-4 rounded-xl border border-gray-200 items-start sm:items-center"
        >
          <input
            type="text"
            value={newEmpId}
            onChange={(e) => setNewEmpId(e.target.value)}
            disabled={isEditingEmp}
            placeholder="รหัสพนักงาน"
            className={`w-full sm:w-[140px] text-center font-mono font-bold border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] ${
              isEditingEmp
                ? 'bg-gray-200 cursor-not-allowed text-gray-500'
                : 'bg-white'
            }`}
            required
          />

          <input
            type="text"
            value={newEmpName}
            onChange={(e) => setNewEmpName(e.target.value)}
            placeholder="ชื่อ-สกุล พนักงาน"
            className="w-full sm:flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd]"
            required
          />

          <select
            value={newEmpRole}
            onChange={(e) => setNewEmpRole(e.target.value)}
            className="w-full sm:w-[100px] border p-2 rounded-lg outline-none cursor-pointer bg-white"
          >
            <option value="user">พนักงาน</option>
            <option value="admin">แอดมิน</option>
          </select>

          <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            {isEditingEmp ? (
              <>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex-1 sm:flex-none"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditEmp}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex-1 sm:flex-none"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <button
                type="submit"
                className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-2 rounded-lg font-bold shadow-md transition-colors w-full sm:w-auto"
              >
                เพิ่ม
              </button>
            )}
          </div>
        </form>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 ค้นหารหัส หรือ ชื่อพนักงาน..."
            value={empSearchQuery}
            onChange={(e) => setEmpSearchQuery(e.target.value)}
            className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] bg-white shadow-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-white flex-1 min-h-[200px] max-h-[400px]">
          <table className="w-full text-sm text-center border-collapse min-w-[500px]">
            <thead className="bg-[#f3eff4] sticky top-0 shadow-sm z-10">
              <tr className="text-[#4a2b38]">
                <th className="p-3 border-b border-gray-300 w-[100px]">รหัส (ID)</th>
                <th className="p-3 border-b border-gray-300 text-left">ชื่อ-สกุล</th>
                <th className="p-3 border-b border-gray-300 w-[100px]">สิทธิ์</th>
                <th className="p-3 border-b border-gray-300 w-[140px]">จัดการ</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp._id}
                    className={`border-b border-gray-100 transition-colors ${
                      editingEmpDbId === emp._id
                        ? 'bg-[#f4ebf7] border-l-4 border-l-[#b88bc9]'
                        : 'hover:bg-[#fdfbf2]'
                    }`}
                  >
                    <td className="p-3 font-bold font-mono">{emp.empId}</td>

                    <td className="p-3 text-left">
                      {emp.name || 'ไม่ระบุ'}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          emp.role === 'admin'
                            ? 'bg-[#d4b4dd] text-[#4a2b38]'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {emp.role}
                      </span>
                    </td>

                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEditEmpClick(emp)}
                        className="text-blue-500 hover:text-blue-700 font-bold px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 shadow-sm text-sm"
                      >
                        แก้ไข
                      </button>

                      {emp.empId !== currentUser.empId && (
                        <button
                          onClick={() => handleDeleteEmployee(emp._id)}
                          className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm text-sm"
                        >
                          ลบ
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-gray-400 font-bold">
                    ไม่พบพนักงานที่ค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}