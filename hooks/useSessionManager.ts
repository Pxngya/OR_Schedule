import { useEffect } from 'react';

export const useSessionManager = (
  currentUser: any,
  handleLogout: () => void,
  isTVMode: boolean
) => {
  useEffect(() => {
    // ถ้ายังไม่ได้ล็อกอิน ไม่ต้องทำอะไร
    if (!currentUser) return;

    // ==========================================
    // 🚀 ระบบเช็ค 1 ไอดี 1 เครื่อง (ยังเก็บไว้ ป้องกันคนล็อกอินซ้อน)
    // ==========================================
    const checkSession = async () => {
      try {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'check_session',
            empId: currentUser.empId,
            sessionToken: currentUser.sessionToken
          })
        });
        
        const data = await res.json();
        
        // ถ้า API ตอบกลับมาว่าเซสชันไม่ถูกต้อง (มีคนล็อกอินซ้อนเครื่องอื่น)
        if (data.success && data.valid === false) {
          alert('🚨 ไอดีนี้ถูกใช้งานที่เครื่องอื่น กรุณาล็อกอินด้วยไอดีใหม่');
          handleLogout(); // เตะออกไปหน้าล็อกอิน
        }
      } catch (error) {
        console.error('Session check error', error);
      }
    };

    // แอบส่งคำถามไปเช็คกับหลังบ้านทุกๆ 15 วินาที
    const intervalId = setInterval(checkSession, 15000); 

    // ❌ ลบระบบ Idle Timeout (30 นาทีเตะออก) ทิ้งไปหมดแล้วครับ ❌

    // ฟังก์ชันทำความสะอาด (Cleanup)
    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser, handleLogout]); 
};