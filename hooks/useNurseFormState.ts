"use client";
import { useState } from "react";

const formatDateLocal = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateInput: any) => {
  if (!dateInput) return new Date();

  // 👉 ถ้าเป็น Date อยู่แล้ว
  if (dateInput instanceof Date) return dateInput;

  // 👉 ถ้าเป็น string ISO
  const d = new Date(dateInput);

  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

export const useNurseFormState = (
  currentMonthYear: string,
  selectedDate: number,
  setIsNurseModalOpen: any,
  setIsSpeedDialOpen: any,
  setEditingNurseLog: any
) => {

  const initialNurseForm = {
    nurseDate: '',
    inc: '',
    call: '',
    b: '',
    bd: '',
    anesthIn: '',
    anesthOut: '',
  };

  const [nurseFormData, setNurseFormData] = useState(initialNurseForm);

  const handleOpenNurseModal = (data: any) => {
    const fullDate = new Date(
      `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`
    );

    const formattedDate = formatDateLocal(fullDate);

    if (data) {
      // 👉 edit mode (ใช้ date จาก "selectedDate" เท่านั้น)
      setEditingNurseLog(data);

      setNurseFormData({
        nurseDate: formattedDate, // 🔥 ใช้ตัวนี้แทน data.date
        inc: data.inc || '',
        call: data.call || '',
        b: data.b || '',
        bd: data.bd || '',
        anesthIn: data.anesthIn || '',
        anesthOut: data.anesthOut || '',
      });
    } else {
      // 👉 create mode
      setEditingNurseLog(null);

      setNurseFormData({
        ...initialNurseForm,
        nurseDate: formattedDate, // 🔥 ใช้เหมือนกัน
      });
    }

    setIsNurseModalOpen(true);
    setIsSpeedDialOpen(false);
  };

  const handleNurseChange = (e: any) => {
    const { name, value } = e.target;
    setNurseFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  return {
    nurseFormData,
    setNurseFormData,
    handleOpenNurseModal,
    handleNurseChange,
    initialNurseForm
  };
};