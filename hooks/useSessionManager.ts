import { useEffect, useRef } from 'react';

export const useSessionManager = (
  currentUser: any,
  handleLogout: () => void,
  isTVMode: boolean
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // ถ้ายังไม่ได้ล็อกอิน ไม่ต้องทำอะไร
    if (!currentUser) return;

    // ==========================================
    // 1. ระบบเช็ค 1 ไอดี 1 เครื่อง (Background Polling)
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
          alert('ไอดีนี้ถูกใช้งานที่เครื่องอื่น กรุณาล็อกอินด้วยไอดีใหม่');
          handleLogout(); // เตะออกไปหน้าล็อกอินทันที
        }
      } catch (error) {
        console.error('Session check error', error);
      }
    };

    // แอบส่งคำถามไปเช็คกับหลังบ้านทุกๆ 15 วินาที
    const intervalId = setInterval(checkSession, 15000); 


    // ==========================================
    // 2. ระบบ Idle Timeout 30 นาที (ถ้าไม่ขยับเมาส์)
    // ==========================================
    const resetTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // จะจับเวลาเฉพาะ "โหมดปกติ" เท่านั้น (ทีวีรอดตัว ไม่โดนเตะ)
      if (!isTVMode) {
        timeoutRef.current = setTimeout(() => {
          alert('เซสชันหมดอายุ กรุณาล็อกอินใหม่');
          handleLogout();
        }, 30 * 60 * 1000); // 30 นาที (หน่วยเป็นมิลลิวินาที)
      }
    };

    // ดักจับการขยับเมาส์, กดคีย์บอร์ด, เลื่อนจอ, ทัชหน้าจอ
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimeout();

    if (!isTVMode) {
      // แปะเซนเซอร์ดักจับไว้ที่หน้าจอ
      events.forEach(event => window.addEventListener(event, handleActivity));
      resetTimeout(); // เริ่มจับเวลาครั้งแรก
    }

    // ฟังก์ชันทำความสะอาด (Cleanup) เมื่อผู้ใช้ปิดหน้าเว็บ
    return () => {
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (!isTVMode) {
        events.forEach(event => window.removeEventListener(event, handleActivity));
      }
    };
  }, [currentUser, handleLogout, isTVMode]);
};