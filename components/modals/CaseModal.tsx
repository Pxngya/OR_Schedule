"use client";

export default function CaseModal({
    isOpen,
    onClose,
    formData,
    setFormData,
    handleChange,
    handleSave,
    editingCase,
    currentUser,
    handleDeleteCase,
}: any) {

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-2 md:p-4 overflow-y-auto">
            <div className="bg-[#fdfbf2] border border-gray-200 rounded-2xl shadow-2xl w-full max-w-5xl p-4 md:p-8 relative my-8 md:my-auto flex flex-col">
                <h2 className="text-xl md:text-3xl font-black text-center mb-6 md:mb-8 bg-[#f3eff4] py-2 md:py-3 rounded-xl shadow-sm text-[#4a2b38] border border-gray-200">{editingCase ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูล'}</h2>

                {/* 🚀 จัดเรียง Layout ของฟอร์มใหม่ทั้งหมด เพื่อความสมดุลและสวยงาม */}
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-5">

                    {/* แถวที่ 1: วันที่ | เวลา */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">วันที่ผ่าตัด</label><input type="date" name="surgeryDate" value={formData.surgeryDate} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" required /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เวลา / OR</label>
                        <div className="flex w-full sm:flex-1 gap-2 items-center">
                            {/* 🚀 ระบบเลือกเวลา / เคส TF */}
                            {formData.time === 'tf' || formData.time === 'TF' ? (
                                <div className="border border-gray-300 p-2 flex-1 bg-gray-100 rounded-lg text-center font-bold text-gray-500">TF</div>
                            ) : (
                                <input type="time" name="time" value={formData.time} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono font-bold" required={formData.time !== 'tf' && formData.time !== 'TF'} />
                            )}
                            <label className="flex items-center gap-1.5 text-sm font-bold text-[#b88bc9] whitespace-nowrap cursor-pointer bg-white px-2 py-1.5 border border-gray-300 rounded-lg shadow-sm">
                                <input type="checkbox" className="w-4 h-4 accent-[#b88bc9]" checked={formData.time === 'tf' || formData.time === 'TF'} onChange={(e) => setFormData({ ...formData, time: e.target.checked ? 'tf' : '' })} />
                                เคส TF
                            </label>
                            <select name="room" value={formData.room || '1'} onChange={handleChange} className="border border-gray-300 p-2 w-24 sm:w-28 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold cursor-pointer">
                                {[1, 2, 3, 4, 5, 6, 'นอกสถานที่'].map(r => <option key={r} value={r}>{r === 'นอกสถานที่' ? 'นอกสถานที่' : `OR ${r}`}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* แถวที่ 2: HN | ชื่อ */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">HN</label><input type="text" name="hn" value={formData.hn} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono" required /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ชื่อ-สกุล</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold text-[#4a2b38]" required /></div>

                    {/* แถวที่ 3: อายุ | สถานะผู้ป่วย (ปลดกรอบขาว/พื้นหลังออกแล้ว กลืนไปกับฟอร์ม) */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">อายุ</label><input type="text" name="age" value={formData.age} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                        <label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">สถานะ</label>
                        <select name="patientStatus" value={formData.patientStatus || ''} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold cursor-pointer">
                            <option value="">-- ไม่ระบุ --</option>
                            <option value="In OR">In OR</option>
                            <option value="Send to">Send to </option>
                            <option value="Recovery">Recovery </option>
                            <option value="Discharge">Discharge </option>
                        </select>
                    </div>

                    {/* แถวที่ 4: Surgeon | Team */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Surgeon</label><input type="text" name="surgeon" value={formData.surgeon} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Team</label><input type="text" name="team" value={formData.team} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>

                    {/* แถวที่ 5: Operation (ขยายเต็มบรรทัด) */}
                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base sm:mt-2">Operation</label><textarea name="operation" value={formData.operation} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-16 resize-none"></textarea></div>

                    {/* แถวที่ 6: เครื่องมือพิเศษ (ขยายเต็มบรรทัด เพราะอาจจะยาว) */}
                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เครื่องมือพิเศษ</label><input type="text" name="specialEquipment" value={formData.specialEquipment} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>

                    {/* แถวที่ 7: Type Anesth | Anesth */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Type of Anesth</label><input type="text" name="typeOfAnesth" value={formData.typeOfAnesth} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Anesthesiologist</label><input type="text" name="anesthesiologist" value={formData.anesthesiologist} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>

                    {/* แถวที่ 8: วันจอง | เวลารับเซ็ต */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Date of Booking</label><input type="date" name="dateOfBooking" value={formData.dateOfBooking} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เวลารับ Set</label><input type="time" name="timeReceiveSet" value={formData.timeReceiveSet} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>

                    {/* แถวที่ 9: ผู้จอง | ผู้รับจอง */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ผู้จอง</label><input type="text" name="booker" value={formData.booker} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ผู้รับจอง</label><input type="text" name="receiver" value={formData.receiver} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>

                    {/* แถวที่ 10: หมายเหตุ (ขยายเต็มบรรทัด) */}
                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base sm:mt-2">หมายเหตุ</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-16 resize-none"></textarea></div>

                    {/* ตัวเลือกสถานะยืนยัน/เลื่อน/ยกเลิก */}
                    {editingCase && (
                        <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center gap-4 sm:gap-10 mt-4 md:mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <label className="flex items-center gap-2 cursor-pointer font-black text-green-600 text-lg md:text-xl"><input type="radio" name="status" value="ยืนยัน" checked={formData.status === 'ยืนยัน'} onChange={handleChange} className="accent-green-600 w-5 h-5 md:w-6 md:h-6" /> ยืนยันผ่าตัด</label>
                            <label className="flex items-center gap-2 cursor-pointer font-black text-yellow-500 text-lg md:text-xl"><input type="radio" name="status" value="เลื่อนวัน" checked={formData.status === 'เลื่อนวัน'} onChange={handleChange} className="accent-yellow-500 w-5 h-5 md:w-6 md:h-6" /> เลื่อนวัน</label>
                            <label className="flex items-center gap-2 cursor-pointer font-black text-red-500 text-lg md:text-xl"><input type="radio" name="status" value="ยกเลิก" checked={formData.status === 'ยกเลิก'} onChange={handleChange} className="accent-red-500 w-5 h-5 md:w-6 md:h-6" /> ยกเลิกเคส</label>
                        </div>
                    )}

                    <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center mt-6 gap-3 sm:gap-4">
                        <button type="submit" className="bg-[#d4b4dd] text-[#4a2b38] px-8 md:px-12 py-3 rounded-full text-lg md:text-xl hover:bg-[#c29bce] font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent w-full sm:w-auto">บันทึก</button>
                        {editingCase && currentUser?.role === 'admin' && <button type="button" onClick={() => handleDeleteCase(editingCase._id)} className="bg-red-500 text-white px-8 py-3 rounded-full text-lg md:text-xl hover:bg-red-600 font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent w-full sm:w-auto">ลบข้อมูล</button>}
                        <button type="button" onClick={onClose} className="mt-2 sm:mt-0 sm:ml-4 text-gray-400 hover:text-gray-700 font-bold cursor-pointer text-base md:text-lg underline underline-offset-4 decoration-2 transition-colors">ปิด/ยกเลิก</button>
                    </div>
                </form>
            </div>
        </div>
    );
}