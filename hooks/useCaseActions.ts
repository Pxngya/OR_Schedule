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

  // 🚀 ฟังก์ชันช่วยสร้าง Format ข้อความ LINE ตามที่คุณ Pxngya ต้องการเป๊ะๆ
  const buildLineMessage = (actionType: string, caseData: any) => {
    // ดึงวันที่ (ถ้าไม่มีใน surgeryDate ให้ประกอบจาก monthYear และ date)
    let finalDate = caseData.surgeryDate;
    if (!finalDate && caseData.monthYear && caseData.date) {
      finalDate = `${caseData.monthYear}-${String(caseData.date).padStart(2, '0')}`;
    }

    const timeStr = caseData.time === "tf" || caseData.time === "TF" ? "TF" : caseData.time || "-";
    const roomStr = caseData.room || "1";
    const nameStr = caseData.name || "ไม่ระบุชื่อ";

    // ใส่ \n ไว้ข้างหน้าสุด 1 ตัว เพื่อไม่ให้บรรทัดแรกไปติดกับชื่อบอท
    return `\nผู้ทำรายการ ${actionType}\nวันที่ ${finalDate || "-"}\nเวลา ${timeStr} OR ${roomStr}\nคุณ ${nameStr}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [year, month, day] = formData.surgeryDate.split("-");
      const newMonthYear = `${year}-${month}`;
      const newDateNum = parseInt(day, 10);

      const oldDateStr =
        editingCase && editingCase.monthYear && editingCase.date
          ? `${editingCase.monthYear}-${String(editingCase.date).padStart(2, "0")}`
          : "";

      const payloadData = {
        ...formData,
        hn: formatHN(formData.hn),
        room: formData.room || "1",
        actionBy: currentUser.name || currentUser.empId,
      };

      // 🎯 วิเคราะห์ว่าผู้ใช้กำลังทำ "แอคชั่น" อะไรอยู่
      let currentAction = "เพิ่มรายการใหม่";
      if (editingCase) {
        if (formData.status === "ยืนยัน" && editingCase.status !== "ยืนยัน") {
          currentAction = "สถานะเคสยืนยัน";
        } else if (formData.status === "เลื่อนวัน" && editingCase.status !== "เลื่อนวัน") {
          currentAction = "เลื่อนวัน";
        } else if (formData.status === "ยกเลิก" && editingCase.status !== "ยกเลิก") {
          currentAction = "ยกเลิก";
        } else {
          currentAction = "อัพเดทข้อมูลคนไข้";
        }
      }

      if (
        editingCase &&
        formData.status === "เลื่อนวัน" &&
        formData.surgeryDate !== oldDateStr
      ) {
        await fetch("/api/cases", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...editingCase,
            status: "เลื่อนวัน",
            actionBy: currentUser.name || currentUser.empId,
          }),
        });

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

        // 🚀 ส่งแจ้งเตือน LINE เลื่อนวันผ่าตัด
        sendLineNotify(buildLineMessage("เลื่อนวัน", payloadNew));

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

        // 🚀 ส่งแจ้งเตือน LINE สำหรับเพิ่ม หรือ อัปเดตคิว
        sendLineNotify(buildLineMessage(currentAction, payload));
      }

      setIsModalOpen(false);
      fetchCases();
    } catch (error) {
      console.error("Error saving case:", error);
    }
  };

  const handleDeleteCase = async (id: string, isNurseLog = false) => {
    if (
      !confirm(
        isNurseLog
          ? "ยืนยันการลบข้อมูลพยาบาลรายนี้?"
          : "ยืนยันการลบข้อมูลคนไข้รายนี้? \n(ลบแล้วไม่สามารถกู้คืนได้)"
      )
    )
      return;

    try {
      const actionBy = encodeURIComponent(
        currentUser.name || currentUser.empId
      );

      const patientName = encodeURIComponent(
        editingCase?.name ||
        (isNurseLog ? "Log พยาบาล" : "ไม่ทราบชื่อ")
      );

      const res = await fetch(
        `/api/cases?id=${id}&actionBy=${actionBy}&name=${patientName}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        if (!isNurseLog && editingCase) {
          // 🚀 ส่งแจ้งเตือน LINE ตอนลบข้อมูล
          sendLineNotify(buildLineMessage("ลบข้อมูลคนไข้", editingCase));
        }

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
        actionBy:
          currentUser?.name ||
          currentUser?.empId ||
          "TV Update",
      };

      await fetch("/api/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      fetchCases();

      // 🚀 ส่งแจ้งเตือน LINE อัปเดตสถานะหน้าจอ TV
      sendLineNotify(buildLineMessage(`เปลี่ยนสถานะเป็น [ ${newStatus || "ว่าง"} ]`, payload));
    } catch (error) {
      console.error("Error updating patient status:", error);
    }
  };

  const handleSaveNurseForm = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [year, month, day] = nurseFormData.nurseDate.split("-");

      const payload: any = {
        date: parseInt(day, 10),
        monthYear: `${year}-${month}`,
        inc: nurseFormData.inc,
        call: nurseFormData.call,
        b: nurseFormData.b,
        bd: nurseFormData.bd,
        anesthIn: nurseFormData.anesthIn,
        anesthOut: nurseFormData.anesthOut,
        isNurseLog: true,
        actionBy: currentUser.name || currentUser.empId,
      };

      const method = editingNurseLog ? "PUT" : "POST";

      if (editingNurseLog) payload._id = editingNurseLog._id;

      await fetch("/api/cases", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setIsNurseModalOpen(false);
      setEditingNurseLog(null);

      fetchCases();
    } catch (error) {
      console.error("Error saving nurse log:", error);
    }
  };

  const handleUpdateCaseStatus = async (caseItem: any, newStatus: string) => {
    if (!caseItem) return;

    try {
      const payload = {
        ...caseItem,
        status: newStatus,
        actionBy:
          currentUser?.name ||
          currentUser?.empId ||
          "TV Update",
      };

      await fetch("/api/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      fetchCases();

      // 🚀 ส่งแจ้งเตือน LINE สำหรับการ Quick Update Status
      sendLineNotify(buildLineMessage(newStatus === "ยืนยัน" ? "สถานะเคสยืนยัน" : newStatus, payload));
    } catch (error) {
      console.error("Error updating case status:", error);
    }
  };

  const handlePostponeCase = async (caseItem: any, newDate: string) => {
    if (!caseItem) return;

    try {
      // ✅ 1. อัปเดตเคสเดิม → เป็น "เลื่อนวัน"
      await fetch("/api/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...caseItem,
          status: "เลื่อนวัน",
          actionBy: currentUser?.name || currentUser?.empId || "TV Update",
        }),
      });

      // ✅ 2. ถ้ามีวันใหม่ → สร้างเคสใหม่
      if (newDate) {
        const [year, month, day] = newDate.split("-");

        const newCase = {
          ...caseItem,
          date: parseInt(day),
          monthYear: `${year}-${month}`,
          status: "", // หรือ "ยืนยัน"
          actionBy: currentUser?.name || currentUser?.empId || "TV Update",
        };

        delete newCase._id; // ❗ สำคัญ

        await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCase),
        });

        // 🚀 ส่งแจ้งเตือน LINE เลื่อนวัน (แบบ Quick Action)
        sendLineNotify(buildLineMessage("เลื่อนวัน", newCase));
      }

      fetchCases();

    } catch (err) {
      console.error(err);
    }
  };

  return {
    handleSave,
    handleDeleteCase,
    handleUpdatePatientStatus,
    handleUpdateCaseStatus,
    handleSaveNurseForm,
    handlePostponeCase
  };
};