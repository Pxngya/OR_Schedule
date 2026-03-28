"use client";

import { fetchEmployees } from "@/services/scheduleService";

export const useEmployeeManager = ({
  newEmpId,
  setNewEmpId,
  newEmpName,
  setNewEmpName,
  newEmpRole,
  setNewEmpRole,
  isEditingEmp,
  setIsEditingEmp,
  editingEmpDbId,
  setEditingEmpDbId,
  employees,
  setEmployees,
  empSearchQuery,
  currentUser,
  setCurrentUser,
}: any) => {

  const handleAddOrEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmpId.trim() || !newEmpName.trim()) {
      return alert("กรุณากรอกรหัสและชื่อพนักงานให้ครบถ้วน");
    }

    const action = isEditingEmp ? "edit" : "add";

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        id: editingEmpDbId,
        empId: newEmpId.trim(),
        name: newEmpName.trim(),
        role: newEmpRole,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setNewEmpId("");
      setNewEmpName("");
      setNewEmpRole("user");
      setIsEditingEmp(false);
      setEditingEmpDbId("");

      fetchEmployees(setEmployees);

      // update current user ถ้าแก้ตัวเอง
      if (data.data.empId === currentUser.empId) {
        localStorage.setItem("or_user", JSON.stringify(data.data));
        setCurrentUser(data.data);
      }
    } else {
      alert(data.message);
    }
  };

  const handleEditEmpClick = (emp: any) => {
    setEditingEmpDbId(emp._id);
    setNewEmpId(emp.empId);
    setNewEmpName(emp.name || "");
    setNewEmpRole(emp.role || "user");
    setIsEditingEmp(true);
  };

  const handleCancelEditEmp = () => {
    setNewEmpId("");
    setNewEmpName("");
    setNewEmpRole("user");
    setIsEditingEmp(false);
    setEditingEmpDbId("");
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("ยืนยันการลบรหัสพนักงานนี้?")) return;

    await fetch(`/api/employees?id=${id}`, {
      method: "DELETE",
    });

    fetchEmployees(setEmployees);
  };

  const filteredEmployees = employees.filter(
    (emp: any) =>
      (emp.empId && emp.empId.includes(empSearchQuery)) ||
      (emp.name && emp.name.includes(empSearchQuery))
  );

  return {
    handleAddOrEditEmployee,
    handleEditEmpClick,
    handleCancelEditEmp,
    handleDeleteEmployee,
    filteredEmployees,
  };
};