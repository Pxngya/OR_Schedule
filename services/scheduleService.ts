import * as XLSX from 'xlsx';
import { apiFetch } from "@/lib/api";
import { formatHN } from '@/lib/utils';

// ✅ 1. LINE notify
export const sendLineNotify = async (message: string) => {
  try {
    const endpoint = '/api/webhook';

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

  } catch (error) {
    console.error("Line Notify Error:", error);
  }
};

// ✅ 2. Export Excel
export const exportToExcel = async (currentMonthYear: string) => {
  try {
    const data = await apiFetch('/api/cases');

    if (data.success) {
      const monthCases = data.data.filter(
        (c: any) => c.monthYear === currentMonthYear && !c.isNurseLog
      );

      if (monthCases.length === 0) {
        alert(`ไม่มีข้อมูลในเดือน ${currentMonthYear} สำหรับ Export ครับ`);
        return;
      }

      monthCases.sort((a: any, b: any) => {
        if (a.date !== b.date) return (a.date || 0) - (b.date || 0);
        const timeA = a.time || '23:59';
        const timeB = b.time || '23:59';
        if (timeA !== timeB) return timeA.localeCompare(timeB);
        return String(a.room || '1').localeCompare(String(b.room || '1'));
      });

      const exportData = monthCases.map((c: any, index: number) => ({
        'ลำดับ': index + 1,
        'วันที่': `${c.date} ${c.monthYear}`,
        'เวลา': c.time,
        'ห้องผ่าตัด': c.room || '1',
        'สถานะคิว': c.status,
        'สถานะผู้ป่วย': c.patientStatus,
        'HN': formatHN(c.hn),
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
      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, ws, `ตารางผ่าตัด ${currentMonthYear}`);
      XLSX.writeFile(wb, `Schedule_${currentMonthYear}.xlsx`);
    }
  } catch (error) {
    alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel');
  }
};

// ✅ 3. fetch employees
export const fetchEmployees = async (setEmployees: (data: any[]) => void) => {
  const data = await apiFetch('/api/employees');
  if (data.success) setEmployees(data.data);
};