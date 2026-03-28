"use client";

export default function TVMode({
    tvDisplayCases,
    activeCases,
    inOrCount,
    recoveryCount,
    dischargeCount,
    currentMonthYear,
    selectedDate,
    setCurrentMonthYear,
    setSelectedDate,
    currentTimeText,
    todaysNurseLog,
    tvThClass,
    renderStatusDot,
    formatHN,
    setStatusUpdateCase,
    setIsStatusModalOpen
}) {
    return (
        <>
            <div className="flex justify-between items-center shrink-0 h-[5vh] px-2 mt-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-black text-[#4a2b38] bg-or-header px-3 py-1 rounded-lg shadow-sm border border-gray-200">แผนกผ่าตัด รพ.กรุงเทพอุดร</h1>
                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm flex items-center gap-3">
                        <div className="flex items-center gap-2 border-r pr-3">
                            <span className="text-[10px] font-bold text-gray-500">เคสวันนี้</span>
                            <span className="text-base font-black text-green-600">{tvDisplayCases.length}</span>
                        </div>
                        <div className="flex items-center gap-3 pl-1">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff9a9e]"></span><span className="text-sm font-black text-[#4a2b38]">{inOrCount}</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f6d365]"></span><span className="text-sm font-black text-[#4a2b38]">{recoveryCount}</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#84e3c8]"></span><span className="text-sm font-black text-[#4a2b38]">{dischargeCount}</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors">
                        <input
                            type="date"
                            value={`${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val) {
                                    const [y, m, d] = val.split('-');
                                    setCurrentMonthYear(`${y}-${m}`);
                                    setSelectedDate(parseInt(d, 10));
                                }
                            }}
                            className="text-xs font-bold text-gray-500 bg-transparent border-none outline-none cursor-pointer"
                        />
                        <span className="text-lg font-black text-[#4a2b38] font-mono tracking-widest">{currentTimeText}</span>
                    </div>
                    <button onClick={() => window.close()} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-colors cursor-pointer">❌ ปิด</button>
                </div>
            </div>

            <div className="flex gap-2 px-2 shrink-0 h-[26vh] min-h-0">

                <div className="w-[60%] flex gap-2 min-h-0">
                    {activeCases.length === 0 && (
                        <div className="flex-1 bg-[#fcfafb] border border-dashed border-gray-200 rounded-xl flex items-center justify-center opacity-50 min-h-0 shadow-sm">
                            <span className="text-gray-300 text-2xl font-bold">ยังไม่มีเคสเข้าผ่าตัด (In OR)</span>
                        </div>
                    )}
                    {activeCases.length === 1 && (
                        <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col border-l-[12px] border-l-[#ff9a9e] overflow-y-auto min-h-0">
                            <div className="flex justify-between items-center mb-2 shrink-0">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ff9a9e] rounded-full animate-pulse shadow-sm"></div><span className="text-lg font-black text-[#b04a50]">กำลังผ่าตัด (In OR)</span></div>
                                <div className="bg-[#fff0f1] text-[#b04a50] text-sm font-black px-3 py-1 rounded-lg border border-[#ff9a9e]">{activeCases[0].room === 'นอกสถานที่' ? 'นอกสถานที่' : `OR ${activeCases[0].room || '1'}`}</div>
                            </div>
                            <div className="text-2xl font-black text-[#4a2b38] leading-tight mb-2 shrink-0 whitespace-normal break-words">คุณ {activeCases[0].name}</div>
                            <div className="flex-1 flex flex-col justify-around gap-1 border-t border-gray-100 pt-2 min-h-0">
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Op</span><span className="text-base font-bold text-gray-800 truncate max-w-[70%] text-right">{activeCases[0].operation || '-'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Surgeon</span><span className="text-base font-bold text-gray-800 truncate max-w-[70%] text-right">{activeCases[0].surgeon || '-'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Team</span><span className="text-base font-bold text-gray-700 truncate max-w-[70%] text-right">{activeCases[0].team || '-'}</span></div>
                            </div>
                        </div>
                    )}
                    {activeCases.length > 1 && (
                        <div className="w-full grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
                            {activeCases.map((ac, idx) => (
                                <div key={idx} className="bg-white border border-gray-200 shadow-sm rounded-xl p-2.5 flex flex-col border-l-[6px] border-l-[#ff9a9e] overflow-hidden min-h-0">
                                    <div className="flex justify-between items-center mb-1 shrink-0">
                                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#ff9a9e] rounded-full animate-pulse shadow-sm"></div><span className="text-[11px] lg:text-[13px] font-black text-[#b04a50]">กำลังผ่าตัด</span></div>
                                        <div className="bg-[#fff0f1] text-[#b04a50] text-[10px] lg:text-[11px] font-black px-1.5 py-0.5 rounded border border-[#ff9a9e]">{ac.room === 'นอกสถานที่' ? 'นอก' : `OR ${ac.room || '1'}`}</div>
                                    </div>
                                    <div className="text-sm lg:text-base font-black text-[#4a2b38] truncate mb-1 shrink-0">คุณ {ac.name}</div>
                                    <div className="flex-1 flex flex-col justify-center gap-1 border-t border-gray-100 pt-1.5 mt-auto shrink-0">
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400 shrink-0">Surgeon/Team</span><span className="text-[11px] font-bold text-gray-800 text-right truncate pl-2">{ac.surgeon || '-'}{ac.team ? ` (${ac.team})` : ''}</span></div>
                                    </div>
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - activeCases.length))].map((_, i) => (
                                <div key={`empty-w-${i}`} className="bg-[#fcfafb] border border-dashed border-gray-200 rounded-xl flex items-center justify-center opacity-50 min-h-0"><span className="text-gray-300 text-xs font-bold">รอคิวผ่าตัด</span></div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-[40%] flex flex-col gap-2 min-h-0">
                    <div className="flex-1 grid grid-cols-6 gap-1.5 min-h-0">
                        {['1', '2', '3', '4', '5', '6'].map(r => {
                            const activeCase = tvDisplayCases.find(c => c.room === r && (c.patientStatus === 'In OR' || c.patientStatus === 'Send to'));
                            return (
                                <div key={r} className={`flex flex-col justify-center items-center text-center w-full rounded-xl border transition-colors shadow-sm min-h-0 ${activeCase ? 'bg-[#fff0f1] border-[#ff9a9e] text-[#b04a50]' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <div className="text-2xl font-bold opacity-80 uppercase w-full text-center">OR {r}</div>
                                    <div className={`text-2xl lg:text-base font-black w-full text-center ${activeCase ? '' : 'text-[#3ab795]'}`}>{activeCase ? 'กำลังผ่าตัด' : 'ว่าง'}</div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex-1 bg-[#fffaf5] border border-[#facba8] rounded-xl shadow-sm p-3 flex flex-col justify-around min-h-0 overflow-y-auto hide-scrollbar">
                        <div className="flex items-start gap-2 mb-1">
                            <span className="text-2xl lg:text-xs font-bold text-gray-500 w-8 shrink-0">Inc.</span>
                            <span className="text-2xl lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.inc || '-'}</span>
                        </div>
                        <div className="flex items-start gap-2 mb-1">
                            <span className="text-2xl lg:text-xs font-bold text-gray-500 w-8 shrink-0">Call</span>
                            <span className="text-2xl lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.call || '-'}</span>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="flex items-start gap-2 flex-1">
                                <span className="text-2xl lg:text-xs font-bold text-gray-500 shrink-0">บ.</span>
                                <span className="text-2xl lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.b || '-'}</span>
                            </div>
                            <div className="flex items-start gap-2 flex-1">
                                <span className="text-2xl lg:text-xs font-bold text-gray-500 shrink-0">บ/ด</span>
                                <span className="text-2xl lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.bd || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 bg-white border border-gray-300 shadow-md rounded-xl overflow-hidden flex flex-col mx-2 mt-2 min-h-0">
                <div className="overflow-y-auto flex-1 hide-scrollbar">
                    <table className="w-full text-center border-collapse">
                        <thead>
                            <tr>
                                <th className={`${tvThClass} w-16 text-blue-800`}>OR</th>
                                <th className={`${tvThClass} w-20 text-purple-800`}>เวลา</th>
                                <th className={`${tvThClass} w-12`}>สถานะ</th>
                                <th className={`${tvThClass} w-[18%]`}>ชื่อ-สกุล</th>
                                <th className={`${tvThClass} w-20`}>HN</th>
                                <th className={`${tvThClass} w-[12%]`}>เครื่องมือพิเศษ</th>
                                <th className={`${tvThClass} w-[15%]`}>Operation</th>
                                <th className={`${tvThClass} w-[12%]`}>Surgeon</th>
                                <th className={`${tvThClass} w-[8%]`}>Anesth</th>
                                <th className={`${tvThClass} w-[8%]`}>Type</th>
                                <th className={`${tvThClass} w-[10%]`}>Team</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tvDisplayCases.map((c, index) => (
                                <tr key={c._id || index} className="border-b border-gray-200 hover:bg-[#fefafc] transition-colors cursor-pointer" onClick={() => { setStatusUpdateCase(c); setIsStatusModalOpen(true); }}>
                                    <td className="border-r border-gray-200 font-black text-blue-700 text-2xl lg:text-base whitespace-nowrap py-3">{c.room === 'นอกสถานที่' ? 'นอก' : c.room}</td>
                                    <td className="border-r border-gray-200 font-black text-[#b88bc9] text-2xl lg:text-base whitespace-nowrap py-3">{c.time === 'tf' || c.time === 'TF' ? 'TF' : c.time}</td>
                                    <td className="border-r border-gray-200 text-center align-middle py-3">{renderStatusDot(c.patientStatus)}</td>
                                    <td className="border-r border-gray-200 text-left px-3 font-black text-base lg:text-lg break-words py-3 leading-snug">{c.name}</td>
                                    <td className="border-r border-gray-200 font-mono text-2xl lg:text-base whitespace-nowrap py-3">{formatHN(c.hn)}</td>
                                    <td className="border-r border-gray-200 text-2xl lg:text-sm px-3 break-words py-3 leading-snug">{c.specialEquipment}</td>
                                    <td className="border-r border-gray-200 text-left text-2xl lg:text-sm px-3 break-words py-3 leading-snug">{c.operation}</td>
                                    <td className="border-r border-gray-200 text-2xl lg:text-sm px-3 break-words py-3 leading-snug">{c.surgeon}</td>
                                    <td className="border-r border-gray-200 text-2xl lg:text-sm px-2 whitespace-nowrap py-3">{c.anesthesiologist}</td>
                                    <td className="border-r border-gray-200 text-2xl lg:text-sm px-2 whitespace-nowrap py-3">{c.typeOfAnesth}</td>
                                    <td className="border-r border-gray-200 text-[#4a2b38] text-2xl lg:text-sm px-3 break-words py-3 leading-snug">{c.team}</td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 10 - tvDisplayCases.length))].map((_, rowIndex) => (
                                <tr key={`empty-${rowIndex}`} className="border-b border-gray-100 bg-white h-12 lg:h-14">
                                    {[...Array(11)].map((_, colIndex) => <td key={colIndex} className="border-r border-gray-100"></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="shrink-0 flex flex-wrap gap-4 items-center justify-center pt-1 pb-1 text-[13px] font-bold text-gray-500">
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span> In OR / Send to</div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#f6d365] shadow-sm"></span> Recovery</div>
                <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#84e3c8] shadow-sm"></span> Discharge</div>
            </div>
        </>
    );
}