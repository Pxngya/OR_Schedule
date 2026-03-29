"use client";
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

import {
  sendLineNotify,
  exportToExcel,
  fetchEmployees
} from "@/services/scheduleService";

import { formatHN, getDaysInMonth } from '@/lib/utils';
import { apiFetch } from "@/lib/api";

import { useAuth } from "@/hooks/useAuth";
import { useScheduleCases } from "@/hooks/useScheduleCases";
import { useProcessedCases } from "@/hooks/useProcessedCases";
import { useTVBoard } from "@/hooks/useTVBoard";
import { useCaseActions } from "@/hooks/useCaseActions";
import { useGlobalSearch } from "@/hooks/useGlobalSearch";
import { useDashboard } from "@/hooks/useDashboard";
import { useEmployeeManager } from "@/hooks/useEmployeeManager";
import { useEmployeeState } from "@/hooks/useEmployeeState";
import { useCaseFormState } from "@/hooks/useCaseFormState";
import { useNurseFormState } from "@/hooks/useNurseFormState";
import { useDashboardState } from "@/hooks/useDashboardState";
import { useTVClock } from "@/hooks/useTVClock";

import LoginForm from "@/components/auth/LoginForm";
import TVMode from '@/components/TVMode';
import HeaderBar from "@/components/HeaderBar";
import MainTable from '@/components/MainTable';
import CaseModal from "@/components/modals/CaseModal";
import NurseModal from "@/components/modals/NurseModal";
import StatusModal from "@/components/modals/StatusModal";
import DashboardModal from "@/components/modals/DashboardModal";
import AdminModal from "@/components/modals/AdminModal";
import SearchModal from "@/components/modals/SearchModal";
import PostponeModal from "@/components/modals/PostponeModal";

import SpeedDial from "@/components/SpeedDial";
import DateSelectorBar from "@/components/DateSelectorBar";
import NurseTab from "@/components/NurseTab";

import { tvThClass, normThClass, renderStatusDot } from "@/utils/uiHelpers";

