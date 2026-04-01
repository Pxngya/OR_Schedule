"use client";

import { formatHN } from "@/lib/utils";
import { sendLineNotify } from "@/services/scheduleService";

export const useCaseActions = ({
  formData,
  editingCase,
  nurseFormData,
  editingNurseLog,
  statusUpdateCase,
  currentUser,
  fetchCases,
  setIsModalOpen,
  setIsSearchModalOpen,
  setIsNurseModalOpen,
  setIsStatusModalOpen,
  setStatusUpdateCase,
  setEditingNurseLog,
}: any) => {

  // 🚀 ฟังก์ชันช่วยสร้าง Format ข้อความ LINE
  const buildLineMessage = (actionType: string, caseData: any) => {
    let finalDate = caseData.surgeryDate;
    if (!finalDate && caseData.monthYear && caseData.date) {
      finalDate = `${caseData.monthYear}-${String(caseData.date).padStart(2, "0")}`;
    }

    const timeStr = caseData.time === "tf" || caseData.time === "TF" ? "TF" : caseData.time || "-";
    const roomStr = caseData.room || "1";
    const patientName = caseData.name || "ไม่ระบุชื่อ";
    const userName = currentUser?.name || currentUser?.empId || "ไม่ระบุตัวตน";
    return `\nผู้ทำรายการ: ${userName} [${actionType}]\nวันที่ ${finalDate || "-"}\nเวลา ${timeStr} OR ${roomStr}\nคุณ ${patientName}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [year, month, day] = formData.surgeryDate.split("-");
      const newMonthYear = `${year}-${month}`;
      const newDateNum = parseInt(day, 10);

      // ดึงข้อมูลวัน/เวลาเดิม
      const oldDateStr = editingCase && editingCase.monthYear && editingCase.date
          ? `${editingCase.monthYear}-${String(editingCase.date).padStart(2, "0")}`
          : "";
      const oldTimeStr = editingCase ? editingCase.time : "";

      const payloadData = {
        ...formData,
        hn: formatHN(formData.hn),
        room: formData.room || "1",
        actionBy: currentUser.name || currentUser.empId,
      };

      // 🎯 เช็คว่ามีการ "เปลี่ยนวัน" หรือ "เปลี่ยนเวลา" หรือไม่?
      // (ถ้าเป็นการ "เพิ่มใหม่" ค่า editingCase จะเป็น null ทำให้เงื่อนไขนี้เป็น false ทันที)
      const isDateChanged = editingCase && formData.surgeryDate !== oldDateStr;
      const isTimeChanged = editingCase && formData.time !== oldTimeStr;

      if (editingCase && formData.status === "เลื่อนวัน" && isDateChanged) {
        // อัปเดตเคสเก่าเป็นเลื่อนวัน
        await fetch("/api/cases", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingCase,
            status: "เลื่อนวัน",
            actionBy: currentUser.name || currentUser.empId,
          }),
        });

        // สร้างเคสวันใหม่
        const payloadNew = {
          ...payloadData,
          date: newDateNum,
          monthYear: newMonthYear,
          status: "ยืนยัน",
        };
        delete payloadNew._id;

        await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadNew),
        });

        // 🚨 แจ้งเตือน: กรณีเลื่อนวัน
        sendLineNotify(buildLineMessage("เปลี่ยนวันผ่าตัด", payloadNew));

      } else {
        const payload: any = {
          ...payloadData,
          date: newDateNum,
          monthYear: newMonthYear,
        };

        const method = editingCase && editingCase._id ? "PUT" : "POST";
        if (method === "PUT") payload._id = editingCase._id;

        await fetch("/api/cases", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // 🚨 แจ้งเตือน: เฉพาะเคสเก่า(แก้ไข) + มีการเปลี่ยนวันหรือเวลา เท่านั้น!!
        if (editingCase && (isDateChanged || isTimeChanged)) {
            let actionMsg = "เปลี่ยนเวลาผ่าตัด";
            if (isDateChanged && isTimeChanged) actionMsg = "เปลี่ยนวันและเวลาผ่าตัด";
            else if (isDateChanged) actionMsg = "เปลี่ยนวันผ่าตัด";

            sendLineNotify(buildLineMessage(actionMsg, payload));
        }
      }

      setIsModalOpen(false);
      fetchCases();
    } catch (error) {
      console.error("Error saving case:", error);
    }
  };

  const handleDeleteCase = async (id: string, isNurseLog = false) => {
    if (!confirm(isNurseLog ? "ยืนยันการลบข้อมูลพยาบาลรายนี้?" : "ยืนยันการลบข้อมูลคนไข้รายนี้? \n(ลบแล้วไม่สามารถกู้คืนได้)")) return;

    try {
      const actionBy = encodeURIComponent(currentUser.name || currentUser.empId);
      const patientName = encodeURIComponent(editingCase?.name || (isNurseLog ? "Log พยาบาล" : "ไม่ทราบชื่อ"));

      const res = await fetch(`/api/cases?id=${id}&actionBy=${actionBy}&name=${patientName}`, { method: "DELETE" });

      if (res.ok) {
        // ❌ ไม่มีคำสั่งส่ง LINE ตรงนี้แล้ว
        setIsModalOpen(false);
        setIsSearchModalOpen(false);
        setIsNurseModalOpen(false);
        fetchCases();
      } else {
        alert("เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Error deleting case:", error);
    }
  };

  const handleUpdatePatientStatus = async (caseItem: any, newStatus: string) => {
    if (!caseItem) return;
    try {
      const payload = {
        ...caseItem,
        patientStatus: newStatus,
        actionBy: currentUser?.name || currentUser?.empId || "TV Update",
      };
      await fetch("/api/cases", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      fetchCases();
      // ❌ ไม่มีคำสั่งส่ง LINE ตรงนี้แล้ว
    } catch (error) { console.error("Error updating patient status:", error); }
  };

  const handleSaveNurseForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [year, month, day] = nurseFormData.nurseDate.split("-");
      const payload: any = {
        date: parseInt(day, 10), monthYear: `${year}-${month}`, inc: nurseFormData.inc, call: nurseFormData.call,
        b: nurseFormData.b, bd: nurseFormData.bd, anesthIn: nurseFormData.anesthIn, anesthOut: nurseFormData.anesthOut,
        isNurseLog: true, actionBy: currentUser.name || currentUser.empId,
      };
      const method = editingNurseLog ? "PUT" : "POST";
      if (editingNurseLog) payload._id = editingNurseLog._id;
      await fetch("/api/cases", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setIsNurseModalOpen(false); setEditingNurseLog(null); fetchCases();
    } catch (error) { console.error("Error saving nurse log:", error); }
  };

  const handleUpdateCaseStatus = async (caseItem: any, newStatus: string) => {
    if (!caseItem) return;
    try {
      const payload = {
        ...caseItem, status: newStatus, actionBy: currentUser?.name || currentUser?.empId || "TV Update",
      };
      await fetch("/api/cases", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      fetchCases();
      // ❌ ไม่มีคำสั่งส่ง LINE ตรงนี้แล้ว
    } catch (error) { console.error("Error updating case status:", error); }
  };

  const handlePostponeCase = async (caseItem: any, newDate: string) => {
    if (!caseItem) return;
    try {
      await fetch("/api/cases", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...caseItem, status: "เลื่อนวัน", actionBy: currentUser?.name || currentUser?.empId || "TV Update" }) });
      if (newDate) {
        const [year, month, day] = newDate.split("-");
        const newCase = { ...caseItem, date: parseInt(day), monthYear: `${year}-${month}`, status: "", actionBy: currentUser?.name || currentUser?.empId || "TV Update" };
        delete newCase._id;
        await fetch("/api/cases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newCase) });
        
        // 🚨 แจ้งเตือน: กรณีเปลี่ยนวันผ่านเมนูด่วน
        sendLineNotify(buildLineMessage("เปลี่ยนวันผ่าตัด", newCase));
      }
      fetchCases();
    } catch (err) { console.error(err); }
  };

  return { handleSave, handleDeleteCase, handleUpdatePatientStatus, handleUpdateCaseStatus, handleSaveNurseForm, handlePostponeCase };
};