export default function HeaderBar({
  currentUser,
  exportToExcel,
  currentMonthYear,
  fetchEmployees,
  setEmployees,
  setIsAdminModalOpen,
  handleLogout,

  displayCases,
  activeTab,
  setActiveTab,

  currentMonthYearValue,
  setCurrentMonthYear,

  handleGlobalSearch,
  globalSearchQuery,
  setGlobalSearchQuery,
  isSearching
}) {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="bg-or-header rounded-2xl p-3 md:p-4 shadow-sm inline-block border border-gray-200 w-full md:w-auto text-center md:text-left">
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#4a2b38]">
            ตารางผ่าตัด แผนกผ่าตัดโรงพยาบาลกรุงเทพอุดร
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
          <div className="text-sm px-2 w-full text-center md:w-auto md:text-left mb-1 md:mb-0">
            ผู้ใช้:{" "}
            <span className="font-bold text-[#b88bc9]">
              {currentUser.name || currentUser.empId}
            </span>{" "}
            <span className="text-xs text-gray-400 ml-1">
              ({currentUser.role})
            </span>
          </div>

          <button
            onClick={() => exportToExcel(currentMonthYear)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 flex-1 md:flex-none justify-center"
          >
            📥 Excel
          </button>

          {currentUser.role === "admin" && (
            <button
              onClick={() => {
                fetchEmployees(setEmployees);
                setIsAdminModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 flex-1 md:flex-none justify-center"
            >
              ⚙️ แอดมิน
            </button>
          )}

          <button
            onClick={handleLogout}
            className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer border border-gray-200 flex-1 md:flex-none justify-center"
          >
            ออกระบบ
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 px-2 md:px-4 text-base md:text-xl font-medium gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            จำนวนเคสจองวันนี้{" "}
            <span className="text-red-600 text-2xl md:text-3xl font-bold mx-2">
              {displayCases.length}
            </span>{" "}
            เคส
          </div>

          <div className="bg-gray-200 p-1 rounded-full flex gap-1 shadow-inner text-sm md:text-base">
            <button
              onClick={() => setActiveTab("main")}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                activeTab === "main"
                  ? "bg-white text-[#b88bc9] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ตาราง
            </button>

            <button
              onClick={() => setActiveTab("oncall")}
              className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                activeTab === "oncall"
                  ? "bg-[#fffaf5] text-[#d9905b] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              On call
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <input
            type="month"
            value={currentMonthYearValue}
            onChange={(e) => setCurrentMonthYear(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1 bg-white h-[38px] shadow-sm w-full sm:w-auto text-base"
          />

          <form
            onSubmit={handleGlobalSearch}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <input
              type="text"
              placeholder="ค้นหา HN หรือ ชื่อคนไข้"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              className="border border-[#d4b4dd] rounded-full px-5 py-1 w-full sm:w-64 md:w-72 bg-[#fdfbf2] focus:outline-none focus:ring-2 focus:ring-[#c29bce] text-base h-[38px] shadow-sm"
            />

            <button
              type="submit"
              className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-5 h-[38px] rounded-full text-base font-bold shadow-md transition-colors whitespace-nowrap"
            >
              {isSearching ? "..." : "ค้นหา"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}