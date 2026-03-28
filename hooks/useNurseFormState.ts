"use client";
import { useState } from "react";

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
    bd: ''
  };

  const [nurseFormData, setNurseFormData] = useState(initialNurseForm);

  const handleOpenNurseModal = (logData: any = null) => {
    setEditingNurseLog(logData);

    if (logData) {
      setNurseFormData({
        nurseDate: `${logData.monthYear}-${String(logData.date).padStart(2, '0')}`,
        inc: logData.inc || '',
        call: logData.call || '',
        b: logData.b || '',
        bd: logData.bd || ''
      });
    } else {
      let defaultDateStr = `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`;
      setNurseFormData({
        ...initialNurseForm,
        nurseDate: defaultDateStr
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