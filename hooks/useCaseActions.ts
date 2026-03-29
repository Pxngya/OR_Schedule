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

        sendLineNotify(
          `เลื่อนวันผ่าตัด: OR ${payloadData.room} | คุณ ${payloadData.name} | ย้ายไปวันที่ ${newDateNum} ${newMonthYear}`
        );
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

        if (method === "POST") {
          sendLineNotify(
            `🟢 เพิ่มคิวใหม่: OR ${payloadData.room} | เวลา ${payloadData.time || "TF"
            } น. | คุณ ${payloadData.name}`
          );
        } else {
          sendLineNotify(
            `📝 อัปเดตคิว: OR ${payloadData.room} | เวลา ${payloadData.time || "TF"
            } น. | คุณ ${payloadData.name} | สถานะ: ${payloadData.status || "รอระบุ"
            }`
          );
        }
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
          sendLineNotify(`❌ ลบคิวผ่าตัด: คุณ ${editingCase.name}`);
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

      sendLineNotify(
        `อัปเดตสถานะ: คุณ ${payload.name} -> เปลี่ยนเป็น [ ${newStatus || "ว่าง"
        } ]`
      );
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

      sendLineNotify(
        `อัปเดตสถานะคิว: คุณ ${payload.name} -> ${newStatus}`
      );
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