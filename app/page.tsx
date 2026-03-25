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
  const [currentDateText, setCurrentDateText] = useState('');
  const [currentTimeText, setCurrentTimeText] = useState('');
  const [currentMinsFromMidnight, setCurrentMinsFromMidnight] = useState(0); 
  const [cases, setCases] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<any>(null);
  
  const initialForm = { 
    surgeryDate: '', time: '', room: '1', hn: '', name: '', age: '', operation: '', 
    surgeon: '', team: '', specialEquipment: '', typeOfAnesth: '', 
    anesthesiologist: '', dateOfBooking: '', timeReceiveSet: '', 
    booker: '', receiver: '', remarks: '', status: 'ยืนยัน' 
  };
  const [formData, setFormData] = useState(initialForm);

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
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ action: 'login', empId: loginEmpId.trim() })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('or_user', JSON.stringify(data.data));
        setCurrentUser(data.data);
      } else setLoginError(data.message);
    } catch (err) { setLoginError('ระบบขัดข้อง กรุณาลองใหม่'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('or_user');
    setCurrentUser(null);
  };

  const exportToExcel = async () => {
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.success) {
        const monthCases = data.data.filter((c: any) => c.monthYear === currentMonthYear);
        if (monthCases.length === 0) return alert(`ไม่มีข้อมูลในเดือน ${currentMonthYear} สำหรับ Export ครับ`);

        monthCases.sort((a: any, b: any) => {
          if (a.date !== b.date) return (a.date || 0) - (b.date || 0);
          const timeA = a.time || '23:59';
          const timeB = b.time || '23:59';
          if (timeA !== timeB) return timeA.localeCompare(timeB);
          return (a.room || '1').localeCompare(b.room || '1');
        });

        const exportData = monthCases.map((c: any, index: number) => ({
          'ลำดับ': index + 1,
          'วันที่': `${c.date} ${c.monthYear}`,
          'เวลา': c.time,
          'ห้องผ่าตัด': c.room || '1',
          'สถานะ': c.status,
          'HN': c.hn,
          'ชื่อ-สกุล': c.name,
          'อายุ': c.age,
          'Operation': c.operation,
          'Surgeon': c.surgeon,
          'ทีมแพทย์': c.team,
          'เครื่องมือพิเศษ': c.specialEquipment,
          'Type of Anesth': c.typeOfAnesth,
          'Anesthesiologist': c.anesthesiologist,
          'Date of Booking': c.dateOfBooking,
          'เวลารับ Set': c.timeReceiveSet,
          'ผู้จอง': c.booker,
          'ผู้รับจอง': c.receiver,
          'หมายเหตุ': c.remarks
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        ws['!cols'] = [ { wch: 6 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 25 }, { wch: 6 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 } ];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, `ตารางผ่าตัด ${currentMonthYear}`);
        XLSX.writeFile(wb, `Schedule_${currentMonthYear}.xlsx`);
      }
    } catch (error) {
      console.error("Export Error:", error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel');
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch('/api/employees', { cache: 'no-store' });
    const data = await res.json();
    if (data.success) setEmployees(data.data);
  };

  const handleAddOrEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpId.trim() || !newEmpName.trim()) return alert('กรุณากรอกรหัสและชื่อพนักงานให้ครบถ้วน');
    
    const action = isEditingEmp ? 'edit' : 'add';

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ 
        action, 
        id: editingEmpDbId, 
        empId: newEmpId.trim(), 
        name: newEmpName.trim(), 
        role: newEmpRole 
      })
    });
    const data = await res.json();
    
    if (data.success) {
      setNewEmpId('');
      setNewEmpName('');
      setNewEmpRole('user');
      setIsEditingEmp(false);
      setEditingEmpDbId('');
      fetchEmployees();
      
      if (data.data.empId === currentUser.empId) {
        localStorage.setItem('or_user', JSON.stringify(data.data));
        setCurrentUser(data.data);
      }
    } else alert(data.message);
  };

  const handleEditEmpClick = (emp: any) => {
    setEditingEmpDbId(emp._id); 
    setNewEmpId(emp.empId);
    setNewEmpName(emp.name || '');
    setNewEmpRole(emp.role || 'user');
    setIsEditingEmp(true);
  };

  const handleCancelEditEmp = () => {
    setNewEmpId('');
    setNewEmpName('');
    setNewEmpRole('user');
    setIsEditingEmp(false);
    setEditingEmpDbId('');
  };

  const handleDeleteEmployee = async (id: string) => {
    if(!confirm('ยืนยันการลบรหัสพนักงานนี้?')) return;
    const res = await fetch(`/api/employees?id=${id}`, { method: 'DELETE', cache: 'no-store' });
    if (res.ok) fetchEmployees();
  };

  const getDaysInMonth = (monthYearStr: string) => {
    if (!monthYearStr) return 31;
    const [year, month] = monthYearStr.split('-');
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };
  const daysInMonth = getDaysInMonth(currentMonthYear);

  useEffect(() => {
    if (isTVMode) {
      const updateClock = () => {
        const now = new Date();
        setCurrentTimeText(now.toLocaleTimeString('th-TH', { hour12: false }));
        setCurrentDateText(now.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }));
        setCurrentMinsFromMidnight(now.getHours() * 60 + now.getMinutes());
      };
      updateClock(); 
      const timer = setInterval(updateClock, 1000);
      return () => clearInterval(timer);
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
      const syncTimer = setInterval(() => fetchCases(), 10000);
      return () => clearInterval(syncTimer);
    }
  }, [isTVMode, currentUser, selectedDate, currentMonthYear]);

  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch('/api/cases', { cache: 'no-store' }); 
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter((c: any) => (c.name && c.name.includes(globalSearchQuery)) || (c.hn && c.hn.includes(globalSearchQuery)));
        filtered.sort((a: any, b: any) => {
           const dateA = new Date(`${a.monthYear}-${String(a.date).padStart(2,'0')}T${a.time || '00:00'}`);
           const dateB = new Date(`${b.monthYear}-${String(b.date).padStart(2,'0')}T${b.time || '00:00'}`);
           return dateA.getTime() - dateB.getTime();
        });
        setSearchResults(filtered);
        setIsSearchModalOpen(true);
      }
    } catch (error) { console.error(error); }
    setIsSearching(false);
  };

  const handleOpenModal = (caseData: any = null) => {
    setEditingCase(caseData);
    let defaultDateStr = '';
    if (caseData && caseData.monthYear && caseData.date) {
      defaultDateStr = `${caseData.monthYear}-${String(caseData.date).padStart(2, '0')}`;
    } else {
      defaultDateStr = `${currentMonthYear}-${String(selectedDate).padStart(2, '0')}`;
    }
    setFormData(caseData ? { ...initialForm, ...caseData, room: caseData.room || '1', surgeryDate: defaultDateStr } : { ...initialForm, surgeryDate: defaultDateStr });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const [year, month, day] = formData.surgeryDate.split('-');
      const newMonthYear = `${year}-${month}`;
      const newDateNum = parseInt(day, 10);
      const oldDateStr = editingCase && editingCase.monthYear && editingCase.date ? `${editingCase.monthYear}-${String(editingCase.date).padStart(2, '0')}` : '';
      
      const payloadData = { 
        ...formData, 
        room: formData.room || '1',
        actionBy: currentUser.name || currentUser.empId 
      };

      if (editingCase && formData.status === 'เลื่อนวัน' && formData.surgeryDate !== oldDateStr) {
          await fetch('/api/cases', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...editingCase, status: 'เลื่อนวัน', actionBy: currentUser.name || currentUser.empId }) });
          const payloadNew = { ...payloadData, date: newDateNum, monthYear: newMonthYear, status: 'ยืนยัน' };
          delete payloadNew._id; 
          await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payloadNew) });
      } else {
          const payload = { ...payloadData, date: newDateNum, monthYear: newMonthYear };
          const method = editingCase && editingCase._id ? 'PUT' : 'POST';
          if (method === 'PUT') payload._id = editingCase._id;
          await fetch('/api/cases', { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      setIsModalOpen(false);
      fetchCases();
    } catch (error) { console.error("Error saving case:", error); }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('ยืนยันการลบข้อมูลคนไข้รายนี้? \n(ลบแล้วไม่สามารถกู้คืนได้)')) return;
    try {
      const actionBy = encodeURIComponent(currentUser.name || currentUser.empId);
      const patientName = encodeURIComponent(editingCase?.name || 'ไม่ทราบชื่อ');
      
      const res = await fetch(`/api/cases?id=${id}&actionBy=${actionBy}&name=${patientName}`, { method: 'DELETE' });
      if (res.ok) {
        setIsModalOpen(false);
        setIsSearchModalOpen(false); 
        fetchCases();
      } else alert('เกิดข้อผิดพลาด ไม่สามารถลบข้อมูลได้');
    } catch (error) { console.error("Error deleting case:", error); }
  };

  const handleChange = (e: any) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const displayCases = cases.sort((a, b) => {
       const timeA = a.time || '23:59';
       const timeB = b.time || '23:59';
       if (timeA === timeB) return (a.room || '1').localeCompare(b.room || '1');
       return timeA.localeCompare(timeB);
  });

  let activeCases: any[] = [];
  if (isTVMode) {
    const validCases = displayCases.filter(c => c.status === 'ยืนยัน' && c.time);
    const inWindowCases = validCases.filter(c => {
      const [h, m] = c.time.split(':').map(Number);
      const caseMins = h * 60 + m;
      return currentMinsFromMidnight >= caseMins - 15 && currentMinsFromMidnight <= caseMins + 30;
    });
    activeCases = inWindowCases.slice(-4); 
  }

  const filteredEmployees = employees.filter(emp => 
    (emp.empId && emp.empId.includes(empSearchQuery)) || 
    (emp.name && emp.name.includes(empSearchQuery))
  );

  const tvThClass = "border border-gray-300 p-1.5 text-sm font-bold whitespace-nowrap text-[#4a2b38] bg-[#f3eff4]";
  const normThClass = "border border-gray-300 p-2 px-4 whitespace-nowrap text-[#4a2b38] bg-[#f3eff4]";
  const th = (base: string) => `${isTVMode ? tvThClass : normThClass} ${base}`;

  if (isCheckingSession) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fdfbf2] flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d4b4dd] to-[#b88bc9]"></div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#4a2b38] mb-2">เข้าสู่ระบบ</h1>
            <p className="text-gray-500 text-sm">แผนกผ่าตัด โรงพยาบาลกรุงเทพอุดร</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">รหัสพนักงาน (Employee ID)</label>
              <input type="text" value={loginEmpId} onChange={(e) => setLoginEmpId(e.target.value)} className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#d4b4dd] focus:ring-4 focus:ring-[#f3eff4] outline-none transition-all font-mono text-lg text-center" placeholder="กรอกรหัสพนักงาน" autoFocus required />
            </div>
            {loginError && <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">{loginError}</div>}
            <button type="submit" className="w-full bg-[#4a2b38] text-white font-bold text-lg p-3 rounded-xl hover:bg-[#6e4356] transition-colors shadow-md">เข้าสู่ระบบ</button>
          </form>
          <div className="mt-8 text-center text-xs text-gray-400">
            *สำหรับผู้ดูแลระบบครั้งแรก ให้กรอกรหัส <span className="font-bold text-[#b88bc9]">admin</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#fdfbf2] text-or-text relative ${isTVMode ? 'h-screen w-screen overflow-hidden p-2 flex flex-col' : 'min-h-screen p-4 pb-16'}`}>
      
      {isTVMode && (
        <div className="flex justify-between items-center mb-2 px-2 h-[8vh] shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black text-[#4a2b38] bg-or-header px-5 py-2 rounded-xl border border-gray-200 shadow-sm">
              แผนกผ่าตัด รพ.กรุงเทพอุดร
            </h1>
            <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
              <span className="text-sm font-bold text-gray-500">เคสจองวันนี้</span>
              <span className="text-2xl font-black text-green-600">{displayCases.filter(c=>c.status==='ยืนยัน').length}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 px-5 py-1.5 rounded-xl shadow-sm flex items-center gap-4">
              <span className="text-base font-bold text-gray-500">{currentDateText}</span>
              <span className="text-3xl font-black text-[#4a2b38] font-mono tracking-widest">{currentTimeText}</span>
            </div>
            <button onClick={() => window.close()} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer">
              ❌ ปิดแท็บนี้
            </button>
          </div>
        </div>
      )}

      {!isTVMode && (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="bg-or-header rounded-2xl p-4 shadow-sm inline-block border border-gray-200">
              <h1 className="text-4xl font-bold mb-2 text-[#4a2b38]">ตารางผ่าตัด แผนกผ่าตัดโรงพยาบาลกรุงเทพอุดร</h1>
            </div>
            
            <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-200">
              <div className="text-sm px-2">
                ผู้ใช้: <span className="font-bold text-[#b88bc9]">{currentUser.name || currentUser.empId}</span> 
                <span className="text-xs text-gray-400 ml-1">({currentUser.role})</span>
              </div>
              <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                📥 โหลด Excel
              </button>
              {currentUser.role === 'admin' && (
                <button onClick={() => { fetchEmployees(); setIsAdminModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                  ⚙️ แอดมิน
                </button>
              )}
              <button onClick={handleLogout} className="bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer border border-gray-200">
                ออกจากระบบ
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4 px-4 text-xl font-medium">
            <div className="flex items-center">
              จำนวนเคสจองวันนี้ <span className="text-red-600 text-3xl font-bold mx-2">{displayCases.length}</span> เคส
            </div>
            <div className="flex items-center gap-4">
              <input type="month" value={currentMonthYear} onChange={(e) => setCurrentMonthYear(e.target.value)} className="border border-gray-300 rounded px-3 py-1 bg-white text-base h-[38px] shadow-sm" />
              <form onSubmit={handleGlobalSearch} className="flex items-center gap-2">
                 <input type="text" placeholder="ค้นหา HN หรือ ชื่อคนไข้" value={globalSearchQuery} onChange={(e) => setGlobalSearchQuery(e.target.value)} className="border border-[#d4b4dd] rounded-full px-5 py-1 w-72 bg-[#fdfbf2] focus:outline-none focus:ring-2 focus:ring-[#c29bce] text-base h-[38px] shadow-sm" />
                 <button type="submit" className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-5 h-[38px] rounded-full text-base font-bold shadow-md transition-colors">{isSearching ? '...' : 'ค้นหา'}</button>
              </form>
            </div>
          </div>
          <div className="flex overflow-x-auto bg-or-table-head rounded-t-lg border border-b-0 border-gray-300 shadow-sm">
            <div className="px-4 py-2 font-bold bg-or-table-head border-r border-gray-300 sticky left-0 z-10">วันที่</div>
            {[...Array(daysInMonth)].map((_, i) => (
              <button key={i+1} onClick={() => setSelectedDate(i+1)} className={`px-4 py-2 min-w-[40px] border-r border-gray-300 ${selectedDate === i+1 ? 'bg-white text-[#b88bc9] rounded-t-md font-black shadow-[0_-3px_0_0_#b88bc9]' : 'hover:bg-[#fdfbf2]'}`}>{i+1}</button>
            ))}
          </div>
        </>
      )}

      <div className={`bg-white border border-gray-300 shadow-md flex-1 min-h-0 flex flex-col ${isTVMode ? 'rounded-lg overflow-hidden' : 'overflow-x-auto rounded-b-lg'}`}>
        <table className={`w-full text-center border-collapse ${isTVMode ? 'flex-1 h-full' : ''}`}>
          <thead>
            <tr style={isTVMode ? { height: '4.76%' } : {}}>
              {isTVMode ? (
                <>
                  <th className={`${tvThClass} w-12 text-blue-800`}>ห้อง</th>
                  <th className={`${tvThClass} w-16 text-purple-800`}>เวลา</th>
                  <th className={`${tvThClass} w-[15%]`}>ชื่อ-สกุล</th>
                  <th className={`${tvThClass} w-20`}>HN</th>
                  <th className={`${tvThClass} w-[12%]`}>เครื่องมือพิเศษ</th>
                  <th className={`${tvThClass} w-[15%]`}>Operation</th>
                  <th className={`${tvThClass} w-[12%]`}>Surgeon</th>
                  <th className={`${tvThClass} w-[10%]`}>Anesth</th>
                  <th className={`${tvThClass} w-[8%]`}>Type</th>
                  <th className={`${tvThClass} w-[10%]`}>Team</th>
                </>
              ) : (
                <>
                  <th className={`${normThClass} w-16 bg-status-cancel`}>ยกเลิก<br/>{displayCases.filter(c=>c.status==='ยกเลิก').length}</th>
                  <th className={`${normThClass} w-16 bg-status-postpone`}>เลื่อน<br/>{displayCases.filter(c=>c.status==='เลื่อนวัน').length}</th>
                  <th className={`${normThClass} w-16 bg-status-confirm`}>ยืนยัน<br/>{displayCases.filter(c=>c.status==='ยืนยัน').length}</th>
                  <th className={`${normThClass}`}>คิว</th>
                  <th className={`${normThClass}`}>เวลา</th>
                  <th className={`${normThClass} text-blue-800`}>ห้อง</th>
                  <th className={`${normThClass} min-w-[200px]`}>ชื่อ-สกุล</th>
                  <th className={`${normThClass}`}>อายุ</th>
                  <th className={`${normThClass}`}>HN</th>
                  <th className={`${normThClass} min-w-[200px]`}>Operation</th>
                  <th className={`${normThClass} min-w-[150px]`}>Surgeon</th>
                  <th className={`${normThClass} min-w-[150px]`}>เครื่องมือพิเศษ</th>
                  <th className={`${normThClass}`}>Type Anesth</th>
                  <th className={`${normThClass}`}>Anesthesiologist</th>
                  <th className={`${normThClass}`}>Date Book</th>
                  <th className={`${normThClass}`}>เวลารับ Set</th>
                  <th className={`${normThClass}`}>ผู้จอง</th>
                  <th className={`${normThClass}`}>ผู้รับจอง</th>
                  <th className={`${normThClass} min-w-[200px]`}>หมายเหตุ</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {displayCases.map((c, index) => (
              <tr key={c._id || index} style={isTVMode ? { height: '4.76%' } : {}} className={`border-b border-gray-300 cursor-pointer ${!isTVMode && 'h-10'} ${c.status === 'ยกเลิก' ? 'bg-red-50 opacity-50' : c.status === 'เลื่อนวัน' ? 'bg-yellow-50 opacity-50' : 'hover:bg-[#fdfaf2]'}`} onClick={() => handleOpenModal(c)}>
                {isTVMode ? (
                  <>
                    <td className="border border-gray-300 font-black text-blue-700 text-sm">{c.room || '1'}</td>
                    <td className="border border-gray-300 font-black text-[#b88bc9] text-sm">{c.time}</td>
                    <td className="border border-gray-300 text-left px-3 font-bold text-[#4a2b38] text-sm truncate max-w-[180px]">{c.name}</td>
                    <td className="border border-gray-300 font-mono text-sm">{c.hn}</td>
                    <td className="border border-gray-300 text-xs px-2 truncate max-w-[120px]">{c.specialEquipment}</td>
                    <td className="border border-gray-300 text-left text-xs px-2 truncate max-w-[150px]">{c.operation}</td>
                    <td className="border border-gray-300 text-xs px-2 truncate max-w-[120px]">{c.surgeon}</td>
                    <td className="border border-gray-300 text-xs px-2">{c.anesthesiologist}</td>
                    <td className="border border-gray-300 text-xs px-2">{c.typeOfAnesth}</td>
                    <td className="border border-gray-300 text-[#4a2b38] text-xs px-2 truncate max-w-[100px]">{c.team}</td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 font-bold text-red-600 whitespace-nowrap">{c.status === 'ยกเลิก' ? '✓' : ''}</td>
                    <td className="border border-gray-300 font-bold text-yellow-600 whitespace-nowrap">{c.status === 'เลื่อนวัน' ? '✓' : ''}</td>
                    <td className="border border-gray-300 font-bold text-green-600 whitespace-nowrap">{c.status === 'ยืนยัน' ? '✓' : ''}</td>
                    <td className="border border-gray-300 whitespace-nowrap">{index + 1}</td>
                    <td className="border border-gray-300 font-black whitespace-nowrap px-2 text-[#b88bc9]">{c.time}</td>
                    <td className="border border-gray-300 font-black text-blue-700 whitespace-nowrap px-2">{c.room || '1'}</td>
                    <td className="border border-gray-300 text-left font-bold text-[#4a2b38] px-3 whitespace-nowrap text-lg">{c.name}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.age}</td>
                    <td className="border border-gray-300 font-mono whitespace-nowrap px-2">{c.hn}</td>
                    <td className="border border-gray-300 text-left px-3 whitespace-nowrap">{c.operation}</td>
                    <td className="border border-gray-300 px-3 whitespace-nowrap">{c.surgeon}</td>
                    <td className="border border-gray-300 px-3 whitespace-nowrap">{c.specialEquipment}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.typeOfAnesth}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.anesthesiologist}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.dateOfBooking}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.timeReceiveSet}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.booker}</td>
                    <td className="border border-gray-300 whitespace-nowrap px-2">{c.receiver}</td>
                    <td className="border border-gray-300 text-left text-gray-500 px-3 whitespace-nowrap">{c.remarks}</td>
                  </>
                )}
              </tr>
            ))}
            
            {[...Array(Math.max(0, 20 - displayCases.length))].map((_, rowIndex) => (
              <tr key={`empty-${rowIndex}`} style={isTVMode ? { height: '4.76%' } : {}} className={`border-b border-gray-300 bg-white ${!isTVMode && 'h-10'}`}>
                {[...Array(isTVMode ? 10 : 19)].map((_, colIndex) => <td key={colIndex} className="border border-gray-300"></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isTVMode && activeCases.length > 0 && (
        <div className="w-full pt-3 flex justify-center gap-4 shrink-0 pb-1 px-2 z-10 overflow-hidden">
          {activeCases.map((ac, idx) => (
             <div key={idx} className="bg-white border border-gray-200 shadow-md rounded-2xl p-3 flex-1 min-w-[250px] max-w-[400px] border-l-8 border-l-[#c2e2c6]">
               <div className="flex justify-between items-center mb-1">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 bg-[#c2e2c6] rounded-full animate-pulse shadow-[0_0_6px_#c2e2c6]"></div>
                   <span className="text-sm font-black text-[#8db8b9] tracking-widest">เวลา {ac.time} น.</span>
                 </div>
                 <div className="bg-blue-100 text-blue-800 text-[11px] font-black px-2 py-0.5 rounded-md border border-blue-200">
                   ห้อง {ac.room || '1'}
                 </div>
               </div>
               <div className="text-xl font-black text-[#4a2b38] truncate mb-2">คุณ {ac.name}</div>
               <div className="flex justify-between items-center border-t border-gray-100 pt-1.5">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Surgeon</span>
                 <span className="text-xs font-bold text-gray-800 truncate max-w-[180px] text-right">{ac.surgeon || '-'}</span>
               </div>
               {ac.team && (
                 <div className="flex justify-between items-center mt-0.5">
                   <span className="text-[10px] font-bold text-gray-400 uppercase">Team</span>
                   <span className="text-xs font-bold text-gray-700 truncate max-w-[180px] text-right">{ac.team}</span>
                 </div>
               )}
               <div className="flex justify-between items-center mt-0.5">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Op</span>
                 <span className="text-xs font-bold text-gray-800 truncate max-w-[180px] text-right">{ac.operation || '-'}</span>
               </div>
             </div>
          ))}
        </div>
      )}

      {!isTVMode && (
        <>
          <a href="?tv=true" target="_blank" rel="noopener noreferrer" className="fixed bottom-10 left-10 bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_10px_20px_rgba(212,180,221,0.6)] transition-all cursor-pointer flex items-center gap-3 hover:scale-105 z-50 border-2 border-white text-lg">
            🖥️ โชว์ตาราง
          </a>

          <button type="button" onClick={() => handleOpenModal(null)} className="fixed bottom-10 right-10 w-16 h-16 bg-or-btn text-white rounded-full text-4xl shadow-[0_10px_20px_rgba(141,184,185,0.6)] flex items-center justify-center hover:bg-teal-600 transition z-50 cursor-pointer hover:scale-110 border-2 border-white">
            +
          </button>
        </>
      )}

      <div className={`fixed bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 font-medium z-40 opacity-70 tracking-widest`}>
        Developed by Pxngya
      </div>

      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative max-h-[85vh] flex flex-col">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="text-2xl font-bold text-[#4a2b38]">⚙️ จัดการสิทธิ์ผู้ใช้งาน (Admin)</h2>
               <button onClick={() => {
                 setIsAdminModalOpen(false);
                 setEmpSearchQuery(''); 
               }} className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors">✕</button>
             </div>
             
             {/* 👇 ลบคำว่า disabled ออกเกลี้ยงแล้วครับ พิมพ์แก้รหัสได้แน่นอน 👇 */}
             <form onSubmit={handleAddOrEditEmployee} className="flex flex-wrap gap-2 md:gap-3 mb-6 bg-[#fdfbf2] p-4 rounded-xl border border-gray-200 items-center">
               <input type="text" value={newEmpId} onChange={(e)=>setNewEmpId(e.target.value)} placeholder="รหัสพนักงาน" className="w-[160px] text-center font-mono font-bold border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] bg-white" required />
               
               <input type="text" value={newEmpName} onChange={(e)=>setNewEmpName(e.target.value)} placeholder="ชื่อ-สกุล พนักงาน" className="flex-1 min-w-[140px] border p-2 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd]" required />
               
               <select value={newEmpRole} onChange={(e)=>setNewEmpRole(e.target.value)} className="border p-2 rounded-lg outline-none cursor-pointer bg-white w-[110px]">
                 <option value="user">พนักงาน</option>
                 <option value="admin">แอดมิน</option>
               </select>
               
               <div className="flex gap-2 shrink-0">
                 {isEditingEmp ? (
                   <>
                     <button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">บันทึก</button>
                     <button type="button" onClick={handleCancelEditEmp} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors">ยกเลิก</button>
                   </>
                 ) : (
                   <button type="submit" className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-2 rounded-lg font-bold shadow-md transition-colors">เพิ่ม</button>
                 )}
               </div>
             </form>

             <div className="mb-4">
               <input 
                 type="text" 
                 placeholder="🔍 ค้นหารหัส หรือ ชื่อพนักงาน..." 
                 value={empSearchQuery}
                 onChange={(e) => setEmpSearchQuery(e.target.value)}
                 className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-[#d4b4dd] bg-white shadow-sm"
               />
             </div>

             <div className="overflow-y-auto border border-gray-200 rounded-xl shadow-inner bg-white flex-1">
               <table className="w-full text-sm text-center border-collapse">
                  <thead className="bg-[#f3eff4] sticky top-0 shadow-sm z-10">
                     <tr className="text-[#4a2b38]">
                       <th className="p-3 border-b border-gray-300 w-[120px]">รหัส (ID)</th>
                       <th className="p-3 border-b border-gray-300 text-left">ชื่อ-สกุล</th>
                       <th className="p-3 border-b border-gray-300">สิทธิ์ (Role)</th>
                       <th className="p-3 border-b border-gray-300 w-[140px]">จัดการ</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                        <tr 
                          key={emp._id} 
                          className={`border-b border-gray-100 transition-colors ${editingEmpDbId === emp._id ? 'bg-[#f4ebf7] border-l-4 border-l-[#b88bc9]' : 'hover:bg-[#fdfbf2]'}`}
                        >
                          <td className={`p-3 font-bold font-mono ${editingEmpDbId === emp._id ? 'text-purple-700' : ''}`}>{emp.empId}</td>
                          <td className="p-3 text-left">{emp.name || 'ไม่ระบุ'}</td>
                          <td className="p-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${emp.role === 'admin' ? 'bg-[#d4b4dd] text-[#4a2b38]' : 'bg-gray-100 text-gray-600'}`}>{emp.role}</span>
                          </td>
                          <td className="p-3 flex justify-center gap-2">
                            <button onClick={() => handleEditEmpClick(emp)} className="text-blue-500 hover:text-blue-700 font-bold px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 shadow-sm">แก้ไข</button>
                            
                            {emp.empId !== currentUser.empId && (
                              <button onClick={() => handleDeleteEmployee(emp._id)} className="text-red-500 hover:text-red-700 font-bold px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 shadow-sm">ลบ</button>
                            )}
                          </td>
                        </tr>
                     )) : (
                        <tr>
                          <td colSpan={4} className="p-8 text-gray-400 font-bold">ไม่พบพนักงานที่ค้นหา</td>
                        </tr>
                     )}
                  </tbody>
               </table>
             </div>
          </div>
        </div>
      )}

      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl p-6 relative max-h-[85vh] flex flex-col">
             <div className="flex justify-between items-center mb-6 border-b pb-4">
               <h2 className="text-2xl font-bold text-[#4a2b38]">🔍 ผลการค้นหา: "{globalSearchQuery}"</h2>
               <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-red-500 font-black text-2xl transition-colors">✕</button>
             </div>
             <div className="overflow-y-auto border border-gray-200 rounded-xl shadow-inner bg-gray-50 flex-1">
               <table className="w-full text-sm text-center border-collapse">
                  <thead className="bg-[#b6d7d8] sticky top-0 shadow-sm z-10">
                     <tr className="text-[#4a2b38]">
                       <th className="p-3 border border-gray-300">วันที่ลงคิว</th>
                       <th className="p-3 border border-gray-300">เวลา</th>
                       <th className="p-3 border border-gray-300 text-blue-800">ห้อง</th>
                       <th className="p-3 border border-gray-300">HN</th>
                       <th className="p-3 border border-gray-300 text-left">ชื่อ-สกุล</th>
                       <th className="p-3 border border-gray-300 text-left">Operation</th>
                       <th className="p-3 border border-gray-300">สถานะ</th>
                     </tr>
                  </thead>
                  <tbody>
                     {searchResults.length > 0 ? searchResults.map((c, i) => (
                        <tr key={i} className={`border-b border-gray-200 hover:bg-[#fdfbf2] cursor-pointer transition-colors ${c.status === 'ยกเลิก' ? 'bg-red-50' : c.status === 'เลื่อนวัน' ? 'bg-yellow-50' : 'bg-white'}`} onClick={() => { setIsSearchModalOpen(false); handleOpenModal(c); }}>
                          <td className="p-3 border border-gray-200 font-bold text-gray-700">{c.date} {c.monthYear}</td>
                          <td className="p-3 border border-gray-200 font-black text-[#b88bc9]">{c.time}</td>
                          <td className="p-3 border border-gray-200 font-black text-blue-700">{c.room || '1'}</td>
                          <td className="p-3 border border-gray-200 font-mono">{c.hn}</td>
                          <td className="p-3 border border-gray-200 text-left font-bold text-[#4a2b38]">{c.name}</td>
                          <td className="p-3 border border-gray-200 text-left text-gray-600 truncate max-w-[200px]">{c.operation}</td>
                          <td className={`p-3 border border-gray-200 font-bold text-base ${c.status === 'ยืนยัน' ? 'text-green-600' : c.status === 'เลื่อนวัน' ? 'text-yellow-600' : 'text-red-600'}`}>• {c.status}</td>
                        </tr>
                     )) : (
                        <tr><td colSpan={7} className="p-12 text-gray-400 text-xl font-bold bg-white">ไม่พบประวัติผู้ป่วยชื่อนี้ในระบบ 🏥</td></tr>
                     )}
                  </tbody>
               </table>
             </div>
             <div className="mt-4 text-center text-sm text-gray-500 font-medium">* คลิกที่รายชื่อเพื่อเปิดดู หรือแก้ไขรายละเอียดทั้งหมด</div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] backdrop-blur-sm">
          <div className="bg-[#fdfbf2] border border-gray-200 rounded-2xl shadow-2xl w-full max-w-5xl p-8 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-black text-center mb-8 bg-[#f3eff4] py-3 rounded-xl shadow-sm text-[#4a2b38] border border-gray-200 sticky top-[-32px] z-10">
              {editingCase ? '📝 แก้ไขข้อมูลคนไข้' : '➕ เพิ่มข้อมูลคนไข้ใหม่'}
            </h2>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-x-10 gap-y-5">
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">วันที่ผ่าตัด</label><input type="date" name="surgeryDate" value={formData.surgeryDate} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" required /></div>
               
               <div className="flex items-center gap-4">
                 <label className="w-32 text-right font-bold text-gray-700">เวลา / ห้อง</label>
                 <div className="flex flex-1 gap-2">
                   <input type="time" name="time" value={formData.time} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono font-bold" required />
                   <select name="room" value={formData.room || '1'} onChange={handleChange} className="border border-gray-300 p-2 w-28 bg-blue-50 text-blue-800 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none font-bold cursor-pointer">
                     {[1,2,3,4,5,6].map(r => <option key={r} value={r}>ห้อง {r}</option>)}
                   </select>
                 </div>
               </div>

               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">HN</label><input type="text" name="hn" value={formData.hn} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-mono" required /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">ชื่อ-สกุล</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none font-bold text-[#4a2b38]" required /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">อายุ</label><input type="text" name="age" value={formData.age} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">Surgeon</label><input type="text" name="surgeon" value={formData.surgeon} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="col-span-2 flex items-start gap-4"><label className="w-32 text-right font-bold text-gray-700 mt-2">ทีมแพทย์ (Team)</label><input type="text" name="team" value={formData.team} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" placeholder="ระบุรายชื่อทีมแพทย์ผู้ช่วย" /></div>
               <div className="col-span-2 flex items-start gap-4"><label className="w-32 text-right font-bold text-gray-700 mt-2">Operation</label><textarea name="operation" value={formData.operation} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-20 resize-none"></textarea></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">เครื่องมือพิเศษ</label><input type="text" name="specialEquipment" value={formData.specialEquipment} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700 text-sm leading-tight">Type of Anesth</label><input type="text" name="typeOfAnesth" value={formData.typeOfAnesth} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700 text-sm leading-tight">Anesthesiologist</label><input type="text" name="anesthesiologist" value={formData.anesthesiologist} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700 text-sm leading-tight">Date of Booking</label><input type="date" name="dateOfBooking" value={formData.dateOfBooking} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">เวลารับ Set</label><input type="time" name="timeReceiveSet" value={formData.timeReceiveSet} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none text-gray-600" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">ผู้จอง</label><input type="text" name="booker" value={formData.booker} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="flex items-center gap-4"><label className="w-32 text-right font-bold text-gray-700">ผู้รับจอง</label><input type="text" name="receiver" value={formData.receiver} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none" /></div>
               <div className="col-span-2 flex items-start gap-4"><label className="w-32 text-right font-bold text-gray-700 mt-2">หมายเหตุ</label><textarea name="remarks" value={formData.remarks} onChange={handleChange} className="border border-gray-300 p-2 flex-1 bg-white rounded-lg focus:ring-2 focus:ring-[#d4b4dd] outline-none h-16 resize-none"></textarea></div>

               {editingCase && (
                  <div className="col-span-2 flex justify-center gap-10 mt-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <label className="flex items-center gap-2 cursor-pointer font-black text-green-600 text-xl"><input type="radio" name="status" value="ยืนยัน" checked={formData.status === 'ยืนยัน'} onChange={handleChange} className="accent-green-600 w-6 h-6" /> ยืนยันผ่าตัด</label>
                    <label className="flex items-center gap-2 cursor-pointer font-black text-yellow-500 text-xl"><input type="radio" name="status" value="เลื่อนวัน" checked={formData.status === 'เลื่อนวัน'} onChange={handleChange} className="accent-yellow-500 w-6 h-6" /> เลื่อนวัน</label>
                    <label className="flex items-center gap-2 cursor-pointer font-black text-red-500 text-xl"><input type="radio" name="status" value="ยกเลิก" checked={formData.status === 'ยกเลิก'} onChange={handleChange} className="accent-red-500 w-6 h-6" /> ยกเลิกเคส</label>
                  </div>
               )}

               <div className="col-span-2 flex justify-center mt-8 gap-4">
                 <button type="submit" className="bg-[#d4b4dd] text-[#4a2b38] px-12 py-3 rounded-full text-xl hover:bg-[#c29bce] font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent">💾 บันทึกข้อมูล</button>
                 
                 {editingCase && currentUser?.role === 'admin' && (
                   <button type="button" onClick={() => handleDeleteCase(editingCase._id)} className="bg-red-500 text-white px-8 py-3 rounded-full text-xl hover:bg-red-600 font-black transition-transform shadow-lg hover:scale-105 border-2 border-transparent">
                     🗑️ ลบข้อมูล
                   </button>
                 )}
                 
                 <button type="button" onClick={() => setIsModalOpen(false)} className="ml-4 text-gray-400 hover:text-gray-700 font-bold cursor-pointer text-lg underline underline-offset-4 decoration-2 transition-colors">ปิด/ยกเลิก</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}