export default function ScheduleBoard() {

  const [isTVMode, setIsTVMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonthYear, setCurrentMonthYear] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [activeTab, setActiveTab] = useState('main');

  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [editingNurseLog, setEditingNurseLog] = useState<any>(null);
  const [isPostponeModalOpen, setIsPostponeModalOpen] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdateCase, setStatusUpdateCase] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tv') === 'true') setIsTVMode(true);
    }
  }, []);

  const {
    currentUser,
    setCurrentUser,
    loginEmpId,
    setLoginEmpId,
    loginError,
    isCheckingSession,
    handleLogin,
    handleLogout,
  } = useAuth();

  const daysInMonth = getDaysInMonth(currentMonthYear);

  const {
    currentTimeText,
    currentMinsFromMidnight
  } = useTVClock(isTVMode);

  const {
    cases,
    setCases,
    fetchCases,
    loading
  } = useScheduleCases(
    currentUser,
    selectedDate,
    currentMonthYear,
    isTVMode
  );

  const { handleGlobalSearch } = useGlobalSearch({
    globalSearchQuery,
    setSearchResults,
    setIsSearchModalOpen,
    setIsSearching,
  });


  const {
    formData,
    setFormData,
    handleOpenModal,
    handleChange,
    handleDateChange,
    initialForm
  } = useCaseFormState(
    currentMonthYear,
    selectedDate,
    setIsModalOpen,
    setIsSpeedDialOpen,
    setEditingCase
  );

  const {
    nurseFormData,
    setNurseFormData,
    handleOpenNurseModal,
    handleNurseChange,
    initialNurseForm
  } = useNurseFormState(
    currentMonthYear,
    selectedDate,
    setIsNurseModalOpen,
    setIsSpeedDialOpen,
    setEditingNurseLog
  );

  const {
    handleSave,
    handleDeleteCase,
    handleUpdatePatientStatus,
    handleUpdateCaseStatus,
    handleSaveNurseForm,
    handlePostponeCase
  } = useCaseActions({
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
  });

  const handleQuickStatusUpdate = (caseItem: any, status: string) => {
    handleUpdateCaseStatus(caseItem, status);
  };

  const {
    dashboardTab,
    setDashboardTab,
    allDashboardCases,
    setAllDashboardCases,
    handleOpenDashboard,
  } = useDashboardState(
    setIsDashboardOpen,
    setIsSpeedDialOpen
  );

  const { dashCases } = useDashboard({
    isDashboardOpen,
    allDashboardCases,
    dashboardTab,
    currentMonthYear,
    selectedDate,
  });

  const {
    rawMainCases,
    nurseLogs,
    todaysNurseLog,
    displayCases,
    tvDisplayCases,
  } = useProcessedCases(cases);

  const {
    activeCases,
    inOrCount,
    callCount,
    recoveryCount,
    dischargeCount,
  } = useTVBoard(tvDisplayCases, isTVMode);

  const {
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
    handleAddOrEditEmployee,
    handleEditEmpClick,
    handleCancelEditEmp,
    handleDeleteEmployee,
    filteredEmployees,
  } = useEmployeeState(currentUser, setCurrentUser);

  if (isCheckingSession) return null;

  if (!currentUser) {
    return (
      <LoginForm
        loginEmpId={loginEmpId}
        setLoginEmpId={setLoginEmpId}
        loginError={loginError}
        handleLogin={handleLogin}
      />
    );
  }

  return (
    <div className={`bg-[#fdfbf2] text-or-text relative ${isTVMode ? 'h-screen w-screen overflow-hidden p-2 flex flex-col gap-2' : 'min-h-screen p-2 md:p-4 pb-24'}`}>

      {/* 📺 TV Mode */}
      {isTVMode && (
        <TVMode
          tvDisplayCases={tvDisplayCases}
          activeCases={activeCases}
          inOrCount={inOrCount}
          callCount={callCount}
          recoveryCount={recoveryCount}
          dischargeCount={dischargeCount}
          currentMonthYear={currentMonthYear}
          selectedDate={selectedDate}
          setCurrentMonthYear={setCurrentMonthYear}
          setSelectedDate={setSelectedDate}
          currentTimeText={currentTimeText}
          todaysNurseLog={todaysNurseLog}
          tvThClass={tvThClass}
          renderStatusDot={renderStatusDot}
          formatHN={formatHN}
          setStatusUpdateCase={setStatusUpdateCase}
          setIsStatusModalOpen={setIsStatusModalOpen}
          currentUser={currentUser}
        />
      )}

      {/* 💻 Web Mode */}
      {!isTVMode && (
        <>
          <HeaderBar
            currentUser={currentUser}
            exportToExcel={exportToExcel}
            currentMonthYear={currentMonthYear}
            fetchEmployees={fetchEmployees}
            setEmployees={setEmployees}
            setIsAdminModalOpen={setIsAdminModalOpen}
            handleLogout={handleLogout}

            displayCases={displayCases}
            activeTab={activeTab}
            setActiveTab={setActiveTab}

            currentMonthYearValue={currentMonthYear}
            setCurrentMonthYear={setCurrentMonthYear}

            handleGlobalSearch={handleGlobalSearch}
            globalSearchQuery={globalSearchQuery}
            setGlobalSearchQuery={setGlobalSearchQuery}
            isSearching={isSearching}
          />
          <DateSelectorBar
            daysInMonth={daysInMonth}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            setCurrentMonthYear={setCurrentMonthYear}
            currentMonthYear={currentMonthYear}
          />

          {activeTab === 'main' ? (
            <MainTable
              displayCases={displayCases}
              normThClass={normThClass}
              handleOpenModal={handleOpenModal}
              renderStatusDot={renderStatusDot}
              formatHN={formatHN}
              handleQuickStatusUpdate={handleQuickStatusUpdate}
              setStatusUpdateCase={setStatusUpdateCase}
              setIsStatusModalOpen={setIsStatusModalOpen}
              setIsPostponeModalOpen={setIsPostponeModalOpen}
            />
          ) : (
            <NurseTab
              nurseLogs={nurseLogs}
              handleOpenNurseModal={handleOpenNurseModal}
              handleDeleteCase={handleDeleteCase}
            />
          )}
        </>
      )}

      {/* 🚀 ปุ่ม Speed Dial */}
      {!isTVMode && (
        <SpeedDial
          isOpen={isSpeedDialOpen}
          setIsOpen={setIsSpeedDialOpen}
          handleOpenDashboard={handleOpenDashboard}
          handleOpenNurseModal={handleOpenNurseModal}
          handleOpenModal={handleOpenModal}
          todaysNurseLog={todaysNurseLog}
        />
      )}

      <div className={`fixed bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium z-40 opacity-70 tracking-widest`}>Developed by Pxngya</div>

      {/* 🚀 Modal 4: ป๊อปอัปเปลี่ยนสถานะด่วนใน TV Mode (คลิกที่คนไข้) */}
      {isStatusModalOpen && statusUpdateCase && (
        <StatusModal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          statusUpdateCase={statusUpdateCase}
          handleUpdatePatientStatus={handleUpdatePatientStatus}
        />
      )}

      {/* 🟢 Modal 1: ฟอร์มหลัก */}
      {isModalOpen && (
        <CaseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleDateChange={handleDateChange}
          handleSave={handleSave}
          editingCase={editingCase}
          currentUser={currentUser}
          handleDeleteCase={handleDeleteCase}
        />
      )}

      {/* 🟢 Modal 2: ฟอร์มตาราง On call (สมุดพยาบาล) */}
      {isNurseModalOpen && (
        <NurseModal
          isOpen={isNurseModalOpen}
          onClose={() => setIsNurseModalOpen(false)}
          nurseFormData={nurseFormData}
          handleNurseChange={handleNurseChange}
          handleSaveNurseForm={handleSaveNurseForm}
          editingNurseLog={editingNurseLog}
        />
      )}

      {/* 🟢 Modal 3: Dashboard สรุปผล */}
      {isDashboardOpen && (
        <DashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          dashboardTab={dashboardTab}
          setDashboardTab={setDashboardTab}
          dashCases={dashCases}
        />
      )}

      {/* 🟢 Modal 5: ระบบ Admin */}
      {isAdminModalOpen && (
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}

          employees={employees}
          filteredEmployees={filteredEmployees}
          currentUser={currentUser}

          newEmpId={newEmpId}
          setNewEmpId={setNewEmpId}
          newEmpName={newEmpName}
          setNewEmpName={setNewEmpName}
          newEmpRole={newEmpRole}
          setNewEmpRole={setNewEmpRole}

          isEditingEmp={isEditingEmp}
          editingEmpDbId={editingEmpDbId}

          empSearchQuery={empSearchQuery}
          setEmpSearchQuery={setEmpSearchQuery}

          handleAddOrEditEmployee={handleAddOrEditEmployee}
          handleEditEmpClick={handleEditEmpClick}
          handleCancelEditEmp={handleCancelEditEmp}
          handleDeleteEmployee={handleDeleteEmployee}
        />
      )}

      {/* 🟢 Modal 6: หน้าต่างผลการค้นหา */}
      {isSearchModalOpen && (
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}

          globalSearchQuery={globalSearchQuery}
          searchResults={searchResults}

          handleOpenModal={handleOpenModal}
          formatHN={formatHN}
        />
      )}

      {isPostponeModalOpen && statusUpdateCase && (
        <PostponeModal
          isOpen={isPostponeModalOpen}
          onClose={() => setIsPostponeModalOpen(false)}
          caseItem={statusUpdateCase}
          onSubmit={handlePostponeCase}
        />
      )}
    </div>
  );
}
