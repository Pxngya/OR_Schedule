"use client";
import { useState } from "react";

export const useCaseFormState = (
  currentMonthYear: string,
  selectedDate: number,
  setIsModalOpen: any,
  setIsSpeedDialOpen: any,
  setEditingCase: any
) => {

  const initialForm = {
    surgeryDate: '',
    time: '',
    room: '1',
    hn: '',
    name: '',
    age: '',
    operation: '',
    surgeon: '',
    team: '',
    specialEquipment: '',
    typeOfAnesth: '',
    anesthesiologist: '',
    dateOfBooking: '',
    timeReceiveSet: '',
    booker: '',
    receiver: '',
    remarks: '',
    status: '',
    patientStatus: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const handleOpenModal = (caseData: any = null) => {
    setEditingCase(caseData);

    let defaultDateStr =
      caseData && caseData.monthYear && caseData.date
        ? `${caseData.monthYear}-${String(caseData.date).padStart(2, '0')}`
        : `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`;

    if (caseData) {
      setFormData({
        ...initialForm,
        ...caseData,
        room: caseData.room || '1',
        surgeryDate: defaultDateStr
      });
    } else {
      const now = new Date();
      const currentYMD = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      setFormData({
        ...initialForm,
        surgeryDate: defaultDateStr,
        dateOfBooking: currentYMD,
        timeReceiveSet: currentHM
      });
    }

    setIsModalOpen(true);
    setIsSpeedDialOpen(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (e: any, editingCase: any) => {
    const newDate = e.target.value;

    if (editingCase && newDate !== editingCase.surgeryDate) {
      const confirmPostpone = confirm(
        'วันที่ผ่าตัดถูกเปลี่ยน ต้องการตั้งเป็น "เลื่อนวัน" หรือไม่?'
      );

      if (confirmPostpone) {
        setFormData((prev: any) => ({
          ...prev,
          surgeryDate: newDate,
          status: 'เลื่อนวัน'
        }));
        return;
      }
    }

    setFormData((prev: any) => ({
      ...prev,
      surgeryDate: newDate
    }));
  };

  return {
    formData,
    setFormData,
    handleOpenModal,
    handleChange,
    handleDateChange,
    initialForm
  };
};