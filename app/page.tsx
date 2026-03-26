"use client";
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function ScheduleBoard() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginEmpId, setLoginEmpId] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpName, setNewEmpName] = useState(''); 
  const [newEmpRole, setNewEmpRole] = useState('user');
  const [isEditingEmp, setIsEditingEmp] = useState(false);
  const [editingEmpDbId, setEditingEmpDbId] = useState(''); 
  const [empSearchQuery, setEmpSearchQuery] = useState(''); 

  const [isTVMode, setIsTVMode] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate()); 
  const [currentMonthYear, setCurrentMonthYear] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentTimeText, setCurrentTimeText] = useState('');
  const [currentMinsFromMidnight, setCurrentMinsFromMidnight] = useState(0); 
  const [cases, setCases] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('main'); 
  
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false); 
  const [isDashboardOpen, setIsDashboardOpen] = useState(false); 
  const [editingCase, setEditingCase] = useState<any>(null);
  const [editingNurseLog, setEditingNurseLog] = useState<any>(null); 
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdateCase, setStatusUpdateCase] = useState<any>(null);

  // 🚀 States สำหรับ Dashboard รูปแบบใหม่
  const [dashboardTab, setDashboardTab] = useState('daily');
  const [allDashboardCases, setAllDashboardCases] = useState<any[]>([]);

  const initialForm = { 
    surgeryDate: '', time: '', room: '1', hn: '', name: '', age: '', operation: '', 
    surgeon: '', team: '', specialEquipment: '', typeOfAnesth: '', 
    anesthesiologist: '', dateOfBooking: '', timeReceiveSet: '', 
    booker: '', receiver: '', remarks: '', status: '', patientStatus: '' 
  };
  const [formData, setFormData] = useState(initialForm);

  const initialNurseForm = { nurseDate: '', inc: '', call: '', b: '', bd: '' };
  const [nurseFormData, setNurseFormData] = useState(initialNurseForm);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tv') === 'true') setIsTVMode(true);
    }
  }, []);

  useEffect(() => {
    const sessionUser = localStorage.getItem('or_user');
    if (sessionUser) setCurrentUser(JSON.parse(sessionUser));
    setIsCheckingSession(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ action: 'login', empId: loginEmpId.trim() }) });
      const data = await res.json();
      if (data.success) { localStorage.setItem('or_user', JSON.stringify(data.data)); setCurrentUser(data.data); } 
      else setLoginError(data.message);
    } catch (err) { setLoginError('ระบบขัดข้อง กรุณาลองใหม่'); }
  };

  const handleLogout = () => { localStorage.removeItem('or_user'); setCurrentUser(null); };

  const exportToExcel = async () => {
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        const monthCases = data.data.filter((c: any) => c.monthYear === currentMonthYear && !c.isNurseLog);
        if (monthCases.length === 0) return alert(`ไม่มีข้อมูลในเดือน ${currentMonthYear} สำหรับ Export ครับ`);
        monthCases.sort((a: any, b: any) => {
          if (a.date !== b.date) return (a.date || 0) - (b.date || 0);
          const timeA = a.time || '23:59'; const timeB = b.time || '23:59';
          if (timeA !== timeB) return timeA.localeCompare(timeB);
          return String(a.room || '1').localeCompare(String(b.room || '1'));
        });
        const exportData = monthCases.map((c: any, index: number) => ({
          'ลำดับ': index + 1, 'วันที่': `${c.date} ${c.monthYear}`, 'เวลา': c.time, 'ห้องผ่าตัด': c.room || '1', 'สถานะคิว': c.status, 'สถานะผู้ป่วย': c.patientStatus, 'HN': formatHN(c.hn), 'ชื่อ-สกุล': c.name, 'อายุ': c.age, 'Operation': c.operation, 'Surgeon': c.surgeon, 'ทีมแพทย์': c.team, 'เครื่องมือพิเศษ': c.specialEquipment, 'Type of Anesth': c.typeOfAnesth, 'Anesthesiologist': c.anesthesiologist, 'Date of Booking': c.dateOfBooking, 'เวลารับ Set': c.timeReceiveSet, 'ผู้จอง': c.booker, 'ผู้รับจอง': c.receiver, 'หมายเหตุ': c.remarks
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, `ตารางผ่าตัด ${currentMonthYear}`); XLSX.writeFile(wb, `Schedule_${currentMonthYear}.xlsx`);
      }
    } catch (error) { alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel'); }
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees', { cache: 'no-store' }); const data = await res.json();
    if (data.success) setEmployees(data.data);
  };

  const handleAddOrEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim()) return alert('กรุณากรอกรหัสและชื่อพนักงานให้ครบถ้วน');
    const action = isEditingEmp ? 'edit' : 'add';
    const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id: editingEmpDbId, empId: newEmpId.trim(), name: newEmpName.trim(), role: newEmpRole }) });
    const data = await res.json();
    if (data.success) {
      setNewEmpId(''); setNewEmpName(''); setNewEmpRole('user'); setIsEditingEmp(false); setEditingEmpDbId(''); fetchEmployees();
      if (data.data.empId === currentUser.empId) { localStorage.setItem('or_user', JSON.stringify(data.data)); setCurrentUser(data.data); }
    } else alert(data.message);
  };

  const handleEditEmpClick = (emp: any) => { setEditingEmpDbId(emp._id); setNewEmpId(emp.empId); setNewEmpName(emp.name || ''); setNewEmpRole(emp.role || 'user'); setIsEditingEmp(true); };
  const handleCancelEditEmp = () => { setNewEmpId(''); setNewEmpName(''); setNewEmpRole('user'); setIsEditingEmp(false); setEditingEmpDbId(''); };
  const handleDeleteEmployee = async (id: string) => { if(confirm('ยืนยันการลบรหัสพนักงานนี้?')) { await fetch(`/api/employees?id=${id}`, { method: 'DELETE' }); fetchEmployees(); } };

  const getDaysInMonth = (monthYearStr: string) => {
    if (!monthYearStr) return 31; const [year, month] = monthYearStr.split('-'); return new Date(parseInt(year), parseInt(month), 0).getDate();
  };
  const daysInMonth = getDaysInMonth(currentMonthYear);

  useEffect(() => {
    if (isTVMode) {
      const updateClock = () => {
        const now = new Date();
        setCurrentTimeText(now.toLocaleTimeString('th-TH', { hour12: false }));
        setCurrentMinsFromMidnight(now.getHours() * 60 + now.getMinutes());
      };
      updateClock(); const timer = setInterval(updateClock, 1000); return () => clearInterval(timer);
    }
  }, [isTVMode]);

  const fetchCases = async () => {
    if(!currentUser) return;
    try {
      const res = await fetch(`/api/cases?date=${selectedDate}&monthYear=${currentMonthYear}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) setCases(data.data);
    } catch (error) { console.error("Error fetching cases:", error); }
  };

  useEffect(() => { fetchCases(); }, [selectedDate, currentMonthYear, currentUser]);

  useEffect(() => {
    if (isTVMode && currentUser) {
      const syncTimer = setInterval(() => fetchCases(), 10000); return () => clearInterval(syncTimer);
    }
  }, [isTVMode, currentUser, selectedDate, currentMonthYear]);

  const formatHN = (hnValue: any) => {
    if (hnValue === null || hnValue === undefined) return '';
    let cleaned = String(hnValue).trim();
    if (cleaned.toLowerCase() === 'nan') return '';
    if (cleaned.includes('.')) cleaned = cleaned.split('.')[0]; 
    return cleaned;
  };

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' }); const data = await res.json();
      if (data.success) {
        const query = globalSearchQuery.trim().toLowerCase();
        const filtered = data.data.filter((c: any) => {
           if (c.isNurseLog) return false;
           const cleanHN = formatHN(c.hn).toLowerCase();
           const name = String(c.name || '').toLowerCase();
           return name.includes(query) || cleanHN.includes(query) || String(c.hn).toLowerCase().includes(query);
        });
        filtered.sort((a: any, b: any) => new Date(`${a.monthYear}-${String(a.date).padStart(2,'0')}T${a.time || '00:00'}`).getTime() - new Date(`${b.monthYear}-${String(b.date).padStart(2,'0')}T${b.time || '00:00'}`).getTime());
        setSearchResults(filtered); setIsSearchModalOpen(true);
      }
    } catch (error) { console.error(error); }
    setIsSearching(false);
  };

  const handleOpenModal = (caseData: any = null) => {
    setEditingCase(caseData);
    let defaultDateStr = caseData && caseData.monthYear && caseData.date ? `${caseData.monthYear}-${String(caseData.date).padStart(2, '0')}` : `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`;
    setFormData(caseData ? { ...initialForm, ...caseData, room: caseData.room || '1', surgeryDate: defaultDateStr } : { ...initialForm, surgeryDate: defaultDateStr });
    setIsModalOpen(true); setIsSpeedDialOpen(false);
  };

  const handleOpenNurseModal = (logData: any = null) => {
    setEditingNurseLog(logData);
    if (logData) {
      setNurseFormData({ 
        nurseDate: `${logData.monthYear}-${String(logData.date).padStart(2,'0')}`, 
        inc: logData.inc || '', call: logData.call || '', b: logData.b || '', bd: logData.bd || '' 
      });
    } else {
      let defaultDateStr = `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`;
      setNurseFormData({ ...initialNurseForm, nurseDate: defaultDateStr });
    }
    setIsNurseModalOpen(true); setIsSpeedDialOpen(false);
  };

  // 🚀 ฟังก์ชันดึงข้อมูลทั้งหมดสำหรับ Dashboard ทุกแท็บ
  const handleOpenDashboard = async () => { 
    setIsDashboardOpen(true); 
    setIsSpeedDialOpen(false); 
    setDashboardTab('daily');
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' }); 
      const data = await res.json();
      if (data.success) {
         setAllDashboardCases(data.data.filter((c: any) => !c.isNurseLog));
      }
    } catch (error) { console.error(error); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [year, month, day] = formData.surgeryDate.split('-');
      const newMonthYear = `${year}-${month}`; const newDateNum = parseInt(day, 10);
      const oldDateStr = editingCase && editingCase.monthYear && editingCase.date ? `${editingCase.monthYear}-${String(editingCase.date).padStart(2, '0')}` : '';
      const payloadData = { ...formData, hn: formatHN(formData.hn), room: formData.room || '1', actionBy: currentUser.name || currentUser.empId };

      if (editingCase && formData.status === 'เลื่อนวัน' && formData.surgeryDate !== oldDateStr) {
          await fetch('/api/cases', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingCase, status: 'เลื่อนวัน', actionBy: currentUser.name || currentUser.empId }) });
          const payloadNew = { ...payloadData, date: newDateNum, monthYear: newMonthYear, status: 'ยืนยัน' }; delete payloadNew._id; 
          await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadNew) });
      } else {
          const payload = { ...payloadData, date: newDateNum, monthYear: newMonthYear };
          const method = editingCase && editingCase._id ? 'PUT' : 'POST';
          if (method === 'PUT') payload._id = editingCase._id;
          await fetch('/api/cases', { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setIsModalOpen(false); fetchCases();
    } catch (error) { console.error("Error saving case:", error); }
  };

  const handleSaveNurseForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [year, month, day] = nurseFormData.nurseDate.split('-');
      const payload: any = {
        date: parseInt(day, 10), monthYear: `${year}-${month}`,
        inc: nurseFormData.inc, call: nurseFormData.call, b: nurseFormData.b, bd: nurseFormData.bd,
        isNurseLog: true, actionBy: currentUser.name || currentUser.empId
      };
      const method = editingNurseLog ? 'PUT' : 'POST';
      if (editingNurseLog) payload._id = editingNurseLog._id;

      await fetch('/api/cases', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setIsNurseModalOpen(false); setEditingNurseLog(null); fetchCases();
    } catch (error) { console.error("Error saving nurse log:", error); }
  };

  const handleUpdatePatientStatus = async (newStatus: string) => {
    if (!statusUpdateCase) return;
    try {
      const payload = { ...statusUpdateCase, patientStatus: newStatus, actionBy: currentUser?.name || currentUser?.empId || 'TV Update' };
      await fetch('/api/cases', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      setIsStatusModalOpen(false); setStatusUpdateCase(null); fetchCases();
    } catch (error) { console.error("Error updating patient status:", error); }
  };

  const handleDeleteCase = async (id: string, isNurseLog = false) => {
    if (!confirm(isNurseLog ? 'ยืนยันการลบข้อมูลพยาบาลรายนี้?' : 'ยืนยันการลบข้อมูลคนไข้รายนี้? \n(ลบแล้วไม่สามารถกู้คืนได้)')) return;
    try {
      const actionBy = encodeURIComponent(currentUser.name || currentUser.empId);
      const patientName = encodeURIComponent(editingCase?.name || (isNurseLog ? 'Log พยาบาล' : 'ไม่ทราบชื่อ'));
      const res = await fetch(`/api/cases?id=${id}&actionBy=${actionBy}&name=${patientName}`, { method: 'DELETE' });
      if (res.ok) { setIsModalOpen(false); setIsSearchModalOpen(false); setIsNurseModalOpen(false); fetchCases(); } 
      else alert('เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้');
    } catch (error) { console.error("Error deleting case:", error); }
  };

  const handleChange = (e: any) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleNurseChange = (e: any) => { const { name, value } = e.target; setNurseFormData(prev => ({ ...prev, [name]: value })); };

  // 🚀 Logic คำนวณ Dashboard
  let dashCases: any[] = [];
  if (isDashboardOpen) {
     if (dashboardTab === 'daily') {
        dashCases = allDashboardCases.filter(c => c.monthYear === currentMonthYear && c.date === selectedDate);
     } else if (dashboardTab === 'monthly') {
        dashCases = allDashboardCases.filter(c => c.monthYear === currentMonthYear);
     } else if (dashboardTab === 'yearly') {
        const year = currentMonthYear.split('-')[0];
        dashCases = allDashboardCases.filter(c => c.monthYear && c.monthYear.startsWith(year));
     } else if (dashboardTab === 'weekly') {
        const selD = new Date(`${currentMonthYear}-${String(selectedDate).padStart(2, '0')}T12:00:00`);
        const day = selD.getDay();
        const diffToMon = selD.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(selD); startOfWeek.setDate(diffToMon); startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23,59,59,999);
        
        dashCases = allDashboardCases.filter(c => {
            const cDate = new Date(`${c.monthYear}-${String(c.date).padStart(2, '0')}T12:00:00`);
            return cDate >= startOfWeek && cDate <= endOfWeek;
        });
     }
  }

  const rawMainCases = cases.filter(c => !c.isNurseLog);
  const nurseLogs = cases.filter(c => c.isNurseLog);
  const todaysNurseLog = nurseLogs[0] || {};

  const standardCases = rawMainCases.filter(c => c.time && c.time !== 'tf' && c.time !== 'TF');
  const tfCases = rawMainCases.filter(c => c.time === 'tf' || c.time === 'TF');

  standardCases.sort((a, b) => {
      const timeA = a.time || '23:59'; const timeB = b.time || '23:59';
      if (timeA === timeB) return String(a.room || '1').localeCompare(String(b.room || '1'));
      return timeA.localeCompare(timeB);
  });

  const lastCaseBySurgeon: Record<string, any> = {};
  standardCases.forEach((c, index) => {
      if (c.surgeon) { lastCaseBySurgeon[c.surgeon.trim()] = { time: c.time, index }; }
  });

  const displayCases = [...standardCases];

  tfCases.forEach(tf => {
      const surgeon = tf.surgeon ? tf.surgeon.trim() : '';
      const match = lastCaseBySurgeon[surgeon];
      if (match) {
          const insertIndex = displayCases.findIndex(c => c === standardCases[match.index]);
          let finalIndex = insertIndex + 1;
          while(finalIndex < displayCases.length && (displayCases[finalIndex].time === 'tf' || displayCases[finalIndex].time === 'TF') && displayCases[finalIndex].surgeon === surgeon) {
              finalIndex++;
          }
          displayCases.splice(finalIndex, 0, tf);
      } else {
          displayCases.push(tf); 
      }
  });

  const tvDisplayCases = displayCases.filter(c => c.status === 'ยืนยัน');

  let activeCases: any[] = [];
  if (isTVMode) {
    const pinkCases = tvDisplayCases.filter(c => c.patientStatus === 'In OR' || c.patientStatus === 'Send to');
    activeCases = pinkCases.slice(0, 4); 
  }

  const inOrCount = tvDisplayCases.filter(c => c.patientStatus === 'In OR' || c.patientStatus === 'Send to').length;
  const recoveryCount = tvDisplayCases.filter(c => c.patientStatus === 'Recovery').length;
  const dischargeCount = tvDisplayCases.filter(c => c.patientStatus === 'Discharge').length;

  const filteredEmployees = employees.filter(emp => (emp.empId && emp.empId.includes(empSearchQuery)) || (emp.name && emp.name.includes(empSearchQuery)));

  const tvThClass = "border border-gray-300 p-2 text-sm lg:text-base font-black whitespace-nowrap text-[#4a2b38] bg-[#f3eff4] sticky top-0 z-10";
  const normThClass = "border border-gray-300 p-2 px-4 whitespace-nowrap text-[#4a2b38] bg-[#f3eff4] sticky top-0 z-10";

  const renderStatusDot = (status: string) => {
    if (status === 'In OR' || status === 'Send to') return <span className="inline-block w-4 h-4 rounded-full bg-[#ff9a9e] shadow-sm animate-pulse mx-auto"></span>;
    if (status === 'Recovery') return <span className="inline-block w-4 h-4 rounded-full bg-[#f6d365] shadow-sm mx-auto"></span>;
    if (status === 'Discharge') return <span className="inline-block w-4 h-4 rounded-full bg-[#84e3c8] shadow-sm mx-auto"></span>;
    return null;
  };

  if (isCheckingSession) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fdfbf2] flex items-center justify-center p-4">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d4b4dd] to-[#b88bc9]"></div>
          <div className="text-center mb-8"><h1 className="text-3xl font-black text-[#4a2b38] mb-2">เข้าสู่ระบบ</h1><p className="text-gray-500 text-sm">แผนกผ่าตัด โรงพยาบาลกรุงเทพอุดร</p></div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div><label className="block text-sm font-bold text-gray-700 mb-2">รหัสพนักงาน (Employee ID)</label><input type="text" value={loginEmpId} onChange={(e) => setLoginEmpId(e.target.value)} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#d4b4dd] focus:ring-4 focus:ring-[#f3eff4] outline-none transition-all font-mono text-lg text-center" placeholder="กรอกรหัสพนักงาน" autoFocus required /></div>
            {loginError && <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</div>}
            <button type="submit" className="w-full bg-[#4a2b38] text-white font-bold text-lg p-3 rounded-xl hover:bg-[#6e4356] transition-colors shadow-md">เข้าสู่ระบบ</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#fdfbf2] text-or-text relative ${isTVMode ? 'h-screen w-screen overflow-hidden p-2 flex flex-col gap-2' : 'min-h-screen p-2 md:p-4 pb-24'}`}>
      
      {/* 📺 TV Mode */}
      {isTVMode && (
        <>
          <div className="flex justify-between items-center shrink-0 h-[5vh] px-2 mt-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black text-[#4a2b38] bg-or-header px-3 py-1 rounded-lg shadow-sm border border-gray-200">แผนกผ่าตัด รพ.กรุงเทพอุดร</h1>
              <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm flex items-center gap-3">
                 <div className="flex items-center gap-2 border-r pr-3">
                    <span className="text-[10px] font-bold text-gray-500">เคสวันนี้</span>
                    <span className="text-base font-black text-green-600">{tvDisplayCases.length}</span>
                 </div>
                 <div className="flex items-center gap-3 pl-1">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ff9a9e]"></span><span className="text-sm font-black text-[#4a2b38]">{inOrCount}</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f6d365]"></span><span className="text-sm font-black text-[#4a2b38]">{recoveryCount}</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#84e3c8]"></span><span className="text-sm font-black text-[#4a2b38]">{dischargeCount}</span></div>
                 </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* 🚀 Date Picker บนหน้าจอทีวี เปลี่ยนวันที่ได้เลย */}
              <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <input 
                  type="date" 
                  value={`${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const [y, m, d] = val.split('-');
                      setCurrentMonthYear(`${y}-${m}`);
                      setSelectedDate(parseInt(d, 10));
                    }
                  }}
                  className="text-xs font-bold text-gray-500 bg-transparent border-none outline-none cursor-pointer"
                />
                <span className="text-lg font-black text-[#4a2b38] font-mono tracking-widest">{currentTimeText}</span>
              </div>
              <button onClick={() => window.close()} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm transition-colors cursor-pointer">❌ ปิด</button>
            </div>
          </div>

          <div className="flex gap-2 px-2 shrink-0 h-[26vh] min-h-0">
             
             <div className="w-[60%] flex gap-2 min-h-0">
                {activeCases.length === 0 && (
                   <div className="flex-1 bg-[#fcfafb] border border-dashed border-gray-200 rounded-xl flex items-center justify-center opacity-50 min-h-0 shadow-sm">
                      <span className="text-gray-300 text-2xl font-bold">ยังไม่มีเคสเข้าผ่าตัด (In OR)</span>
                   </div>
                )}
                {activeCases.length === 1 && (
                   <div className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl p-4 flex flex-col border-l-[12px] border-l-[#ff9a9e] overflow-y-auto min-h-0">
                      <div className="flex justify-between items-center mb-2 shrink-0">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-[#ff9a9e] rounded-full animate-pulse shadow-sm"></div><span className="text-lg font-black text-[#b04a50]">กำลังผ่าตัด (In OR)</span></div>
                        <div className="bg-[#fff0f1] text-[#b04a50] text-sm font-black px-3 py-1 rounded-lg border border-[#ff9a9e]">{activeCases[0].room === 'นอกสถานที่' ? 'นอกสถานที่' : `OR ${activeCases[0].room || '1'}`}</div>
                      </div>
                      <div className="text-2xl font-black text-[#4a2b38] leading-tight mb-2 shrink-0 whitespace-normal break-words">คุณ {activeCases[0].name}</div>
                      <div className="flex-1 flex flex-col justify-around gap-1 border-t border-gray-100 pt-2 min-h-0">
                         <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Op</span><span className="text-base font-bold text-gray-800 truncate max-w-[70%] text-right">{activeCases[0].operation || '-'}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Surgeon</span><span className="text-base font-bold text-gray-800 truncate max-w-[70%] text-right">{activeCases[0].surgeon || '-'}</span></div>
                         <div className="flex justify-between items-center"><span className="text-sm font-bold text-gray-400">Team</span><span className="text-base font-bold text-gray-700 truncate max-w-[70%] text-right">{activeCases[0].team || '-'}</span></div>
                      </div>
                   </div>
                )}
                {activeCases.length > 1 && (
                   <div className="w-full grid grid-cols-2 grid-rows-2 gap-2 min-h-0">
                     {activeCases.map((ac, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 shadow-sm rounded-xl p-2.5 flex flex-col border-l-[6px] border-l-[#ff9a9e] overflow-hidden min-h-0">
                          <div className="flex justify-between items-center mb-1 shrink-0">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-[#ff9a9e] rounded-full animate-pulse shadow-sm"></div><span className="text-[11px] lg:text-[13px] font-black text-[#b04a50]">กำลังผ่าตัด</span></div>
                            <div className="bg-[#fff0f1] text-[#b04a50] text-[10px] lg:text-[11px] font-black px-1.5 py-0.5 rounded border border-[#ff9a9e]">{ac.room === 'นอกสถานที่' ? 'นอก' : `OR ${ac.room || '1'}`}</div>
                          </div>
                          <div className="text-sm lg:text-base font-black text-[#4a2b38] truncate mb-1 shrink-0">คุณ {ac.name}</div>
                          <div className="flex-1 flex flex-col justify-center gap-1 border-t border-gray-100 pt-1.5 mt-auto shrink-0">
                             <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-gray-400 shrink-0">Surgeon/Team</span><span className="text-[11px] font-bold text-gray-800 text-right truncate pl-2">{ac.surgeon || '-'}{ac.team ? ` (${ac.team})` : ''}</span></div>
                          </div>
                        </div>
                     ))}
                     {[...Array(Math.max(0, 4 - activeCases.length))].map((_, i) => (
                        <div key={`empty-w-${i}`} className="bg-[#fcfafb] border border-dashed border-gray-200 rounded-xl flex items-center justify-center opacity-50 min-h-0"><span className="text-gray-300 text-xs font-bold">รอคิวผ่าตัด</span></div>
                     ))}
                   </div>
                )}
             </div>

             <div className="w-[40%] flex flex-col gap-2 min-h-0">
                <div className="flex-1 grid grid-cols-6 gap-1.5 min-h-0">
                   {['1','2','3','4','5','6'].map(r => {
                      const activeCase = tvDisplayCases.find(c => c.room === r && (c.patientStatus === 'In OR' || c.patientStatus === 'Send to'));
                      return (
                        <div key={r} className={`flex flex-col justify-center items-center text-center w-full rounded-xl border transition-colors shadow-sm min-h-0 ${activeCase ? 'bg-[#fff0f1] border-[#ff9a9e] text-[#b04a50]' : 'bg-white border-gray-200 text-gray-400'}`}>
                          <div className="text-[10px] font-bold opacity-80 uppercase w-full text-center">OR {r}</div>
                          <div className={`text-sm lg:text-base font-black w-full text-center ${activeCase ? '' : 'text-[#3ab795]'}`}>{activeCase ? 'กำลังผ่าตัด' : 'ว่าง'}</div>
                        </div>
                      );
                   })}
                </div>
                <div className="flex-1 bg-[#fffaf5] border border-[#facba8] rounded-xl shadow-sm p-3 flex flex-col justify-around min-h-0 overflow-y-auto hide-scrollbar">
                   <div className="flex items-start gap-2 mb-1">
                      <span className="text-[11px] lg:text-xs font-bold text-gray-500 w-8 shrink-0">Inc.</span>
                      <span className="text-sm lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.inc || '-'}</span>
                   </div>
                   <div className="flex items-start gap-2 mb-1">
                      <span className="text-[11px] lg:text-xs font-bold text-gray-500 w-8 shrink-0">Call</span>
                      <span className="text-sm lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.call || '-'}</span>
                   </div>
                   <div className="flex items-start gap-4">
                      <div className="flex items-start gap-2 flex-1">
                         <span className="text-[11px] lg:text-xs font-bold text-gray-500 shrink-0">บ.</span>
                         <span className="text-sm lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.b || '-'}</span>
                      </div>
                      <div className="flex items-start gap-2 flex-1">
                         <span className="text-[11px] lg:text-xs font-bold text-gray-500 shrink-0">บ/ด</span>
                         <span className="text-sm lg:text-base font-black text-[#4a2b38] break-words leading-tight">{todaysNurseLog.bd || '-'}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 bg-white border border-gray-300 shadow-md rounded-xl overflow-hidden flex flex-col mx-2 mt-2 min-h-0">
             <div className="overflow-y-auto flex-1 hide-scrollbar">
               <table className="w-full text-center border-collapse">
                  <thead>
                    <tr>
                      <th className={`${tvThClass} w-16 text-blue-800`}>OR</th>
                      <th className={`${tvThClass} w-20 text-purple-800`}>เวลา</th>
                      <th className={`${tvThClass} w-12`}>สถานะ</th>
                      <th className={`${tvThClass} w-[18%]`}>ชื่อ-สกุล</th>
                      <th className={`${tvThClass} w-20`}>HN</th>
                      <th className={`${tvThClass} w-[12%]`}>เครื่องมือพิเศษ</th>
                      <th className={`${tvThClass} w-[15%]`}>Operation</th>
                      <th className={`${tvThClass} w-[12%]`}>Surgeon</th>
                      <th className={`${tvThClass} w-[8%]`}>Anesth</th>
                      <th className={`${tvThClass} w-[8%]`}>Type</th>
                      <th className={`${tvThClass} w-[10%]`}>Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tvDisplayCases.map((c, index) => (
                      <tr key={c._id || index} className="border-b border-gray-200 hover:bg-[#fefafc] transition-colors cursor-pointer" onClick={() => { setStatusUpdateCase(c); setIsStatusModalOpen(true); }}>
                        <td className="border-r border-gray-200 font-black text-blue-700 text-sm lg:text-base whitespace-nowrap py-3">{c.room === 'นอกสถานที่' ? 'นอก' : c.room}</td>
                        <td className="border-r border-gray-200 font-black text-[#b88bc9] text-sm lg:text-base whitespace-nowrap py-3">{c.time === 'tf' || c.time === 'TF' ? 'TF' : c.time}</td>
                        <td className="border-r border-gray-200 text-center align-middle py-3">{renderStatusDot(c.patientStatus)}</td>
                        <td className="border-r border-gray-200 text-left px-3 font-black text-base lg:text-lg break-words py-3 leading-snug">{c.name}</td>
                        <td className="border-r border-gray-200 font-mono text-sm lg:text-base whitespace-nowrap py-3">{formatHN(c.hn)}</td>
                        <td className="border-r border-gray-200 text-xs lg:text-sm px-3 break-words py-3 leading-snug">{c.specialEquipment}</td>
                        <td className="border-r border-gray-200 text-left text-xs lg:text-sm px-3 break-words py-3 leading-snug">{c.operation}</td>
                        <td className="border-r border-gray-200 text-xs lg:text-sm px-3 break-words py-3 leading-snug">{c.surgeon}</td>
                        <td className="border-r border-gray-200 text-xs lg:text-sm px-2 whitespace-nowrap py-3">{c.anesthesiologist}</td>
                        <td className="border-r border-gray-200 text-xs lg:text-sm px-2 whitespace-nowrap py-3">{c.typeOfAnesth}</td>
                        <td className="border-r border-gray-200 text-[#4a2b38] text-xs lg:text-sm px-3 break-words py-3 leading-snug">{c.team}</td>
                      </tr>
                    ))}
                    {[...Array(Math.max(0, 10 - tvDisplayCases.length))].map((_, rowIndex) => (
                      <tr key={`empty-${rowIndex}`} className="border-b border-gray-100 bg-white h-12 lg:h-14">
                        {[...Array(11)].map((_, colIndex) => <td key={colIndex} className="border-r border-gray-100"></td>)}
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>

          <div className="shrink-0 flex flex-wrap gap-4 items-center justify-center pt-1 pb-1 text-[13px] font-bold text-gray-500">
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span> In OR / Send to</div>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#f6d365] shadow-sm"></span> Recovery</div>
            <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#84e3c8] shadow-sm"></span> Discharge</div>
          </div>
        </>
      )}

      {/* 💻 Web Mode */}
      {!isTVMode && (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="bg-or-header rounded-2xl p-3 md:p-4 shadow-sm inline-block border border-gray-200 w-full md:w-auto text-center md:text-left"><h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-[#4a2b38]">ตารางผ่าตัด แผนกผ่าตัดโรงพยาบาลกรุงเทพอุดร</h1></div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 w-full md:w-auto">
              <div className="text-sm px-2 w-full text-center md:w-auto md:text-left mb-1 md:mb-0">ผู้ใช้: <span className="font-bold text-[#b88bc9]">{currentUser.name || currentUser.empId}</span> <span className="text-xs text-gray-400 ml-1">({currentUser.role})</span></div>
              <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 flex-1 md:flex-none justify-center">📥 Excel</button>
              {currentUser.role === 'admin' && <button onClick={() => { fetchEmployees(); setIsAdminModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2 flex-1 md:flex-none justify-center">⚙️ แอดมิน</button>}
              <button onClick={handleLogout} className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 px-3 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer border border-gray-200 flex-1 md:flex-none justify-center">ออกระบบ</button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 px-2 md:px-4 text-base md:text-xl font-medium gap-3">
            <div className="flex flex-wrap items-center gap-4">
              <div>จำนวนเคสจองวันนี้ <span className="text-red-600 text-2xl md:text-3xl font-bold mx-2">{displayCases.length}</span> เคส</div>
              <div className="bg-gray-200 p-1 rounded-full flex gap-1 shadow-inner text-sm md:text-base">
                 <button onClick={() => setActiveTab('main')} className={`px-4 py-1.5 rounded-full font-bold transition-all ${activeTab === 'main' ? 'bg-white text-[#b88bc9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>ตาราง</button>
                 <button onClick={() => setActiveTab('oncall')} className={`px-4 py-1.5 rounded-full font-bold transition-all ${activeTab === 'oncall' ? 'bg-[#fffaf5] text-[#d9905b] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>On call</button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <input type="month" value={currentMonthYear} onChange={(e) => setCurrentMonthYear(e.target.value)} className="border border-gray-300 rounded px-3 py-1 bg-white h-[38px] shadow-sm w-full sm:w-auto text-base" />
              <form onSubmit={handleGlobalSearch} className="flex items-center gap-2 w-full sm:w-auto">
                 <input type="text" placeholder="ค้นหา HN หรือ ชื่อคนไข้" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} className="border border-[#d4b4dd] rounded-full px-5 py-1 w-full sm:w-64 md:w-72 bg-[#fdfbf2] focus:outline-none focus:ring-2 focus:ring-[#c29bce] text-base h-[38px] shadow-sm" />
                 <button type="submit" className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-5 h-[38px] rounded-full text-base font-bold shadow-md transition-colors whitespace-nowrap">{isSearching ? '...' : 'ค้นหา'}</button>
              </form>
            </div>
          </div>
          <div className="flex overflow-x-auto bg-or-table-head rounded-t-lg border border-b-0 border-gray-300 shadow-sm hide-scrollbar">
            <div className="px-3 md:px-4 py-2 font-bold bg-or-table-head border-r border-gray-300 sticky left-0 z-10 whitespace-nowrap">วัน</div>
            {[...Array(daysInMonth)].map((_, i) => (
              <button key={i+1} onClick={() => setSelectedDate(i+1)} className={`px-2 md:px-4 py-2 min-w-[36px] md:min-w-[40px] border-r border-gray-300 ${selectedDate === i+1 ? 'bg-white text-[#b88bc9] rounded-t-md font-black shadow-[0_-3px_0_0_#b88bc9]' : 'hover:bg-[#fdfbf2]'}`}>{i+1}</button>
            ))}
          </div>

          {activeTab === 'main' ? (
            <>
              <div className={`bg-white border border-gray-300 shadow-md min-h-0 flex flex-col overflow-x-auto rounded-b-xl w-full`}>
                <table className="w-full text-center border-collapse min-w-[1200px]">
                  <thead>
                    <tr>
                      <th className={`${normThClass} w-16 bg-status-cancel`}>ยกเลิก<br/>{displayCases.filter(c=>c.status==='ยกเลิก').length}</th>
                      <th className={`${normThClass} w-16 bg-status-postpone`}>เลื่อน<br/>{displayCases.filter(c=>c.status==='เลื่อนวัน').length}</th>
                      <th className={`${normThClass} w-16 bg-status-confirm`}>ยืนยัน<br/>{displayCases.filter(c=>c.status==='ยืนยัน').length}</th>
                      <th className={`${normThClass}`}>คิว</th>
                      <th className={`${normThClass}`}>เวลา</th>
                      <th className={`${normThClass} text-blue-800`}>OR</th>
                      <th className={`${normThClass} w-12`}>สถานะ</th>
                      <th className={`${normThClass} min-w-[200px]`}>ชื่อ-สกุล</th>
                      <th className={`${normThClass}`}>อายุ</th>
                      <th className={`${normThClass}`}>HN</th>
                      <th className={`${normThClass} min-w-[200px]`}>Operation</th>
                      <th className={`${normThClass} min-w-[150px]`}>Surgeon</th>
                      <th className={`${normThClass} min-w-[150px]`}>เครื่องมือพิเศษ</th>
                      <th className={`${normThClass}`}>Type Anesth</th>
                      <th className={`${normThClass}`}>Anesth.</th>
                      <th className={`${normThClass}`}>Date Book</th>
                      <th className={`${normThClass}`}>เวลารับ Set</th>
                      <th className={`${normThClass}`}>ผู้จอง</th>
                      <th className={`${normThClass}`}>ผู้รับจอง</th>
                      <th className={`${normThClass} min-w-[200px]`}>หมายเหตุ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCases.map((c, index) => (
                      <tr key={c._id || index} className={`border-b border-gray-300 cursor-pointer ${c.status === 'ยกเลิก' ? 'bg-red-50 opacity-50' : c.status === 'เลื่อนวัน' ? 'bg-yellow-50 opacity-50' : !c.status ? 'bg-gray-50 text-gray-500' : 'hover:bg-[#fdfaf2]'}`} onClick={() => handleOpenModal(c)}>
                        <td className="border-r border-gray-300 font-bold text-red-600 whitespace-nowrap py-3">{c.status === 'ยกเลิก' ? '✓' : ''}</td>
                        <td className="border-r border-gray-300 font-bold text-yellow-600 whitespace-nowrap py-3">{c.status === 'เลื่อนวัน' ? '✓' : ''}</td>
                        <td className="border-r border-gray-300 font-bold text-green-600 whitespace-nowrap py-3">{c.status === 'ยืนยัน' ? '✓' : ''}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap py-3">{index + 1}</td>
                        <td className="border-r border-gray-300 font-black whitespace-nowrap px-2 text-[#b88bc9] py-3">{c.time === 'tf' || c.time === 'TF' ? 'TF' : c.time}</td>
                        <td className="border-r border-gray-300 text-center px-2 font-black text-blue-700 whitespace-nowrap py-3">{c.room}</td>
                        <td className="border-r border-gray-300 text-center align-middle py-3">{renderStatusDot(c.patientStatus)}</td>
                        <td className="border-r border-gray-300 text-left font-bold text-[#4a2b38] px-3 break-words py-3 leading-snug">{c.name}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.age}</td>
                        <td className="border-r border-gray-300 font-mono whitespace-nowrap px-2 py-3">{formatHN(c.hn)}</td>
                        <td className="border-r border-gray-300 text-left px-3 break-words py-3 leading-snug">{c.operation}</td>
                        <td className="border-r border-gray-300 px-3 break-words py-3 leading-snug">{c.surgeon}</td>
                        <td className="border-r border-gray-300 px-3 break-words py-3 leading-snug">{c.specialEquipment}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.typeOfAnesth}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.anesthesiologist}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.dateOfBooking}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.timeReceiveSet}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.booker}</td>
                        <td className="border-r border-gray-300 whitespace-nowrap px-2 py-3">{c.receiver}</td>
                        <td className="border-r border-gray-300 text-left text-gray-500 px-3 break-words py-3 leading-snug">{c.remarks}</td>
                      </tr>
                    ))}
                    {[...Array(Math.max(0, 10 - displayCases.length))].map((_, rowIndex) => (
                      <tr key={`empty-${rowIndex}`} className="border-b border-gray-300 bg-white h-12 lg:h-14">
                        {[...Array(20)].map((_, colIndex) => <td key={colIndex} className="border-r border-gray-300"></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap gap-4 items-center justify-center mt-3 text-xs md:text-sm font-bold text-gray-500">
                 <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#ff9a9e]"></span> In OR / Send to</div>
                 <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#f6d365]"></span> Recovery</div>
                 <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-[#84e3c8]"></span> Discharge</div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-gray-300 shadow-md rounded-b-xl overflow-hidden mb-10">
                   <table className="w-full text-center border-collapse">
                       <thead className="bg-[#fffaf5]">
                           <tr className="text-[#4a2b38]">
                               <th className="p-3 border-b border-gray-200">วันที่</th>
                               <th className="p-3 border-b border-gray-200">Inc.</th>
                               <th className="p-3 border-b border-gray-200">Call</th>
                               <th className="p-3 border-b border-gray-200">บ.</th>
                               <th className="p-3 border-b border-gray-200">บ/ด</th>
                               <th className="p-3 border-b border-gray-200 w-32">จัดการ</th>
                           </tr>
                       </thead>
                       <tbody>
                           {nurseLogs.map((log) => (
                               <tr key={log._id} className="border-b border-gray-100 hover:bg-[#fffdfa] cursor-pointer transition-colors" onClick={() => handleOpenNurseModal(log)}>
                                   <td className="p-3 font-bold">{log.date} {log.monthYear}</td>
                                   <td className="p-3">{log.inc || '-'}</td>
                                   <td className="p-3">{log.call || '-'}</td>
                                   <td className="p-3">{log.b || '-'}</td>
                                   <td className="p-3">{log.bd || '-'}</td>
                                   <td className="p-3">
                                       <button onClick={(e) => { e.stopPropagation(); handleDeleteCase(log._id, true); }} className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded shadow-sm">ลบ</button>
                                   </td>
                               </tr>
                           ))}
                           {nurseLogs.length === 0 && <tr><td colSpan={6} className="p-8 text-gray-400 font-bold">ยังไม่มีข้อมูลสมุดพยาบาลในเดือนนี้</td></tr>}
                       </tbody>
                   </table>
              </div>
            </>
          )}
        </>
      )}

      {/* 🚀 ปุ่ม Speed Dial */}
      {!isTVMode && (
        <div className="fixed bottom-6 md:bottom-10 right-4 md:right-10 z-50 flex flex-col items-end gap-3">
          {isSpeedDialOpen && (
            <div className="flex flex-col gap-3 mb-2 items-end animate-fade-in-up">
              <a href="?tv=true" target="_blank" rel="noopener noreferrer" className="bg-[#a2c2e8] hover:bg-[#8eb3df] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(162,194,232,0.6)] transition-transform hover:scale-105 flex items-center gap-3">Display</a>
              <button onClick={handleOpenDashboard} className="bg-[#fbc2eb] hover:bg-[#f0addd] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(251,194,235,0.6)] transition-transform hover:scale-105 flex items-center gap-3">Dashboard</button>
              <button onClick={() => handleOpenNurseModal(null)} className="bg-[#ffdac1] hover:bg-[#facba8] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(255,218,193,0.6)] transition-transform hover:scale-105 flex items-center gap-3">On call</button>
              <button onClick={() => handleOpenModal(null)} className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(212,180,221,0.6)] transition-transform hover:scale-105 flex items-center gap-3">เพิ่มคิวผ่าตัด</button>
            </div>
          )}
          <button onClick={() => setIsSpeedDialOpen(!isSpeedDialOpen)} className={`w-14 h-14 md:w-16 md:h-16 text-white rounded-full text-4xl shadow-[0_10px_20px_rgba(184,139,201,0.5)] flex items-center justify-center transition-all duration-300 z-50 cursor-pointer border-2 border-white ${isSpeedDialOpen ? 'bg-[#ff9a9e] hover:bg-[#ff7b81] rotate-45 scale-110' : 'bg-[#b88bc9] hover:bg-[#a67ab5] hover:scale-110'}`}>+</button>
        </div>
      )}

      <div className={`fixed bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium z-40 opacity-70 tracking-widest`}>Developed by Pxngya</div>

      {/* 🚀 Modal 4: ป๊อปอัปเปลี่ยนสถานะด่วนใน TV Mode (คลิกที่คนไข้) */}
      {isStatusModalOpen && statusUpdateCase && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[400] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 relative animate-fade-in-up border-t-[10px] border-[#d4b4dd]">
             <button onClick={() => setIsStatusModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-black text-2xl">✕</button>
             <h2 className="text-2xl font-black text-center mb-1 text-[#4a2b38]">อัปเดตสถานะผู้ป่วย</h2>
             <div className="text-center text-gray-500 mb-6 font-bold text-lg">คุณ {statusUpdateCase.name}</div>
             
             <div className="grid grid-cols-1 gap-3">
                <button onClick={() => handleUpdatePatientStatus('In OR')} className="bg-[#fff0f1] hover:bg-[#ffe0e2] border-2 border-[#ff9a9e] text-[#b04a50] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105">
                   <span className="w-5 h-5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span> กำลังผ่าตัด (In OR)
                </button>
                <button onClick={() => handleUpdatePatientStatus('Send to')} className="bg-[#fff0f1] hover:bg-[#ffe0e2] border-2 border-[#ff9a9e] text-[#b04a50] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105">
                   <span className="w-5 h-5 rounded-full bg-[#ff9a9e] animate-pulse shadow-sm"></span> กำลังส่งตัว (Send to)
                </button>
                <button onClick={() => handleUpdatePatientStatus('Recovery')} className="bg-[#fffdf0] hover:bg-[#fff9d1] border-2 border-[#f6d365] text-[#b39535] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105">
                   <span className="w-5 h-5 rounded-full bg-[#f6d365] shadow-sm"></span> พักฟื้น (Recovery)
                </button>
                <button onClick={() => handleUpdatePatientStatus('Discharge')} className="bg-[#f0fcf9] hover:bg-[#d8f7ee] border-2 border-[#84e3c8] text-[#2c7560] py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-transform hover:scale-105">
                   <span className="w-5 h-5 rounded-full bg-[#84e3c8] shadow-sm"></span> เสร็จสิ้น (Discharge)
                </button>
                <button onClick={() => handleUpdatePatientStatus('')} className="bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl font-bold text-lg mt-2 transition-colors border-2 border-transparent">
                   🔄 เคลียร์สถานะ (ตั้งเป็นค่าว่าง)
                </button>
             </div>
          </div>
        </div>
      )}

      {/* 🟢 Modal 1: ฟอร์มหลัก */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-2 md:p-4 overflow-y-auto">
          <div className="bg-[#fdfbf2] border border-gray-200 rounded-2xl shadow-2xl w-full max-w-5xl p-4 md:p-8 relative my-8 md:my-auto flex flex-col">
            <h2 className="text-xl md:text-3xl font-black text-center mb-6 md:mb-8 bg-[#f3eff4] py-2 md:py-3 rounded-xl shadow-sm text-[#4a2b38] border border-gray-200">{editingCase ? '📝 แก้ไขข้อมูลคนไข้' : '➕ เพิ่มข้อมูลคนไข้ใหม่'}</h2>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 md:gap-y-5">
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">วันที่ผ่าตัด</label><input type="date" name="surgeryDate" value={formData.surgeryDate} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" required /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                 <label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เวลา / OR</label>
                 <div className="flex w-full sm:flex-1 gap-2 items-center">
                   {formData.time === 'tf' || formData.time === 'TF' ? (
                     <div className="border border-gray-300 p-2 flex-1 bg-gray-100 rounded-lg text-center font-bold text-gray-500">TF (To Follow)</div>
                   ) : (
                     <input type="time" name="time" value={formData.time} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono font-bold" required={formData.time !== 'tf' && formData.time !== 'TF'} />
                   )}
                   <label className="flex items-center gap-1.5 text-sm font-bold text-[#b88bc9] whitespace-nowrap cursor-pointer bg-white px-2 py-1.5 border border-gray-300 rounded-lg shadow-sm">
                     <input type="checkbox" className="w-4 h-4 accent-[#b88bc9]" checked={formData.time === 'tf' || formData.time === 'TF'} onChange={(e) => setFormData({...formData, time: e.target.checked ? 'tf' : ''})} />
                     เคส TF
                   </label>
                   <select name="room" value={formData.room || '1'} onChange={handleChange} className="border border-gray-300 p-2 w-24 sm:w-28 bg-blue-50 text-blue-800 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none font-bold cursor-pointer">
                     {[1,2,3,4,5,6,'นอกสถานที่'].map(r => <option key={r} value={r}>{r === 'นอกสถานที่' ? 'นอกสถานที่' : `OR ${r}`}</option>)}
                   </select>
                 </div>
               </div>
               
               <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-[#f3eff4] p-3 rounded-xl border border-gray-200">
                 <label className="sm:w-32 sm:text-right font-black text-[#4a2b38] text-sm sm:text-base">สถานะผู้ป่วย</label>
                 <select name="patientStatus" value={formData.patientStatus || ''} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold cursor-pointer">
                    <option value="">-- ไม่ระบุ (รอดำเนินการ) --</option>
                    <option value="In OR">🟣 In OR (กำลังผ่าตัด)</option>
                    <option value="Send to">🟣 Send to (กำลังส่งตัว)</option>
                    <option value="Recovery">🟡 Recovery (พักฟื้น)</option>
                    <option value="Discharge">🟢 Discharge (เสร็จสิ้น)</option>
                 </select>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">HN</label><input type="text" name="hn" value={formData.hn} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono" required /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ชื่อ-สกุล</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold text-[#4a2b38]" required /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">อายุ</label><input type="text" name="age" value={formData.age} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Surgeon</label><input type="text" name="surgeon" value={formData.surgeon} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base sm:mt-2">Team</label><input type="text" name="team" value={formData.team} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none"  /></div>
               <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base sm:mt-2">Operation</label><textarea name="operation" value={formData.operation} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-16 sm:h-20 resize-none"></textarea></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เครื่องมือพิเศษ</label><input type="text" name="specialEquipment" value={formData.specialEquipment} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Type of Anesth</label><input type="text" name="typeOfAnesth" value={formData.typeOfAnesth} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Anesthesiologist</label><input type="text" name="anesthesiologist" value={formData.anesthesiologist} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">Date of Booking</label><input type="date" name="dateOfBooking" value={formData.dateOfBooking} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">เวลารับ Set</label><input type="time" name="timeReceiveSet" value={formData.timeReceiveSet} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ผู้จอง</label><input type="text" name="booker" value={formData.booker} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base">ผู้รับจอง</label><input type="text" name="receiver" value={formData.receiver} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4"><label className="sm:w-32 sm:text-right font-bold text-gray-700 text-sm sm:text-base sm:mt-2">หมายเหตุ</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} className="border border-gray-300 p-2 w-full sm:flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-16 resize-none"></textarea></div>

               {editingCase && (
                  <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center gap-4 sm:gap-10 mt-4 md:mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-green-600 text-lg md:text-xl"><input type="radio" name="status" value="ยืนยัน" checked={formData.status === 'ยืนยัน'} onChange={handleChange} className="accent-green-600 w-5 h-5 md:w-6 md:h-6" /> ยืนยันผ่าตัด</label>
                    <label className="flex items-center gap-2 cursor-pointer font-black text-yellow-500 text-lg md:text-xl"><input type="radio" name="status" value="เลื่อนวัน" checked={formData.status === 'เลื่อนวัน'} onChange={handleChange} className="accent-yellow-500 w-5 h-5 md:w-6 md:h-6" /> เลื่อนวัน</label>
                    <label className="flex items-center gap-2 cursor-pointer font-black text-red-500 text-lg md:text-xl"><input type="radio" name="status" value="ยกเลิก" checked={formData.status === 'ยกเลิก'} onChange={handleChange} className="accent-red-500 w-5 h-5 md:w-6 md:h-6" /> ยกเลิกเคส</label>
                  </div>
               )}

               <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row justify-center mt-6 gap-3 sm:gap-4">
                 <button type="submit" className="bg-[#d4b4dd] text-[#4a2b38] px-8 md:px-12 py-3 rounded-full text-lg md:text-xl hover:bg-[#c29bce] font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent w-full sm:w-auto">💾 บันทึก</button>
                 {editingCase && currentUser?.role === 'admin' && <button type="button" onClick={() => handleDeleteCase(editingCase._id)} className="bg-red-500 text-white px-8 py-3 rounded-full text-lg md:text-xl hover:bg-red-600 font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent w-full sm:w-auto">🗑️ ลบข้อมูล</button>}
                 <button type="button" onClick={() => setIsModalOpen(false)} className="mt-2 sm:mt-0 sm:ml-4 text-gray-400 hover:text-gray-700 font-bold cursor-pointer text-base md:text-lg underline underline-offset-4 decoration-2 transition-colors">ปิด/ยกเลิก</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Modal 2: ฟอร์มสมุดพยาบาล */}
      {isNurseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white border border-[#facba8] rounded-2xl shadow-2xl w-full max-w-md p-6 relative flex flex-col my-8 md:my-auto">
            <div className="absolute top-0 left-0 w-full h-3 bg-[#ffdac1] rounded-t-2xl"></div>
            <h2 className="text-2xl font-black text-center mb-6 mt-2 text-[#4a2b38]">{editingNurseLog ? 'แก้ไขตาราง On call' : 'บันทึกตาราง On call'}</h2>
            <form onSubmit={handleSaveNurseForm} className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-1">วันที่บันทึก</label>
                 <input type="date" name="nurseDate" value={nurseFormData.nurseDate} onChange={handleNurseChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none font-bold text-gray-700" required />
               </div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Inc.</label><input type="text" name="inc" value={nurseFormData.inc} onChange={handleNurseChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">Call</label><input type="text" name="call" value={nurseFormData.call} onChange={handleNurseChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">บ.</label><input type="text" name="b" value={nurseFormData.b} onChange={handleNurseChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-1">บ/ด</label><input type="text" name="bd" value={nurseFormData.bd} onChange={handleNurseChange} className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#ffdac1] outline-none" /></div>
               <div className="flex flex-col sm:flex-row gap-3 pt-4">
                 <button type="submit" className="flex-1 bg-[#ffdac1] hover:bg-[#facba8] text-[#4a2b38] py-3 rounded-xl font-black shadow-md transition-transform hover:scale-105">💾 บันทึก</button>
                 <button type="button" onClick={() => setIsNurseModalOpen(false)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition-colors">ยกเลิก</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Modal 3: Dashboard สรุปผล (🚀 อัปเกรดมีแท็บ 4 แท็บ) */}
      {isDashboardOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-start md:items-center justify-center z-[200] backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#fdfbf2] border border-[#fbc2eb] rounded-2xl shadow-2xl w-full max-w-4xl p-6 md:p-8 relative flex flex-col my-8 md:my-auto">
            <h2 className="text-xl md:text-3xl font-black text-center mb-4 text-[#4a2b38] bg-[#fbc2eb] py-2 rounded-xl shadow-sm">
              📊 Dashboard สรุปคิวผ่าตัด ({
                dashboardTab === 'daily' ? 'รายวัน' : 
                dashboardTab === 'weekly' ? 'รายสัปดาห์' : 
                dashboardTab === 'monthly' ? 'รายเดือน' : 'รายปี'
              })
            </h2>
            
            {/* 🚀 ปุ่มสลับมุมมอง Dashboard */}
            <div className="flex justify-center mb-6">
               <div className="bg-[#f3eff4] p-1.5 rounded-full flex flex-wrap justify-center gap-1 sm:gap-2 shadow-inner text-sm md:text-base">
                 <button onClick={() => setDashboardTab('daily')} className={`px-4 sm:px-6 py-1.5 rounded-full font-bold transition-all ${dashboardTab === 'daily' ? 'bg-white text-[#b88bc9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>รายวัน</button>
                 <button onClick={() => setDashboardTab('weekly')} className={`px-4 sm:px-6 py-1.5 rounded-full font-bold transition-all ${dashboardTab === 'weekly' ? 'bg-white text-[#b88bc9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>รายสัปดาห์</button>
                 <button onClick={() => setDashboardTab('monthly')} className={`px-4 sm:px-6 py-1.5 rounded-full font-bold transition-all ${dashboardTab === 'monthly' ? 'bg-white text-[#b88bc9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>รายเดือน</button>
                 <button onClick={() => setDashboardTab('yearly')} className={`px-4 sm:px-6 py-1.5 rounded-full font-bold transition-all ${dashboardTab === 'yearly' ? 'bg-white text-[#b88bc9] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>รายปี</button>
               </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center"><div className="text-gray-500 font-bold text-sm">เคสทั้งหมด</div><div className="text-3xl md:text-5xl font-black text-[#4a2b38]">{dashCases.length}</div></div>
              <div className="bg-[#f0fcf9] p-4 rounded-xl shadow-sm border border-[#84e3c8] text-center"><div className="text-[#2c7560] font-bold text-sm">ยืนยันแล้ว</div><div className="text-3xl md:text-5xl font-black text-[#3ab795]">{dashCases.filter(c => c.status === 'ยืนยัน').length}</div></div>
              <div className="bg-[#fffdf0] p-4 rounded-xl shadow-sm border border-[#f6d365] text-center"><div className="text-[#b39535] font-bold text-sm">เลื่อนวัน</div><div className="text-3xl md:text-5xl font-black text-[#e5b835]">{dashCases.filter(c => c.status === 'เลื่อนวัน').length}</div></div>
              <div className="bg-[#fff0f1] p-4 rounded-xl shadow-sm border border-[#ff9a9e] text-center"><div className="text-[#b04a50] font-bold text-sm">ยกเลิก</div><div className="text-3xl md:text-5xl font-black text-[#e85a62]">{dashCases.filter(c => c.status === 'ยกเลิก').length}</div></div>
            </div>

            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-3 border-b pb-2">🏥 จำนวนเคสรายห้อง (เฉพาะที่ยืนยัน)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center">
              {['1','2','3','4','5','6','นอกสถานที่'].map(r => {
                 const roomCount = dashCases.filter(c => c.status === 'ยืนยัน' && c.room === r).length;
                 return (
                   <div key={r} className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm"><div className="text-[10px] md:text-xs font-bold text-gray-400">{r==='นอกสถานที่'?'นอก':`OR ${r}`}</div><div className="text-xl md:text-3xl font-black text-[#b88bc9]">{roomCount}</div></div>
                 )
              })}
            </div>
            <div className="mt-8 text-center"><button onClick={() => setIsDashboardOpen(false)} className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full font-bold transition-colors w-full sm:w-auto">ปิดหน้าต่าง</button></div>
          </div>
        </div>
      )}

      {/* 🟢 Modal 5: ระบบ Admin */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-[300] p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-4 md:p-8 relative flex flex-col my-8 md:my-auto">
             <div className="flex justify-between items-center mb-4 md:mb-6 border-b pb-4">
               <h2 className="text-xl md:text-2xl font-bold text-[#4a2b38]">⚙️ จัดการสิทธิ์ผู้ใช้งาน (Admin)</h2>
               <button onClick={() => { setIsAdminModalOpen(false); setEmpSearchQuery(''); }} className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors">✕</button>
             </div>
             
             <form onSubmit={handleAddOrEditEmployee} className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3 mb-4 md:mb-6 bg-[#fdfbf2] p-4 rounded-xl border border-gray-200 items-start sm:items-center">
               <input type="text" value={newEmpId} onChange={(e)=>setNewEmpId(e.target.value)} disabled={isEditingEmp} placeholder="รหัสพนักงาน" className={`w-full sm:w-[140px] text-center font-mono font-bold border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] ${isEditingEmp ? 'bg-gray-200 cursor-not-allowed text-gray-500' : 'bg-white'}`} required />
               <input type="text" value={newEmpName} onChange={(e)=>setNewEmpName(e.target.value)} placeholder="ชื่อ-สกุล พนักงาน" className="w-full sm:flex-1 border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd]" required />
               <select value={newEmpRole} onChange={(e)=>setNewEmpRole(e.target.value)} className="w-full sm:w-[100px] border p-2 rounded-lg outline-none cursor-pointer bg-white">
                 <option value="user">พนักงาน</option>
                 <option value="admin">แอดมิน</option>
               </select>
               <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                 {isEditingEmp ? (
                   <>
                     <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex-1 sm:flex-none">บันทึก</button>
                     <button type="button" onClick={handleCancelEditEmp} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex-1 sm:flex-none">ยกเลิก</button>
                   </>
                 ) : (
                   <button type="submit" className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-2 rounded-lg font-bold shadow-md transition-colors w-full sm:w-auto">เพิ่ม</button>
                 )}
               </div>
             </form>

             <div className="mb-4"><input type="text" placeholder="🔍 ค้นหารหัส หรือ ชื่อพนักงาน..." value={empSearchQuery} onChange={(e) => setEmpSearchQuery(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] bg-white shadow-sm" /></div>

             <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-white flex-1 min-h-[200px] max-h-[400px]">
               <table className="w-full text-sm text-center border-collapse min-w-[500px]">
                  <thead className="bg-[#f3eff4] sticky top-0 shadow-sm z-10"><tr className="text-[#4a2b38]"><th className="p-3 border-b border-gray-300 w-[100px]">รหัส (ID)</th><th className="p-3 border-b border-gray-300 text-left">ชื่อ-สกุล</th><th className="p-3 border-b border-gray-300 w-[100px]">สิทธิ์</th><th className="p-3 border-b border-gray-300 w-[140px]">จัดการ</th></tr></thead>
                  <tbody>
                     {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                        <tr key={emp._id} className={`border-b border-gray-100 transition-colors ${editingEmpDbId === emp._id ? 'bg-[#f4ebf7] border-l-4 border-l-[#b88bc9]' : 'hover:bg-[#fdfbf2]'}`}>
                          <td className={`p-3 font-bold font-mono ${editingEmpDbId === emp._id ? 'text-purple-700' : ''}`}>{emp.empId}</td>
                          <td className="p-3 text-left">{emp.name || 'ไม่ระบุ'}</td>
                          <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.role === 'admin' ? 'bg-[#d4b4dd] text-[#4a2b38]' : 'bg-gray-100 text-gray-600'}`}>{emp.role}</span></td>
                          <td className="p-3 flex justify-center gap-1 md:gap-2">
                            <button onClick={() => handleEditEmpClick(emp)} className="text-blue-500 hover:text-blue-700 font-bold px-2 md:px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 shadow-sm text-xs md:text-sm">แก้ไข</button>
                            {emp.empId !== currentUser.empId && <button onClick={() => handleDeleteEmployee(emp._id)} className="text-red-500 hover:text-red-700 font-bold px-2 md:px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm text-xs md:text-sm">ลบ</button>}
                          </td>
                        </tr>
                     )) : <tr><td colSpan={4} className="p-8 text-gray-400 font-bold">ไม่พบพนักงานที่ค้นหา</td></tr>}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {/* 🟢 Modal 6: หน้าต่างผลการค้นหา */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-start md:items-center justify-center z-[300] p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-4 md:p-6 relative flex flex-col my-8 md:my-auto">
             <div className="flex justify-between items-center mb-4 border-b pb-4">
               <h2 className="text-lg md:text-2xl font-bold text-[#4a2b38] truncate pr-4">🔍 ผลการค้นหา: "{globalSearchQuery}"</h2>
               <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors shrink-0">✕</button>
             </div>
             <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-inner bg-gray-50 flex-1 max-h-[60vh]">
               <table className="w-full text-xs md:text-sm text-center border-collapse min-w-[700px]">
                  <thead className="bg-[#b6d7d8] sticky top-0 shadow-sm z-10">
                     <tr className="text-[#4a2b38]"><th className="p-2 md:p-3 border border-gray-300">วันที่</th><th className="p-2 md:p-3 border border-gray-300">เวลา</th><th className="p-2 md:p-3 border border-gray-300 text-blue-800">OR</th><th className="p-2 md:p-3 border border-gray-300">HN</th><th className="p-2 md:p-3 border border-gray-300 text-left">ชื่อ-สกุล</th><th className="p-2 md:p-3 border border-gray-300 text-left">Operation</th><th className="p-2 md:p-3 border border-gray-300">สถานะ</th></tr>
                  </thead>
                  <tbody>
                     {searchResults.length > 0 ? searchResults.map((c, i) => (
                        <tr key={i} className={`border-b border-gray-200 hover:bg-[#fdfbf2] cursor-pointer transition-colors ${c.status === 'ยกเลิก' ? 'bg-red-50' : c.status === 'เลื่อนวัน' ? 'bg-yellow-50' : 'bg-white'}`} onClick={() => { setIsSearchModalOpen(false); handleOpenModal(c); }}>
                          <td className="p-2 md:p-3 border border-gray-200 font-bold text-gray-700 whitespace-nowrap">{c.date} {c.monthYear}</td>
                          <td className="p-2 md:p-3 border border-gray-200 font-black text-[#b88bc9] whitespace-nowrap">{c.time === 'tf' || c.time === 'TF' ? 'TF' : c.time}</td>
                          <td className="p-2 md:p-3 border border-gray-200 font-black text-blue-700">{c.room || '1'}</td>
                          <td className="p-2 md:p-3 border border-gray-200 font-mono whitespace-nowrap">{formatHN(c.hn)}</td>
                          <td className="p-2 md:p-3 border border-gray-200 text-left font-bold text-[#4a2b38] whitespace-nowrap">{c.name}</td>
                          <td className="p-2 md:p-3 border border-gray-200 text-left text-gray-600 truncate max-w-[150px]">{c.operation}</td>
                          <td className={`p-2 md:p-3 border border-gray-200 font-bold whitespace-nowrap ${c.status === 'ยืนยัน' ? 'text-green-600' : c.status === 'เลื่อนวัน' ? 'text-yellow-600' : !c.status ? 'text-gray-400' : 'text-red-600'}`}>• {c.status || 'รอระบุ'}</td>
                        </tr>
                     )) : <tr><td colSpan={7} className="p-10 md:p-12 text-gray-400 text-base md:text-xl font-bold bg-white">ไม่พบประวัติผู้ป่วยชื่อนี้ในระบบ 🏥</td></tr>}
                  </tbody>
               </table>
             </div>
             <div className="mt-4 text-center text-xs md:text-sm text-gray-500 font-medium">* คลิกที่รายชื่อเพื่อเปิดดู หรือแก้ไขรายละเอียดทั้งหมด</div>
          </div>
        </div>
      )}
    </div>
  );
}