"use client";
import { useState } from "react";
import { useEmployeeManager } from "@/hooks/useEmployeeManager";

export const useEmployeeState = (currentUser: any, setCurrentUser: any) => {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmpId, setNewEmpId] = useState("");
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("user");
  const [isEditingEmp, setIsEditingEmp] = useState(false);
  const [editingEmpDbId, setEditingEmpDbId] = useState("");
  const [empSearchQuery, setEmpSearchQuery] = useState("");

  const {
    handleAddOrEditEmployee,
    handleEditEmpClick,
    handleCancelEditEmp,
    handleDeleteEmployee,
    filteredEmployees,
  } = useEmployeeManager({
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
  });

  return {
    // state
    isAdminModalOpen,
    setIsAdminModalOpen,
    employees,
    setEmployees,
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
    empSearchQuery,
    setEmpSearchQuery,

    // actions
    handleAddOrEditEmployee,
    handleEditEmpClick,
    handleCancelEditEmp,
    handleDeleteEmployee,
    filteredEmployees,
  };
};